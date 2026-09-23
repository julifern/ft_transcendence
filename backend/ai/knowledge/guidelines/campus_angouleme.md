# Guide Pratique du Campus 42 Angoulême
Informations opérationnelles, sécurité, outils système et contacts pour les étudiants du campus.

## Points de contact et canaux du staff
- Pédagogie : @Randria, @Eliot (eblondee) ou pedago@42angouleme.fr
- Administratif et Bocal : @Camille, @Josepha ou bocal@42angouleme.fr
- Référente handicap : @Josepha ou referent-handicap@42angouleme.fr
- Relations entreprises : @Josepha
- Communication : @Camille
- Support technique et informatique : @Randria, @Mathilde ou ticket sur Rusty
- Outils principaux : Rusty (tickets et suivi sur https://rusty.42angouleme.fr/) et Cluster Map (https://cluster-map.42angouleme.fr/).

## Procédure d'urgence et alarme Verisure
- Déclenchement de l'alarme : le centre de télésurveillance Verisure effectue une levée de doute via les caméras et les deux boîtiers blancs à l'entrée (en face de la salle serveur).
- Fausse alerte : donner le mot de passe « Besson Bey » puis prévenir immédiatement le staff sur le canal Discord #General.
- Vraie alerte ou danger réel : donner le mot de passe « Tout est sous contrôle ».
- Badge : obligation stricte de badger à l'entrée et à la sortie.
- Issue coursive : utiliser exclusivement la porte du palier de l'escalier (les autres portes déclenchent l'alarme).
- Personnes extérieures : interdiction absolue de faire entrer quelqu'un sans accord préalable du staff. Dispositif travailleur isolé (montre) obligatoire si vous êtes seul dans le bâtiment.

## Règles de vie en cluster et matériel
- Cluster 1 (RDC) : cluster silencieux 24 h/24 ; les corrections y sont interdites, seuls les chuchotements sont tolérés.
- Absence : déconnexion obligatoire si vous quittez votre poste plus de 20 minutes.
- Boissons et nourriture : nourriture, boissons chaudes et boissons sucrées strictement interdites dans les clusters.
- Éclairage : en cas de coupure de lumière dans les clusters ou l'amphi, vérifier les disjoncteurs sous le bar d'accueil.
- Stationnement : parking GESTA en face de l'école (stationnement-angouleme.com).

## Wifi et messagerie Microsoft 365
- Wifi student : SSID dédié, mot de passe « bR#V5$7G698!5*H ». Choisir le 5 GHz pour le débit ou le 2,4 GHz pour la portée.
- Compte étudiant : login@student.42angouleme.fr créé quelques jours après la rentrée. Première connexion via outlook.office365.com en demandant un reset de mot de passe, avec validation 2FA sur Microsoft Authenticator.
- Acheminement des emails : les messages du staff arrivent exclusivement sur Outlook et ne sont pas transférés automatiquement. Activer le transfert dans Paramètres > Courrier > Transfert pour tout recevoir sur votre email personnel.

## Gestion des stockages (Home et Goinfre)
- Répertoire ~/ (Home) : stockage réseau limité accessible sur tous les postes. Suivi via l'extension GNOME (homesize@42angouleme.fr). Achat de Go supplémentaires possible sur le shop de l'intra (ou +5 Go pour les Transcenders).
- Réinitialisation du Home : en cas de session corrompue, exécuter « touch ~/.reset » puis se déconnecter et reconnecter.
- Répertoire /goinfre : stockage local propre à chaque machine, limité à ~15 Go. Purge automatique après sept jours sans activité. Sauvegardes Git distantes obligatoires.

## Raccourcis clavier et dépannage matériel
- Redémarrage propre sans corrompre le disque (Magic SysRq) : maintenir Alt + PrintScreen (Fn + Insert sur les claviers 42) puis taper successivement s (sync), u (unmount read-only) et b (reboot).
- Accents sur clavier QWERTY : AltGr + e pour é, AltGr + r pour è, AltGr + a pour à, AltGr + u pour ù, AltGr + i pour ï, AltGr + d pour ê, AltGr + c pour ç. Faire AltGr + 6 puis la voyelle pour l'accent circonflexe.
- Verrouillage avec machine virtuelle : cliquer en dehors de la fenêtre VM pour libérer le curseur avant de verrouiller la session.
- Cybersécurité : scans de ports et tests d'intrusion strictement interdits sur l'infrastructure de l'école sans accord du staff (@Randria).