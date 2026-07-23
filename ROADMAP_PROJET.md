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

- [x] Choisir le nom définitif de l'application.
- [ ] Vérifier la disponibilité du nom de domaine.
- [ ] Vérifier la disponibilité du nom sur les stores mobiles.
- [ ] Définir le logo et l'icône.
- [x] Définir les couleurs, typographies et principes visuels.
- [x] Définir le ton éditorial de l'application.
- [x] Définir la manière de présenter les images générées comme illustratives.

### 3.2. Décisions produit — P0

- [x] Définir précisément le public cible initial.
- [x] Définir l'âge minimum autorisé pour créer un compte.
- [x] Décider si un mineur doit obtenir une autorisation parentale.
- [x] Définir les pays accessibles lors du lancement.
- [x] Définir les types de repas disponibles dans le MVP.
- [x] Définir le nombre maximal de repas générés par semaine.
- [x] Définir le nombre maximal de personnes par repas.
- [x] Définir la fréquence maximale de régénération.
- [x] Définir les critères exacts des objectifs perte de poids, équilibre et
      prise de masse.
- [x] Décider si les objectifs nutritionnels utilisent des fourchettes ou des
      valeurs précises.
- [x] Définir la politique de répétition des recettes.
- [x] Définir le comportement d'un dislike sans motif.
- [x] Définir le comportement d'un remplacement demandé plusieurs fois.
- [x] Définir les fonctionnalités disponibles sans compte.
- [x] Décider si l'adresse e-mail doit être vérifiée avant la génération.

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
- [x] Bloquer la fusion lorsqu'un contrôle échoue.
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

- [x] Définir les couleurs sémantiques.
- [x] Définir l'échelle typographique.
- [x] Définir espacements, rayons, bordures et ombres.
- [x] Définir les états focus, hover, actif et désactivé.
- [x] Créer les boutons.
- [x] Créer les champs, listes et sélecteurs.
- [x] Créer les cases à cocher et boutons radio.
- [x] Créer les modales et panneaux.
- [x] Créer les alertes et notifications temporaires.
- [x] Créer les squelettes de chargement.
- [x] Créer les cartes de recettes.
- [x] Créer les badges alimentaires.
- [x] Créer le composant de progression d'onboarding.
- [x] Créer les états vides et d'erreur.
- [x] Documenter l'utilisation des composants.

### 5.3. Accessibilité dès la conception — P0

- [x] Définir un objectif WCAG 2.2 niveau AA.
- [x] Vérifier les contrastes.
- [x] Définir une hiérarchie de titres cohérente.
- [x] Prévoir des libellés explicites pour tous les contrôles.
- [x] Prévoir la navigation complète au clavier.
- [x] Prévoir les annonces des changements dynamiques.
- [x] Éviter de transmettre une information uniquement par la couleur.
- [x] Prévoir une réduction des animations.
- [x] Définir des textes alternatifs pour les images utiles.

---

## 6. M1 — Concevoir le modèle de données

### 6.1. Utilisateurs et préférences — P0

- [x] Créer la table des profils.
- [x] Lier les profils à `auth.users`.
- [x] Stocker prénom et nom.
- [x] Stocker la date de naissance avec le minimum de précision nécessaire.
- [x] Stocker l'objectif nutritionnel.
- [x] Stocker le nombre de repas par semaine.
- [x] Stocker le nombre habituel de portions.
- [x] Stocker le statut de l'onboarding.
- [x] Créer la table des préférences culinaires.
- [x] Créer la table des équipements.
- [x] Créer la table des préférences de durée.
- [x] Créer la table des préférences de budget.

### 6.2. Ingrédients et sécurité alimentaire — P0

- [x] Créer la table des ingrédients canoniques.
- [x] Créer la table des synonymes d'ingrédients.
- [x] Créer la table des allergènes.
- [x] Créer les relations ingrédient-allergène.
- [x] Créer la hiérarchie des ingrédients et dérivés.
- [x] Créer la table des contraintes utilisateur.
- [x] Distinguer allergie, intolérance, interdiction et dislike.
- [x] Stocker la sévérité ou le caractère absolu d'une contrainte.
- [x] Ajouter les index de recherche des ingrédients.
- [x] Ajouter une recherche tolérante aux accents et fautes simples.

### 6.3. Recettes — P0

- [x] Créer la table des recettes.
- [x] Créer la table des ingrédients d'une recette.
- [x] Créer la table des étapes.
- [x] Créer les catégories et tags.
- [x] Stocker les portions.
- [x] Stocker les durées.
- [x] Stocker la difficulté.
- [x] Stocker le coût estimé.
- [x] Stocker les données nutritionnelles calculées.
- [x] Stocker la provenance de la recette.
- [x] Stocker le modèle IA et la version du prompt.
- [x] Stocker le statut de validation.
- [x] Stocker le statut de publication.
- [x] Stocker le hash de déduplication.
- [x] Stocker l'image et son statut.
- [x] Prévoir le versionnement d'une recette.

### 6.4. Planning et interactions — P0

- [x] Créer la table des plannings.
- [x] Créer la table des repas planifiés.
- [x] Stocker le jour et le type de repas.
- [x] Stocker le nombre de portions par repas.
- [x] Stocker le verrouillage d'un repas.
- [x] Créer la table des réactions.
- [x] Stocker likes et dislikes.
- [x] Stocker les motifs de dislike.
- [x] Stocker les remplacements.
- [x] Stocker les recettes cuisinées.
- [x] Créer la table des favoris.
- [x] Empêcher les favoris en double.

### 6.5. Courses, IA et administration — P0

- [x] Créer la table des listes de courses.
- [x] Créer la table des éléments de courses.
- [x] Stocker la quantité, l'unité et l'état coché.
- [x] Créer la table des tâches de génération IA.
- [x] Stocker statut, tentatives et erreurs techniques.
- [x] Stocker fournisseur, modèle, durée et consommation.
- [x] Créer les tables de quotas.
- [x] Créer la table des signalements.
- [x] Créer une piste d'audit d'administration.
- [x] Définir les rôles utilisateur et administrateur.

### 6.6. Sécurité PostgreSQL — P0

- [x] Activer RLS sur chaque table exposée.
- [x] Écrire les politiques de lecture par propriétaire.
- [x] Écrire les politiques d'insertion par propriétaire.
- [x] Écrire les politiques de modification par propriétaire.
- [x] Écrire les politiques de suppression par propriétaire.
- [x] Écrire les politiques propres aux administrateurs.
- [x] Révoquer les droits inutiles des rôles `anon` et `authenticated`.
- [x] Tester les tentatives d'accès entre deux utilisateurs.
- [x] Tester les accès sans session.
- [x] Tester les fonctions et vues avec RLS.
- [x] Ajouter les index nécessaires aux politiques.

---

## 7. M2 — Authentification, compte et conformité

### 7.1. Authentification — P0

- [x] Configurer Supabase Auth pour le web.
- [x] Ajouter le client navigateur.
- [x] Finaliser le client serveur.
- [x] Ajouter le proxy de rafraîchissement de session.
- [x] Implémenter l'inscription par e-mail et mot de passe.
- [x] Implémenter la connexion.
- [x] Implémenter la déconnexion.
- [x] Implémenter la vérification d'adresse e-mail.
- [x] Implémenter le mot de passe oublié.
- [x] Implémenter la réinitialisation du mot de passe.
- [x] Protéger les routes authentifiées avec des claims vérifiés.
- [x] Rediriger correctement après authentification.
- [x] Gérer session expirée et compte supprimé.
- [x] Ajouter une limitation de débit sur les routes d'authentification.
- [x] Tester tous les flux d'authentification.

### 7.2. Gestion du compte — P0

- [x] Afficher les informations du compte.
- [x] Permettre la modification du nom et du prénom.
- [x] Permettre la modification de l'adresse e-mail.
- [x] Permettre la modification du mot de passe.
- [x] Permettre la déconnexion de toutes les sessions.
- [x] Implémenter la suppression du compte.
- [x] Définir le délai et la méthode de suppression.
- [x] Supprimer ou anonymiser les données associées.
- [x] Implémenter l'export des données personnelles.

### 7.3. RGPD et documents légaux — P0

- [x] Cartographier les données collectées.
- [x] Définir la base légale de chaque traitement.
- [x] Définir les durées de conservation.
- [x] Rédiger la politique de confidentialité.
- [x] Rédiger les conditions d'utilisation.
- [x] Rédiger les mentions légales.
- [x] Rédiger l'information spécifique aux données alimentaires.
- [x] Rédiger l'avertissement nutritionnel et médical.
- [x] Documenter les sous-traitants.
- [ ] Vérifier les transferts de données hors UE.
- [x] Définir la gestion des demandes d'accès et de suppression.
- [x] Définir la gestion des mineurs et du consentement parental.
- [x] Mettre en place le consentement aux cookies non essentiels si nécessaire.
- [x] Ajouter un registre des versions acceptées des documents.
- [ ] Faire valider les documents par un professionnel compétent.

---

## 8. M2 — Onboarding court et profil progressif

### 8.1. Étape compte — P0

- [x] Créer l'écran d'inscription.
- [x] Ajouter prénom, nom, e-mail et mot de passe.
- [x] Ajouter la date de naissance.
- [x] Valider les champs côté client et serveur.
- [x] Calculer l'âge sans envoyer la date de naissance à l'IA.
- [x] Enregistrer l'acceptation des documents légaux.
- [x] Afficher des erreurs compréhensibles.

### 8.2. Étape sécurité alimentaire — P0

- [x] Créer la recherche d'allergies et d'interdictions.
- [x] Proposer les ingrédients les plus fréquents.
- [x] Permettre l'option « Je n'en ai pas ».
- [x] Distinguer visuellement allergies, intolérances et interdictions.
- [x] Expliquer la différence entre sécurité et préférence.
- [x] Empêcher une contrainte contradictoire.
- [x] Confirmer les contraintes avant de continuer.
- [x] Enregistrer les exclusions strictes.

### 8.3. Étape objectif — P0

- [x] Afficher les quatre objectifs nutritionnels.
- [x] Expliquer brièvement chaque objectif.
- [x] Demander le nombre de repas par semaine.
- [x] Demander le nombre de personnes.
- [x] Valider les limites définies par le produit.
- [x] Enregistrer les choix.

### 8.4. Premiers goûts — P0

- [x] Préparer un jeu de cartes de plats.
- [x] Afficher 8 à 12 cartes accessibles.
- [x] Permettre une sélection multiple.
- [x] Permettre de passer l'étape.
- [x] Enregistrer les premiers signaux positifs.
- [x] Ne pas traiter une carte ignorée comme un dislike.

### 8.5. Progression et reprise — P0

- [x] Afficher une progression courte.
- [x] Enregistrer chaque étape indépendamment.
- [x] Permettre de reprendre après interruption.
- [x] Empêcher l'accès aux recommandations sans contraintes validées.
- [x] Déclencher la première génération après l'onboarding.
- [x] Afficher un écran d'attente utile pendant la génération.
- [x] Mesurer l'abandon à chaque étape.

### 8.6. Profil progressif — P1

- [x] Calculer un taux de complétion du profil.
- [x] Ajouter les ingrédients appréciés.
- [x] Ajouter les ingrédients non appréciés.
- [x] Ajouter les cuisines favorites.
- [x] Ajouter le niveau en cuisine.
- [x] Ajouter le temps maximal de préparation.
- [x] Ajouter le budget.
- [x] Ajouter les équipements disponibles.
- [x] Créer les questions contextuelles.
- [x] Permettre d'ignorer chaque question secondaire.
- [x] Limiter la fréquence des sollicitations.

---

## 9. M2 — Référentiel alimentaire et nutrition

### 9.1. Taxonomie des ingrédients — P0

- [x] Choisir une nomenclature interne stable.
- [x] Importer une première liste d'ingrédients.
- [x] Ajouter les synonymes français.
- [x] Ajouter pluriels et variantes orthographiques.
- [x] Ajouter les familles d'ingrédients.
- [x] Ajouter les dérivés allergènes.
- [x] Ajouter les ingrédients contenant de l'alcool.
- [x] Ajouter les interdictions fréquentes.
- [x] Ajouter les unités compatibles.
- [x] Créer un processus de correction par l'administration.

### 9.2. Données Ciqual — P0

- [x] Télécharger la version 2025 des données Ciqual.
- [x] Vérifier la licence et les obligations d'attribution.
- [x] Créer le script d'import.
- [x] Stocker les références Ciqual nécessaires.
- [x] Faire correspondre les ingrédients internes à Ciqual.
- [x] Gérer les aliments sans correspondance.
- [x] Gérer les valeurs manquantes ou traces.
- [x] Versionner la source nutritionnelle.
- [x] Tester l'import complet.

### 9.3. Calcul nutritionnel — P0

- [x] Définir les nutriments affichés.
- [x] Normaliser grammes, millilitres et unités.
- [x] Créer les tables de conversion.
- [x] Calculer les valeurs par ingrédient.
- [x] Calculer les valeurs par recette.
- [x] Calculer les valeurs par portion.
- [x] Gérer les pertes ou gains de masse lorsque pertinent.
- [x] Indiquer clairement que les résultats sont estimatifs.
- [x] Définir un seuil d'acceptation des données manquantes.
- [x] Rejeter ou masquer un calcul trop incertain.
- [x] Écrire les tests sur les calculs.

### 9.4. Moteur de contrôle alimentaire — P0

- [x] Détecter un ingrédient strictement exclu.
- [x] Détecter ses synonymes.
- [x] Détecter ses dérivés connus.
- [x] Détecter les allergènes indirects.
- [x] Détecter l'alcool.
- [x] Appliquer la règle liée à l'âge.
- [x] Distinguer exclusion stricte et préférence négative.
- [x] Produire un rapport de validation lisible.
- [x] Bloquer l'enregistrement d'une recette dangereuse.
- [x] Recontrôler avant l'affichage à l'utilisateur.
- [x] Écrire un corpus de tests de sécurité.

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
- [x] Documenter la procédure en cas de compromission.

### 10.2. Contrats du domaine — P0

- [x] Définir `RecipeGenerationInput`.
- [x] Définir le schéma complet d'une recette.
- [x] Définir ingrédients, quantités et unités.
- [x] Définir les étapes structurées.
- [x] Définir les métadonnées nutritionnelles attendues.
- [x] Définir allergènes et exclusions détectés.
- [x] Définir le prompt visuel.
- [x] Définir le rapport de génération.
- [x] Versionner les schémas.
- [x] Écrire des tests de validation Zod.

### 10.3. Abstraction des fournisseurs — P0

- [x] Créer l'interface `RecipeGenerator`.
- [x] Créer l'interface `RecipeImageGenerator`.
- [x] Créer une fabrique pilotée par variables d'environnement.
- [x] Ajouter l'adaptateur Groq.
- [x] Ajouter l'adaptateur texte Cloudflare.
- [x] Ajouter l'adaptateur image Cloudflare.
- [x] Normaliser les erreurs des fournisseurs.
- [x] Ajouter les délais d'expiration.
- [x] Ajouter les retries avec attente progressive.
- [x] Ajouter un coupe-circuit.
- [x] Ajouter un fournisseur factice pour les tests.

### 10.4. Prompts — P0

- [x] Rédiger le prompt système de génération.
- [x] Interdire explicitement les ingrédients exclus.
- [x] Interdire l'alcool lorsque nécessaire.
- [x] Imposer le français.
- [x] Imposer des quantités réalistes.
- [x] Imposer la cohérence entre ingrédients et étapes.
- [x] Imposer le schéma structuré.
- [x] Demander un prompt d'image sans donnée utilisateur.
- [x] Ajouter quelques exemples de qualité.
- [x] Versionner chaque prompt.
- [x] Créer un changelog des prompts.

### 10.5. Orchestration — P0

- [x] Créer la route de demande de génération.
- [x] Vérifier l'identité et le quota de l'utilisateur.
- [x] Construire un profil pseudonymisé.
- [x] Ne transmettre aucune donnée personnelle directe.
- [x] Générer les recettes par lot.
- [x] Valider le JSON reçu.
- [x] Normaliser les ingrédients.
- [x] Exécuter le contrôle alimentaire.
- [x] Calculer les valeurs nutritionnelles.
- [x] Vérifier la cohérence des étapes.
- [x] Dédupliquer les recettes.
- [x] Rejeter et régénérer un résultat invalide.
- [x] Limiter le nombre de tentatives.
- [x] Enregistrer uniquement les recettes validées.
- [x] Mettre à jour l'état de la tâche.
- [x] Informer l'interface de la progression.
- [x] Gérer proprement une panne du fournisseur.

### 10.6. Génération des images — P0

- [x] Définir le style visuel des plats.
- [x] Définir un modèle de prompt photographique.
- [x] Générer une image uniquement après validation de la recette.
- [x] Appeler FLUX.2 Klein 4B.
- [x] Vérifier format, poids et dimensions.
- [x] Compresser ou convertir l'image si nécessaire.
- [x] Ajouter les métadonnées utiles.
- [x] Stocker l'image dans Supabase Storage.
- [x] Associer l'image à la recette canonique.
- [x] Mettre en cache et réutiliser l'image.
- [x] Ajouter une image générique en cas d'échec.
- [x] Ajouter une régénération réservée aux administrateurs.
- [x] Tester FLUX.1 Schnell comme solution de secours.
- [x] Afficher que l'image est illustrative.

### 10.7. Quotas et coûts — P0

- [x] Définir un quota de génération par utilisateur.
- [x] Définir un quota global quotidien.
- [x] Comptabiliser les appels texte.
- [x] Comptabiliser les appels image.
- [x] Stocker les jetons ou neurons consommés.
- [x] Calculer un coût estimé.
- [x] Bloquer les appels au-delà du plafond.
- [x] Prévoir une dégradation sans image.
- [x] Prévoir une dégradation avec recettes en cache.
- [x] Afficher les quotas dans l'administration.
- [x] Ajouter des alertes à 50 %, 80 % et 95 %.

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
- [x] Tester les conversions d'unités.
- [x] Tester les calculs nutritionnels.
- [x] Tester le moteur d'allergènes.
- [ ] Tester le score de recommandation.
- [ ] Tester les quotas.
- [ ] Tester la déduplication.
- [ ] Tester la génération de la liste de courses.

### 19.2. Tests d'intégration — P0

- [x] Tester les migrations.
- [x] Tester les politiques RLS.
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
