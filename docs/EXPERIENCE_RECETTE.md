# Expérience planning et recette

Ce document décrit les contrats livrés par les prompts P40 à P44.

## Semaines

- Une semaine est identifiée par son lundi au format `YYYY-MM-DD`.
- Le calcul de la semaine courante utilise explicitement `Europe/Paris`.
- L’URL partageable est `/planning?semaine=YYYY-MM-DD` et ne contient aucun
  identifiant utilisateur.
- La copie est transactionnelle, verrouillée par utilisateur et semaine cible,
  et ne duplique jamais les repas d’une semaine déjà remplie.
- La lecture reste protégée par la RLS : partager l’URL ne partage pas les
  données du compte.

## Fiche recette

La route `/recettes/[recipeId]` affiche la dernière version validée et visible.
Elle expose les temps, le coût, la nutrition par portion, les allergènes, le
matériel, les ingrédients, les étapes, les substitutions, les variantes, les
astuces, la conservation et le réchauffage.

Avant l’affichage, le serveur recontrôle les exclusions absolues, les allergènes
et l’alcool selon la date de naissance. Une recette incompatible est masquée ;
une recette archivée ou retirée dispose d’un état dédié.

## Interactions et apprentissage

- `J’aime` exprime un avis ; `Favori` conserve une recette.
- Le dislike accepte un motif fermé, une précision libre facultative ou aucun
  motif. La précision libre n’entre pas dans les analytics.
- Les actions sont protégées contre les doubles clics et tracées avec une clé
  d’idempotence.
- Les signaux appris ciblent uniquement le plat (`dish_type`) : ils ne créent
  jamais une allergie ou une exclusion alimentaire.
- L’annulation d’un avis ou d’un favori marque le signal correspondant comme
  révoqué.
- Les événements produit ne contiennent que l’action, la surface et une
  catégorie de motif ; leur rétention est limitée à 90 jours.

## Mode cuisine

Les quantités sont recalculées de 1 à 8 portions. Le mode cuisine fournit de
grands contrôles, des étapes cochables, des minuteurs et demande le Wake Lock
quand le navigateur le permet. La progression et le minuteur sont conservés
localement afin de reprendre après une fermeture ou un rafraîchissement.

## Remplacement

La recherche retourne au plus trois recettes compatibles. Elle peut préserver
les calories, les protéines, le budget et la durée, et interprète une demande
libre non contradictoire. Le serveur revalide la sélection juste avant le swap.

Le remplacement et le quota sont appliqués dans une même transaction. Une
relecture de la même clé ne consomme pas de quota supplémentaire. En cas de
conflit, d’indisponibilité ou d’échec, le repas courant reste inchangé. Le quota
local de référence est de cinq remplacements par jour UTC.
