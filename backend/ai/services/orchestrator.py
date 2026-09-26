from typing import Any
import json
import os
import requests
from django.conf import settings
from .tools import TOOLS_REGISTRY, TOOLS_SPEC, format_feedback_action

# ==============================================================================
# CONFIGURATION & CONSTANTS
# ==============================================================================

OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://ollama:11434")
OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")

ROUTER_SYSTEM_PROMPT: str = f"""
You are an intent router for a 42 school pedagogical dashboard.
Analyze the user message, choose the most appropriate tool, and reply ONLY with a valid JSON object matching this structure:
{{
    "tool": "search_knowledge_base" | "get_students_by_project" | "get_exam_stats" | "summarize_feedback" | "direct_answer",
    "args": {{}}
}}

{TOOLS_SPEC}

Schema for args:
- search_knowledge_base: {{"query": "search keywords"}}
- get_students_by_project: {{"project_slug": "project_name", "valid": true/false/null}}
- get_exam_stats: {{"exam_slug": "exam_name"}}
- summarize_feedback: {{"text": "raw feedback text", "target_login": "student_login or null"}}
- direct_answer: {{}}
"""


# ==============================================================================
# OLLAMA CLIENT
# ==============================================================================

# Envoie une requete de generation a Ollama via son API HTTP
def query_ollama(messages: list[dict[str, str]], format_json: bool = False) -> str:
    url: str = f"{OLLAMA_BASE_URL}/api/chat"
    payload: dict[str, Any] = {
        "model": OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": 0.1 if format_json else 0.4,
        },
    }
    if format_json:
        payload["format"] = "json"

    try:
        response: requests.Response = requests.post(url, json=payload, timeout=60)
        response.raise_for_status()
        data: dict[str, Any] = response.json()
        return data.get("message", {}).get("content", "").strip()
    except Exception as error:
        print(f"[!] Ollama request error: {error}")
        return ""


# ==============================================================================
# INTENT ROUTING
# ==============================================================================

# Analyse la requete utilisateur et determine l'outil approprie
def route_intent(user_query: str) -> dict[str, Any]:
    messages: list[dict[str, str]] = [
        {"role": "system", "content": ROUTER_SYSTEM_PROMPT},
        {"role": "user", "content": user_query},
    ]

    response_text: str = query_ollama(messages, format_json=True)
    if not response_text:
        return {"tool": "search_knowledge_base", "args": {"query": user_query}}

    try:
        decision: dict[str, Any] = json.loads(response_text)
        if "tool" in decision and decision["tool"] in [
            "search_knowledge_base",
            "get_students_by_project",
            "get_exam_stats",
            "summarize_feedback",
            "direct_answer",
        ]:
            return decision
    except json.JSONDecodeError:
        pass

    return {"tool": "search_knowledge_base", "args": {"query": user_query}}


# ==============================================================================
# EXECUTION & DISPATCH
# ==============================================================================

# Execute le pipeline RAG en recuperant les sources puis en formulant la reponse
def handle_rag_flow(user_query: str, search_query: str) -> dict[str, Any]:
    search_func = TOOLS_REGISTRY["search_knowledge_base"]
    retrieval_data: dict[str, Any] = search_func(query=search_query)

    context: str = retrieval_data.get("context", "")
    sources: list[str] = retrieval_data.get("sources", [])

    system_prompt: str = (
        "Tu es l'assistant pédagogique officiel de l'école 42. "
        "Réponds à la question en français de manière claire, concise et précise, "
        "en t'appuyant uniquement sur le contexte documentaire fourni. "
        "Si l'information demandée n'est pas dans le document, indique-le simplement."
    )

    user_prompt: str = f"Documentation fournie :\n{context}\n\nQuestion du tuteur :\n{user_query}"
    answer: str = query_ollama([
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ])

    return {
        "answer": answer or "Impossible de générer une réponse à partir des sources fournies.",
        "sources": sources,
        "action": None,
    }


# Execute une requete base de donnees et formule une synthese textuelle
def handle_database_flow(user_query: str, tool_name: str, args: dict[str, Any]) -> dict[str, Any]:
    tool_func = TOOLS_REGISTRY[tool_name]
    db_results: dict[str, Any] = tool_func(**args)

    system_prompt: str = (
        "Tu es l'assistant d'aide au suivi des piscineux à 42. "
        "À partir des données brutes de la base PostgreSQL fournies, formule une réponse "
        "synthétique, factuelle et bien structurée en français pour le tuteur."
    )

    user_prompt: str = (
        f"Données de la base :\n{json.dumps(db_results, ensure_ascii=False)}\n\n"
        f"Question posée :\n{user_query}"
    )

    answer: str = query_ollama([
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ])

    return {
        "answer": answer or json.dumps(db_results, ensure_ascii=False),
        "sources": ["PostgreSQL: auth42_project"],
        "action": None,
    }


# Synthetise un retour de tuteur et prepare l'ajout de commentaire
def handle_feedback_summary(args: dict[str, Any]) -> dict[str, Any]:
    raw_text: str = args.get("text", "")
    target_login: str | None = args.get("target_login")

    system_prompt: str = (
        "Tu es un assistant pédagogique pour les tuteurs de 42. "
        "Résume et reformule le texte brut suivant en une note de suivi constructive, "
        "professionnelle et concise (200 caractères maximum) adaptée au dossier de l'étudiant."
    )

    summary: str = query_ollama([
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": raw_text},
    ])

    action_payload: dict[str, Any] = format_feedback_action(
        suggested_text=summary,
        target_login=target_login,
    )

    student_label: str = f" pour **{target_login}**" if target_login else ""
    return {
        "answer": f"Voici une proposition de synthèse du feedback{student_label} :\n\n> {summary}",
        "sources": [],
        "action": action_payload,
    }


# Point d'entree global de l'orchestration IA
def process_ai_query(user_query: str) -> dict[str, Any]:
    decision: dict[str, Any] = route_intent(user_query)
    tool: str = decision.get("tool", "search_knowledge_base")
    args: dict[str, Any] = decision.get("args", {})

    if tool == "search_knowledge_base":
        query_arg: str = args.get("query", user_query)
        return handle_rag_flow(user_query=user_query, search_query=query_arg)

    if tool in ["get_students_by_project", "get_exam_stats"]:
        return handle_database_flow(user_query=user_query, tool_name=tool, args=args)

    if tool == "summarize_feedback":
        return handle_feedback_summary(args=args)

    # réponse directe
    direct_answer: str = query_ollama([
        {"role": "system", "content": "Tu es l'assistant de bord de la piscine 42. Réponds cordialement et brièvement en français."},
        {"role": "user", "content": user_query},
    ])
    return {
        "answer": direct_answer,
        "sources": [],
        "action": None,
    }