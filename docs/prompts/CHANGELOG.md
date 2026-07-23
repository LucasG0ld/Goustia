# Changelog des prompts IA

Les versions sont immuables. Toute modification de comportement crée une
nouvelle version, met à jour les snapshots et repasse le benchmark.

## recipe-prompt.v1 — 23 juillet 2026

- première version structurée en français ;
- séparation explicite instructions/données ;
- schéma `recipe-generation.v1` strict ;
- exclusions, allergies et alcool imposés ;
- quantités réalistes et cohérence ingrédients/étapes ;
- nutrition réservée au calcul Ciqual ;
- prompt visuel sans donnée utilisateur ;
- un exemple de qualité versionné.

Critères de sortie :

- 100 % de JSON valides ;
- aucune propriété hors schéma ;
- aucune donnée personnelle directe ;
- zéro violation d’allergie, exclusion stricte ou alcool ;
- tous les ingrédients obligatoires utilisés dans les étapes ;
- quantités positives et compatibles avec 1 à 8 portions ;
- français naturel ;
- diversité et qualité à mesurer dans le benchmark P35.

## recipe-image-prompt.v1 — 23 juillet 2026

- photographie culinaire réaliste ;
- lumière naturelle, cadrage trois-quarts et vaisselle sobre ;
- aucun texte, logo ou personne ;
- contenu cohérent avec la recette ;
- aucune préférence ou donnée de profil transmise.

## goustia-food-photo.v1 — 23 juillet 2026

- sortie 4:3 en 1024 × 768 ;
- WebP optimisé ;
- mention produit obligatoire « Image illustrative ».
