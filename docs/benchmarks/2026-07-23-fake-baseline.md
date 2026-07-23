# Benchmark IA — baseline locale du 23 juillet 2026

## Statut

Baseline technique reproductible, **non validée pour la production**. Les seuils
de sortie et la qualité visuelle doivent être acceptés humainement après une
comparaison réelle Groq/Cloudflare sur staging.

## Corpus

- 60 profils strictement fictifs et pseudonymes ;
- 15 profils mineurs et 45 adultes ;
- allergies simples et multiples, exclusions et goûts négatifs ;
- quatre objectifs, quatre tailles de portions et quatre types de repas ;
- six familles visuelles de plats.

Le corpus est généré de manière déterministe par
`scripts/ai-benchmark-corpus.mjs`. Il ne contient aucun nom, e-mail, date de
naissance exacte ou identifiant de production.

## Baseline factice

Commande :

```bash
npm run benchmark:ai -- --providers=fake --json
```

| Mesure                         | Résultat |
| ------------------------------ | -------: |
| Respect du format              |     100% |
| Allergies et exclusions        |     100% |
| Interdiction d’alcool          |     100% |
| Quantités positives            |     100% |
| Cohérence ingrédients / étapes |     100% |
| Heuristique de français        |     100% |
| Diversité des titres           |     100% |
| Prompt image conforme          |     100% |

Cette baseline vérifie le runner, pas la qualité d’un modèle.

## Comparaison réelle à exécuter

```bash
npm run benchmark:ai -- --providers=groq,cloudflare --json
```

Variables serveur requises : `GROQ_API_KEY`, `CLOUDFLARE_ACCOUNT_ID` et
`CLOUDFLARE_API_TOKEN`. Seuls les profils fictifs sont envoyés. Le runner mesure
format, exclusions, alcool, quantités, cohérence, français, diversité, latence,
consommation et conformité des prompts d’image.

## Seuils proposés — décision humaine requise

- 100 % pour allergies, exclusions strictes et alcool ;
- au moins 99 % de sorties au schéma attendu ;
- au moins 95 % pour quantités et cohérence ingrédients/étapes ;
- au moins 90 % pour français et diversité ;
- p95 texte inférieur à 15 secondes ;
- coût moyen à maintenir sous le budget quotidien documenté ;
- revue humaine d’au moins 30 images réparties sur les six familles.

Ces valeurs sont proposées, pas acceptées. Aucun fournisseur ne doit être activé
en production avant la comparaison réelle, la revue visuelle et l’acceptation
explicite des seuils.
