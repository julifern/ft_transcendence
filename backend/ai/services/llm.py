from pathlib import Path
from typing import Any
import sys

# Garantit que la racine du projet (/app) est resolue pour les imports absolus
BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import requests
from ai.services.rag import format_context_for_prompt, query_knowledge_base

# ==============================================================================
# CONFIGURATION & CONSTANTS
# ==============================================================================

# URL interne du conteneur Ollama au sein du reseau Docker
OLLAMA_API_URL: str = "http://ollama:11434/api/generate"
DEFAULT_MODEL: str = "qwen2.5:3b"

# Consigne stricte pour forcer le modele a ne pas inventer
SYSTEM_PROMPT_TEMPLATE: str = """Tu es l'assistant pédagogique officiel des tuteurs et étudiants de l'école.
Tu dois répondre à la question posée en te basant STRICTEMENT sur les extraits de documentation fournis ci-dessous.
Si l'information n'est pas présente dans les documents, indique clairement que la documentation actuelle ne permet pas de trancher.
Ne donne jamais d'avis personnel contraire au règlement et reste concis, factuel et neutre.

--- CONTEXTE FOURNI ---
{context}
-----------------------
"""


# ==============================================================================
# PROMPT FORMATTING & INFERENCE
# ==============================================================================

# Construit la structure du prompt complet
def build_prompt_payload(user_query: str, retrieved_chunks: list[dict[str, Any]]) -> str:
    context_text: str = format_context_for_prompt(retrieved_chunks)
    system_instruction: str = SYSTEM_PROMPT_TEMPLATE.format(context=context_text)
    return f"{system_instruction}\nQuestion : {user_query}\nRéponse :"


# Interroge l'API REST d'Ollama sans passer par du streaming pour simplifier l'integration
def query_llm(
    prompt: str,
    model: str = DEFAULT_MODEL,
    timeout_seconds: int = 60,
) -> str:
    payload: dict[str, Any] = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.2,  # Temperature basse pour limiter les hallucinations
        },
    }

    try:
        response = requests.post(OLLAMA_API_URL, json=payload, timeout=timeout_seconds)
        response.raise_for_status()
        data: dict[str, Any] = response.json()
        return data.get("response", "").strip()
    except requests.RequestException as error:
        print(f"[!] Error contacting Ollama API: {error}")
        return "Erreur lors de la génération de la réponse par le modèle local."


# Pipeline complet : RAG + Generation
def answer_user_query(query_text: str) -> dict[str, Any]:
    # 1. Recuperation des extraits sémantiques pertinents
    chunks: list[dict[str, Any]] = query_knowledge_base(query_text=query_text)

    # 2. Construction du prompt enrichi
    full_prompt: str = build_prompt_payload(user_query=query_text, retrieved_chunks=chunks)

    # 3. Generation de la reponse par Ollama
    answer: str = query_llm(prompt=full_prompt)

    return {
        "query": query_text,
        "answer": answer,
        "sources": [chunk.get("metadata", {}).get("source") for chunk in chunks if chunk.get("metadata")],
    }


# ==============================================================================
# STANDALONE TEST
# ==============================================================================

if __name__ == "__main__":
    test_question: str = "Un étudiant ne sait pas justifier son code lors de la correction, qu'est-ce que je dois faire ?"
    print(f"[*] Processing test query: '{test_question}'\n")

    result: dict[str, Any] = answer_user_query(test_question)

    print(f"[+] LLM Response:\n{result['answer']}\n")
    print(f"[*] Referenced sources: {set(result['sources'])}")