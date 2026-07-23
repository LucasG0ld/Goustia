# Roadmap complète — Application de recettes personnalisées

Ce document transforme le [cahier des charges](CAHIER_DES_CHARGES.md),
l'[architecture technique](docs/ARCHITECTURE_TECHNIQUE.md) et
l'[étude des solutions IA](docs/ETUDE_IA_FREEMIUM.md) en tâches exécutables.

Dernière mise à jour : 23 juillet 2026

---

## 1. Convention de suivi

### Priorités

- **P0** : indispensable pour ouvrir le MVP au public.
- **P1** : nécessaire pour obtenir une version web complète et solide.
- **P2** : évolution post-MVP ou amélioration avancée.

### États

- `[ ]` À faire
- `[x]` Terminé

### Jalons

| Jalon | Résultat attendu                                         |
| ----- | -------------------------------------------------------- |
| M0    | Cadrage produit finalisé                                 |
| M1    | Fondations techniques et environnements prêts            |
| M2    | Comptes, sécurité alimentaire et onboarding fonctionnels |
| M3    | Génération et validation des recettes fonctionnelles     |
| M4    | Expérience principale web fonctionnelle                  |
| M5    | MVP web prêt pour une bêta privée                        |
| M6    | Version web publique et stabilisée                       |
| M7    | Applications iOS et Android publiables                   |
| M8    | Fonctionnalités avancées déployées                       |

---

## 2. Définition globale de « terminé »

Une fonctionnalité est terminée lorsque :

- [ ] Son comportement attendu est documenté.
- [ ] Les cas nominaux et les erreurs sont traités.
- [ ] Les entrées sont validées côté client et côté serveur.
- [ ] Les droits d'accès sont contrôlés côté serveur et en base.
- [ ] Les états de chargement, vide et erreur sont présents.
- [ ] L'interface fonctionne sur mobile, tablette et ordinateur.
- [ ] La navigation au clavier et les lecteurs d'écran sont pris en compte.
- [ ] Les textes utilisateur sont disponibles en français.
- [ ] Les tests pertinents sont écrits et passent.
- [ ] Le lint, le typage et le build passent.
- [ ] Aucun secret ou donnée personnelle inutile n'est journalisé.
- [ ] Les événements nécessaires au suivi produit sont ajoutés.
- [ ] La documentation concernée est mise à jour.

---

# PARTIE A — MVP WEB

## 3. M0 — Finaliser le cadrage produit

### 3.1. Identité du produit — P0

- [ ] Choisir le nom définitif de l'application.
- [ ] Vérifier la disponibilité du nom de domaine.
- [ ] Vérifier la disponibilité du nom sur les stores mobiles.
- [ ] Définir le logo et l'icône.
- [ ] Définir les couleurs, typographies et principes visuels.
- [ ] Définir le ton éditorial de l'application.
- [ ] Définir la manière de présenter les images générées comme illustratives.

### 3.2. Décisions produit — P0

- [ ] Définir précisément le public cible initial.
- [ ] Définir l'âge minimum autorisé pour créer un compte.
- [ ] Décider si un mineur doit obtenir une autorisation parentale.
- [ ] Définir les pays accessibles lors du lancement.
- [ ] Définir les types de repas disponibles dans le MVP.
- [ ] Définir le nombre maximal de repas générés par semaine.
- [ ] Définir le nombre maximal de personnes par repas.
- [ ] Définir la fréquence maximale de régénération.
- [ ] Définir les critères exacts des objectifs perte de poids, équilibre et
      prise de masse.
- [ ] Décider si les objectifs nutritionnels utilisent des fourchettes ou des
      valeurs précises.
- [ ] Définir la politique de répétition des recettes.
- [ ] Définir le comportement d'un dislike sans motif.
- [ ] Définir le comportement d'un remplacement demandé plusieurs fois.
- [ ] Définir les fonctionnalités disponibles sans compte.
- [ ] Décider si l'adresse e-mail doit être vérifiée avant la génération.

### 3.3. Mesure du succès — P0

- [ ] Choisir les indicateurs du MVP.
- [ ] Définir le taux cible de fin d'onboarding.
- [ ] Mesurer le délai entre inscription et premières recettes.
- [ ] Mesurer likes, dislikes et remplacements.
- [ ] Mesurer le nombre de recettes réellement cuisinées.
- [ ] Mesurer le taux de retour d'une semaine à l'autre.
- [ ] Mesurer le coût IA par utilisateur actif.
- [ ] Définir les seuils d'alerte sur les erreurs et les coûts.

---

## 4. M1 — Consolider les fondations techniques

### 4.1. Dépôt et qualité — P0

- [x] Créer le monorepo npm.
- [x] Créer l'application Next.js avec TypeScript.
- [x] Créer le paquet métier partagé `@recettes/domain`.
- [x] Configurer ESLint.
- [x] Configurer Tailwind CSS.
- [x] Configurer Vitest.
- [x] Ajouter une commande globale de vérification.
- [x] Ajouter un endpoint `/api/v1/health`.
- [x] Initialiser le dépôt Git à la racine.
- [x] Définir la stratégie de branches.
- [x] Ajouter un formatteur de code et sa vérification.
- [x] Ajouter les conventions de commits.
- [x] Ajouter des modèles d'issues et de pull requests.
- [x] Mettre en place une vérification des dépendances.
- [x] Résoudre ou accepter formellement les alertes npm existantes.
- [x] Ajouter Renovate ou Dependabot.

### 4.2. Intégration continue — P0

- [x] Créer le workflow de CI.
- [x] Exécuter lint, typecheck et tests sur chaque pull request.
- [x] Exécuter le build de production en CI.
- [x] Mettre en cache les dépendances npm.
- [ ] Bloquer la fusion lorsqu'un contrôle échoue.
- [x] Ajouter les tests de migrations Supabase.
- [ ] Ajouter les tests Playwright lorsqu'ils seront disponibles.
- [x] Générer un rapport de couverture des tests.

### 4.3. Environnements — P0

- [x] Créer les environnements local, test, staging et production.
- [ ] Créer un projet Supabase de développement.
- [ ] Créer un projet Supabase de staging.
- [x] Prévoir un projet Supabase de production séparé.
- [x] Choisir l'hébergeur Next.js.
- [ ] Créer le projet de déploiement web.
- [ ] Configurer les domaines de staging et de production.
- [x] Configurer les variables d'environnement par environnement.
- [x] Documenter la rotation des secrets.
- [x] Vérifier qu'aucune clé privée n'est exposée au navigateur.
- [ ] Configurer des budgets et limites chez les fournisseurs externes.

### 4.4. Supabase local et migrations — P0

- [x] Installer et configurer la CLI Supabase.
- [x] Initialiser le dossier `supabase/`.
- [x] Configurer Supabase en local.
- [x] Définir la convention de nommage des migrations.
- [x] Ajouter la commande de création d'une migration.
- [x] Ajouter la commande de réinitialisation de la base locale.
- [x] Ajouter un jeu de données de développement.
- [x] Générer les types TypeScript depuis PostgreSQL.
- [x] Vérifier les migrations dans une base vide.
- [x] Documenter la procédure de restauration.

### 4.5. Observabilité — P0

- [x] Choisir un outil de suivi des erreurs.
- [x] Configurer le suivi des erreurs côté navigateur.
- [x] Configurer le suivi des erreurs côté serveur.
- [x] Ajouter des identifiants de corrélation aux requêtes.
- [x] Définir un format de logs structurés.
- [x] Masquer les données personnelles dans les logs.
- [x] Définir les niveaux de logs.
- [x] Ajouter un suivi des performances web.
- [ ] Ajouter un tableau de bord de disponibilité de l'API.
- [ ] Ajouter des alertes sur les échecs de génération IA.

---

## 5. M1 — Concevoir l'expérience et le design system

### 5.1. Parcours et wireframes — P0

- [x] Cartographier le parcours visiteur.
- [x] Cartographier le parcours d'inscription.
- [x] Cartographier l'onboarding court.
- [x] Cartographier la première génération.
- [x] Cartographier le like, dislike et remplacement.
- [x] Cartographier le planning hebdomadaire.
- [x] Cartographier la liste de courses.
- [x] Cartographier la modification du profil.
- [x] Cartographier les erreurs et interruptions de génération.
- [x] Produire les wireframes pour mobile, tablette et ordinateur.
- [ ] Tester les wireframes avec quelques utilisateurs cibles.
- [ ] Corriger les principaux points de friction.

### 5.2. Design system — P0

- [ ] Définir les couleurs sémantiques.
- [ ] Définir l'échelle typographique.
- [ ] Définir espacements, rayons, bordures et ombres.
- [ ] Définir les états focus, hover, actif et désactivé.
- [ ] Créer les boutons.
- [ ] Créer les champs, listes et sélecteurs.
- [ ] Créer les cases à cocher et boutons radio.
- [ ] Créer les modales et panneaux.
- [ ] Créer les alertes et notifications temporaires.
- [ ] Créer les squelettes de chargement.
- [ ] Créer les cartes de recettes.
- [ ] Créer les badges alimentaires.
- [ ] Créer le composant de progression d'onboarding.
- [ ] Créer les états vides et d'erreur.
- [ ] Documenter l'utilisation des composants.

### 5.3. Accessibilité dès la conception — P0

- [ ] Définir un objectif WCAG 2.2 niveau AA.
- [ ] Vérifier les contrastes.
- [ ] Définir une hiérarchie de titres cohérente.
- [ ] Prévoir des libellés explicites pour tous les contrôles.
- [ ] Prévoir la navigation complète au clavier.
- [ ] Prévoir les annonces des changements dynamiques.
- [ ] Éviter de transmettre une information uniquement par la couleur.
- [ ] Prévoir une réduction des animations.
- [ ] Définir des textes alternatifs pour les images utiles.

---

## 6. M1 — Concevoir le modèle de données

### 6.1. Utilisateurs et préférences — P0

- [ ] Créer la table des profils.
- [ ] Lier les profils à `auth.users`.
- [ ] Stocker prénom et nom.
- [ ] Stocker la date de naissance avec le minimum de précision nécessaire.
- [ ] Stocker l'objectif nutritionnel.
- [ ] Stocker le nombre de repas par semaine.
- [ ] Stocker le nombre habituel de portions.
- [ ] Stocker le statut de l'onboarding.
- [ ] Créer la table des préférences culinaires.
- [ ] Créer la table des équipements.
- [ ] Créer la table des préférences de durée.
- [ ] Créer la table des préférences de budget.

### 6.2. Ingrédients et sécurité alimentaire — P0

- [ ] Créer la table des ingrédients canoniques.
- [ ] Créer la table des synonymes d'ingrédients.
- [ ] Créer la table des allergènes.
- [ ] Créer les relations ingrédient-allergène.
- [ ] Créer la hiérarchie des ingrédients et dérivés.
- [ ] Créer la table des contraintes utilisateur.
- [ ] Distinguer allergie, intolérance, interdiction et dislike.
- [ ] Stocker la sévérité ou le caractère absolu d'une contrainte.
- [ ] Ajouter les index de recherche des ingrédients.
- [ ] Ajouter une recherche tolérante aux accents et fautes simples.

### 6.3. Recettes — P0

- [ ] Créer la table des recettes.
- [ ] Créer la table des ingrédients d'une recette.
- [ ] Créer la table des étapes.
- [ ] Créer les catégories et tags.
- [ ] Stocker les portions.
- [ ] Stocker les durées.
- [ ] Stocker la difficulté.
- [ ] Stocker le coût estimé.
- [ ] Stocker les données nutritionnelles calculées.
- [ ] Stocker la provenance de la recette.
- [ ] Stocker le modèle IA et la version du prompt.
- [ ] Stocker le statut de validation.
- [ ] Stocker le statut de publication.
- [ ] Stocker le hash de déduplication.
- [ ] Stocker l'image et son statut.
- [ ] Prévoir le versionnement d'une recette.

### 6.4. Planning et interactions — P0

- [ ] Créer la table des plannings.
- [ ] Créer la table des repas planifiés.
- [ ] Stocker le jour et le type de repas.
- [ ] Stocker le nombre de portions par repas.
- [ ] Stocker le verrouillage d'un repas.
- [ ] Créer la table des réactions.
- [ ] Stocker likes et dislikes.
- [ ] Stocker les motifs de dislike.
- [ ] Stocker les remplacements.
- [ ] Stocker les recettes cuisinées.
- [ ] Créer la table des favoris.
- [ ] Empêcher les favoris en double.

### 6.5. Courses, IA et administration — P0

- [ ] Créer la table des listes de courses.
- [ ] Créer la table des éléments de courses.
- [ ] Stocker la quantité, l'unité et l'état coché.
- [ ] Créer la table des tâches de génération IA.
- [ ] Stocker statut, tentatives et erreurs techniques.
- [ ] Stocker fournisseur, modèle, durée et consommation.
- [ ] Créer les tables de quotas.
- [ ] Créer la table des signalements.
- [ ] Créer une piste d'audit d'administration.
- [ ] Définir les rôles utilisateur et administrateur.

### 6.6. Sécurité PostgreSQL — P0

- [ ] Activer RLS sur chaque table exposée.
- [ ] Écrire les politiques de lecture par propriétaire.
- [ ] Écrire les politiques d'insertion par propriétaire.
- [ ] Écrire les politiques de modification par propriétaire.
- [ ] Écrire les politiques de suppression par propriétaire.
- [ ] Écrire les politiques propres aux administrateurs.
- [ ] Révoquer les droits inutiles des rôles `anon` et `authenticated`.
- [ ] Tester les tentatives d'accès entre deux utilisateurs.
- [ ] Tester les accès sans session.
- [ ] Tester les fonctions et vues avec RLS.
- [ ] Ajouter les index nécessaires aux politiques.

---

## 7. M2 — Authentification, compte et conformité

### 7.1. Authentification — P0

- [ ] Configurer Supabase Auth pour le web.
- [ ] Ajouter le client navigateur.
- [ ] Finaliser le client serveur.
- [ ] Ajouter le proxy de rafraîchissement de session.
- [ ] Implémenter l'inscription par e-mail et mot de passe.
- [ ] Implémenter la connexion.
- [ ] Implémenter la déconnexion.
- [ ] Implémenter la vérification d'adresse e-mail.
- [ ] Implémenter le mot de passe oublié.
- [ ] Implémenter la réinitialisation du mot de passe.
- [ ] Protéger les routes authentifiées avec des claims vérifiés.
- [ ] Rediriger correctement après authentification.
- [ ] Gérer session expirée et compte supprimé.
- [ ] Ajouter une limitation de débit sur les routes d'authentification.
- [ ] Tester tous les flux d'authentification.

### 7.2. Gestion du compte — P0

- [ ] Afficher les informations du compte.
- [ ] Permettre la modification du nom et du prénom.
- [ ] Permettre la modification de l'adresse e-mail.
- [ ] Permettre la modification du mot de passe.
- [ ] Permettre la déconnexion de toutes les sessions.
- [ ] Implémenter la suppression du compte.
- [ ] Définir le délai et la méthode de suppression.
- [ ] Supprimer ou anonymiser les données associées.
- [ ] Implémenter l'export des données personnelles.

### 7.3. RGPD et documents légaux — P0

- [ ] Cartographier les données collectées.
- [ ] Définir la base légale de chaque traitement.
- [ ] Définir les durées de conservation.
- [ ] Rédiger la politique de confidentialité.
- [ ] Rédiger les conditions d'utilisation.
- [ ] Rédiger les mentions légales.
- [ ] Rédiger l'information spécifique aux données alimentaires.
- [ ] Rédiger l'avertissement nutritionnel et médical.
- [ ] Documenter les sous-traitants.
- [ ] Vérifier les transferts de données hors UE.
- [ ] Définir la gestion des demandes d'accès et de suppression.
- [ ] Définir la gestion des mineurs et du consentement parental.
- [ ] Mettre en place le consentement aux cookies non essentiels si nécessaire.
- [ ] Ajouter un registre des versions acceptées des documents.
- [ ] Faire valider les documents par un professionnel compétent.

---

## 8. M2 — Onboarding court et profil progressif

### 8.1. Étape compte — P0

- [ ] Créer l'écran d'inscription.
- [ ] Ajouter prénom, nom, e-mail et mot de passe.
- [ ] Ajouter la date de naissance.
- [ ] Valider les champs côté client et serveur.
- [ ] Calculer l'âge sans envoyer la date de naissance à l'IA.
- [ ] Enregistrer l'acceptation des documents légaux.
- [ ] Afficher des erreurs compréhensibles.

### 8.2. Étape sécurité alimentaire — P0

- [ ] Créer la recherche d'allergies et d'interdictions.
- [ ] Proposer les ingrédients les plus fréquents.
- [ ] Permettre l'option « Je n'en ai pas ».
- [ ] Distinguer visuellement allergies, intolérances et interdictions.
- [ ] Expliquer la différence entre sécurité et préférence.
- [ ] Empêcher une contrainte contradictoire.
- [ ] Confirmer les contraintes avant de continuer.
- [ ] Enregistrer les exclusions strictes.

### 8.3. Étape objectif — P0

- [ ] Afficher les quatre objectifs nutritionnels.
- [ ] Expliquer brièvement chaque objectif.
- [ ] Demander le nombre de repas par semaine.
- [ ] Demander le nombre de personnes.
- [ ] Valider les limites définies par le produit.
- [ ] Enregistrer les choix.

### 8.4. Premiers goûts — P0

- [ ] Préparer un jeu de cartes de plats.
- [ ] Afficher 8 à 12 cartes accessibles.
- [ ] Permettre une sélection multiple.
- [ ] Permettre de passer l'étape.
- [ ] Enregistrer les premiers signaux positifs.
- [ ] Ne pas traiter une carte ignorée comme un dislike.

### 8.5. Progression et reprise — P0

- [ ] Afficher une progression courte.
- [ ] Enregistrer chaque étape indépendamment.
- [ ] Permettre de reprendre après interruption.
- [ ] Empêcher l'accès aux recommandations sans contraintes validées.
- [ ] Déclencher la première génération après l'onboarding.
- [ ] Afficher un écran d'attente utile pendant la génération.
- [ ] Mesurer l'abandon à chaque étape.

### 8.6. Profil progressif — P1

- [ ] Calculer un taux de complétion du profil.
- [ ] Ajouter les ingrédients appréciés.
- [ ] Ajouter les ingrédients non appréciés.
- [ ] Ajouter les cuisines favorites.
- [ ] Ajouter le niveau en cuisine.
- [ ] Ajouter le temps maximal de préparation.
- [ ] Ajouter le budget.
- [ ] Ajouter les équipements disponibles.
- [ ] Créer les questions contextuelles.
- [ ] Permettre d'ignorer chaque question secondaire.
- [ ] Limiter la fréquence des sollicitations.

---

## 9. M2 — Référentiel alimentaire et nutrition

### 9.1. Taxonomie des ingrédients — P0

- [ ] Choisir une nomenclature interne stable.
- [ ] Importer une première liste d'ingrédients.
- [ ] Ajouter les synonymes français.
- [ ] Ajouter pluriels et variantes orthographiques.
- [ ] Ajouter les familles d'ingrédients.
- [ ] Ajouter les dérivés allergènes.
- [ ] Ajouter les ingrédients contenant de l'alcool.
- [ ] Ajouter les interdictions fréquentes.
- [ ] Ajouter les unités compatibles.
- [ ] Créer un processus de correction par l'administration.

### 9.2. Données Ciqual — P0

- [ ] Télécharger la version 2025 des données Ciqual.
- [ ] Vérifier la licence et les obligations d'attribution.
- [ ] Créer le script d'import.
- [ ] Stocker les références Ciqual nécessaires.
- [ ] Faire correspondre les ingrédients internes à Ciqual.
- [ ] Gérer les aliments sans correspondance.
- [ ] Gérer les valeurs manquantes ou traces.
- [ ] Versionner la source nutritionnelle.
- [ ] Tester l'import complet.

### 9.3. Calcul nutritionnel — P0

- [ ] Définir les nutriments affichés.
- [ ] Normaliser grammes, millilitres et unités.
- [ ] Créer les tables de conversion.
- [ ] Calculer les valeurs par ingrédient.
- [ ] Calculer les valeurs par recette.
- [ ] Calculer les valeurs par portion.
- [ ] Gérer les pertes ou gains de masse lorsque pertinent.
- [ ] Indiquer clairement que les résultats sont estimatifs.
- [ ] Définir un seuil d'acceptation des données manquantes.
- [ ] Rejeter ou masquer un calcul trop incertain.
- [ ] Écrire les tests sur les calculs.

### 9.4. Moteur de contrôle alimentaire — P0

- [ ] Détecter un ingrédient strictement exclu.
- [ ] Détecter ses synonymes.
- [ ] Détecter ses dérivés connus.
- [ ] Détecter les allergènes indirects.
- [ ] Détecter l'alcool.
- [ ] Appliquer la règle liée à l'âge.
- [ ] Distinguer exclusion stricte et préférence négative.
- [ ] Produire un rapport de validation lisible.
- [ ] Bloquer l'enregistrement d'une recette dangereuse.
- [ ] Recontrôler avant l'affichage à l'utilisateur.
- [ ] Écrire un corpus de tests de sécurité.

---

## 10. M3 — Pipeline de génération IA

### 10.1. Accès fournisseurs — P0

- [ ] Créer le compte GroqCloud.
- [ ] Créer le compte Cloudflare.
- [ ] Créer des clés distinctes pour développement et production.
- [ ] Appliquer le principe du moindre privilège aux clés.
- [ ] Activer Zero Data Retention chez Groq si disponible pour le compte.
- [ ] Configurer les limites de consommation.
- [ ] Ajouter les secrets aux environnements.
- [ ] Vérifier la rotation des clés.
- [ ] Documenter la procédure en cas de compromission.

### 10.2. Contrats du domaine — P0

- [ ] Définir `RecipeGenerationInput`.
- [ ] Définir le schéma complet d'une recette.
- [ ] Définir ingrédients, quantités et unités.
- [ ] Définir les étapes structurées.
- [ ] Définir les métadonnées nutritionnelles attendues.
- [ ] Définir allergènes et exclusions détectés.
- [ ] Définir le prompt visuel.
- [ ] Définir le rapport de génération.
- [ ] Versionner les schémas.
- [ ] Écrire des tests de validation Zod.

### 10.3. Abstraction des fournisseurs — P0

- [ ] Créer l'interface `RecipeGenerator`.
- [ ] Créer l'interface `RecipeImageGenerator`.
- [ ] Créer une fabrique pilotée par variables d'environnement.
- [ ] Ajouter l'adaptateur Groq.
- [ ] Ajouter l'adaptateur texte Cloudflare.
- [ ] Ajouter l'adaptateur image Cloudflare.
- [ ] Normaliser les erreurs des fournisseurs.
- [ ] Ajouter les délais d'expiration.
- [ ] Ajouter les retries avec attente progressive.
- [ ] Ajouter un coupe-circuit.
- [ ] Ajouter un fournisseur factice pour les tests.

### 10.4. Prompts — P0

- [ ] Rédiger le prompt système de génération.
- [ ] Interdire explicitement les ingrédients exclus.
- [ ] Interdire l'alcool lorsque nécessaire.
- [ ] Imposer le français.
- [ ] Imposer des quantités réalistes.
- [ ] Imposer la cohérence entre ingrédients et étapes.
- [ ] Imposer le schéma structuré.
- [ ] Demander un prompt d'image sans donnée utilisateur.
- [ ] Ajouter quelques exemples de qualité.
- [ ] Versionner chaque prompt.
- [ ] Créer un changelog des prompts.

### 10.5. Orchestration — P0

- [ ] Créer la route de demande de génération.
- [ ] Vérifier l'identité et le quota de l'utilisateur.
- [ ] Construire un profil pseudonymisé.
- [ ] Ne transmettre aucune donnée personnelle directe.
- [ ] Générer les recettes par lot.
- [ ] Valider le JSON reçu.
- [ ] Normaliser les ingrédients.
- [ ] Exécuter le contrôle alimentaire.
- [ ] Calculer les valeurs nutritionnelles.
- [ ] Vérifier la cohérence des étapes.
- [ ] Dédupliquer les recettes.
- [ ] Rejeter et régénérer un résultat invalide.
- [ ] Limiter le nombre de tentatives.
- [ ] Enregistrer uniquement les recettes validées.
- [ ] Mettre à jour l'état de la tâche.
- [ ] Informer l'interface de la progression.
- [ ] Gérer proprement une panne du fournisseur.

### 10.6. Génération des images — P0

- [ ] Définir le style visuel des plats.
- [ ] Définir un modèle de prompt photographique.
- [ ] Générer une image uniquement après validation de la recette.
- [ ] Appeler FLUX.2 Klein 4B.
- [ ] Vérifier format, poids et dimensions.
- [ ] Compresser ou convertir l'image si nécessaire.
- [ ] Ajouter les métadonnées utiles.
- [ ] Stocker l'image dans Supabase Storage.
- [ ] Associer l'image à la recette canonique.
- [ ] Mettre en cache et réutiliser l'image.
- [ ] Ajouter une image générique en cas d'échec.
- [ ] Ajouter une régénération réservée aux administrateurs.
- [ ] Tester FLUX.1 Schnell comme solution de secours.
- [ ] Afficher que l'image est illustrative.

### 10.7. Quotas et coûts — P0

- [ ] Définir un quota de génération par utilisateur.
- [ ] Définir un quota global quotidien.
- [ ] Comptabiliser les appels texte.
- [ ] Comptabiliser les appels image.
- [ ] Stocker les jetons ou neurons consommés.
- [ ] Calculer un coût estimé.
- [ ] Bloquer les appels au-delà du plafond.
- [ ] Prévoir une dégradation sans image.
- [ ] Prévoir une dégradation avec recettes en cache.
- [ ] Afficher les quotas dans l'administration.
- [ ] Ajouter des alertes à 50 %, 80 % et 95 %.

### 10.8. Benchmark IA — P0

- [ ] Créer au moins 50 profils fictifs.
- [ ] Inclure allergies simples et multiples.
- [ ] Inclure mineurs et adultes.
- [ ] Inclure les différents objectifs.
- [ ] Inclure les différents nombres de portions.
- [ ] Mesurer le respect du schéma.
- [ ] Mesurer le respect des exclusions.
- [ ] Mesurer la cohérence des quantités.
- [ ] Mesurer la cohérence ingrédients/étapes.
- [ ] Évaluer la qualité du français.
- [ ] Évaluer la diversité des recettes.
- [ ] Mesurer latence et coût.
- [ ] Comparer Groq et le secours Cloudflare.
- [ ] Évaluer les images sur plusieurs familles de plats.
- [ ] Documenter les résultats.
- [ ] Fixer les seuils minimums avant la bêta.

---

## 11. M3 — Moteur de recommandation

### 11.1. Version déterministe — P0

- [ ] Définir les critères d'éligibilité absolus.
- [ ] Exclure allergies, intolérances strictes et interdictions.
- [ ] Exclure l'alcool pour les mineurs.
- [ ] Filtrer selon le type de régime.
- [ ] Définir le score des ingrédients aimés.
- [ ] Définir le score des cuisines aimées.
- [ ] Définir la pénalité des ingrédients non appréciés.
- [ ] Définir la pénalité des recettes récentes.
- [ ] Définir le bonus de durée.
- [ ] Définir le bonus de budget.
- [ ] Définir le bonus lié à l'objectif.
- [ ] Définir la diversité dans une même semaine.
- [ ] Expliquer les principaux facteurs de recommandation.
- [ ] Écrire des tests déterministes.

### 11.2. Apprentissage par interaction — P0

- [ ] Traiter un like comme un signal positif.
- [ ] Traiter un favori comme un signal positif fort.
- [ ] Traiter « cuisiné » comme un intérêt confirmé.
- [ ] Traiter un dislike selon son motif.
- [ ] Traiter un swap comme un signal contextuel.
- [ ] Traiter une recette ignorée comme un signal faible.
- [ ] Empêcher une préférence apprise de contourner une allergie.
- [ ] Mettre à jour le profil de préférence.
- [ ] Conserver l'historique des signaux.
- [ ] Permettre à l'utilisateur de corriger les préférences déduites.

### 11.3. Évolution sémantique — P2

- [ ] Évaluer le besoin réel d'embeddings.
- [ ] Choisir un modèle d'embedding multilingue.
- [ ] Activer pgvector si les mesures le justifient.
- [ ] Générer les embeddings des recettes.
- [ ] Combiner score déterministe et proximité sémantique.
- [ ] Ajouter un index HNSW.
- [ ] Mesurer le gain par rapport à la version déterministe.

---

## 12. M4 — Accueil et planning hebdomadaire

### 12.1. Structure de l'application — P0

- [ ] Créer le layout authentifié.
- [ ] Créer la navigation principale.
- [ ] Créer la navigation mobile responsive.
- [ ] Ajouter accueil, planning, courses, favoris et profil.
- [ ] Ajouter les titres et métadonnées des pages.
- [ ] Ajouter les garde-fous d'accès.

### 12.2. Accueil — P0

- [ ] Afficher la semaine active.
- [ ] Afficher les recettes par jour.
- [ ] Afficher image, nom et description.
- [ ] Afficher durée, difficulté et portions.
- [ ] Afficher calories et macronutriments estimés.
- [ ] Afficher les tags.
- [ ] Expliquer brièvement la recommandation.
- [ ] Afficher l'état de génération en cours.
- [ ] Afficher un état vide.
- [ ] Afficher une erreur récupérable.
- [ ] Ajouter la navigation vers la recette.

### 12.3. Planning — P0

- [ ] Créer la vue hebdomadaire.
- [ ] Gérer déjeuner, dîner et autres types retenus.
- [ ] Ajouter un repas.
- [ ] Supprimer un repas.
- [ ] Déplacer un repas.
- [ ] Modifier le jour.
- [ ] Modifier le type de repas.
- [ ] Modifier le nombre de portions.
- [ ] Verrouiller une recette.
- [ ] Régénérer les éléments non verrouillés.
- [ ] Confirmer les opérations coûteuses.
- [ ] Gérer les conflits de modification.
- [ ] Ajouter une vue adaptée aux petits écrans.

### 12.4. Changement de semaine — P1

- [ ] Naviguer vers la semaine précédente.
- [ ] Naviguer vers la semaine suivante.
- [ ] Créer une nouvelle semaine.
- [ ] Copier des repas d'une semaine.
- [ ] Conserver l'historique.
- [ ] Empêcher les duplications accidentelles.

---

## 13. M4 — Fiche recette

### 13.1. Affichage — P0

- [ ] Créer la route dynamique d'une recette.
- [ ] Afficher l'image illustrative.
- [ ] Afficher nom et description.
- [ ] Afficher préparation, cuisson et difficulté.
- [ ] Afficher le nombre de portions.
- [ ] Afficher le coût estimé.
- [ ] Afficher calories et macronutriments estimés.
- [ ] Afficher les allergènes.
- [ ] Afficher le matériel nécessaire.
- [ ] Afficher les ingrédients et quantités.
- [ ] Afficher les étapes numérotées.
- [ ] Afficher les conseils et variantes.
- [ ] Afficher les substitutions possibles.
- [ ] Afficher conservation et réchauffage.

### 13.2. Interactions — P0

- [ ] Modifier le nombre de portions.
- [ ] Recalculer les quantités.
- [ ] Aimer la recette.
- [ ] Ne pas aimer la recette.
- [ ] Ajouter aux favoris.
- [ ] Retirer des favoris.
- [ ] Indiquer que le plat a été cuisiné.
- [ ] Ajouter les ingrédients aux courses.
- [ ] Remplacer la recette dans le planning.
- [ ] Signaler une incohérence.
- [ ] Éviter les doubles soumissions.

### 13.3. Aide pendant la cuisine — P1

- [ ] Ajouter un mode cuisine lisible.
- [ ] Empêcher la mise en veille lorsque possible.
- [ ] Ajouter des minuteurs.
- [ ] Permettre de cocher les étapes.
- [ ] Agrandir les contrôles tactiles.

---

## 14. M4 — Like, dislike et remplacement

### 14.1. Like et favoris — P0

- [ ] Créer un retour visuel immédiat.
- [ ] Enregistrer le like de manière idempotente.
- [ ] Permettre d'annuler le like.
- [ ] Distinguer like et favori.
- [ ] Mettre à jour les recommandations futures.

### 14.2. Dislike — P0

- [ ] Afficher les motifs prédéfinis.
- [ ] Ajouter « Je n'aime pas un ingrédient ».
- [ ] Ajouter « Trop long ».
- [ ] Ajouter « Trop compliqué ».
- [ ] Ajouter « Trop cher ».
- [ ] Ajouter « Déjà mangé récemment ».
- [ ] Ajouter « Ce type de plat ne me plaît pas ».
- [ ] Ajouter un motif libre.
- [ ] Permettre de passer le motif.
- [ ] Mettre à jour les préférences selon le motif.
- [ ] Ne jamais transformer automatiquement un dislike en allergie.

### 14.3. Remplacement — P0

- [ ] Créer l'action de remplacement.
- [ ] Proposer trois alternatives.
- [ ] Permettre une demande libre.
- [ ] Conserver les contraintes de sécurité.
- [ ] Permettre de conserver calories ou protéines.
- [ ] Permettre de conserver budget ou durée.
- [ ] Remplacer uniquement le repas sélectionné.
- [ ] Restaurer l'ancienne recette en cas d'échec.
- [ ] Décompter le quota correctement.
- [ ] Enregistrer le remplacement comme signal contextuel.

---

## 15. M4 — Liste de courses

### 15.1. Génération — P0

- [ ] Générer la liste depuis le planning actif.
- [ ] Agréger les ingrédients identiques.
- [ ] Convertir les unités compatibles.
- [ ] Ne pas fusionner des unités incompatibles.
- [ ] Ajuster selon les portions.
- [ ] Classer les produits par rayon.
- [ ] Conserver la provenance par recette.
- [ ] Mettre à jour la liste après changement du planning.
- [ ] Préserver les éléments ajoutés manuellement.

### 15.2. Utilisation — P0

- [ ] Afficher la liste par rayon.
- [ ] Cocher et décocher un élément.
- [ ] Ajouter un produit manuel.
- [ ] Modifier quantité et unité.
- [ ] Supprimer un élément.
- [ ] Indiquer un produit déjà disponible.
- [ ] Masquer ou afficher les éléments cochés.
- [ ] Réinitialiser la liste avec confirmation.
- [ ] Optimiser l'interface pour un usage en magasin.

### 15.3. Partage et export — P1

- [ ] Copier la liste en texte.
- [ ] Utiliser le partage natif lorsqu'il est disponible.
- [ ] Imprimer la liste.
- [ ] Exporter la liste.
- [ ] Ajouter une estimation facultative du prix.

---

## 16. M4 — Favoris, historique et profil

### 16.1. Favoris — P0

- [ ] Créer la page des favoris.
- [ ] Ajouter la recherche.
- [ ] Ajouter les filtres.
- [ ] Trier par date, durée et type.
- [ ] Ouvrir la fiche recette.
- [ ] Ajouter un favori au planning.
- [ ] Gérer un favori devenu incompatible avec une nouvelle allergie.

### 16.2. Historique — P1

- [ ] Afficher les recettes proposées.
- [ ] Afficher les recettes cuisinées.
- [ ] Afficher likes, dislikes et remplacements.
- [ ] Filtrer par période.
- [ ] Réutiliser une ancienne recette.
- [ ] Expliquer pourquoi une recette n'est plus éligible.

### 16.3. Profil et préférences — P0

- [ ] Afficher les informations personnelles.
- [ ] Modifier l'objectif alimentaire.
- [ ] Modifier le nombre de repas.
- [ ] Modifier le nombre de portions.
- [ ] Modifier allergies et exclusions.
- [ ] Demander une confirmation renforcée avant de retirer une allergie.
- [ ] Modifier aliments aimés et non aimés.
- [ ] Modifier budget et durée.
- [ ] Modifier niveau et équipements.
- [ ] Modifier les préférences de notification.
- [ ] Afficher le niveau de complétion.
- [ ] Afficher les préférences déduites.
- [ ] Permettre de corriger les préférences déduites.

---

## 17. M5 — Interface d'administration

### 17.1. Accès administrateur — P0

- [ ] Définir le rôle administrateur.
- [ ] Protéger toutes les routes d'administration.
- [ ] Ajouter une authentification renforcée.
- [ ] Journaliser les actions sensibles.
- [ ] Empêcher l'utilisation de clés de service dans le navigateur.

### 17.2. Utilisateurs — P1

- [ ] Lister les utilisateurs.
- [ ] Rechercher un utilisateur.
- [ ] Consulter les informations strictement nécessaires.
- [ ] Consulter le statut du compte.
- [ ] Suspendre un compte.
- [ ] Traiter une demande de suppression.
- [ ] Ne pas afficher les données sensibles sans besoin.

### 17.3. Recettes et signalements — P0

- [ ] Lister les recettes générées.
- [ ] Filtrer les recettes non validées.
- [ ] Consulter les erreurs de validation.
- [ ] Dépublier une recette.
- [ ] Corriger une recette.
- [ ] Relancer une image.
- [ ] Lister les signalements.
- [ ] Traiter et clôturer un signalement.
- [ ] Bloquer un ingrédient ou une combinaison.

### 17.4. IA, quotas et coûts — P0

- [ ] Afficher les générations par jour.
- [ ] Afficher les erreurs par fournisseur.
- [ ] Afficher la latence moyenne.
- [ ] Afficher les consommations et coûts estimés.
- [ ] Afficher les quotas restants.
- [ ] Activer ou désactiver un fournisseur.
- [ ] Changer le modèle actif par configuration contrôlée.
- [ ] Consulter la version des prompts.
- [ ] Relancer une tâche échouée.
- [ ] Purger une tâche sans donnée personnelle persistante.

### 17.5. Référentiel alimentaire — P1

- [ ] Lister les ingrédients.
- [ ] Ajouter ou corriger un synonyme.
- [ ] Gérer les relations allergènes.
- [ ] Gérer les ingrédients contenant de l'alcool.
- [ ] Consulter les correspondances Ciqual.
- [ ] Traiter les ingrédients sans correspondance.

---

## 18. M5 — Notifications et communications

### 18.1. E-mails transactionnels — P0

- [ ] Personnaliser l'e-mail de vérification.
- [ ] Personnaliser l'e-mail de réinitialisation.
- [ ] Configurer un domaine d'envoi.
- [ ] Configurer SPF, DKIM et DMARC.
- [ ] Tester la délivrabilité.
- [ ] Ne jamais inclure de donnée alimentaire sensible dans un e-mail.

### 18.2. Notifications produit — P1

- [ ] Définir les notifications utiles.
- [ ] Prévenir lorsque le planning est prêt.
- [ ] Proposer un rappel de courses.
- [ ] Permettre l'activation et la désactivation.
- [ ] Respecter le fuseau horaire.
- [ ] Ajouter une fréquence maximale.
- [ ] Ajouter un lien de désinscription.

---

## 19. M5 — Tests et assurance qualité

### 19.1. Tests unitaires — P0

- [x] Tester la règle de majorité.
- [ ] Tester tous les schémas Zod.
- [ ] Tester les conversions d'unités.
- [ ] Tester les calculs nutritionnels.
- [ ] Tester le moteur d'allergènes.
- [ ] Tester le score de recommandation.
- [ ] Tester les quotas.
- [ ] Tester la déduplication.
- [ ] Tester la génération de la liste de courses.

### 19.2. Tests d'intégration — P0

- [ ] Tester les migrations.
- [ ] Tester les politiques RLS.
- [ ] Tester l'inscription et la création du profil.
- [ ] Tester l'onboarding complet.
- [ ] Tester une génération avec fournisseur factice.
- [ ] Tester un résultat IA invalide.
- [ ] Tester une recette contenant un allergène.
- [ ] Tester une recette alcoolisée pour un mineur.
- [ ] Tester le remplacement.
- [ ] Tester la liste de courses.
- [ ] Tester la suppression du compte.

### 19.3. Tests de parcours Playwright — P0

- [ ] Configurer Playwright.
- [ ] Tester inscription → onboarding → planning.
- [ ] Tester connexion et déconnexion.
- [ ] Tester mot de passe oublié.
- [ ] Tester like et dislike.
- [ ] Tester remplacement.
- [ ] Tester ouverture d'une recette.
- [ ] Tester favoris.
- [ ] Tester liste de courses.
- [ ] Tester modification des allergies.
- [ ] Tester les parcours administrateur essentiels.
- [ ] Tester les tailles d'écran principales.

### 19.4. Tests manuels — P0

- [ ] Tester Chrome, Firefox, Safari et Edge.
- [ ] Tester iOS Safari.
- [ ] Tester Android Chrome.
- [ ] Tester au clavier uniquement.
- [ ] Tester avec un lecteur d'écran.
- [ ] Tester une connexion lente.
- [ ] Tester une interruption pendant la génération.
- [ ] Tester les quotas dépassés.
- [ ] Tester une panne Groq.
- [ ] Tester une panne Cloudflare.
- [ ] Tester des données longues et caractères spéciaux.

---

## 20. M5 — Sécurité, performance et résilience

### 20.1. Sécurité applicative — P0

- [ ] Réaliser une revue OWASP.
- [ ] Valider toutes les entrées serveur.
- [ ] Protéger contre les injections SQL.
- [ ] Protéger contre les XSS.
- [ ] Protéger les actions sensibles contre les requêtes frauduleuses.
- [ ] Ajouter des en-têtes de sécurité.
- [ ] Ajouter une Content Security Policy.
- [ ] Limiter la taille des requêtes.
- [ ] Limiter le débit des endpoints coûteux.
- [ ] Protéger les prompts contre les instructions utilisateur malveillantes.
- [ ] Ne jamais interpoler une clé dans un prompt ou une réponse.
- [ ] Analyser les dépendances.
- [ ] Tester les permissions Supabase.
- [ ] Réaliser une revue des secrets.
- [ ] Préparer un plan de réponse à incident.

### 20.2. Résilience — P0

- [ ] Définir les timeouts de chaque service.
- [ ] Définir les stratégies de retry.
- [ ] Définir les coupe-circuits.
- [ ] Rendre les écritures importantes idempotentes.
- [ ] Gérer les tâches bloquées.
- [ ] Ajouter une reprise manuelle en administration.
- [ ] Prévoir une sauvegarde des données.
- [ ] Tester la restauration.
- [ ] Définir la politique de disponibilité.

### 20.3. Performance — P0

- [ ] Définir les budgets de performance web.
- [ ] Optimiser les images.
- [ ] Utiliser les Server Components par défaut.
- [ ] Limiter le JavaScript envoyé au navigateur.
- [ ] Ajouter pagination ou chargement progressif.
- [ ] Indexer les requêtes PostgreSQL critiques.
- [ ] Analyser les requêtes lentes.
- [ ] Mettre en cache les recettes publiques compatibles.
- [ ] Ne jamais mettre en cache publiquement une session utilisateur.
- [ ] Mesurer les Core Web Vitals.
- [ ] Tester avec un volume de données réaliste.

---

## 21. M5 — Préparer la bêta privée

### 21.1. Données et contenu — P0

- [ ] Créer les catégories initiales.
- [ ] Créer les ingrédients initiaux.
- [ ] Importer Ciqual.
- [ ] Valider un premier catalogue de recettes.
- [ ] Préparer les cartes visuelles d'onboarding.
- [ ] Préparer les images génériques.
- [ ] Préparer les textes d'aide.
- [ ] Préparer la FAQ.

### 21.2. Déploiement staging — P0

- [ ] Déployer sur staging.
- [ ] Appliquer toutes les migrations.
- [ ] Configurer les fournisseurs IA.
- [ ] Configurer les quotas bas de test.
- [ ] Configurer le suivi d'erreurs.
- [ ] Exécuter les tests de fumée.
- [ ] Exécuter le benchmark IA.
- [ ] Réaliser la revue de sécurité.

### 21.3. Bêta privée — P0

- [ ] Recruter un petit groupe de testeurs.
- [ ] Recueillir leur consentement pour le test.
- [ ] Préparer un canal de feedback.
- [ ] Suivre les abandons d'onboarding.
- [ ] Suivre les recettes rejetées ou remplacées.
- [ ] Examiner les signalements de sécurité alimentaire en priorité.
- [ ] Mesurer le coût moyen par utilisateur.
- [ ] Corriger les problèmes bloquants.
- [ ] Rejouer les tests après correction.

### 21.4. Critères de sortie de bêta — P0

- [ ] Aucun allergène connu ne traverse le moteur de contrôle.
- [ ] Aucun alcool n'est proposé à un mineur.
- [ ] Les politiques RLS sont validées.
- [ ] Les parcours critiques passent automatiquement.
- [ ] Le taux d'erreur IA est sous le seuil défini.
- [ ] Les coûts restent sous le budget défini.
- [ ] Les documents légaux sont validés.
- [ ] La suppression et l'export des données fonctionnent.
- [ ] Les erreurs critiques sont surveillées.
- [ ] Les performances respectent les budgets fixés.

---

## 22. M6 — Lancement de la version web

### 22.1. Production — P0

- [ ] Créer et sécuriser le projet Supabase de production.
- [ ] Configurer le domaine final.
- [ ] Configurer HTTPS.
- [ ] Configurer les secrets de production.
- [ ] Configurer les quotas de production.
- [ ] Configurer les sauvegardes.
- [ ] Configurer les alertes.
- [ ] Exécuter les migrations.
- [ ] Exécuter les tests de fumée.
- [ ] Vérifier les e-mails transactionnels.
- [ ] Vérifier analytics et consentement.
- [ ] Publier les pages légales.

### 22.2. Mise en ligne — P0

- [ ] Préparer une checklist de mise en ligne.
- [ ] Définir une fenêtre de lancement.
- [ ] Prévoir une procédure de retour arrière.
- [ ] Ouvrir progressivement les inscriptions.
- [ ] Surveiller erreurs, latence et coûts.
- [ ] Vérifier les premières générations.
- [ ] Traiter rapidement les premiers signalements.
- [ ] Documenter les incidents.

### 22.3. Stabilisation web — P1

- [ ] Corriger les erreurs de production.
- [ ] Optimiser les requêtes lentes.
- [ ] Ajuster les prompts selon les résultats.
- [ ] Ajuster le score de recommandation.
- [ ] Ajuster les quotas.
- [ ] Améliorer les écrans avec fort abandon.
- [ ] Augmenter la couverture des tests.
- [ ] Finaliser les fonctionnalités P1.
- [ ] Geler les contrats d'API nécessaires au mobile.
- [ ] Produire un bilan de stabilité avant le portage mobile.

---

# PARTIE B — APPLICATIONS MOBILES

## 23. M7 — Préparer le portage mobile

### 23.1. Cadrage mobile — P1

- [ ] Définir les versions minimales iOS et Android.
- [ ] Définir les appareils prioritaires.
- [ ] Définir les différences fonctionnelles avec le web.
- [ ] Définir la stratégie de navigation.
- [ ] Définir la stratégie hors ligne.
- [ ] Définir les notifications push.
- [ ] Définir les liens universels et deep links.
- [ ] Vérifier les règles des stores pour les données de santé et nutrition.

### 23.2. Architecture mobile — P1

- [ ] Créer `apps/mobile` avec Expo.
- [ ] Configurer Expo Router.
- [ ] Configurer TypeScript strict.
- [ ] Connecter `@recettes/domain`.
- [ ] Créer le paquet client d'API partagé.
- [ ] Créer le paquet de jetons de design.
- [ ] Configurer les variables Expo.
- [ ] Configurer Supabase pour React Native.
- [ ] Configurer le stockage sécurisé de session.
- [ ] Ajouter lint, typecheck et tests à la CI.
- [ ] Configurer EAS pour développement, staging et production.

### 23.3. Authentification mobile — P1

- [ ] Implémenter inscription et connexion.
- [ ] Implémenter la vérification d'e-mail.
- [ ] Implémenter le mot de passe oublié.
- [ ] Implémenter les liens d'authentification.
- [ ] Gérer le rafraîchissement de session.
- [ ] Gérer la déconnexion.
- [ ] Tester les deep links d'authentification.

### 23.4. Écrans mobiles — P1

- [ ] Porter l'onboarding.
- [ ] Porter l'accueil.
- [ ] Porter le planning.
- [ ] Porter la fiche recette.
- [ ] Porter like, dislike et remplacement.
- [ ] Porter la liste de courses.
- [ ] Porter les favoris.
- [ ] Porter l'historique.
- [ ] Porter le profil et les préférences.
- [ ] Porter l'export et la suppression du compte.
- [ ] Adapter tous les états de chargement et d'erreur.

### 23.5. Fonctionnalités natives — P1

- [ ] Ajouter les notifications push.
- [ ] Ajouter le partage natif de la liste de courses.
- [ ] Ajouter les deep links vers les recettes.
- [ ] Ajouter un mode cuisine gardant l'écran actif.
- [ ] Ajouter le retour haptique lorsque pertinent.
- [ ] Définir les données disponibles hors ligne.
- [ ] Mettre en cache planning et recettes récentes.
- [ ] Synchroniser les actions hors ligne au retour du réseau.

### 23.6. Qualité mobile — P1

- [ ] Ajouter les tests unitaires mobiles.
- [ ] Ajouter les tests de composants.
- [ ] Ajouter les tests de parcours essentiels.
- [ ] Tester les petits et grands écrans.
- [ ] Tester les tailles de police système.
- [ ] Tester VoiceOver.
- [ ] Tester TalkBack.
- [ ] Tester les connexions lentes et hors ligne.
- [ ] Tester la consommation mémoire.
- [ ] Tester le démarrage à froid.
- [ ] Tester sur des appareils physiques.

### 23.7. Publication — P1

- [ ] Créer les comptes Apple Developer et Google Play.
- [ ] Créer les identifiants d'application.
- [ ] Préparer icônes et splash screens.
- [ ] Préparer captures d'écran et textes des stores.
- [ ] Préparer les déclarations de confidentialité.
- [ ] Préparer les informations relatives aux données.
- [ ] Configurer la signature Android.
- [ ] Configurer les certificats iOS.
- [ ] Distribuer une bêta TestFlight.
- [ ] Distribuer une bêta Google Play.
- [ ] Corriger les retours.
- [ ] Soumettre les applications.
- [ ] Répondre aux éventuels rejets.
- [ ] Publier les versions initiales.
- [ ] Mettre en place le suivi des crashs mobiles.

---

# PARTIE C — ÉVOLUTIONS POST-MVP

## 24. M8 — Foyer et profils multiples — P2

- [ ] Créer la notion de foyer.
- [ ] Inviter un membre.
- [ ] Gérer plusieurs profils.
- [ ] Stocker les contraintes de chaque membre.
- [ ] Calculer l'intersection des contraintes strictes.
- [ ] Gérer les préférences contradictoires.
- [ ] Générer un repas commun ou des variantes.
- [ ] Gérer les portions par membre.
- [ ] Adapter le planning et les courses.
- [ ] Ajouter les politiques RLS du foyer.

---

## 25. M8 — Garde-manger et réfrigérateur — P2

- [ ] Créer le garde-manger.
- [ ] Ajouter un produit manuellement.
- [ ] Stocker quantité et date limite.
- [ ] Déduire les produits après une recette.
- [ ] Prioriser les produits disponibles.
- [ ] Ajouter un scan de code-barres.
- [ ] Intégrer Open Food Facts.
- [ ] Ajouter la prise de photo du réfrigérateur.
- [ ] Détecter les produits visibles.
- [ ] Demander confirmation avant enregistrement.
- [ ] Proposer des recettes anti-gaspillage.

---

## 26. M8 — Import et création de recettes — P2

- [ ] Importer une recette depuis une URL.
- [ ] Extraire les données structurées lorsqu'elles existent.
- [ ] Utiliser l'IA uniquement pour compléter les champs manquants.
- [ ] Normaliser les ingrédients.
- [ ] Exécuter les contrôles alimentaires.
- [ ] Calculer les données nutritionnelles.
- [ ] Respecter les droits d'auteur.
- [ ] Permettre une recette personnelle.
- [ ] Permettre la modification d'une recette personnelle.
- [ ] Distinguer recettes privées et partagées.

---

## 27. M8 — Santé et suivi nutritionnel — P2

- [ ] Définir précisément le périmètre non médical.
- [ ] Consulter des professionnels de santé.
- [ ] Ajouter un journal facultatif des repas consommés.
- [ ] Comparer consommé et planifié.
- [ ] Afficher des tendances sans diagnostic.
- [ ] Étudier les intégrations Apple Health et Health Connect.
- [ ] Obtenir les consentements spécifiques.
- [ ] Renforcer la protection des données.
- [ ] Faire valider juridiquement cette évolution.

---

## 28. M8 — Prix, promotions et commande — P2

- [ ] Définir les zones géographiques.
- [ ] Étudier les API de distributeurs.
- [ ] Récupérer les prix avec leur date.
- [ ] Estimer le coût d'une recette.
- [ ] Estimer le coût du planning.
- [ ] Suggérer des alternatives moins coûteuses.
- [ ] Intégrer les promotions locales.
- [ ] Permettre l'envoi d'un panier vers un partenaire.
- [ ] Afficher clairement les liens commerciaux.
- [ ] Gérer le consentement et l'affiliation.

---

## 29. M8 — Assistant de cuisine — P2

- [ ] Définir les capacités de l'assistant.
- [ ] Répondre uniquement à partir de la recette active lorsque possible.
- [ ] Ajouter les substitutions contextuelles.
- [ ] Ajouter les explications de techniques.
- [ ] Ajouter les commandes vocales.
- [ ] Ajouter la lecture des étapes.
- [ ] Ajouter le contrôle vocal des minuteurs.
- [ ] Gérer les erreurs de reconnaissance.
- [ ] Ajouter des limites d'usage.
- [ ] Empêcher toute recommandation médicale non autorisée.

---

## 30. M8 — Internationalisation — P2

- [ ] Extraire tous les textes de l'interface.
- [ ] Choisir une bibliothèque d'internationalisation.
- [ ] Gérer nombres, dates et unités.
- [ ] Traduire les ingrédients canoniques.
- [ ] Adapter les référentiels nutritionnels par pays.
- [ ] Adapter les contraintes légales et d'âge.
- [ ] Adapter les recettes aux produits locaux.
- [ ] Tester chaque langue.

---

## 31. Exploitation continue

### 31.1. Maintenance — P0/P1

- [ ] Mettre à jour les dépendances régulièrement.
- [ ] Surveiller les avis de sécurité.
- [ ] Mettre à jour Next.js, Expo et Supabase.
- [ ] Réévaluer les fournisseurs IA chaque trimestre.
- [ ] Surveiller les dépréciations de modèles.
- [ ] Tester un nouveau modèle avant remplacement.
- [ ] Réexécuter le benchmark IA après chaque changement.
- [ ] Mettre à jour Ciqual lors d'une nouvelle version.
- [ ] Réviser la taxonomie allergène.
- [ ] Tester régulièrement les sauvegardes.
- [ ] Tester régulièrement la restauration.

### 31.2. Exploitation produit — P1

- [ ] Analyser les retours utilisateurs.
- [ ] Prioriser les problèmes de sécurité alimentaire.
- [ ] Suivre l'onboarding.
- [ ] Suivre la qualité des recommandations.
- [ ] Suivre le taux de remplacement.
- [ ] Suivre la rétention.
- [ ] Suivre les coûts par fonctionnalité.
- [ ] Supprimer les événements analytics inutiles.
- [ ] Organiser des tests utilisateurs réguliers.
- [ ] Maintenir un changelog public.

---

## 32. Chemin critique recommandé

Les lots doivent être exécutés dans cet ordre :

```text
Cadrage final
    ↓
Design UX + modèle de données
    ↓
Supabase, migrations et RLS
    ↓
Authentification et onboarding
    ↓
Taxonomie alimentaire + Ciqual
    ↓
Contrôles de sécurité
    ↓
Pipeline IA texte et image
    ↓
Moteur de recommandation
    ↓
Accueil + planning + recette + interactions
    ↓
Courses + favoris + profil
    ↓
Administration + observabilité
    ↓
Tests, sécurité et conformité
    ↓
Bêta privée
    ↓
Lancement web et stabilisation
    ↓
Application Expo
```

---

## 33. Prochain lot à démarrer

Le prochain lot conseillé est **M0 + début de M1** :

1. Finaliser les décisions produit encore ouvertes.
2. Créer les wireframes principaux.
3. Créer le projet Supabase de développement.
4. Concevoir le modèle de données.
5. Écrire les premières migrations et politiques RLS.
6. Implémenter ensuite l'authentification et l'onboarding.

Cette séquence évite de développer l'interface ou les appels IA sur un modèle de
données encore instable.
