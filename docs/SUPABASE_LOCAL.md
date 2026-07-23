# Supabase local et migrations

Version CLI verrouillée : `2.109.1`.

La CLI Supabase est installée dans le projet. Elle requiert Docker Desktop ou un
moteur compatible en fonctionnement.

## Commandes

```bash
npm run supabase:start
npm run supabase:stop
npm run supabase:reset
npm run supabase:lint
npm run supabase:test
npm run supabase:types
npm run supabase:verify
```

Le Studio local est disponible sur `http://127.0.0.1:54323`, l'API sur
`http://127.0.0.1:54321` et PostgreSQL sur le port `54322`.

## Migrations

Créer une migration avec un nom anglais en `snake_case` :

```bash
npm run supabase:migration:new -- create_profiles
```

Le fichier suit la convention :

```text
supabase/migrations/YYYYMMDDHHMMSS_description_courte.sql
```

Chaque migration doit :

- être déterministe et rejouable depuis une base vide ;
- activer RLS sur toute table exposée ;
- contenir des commentaires pour les décisions de sécurité non évidentes ;
- séparer les changements incompatibles selon expand/migrate/contract ;
- ne contenir ni donnée réelle ni secret.

`supabase/seed.sql` ne contient que des fixtures locales non sensibles.

## Vérification depuis une base vide

```bash
npm run supabase:start
npm run supabase:verify
```

Cette commande réinitialise la base, rejoue toutes les migrations et le seed,
analyse le SQL, exécute les tests pgTAP, puis génère les types dans
`apps/web/src/types/database.generated.ts`.

La CI effectue la même reconstruction dans un environnement jetable et publie
les types générés comme artefact. La migration P12 à P14 et ses 35 tests pgTAP
ont été validés localement avec Docker Desktop le 23 juillet 2026.

## Restauration

### Local

Les données locales sont jetables :

```bash
npm run supabase:reset
```

### Hébergé

Avant toute restauration :

1. interrompre les écritures applicatives ;
2. identifier le point de restauration et conserver un export de sécurité ;
3. restaurer dans un projet isolé ;
4. vérifier migrations, RLS, comptes et intégrité ;
5. basculer uniquement après validation technique et produit ;
6. consigner les heures, responsables et contrôles effectués.

Les sauvegardes hébergées, leur rétention et les exercices de restauration
seront configurés séparément pour staging et production.

## Sources

- [Développement local avec la CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
- [Gestion des environnements et migrations](https://supabase.com/docs/guides/deployment/managing-environments)
