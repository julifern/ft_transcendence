FROM python:3.13-slim

RUN mkdir /app

WORKDIR /app

# prevents Python from writing pyc files to disk
ENV PYTHONDONTWRITEBYTECODE=1
# prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED=1

# tool for chroma-hnswlib (C++11/C++14)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*
 
RUN pip install --upgrade pip 
 
COPY requirements.txt /app/
 
RUN pip install --no-cache-dir -r requirements.txt
 
COPY . /app/
 
EXPOSE 8000

# Utilise un entrypoint pour automatiser les migrations de base de donnees au demarrage
# avant de passer la main au serveur web (evite l'execution manuelle de manage.py migrate)
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

# Lance le serveur ASGI Daphne en production au lieu du runserver de dev
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "config.asgi:application"]