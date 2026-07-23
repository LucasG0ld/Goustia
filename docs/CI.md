# Intégration continue

Le workflow `.github/workflows/ci.yml` s'exécute sur chaque push, pull request
et lancement manuel avec des permissions de lecture uniquement.

## Contrôles

### `Quality, tests and build`

1. installation verrouillée avec `npm ci` et cache npm ;
2. formatage ;
3. ESLint ;
4. TypeScript ;
5. tests Vitest et rapports de couverture ;
6. build Next.js de production ;
7. futurs tests Playwright dès qu'une configuration existe.

### `Supabase migrations`

1. démarrage d'une pile Supabase jetable ;
2. reconstruction d'une base vide et exécution du seed ;
3. lint SQL bloquant dès le niveau warning ;
4. génération des types TypeScript ;
5. publication des types comme artefact pendant 14 jours ;
6. arrêt et suppression des données locales même en cas d'échec.

Les actions GitHub utilisent Node.js 24 et les versions majeures actuelles
`actions/checkout@v6`, `actions/setup-node@v6` et `actions/upload-artifact@v6`.
Dependabot suit leurs mises à jour.

## Protection de `main`

Après le premier passage réussi, configurer dans GitHub :

1. **Settings → Branches → Add branch protection rule** ;
2. motif `main` ;
3. exiger une pull request avant fusion ;
4. exiger les vérifications :
   - `Quality, tests and build`
   - `Supabase migrations`
5. exiger une branche à jour ;
6. bloquer les force-push et suppressions.

Cette opération modifie les paramètres externes du dépôt et doit être effectuée
par son propriétaire. Tant qu'elle ne l'est pas, la CI informe mais ne peut pas
empêcher une fusion.

## Disponibilité

Le workflow `uptime.yml` reste sans effet tant que la variable GitHub
`PRODUCTION_HEALTHCHECK_URL` n'est pas créée. Elle ne sera renseignée qu'après
le déploiement de production.
