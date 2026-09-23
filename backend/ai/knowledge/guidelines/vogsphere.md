# Guide d'Utilisation de Vogsphere et Gestion des Rendus
Fonctionnement du système de rendu Git officiel de 42, gestion des droits, authentification et pièges à éviter.

## Principes généraux et création de dépôt
- Création automatique : l'inscription à un projet génère automatiquement un dépôt Git distant dédié et personnel (ou commun à l'équipe pour les projets de groupe et rushs).
- URL du dépôt : disponible directement sur la page du projet sur l'intranet (format : vogsphere@vogsphere.42.fr:...).
- Récupération locale : récupération du dépôt via la commande « git clone <url_du_repo> ».
- Règle d'anticipation : interdiction d'attendre la dernière minute pour cloner son dépôt ou tester ses accès. Le support ne prend pas en charge les blocages signalés quelques heures avant la fermeture.

## Cycle de rendu Git et vérification
- Commandes fondamentales : ajouter les fichiers modifiés avec « git add », sceller la révision avec « git commit -m "message" », et envoyer sur le serveur avec « git push origin master » (ou main).
- Suivi d'état : vérifier systématiquement l'état des fichiers indexés via la commande « git status ».
- Pousser son travail : les commits locaux non poussés via git push n'existent pas sur Vogsphere et sont invisibles lors de la soutenance.
- Vérification du rendu réel : cloner une copie neuve de son dépôt Vogsphere dans un dossier temporaire (/tmp) avant la deadline pour constater exactement ce que le correcteur verra.

## Quota strict de 100 Mo par dépôt
- Limite maximale : chaque dépôt Vogsphere est soumis à un quota strict de 100 Mo (100 MB).
- Sanctions : dépasser cette limite est considéré comme un abus de ressources système et fait l'objet de sanctions disciplinaires.
- Précaution : ne jamais commiter d'exécutables compilés, d'archives volumineuses (.tar, .zip) ou de fichiers temporaires lourds dans le dépôt.

## Authentification et renouvellement du ticket Kerberos
- Authentification par ticket : Vogsphere utilise le protocole Kerberos pour identifier l'étudiant. Le ticket est généré automatiquement lors de l'ouverture de session sur un poste.
- Expiration du ticket : au bout d'un certain temps d'activité ou en cas d'erreur de droits/permission refusée lors d'un clone ou d'un push, le ticket expire.
- Résolution : saisir la commande « kinit » dans le terminal et renseigner son mot de passe de session pour regénérer un ticket valide.

## Fermeture des dépôts et gestion de la deadline
- Verrouillage automatique : le dépôt se verrouille automatiquement à la seconde exacte de la deadline indiquée sur l'intranet. Il bascule en lecture seule (accès en clone possible, mais push formellement bloqué).
- Horodatage des transactions : l'heure prise en compte pour valider l'accès en écriture est l'heure de début de connexion à Vogsphere. Si une file d'attente survient au moment du push lors d'un rush, ne jamais interrompre la connexion tant que le serveur traite la transaction.