# Politique de sécurité des dépendances

## Contrôles

- Dependabot recherche les mises à jour npm chaque semaine.
- `npm run audit` bloque sur les vulnérabilités hautes ou critiques.
- Les mises à jour automatiques forcées et les changements de version majeure ne
  sont jamais appliqués sans tests.
- Avant chaque mise en production : installation verrouillée, audit, tests et
  build depuis un environnement propre.

## Exceptions ouvertes au 23 juillet 2026

`npm audit` remonte trois vulnérabilités transitives depuis Next.js 16.2.11 :

| Composant          | Avis                                                                                                                                               | Sévérité | Décision                             |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------ |
| PostCSS `<=8.5.11` | [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93), [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q) | Haute    | Acceptée uniquement en développement |
| Sharp `<0.35.0`    | [GHSA-f88m-g3jw-g9cj](https://github.com/advisories/GHSA-f88m-g3jw-g9cj)                                                                           | Haute    | Acceptée uniquement en développement |

npm propose une rétrogradation forcée de Next.js vers 9.3.3. Cette correction
est incompatible avec l'architecture et n'est pas sûre; elle n'a pas été
appliquée.

Mesures :

- ne pas mettre cette version en production tant qu'une version compatible de
  Next.js n'intègre pas les dépendances corrigées ou qu'une mitigation testée
  n'est pas documentée ;
- ne pas transformer du CSS ou des images non fiables hors des contrôles prévus
  ;
- réévaluer après chaque publication Next.js et au plus tard le 23 août 2026 ;
- fermer l'exception seulement après `npm run audit` et `npm run build`
  concluants.

Cette acceptation est temporaire, attribuée au responsable technique du projet
et ne vaut pas acceptation pour la production.
