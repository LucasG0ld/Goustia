# Tests d'intégration et RLS

## Environnement reproductible

La suite utilise exclusivement Supabase local et des fournisseurs IA factices :

```text
npm run supabase:verify
npm run supabase:test:auth
```

`supabase:verify` reconstruit une base vide, rejoue toutes les migrations,
importe les versions figées du référentiel alimentaire et de Ciqual, exécute le
lint SQL, les tests pgTAP, puis régénère les types TypeScript. Aucune clé de
production n'est lue.

## Matrice couverte

| Risque                                           | Preuve automatisée                                              |
| ------------------------------------------------ | --------------------------------------------------------------- |
| Migrations et contraintes                        | reconstruction vide et tests `001` à `009`                      |
| Isolation RLS                                    | utilisateurs distincts, rôles `authenticated` et `service_role` |
| Inscription et profil                            | trigger Auth et `scripts/test-auth-local.mjs`                   |
| Onboarding progressif                            | tests pgTAP `003`                                               |
| Fournisseur IA factice, quotas et stockage       | Vitest IA et pgTAP `005`                                        |
| JSON IA invalide, incohérent ou dupliqué         | tests du contrat et de validation                               |
| Allergène et héritage                            | Vitest sécurité alimentaire et pgTAP `003`/`007`                |
| Alcool selon l'âge                               | tests âge, sécurité et recommandations                          |
| Like, dislike et remplacement                    | pgTAP `006`/`007`                                               |
| Courses, provenance et idempotence               | pgTAP `008`                                                     |
| Suppression/anonymisation de compte              | parcours Auth et pgTAP `008`                                    |
| Configuration IA, purge et audit admin           | pgTAP `009`                                                     |
| Préférences et confidentialité des notifications | pgTAP `009`                                                     |

Une politique RLS supprimée ou trop permissive fait varier les comptages
effectués sous l'identité de deux utilisateurs et provoque l'échec de la suite.

## Diagnostic

Pour cibler uniquement les contrats SQL :

```text
npm run supabase:test
```

Les tests sont transactionnels et se terminent par `rollback`. En cas d'échec
après modification d'une migration, reconstruire la base plutôt que corriger
manuellement son état.
