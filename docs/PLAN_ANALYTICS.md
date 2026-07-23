# Plan analytics du MVP web

Statut : **plan proposé, aucun compte externe créé**

## Outil recommandé

**Umami Cloud, région UE, offre Hobby gratuite** est recommandé pour le MVP.
Umami est léger, gère les événements personnalisés, ne pose pas de cookie dans
sa configuration standard et annonce ne pas collecter de donnée personnelle. Il
peut ensuite être auto-hébergé si le contrôle des données devient prioritaire.

Sources officielles consultées le 23 juillet 2026 :

- [Présentation et principes de confidentialité](https://docs.umami.is/docs)
- [FAQ de l'offre Cloud](https://docs.umami.is/docs/cloud/faq)
- [Envoi d'événements](https://docs.umami.is/docs/api/sending-stats)

Ce choix n'exonère pas d'une revue RGPD et d'une information claire dans la
politique de confidentialité. La session replay, les heatmaps, le fingerprinting
et l'identification nominative resteront désactivés.

## Règles de collecte

- ne jamais envoyer e-mail, nom, date de naissance, texte libre, allergies,
  ingrédients exclus ou titre de recette ;
- utiliser uniquement des catégories fermées et des identifiants techniques non
  réversibles ;
- ne jamais placer de données personnelles dans les URL ;
- séparer la télémétrie produit anonyme des journaux serveur de coûts IA ;
- documenter tout nouvel événement avant son ajout ;
- viser 13 mois de conservation agrégée et 90 jours maximum pour les événements
  détaillés, à confirmer juridiquement et techniquement.

## Événements produit

| Événement                   | Déclencheur                               | Propriétés autorisées                                    | Finalité                      | Tableau        |
| --------------------------- | ----------------------------------------- | -------------------------------------------------------- | ----------------------------- | -------------- |
| `signup_started`            | Premier affichage du formulaire           | `source`, `device_type`                                  | Mesurer l'entrée du tunnel    | Acquisition    |
| `signup_completed`          | Compte créé                               | `source`, `duration_bucket`                              | Conversion d'inscription      | Acquisition    |
| `onboarding_step_viewed`    | Affichage d'une étape                     | `step`, `step_index`                                     | Localiser les abandons        | Onboarding     |
| `onboarding_step_completed` | Étape validée                             | `step`, `duration_bucket`                                | Mesurer effort et progression | Onboarding     |
| `onboarding_completed`      | Profil minimum enregistré                 | `total_duration_bucket`, `meal_count_bucket`             | Taux de fin                   | Onboarding     |
| `first_plan_requested`      | Première demande                          | `meal_count_bucket`                                      | Début du délai vers la valeur | Activation     |
| `first_plan_ready`          | Premier plan validé et affichable         | `latency_bucket`, `recipe_count_bucket`, `fallback_used` | Activation et performance     | Activation     |
| `recipe_reaction_recorded`  | Like ou dislike                           | `reaction`, `reason_category`, `surface`                 | Pertinence des recettes       | Recommandation |
| `recipe_swapped`            | Remplacement réussi                       | `reason_category`, `attempt_bucket`, `source`            | Friction et qualité           | Recommandation |
| `recipe_cooked`             | Utilisateur marque le plat cuisiné        | `planned_week_offset`, `was_swapped`, `was_liked`        | Usage réel                    | Engagement     |
| `weekly_active`             | Première activité utile de la semaine ISO | `cohort_week`, `weeks_since_signup_bucket`               | Rétention hebdomadaire        | Rétention      |

`reason_category` est une valeur fermée telle que `taste`, `time`, `ingredient`,
`difficulty`, `already_eaten` ou `other`; aucun commentaire libre n'est envoyé.

## Événements techniques IA

Ces événements sont émis côté serveur dans un stockage technique séparé.

| Événement                 | Propriétés autorisées                                                                                             | Finalité                       |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `ai_generation_completed` | `provider`, `model`, `kind`, `latency_ms`, `input_tokens`, `output_tokens`, `estimated_cost_eur`, `fallback_used` | Qualité de service et coût     |
| `ai_generation_failed`    | `provider`, `model`, `kind`, `error_category`, `retry_count`                                                      | Fiabilité et alertes           |
| `ai_safety_rejected`      | `check_category`, `generation_stage`, `provider`                                                                  | Contrôle du moteur de sécurité |
| `ai_quota_rejected`       | `quota_type`, `scope`                                                                                             | Ajuster les limites            |

Ni prompt, ni réponse brute, ni préférences utilisateur ne doivent apparaître
dans ces événements.

## KPI et cibles initiales

| KPI                        | Calcul                                            | Cible MVP proposée |                          Alerte |
| -------------------------- | ------------------------------------------------- | -----------------: | ------------------------------: |
| Fin d'onboarding           | `onboarding_completed / signup_completed`         |             ≥ 70 % |              < 55 % sur 7 jours |
| Délai vers le premier plan | p50 entre demande et plan prêt                    |            ≤ 2 min |                     p95 > 5 min |
| Succès de génération       | Plans prêts / demandes valides                    |             ≥ 95 % |                  < 90 % sur 1 h |
| Acceptation des recettes   | Recettes sans dislike ni swap / recettes vues     |             ≥ 65 % |              < 50 % sur 7 jours |
| Recettes cuisinées         | Recettes marquées cuisinées / recettes planifiées |             ≥ 25 % | Suivi, sans alerte au lancement |
| Rétention S1→S2            | Actifs semaine 2 / cohorte semaine 1              |             ≥ 30 % |                          < 20 % |
| Coût IA                    | Somme estimée / utilisateur actif hebdomadaire    |           ≤ 0,10 € |                        > 0,20 € |
| Sécurité                   | Recette affichée malgré exclusion stricte connue  |                  0 |                Toute occurrence |

Ces seuils sont des hypothèses de lancement, à recalibrer après la bêta.

## Tableaux de bord cibles

1. **Acquisition et onboarding** : tunnel inscription → profil → premier plan.
2. **Activation** : délai, succès et erreurs de première génération.
3. **Recommandation** : likes, dislikes, swaps, motifs et recettes cuisinées.
4. **Rétention** : cohortes hebdomadaires.
5. **IA et sécurité** : latence, fournisseurs, fallback, coûts, rejets et
   dépassements.

## Mise en œuvre différée

L'instrumentation sera ajoutée après validation de ce plan. Elle nécessitera la
création volontaire d'un compte Umami Cloud UE et un identifiant de site public,
mais aucune clé n'est requise pour ce lot.
