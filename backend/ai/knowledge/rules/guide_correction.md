# Guide Officiel des Corrections (42 Angoulême)
Règles de déontologie, déroulement, barèmes techniques et gestion des créneaux pour les évaluations par les pairs.

## Objectifs et durée d'une soutenance
- Objectif double : assurer un partage constructif de connaissances et vérifier l'assimilation réelle des concepts sans lacunes.
- Répartition du temps : la majeure partie de la soutenance doit être dédiée à la revue de code et aux échanges techniques, et non uniquement à lancer des tests.
- Durée en piscine : 25 minutes minimum, et jusqu'à 45 minutes pour les modules denses. Moyenne attendue de 30 minutes. Les corrections éclair sont formellement interdites.
- Durée pour les étudiants (tronc commun) : 35 minutes minimum pour les petits projets, jusqu'à 1 h 30 pour les projets majeurs.
- Sanctions : les abus ou manquements aux règles exposent à des TIG et au retrait jusqu'à 2 points de correction.

## Rôles et déroulement de l'évaluation
- Posture bienveillante : interdiction stricte de mépriser, rabaisser, insulter ou chercher à casser le code dans un esprit destructeur.
- Saisie du matériel : interdiction formelle pour le correcteur de toucher au clavier sans l'autorisation expresse de l'évalué.
- Présentation par l'évalué : l'étudiant évalué présente activement son travail, lance la démo et justifie son code, ses choix d'architecture et les notions assimilées.
- Tiers extérieur : interdiction de faire intervenir une tierce personne dans la soutenance, sauf demande expresse et accord mutuel.
- Ordre d'explication : l'explication doit se baser en priorité sur les fichiers d'en-tête (.h) ou, à défaut, dérouler la logique depuis la fonction principale (main).
- Maîtrise de la soutenance : le correcteur reste maître de la correction et peut à tout moment reprendre la main, faire des tests ciblés ou exiger des éclaircissements.
- Continuité pédagogique : même si une faute éliminatoire est trouvée dès le début, la soutenance doit impérativement être poursuivie jusqu'au bout pour identifier les axes d'amélioration et chercher un correctif avec l'évalué.
- Feedback : rédaction d'un commentaire pédagogique détaillé au fil de la soutenance (en français ou en anglais), sans propos déplacés.

## Vérifications techniques obligatoires
- Norme : passage obligatoire de la Norminette dès que le projet est normé.
- Fuites mémoire (Valgrind) : aucune fuite de mémoire n'est tolérée (hors fuites des bibliothèques système). Valgrind est conseillé en piscine à partir du Rush01, et systématique pour les étudiants du tronc commun.
- Concurrence et descripteurs : vérification des fuites de file descriptors (fd) et des data races sur les projets multithreadés.
- Protection des malloc et appels système : toute omission de contrôle de retour sur un malloc ou un appel système entraîne un flag Crash immédiat.
- Projets de groupe : tous les membres sans exception doivent maîtriser et être capables d'expliquer l'intégralité du code rendu.
- Tests hors barème : en piscine et tronc commun, les tests inventés hors sujet sont autorisés pour la pédagogie mais ne peuvent pas impacter la note (sauf s'ils provoquent un crash franc).

## Système de créneaux et ponctualité
- Respect des horaires : ne poser des disponibilités que si la présence est certaine.
- Annulations : annulation strictement interdite, sauf motif exceptionnel impérieux. En cas d'imprévu, contacter le binôme pour décaler.
- Format des créneaux : ouvrir des plages d'une heure espacées de 15 minutes pour éviter d'enchaîner dans l'urgence ou d'accumuler du retard.
- Prise de créneaux : réserver les créneaux un par un pour ne pas bloquer les collègues.
- Triche par complaisance : choisir ou arranger ses correcteurs est formellement qualifié de triche. Utiliser le Discord dédié en cas de pénurie de créneaux.
- Cumul interdit : il est strictement interdit de mener deux corrections en simultané.

## Gestion des désaccords, marchandage et flags
- Arbitrage : l'évaluateur a le dernier mot sur l'évaluation.
- Litiges : en cas de blocage ou de désaccord majeur impossible à trancher, positionner obligatoirement le flag « concerning situation » pour demander la médiation du staff.
- Limite d'intervention : en dehors d'un flag concerning situation ou d'une violation grave du guide, le staff n'intervient jamais sur une correction déjà clôturée.
- Marchandage interdit : faire pression ou supplier pour éviter une pénalité sur une erreur même mineure est proscrit. Le « retry » est un principe fondateur d'apprentissage à 42.

## Environnement de test et consignes matérielles
- Emplacement : corrections obligatoirement sur les postes C2 ou C3 (interdit au C1 sauf dérogations particulières comme la piscine).
- Dossier de travail : cloner, exécuter et tester les dépôts obligatoirement dans le répertoire temporaire « /tmp ».
- Intranet : obligation de se connecter à l'intranet via une fenêtre de navigation privée sur le poste de soutenance.
- Préparation : lecture préalable du sujet exigée et préparation de l'environnement (packages, VM) avant l'heure de début.