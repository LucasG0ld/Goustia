# Outil de proposition de recettes personnalisées

> Documents associés : [Architecture technique](docs/ARCHITECTURE_TECHNIQUE.md)
> et [étude des solutions IA freemium](docs/ETUDE_IA_FREEMIUM.md). La
> [roadmap complète](ROADMAP_PROJET.md) sert de liste de tâches exécutable et la
> [bibliothèque de prompts](PROMPTS_PROJET.md) guide sa réalisation.

## 1. Présentation du projet

L'application propose à chaque utilisateur des recettes et un planning de repas
personnalisés selon :

- ses contraintes alimentaires ;
- son âge ;
- son objectif nutritionnel ;
- le nombre de repas souhaité ;
- ses goûts et ses réactions aux recettes déjà proposées ;
- ses préférences pratiques, apprises progressivement.

L'application doit pouvoir générer des recettes, proposer une illustration des
plats et améliorer ses recommandations grâce aux likes, dislikes, remplacements
et autres interactions de l'utilisateur.

Le principe central de l'expérience est le suivant :

> La sécurité alimentaire est demandée immédiatement, tandis que les goûts sont
> appris progressivement.

---

## 2. Objectifs du produit

- Proposer rapidement des recettes adaptées à chaque utilisateur.
- Éviter un questionnaire initial trop long.
- Exclure strictement les ingrédients incompatibles avec les contraintes de
  l'utilisateur.
- Apprendre progressivement ses préférences.
- Permettre de remplacer facilement une suggestion inadaptée.
- Faciliter la préparation des repas et la création de la liste de courses.
- Limiter les répétitions et améliorer la pertinence des propositions dans le
  temps.

---

## 3. Inscription et onboarding

L'utilisateur doit pouvoir accéder à ses premières recettes en moins de deux
minutes. L'onboarding est donc limité aux informations indispensables.

### 3.1. Étape 1 — Création du compte

- Prénom
- Nom
- Adresse e-mail
- Mot de passe
- Confirmation du mot de passe
- Date de naissance
- Acceptation des conditions d'utilisation et de la politique de confidentialité

Fonctionnalités associées :

- Connexion
- Déconnexion
- Vérification facultative de l'adresse e-mail
- Mot de passe oublié
- Réinitialisation du mot de passe

La date de naissance permet notamment d'exclure automatiquement les recettes
contenant de l'alcool pour les utilisateurs mineurs.

### 3.2. Étape 2 — Sécurité alimentaire

Cette étape est obligatoire.

L'utilisateur peut renseigner :

- ses allergies ;
- ses intolérances ;
- les aliments strictement interdits pour une raison médicale, religieuse ou
  personnelle ;
- l'option « Je n'en ai pas ».

L'interface doit utiliser un champ de recherche avec suggestions pour éviter
d'afficher une liste trop longue.

Les informations doivent être distinguées clairement :

- **Allergie** : exclusion absolue.
- **Intolérance** : exclusion absolue ou configurable selon le besoin.
- **Interdiction** : exclusion absolue.
- **Ingrédient non apprécié** : préférence négative, mais pas une contrainte de
  sécurité.

### 3.3. Étape 3 — Besoin principal

L'utilisateur choisit un objectif :

- Perte de poids
- Alimentation équilibrée
- Prise de masse
- Aucun objectif particulier

Il indique également :

- le nombre de repas souhaité par semaine ;
- le nombre de personnes par repas.

### 3.4. Étape 4 — Premiers goûts

Cette étape est facultative.

L'application présente entre 8 et 12 cartes visuelles de plats et demande à
l'utilisateur d'en sélectionner quelques-uns qui lui donnent envie.

L'utilisateur peut :

- sélectionner par exemple trois plats ;
- ne rien sélectionner ;
- passer directement cette étape.

Après cette étape, l'utilisateur accède immédiatement à ses premières
recommandations.

### 3.5. Parcours d'onboarding retenu

```text
Création du compte
        ↓
Allergies et interdictions
        ↓
Objectif + nombre de repas + portions
        ↓
Choix visuel facultatif de quelques plats
        ↓
Premières recommandations
```

---

## 4. Profil alimentaire progressif

Les informations secondaires ne sont pas demandées pendant l'inscription. Elles
sont collectées progressivement, lorsqu'elles deviennent utiles.

### 4.1. Informations complémentaires

- Régime alimentaire :
  - Omnivore
  - Végétarien
  - Végan
  - Pescétarien
  - Sans porc
  - Autre
- Ingrédients préférés
- Ingrédients non appréciés
- Types de cuisine appréciés
- Niveau en cuisine
- Temps maximal de préparation
- Budget alimentaire approximatif
- Équipements disponibles : four, micro-ondes, mixeur, air fryer, etc.
- Préférences relatives aux petits-déjeuners, déjeuners, dîners et collations

### 4.2. Questions contextuelles

L'application peut poser une question courte au moment opportun :

- Après un dislike : « Qu'est-ce qui ne vous plaît pas ? »
- Après plusieurs recettes longues : « Voulez-vous privilégier les recettes de
  moins de 30 minutes ? »
- Lors d'un remplacement : « Que souhaitez-vous changer ? »
- Avant de proposer une recette nécessitant un four : « Avez-vous un four ? »
- Après plusieurs choix similaires : « Vous semblez aimer la cuisine italienne.
  En proposer davantage ? »

Chaque question secondaire doit pouvoir être ignorée.

### 4.3. Complétion du profil

Dans les paramètres, une section peut indiquer le niveau de complétion :

> Votre profil culinaire est complété à 40 %.

L'utilisateur peut volontairement enrichir les rubriques suivantes :

- Mes ingrédients préférés
- Ce que je n'aime pas
- Mon budget
- Mon temps disponible
- Mon matériel
- Mes cuisines favorites

La complétion du profil ne doit jamais bloquer l'accès aux recettes.

---

## 5. Page d'accueil

La page d'accueil présente le programme de repas de la semaine.

### 5.1. Informations affichées pour chaque recette

- Image du plat
- Nom de la recette
- Courte description
- Jour ou emplacement dans le planning
- Temps de préparation
- Niveau de difficulté
- Nombre de calories estimé
- Principaux macronutriments
- Tags : rapide, végétarien, riche en protéines, économique, etc.
- Résumé expliquant pourquoi la recette a été sélectionnée

### 5.2. Actions disponibles

- Aimer la recette
- Ne pas aimer la recette
- Remplacer la recette
- Déplacer la recette vers un autre jour
- Ajouter la recette aux favoris
- Indiquer que le plat a été cuisiné
- Ouvrir la fiche complète de la recette

---

## 6. Remplacement d'une recette

L'utilisateur peut remplacer une suggestion sans régénérer tout son planning.

Options envisagées :

- Remplacement immédiat
- Affichage de trois alternatives
- Demande libre, par exemple : « Je veux quelque chose de plus rapide »
- Conservation de certains critères :
  - calories ;
  - protéines ;
  - budget ;
  - temps de préparation ;
  - ingrédients principaux.

Une recette peut être verrouillée afin qu'elle soit conservée lors d'une
régénération du planning.

---

## 7. Fiche d'une recette

### 7.1. Informations générales

- Photo ou illustration du plat
- Nom
- Description
- Temps de préparation
- Temps de cuisson
- Difficulté
- Nombre de portions
- Coût estimé
- Calories et macronutriments estimés
- Allergènes éventuels
- Matériel nécessaire

### 7.2. Préparation

- Liste des ingrédients
- Quantités adaptées au nombre de personnes
- Étapes numérotées
- Minuteur pour certaines étapes
- Conseils
- Variantes
- Substitutions possibles
- Instructions de conservation et de réchauffage

### 7.3. Actions

- Aimer ou ne pas aimer
- Ajouter aux favoris
- Remplacer la recette dans le planning
- Modifier le nombre de portions
- Ajouter les ingrédients à la liste de courses
- Signaler une erreur ou une incohérence

---

## 8. Planning des repas

- Vue hebdomadaire
- Organisation par jour et type de repas
- Déplacement des recettes
- Ajout ou suppression d'un repas
- Remplacement d'un repas
- Régénération de toute la semaine
- Verrouillage des recettes à conserver
- Historique des semaines précédentes
- Types de repas :
  - Petit-déjeuner
  - Déjeuner
  - Dîner
  - Collation

---

## 9. Liste de courses

- Génération automatique à partir du planning
- Regroupement des ingrédients identiques
- Classement par rayon
- Ajustement selon le nombre de portions
- Possibilité d'indiquer les produits déjà disponibles
- Ajout manuel d'un produit
- Cases à cocher pendant les courses
- Export ou partage de la liste
- Estimation facultative du prix total

Une évolution future pourra permettre de gérer un garde-manger afin de
privilégier les ingrédients déjà disponibles.

---

## 10. Favoris et historique

### 10.1. Favoris

- Liste des recettes enregistrées
- Recherche
- Filtres
- Ajout manuel d'une recette favorite au planning

### 10.2. Historique

- Recettes déjà proposées
- Recettes cuisinées
- Notes et réactions données
- Dates de consommation
- Limitation des répétitions trop fréquentes

---

## 11. Apprentissage des préférences

Les actions ordinaires de l'utilisateur permettent d'enrichir son profil.

| Action                             | Information apprise                                         |
| ---------------------------------- | ----------------------------------------------------------- |
| Like                               | Plat, type de cuisine et ingrédients probablement appréciés |
| Dislike avec motif                 | Critère précis à éviter                                     |
| Remplacement                       | Recette inadaptée à cet instant                             |
| Ajout aux favoris                  | Préférence forte                                            |
| Plat déclaré comme cuisiné         | Intérêt confirmé                                            |
| Recette ignorée                    | Signal faible uniquement                                    |
| Demandes répétées de plats rapides | Préférence de durée                                         |
| Modification des portions          | Habitude du foyer                                           |

Une recette simplement ignorée ne doit pas être considérée automatiquement comme
non appréciée.

### 11.1. Motifs de dislike

Après un dislike, l'application peut demander :

- Je n'aime pas un ingrédient
- Trop long à préparer
- Trop compliqué
- Trop cher
- Déjà mangé récemment
- Le type de plat ne me plaît pas
- Autre raison

Cette précision est plus utile à la personnalisation qu'un simple dislike.

---

## 12. Profil et paramètres

L'utilisateur peut consulter et modifier :

- ses informations personnelles ;
- sa date de naissance ;
- son objectif alimentaire ;
- son nombre de repas ;
- son nombre habituel de portions ;
- ses allergies et exclusions ;
- ses aliments appréciés ou non appréciés ;
- son budget ;
- son temps disponible ;
- son niveau en cuisine ;
- ses équipements ;
- ses préférences de notification.

Il peut également :

- exporter ses données personnelles ;
- supprimer son compte ;
- consulter les informations relatives à la confidentialité.

---

## 13. Utilisation de l'intelligence artificielle

L'IA peut intervenir pour :

- générer des propositions de recettes ;
- adapter une recette aux préférences de l'utilisateur ;
- proposer des alternatives ;
- produire une description et des étapes de préparation ;
- comprendre une demande libre ;
- générer ou sélectionner une illustration du plat ;
- expliquer pourquoi une recette a été recommandée.

### 13.1. Données utilisées pour la personnalisation

- Profil alimentaire
- Allergies et interdictions
- Âge
- Objectif nutritionnel
- Likes et dislikes
- Motifs de rejet
- Ingrédients appréciés ou rejetés
- Favoris
- Temps disponible
- Budget
- Équipements
- Historique des repas
- Demandes écrites ponctuelles

### 13.2. Contrôles indispensables

Les résultats produits par l'IA doivent être contrôlés avant leur affichage :

- absence d'allergènes interdits ;
- absence d'aliments exclus ;
- absence d'alcool pour un utilisateur mineur ;
- cohérence entre les ingrédients et les étapes ;
- quantités plausibles ;
- détection des recettes dupliquées ou trop similaires ;
- valeurs nutritionnelles indiquées comme estimatives.

Pour les allergies et les interdictions, le système ne doit pas faire confiance
uniquement au texte généré par l'IA. Une validation basée sur des données
structurées est indispensable.

L'application ne doit pas se présenter comme un service médical. Les objectifs
nutritionnels et valeurs affichées restent indicatifs, sauf validation
ultérieure par des professionnels compétents.

### 13.3. IA gratuite et maîtrise des coûts

Une IA dite « gratuite » peut correspondre à :

- un service proposant un quota gratuit limité ;
- un modèle open source hébergé par le projet ;
- une offre gratuite temporaire ;
- une combinaison de génération locale et de services externes.

La génération de texte est généralement plus accessible que la génération
d'images à grande échelle. Le choix technique devra prendre en compte :

- les limites d'utilisation ;
- les performances ;
- le coût d'hébergement ;
- la confidentialité des données ;
- les licences ;
- la qualité des résultats ;
- la possibilité de changer de fournisseur.

Le système devra idéalement rester indépendant d'un fournisseur unique.

---

## 14. Images des plats

Deux approches peuvent coexister :

- sélectionner une image autorisée provenant d'une banque d'images ;
- générer une illustration avec une IA.

L'image doit être présentée comme illustrative, car le résultat réellement
cuisiné peut être différent.

Pour maîtriser les coûts, l'application pourra :

- réutiliser une image lorsqu'une même recette est proposée à plusieurs
  utilisateurs ;
- générer les images à l'avance ;
- utiliser une image générique temporaire ;
- réserver la génération d'une nouvelle image aux recettes inédites.

---

## 15. Interface d'administration

- Liste des utilisateurs
- Consultation des recettes générées
- Gestion des signalements
- Blocage d'ingrédients ou de recettes problématiques
- Suivi des générations IA
- Suivi des coûts et quotas
- Statistiques de likes, dislikes et remplacements
- Gestion des modèles ou fournisseurs d'IA
- Journal des erreurs

---

## 16. Pages du MVP

La première version fonctionnelle comprend :

1. Page de présentation
2. Inscription
3. Connexion
4. Mot de passe oublié
5. Onboarding alimentaire court
6. Accueil avec les repas de la semaine
7. Fiche d'une recette
8. Remplacement d'une recette
9. Planning hebdomadaire
10. Favoris
11. Liste de courses
12. Profil et préférences
13. Mentions légales
14. Politique de confidentialité
15. Conditions d'utilisation
16. Interface d'administration minimale

---

## 17. Boucle principale du MVP

```text
Inscription rapide
        ↓
Contraintes de sécurité et objectif
        ↓
Génération des repas de la semaine
        ↓
Like, dislike ou remplacement
        ↓
Apprentissage progressif des préférences
        ↓
Fiche recette et liste de courses
        ↓
Meilleures recommandations la semaine suivante
```

Le cœur du produit ne se limite pas à la génération de recettes. Il repose sur
la collecte progressive des préférences, la sécurité alimentaire et la capacité
à corriger facilement les recommandations.

---

## 18. Évolutions possibles après le MVP

- Application mobile
- Gestion de plusieurs profils dans un foyer
- Préférences différentes pour chaque membre de la famille
- Gestion du contenu du réfrigérateur ou du garde-manger
- Scan de produits
- Suggestions à partir d'une photo du réfrigérateur
- Import d'une recette depuis une URL
- Suivi détaillé des calories consommées
- Connexion avec des applications de santé
- Commande d'ingrédients auprès d'un supermarché
- Suggestions selon les promotions locales
- Assistant conversationnel de cuisine
- Commandes vocales pendant la préparation

---

## 19. Décisions validées à ce stade

- Le produit propose des recettes personnalisées et un planning hebdomadaire.
- Les utilisateurs peuvent aimer, ne pas aimer et remplacer les recettes.
- Un clic sur un plat ouvre sa fiche complète.
- Les contraintes alimentaires de sécurité sont collectées dès l'inscription.
- La date de naissance sert notamment à exclure l'alcool pour les mineurs.
- L'onboarding initial doit rester très court.
- Les préférences secondaires sont apprises progressivement.
- Les questions contextuelles peuvent être ignorées.
- Une liste de courses est générée depuis le planning.
- L'IA doit générer ou adapter les recettes et participer à la création des
  visuels.
- Les sorties de l'IA doivent être contrôlées par des règles métier et des
  données structurées.

---

## 20. Points à définir ultérieurement

- Nom et identité visuelle du produit
- Plateformes ciblées en priorité : web, mobile ou les deux
- Modèle économique
- Fournisseur ou modèle d'IA
- Source des données nutritionnelles
- Source ou méthode de génération des images
- Méthode exacte de calcul des recommandations
- Technologies utilisées
- Gestion précise des données sensibles
- Périmètre fonctionnel final de la première version
