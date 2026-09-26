#!/bin/sh
set -e

# Applique automatiquement les migrations de base de donnees avant le lancement du serveur
echo "Applying database migrations..."
python manage.py migrate --noinput

# Vectorisation et mise a jour automatique de la base documentaire IA (ChromaDB)
echo "Ingesting AI knowledge base into ChromaDB..."
python -m ai.services.ingestion

# Execute la commande finale (CMD du Dockerfile ou surcharge docker-compose)
exec "$@"