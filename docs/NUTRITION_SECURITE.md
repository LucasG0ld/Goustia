# Nutrition et sécurité alimentaire

## Calcul nutritionnel

Le module pur
[`packages/domain/src/nutrition.ts`](../packages/domain/src/nutrition.ts)
calcule les apports par ingrédient, recette et portion.

Principes :

- les valeurs Ciqual sont exprimées pour 100 g ;
- `g` et `kg` sont convertis directement ;
- `ml` et `l` exigent une densité sourcée ;
- une pièce, tranche, cuillère ou gousse exige un poids unitaire sourcé ;
- `au goût` n’est jamais quantifié ;
- une perte de masse à la cuisson modifie le poids final, pas arbitrairement les
  nutriments ;
- un facteur de rétention ne s’applique que lorsqu’il est explicitement fourni ;
- une trace, une borne supérieure ou une absence n’est jamais transformée en
  nombre.

La confiance correspond à la part massique couverte, pondérée par la confiance
des données et des conversions. Le seuil initial est `0.80`. Sous ce seuil, la
valeur est `null` et doit rester masquée. Les quatre valeurs principales
(énergie, protéines, glucides, lipides) doivent toutes franchir le seuil pour
afficher le bloc nutritionnel.

Le libellé utilisateur obligatoire est :

> Valeurs nutritionnelles estimatives

Les conversions validées pourront être stockées dans
`ingredient_unit_conversions`. Cette table impose une source et une confiance ;
elle est volontairement vide tant qu’aucune mesure fiable n’a été ajoutée.

## Moteur de sécurité alimentaire

Le module
[`packages/domain/src/food-safety.ts`](../packages/domain/src/food-safety.ts)
est déterministe et indépendant de l’IA. Il :

1. normalise le libellé français ;
2. résout le canonique ou ses synonymes ;
3. parcourt les parents et dérivés ;
4. vérifie les familles strictement exclues ;
5. vérifie allergènes directs, dérivés et traces possibles ;
6. détecte l’alcool direct ou caché ;
7. produit un rapport français avec le chemin de relation.

Un ingrédient inconnu ou ambigu bloque la recette. Une préférence négative
produit seulement un avertissement et ne devient jamais une allergie.

Les deux frontières publiques sont obligatoires :

- `assertRecipeSafeForStorage` avant toute persistance ;
- `assertRecipeSafeForDisplay` avant tout affichage.

Une recette rejetée déclenche `FoodSafetyValidationError` et expose un rapport
technique explicable. Ces contrôles sont bloquants avant l’activation d’un
fournisseur de génération réel.
