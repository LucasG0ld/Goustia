# Contrats de génération de recettes

La version initiale est `recipe-generation.v1`. La source de vérité se trouve
dans
[`packages/domain/src/recipe-generation-contract.ts`](../packages/domain/src/recipe-generation-contract.ts).

## Entrée

`RecipeGenerationInput` ne contient que :

- un identifiant technique de requête ;
- les exclusions et allergies sous forme d’identifiants ;
- un booléen autorisant ou non l’alcool ;
- l’objectif, les portions et contraintes pratiques ;
- les cuisines et équipements sous forme de codes ;
- le type et le nombre de recettes demandées.

Nom, prénom, e-mail, identifiant de compte et date de naissance sont interdits
par le schéma strict. La majorité est convertie côté métier en `alcoholAllowed`.

## Sortie structurée

Chaque recette contient :

- titre et description en français ;
- ingrédients quantifiés avec unités contrôlées ;
- allergènes déclarés et traces possibles ;
- étapes ordonnées qui référencent leurs ingrédients ;
- attentes nutritionnelles, sans accepter de valeurs finales calculées par le
  modèle ;
- prompt visuel et texte alternatif sans donnée utilisateur ;
- marqueur obligatoire indiquant que l’image est illustrative.

Le serveur calcule ensuite la nutrition depuis Ciqual et exécute le moteur de
sécurité. Le rapport technique indique séparément validation du schéma,
validation alimentaire et calcul nutritionnel.

## Compatibilité

Les schémas Zod produisent un JSON Schema Draft 7 strict avec
`additionalProperties: false`, compatible avec les sorties structurées du
fournisseur principal. La
[documentation Groq des Structured Outputs](https://console.groq.com/docs/structured-outputs)
impose que tous les champs soient requis et que chaque objet refuse les
propriétés supplémentaires en mode strict ; la suite de tests parcourt
récursivement les schémas pour vérifier ces deux règles. Des exemples valides et
invalides sont exportés avec le contrat et testés automatiquement.

Toute évolution incompatible crée une nouvelle version. Une modification de
prompt qui ne change pas la structure conserve le contrat et versionne
séparément le prompt.
