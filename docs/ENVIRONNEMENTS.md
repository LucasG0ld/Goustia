# Environnements et secrets

## Principes

Goustia utilise quatre environnements séparés. Aucun secret ne doit passer dans
une variable `NEXT_PUBLIC_*`, car Next.js l'intègre au code envoyé au
navigateur.

| Environnement | Usage                   | Données                             | Déploiement                       | Propriétaire                     |
| ------------- | ----------------------- | ----------------------------------- | --------------------------------- | -------------------------------- |
| `local`       | Développement quotidien | Fixtures non sensibles              | Poste du développeur              | Développeur                      |
| `test`        | Tests unitaires et CI   | Données jetables                    | GitHub Actions                    | Responsable technique            |
| `staging`     | Recette et bêta interne | Données fictives ou bêta autorisées | Projet Vercel et Supabase dédiés  | Responsable technique            |
| `production`  | Utilisateurs réels      | Données réelles minimisées          | Projets Vercel et Supabase dédiés | Responsable produit et technique |

Vercel est retenu pour le MVP Next.js. Aucun projet Vercel ou Supabase hébergé
n'est créé par ce lot. Staging et production doivent utiliser des projets,
bases, clés, domaines et quotas différents.

## Démarrage local

```powershell
Copy-Item apps/web/.env.example apps/web/.env.local
npm run supabase:start
npm run dev
```

Après le démarrage Supabase, remplacer dans `.env.local` la clé publiable
d'exemple par celle affichée par la CLI.

Le schéma Zod situé dans `apps/web/src/lib/env` provoque une erreur explicite si
une variable obligatoire manque. Les valeurs facultatives restent vides tant que
la fonctionnalité associée n'est pas activée.

## Matrice des variables

| Variable                               | Visibilité       | Local/test         | Staging/production           | Rotation             |
| -------------------------------------- | ---------------- | ------------------ | ---------------------------- | -------------------- |
| `APP_ENV`                              | Serveur          | Requise            | Requise                      | Jamais               |
| `NEXT_PUBLIC_APP_ENV`                  | Publique         | Requise            | Requise                      | Jamais               |
| `NEXT_PUBLIC_APP_URL`                  | Publique         | Requise            | Requise                      | À chaque domaine     |
| `NEXT_PUBLIC_SUPABASE_URL`             | Publique         | Requise            | Requise                      | Avec le projet       |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publique         | Requise            | Requise                      | Selon Supabase       |
| `SUPABASE_SERVICE_ROLE_KEY`            | Secrète          | Facultative        | Seulement si nécessaire      | 90 jours ou incident |
| `AI_GENERATION_ENABLED`                | Serveur          | `false`            | Après validation du pipeline | À chaque activation  |
| `GROQ_API_KEY`                         | Secrète          | À l'intégration IA | Requise pour le fournisseur  | 90 jours ou incident |
| `CLOUDFLARE_ACCOUNT_ID`                | Serveur          | À l'intégration IA | Requise pour Cloudflare      | Si compte modifié    |
| `CLOUDFLARE_API_TOKEN`                 | Secrète          | À l'intégration IA | Requise pour Cloudflare      | 90 jours ou incident |
| `NEXT_PUBLIC_SENTRY_DSN`               | Publique         | Facultative        | Requise si Sentry activé     | Avec le projet       |
| `NEXT_PUBLIC_OBSERVABILITY_ENABLED`    | Publique         | `false`            | `true` si Sentry activé      | Jamais               |
| `SENTRY_DSN`                           | Serveur          | Facultative        | Requise si Sentry activé     | Avec le projet       |
| `SENTRY_AUTH_TOKEN`                    | Secrète de build | Inutile            | Requis pour les source maps  | 90 jours ou incident |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID`         | Publique         | Inutile            | Après validation analytics   | Avec le site         |

Les modèles et fournisseurs sont configurables par les variables documentées
dans `.env.example`. Une clé vide signifie « fonctionnalité inactive », jamais «
utiliser une valeur par défaut secrète ».

Les garde-fous serveur sont configurés par `AI_TEXT_TIMEOUT_MS`,
`AI_IMAGE_TIMEOUT_MS`, `AI_MAX_ATTEMPTS`, `AI_USER_DAILY_RECIPE_LIMIT`,
`AI_GLOBAL_DAILY_RECIPE_LIMIT` et `AI_GLOBAL_DAILY_COST_LIMIT_USD`. Le modèle
image secondaire est défini par `AI_IMAGE_FALLBACK_MODEL`. Ces variables ne
doivent jamais être préfixées par `NEXT_PUBLIC_`.

La génération réelle reste désactivée tant que `AI_GENERATION_ENABLED=false`. La
présence des secrets sélectionnés est testée sans effectuer d’appel réseau. La
création, la rotation et la réponse à incident sont décrites dans
[`RUNBOOK_FOURNISSEURS_IA.md`](RUNBOOK_FOURNISSEURS_IA.md).

## Promotion

1. Une pull request valide formatage, code, tests, build et migrations.
2. Le merge sur `main` rend le code candidat au staging.
3. La validation fonctionnelle et la vérification des migrations précèdent la
   promotion du même commit en production.
4. Les migrations sont appliquées avant le trafic applicatif si elles sont
   rétrocompatibles; sinon une stratégie expand/migrate/contract est requise.

## Rotation et incident

1. créer une nouvelle clé avec le moindre privilège ;
2. la déposer dans le coffre du seul environnement concerné ;
3. redéployer et vérifier les métriques ;
4. révoquer l'ancienne clé ;
5. consigner date, propriétaire et motif sans copier la valeur ;
6. en cas de fuite, révoquer immédiatement, auditer Git et les journaux, puis
   notifier selon la procédure RGPD.

Ne jamais transmettre une clé par issue, pull request, capture d'écran ou log.

## Domaines et budgets à finaliser

- staging proposé : `staging.goustia.fr`
- production proposée : `app.goustia.fr`
- créer des limites de dépenses et alertes chez Groq, Cloudflare, Supabase,
  Vercel et Sentry avant activation ;
- acquérir et configurer le domaine uniquement après validation officielle du
  nom Goustia.
