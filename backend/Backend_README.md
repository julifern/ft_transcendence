# Backend API

## Sommaire

| Endpoint | Permet au front de... |
|---|---|
| `GET /auth/login/` | rediriger vers la connexion 42 |
| `GET /auth/me/` | savoir qui est connecté, récupérer son profil de tuteur et ses suivis |
| `GET /auth/api/dashboard/` | liste des piscineux (carte : photo, prénom, nom, login, derniers commentaires) |
| `GET /auth/api/profils/<login>/` | détail complet d'un piscineux (progression, soft skills, présence, projets...) |
| `POST /auth/comment/<login>/` | ajouter un commentaire sur un piscineux |
| `PATCH`/`DELETE /auth/comment/<comment_id>/` | modifier / supprimer un de ses propres commentaires |
| `POST`/`DELETE /auth/follow/<login>/` | suivre / ne plus suivre un piscineux |
| `PATCH /auth/description/<login>/` | modifier la description d'un piscineux |
| `GET /auth/account/` | *(staff)* récupérer les infos de l'onglet Account (promo, whitelist, nb de profils) |
| `POST`/`DELETE /auth/whitelist/` | *(staff)* ajouter / retirer un login de la whitelist |
| `PATCH /auth/sync-config/` | *(staff)* changer la promo synchronisée (année/mois) |
| `POST /auth/resync-profils/` | *(staff)* relancer une synchronisation complète |
| `DELETE /auth/wipe-profils/` | *(staff)* vider tous les profils (nouvelle promo) |

## Se connecter
Rediriger vers : `http://localhost:8000/auth/login/`

Une fois la connexion 42 terminée, le backend redirige automatiquement vers le front (`FRONT_URL` côté backend, `http://localhost:5173/` par défaut dans le .env).

## Savoir qui est connecté et recuprer ses infos
`GET http://localhost:8000/auth/me/`

Retourne, si connecté :
```json
{
  "authenticated": true,
  "user_dict": {
    "id": 236102,
    "login": "rcompain",
    "email": "rcompain@student.42angouleme.fr",
    "first_name": "Rémi",
    "last_name": "Compain",
    "image_url": "https://cdn.intra.42.fr/...",
    "kind": "student",
    "location": "",
    "followed": ["nvieille", "jecourto"]
  }
}
```

`followed` : la liste des logins des piscineux que ce tuteur suit (`[]` s'il n'en suit aucun). Pour savoir si un piscineux est suivi, comparer son `login` à cette liste.

Si pas connecté : `401` `{ "authenticated": false }`.

## Dashboard : liste allégée des piscineux
`GET http://localhost:8000/auth/api/dashboard/` (faut être connecté)

Volontairement léger : juste de quoi afficher une carte par piscineux dans le dashboard, pas toute la progression (pour ça, voir `api/profils/<login>/` juste en dessous).

Retourne :
```json
{
  "profils": [
    {
      "login": "abenamir",
      "first_name": "Abdelaziz",
      "last_name": "Benamira",
      "image_url": "https://cdn.intra.42.fr/...",
      "last_project": "C Piscine C 05",
      "comments": [
        { "id": 4, "author": "rcompain", "content": "Bloqué sur le C03", "created_at": "2026-09-10T16:30:32.843808+00:00" }
      ]
    }
  ]
}
```

`comments` : les 3 derniers commentaires du piscineux (tous tuteurs confondus), du plus récent au plus ancien. Voir section `Comment` plus bas pour le détail des champs.

`last_project` : le projet le plus avancé du piscineux (priorité aux C piscine, repli sur les shells s'il n'a pas encore commencé les C), ou `null` s'il n'a aucun projet.

## Récupérer un seul piscineux + sa progression

`GET http://localhost:8000/auth/api/profils/<login>/` (faut être connecté)

Retourne directement l'objet complet du piscineux (contrairement à la version allégée du dashboard ci-dessus, ici tous les champs) :
```json
{
  "id": 275227,
  "login": "abenamir",
  "email": "abenamir@student.42angouleme.fr",
  "first_name": "Abdelaziz",
  "last_name": "Benamira",
  "image_url": "https://cdn.intra.42.fr/...",
  "pool_year": "2026",
  "pool_month": "september",
  "lvl": 1.86,
  "location": "",
  "is_online": false,
  "correction_point": 4,
  "soft_skills": { "...": "..." },
  "presence": { "...": "..." },
  "risk_score": null,
  "risk_level": "",
  "last_project": "C Piscine C 05",
  "projets": [ "..." ],
  "rushs": [ "..." ],
  "exams": [ "..." ],
  "comments": [ "..." ]
}
```

Réponses : `200` avec l'objet ci-dessus · `401` pas connecté · `404` login inconnu (`{"error": "profil not found"}`).

## Créer un commentaire sur un piscineux

`POST http://localhost:8000/auth/comment/<login>/` (faut être connecté)

Body JSON attendu :
```json
{ "content": "Le texte du commentaire" }
```

Pas besoin d'envoyer l'auteur, déterminé automatiquement à partir du tuteur connecté.

Réponses : `200` `{"message": "Comment created."}` · `401` pas connecté · `400` `content` manquant · `404` login inconnu.

```js
fetch("http://localhost:8000/auth/comment/nvieille/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ content: "Bloqué sur le C03" }),
})
  .then(res => res.json())
  .then(data => console.log(data));
```

Le commentaire apparaît ensuite dans `comments` via `GET /auth/api/profils/<login>/` (détail complet) et via `GET /auth/api/dashboard/` (3 derniers seulement, tous piscineux), avec son `id` (voir section `Comment` plus bas). C'est cet `id` qu'il faut garder pour modifier/supprimer ce commentaire précis, voir juste en dessous.

## Modifier / supprimer un commentaire

`PATCH` ou `DELETE http://localhost:8000/auth/comment/<comment_id>/` (faut être connecté)

- `PATCH` : modifie le contenu du commentaire. Body JSON attendu : `{ "content": "Nouveau texte" }`.
- `DELETE` : supprime le commentaire. Pas de body à envoyer.

Seul l'auteur du commentaire peut le modifier ou le supprimer, un autre tuteur reçoit `403`.

Réponses : `200` `{"message": "Comment updated."}` (`PATCH`) ou `{"message": "Comment deleted."}` (`DELETE`) · `401` pas connecté · `403` pas l'auteur (`{"error": "not your comment"}`) · `400` `content` manquant (`PATCH` uniquement) · `404` `comment_id` inconnu · `405` autre méthode que `PATCH`/`DELETE`.

```js
// Modifier
fetch("http://localhost:8000/auth/comment/4/", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ content: "Nouveau texte" }),
})
  .then(res => res.json())
  .then(data => console.log(data));

// Supprimer
fetch("http://localhost:8000/auth/comment/4/", {
  method: "DELETE",
  credentials: "include",
})
  .then(res => res.json())
  .then(data => console.log(data));
```

## Suivre / ne plus suivre un piscineux

`POST` ou `DELETE http://localhost:8000/auth/follow/<login>/` (faut être connecté)

- `POST` : le tuteur connecté suit ce piscineux.
- `DELETE` : il ne le suit plus.

Pas de body à envoyer. Le suivi est propre à chaque tuteur (déterminé automatiquement à partir du tuteur connecté).

Les deux appels peuvent être répétés sans risque : suivre deux fois le même piscineux ne crée pas de doublon, et ne plus suivre quelqu'un qu'on ne suit pas ne renvoie pas d'erreur.

Réponses : `200` `{"message": "Followed added."}` (`POST`) ou `{"message": "Followed deleted."}` (`DELETE`) · `401` pas connecté · `404` login inconnu · `405` autre méthode que `POST`/`DELETE`.

```js
// Suivre
fetch("http://localhost:8000/auth/follow/nvieille/", {
  method: "POST",
  credentials: "include",
})
  .then(res => res.json())
  .then(data => console.log(data));

// Ne plus suivre
fetch("http://localhost:8000/auth/follow/nvieille/", {
  method: "DELETE",
  credentials: "include",
})
  .then(res => res.json())
  .then(data => console.log(data));
```

La liste à jour des suivis se lit dans `followed` via `GET /auth/me/`.

## Modifier la description d'un piscineux

`PATCH http://localhost:8000/auth/description/<login>/` (faut être connecté)

Body JSON attendu :
```json
{ "description": "Le texte de la description" }
```

Une chaîne vide (`""`) est acceptée (efface la description). N'importe quel tuteur connecté peut modifier la description d'un piscineux.

Réponses : `200` `{"message": "Description updated."}` · `401` pas connecté · `400` clé `description` manquante · `404` login inconnu · `405` autre méthode que `PATCH`.

```js
fetch("http://localhost:8000/auth/description/nvieille/", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ description: "Progresse bien, à l'aise sur les C" }),
})
  .then(res => res.json())
  .then(data => console.log(data));
```

La description à jour se lit dans `description` via `GET /auth/api/profils/<login>/`.

## Onglet Account (staff uniquement)

Tous les endpoints suivants vérifient d'abord la connexion (`401`), puis le rôle `staff` (`403` `{"error": "staff only"}` sinon). Un tuteur normal (`role: "tutor"`) ne peut utiliser aucun d'entre eux.

### Récupérer les infos de l'onglet

`GET http://localhost:8000/auth/account/`

```json
{
  "sync_config": { "year": "2026", "month": "september" },
  "whitelist": ["rcompain", "nvieille"],
  "profils_count": 71
}
```

### Gérer la whitelist

`POST` ou `DELETE http://localhost:8000/auth/whitelist/`

Body JSON attendu : `{ "login": "unlogin42" }`

Les deux appels peuvent être répétés sans risque (pas de doublon à l'ajout, pas d'erreur si déjà absent à la suppression).

Réponses : `200` `{"message": "Login added to whitelist."}` (`POST`) ou `{"message": "Login removed from whitelist."}` (`DELETE`) · `400` `login` manquant · `405` autre méthode.

```js
fetch("http://localhost:8000/auth/whitelist/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ login: "unlogin42" }),
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Changer la promo synchronisée

`PATCH http://localhost:8000/auth/sync-config/`

Body JSON attendu : `{ "year": "2026", "month": "september" }` (les deux clés sont requises)

Réponses : `200` `{"message": "Sync config updated."}` · `400` `year`/`month` manquant · `405` autre méthode que `PATCH`.

### Relancer une synchronisation complète

`POST http://localhost:8000/auth/resync-profils/`

Pas de body à envoyer. Resynchronise tous les piscineux de la promo configurée (`sync-config/`) depuis l'API 42, peut prendre du temps (~35s pour 71 piscineux).

Réponse : `200` `{"message": "N profils synced.", "synced_count": N}`.

### Vider tous les profils (nouvelle promo)

`DELETE http://localhost:8000/auth/wipe-profils/`

⚠️ Supprime **tous** les `Profil` en base, ainsi que leurs `Project`/`Comment` liés (suppression en cascade). Les tuteurs (`FtUser`) et la whitelist ne sont pas affectés. Irréversible, à utiliser avant de changer de promo et resynchroniser.

Réponse : `200` `{"message": "Profils wiped.", "deleted_count": N}` (`N` inclut les projets/commentaires supprimés en cascade, pas que les profils).

## Détail des champs

### User

| Champ | Type | Peut être vide/null ? | Default | Valeurs possibles |
|---|---|---|---|---|
| `id` | integer | non | N/A | entier positif |
| `login` | string | non | N/A | login 42, texte libre |
| `email` | string | non | N/A | email valide |
| `first_name` / `last_name` | string | non | N/A | texte libre |
| `image_url` | string (URL) | oui | `""` | `URL d'image`, ou `""` |
| `kind` | string | non | `""` | `"student"` (seule valeur observée en pratique ; 42 documente aussi `"admin"` pour le personnel, non vérifié depuis ce projet) |
| `location` | string | oui | `""` | ex: `"2B7"`, ou `""` si pas connecté à un poste |
| `role` | string | non | `"tutor"` | `"tutor"` ou `"staff"`, resynchronisé depuis le `staff?` de l'API 42 à chaque connexion. `"staff"` donne accès aux endpoints marqués *(staff)* dans le sommaire |
| `followed` | array de string | oui | `[]` | ex: `["nvieille"]`, éventuellement vide |

### Profil

| Champ | Type | Peut être vide/null ? | Default | Valeurs possibles |
|---|---|---|---|---|
| `id` | integer | non | N/A | entier positif |
| `login` | string | non | N/A | login 42, texte libre |
| `email` | string | non | N/A | email valide |
| `first_name` / `last_name` | string | non | N/A | texte libre |
| `image_url` | string (URL) | oui | `""` | `URL d'image`, ou `""` |
| `pool_year` | string | non | N/A | année sur 4 chiffres, ex: `"2026"` |
| `pool_month` | string | non | N/A | nom de mois en anglais minuscule, ex: `"september"` |
| `lvl` | float ou `null` | oui | N/A | nombre décimal ≥ 0, ou `null` |
| `location` | string | oui | `""` | ex: `"2B7"`, ou `""` si pas connecté à un poste |
| `is_online` | boolean | non | `false` | `true` ou `false`, pas encore alimenté (aucun mécanisme de connexion piscineux au site pour l'instant), toujours `false` actuellement |
| `correction_point` | integer ou `null` | oui | N/A | entier, peut être négatif |
| `description` | string | oui | `""` | texte libre saisi par un tuteur, modifiable via `PATCH /auth/description/<login>/` |
| `soft_skills` | object | non | N/A | voir section `SoftSkills` |
| `presence` | object | non | N/A | voir section `Presence` |
| `risk_score` | integer ou `null` | oui | N/A |  |
| `risk_level` | string | oui | `""` | ex: `"critical"` |
| `last_project` | string ou `null` | oui | N/A | nom du projet le plus avancé (priorité C, repli shell), ex: `"C Piscine C 05"`, ou `null` sans aucun projet |
| `projets` | array | oui | `[]` | projets C piscine (`c-piscine-c-XX`), voir section `Project`, éventuellement vide |
| `rushs` | array | oui | `[]` | rushs (`c-piscine-rush-XX`), voir section `Project`, éventuellement vide |
| `exams` | array | oui | `[]` | exams (`c-piscine-exam-XX`, `c-piscine-final-exam`), voir section `Project`, éventuellement vide |
| `comments` | array | oui | `[]` | voir section `Comment`, éventuellement vide |

### SoftSkills (objet `soft_skills` sur `Profil`)

| Champ | Type | Peut être vide/null ? | Default | Valeurs possibles |
|---|---|---|---|---|
| `timidity` | integer ou `null` | oui | N/A | `0` à `5` |
| `stress` | integer ou `null` | oui | N/A | `0` à `5` |
| `peer_help` | integer ou `null` | oui | N/A | `0` à `5` |
| `self_research` | integer ou `null` | oui | N/A | `0` à `5` |
| `perseverance` | integer ou `null` | oui | N/A | `0` à `5` |

### Presence (objet `presence` sur `Profil`)

| Champ | Type | Peut être vide/null ? | Default | Valeurs possibles |
|---|---|---|---|---|
| `total_hours` | float ou `null` | oui | N/A | pas encore alimenté |
| `daily_average_hours` | float ou `null` | oui | N/A | pas encore alimenté |
| `time_slots.morning_hours` | float ou `null` | oui | N/A | pas encore alimenté |
| `time_slots.afternoon_hours` | float ou `null` | oui | N/A | pas encore alimenté |
| `time_slots.night_hours` | float ou `null` | oui | N/A | pas encore alimenté |
| `preferred_slot` | string | oui | `""` | pas encore alimenté |

### Project

| Champ | Type | Peut être vide/null ? | Default | Valeurs possibles |
|---|---|---|---|---|
| `name` | string | non | N/A | ex: `"C Piscine C 00"`...`"C 09"`, `"C Piscine Shell 00"`/`"01"`, `"C Piscine Rush 00"`/`"02"`, `"C Piscine Exam 00"`...`"02"`, `"C Piscine Final Exam"` |
| `slug` | string | non | N/A | version technique du nom, ex: `"c-piscine-c-00"` |
| `valid` | boolean | non | `false` | `true` ou `false` |
| `note` | integer ou `null` | oui | N/A | généralement `0` à `125` (bonus possible), ou `null` |
| `status` | string | oui | `""` | `"finished"`, `"in_progress"`, `"waiting_for_correction"` |

### Comment

| Champ | Type | Peut être vide/null ? | Default | Valeurs possibles |
|---|---|---|---|---|
| `id` | integer | non | N/A | entier positif, à garder pour modifier/supprimer ce commentaire |
| `author` | string ou `null` | oui | N/A | login 42, texte libre, `null` si le tuteur auteur a depuis été supprimé |
| `content` | string | non | N/A | texte libre, 200 caractères max |
| `created_at` | string | non | N/A | ex: `"2026-09-10T16:30:32.843808+00:00"` |


---

## Gestion multi-promotions & Moteur Piscine (Mise à jour)

### Endpoints ajoutés et modifiés

#### 1. Lister les promotions disponibles
`GET http://localhost:8000/auth/api/pools/` *(authentification requise)*

Renvoie la liste des promotions uniques enregistrées en base :

```json
{
  "available_pools": [
    { "year": "2026", "month": "september" },
    { "year": "2025", "month": "august" },
    { "year": "4242", "month": "july" }
  ]
}
```

#### 2. Filtrer le Dashboard par promotion
`GET http://localhost:8000/auth/api/dashboard/?year=<year>&month=<month>` *(authentification requise)*

* **Sans paramètres :** Renvoie l'ensemble des profils enregistrés en base (comportement par défaut).
* **Avec paramètres :** Isole uniquement les profils de la promotion demandée et recalcule le `rank` de 1 à N spécifiquement pour ce groupe.

Exemple : `GET http://localhost:8000/auth/api/dashboard/?year=2025&month=august`

---

### Évolutions des données renvoyées

* **Historique XP (`xp_history`) :**
  Dans le profil complet (`/auth/api/profils/<login>/`), le tableau `xp_history` est désormais structuré sous forme d'une liste de 4 sous-listes (représentant les 4 semaines de la Piscine). Chaque élément contient `{ "day": str, "xp": float, "average": float }`.
* **Score et niveau de risque (`risk_score`, `risk_level`) :**
  * **Piscine en cours :** Calculé en temps réel selon la courbe de progression `EXPECTED_PACE`, l'inactivité récente, les notes d'examens, le solde de points de correction et l'inscription/participation aux Rushs (dès les semaines 2 et 3).
  * **Piscine terminée (> 25 jours) :** Bascule automatique en mode bilan (analyse globale sur l'avancement final, les heures totales, la présence aux examens et les Rushs effectués).

---

### Commandes utiles pour le développement (`seed_piscine`)

Un outil de génération de données factices est disponible pour tester l'interface avec plusieurs promotions :
 
```bash
# Générer 50 profils factices pour août 2025
docker compose exec django python manage.py seed_piscine --generate 50 --year 2025 --month august

# Générer 30 profils factices pour juillet 4242
docker compose exec django python manage.py seed_piscine --generate 30 --year 4242 --month july
```
