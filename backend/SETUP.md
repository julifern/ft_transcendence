# Setup backend-auth42 (nouveau poste)

## Installer

```bash
cd backend-auth42
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Config

```bash
cp .env.example .env
```

Remplir `.env` avec des identifiants d'app OAuth 42 dispo sur https://profile.intra.42.fr/oauth/applications, avec comme redirect URI.

## Base de données

```bash
python manage.py migrate
python manage.py createsuperuser
```
(ce superuser est un compte admin Django, juste pour accéder à `/admin/`)

## Lancer

```bash
python manage.py runserver
```

## Se whitelister

1. Aller sur `http://localhost:8000/admin/`, Se connecter avec le superuser créé.
2. Dans "Whitelist users", ajoute un login 42.

Toujours tester sur `localhost:8000`, pas `127.0.0.1:8000` — les cookies de session ne sont pas partagés entre les deux.

## Tester

1. `http://localhost:8000/auth/login/` → Connexion via 42.
2. `http://localhost:8000/auth/me/` → Renvoyer les infos du connecté.
3. `http://localhost:8000/auth/sync_all_profils/` →Synchronise tous les piscineux de la session en cours (~35s).
4. `http://localhost:8000/auth/api/profils/` → Liste JSON des piscineux + progression (voir `Backend_README.md`).

## Commandes utiles

| Commande | Utilité |
|---|---|
| `source venv/bin/activate` | Activer le venv |
| `deactivate` | Désactiver le venv |
| `python manage.py runserver` | Lancer le serveur de dev |
| `python manage.py makemigrations auth42 && python manage.py migrate` | Après avoir modifié `models.py` |
| `python manage.py shell` | Ouvrir un shell Python avec Django chargé (pour inspecter la base) |
| `python manage.py createsuperuser` | Créer un compte admin Django |
| `pip install <paquet> && pip freeze > requirements.txt` | Ajouter une dépendance |
