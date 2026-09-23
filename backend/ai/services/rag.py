from pathlib import Path
from typing import Any
import chromadb

# ==============================================================================
# CONFIGURATION & CONSTANTS
# ==============================================================================

# Chemins absolus resolus depuis l'arborescence du module
BASE_DIR: Path = Path(__file__).resolve().parent.parent
CHROMA_DB_DIR: Path = BASE_DIR / "data" / "chroma"

COLLECTION_NAME: str = "piscine_knowledge"

# 4 chunks permettent d'avoir la regle de base, son contexte et les exceptions sans noyer le LLM
DEFAULT_TOP_K: int = 4


# ==============================================================================
# DATABASE CONNECTION
# ==============================================================================

# Recupere ou initialise le client persistant ChromaDB sans telemetrie
def get_chroma_collection(
    chroma_path: Path = CHROMA_DB_DIR,
    collection_name: str = COLLECTION_NAME,
) -> chromadb.Collection:
    client = chromadb.PersistentClient(path=str(chroma_path))
    return client.get_or_create_collection(name=collection_name)


# ==============================================================================
# SEARCH & RETRIEVAL LOGIC
# ==============================================================================

# Interroge la base vectorielle locale pour recuperer les extraits les plus pertinents
def query_knowledge_base(
    query_text: str,
    top_k: int = DEFAULT_TOP_K,
    category_filter: str | None = None,
    chroma_path: Path = CHROMA_DB_DIR,
) -> list[dict[str, Any]]:
    collection: chromadb.Collection = get_chroma_collection(chroma_path=chroma_path)

    # Filtrage optionnel par dossier source (pedagogy, rules, guidelines)
    where_clause: dict[str, str] | None = {"category": category_filter} if category_filter else None

    raw_results: dict[str, Any] = collection.query(
        query_texts=[query_text],
        n_results=top_k,
        where=where_clause,
    )

    retrieved_documents: list[dict[str, Any]] = []

    # Securite si la base est vide ou qu'aucun document ne remonte
    if not raw_results or not raw_results.get("documents") or not raw_results["documents"][0]:
        return retrieved_documents

    documents: list[str] = raw_results["documents"][0]
    metadatas: list[dict[str, Any]] = raw_results["metadatas"][0] if raw_results.get("metadatas") else []
    distances: list[float] = raw_results["distances"][0] if raw_results.get("distances") else []

    # Mise en forme propre des resultats pour le constructeur de prompt
    for index, content in enumerate(documents):
        retrieved_documents.append({
            "content": content,
            "metadata": metadatas[index] if index < len(metadatas) else {},
            "distance": distances[index] if index < len(distances) else None,
        })

    return retrieved_documents


# Concatene les chunks trouves en un seul bloc de texte pour ingestion dans le prompt
def format_context_for_prompt(chunks: list[dict[str, Any]]) -> str:
    if not chunks:
        return "No relevant documentation found."

    formatted_sections: list[str] = []
    for index, chunk in enumerate(chunks, start=1):
        source: str = chunk.get("metadata", {}).get("source", "unknown")
        section: str = f"--- Context Document {index} (Source: {source}) ---\n{chunk.get('content', '')}"
        formatted_sections.append(section)

    return "\n\n".join(formatted_sections)


# ==============================================================================
# STANDALONE EXECUTION & TEST
# ==============================================================================

# Script de test pour valider la pertinence sans lancer de requete HTTP
if __name__ == "__main__":
    test_query: str = "L'eleve refuse de justifier son algorithme"
    print(f"[*] Testing semantic query: '{test_query}'\n")

    matches: list[dict[str, Any]] = query_knowledge_base(query_text=test_query, top_k=DEFAULT_TOP_K)

    print(f"[+] Found {len(matches)} relevant chunks:\n")
    for index, match in enumerate(matches, start=1):
        print(f"Match #{index} | Distance: {match['distance']:.4f} | Source: {match['metadata'].get('source')}")
        print(f"Content snippet:\n{match['content'][:150]}...\n")

    print("\n[*] Formatted payload for the LLM:\n")
    print(format_context_for_prompt(matches))