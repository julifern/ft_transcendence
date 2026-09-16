# Backend API

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
    "location": ""
  }
}
```

Si pas connecté : `401` `{ "authenticated": false }`.

## Récupérer les piscineux + leur progression
`GET http://localhost:8000/auth/api/profils/` (faut être connecté)

Retourne :
```json
{
  "profils": [
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
      "soft_skills": {
        "timidity": null,
        "stress": null,
        "peer_help": null,
        "self_research": null,
        "perseverance": null
      },
      "presence": {
        "total_hours": null,
        "daily_average_hours": null,
        "time_slots": {
          "morning_hours": null,
          "afternoon_hours": null,
          "night_hours": null
        },
        "preferred_slot": ""
      },
      "risk_score": null,
      "risk_level": "",
      "projects": [
        { "name": "C Piscine C 00", "slug": "c-piscine-c-00", "valid": true, "note": 50 }
      ],
      "comments": [
        { "author": "rcompain", "content": "Bloqué sur le C03", "created_at": "2026-09-10T16:30:32.843808+00:00" }
      ]
    }
  ]
}
```

Voir le détail de chaque champ plus bas.

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

Le commentaire apparaît ensuite dans `comments` via `GET /auth/api/profils/`.

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
| `projects` | array | oui | `[]` | voir section `Project`, éventuellement vide |
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

### Comment

| Champ | Type | Peut être vide/null ? | Default | Valeurs possibles |
|---|---|---|---|---|
| `author` | string | non | — | login 42, texte libre |
| `content` | string | non | — | texte libre, 200 caractères max |
| `created_at` | string | non | — | ex: `"2026-09-10T16:30:32.843808+00:00"` |
