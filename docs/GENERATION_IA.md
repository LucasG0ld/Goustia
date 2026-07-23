# Génération IA : adaptateurs, orchestration, images et quotas

Date de référence : 23 juillet 2026

## Architecture livrée

La génération réelle reste exclusivement côté serveur. Le navigateur appelle :

- `POST /api/v1/recipe-generations` pour créer une tâche idempotente ;
- `GET /api/v1/recipe-generations/{jobId}` pour suivre son état ;
- `GET /api/v1/ai-quota` pour connaître uniquement son quota utile ;
- `POST /api/v1/admin/recipes/{recipeId}/image` pour une régénération d’image
  réservée aux administrateurs.

L’orchestration vérifie la session et les quotas, construit le profil
pseudonymisé, génère un lot, valide le JSON, normalise les ingrédients, exécute
le contrôle alimentaire, calcule la nutrition Ciqual, déduplique, stocke
uniquement les recettes sûres, puis génère leurs images.

Les états observables sont `queued`, `profile`, `generation`, `validation`,
`nutrition`, `storage`, `images`, `completed` et `failed`. L’API ne retourne
jamais les erreurs techniques, les coûts globaux ou les secrets fournisseur.

## Fournisseurs et résilience

Les interfaces internes sont `RecipeGenerator` et `RecipeImageGenerator`. La
fabrique sélectionne :

- Groq pour le texte principal ;
- Cloudflare Workers AI pour le texte de secours ;
- FLUX.2 Klein 4B pour l’image principale ;
- FLUX.1 Schnell pour l’image de secours ;
- les fournisseurs `fake` déterministes pour les tests hors réseau.

Chaque appel dispose d’un délai maximal, de retries exponentiels, de la prise en
compte de `retry-after`, d’erreurs normalisées et d’un coupe-circuit mémoire.
Les quotas et le plafond de coût sont aussi persistés dans PostgreSQL.

Références officielles vérifiées :

- [sorties structurées Groq](https://console.groq.com/docs/structured-outputs) ;
- [tarification GPT-OSS 120B](https://console.groq.com/docs/model/openai/gpt-oss-120b)
  ;
- [API REST Workers AI](https://developers.cloudflare.com/workers-ai/get-started/rest-api/)
  ;
- [FLUX.2 Klein 4B](https://developers.cloudflare.com/workers-ai/models/flux-2-klein-4b/)
  ;
- [FLUX.1 Schnell](https://developers.cloudflare.com/workers-ai/models/flux-1-schnell/)
  ;
- [tarification Workers AI](https://developers.cloudflare.com/workers-ai/platform/pricing/).

## Prompts et protection contre les injections

Les versions actives sont `recipe-prompt.v1`, `recipe-image-prompt.v1` et
`goustia-food-photo.v1`.

Le prompt système et les données sont séparés. Le profil est sérialisé dans une
balise dédiée dont le contenu est déclaré comme donnée non exécutable. Les
schémas interdisent les propriétés supplémentaires et n’acceptent ni nom,
e-mail, date de naissance, ni identifiant de compte.

Le modèle doit répondre en français, respecter le schéma, les quantités, les
exclusions et la cohérence des étapes. Il ne calcule jamais la nutrition et
n’est jamais l’autorité finale pour les allergies ou l’alcool.

Voir le [changelog des prompts](prompts/CHANGELOG.md).

## Pipeline d’images

Une image est demandée seulement après validation et stockage de la recette. La
clé `(recipe_id, generation_key)` empêche une double génération logique. Une
image prête est réutilisée pour toutes les occurrences de la recette canonique.

Le traitement serveur avec Sharp décode réellement l’image, exige au moins 512 ×
512 pixels, recadre en 1024 × 768, convertit en WebP qualité 82, refuse plus de
2 Mo, calcule un SHA-256 puis stocke les métadonnées techniques.

En cas d’échec, la recette reste utilisable avec
`/images/recipe-placeholder.svg`. La carte affiche toujours « Image illustrative
». Une régénération admin conserve l’ancien fichier et marque son enregistrement
comme remplacé avant de produire la nouvelle image.

## Quotas, coûts et modes dégradés

Valeurs initiales, toutes configurables :

- 14 recettes par utilisateur et par jour ;
- 500 recettes globales par jour ;
- plafond de coupure estimé à 10 USD par jour.

La fonction PostgreSQL `reserve_ai_generation_job` verrouille puis contrôle les
compteurs avant de créer la tâche. Deux appels concurrents ne peuvent pas
dépasser le plafond. La même clé d’idempotence retourne la tâche existante sans
recompter.

Chaque appel réussi enregistre fournisseur, modèle, jetons, neurons, images et
coût estimé. Les références actuelles sont 0,15 USD/M jetons d’entrée et 0,60
USD/M jetons de sortie pour GPT-OSS 120B sur Groq, et 0,011 USD/1 000 neurons
au-delà de l’allocation gratuite Cloudflare. Ces tarifs doivent être revérifiés
avant la production.

Alertes : 50 %, 80 %, 95 % et blocage à 100 %. Les modes dégradés sont :

- `fallback_provider` : le fournisseur secondaire a répondu ;
- `cache` : réutilisation d’un lot antérieur dont le profil pseudonymisé
  correspond exactement ;
- `without_image` : recette sûre disponible avec illustration générique.

Le détail global est exposé uniquement par la vue RLS `admin_ai_usage_daily`.
L’utilisateur reçoit seulement utilisé, limite, restant, seuil d’alerte et date
de remise à zéro.

## Activation locale

Sans clé externe :

```dotenv
AI_GENERATION_ENABLED=true
AI_TEXT_PROVIDER=fake
AI_TEXT_FALLBACK_PROVIDER=fake
AI_IMAGE_PROVIDER=fake
```

Pour les fournisseurs réels, suivre
[`RUNBOOK_FOURNISSEURS_IA.md`](RUNBOOK_FOURNISSEURS_IA.md). Ne jamais activer la
production avant le benchmark P35 et la validation humaine des seuils.

Le corpus et le runner de P35 sont disponibles avec `npm run benchmark:ai`. La
baseline locale est documentée dans
[`benchmarks/2026-07-23-fake-baseline.md`](benchmarks/2026-07-23-fake-baseline.md).
La comparaison réelle Groq/Cloudflare et l’acceptation humaine des seuils
restent obligatoires avant toute activation de production.
