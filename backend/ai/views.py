from typing import Any
import json
from django.http import HttpRequest, JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from ai.services.llm import answer_user_query

# ==============================================================================
# AI API VIEWS
# ==============================================================================

# Exempt de CSRF pour permettre au frontend React de poster directement avec les cookies CORS
@method_decorator(csrf_exempt, name="dispatch")
class AskAIView(View):
    # Traite la question utilisateur, execute le RAG et renvoie la reponse generee
    def post(self, request: HttpRequest, *args: Any, **kwargs: Any) -> JsonResponse:
        try:
            payload: dict[str, Any] = json.loads(request.body.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return JsonResponse(
                {"error": "Invalid JSON payload."},
                status=400,
            )

        query_text: str | None = payload.get("query")
        if not query_text or not isinstance(query_text, str) or not query_text.strip():
            return JsonResponse(
                {"error": "Field 'query' is required and must be a non-empty string."},
                status=400,
            )

        # Execution du pipeline complet (retrieval + LLM local)
        try:
            result: dict[str, Any] = answer_user_query(query_text=query_text.strip())
            return JsonResponse(
                {
                    "query": result["query"],
                    "answer": result["answer"],
                    "sources": list(set(result.get("sources", []))),
                },
                status=200,
            )
        except Exception as error:
            # Log cote conteneur pour le debogage sans fuiter les traces au client
            print(f"[!] Inference error on AskAIView: {error}")
            return JsonResponse(
                {"error": "Failed to process query through AI engine."},
                status=500,
            )