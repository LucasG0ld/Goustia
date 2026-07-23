# Modèle de données P12 à P24

Statut : **implémenté et vérifié localement le 23 juillet 2026**

Migrations principales : `supabase/migrations/20260723162000_product_core.sql`,
`supabase/migrations/20260723170000_planning_operations_security.sql` et
`supabase/migrations/20260723190000_onboarding_legal_taxonomy.sql`.

## Planning, interactions et opérations

Les plannings hebdomadaires, repas, réactions, remplacements, favoris et
recettes cuisinées sont normalisés et munis de clés d’idempotence. Les repas
verrouillés sont représentés explicitement et un emplacement jour/type ne peut
apparaître qu’une fois dans un planning.

La migration `20260723233000_recommendations_planning.sql` ajoute une révision
optimiste aux plannings et repas ainsi qu’un journal de mutations. La fonction
atomique de mutation rejette une révision obsolète et la finalisation d’une
régénération ne remplace que les repas non verrouillés.

Les interactions apprises sont stockées dans `preference_learning_events` et
agrégées dans `learned_preferences`. Ces tables ne partagent ni type ni fonction
avec les allergies et exclusions strictes. Une correction utilisateur est
conservée séparément du score calculé.

Les listes de courses, tâches et tentatives IA, quotas, signalements, rôles et
audit administratif sont séparés. Les erreurs compréhensibles par l’utilisateur
restent dans la tâche publique ; les détails techniques sont isolés dans le
schéma privé `app_private`.

## Onboarding, documents et taxonomie

Les documents légaux et leurs acceptations sont versionnés. Les étapes
d’onboarding sont reprenables et leurs événements analytiques ne contiennent
aucune contrainte alimentaire. Les goûts ingrédients disposent de leur propre
table et ne peuvent donc pas être interprétés comme des exclusions strictes.

La taxonomie française indique sa version source, ses synonymes, unités,
relations dérivées et corrections administratives auditées. Son contenu
éditorial est importé séparément par une commande idempotente.

## Principes

- PostgreSQL porte les contraintes d’intégrité qui protègent le produit.
- Les données interrogées sont normalisées ; aucun profil métier n’est enfermé
  dans une colonne JSON générique.
- Les données personnelles appartiennent à un utilisateur Supabase Auth et sont
  protégées par RLS.
- Allergie, intolérance, interdiction et préférence négative restent des
  concepts distincts.
- Une recette est une identité stable dont le contenu évolue par versions.
- Les valeurs nutritionnelles viennent de Ciqual ou d’une saisie contrôlée, pas
  directement du modèle génératif.
- La provenance IA, le modèle et la version de prompt restent auditables.

## Profils et préférences

`profiles` est lié un-à-un à `auth.users`. Il stocke uniquement la date de
naissance sans heure, l’objectif, les limites validées du MVP et l’avancement de
l’onboarding.

Les préférences progressives sont séparées :

- `culinary_preferences` pour régime et niveau ;
- `cuisine_preferences` pour les signaux par cuisine ;
- `equipment` et `user_equipment` pour le matériel ;
- `duration_preferences` pour les durées ;
- `budget_preferences` pour le budget.

La suppression d’un compte cascade vers ses données personnelles.

## Référentiel alimentaire

- `ingredient_families` et `ingredients` : taxonomie canonique ;
- `ingredient_synonyms` : libellés alternatifs ;
- `ingredient_relations` : dérivés et contenus ;
- `allergens` et `ingredient_allergens` : allergènes structurés ;
- `user_food_constraints` : contraintes et goûts négatifs.

Le référentiel nutritionnel est séparé de la taxonomie interne :

- `nutrition_source_versions` : millésime, licence, DOI et empreinte ;
- `ciqual_foods` : catalogue complet des aliments du millésime ;
- `ciqual_constituents` : nutriments effectivement utilisés ;
- `ciqual_nutrient_values` : valeur brute, numérique, trace, borne ou absence ;
- `ingredient_ciqual_mappings` : rapprochement explicite et niveau de confiance
  ;
- `ingredient_unit_conversions` : densités et poids unitaires sourcés.

Les noms français possèdent une valeur normalisée sans accent et des index
trigrammes. Cette recherche sert à retrouver un ingrédient ; elle ne remplace
jamais la validation déterministe de ses relations allergènes.

## Recettes

- `recipes` : identité, slug et hash de déduplication ;
- `recipe_versions` : contenu, portions, durées, difficulté, coût, provenance,
  validation et publication ;
- `recipe_ingredients` et `recipe_steps` : contenu ordonné ;
- `recipe_categories`, `recipe_tags` et leurs tables d’association ;
- `recipe_nutrition` : valeurs calculées par portion avec source et tolérance ;
- `recipe_images` : objet Storage, texte alternatif, fournisseur et statut.

Une version publiée doit être validée et datée. Une version générée par IA doit
indiquer fournisseur, modèle et version de prompt. Une image prête doit avoir un
chemin de stockage et un texte alternatif.

## Orchestration IA, quotas et images

- `ai_generation_jobs` porte la requête pseudonymisée, l’état, l’étape, la
  progression, le mode dégradé et les recettes produites ;
- `ai_generation_job_recipes` relie une tâche aux recettes canoniques validées ;
- `usage_quotas` contient le quota journalier propre à l’utilisateur ;
- `app_private.ai_quota_reservations` garantit l’idempotence comptable ;
- `app_private.global_ai_daily_usage` contient compteurs et coûts globaux ;
- `app_private.ai_usage_events` conserve chaque consommation fournisseur sans
  donnée personnelle directe ;
- `recipe_images` référence la recette canonique, la clé de génération, le
  SHA-256, le format, le poids, les dimensions et la mention illustrative.

La réservation de tâche et des quotas est transactionnelle. Le stockage d’une
recette validée, de sa version, de ses ingrédients, étapes, valeurs Ciqual et de
son lien à la tâche est également atomique. Voir
[`GENERATION_IA.md`](GENERATION_IA.md).

## Sécurité

RLS est active sur toutes les tables publiques :

- politiques propriétaire pour profils, préférences et contraintes ;
- lecture publique limitée au référentiel et aux recettes visibles ;
- helper privé `app_private.is_recipe_visible` pour éviter une récursion entre
  recettes et versions ;
- droits directs révoqués puis réattribués explicitement.

Les tests pgTAP créent deux comptes fictifs et vérifient qu’un utilisateur ne
peut ni lire ni modifier le profil de l’autre. Une session anonyme ne peut lire
aucun profil.

## Seeds et tests

Le seed local contient uniquement des identifiants déterministes :

- 4 équipements ;
- 4 familles et 6 ingrédients de démonstration, dont un dérivé ;
- les 14 allergènes à déclaration obligatoire dans l’Union européenne ;
- des relations ingrédient-allergène ;
- 2 catégories et 4 tags de recette.

`npm run supabase:verify` reconstruit une base vide, importe la taxonomie et
Ciqual, exécute les tests pgTAP, analyse le SQL puis régénère les types
TypeScript.
