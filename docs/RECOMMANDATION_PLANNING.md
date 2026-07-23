# Recommandation, apprentissage et planning

## Moteur déterministe

Le filtrage absolu et le scoring sont séparés dans
`packages/domain/src/recommendation.ts`.

Le filtrage élimine avant tout calcul :

- les ingrédients et allergènes strictement exclus ;
- l’alcool lorsque le profil ne l’autorise pas ;
- les recettes incompatibles avec le régime alimentaire.

Une recette exclue ne peut donc pas être réintroduite par un score élevé. Les
recettes restantes reçoivent un score explicite et stable : ingrédients et
cuisines appréciés, goûts négatifs, récence, durée, budget, objectif et
diversité de la semaine. Les égalités sont départagées par identifiants stables.
L’explication affichée ne mentionne jamais une allergie, l’âge ou une autre
donnée sensible.

## Apprentissage par interaction

Les signaux `like`, favori, cuisiné, dislike motivé, swap et ignorance ont des
poids distincts. Leur influence diminue dans le temps, les conflits sont
additionnés avec un plafond et un événement annulé vaut zéro.

Les tables `preference_learning_events` et `learned_preferences` conservent
respectivement l’historique et l’état déduit. Les valeurs déduites peuvent être
corrigées sans effacer l’historique. Le type de sujet ne contient volontairement
aucune allergie : une préférence ne peut pas modifier `user_food_constraints`.

`POST /api/v1/preferences/signals` accepte rapidement l’événement puis calcule
la préférence après la réponse HTTP. `PATCH /api/v1/preferences/learned` permet
la correction. `DELETE /api/v1/preferences/signals/:eventId` annule un signal
sans supprimer son historique.

## Shell authentifié

Les routes `/accueil`, `/planning`, `/courses`, `/favoris` et `/profil`
utilisent un layout authentifié commun. Les données restent chargées par des
Server Components ; seuls la navigation active et le planning modifiable sont
des îlots clients. Une barre inférieure remplace la navigation supérieure sous
768 px.

L’accueil présente la semaine active, l’état de génération, les recettes,
durées, portions, nutrition estimée, tags et une explication courte. Les états
vide, chargement et erreur récupérable ont une interface dédiée.

## Mutations du planning

Les mutations passent par `apply_planned_meal_mutation` :

- ajout, déplacement, changement de type, portions et verrouillage ;
- suppression ;
- régénération des seuls repas non verrouillés ;
- clé d’idempotence obligatoire ;
- révision attendue obligatoire pour détecter un onglet obsolète ;
- verrou PostgreSQL et contrainte unique pour protéger les créneaux.

Un conflit retourne HTTP 409 et invite à recharger. La régénération demande une
confirmation, réserve le quota IA, conserve les recettes actuelles pendant le
traitement puis remplace atomiquement les repas non verrouillés. En cas d’échec,
les anciennes affectations restent présentes.

Les types de repas retenus pour le MVP restent déjeuner et dîner, conformément à
la décision produit. La vue mobile affiche un jour à la fois et toutes les
opérations sont disponibles sans glisser-déposer.
