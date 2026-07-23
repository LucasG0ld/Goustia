# Import ANSES-Ciqual 2025

## Source retenue

Goustia utilise la table française officielle :

- source : **Anses, Table de composition nutritionnelle des aliments Ciqual
  2025, version du 3 novembre 2025** ;
- DOI : [`10.57745/RDMHWY`](https://doi.org/10.57745/RDMHWY) ;
- [fichier XLSX officiel](https://ciqual.anses.fr/cms/sites/default/files/inline-files/Table%20Ciqual%202025_FR_2025_11_03.xlsx)
  ;
- [documentation officielle](https://ciqual.anses.fr/cms/sites/default/files/inline-files/Table%20Ciqual%202025%20doc%20FR_2025_11_19.pdf)
  ;
- licence :
  [Licence Ouverte 2.0](https://www.etalab.gouv.fr/wp-content/uploads/2017/04/ETALAB-Licence-Ouverte-v2.0.pdf).

La réutilisation doit conserver le sens des données et mentionner l’Anses ainsi
que la date du millésime. Goustia reste responsable de ses rapprochements et de
ses calculs.

## Périmètre importé

L’import conserve les **3 484 aliments** du fichier et les six constituants
affichés par le MVP :

| Code Ciqual | Donnée                      | Unité |
| ----------- | --------------------------- | ----- |
| `328`       | Énergie UE 1169/2011        | kcal  |
| `25000`     | Protéines, facteur de Jones | g     |
| `31000`     | Glucides                    | g     |
| `40000`     | Lipides                     | g     |
| `34100`     | Fibres alimentaires         | g     |
| `10004`     | Sel, chlorure de sodium     | g     |

Les valeurs sont données pour 100 g. Les autres constituants pourront être
ajoutés dans une nouvelle version si une fonctionnalité vérifiée les nécessite.

Les chaînes `traces`, les bornes `< x` et les absences `-` sont stockées
distinctement. Elles ne deviennent jamais artificiellement zéro.

## Import reproductible

Prérequis : Supabase local démarré et taxonomie importée.

```bash
npm run supabase:reset
npm run supabase:taxonomy:import
npm run supabase:ciqual:import
```

Le script :

1. télécharge le fichier depuis le domaine officiel de l’Anses ;
2. vérifie son SHA-256
   `d2082938522d909119fbdc8772c028017163650dd81e31d13fdb8a8bd702f32e` ;
3. vérifie le nombre d’aliments, l’unicité des codes et plusieurs témoins ;
4. importe par lots de manière idempotente ;
5. rapproche les 20 ingrédients du benchmark ;
6. active le millésime uniquement après l’import complet.

Pour un environnement sans accès réseau, `CIQUAL_SOURCE_FILE` peut pointer vers
une copie du fichier dont l’empreinte est identique.

## Rapprochements

[`data/ciqual-mappings.fr.v1.json`](../data/ciqual-mappings.fr.v1.json) contient
le statut, la confiance et la justification de chaque correspondance.

- `exact` : correspondance directe ;
- `approximate` : forme, variété ou cuisson choisie par défaut ;
- `unmatched` : aucune correspondance suffisamment fiable, donc pas de calcul.

Une correspondance approximative diminue la confiance du calcul. Elle ne doit
pas être présentée comme une mesure exacte.

## Mise à jour future

Lors d’un nouveau millésime :

1. télécharger le nouveau fichier et sa documentation ;
2. vérifier la licence, le DOI, la date et l’attribution ;
3. calculer le SHA-256 sans remplacer l’ancien millésime ;
4. créer un nouvel identifiant `ciqual-AAAA-MM-JJ` ;
5. vérifier les colonnes, le volume, les doublons, traces et valeurs témoins ;
6. revoir chaque rapprochement interne ;
7. exécuter la suite SQL et les tests numériques ;
8. basculer `is_current` seulement après validation ;
9. conserver l’ancien millésime pour la traçabilité des recettes déjà calculées.
