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

Volontairement léger — juste de quoi afficher une carte par piscineux dans le dashboard, pas toute la progression (pour ça, voir `api/profils/<login>/` juste en dessous).

Retourne :
```json
{
  "profils": [
    {
      "login": "abenamir",
      "first_name": "Abdelaziz",
      "last_name": "Benamira",
      "image_url": "https://cdn.intra.42.fr/...",
      "comments": [
        { "id": 4, "author": "rcompain", "content": "Bloqué sur le C03", "created_at": "2026-09-10T16:30:32.843808+00:00" }
      ]
    }
  ]
}
```

`comments` : les 3 derniers commentaires du piscineux (tous tuteurs confondus), du plus récent au plus ancien — voir section `Comment` plus bas pour le détail des champs.

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

Pas besoin d'envoyer l'auteur — déterminé automatiquement à partir du tuteur connecté.

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

Le commentaire apparaît ensuite dans `comments` via `GET /auth/api/profils/<login>/` (détail complet) et via `GET /auth/api/dashboard/` (3 derniers seulement, tous piscineux), avec son `id` (voir section `Comment` plus bas) — c'est cet `id` qu'il faut garder pour modifier/supprimer ce commentaire précis, voir juste en dessous.

## Modifier / supprimer un commentaire

`PATCH` ou `DELETE http://localhost:8000/auth/comment/<comment_id>/` (faut être connecté)

- `PATCH` : modifie le contenu du commentaire. Body JSON attendu : `{ "content": "Nouveau texte" }`.
- `DELETE` : supprime le commentaire. Pas de body à envoyer.

Seul l'auteur du commentaire peut le modifier ou le supprimer — un autre tuteur reçoit `403`.

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

## Détail des champs

### User

| Champ | Type | Peut être vide/null ? | Default | Valeurs possibles |
|---|---|---|---|---|
| `id` | integer | non | — | entier positif |
| `login` | string | non | — | login 42, texte libre |
| `email` | string | non | — | email valide |
| `first_name` / `last_name` | string | non | — | texte libre |
| `image_url` | string (URL) | oui | `""` | `URL d'image`, ou `""` |
| `kind` | string | non | `""` | `"student"` (seule valeur observée en pratique ; 42 documente aussi `"admin"` pour le personnel, non vérifié depuis ce projet) |
| `location` | string | oui | `""` | ex: `"2B7"`, ou `""` si pas connecté à un poste |
| `followed` | array de string | oui | `[]` | ex: `["nvieille"]`, éventuellement vide |

### Profil

| Champ | Type | Peut être vide/null ? | Default | Valeurs possibles |
|---|---|---|---|---|
| `id` | integer | non | — | entier positif |
| `login` | string | non | — | login 42, texte libre |
| `email` | string | non | — | email valide |
| `first_name` / `last_name` | string | non | — | texte libre |
| `image_url` | string (URL) | oui | `""` | `URL d'image`, ou `""` |
| `pool_year` | string | non | — | année sur 4 chiffres, ex: `"2026"` |
| `pool_month` | string | non | — | nom de mois en anglais minuscule, ex: `"september"` |
| `lvl` | float ou `null` | oui | — | nombre décimal ≥ 0, ou `null` |
| `location` | string | oui | `""` | ex: `"2B7"`, ou `""` si pas connecté à un poste |
| `is_online` | boolean | non | `false` | `true` ou `false` — pas encore alimenté (aucun mécanisme de connexion piscineux au site pour l'instant), toujours `false` actuellement |
| `correction_point` | integer ou `null` | oui | — | entier, peut être négatif |
| `soft_skills` | object | non | — | voir section `SoftSkills` |
| `presence` | object | non | — | voir section `Presence` |
| `risk_score` | integer ou `null` | oui | — |  |
| `risk_level` | string | oui | `""` | ex: `"critical"` |
| `projets` | array | oui | `[]` | projets C piscine (`c-piscine-c-XX`) — voir section `Project`, éventuellement vide |
| `rushs` | array | oui | `[]` | rushs (`c-piscine-rush-XX`) — voir section `Project`, éventuellement vide |
| `exams` | array | oui | `[]` | exams (`c-piscine-exam-XX`, `c-piscine-final-exam`) — voir section `Project`, éventuellement vide |
| `comments` | array | oui | `[]` | voir section `Comment`, éventuellement vide |

### SoftSkills (objet `soft_skills` sur `Profil`)

| Champ | Type | Peut être vide/null ? | Default | Valeurs possibles |
|---|---|---|---|---|
| `timidity` | integer ou `null` | oui | — | `0` à `5` |
| `stress` | integer ou `null` | oui | — | `0` à `5` |
| `peer_help` | integer ou `null` | oui | — | `0` à `5` |
| `self_research` | integer ou `null` | oui | — | `0` à `5` |
| `perseverance` | integer ou `null` | oui | — | `0` à `5` |

### Presence (objet `presence` sur `Profil`)

| Champ | Type | Peut être vide/null ? | Default | Valeurs possibles |
|---|---|---|---|---|
| `total_hours` | float ou `null` | oui | — | pas encore alimenté |
| `daily_average_hours` | float ou `null` | oui | — | pas encore alimenté |
| `time_slots.morning_hours` | float ou `null` | oui | — | pas encore alimenté |
| `time_slots.afternoon_hours` | float ou `null` | oui | — | pas encore alimenté |
| `time_slots.night_hours` | float ou `null` | oui | — | pas encore alimenté |
| `preferred_slot` | string | oui | `""` | pas encore alimenté |

### Project

| Champ | Type | Peut être vide/null ? | Default | Valeurs possibles |
|---|---|---|---|---|
| `name` | string | non | — | ex: `"C Piscine C 00"`...`"C 09"`, `"C Piscine Shell 00"`/`"01"`, `"C Piscine Rush 00"`/`"02"`, `"C Piscine Exam 00"`...`"02"`, `"C Piscine Final Exam"` |
| `slug` | string | non | — | version technique du nom, ex: `"c-piscine-c-00"` |
| `valid` | boolean | non | `false` | `true` ou `false` |
| `note` | integer ou `null` | oui | — | généralement `0` à `125` (bonus possible), ou `null` |
| `status` | string | oui | `""` | `"finished"`, `"in_progress"`, `"waiting_for_correction"` |

### Comment

| Champ | Type | Peut être vide/null ? | Default | Valeurs possibles |
|---|---|---|---|---|
| `id` | integer | non | — | entier positif, à garder pour modifier/supprimer ce commentaire |
| `author` | string | non | — | login 42, texte libre |
| `content` | string | non | — | texte libre, 200 caractères max |
| `created_at` | string | non | — | ex: `"2026-09-10T16:30:32.843808+00:00"` |
