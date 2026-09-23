from django.urls import path
from ai.views import AskAIView

# ==============================================================================
# URL ROUTING
# ==============================================================================

app_name = "ai"

urlpatterns = [
    path("ask/", AskAIView.as_view(), name="ask_ai"),
]