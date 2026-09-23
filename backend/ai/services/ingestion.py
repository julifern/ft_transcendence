from pathlib import Path
from typing import Any
import re
import chromadb

# ==============================================================================
# CONFIGURATION & CONSTANTS
# ==============================================================================

# Chemins relatifs calcules depuis l'emplacement de ce script
BASE_DIR: Path = Path(__file__).resolve().parent.parent
KNOWLEDGE_DIR: Path = BASE_DIR / "knowledge"
CHROMA_DB_DIR: Path = BASE_DIR / "data" / "chroma"

COLLECTION_NAME: str = "piscine_knowledge"

# Limite haute par chunk pour eviter les paves indigestes
MAX_CHUNK_SIZE: int = 1200


# ==============================================================================
# TEXT PROCESSING & CHUNKING
# ==============================================================================

# Nettoyage classique des espaces et sauts de ligne excessifs
def clean_text(text: str) -> str:
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


# Decoupe intelligente basee sur les sections markdown (#, ##, ###)
def chunk_markdown(content: str, max_size: int = MAX_CHUNK_SIZE) -> list[str]:
    # On separe le document a chaque niveau de titre
    sections: list[str] = re.split(r"(?=(?:\n|^)#{1,3}\s+)", content)
    chunks: list[str] = []
    parent_title: str = ""

    for section in sections:
        section = clean_text(section)
        if not section:
            continue

        # Si la section commence par un grand titre H1, on le garde en memoire pour le contexte
        h1_match = re.match(r"^#\s+(.+)$", section, re.MULTILINE)
        if h1_match:
            parent_title = h1_match.group(1).strip()

        # Si le bloc depasse la taille limite, on le scinde par paragraphe
        if len(section) > max_size:
            paragraphs: list[str] = [p.strip() for p in section.split("\n\n") if p.strip()]
            buffer: str = ""

            for paragraph in paragraphs:
                candidate: str = f"{buffer}\n\n{paragraph}".strip() if buffer else paragraph
                if len(candidate) > max_size and buffer:
                    # On injecte le titre parent si le paragraphe s'en retrouve isole
                    prefix: str = f"[{parent_title}]\n" if parent_title and not buffer.startswith("#") else ""
                    chunks.append(f"{prefix}{buffer}")
                    buffer = paragraph
                else:
                    buffer = candidate

            if buffer:
                prefix = f"[{parent_title}]\n" if parent_title and not buffer.startswith("#") else ""
                chunks.append(f"{prefix}{buffer}")
        else:
            chunks.append(section)

    return chunks


# ==============================================================================
# DOCUMENT LOADER
# ==============================================================================

# Parcourt tous les markdown du dossier knowledge
def load_documents(knowledge_path: Path) -> list[dict[str, Any]]:
    documents: list[dict[str, Any]] = []

    if not knowledge_path.exists():
        print(f"[!] Directory not found: {knowledge_path}")
        return documents

    for file_path in knowledge_path.rglob("*.md"):
        # Le nom du dossier parent sert automatiquement de categorie (pedagogy, rules, guidelines)
        category: str = file_path.parent.name
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content: str = f.read()

            if content.strip():
                documents.append({
                    "content": content,
                    "filename": file_path.name,
                    "category": category,
                    "source": str(file_path.relative_to(knowledge_path)),
                })
        except Exception as error:
            print(f"[!] Failed to read {file_path.name}: {error}")

    return documents


# ==============================================================================
# VECTOR DATABASE INGESTION PIPELINE
# ==============================================================================

# Point d'entree : parse, decoupe et insere tous les documents dans ChromaDB
def run_ingestion(
    knowledge_path: Path = KNOWLEDGE_DIR,
    chroma_path: Path = CHROMA_DB_DIR,
) -> int:
    print(f"[*] Starting ingestion from: {knowledge_path}")
    documents: list[dict[str, Any]] = load_documents(knowledge_path)

    if not documents:
        print("[!] No .md documents found to vectorize.")
        return 0

    # Client persistant pour ecrire directement sur le disque local
    client = chromadb.PersistentClient(path=str(chroma_path))
    collection = client.get_or_create_collection(name=COLLECTION_NAME)

    ids: list[str] = []
    documents_text: list[str] = []
    metadatas: list[dict[str, Any]] = []

    total_chunks: int = 0

    for doc in documents:
        chunks: list[str] = chunk_markdown(doc["content"])
        for index, chunk in enumerate(chunks):
            # ID base sur le nom du fichier et l'index pour eviter les doublons
            chunk_id: str = f"{doc['filename']}_{index}"

            ids.append(chunk_id)
            documents_text.append(chunk)
            metadatas.append({
                "source": doc["source"],
                "filename": doc["filename"],
                "category": doc["category"],
                "chunk_index": index,
            })
            total_chunks += 1

    # Upsert pour inserer les nouveaux fragments ou mettre a jour ceux modifies
    if documents_text:
        collection.upsert(
            ids=ids,
            documents=documents_text,
            metadatas=metadatas,
        )
        print(f"[+] Ingestion complete: {len(documents)} documents split into {total_chunks} chunks.")

    return total_chunks


# ==============================================================================
# STANDALONE EXECUTION
# ==============================================================================

if __name__ == "__main__":
    run_ingestion()