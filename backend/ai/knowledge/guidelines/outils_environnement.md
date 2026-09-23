# Outils de Développement et Dépannage Environnement (42 Angoulême)
Gestion des paquets, configuration des environnements de dev et résolutions des pannes courantes sur les postes.

## Gestion des paquets et interdiction de désinstallation
- Paquets manquants : ouvrir un ticket sur Rusty pour demander l'installation globale d'une bibliothèque. En cas d'urgence, utiliser un conteneur Docker ou une machine virtuelle.
- Installation via Flatpak : gestionnaire disponible pour installer des applications utilisateur dans son home (« flatpak install --user flathub <nom> » et mise à jour avec « flatpak update --user flathub <nom> »).
- Interdiction stricte : désinstaller une application préinstallée par l'école (VS Code, Vim, Chrome, Brave, Spotify...) est formellement interdit et sanctionné par 2 heures de TIG.

## Dépannage des applications courantes (Chrome, VS Code, Keyring)
- Blocage Google Chrome : supprimer les verrous Singleton avec « rm -rf ~/.config/google-chrome/Singleton* » (ou créer un alias « fix_chrome » dans son .zshrc / .bashrc).
- Commande « code » introuvable : ajouter l'alias « alias code='flatpak run com.visualstudio.code' » dans son fichier de configuration shell (.zshrc ou .bashrc) puis le sourcer.
- Conflit de trousseau (Keyring daemon) : après un changement de mot de passe, réinitialiser avec « killall -9 gnome-keyring-daemon » puis « rm -rf ~/.local/share/keyrings » avant de relancer les applications.
- Liens non fonctionnels : vérifier et réassigner le navigateur par défaut dans « Default Applications » sur Ubuntu.
- Terminal gelé : un appui accidentel sur Ctrl + S fige l'affichage du terminal ; appuyer sur Ctrl + Q pour le débloquer.

## Gestionnaires de versions (Node.js, Python, Ruby, Rust, Go)
Pour ne pas saturer le système global, chaque étudiant installe ses propres versions d'outils en espace utilisateur :
- Node.js et npm : installation via NVM (« curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash »), puis gestion par « nvm install <version> » et « nvm use <version> ».
- Python : gestion des versions recommandée via Pyenv.
- Ruby : gestion recommandée via RVM.
- Rust : installation et chaîne de compilation via Rustup.
- Go : gestion recommandée via l'outil g.

## Outils graphiques, virtualisation et IA locale
- Godot 4 : exécuter avec le moteur OpenGL en cas de problème graphique via la commande « godot-4 --verbose --rendering-driver opengl3 ».
- Virtualisation Libvirt : ouvrir le gestionnaire de machines virtuelles avec « virt-manager --connect qemu:///session ».
- Ollama local : installé sur les postes physiques, mais l'usage via Docker reste recommandé pour isoler les projets d'équipe et assurer la portabilité lors des soutenances.

## Header standard 42 sur NeoVIM
Configuration du header officiel pour NeoVIM :
1. Créer le dossier : « mkdir -p ~/.config/nvim/plugin »
2. Copier le script de Vim : « cp /etc/vim/autoload/plugin/stdheader.vim ~/.config/nvim/plugin/stdheader.vim »
3. Configurer les variables d'environnement dans « ~/.config/nvim/init.lua » avec :
   vim.g.user42 = vim.env.USER
   vim.g.mail42 = vim.env.MAIL