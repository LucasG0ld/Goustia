# Décisions produit à arbitrer

Statut : **recommandations réversibles, non implémentées**  
Périmètre : MVP web en France.

Ces valeurs permettent de poursuivre la conception sans prétendre remplacer un
avis juridique, médical ou nutritionnel. Elles ne seront ajoutées au paquet
`@recettes/domain` qu'après validation du responsable produit.

| Sujet         | Question à trancher                             | Recommandation et valeur par défaut                                                                                                | Conséquence principale                                                           |
| ------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Public        | Qui sert-on d'abord ?                           | Adultes en France, seuls, en couple ou foyer de 1 à 4 personnes, souhaitant planifier les déjeuners et dîners                      | Cible lisible et onboarding court                                                |
| Âge minimum   | Les mineurs peuvent-ils créer un compte ?       | **18 ans au MVP**; ouvrir les mineurs dans une phase dédiée                                                                        | Réduit le risque juridique et rend l'autorisation parentale inutile au lancement |
| Mineurs       | Que faire si la cible est élargie ?             | Consentement du représentant légal et blocage déterministe de toute recette alcoolisée avant 18 ans                                | Flux légal et modèle de consentement supplémentaires                             |
| Pays          | Où lancer ?                                     | France métropolitaine uniquement                                                                                                   | Langue, unités, disponibilité et droit mieux maîtrisés                           |
| Repas         | Quels moments couvrir ?                         | Déjeuner et dîner; petit-déjeuner et collations plus tard                                                                          | Réduit taxonomie et écrans                                                       |
| Repas/semaine | Quel maximum ?                                  | 14 repas, de 1 à 14                                                                                                                | Deux repas par jour sur sept jours                                               |
| Portions      | Quel maximum ?                                  | 1 à 8 personnes                                                                                                                    | Suffisant pour le cœur de cible sans quantités extrêmes                          |
| Régénération  | Combien de plans complets ?                     | 3 régénérations complètes par semaine; 5 swaps par jour                                                                            | Protège les quotas IA tout en laissant du contrôle                               |
| Objectifs     | Comment interpréter perte, équilibre et masse ? | Des profils de sélection non médicaux; priorité à satiété/densité énergétique, variété, ou protéines                               | Évite des promesses cliniques                                                    |
| Nutrition     | Fourchette ou valeur précise ?                  | Fourchettes calculées depuis Ciqual, avec tolérance explicite                                                                      | Plus honnête face aux variations d'ingrédients                                   |
| Répétitions   | Quand reproposer une recette ?                  | 28 jours après dislike, 14 jours si neutre, 7 jours si likée; jamais après allergie/exclusion                                      | Variété sans oublier les favoris                                                 |
| Dislike       | Que signifie un dislike sans motif ?            | Signal négatif faible sur la recette, sans extrapoler à tous ses ingrédients                                                       | Limite le surapprentissage                                                       |
| Swaps répétés | Que faire après plusieurs remplacements ?       | Après 2 swaps, demander un motif facultatif; après 3, proposer des alternatives déjà validées et arrêter la génération automatique | Évite boucle frustrante et coût excessif                                         |
| Sans compte   | Que montrer publiquement ?                      | Landing, fonctionnement et quelques recettes de démonstration; aucune personnalisation sauvegardée                                 | Valeur visible sans exposer des données                                          |
| E-mail        | Quand vérifier l'adresse ?                      | Autoriser l'onboarding, exiger la vérification avant la première génération IA persistée                                           | Réduit l'abus sans casser l'inscription                                          |

## Précisions recommandées

### Objectifs alimentaires

- **Perte de poids** : recettes rassasiantes, riches en légumes et à densité
  énergétique modérée; pas de déficit calorique individuel sans données et
  supervision appropriées.
- **Équilibre** : variété des groupes alimentaires et alternance des sources de
  protéines.
- **Prise de masse** : portions et protéines plus élevées, sans présenter le
  résultat comme une prescription.
- **Sans objectif spécifique** : goûts, exclusions, disponibilité et variété
  priment.

Une allergie, intolérance ou exclusion stricte prévaut toujours sur les goûts et
objectifs.

## Arbitrages nécessaires avant le modèle de données

Les décisions les plus structurantes sont :

1. âge minimum et éventuelle gestion du consentement parental ;
2. nombre de repas et de portions ;
3. quotas de génération ;
4. définition non médicale des objectifs ;
5. accès avant vérification de l'e-mail.

Après validation, les contraintes numériques seront centralisées dans
`@recettes/domain`, et chaque règle exécutable recevra des tests unitaires.
