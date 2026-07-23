# Décisions produit du MVP web

Statut : **validées par le responsable produit le 23 juillet 2026**

Périmètre : MVP web en France.

Ces valeurs structurent le MVP sans prétendre remplacer un avis juridique,
médical ou nutritionnel. Les contraintes exécutables sont centralisées dans
`@recettes/domain`.

| Sujet         | Décision validée                                                                                           | Conséquence principale                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Public        | Adultes en France, seuls, en couple ou foyer de 1 à 4 personnes, souhaitant planifier déjeuners et dîners  | Cible lisible et onboarding court                                                |
| Âge minimum   | **18 ans au MVP**                                                                                          | Réduit le risque juridique et rend l'autorisation parentale inutile au lancement |
| Mineurs       | Non pris en charge au MVP; phase dédiée si la cible est élargie                                            | Flux légal supplémentaire reporté                                                |
| Pays          | France métropolitaine uniquement                                                                           | Langue, unités, disponibilité et droit mieux maîtrisés                           |
| Repas         | Déjeuner et dîner; petit-déjeuner et collations plus tard                                                  | Réduit taxonomie et écrans                                                       |
| Repas/semaine | De 1 à 14                                                                                                  | Deux repas par jour sur sept jours                                               |
| Portions      | De 1 à 8 personnes                                                                                         | Suffisant pour le cœur de cible sans quantités extrêmes                          |
| Régénération  | 3 régénérations complètes par semaine; 5 swaps par jour                                                    | Protège les quotas IA tout en laissant du contrôle                               |
| Objectifs     | Profils de sélection non médicaux : satiété/densité énergétique, variété ou protéines                      | Évite des promesses cliniques                                                    |
| Nutrition     | Fourchettes calculées depuis Ciqual, avec tolérance explicite                                              | Plus honnête face aux variations d'ingrédients                                   |
| Répétitions   | 28 jours après dislike, 14 jours si neutre, 7 jours si likée; jamais après allergie/exclusion              | Variété sans oublier les favoris                                                 |
| Dislike       | Sans motif : signal négatif faible sur la recette uniquement                                               | Limite le surapprentissage                                                       |
| Swaps répétés | Après 2 swaps, motif facultatif; après 3, alternatives déjà validées et arrêt de la génération automatique | Évite boucle frustrante et coût excessif                                         |
| Sans compte   | Landing, fonctionnement et recettes de démonstration; aucune personnalisation sauvegardée                  | Valeur visible sans exposer des données                                          |
| E-mail        | Onboarding autorisé; vérification requise avant la première génération IA persistée                        | Réduit l'abus sans casser l'inscription                                          |

## Précisions validées

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

## Implémentation

`@recettes/domain` expose les limites, les quotas, les délais de répétition, la
progression des swaps, la vérification d'e-mail et les règles d'âge. Les schémas
d'onboarding limitent désormais les repas à 14 et les portions à 8.
