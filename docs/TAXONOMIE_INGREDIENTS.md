# Taxonomie française des ingrédients — P24

Version initiale : `fr-benchmark-v1`.

Le référentiel commence volontairement par 20 ingrédients nécessaires aux
recettes du benchmark : ingrédients courants, variantes françaises, pluriels,
familles, dérivés, alcool, allergènes et unités compatibles. Il ne prétend pas
constituer une liste exhaustive ou médicalement validée.

## Sources

- La liste structurée des 14 substances ou produits provoquant allergies ou
  intolérances vient de
  l’[annexe II du règlement (UE) n° 1169/2011](https://eur-lex.europa.eu/eli/reg/2011/1169/oj?locale=fr).
- Les modalités d’information sur les allergènes sont précisées dans la
  [communication de la Commission européenne de 2017](https://eur-lex.europa.eu/legal-content/FR/TXT/PDF/?from=FRA&uri=OJ%3AJOC_2017_428_R_0001).
- Les noms usuels, pluriels et unités de la v1 sont une nomenclature éditoriale
  interne limitée au corpus benchmark ; ils doivent être relus avant extension.
- Les correspondances nutritionnelles officielles seront ajoutées séparément
  avec l’import Ciqual prévu en P25.

## Import idempotent

Après démarrage et migration de Supabase :

```bash
npm run supabase:taxonomy:import
```

Le script charge `data/ingredient-taxonomy.fr.v1.json`, effectue des upserts par
identifiants stables puis vérifie le volume de la version. Une seconde exécution
doit produire exactement 20 ingrédients sans doublon.

## Correction administrateur

Une correction doit :

1. citer une source HTTPS et une justification d’au moins dix caractères ;
2. passer par `correct_ingredient`, réservé au rôle administrateur ;
3. modifier uniquement un champ autorisé ;
4. conserver l’ancienne et la nouvelle valeur dans `ingredient_corrections` ;
5. déclencher une nouvelle version de taxonomie si le changement modifie le sens
   de plusieurs relations ou le corpus publié.

Une correction de goût utilisateur ne passe jamais par cette procédure et ne
devient jamais une exclusion de sécurité.
