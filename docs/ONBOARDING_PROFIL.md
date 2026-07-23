# Onboarding court et profil progressif — P21 à P23

Statut : **implémenté et testé localement le 23 juillet 2026**.

## Parcours essentiel

1. compte adulte et acceptation versionnée des documents ;
2. contraintes alimentaires ou confirmation explicite de leur absence ;
3. objectif, nombre de repas et portions ;
4. huit cartes de plats facultatives ;
5. première génération déterministe via le fournisseur `fake`.

Chaque étape est sauvegardée dans `onboarding_steps`. La route `/onboarding`
reprend au bon endroit après une interruption. La génération utilise une clé
d’idempotence et son écran peut être rechargé sans créer une seconde tâche.

## Garanties de sécurité

- la date de naissance reste en base ; seul un contexte booléen d’âge peut être
  transmis à un futur pipeline IA ;
- une soumission de sécurité vide est refusée sauf choix explicite « aucune
  contrainte » ;
- les contraintes contradictoires ou inconnues annulent toute la transaction ;
- une carte ignorée ne crée aucune réaction ;
- un ingrédient non aimé est stocké dans `user_ingredient_preferences`, jamais
  dans `user_food_constraints` ;
- la génération réelle reste interdite : le fournisseur local `fake` est le seul
  utilisé par ce parcours.

## Profil progressif

La page `/profil-alimentaire` permet de corriger régime, niveau, durée, budget,
cuisines, équipement et goûts. Les préférences indiquent leur provenance
`explicit`, `interaction` ou `inferred`.

Le taux de complétion réserve 60 % aux trois étapes essentielles et 40 % aux
sept groupes facultatifs. Le moteur contextuel attend trois actions utiles,
propose au maximum une question par période de sept jours et permet de l’ignorer
pendant trente jours.

## Analytics minimisés

`onboarding_events` contient uniquement étape, type d’événement et éventuelle
tranche de durée. Il ne reçoit jamais nom, e-mail, date de naissance, allergie,
ingrédient ou texte libre. Les événements détaillés expirent après 90 jours.
