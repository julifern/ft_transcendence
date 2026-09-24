#!/bin/sh
set -e

if [ ! -f /etc/nginx/ssl/transcendence.crt ]; then
    echo "[nginx] Generating self-signed SSL certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/transcendence.key \
        -out /etc/nginx/ssl/transcendence.crt \
        -subj "/C=FR/ST=Charente/L=Angouleme/O=42/OU=ft_transcendence/CN=localhost"
fi

exec "$@"