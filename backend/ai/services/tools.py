from pathlib import Path
from typing import Any
import chromadb
from django.apps import apps

# ==============================================================================
# CONFIGURATION & CONSTANTS
# ==============================================================================

BASE_DIR: Path = Path(__file__).resolve().parent.parent
CHROMA_DB_DIR: Path = BASE_DIR / "data" / "chroma"
COLLECTION_NAME: str = "piscine_knowledge"


# ==============================================================================
# MODEL HELPERS
# ==============================================================================

# Recupere les modeles Django de auth42 de maniere dynamique
def get_auth42_models():
    profil_model = apps.get_model("auth42", "Profil")
    project_model = apps.get_model("auth42", "Project")
    return profil_model, project_model


# ==============================================================================
# RETRIEVAL TOOLS
# ==============================================================================

# Recherche des extraits documentaires dans la base vectorielle ChromaDB
def search_knowledge_base(query: str, n_results: int = 3) -> dict[str, Any]:
    if not CHROMA_DB_DIR.exists():
        return {
            "error": "ChromaDB storage not initialized.",
            "context": "",
            "sources": [],
        }

    client = chromadb.PersistentClient(path=str(CHROMA_DB_DIR))
    collection = client.get_or_create_collection(name=COLLECTION_NAME)

    results = collection.query(
        query_texts=[query],
        n_results=n_results,
    )

    documents: list[str] = results.get("documents", [[]])[0]
    metadatas: list[dict[str, Any]] = results.get("metadatas", [[]])[0]
    sources: list[str] = list({meta.get("source", "unknown") for meta in metadatas if meta})

    return {
        "context": "\n\n---\n\n".join(documents),
        "sources": sources,
    }


# Liste les etudiants sur un projet donne avec filtre de validation optionnel
def get_students_by_project(project_slug: str, valid: bool | None = None) -> dict[str, Any]:
    _, project_model = get_auth42_models()
    slug_normalized: str = project_slug.strip().lower()

    queryset = project_model.objects.filter(slug__icontains=slug_normalized).select_related("profil")
    if valid is not None:
        queryset = queryset.filter(valid=valid)

    total: int = queryset.count()
    students: list[dict[str, Any]] = [
        {
            "login": item.profil.profil_login,
            "valid": item.valid,
            "note": item.note,
            "status": item.status,
        }
        for item in queryset[:50]
    ]

    return {
        "project": slug_normalized,
        "count": total,
        "students": students,
    }


# Renvoie le bilan des reussites et echecs pour un examen
def get_exam_stats(exam_slug: str) -> dict[str, Any]:
    _, project_model = get_auth42_models()
    slug_normalized: str = exam_slug.strip().lower()

    queryset = project_model.objects.filter(slug__icontains=slug_normalized).select_related("profil")
    total: int = queryset.count()

    if total == 0:
        return {"error": f"No records found for exam '{slug_normalized}'."}

    passed_qs = queryset.filter(valid=True)
    failed_qs = queryset.filter(valid=False)

    return {
        "exam": slug_normalized,
        "total_participants": total,
        "passed_count": passed_qs.count(),
        "failed_count": failed_qs.count(),
        "failed_logins": [item.profil.profil_login for item in failed_qs[:30]],
    }


# Formate le payload d'action pour suggerer l'ajout d'un commentaire
def format_feedback_action(suggested_text: str, target_login: str | None = None) -> dict[str, Any]:
    return {
        "action_type": "add_comment",
        "target_login": target_login,
        "suggested_text": suggested_text.strip(),
    }


# ==============================================================================
# TOOL REGISTRY & DEFINITIONS
# ==============================================================================

TOOLS_REGISTRY = {
    "search_knowledge_base": search_knowledge_base,
    "get_students_by_project": get_students_by_project,
    "get_exam_stats": get_exam_stats,
    "format_feedback_action": format_feedback_action,
}

TOOLS_SPEC = """
You have access to the following tools:

1. search_knowledge_base(query: str)
   Use for questions about 42 school rules, pedagogy, C norm, schedules, peer-evaluations, or exams guidelines.

2. get_students_by_project(project_slug: str, valid: bool or null)
   Use to check students working on or having completed a specific project (e.g. "c01", "c02", "rush00").

3. get_exam_stats(exam_slug: str)
   Use to retrieve passing and failing statistics for an exam (e.g. "exam00", "exam01", "exam02").

4. summarize_feedback(text: str, target_login: str or null)
   Use when the tutor wants to summarize, rephrase, or clean up an evaluation note to add it as a student comment.

5. direct_answer()
   Use for simple greetings or general conversational queries requiring no database or document context.
"""