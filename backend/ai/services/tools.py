from pathlib import Path
import re
from typing import Any
import chromadb
from django.apps import apps
from django.db.models import Q

# ==============================================================================
# CONFIGURATION & CONSTANTS
# ==============================================================================

BASE_DIR: Path = Path(__file__).resolve().parent.parent
CHROMA_DB_DIR: Path = BASE_DIR / "data" / "chroma"
COLLECTION_NAME: str = "piscine_knowledge"


# ==============================================================================
# MODEL & QUERY HELPERS
# ==============================================================================

# Recupere les modeles Django de auth42 de maniere dynamique
def get_auth42_models():
    profil_model = apps.get_model("auth42", "Profil")
    project_model = apps.get_model("auth42", "Project")
    return profil_model, project_model


# Construit une requete tolerante aux differentes variantes de slug 42
def build_slug_query(raw_slug: str) -> Q:
    cleaned: str = raw_slug.strip().lower()
    variants: set[str] = {cleaned}

    # Capture les formats comme c02, exam01, rush00 et genere les variantes avec tirets
    match = re.search(r"(shell|c|exam|rush)[-_ ]*0*(\d+)", cleaned)
    if match:
        prefix, number = match.groups()
        num_int: int = int(number)
        variants.add(f"{prefix}{num_int:02d}")
        variants.add(f"{prefix}-{num_int:02d}")
        variants.add(f"{prefix}-{num_int}")
        variants.add(f"piscine-{prefix}-{num_int:02d}")
        variants.add(f"c-piscine-{prefix}-{num_int:02d}")

    query = Q()
    for variant in variants:
        query |= Q(slug__icontains=variant) | Q(name__icontains=variant)
    return query


# ==============================================================================
# RETRIEVAL TOOLS (CHROMADB)
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


# ==============================================================================
# DATABASE TOOLS (ORM POSTGRESQL)
# ==============================================================================

# Extrait le numero d'un projet C a partir de son slug
def parse_c_day_number(slug: str) -> int | None:
    slug_lower: str = slug.lower()
    if "rush" in slug_lower or "exam" in slug_lower:
        return None
    match = re.search(r"(?:piscine-c|c)[-_ ]*0*(\d+)", slug_lower)
    if match:
        return int(match.group(1))
    return None


# Identifie les etudiants avec un ecart important entre day valide et day en cours
def get_students_with_day_gap(min_gap: int = 2) -> dict[str, Any]:
    profil_model, _ = get_auth42_models()
    profils = profil_model.objects.prefetch_related("project_set").all()

    results: list[dict[str, Any]] = []

    for profil in profils:
        projects = profil.project_set.all()
        c_projects = [
            (parse_c_day_number(p.slug), p.valid)
            for p in projects
            if parse_c_day_number(p.slug) is not None
        ]

        if not c_projects:
            continue

        all_days: list[int] = [day for day, _ in c_projects]
        valid_days: list[int] = [day for day, valid in c_projects if valid]

        max_started: int = max(all_days)
        max_validated: int | None = max(valid_days) if valid_days else None

        if max_validated is None:
            gap: int = max_started
            valid_label: str = "Aucun"
        else:
            gap = max_started - max_validated
            valid_label = f"C{max_validated:02d}"

        if gap >= min_gap:
            results.append({
                "login": profil.profil_login,
                "current_day": f"C{max_started:02d}",
                "highest_validated": valid_label,
                "gap": gap,
            })

    results.sort(key=lambda item: item["gap"], reverse=True)

    return {
        "min_gap": min_gap,
        "count": len(results),
        "students": results[:30],
    }

# Liste les etudiants sur un projet donne avec filtre de validation optionnel
def get_students_by_project(project_slug: str, valid: bool | None = None) -> dict[str, Any]:
    _, project_model = get_auth42_models()
    slug_q: Q = build_slug_query(project_slug)

    queryset = project_model.objects.filter(slug_q).select_related("profil")
    if valid is not None:
        queryset = queryset.filter(valid=valid)

    total: int = queryset.count()
    if total == 0:
        return {"error": f"No project matching '{project_slug}' was found in the database."}

    matched_slugs: list[str] = list(set(queryset.values_list("slug", flat=True)[:5]))
    students: list[dict[str, Any]] = [
        {
            "login": item.profil.profil_login,
            "valid": item.valid,
            "note": item.note,
            "status": item.status,
        }
        for item in queryset[:40]
    ]

    return {
        "searched": project_slug,
        "matched_slugs": matched_slugs,
        "count": total,
        "students": students,
    }


# Renvoie le bilan detaille des reussites et echecs pour un examen donne
def get_exam_stats(exam_slug: str) -> dict[str, Any]:
    _, project_model = get_auth42_models()
    slug_q: Q = build_slug_query(exam_slug)

    queryset = project_model.objects.filter(slug_q).select_related("profil")
    total: int = queryset.count()

    if total == 0:
        return {"error": f"No exam matching '{exam_slug}' was found in the database."}

    matched_slugs: list[str] = list(set(queryset.values_list("slug", flat=True)))
    passed_qs = queryset.filter(valid=True)
    failed_qs = queryset.filter(valid=False)

    return {
        "exam": exam_slug,
        "matched_slugs": matched_slugs,
        "total_participants": total,
        "passed_count": passed_qs.count(),
        "failed_count": failed_qs.count(),
        "failed_logins": [item.profil.profil_login for item in failed_qs[:30]],
    }


# Identifie les etudiants presentant un risque pedagogique eleve ou moyen
def get_students_at_risk(risk_level: str | None = None) -> dict[str, Any]:
    profil_model, _ = get_auth42_models()
    queryset = profil_model.objects.all()

    if risk_level:
        level_normalized: str = risk_level.strip().lower()
        queryset = queryset.filter(profil_risk_level__iexact=level_normalized)
    else:
        queryset = queryset.exclude(profil_risk_level__in=["ok", ""])

    queryset = queryset.order_by("-profil_risk_score")
    total: int = queryset.count()

    students: list[dict[str, Any]] = [
        {
            "login": item.profil_login,
            "risk_level": item.profil_risk_level,
            "risk_score": item.profil_risk_score,
            "level": item.profil_lvl,
            "location": item.profil_location,
        }
        for item in queryset[:30]
    ]

    return {
        "filter": risk_level or "all_risks",
        "count": total,
        "students": students,
    }


# Liste les etudiants manquant de points de correction pour etre evalues
def get_students_low_correction_points(threshold: int = 1) -> dict[str, Any]:
    profil_model, _ = get_auth42_models()
    queryset = profil_model.objects.filter(profil_correction_point__lte=threshold).order_by("profil_correction_point")
    total: int = queryset.count()

    students: list[dict[str, Any]] = [
        {
            "login": item.profil_login,
            "correction_points": item.profil_correction_point,
            "level": item.profil_lvl,
        }
        for item in queryset[:30]
    ]

    return {
        "threshold": threshold,
        "count": total,
        "students": students,
    }


# Analyse les presences en cluster (etudiants en ligne, assiduite faible ou moyenne d'heures)
def get_presence_stats(
    online_only: bool = False,
    low_attendance: bool = False,
    max_daily_hours: float = 4.0,
) -> dict[str, Any]:
    profil_model, _ = get_auth42_models()
    queryset = profil_model.objects.all()

    if online_only:
        queryset = queryset.filter(profil_is_online=True)
        total: int = queryset.count()
        students: list[dict[str, Any]] = [
            {
                "login": item.profil_login,
                "location": item.profil_location,
                "level": item.profil_lvl,
            }
            for item in queryset[:40]
        ]
        return {
            "mode": "online_students",
            "count": total,
            "students": students,
        }

    if low_attendance:
        queryset = queryset.filter(
            profil_daily_average_hours__isnull=False,
            profil_daily_average_hours__lt=max_daily_hours,
        ).order_by("profil_daily_average_hours")
        total = queryset.count()
        students = [
            {
                "login": item.profil_login,
                "daily_average_hours": item.profil_daily_average_hours,
                "total_hours": item.profil_total_hours,
                "location": item.profil_location,
            }
            for item in queryset[:30]
        ]
        return {
            "mode": "low_attendance",
            "threshold": max_daily_hours,
            "count": total,
            "students": students,
        }

    # Statistiques globales de presence
    total_students: int = queryset.count()
    online_count: int = queryset.filter(profil_is_online=True).count()

    return {
        "mode": "overview",
        "total_students": total_students,
        "online_now": online_count,
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
    "get_students_at_risk": get_students_at_risk,
    "get_students_low_correction_points": get_students_low_correction_points,
    "get_presence_stats": get_presence_stats,
    "get_students_with_day_gap": get_students_with_day_gap,
    "format_feedback_action": format_feedback_action,
}

TOOLS_SPEC = """
You have access to the following tools:

1. search_knowledge_base(query: str)
   Use for questions about 42 school rules, pedagogy, C norm, schedules, peer-evaluations, or exams guidelines.

2. get_students_by_project(project_slug: str, valid: bool or null)
   Use to check students working on or having completed a specific project (e.g. "shell00", "c01", "rush00").

3. get_exam_stats(exam_slug: str)
   Use to retrieve passing and failing statistics for an exam (e.g. "exam00", "exam01", "exam02").

4. get_students_at_risk(risk_level: str or null)
   Use when asked about students in difficulty, students at risk, dropping out, or lagging behind.

5. get_students_low_correction_points(threshold: int)
   Use when asked about students who have few or zero correction points.

6. get_presence_stats(online_only: bool, low_attendance: bool, max_daily_hours: float)
   Use for questions about attendance or logged-in students in clusters.

7. get_students_with_day_gap(min_gap: int)
   Use when asked about students skipping days, or having a gap or difference between their highest validated day and their current day in progress.

8. summarize_feedback(text: str, target_login: str or null)
   Use when the tutor wants to summarize an evaluation note.

9. direct_answer()
   Use for simple greetings or general conversational queries.
"""