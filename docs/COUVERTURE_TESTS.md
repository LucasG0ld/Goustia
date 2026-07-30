# Couverture des tests unitaires

## Périmètre

La commande de référence est :

```text
npm run test:coverage
```

Elle mesure séparément le domaine partagé et l'application web. La couverture
sert à repérer les chemins non exercés ; aucun seuil artificiel ne doit conduire
à tester des détails d'implémentation.

Le domaine couvre notamment :

- les schémas Zod et leurs valeurs limites ;
- l'âge légal et l'exclusion d'alcool ;
- les conversions d'unités et les calculs Ciqual ;
- les allergies, exclusions absolues et héritages d'ingrédients ;
- le score de recommandation et ses invariants ;
- les quotas, coûts estimés et alertes ;
- la cohérence et la déduplication des recettes générées ;
- l'agrégation, la provenance et l'export des courses ;
- les préférences et le contenu non sensible des notifications.

L'application web couvre les formulaires, composants interactifs, adaptateurs IA
factices, règles d'environnement, parcours de planning, recettes et courses.

## Résultat du lot P50–P54

Le rapport HTML est produit dans `packages/domain/coverage` et
`apps/web/coverage`. Exécution locale du 30 juillet 2026 :

| Périmètre       | Tests | Instructions | Branches | Fonctions |  Lignes |
| --------------- | ----: | -----------: | -------: | --------: | ------: |
| Domaine partagé |   112 |      95,35 % |  82,59 % |   98,33 % | 95,35 % |
| Application web |    37 |      11,33 % |  49,65 % |   25,91 % | 11,33 % |

Le faible total web est attendu : le calcul inclut toutes les pages serveur,
routes et types générés, qui sont principalement exercés par pgTAP et Playwright
plutôt que par Vitest. Les modules clients ciblés atteignent généralement 50 à
100 %. Les rapports restent disponibles dans l'artefact `coverage` de la CI.

## Risques restant hors tests unitaires

- Le rendu réel d'un e-mail varie selon les clients de messagerie.
- La qualité sémantique des recettes et images d'un fournisseur réel exige un
  benchmark distinct.
- Les fuseaux avec changements d'heure doivent aussi être vérifiés sur une
  horloge contrôlée en intégration.
- Les comportements propres à Safari/iOS et aux lecteurs d'écran exigent les
  tests manuels prévus.
- Les pannes réseau et reprises longues relèvent des tests de résilience.
