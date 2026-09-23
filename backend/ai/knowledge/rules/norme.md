# La Norme 42 (Version 4.1)
Règlement officiel de programmation en langage C applicable au Common Core de 42.

## Rôle de la Norminette et règles non automatisées
La Norminette est un outil open source en Python qui vérifie la conformité du code. Certaines règles subjectives ne sont pas vérifiables par la Norminette (marquées d'un astérisque dans le sujet) : elles doivent obligatoirement être vérifiées par le pair lors des soutenances. Le non-respect d'une règle subjective entraîne un échec immédiat du projet par le flag « Norme ».

## Fonctions et fichiers (limites chiffrées)
- Taille maximale d'une fonction : 25 lignes au maximum (sans compter les accolades ouvrantes et fermantes de la fonction).
- Nombre de fonctions par fichier : 5 définitions de fonctions au maximum par fichier .c.
- Séparation des fonctions : au moins une ligne vide obligatoire entre deux fonctions.
- Paramètres : 4 paramètres nommés au maximum par fonction. Une fonction sans argument doit obligatoirement avoir « void » comme paramètre.
- Prototypes : les paramètres doivent obligatoirement être nommés dans les prototypes (les types seuls sont interdits).
- Variables : 5 variables locales au maximum déclarées par fonction.
- Valeur de retour : l'instruction « return » doit obligatoirement être entre parenthèses (ex : return (0);), sauf si la fonction est void.
- Type et nom : une tabulation unique sépare le type de retour et le nom de la fonction.

## Instructions et mots-clés interdits
Sont strictement interdits sous peine de faute de norme :
- Les boucles « for » et « do...while ».
- Les structures de contrôle « switch » et « case ».
- Les instructions de saut « goto ».
- Les opérateurs ternaires (ex : condition ? vrai : faux).
- Les VLA (Variable Length Arrays, ex : int tab[variable];).
- Les déclarations avec types implicites.
- Les affectations à l'intérieur d'une condition ou structure de contrôle.

## Formatage et indentation du code
- Indentation : tabulation stricte de 4 colonnes (caractère ASCII 9 obligatoire, interdiction d'utiliser 4 espaces).
- Largeur de ligne : 80 colonnes au maximum par ligne (commentaires inclus). Une tabulation compte pour le nombre d'espaces qu'elle représente.
- Découpage de lignes longues : si une instruction est coupée sur plusieurs lignes, les lignes suivantes sont indentées et l'opérateur doit obligatoirement être au début de la nouvelle ligne.
- Accolades : chaque accolade doit être seule sur sa propre ligne (sauf déclarations de struct, enum et union).
- Structures de contrôle : les structures (if, while) doivent obligatoirement utiliser des accolades, sauf si elles contiennent une seule instruction sur une seule ligne.
- Espaces : aucun espace en fin de ligne. Jamais deux espaces consécutifs. Jamais deux lignes vides consécutives.
- Opérateurs : un seul espace autour des opérateurs et après les virgules ou points-virgules.

## Déclarations de variables et typage
- Emplacement : toutes les déclarations de variables doivent se trouver obligatoirement au début de la fonction.
- Séparation : une ligne vide obligatoire sépare la fin des déclarations de variables du reste du code. Aucune autre ligne vide n'est autorisée dans le corps d'une fonction.
- Initialisation : interdiction formelle d'initialiser une variable sur la même ligne que sa déclaration (sauf pour les variables globales autorisées, les variables statiques et les constantes).
- Déclarations uniques : une seule déclaration de variable par ligne. Tous les noms de variables doivent être alignés sur la même colonne dans leur portée.
- Pointeurs : l'étoile (*) du pointeur doit être collée au nom de la variable (ex : char *str;).

## Conventions de nommage (snake_case et préfixes)
Tous les identifiants (fonctions, variables, types) doivent être rédigés en anglais, explicites, en minuscules et séparés par des underscores (snake_case). Les préfixes obligatoires sont :
- Structure : préfixe « s_ » (ex : struct s_list).
- Typedef : préfixe « t_ » (ex : t_list).
- Union : préfixe « u_ » (ex : u_data).
- Enum : préfixe « e_ » (ex : e_status).
- Variable globale : préfixe « g_ » (ex : g_signal). Les variables globales non static ou non const sont interdites sauf mention explicite dans le sujet.
- Caractères autorisés : table ASCII standard uniquement. Caractères non-ASCII (accents, caractères spéciaux) interdits en dehors des chaînes et caractères littéraux.

## Fichiers d'en-tête (headers .h)
- Les headers ne doivent contenir que : inclusions de bibliothèques, déclarations, macros, définitions (#define) et prototypes.
- Protection contre la double inclusion obligatoire (#ifndef FT_FILE_H, #define FT_FILE_H, #endif).
- Interdiction formelle d'inclure un fichier .c dans un autre fichier .c ou dans un header .h.
- Interdiction de déclarer une structure dans un fichier .c (les structures vont obligatoirement dans les .h).
- L'inclusion de bibliothèques non utilisées est interdite.

## Macros et préprocesseur
- Constantes : les #define créés doivent servir uniquement à définir des valeurs littérales et constantes.
- Contournement interdit : tout #define créé pour contourner la norme ou masquer/obfusquer du code est formellement interdit.
- Format : les noms de macros doivent être entièrement en majuscules (UPPERCASE).
- Macros multilignes : strictement interdites.
- Portée : les instructions de préprocesseur (#define, #include, etc.) sont interdites à l'intérieur des fonctions (scope global obligatoire).
- Indentation : les directives doivent être indentées à l'intérieur des blocs conditionnels (#if, #ifdef, #ifndef).

## Header standard 42 et commentaires
- Header 42 : chaque fichier .c et .h doit commencer immédiatement par le header standard 42 mis à jour (login, email étudiant @student.campus, dates de création et de modification).
- Commentaires : les commentaires sont strictement interdits à l'intérieur du corps des fonctions. Ils doivent se trouver en fin de ligne ou hors des fonctions.
- Langue : les commentaires doivent être rédigés en anglais et être utiles (ne pas servir à justifier une fonction « fourre-tout » ou mal découpée).

## Règles obligatoires du Makefile
Les Makefiles ne sont pas testés par la Norminette et doivent être vérifiés par le correcteur lors de la soutenance :
- Règles obligatoires : $(NAME), all, clean, fclean, re.
- Règle par défaut : la règle « all » doit être la règle par défaut déclenchée par un simple « make ».
- Relink interdit : si le Makefile recompile des fichiers alors que les sources n'ont pas changé (relink), le projet est considéré comme non fonctionnel (note 0).
- Multi-binaires : pour un projet générant plusieurs exécutables, une règle dédiée doit exister pour chaque binaire, et la règle « all » doit tous les compiler.
- Fichiers explicites : interdiction d'utiliser des jokers (wildcards) comme *.c ou *.o. Tous les fichiers sources doivent être listés explicitement.
- Sous-bibliothèques : si le projet dépend d'une bibliothèque locale (ex : libft), le Makefile doit la compiler automatiquement.