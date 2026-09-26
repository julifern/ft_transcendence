# PROJECT 42 Support Hub (42sh)

> **DevOps & Infrastructure Guide** — Local setup, container architecture, and service routing.

---

## 🏗️ Services Architecture

All services run inside an isolated Docker network behind an Nginx HTTPS reverse proxy:

| Service | Technology / Image | Internal Port | Exposed Port | Role |
|---|---|---|---|---|
| **nginx** | Nginx 1.31 (Alpine) | `80`, `443` | `https://localhost:443` | SSL termination & reverse proxy |
| **django** | Django 6 / Daphne (ASGI) | `8000` | — | API, OAuth 42 & WebSockets |
| **postgres** | `postgres:16-alpine` | `5432` | — | Database with persistent volume (`postgres_data`) |
| **react** | React / Vite | `5173` | — | Frontend SPA |

---

## 🚀 Quick Start

### 1. Environment Setup
Copy the configuration template and fill in required values (PostgreSQL credentials, Django secret, 42 API keys):
```bash
cp .env.example .env

```

### 2. Build & Launch

Start the entire stack in detached mode:

```bash
docker compose up -d --build

```

> Database migrations are executed automatically on container startup via `backend/entrypoint.sh`.

---

## 🌐 Endpoints & Routing

All traffic is routed through Nginx over HTTPS:

* **Frontend Application:** `https://localhost/`
* **42 OAuth Gate:** `https://localhost/auth/login/`
* **Profiles API:** `https://localhost/auth/api/profils/`
* **Django Administration:** `https://localhost/admin/`

---

## 🛠️ Useful DevOps Commands

* **Stream container logs:**
```bash
docker compose logs -f [django|postgres|nginx|react]

```


* **Access PostgreSQL CLI:**
```bash
docker compose exec postgres psql -U transcendence_user -d transcendence_db

```


* **Check synchronized database records:**
```bash
docker compose exec postgres psql -U transcendence_user -d transcendence_db -c "SELECT count(*) FROM auth42_profil;"

```


* **Hard reset (wipes containers and the persistent database volume):**
```bash
docker compose down -v
docker compose up -d --build

```



---

## 🧪 Routing Verification

Quick sanity checks via terminal:

```bash
# 1. Verify OAuth redirection (Expected: HTTP/1.1 302 Found)
curl -k -I https://localhost/auth/login/

# 2. Verify protected route authentication (Expected: HTTP/1.1 401 Unauthorized)
curl -k -I https://localhost/auth/api/profils/

```

---

## 📖 API Documentation
For detailed API endpoints, schemas, and payload examples, refer to [`backend/Backend_README.md`](backend/Backend_README.md).