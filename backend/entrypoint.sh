#!/bin/sh
set -e

# Applique automatiquement les migrations de base de donnees avant le lancement du serveur
echo "Applying database migrations..."
python manage.py migrate --noinput

# Execute la commande finale (CMD du Dockerfile ou surcharge docker-compose)
exec "$@"