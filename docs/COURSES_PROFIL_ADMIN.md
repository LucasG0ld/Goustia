# Courses, profil et administration — P45 à P49

## Liste de courses

La liste active est rattachée au planning de la semaine et à sa révision. La
génération est transactionnelle et idempotente :

- les quantités sont adaptées aux portions avant agrégation ;
- `g`/`kg` et `ml`/`l` sont convertis dans une unité commune ;
- une conversion masse/volume ou pièce/masse n'est appliquée que lorsqu'une
  conversion revue existe pour l'ingrédient ;
- les unités incompatibles et les quantités « au goût » restent séparées ;
- l'arrondi intervient après l'agrégation ;
- chaque ligne conserve les versions de recettes qui en sont à l'origine ;
- une régénération remplace les lignes issues du planning, mais conserve les
  ajouts manuels.

La procédure `replace_generated_shopping_items` refuse une révision obsolète du
planning. `mutate_shopping_list` centralise l'ajout, la modification, le
cochage, la suppression et la réinitialisation confirmée. Les mutations sont
idempotentes et soumises aux politiques RLS.

L'interface `/courses` propose les groupes par rayon, le mode « déjà disponible
», le masquage des lignes cochées, l'édition, le texte copiable, l'impression,
le partage natif et l'export CSV. Un instantané local maintient la liste
consultable lors d'une perte de réseau. L'estimation de prix reste masquée tant
qu'aucune source suffisamment fiable n'est intégrée.

## Favoris, historique et profil

`/favoris` et `/historique` appliquent recherche, filtres, tri et pagination
côté serveur. Une ancienne recette peut être replacée dans le planning courant,
uniquement si elle est encore éligible.

`user_recipe_eligibility` est recalculée après chaque changement de contrainte
alimentaire. Le calcul tient compte des ingrédients parents, des allergènes et
de l'alcool. Une recette devenue incompatible reste visible avec la raison, mais
ne peut plus être réutilisée.

`/profil` permet de modifier l'objectif, le rythme, les portions et les
contraintes strictes. La suppression d'une allergie ou exclusion exige la saisie
exacte de `RETIRER`, puis relance le calcul d'éligibilité. Les préférences
apprises sont affichées et corrigeables, sans jamais être transformées en règle
de sécurité. Les goûts, le budget, la durée, le niveau, les équipements et la
complétion restent gérés par `/profil-alimentaire`.

## Administration

L'espace `/admin` utilise une mise en page distincte. Chaque route serveur et
chaque RPC vérifie le rôle administrateur. En production, l'accès serveur exige
également le niveau d'assurance `aal2`. Une suspension rend
`app_private.is_admin()` faux immédiatement, y compris pour une session déjà
ouverte. La clé de service reste exclusivement dans les modules serveur.

L'annuaire administrateur n'expose que l'identité minimale, les dates
d'activité, le statut du compte et l'état d'une éventuelle demande de
suppression. Suspension, réactivation et traitement d'une suppression exigent
une phrase de confirmation et produisent un événement d'audit idempotent.

La gestion de contenu prend en charge :

- recherche et filtres de validation/publication ;
- consultation des notes d'erreur ;
- validation ou rejet d'une version ;
- publication et dépublication réversibles ;
- correction par création d'une nouvelle version privée à revalider ;
- régénération d'image ;
- traitement des signalements ;
- blocage réversible d'un ingrédient ou d'une association.

Une publication relit toujours l'état de validation, la présence des ingrédients
et étapes, ainsi que les règles de blocage actives. Une correction ne modifie
donc jamais silencieusement la version déjà publiée.

## Vérifications

Les tests métier couvrent les portions, unités, densités, incompatibilités,
arrondis, provenance et ordre des rayons. Les tests de base vérifient la
préservation des ajouts manuels, l'idempotence, les RLS et le refus des droits
administrateur pour un compte normal ou suspendu. L'interface magasin est testée
en affichage responsive, hors ligne et avec un contrôle d'accessibilité
structurelle.
