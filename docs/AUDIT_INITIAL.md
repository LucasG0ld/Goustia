# Audit initial du projet

Date de l'audit : 23 juillet 2026  
Périmètre : sections 3 à 10 de `ROADMAP_PROJET.md`, application web uniquement.

## Synthèse

Le dépôt contient un socle web cohérent et exécutable : monorepo npm, Next.js
16, React 19, TypeScript strict, Tailwind CSS, Vitest, paquet métier partagé,
clients Supabase et endpoint de santé. Le produit lui-même n'est pas encore
implémenté : l'identité, les règles produit, la base, l'authentification,
l'onboarding, le référentiel alimentaire et les pipelines IA restent à
construire.

Le chemin critique est actuellement davantage bloqué par des décisions produit
et la sécurité alimentaire que par la technologie.

## État par jalon

| Section                       | État    | Constat                                                                                                                                         |
| ----------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 3 — Cadrage produit           | Partiel | Cahier des charges présent. Identité, règles chiffrées et KPI à valider.                                                                        |
| 4 — Fondations                | Partiel | Monorepo, web, domaine, lint, tests et health check présents. Git, CI, environnements, migrations et observabilité absents au début de l'audit. |
| 5 — UX et design              | Absent  | Aucun parcours, wireframe ou design system validé. La page actuelle est un écran technique provisoire.                                          |
| 6 — Modèle de données         | Absent  | Aucun schéma SQL, migration, politique RLS ou donnée de test.                                                                                   |
| 7 — Compte et conformité      | Absent  | Clients Supabase préparés, mais aucun flux d'authentification ni document légal.                                                                |
| 8 — Onboarding                | Partiel | Un schéma Zod initial existe dans `@recettes/domain`, sans interface ni persistance. Ses limites sont provisoires.                              |
| 9 — Alimentation et nutrition | Absent  | Ni taxonomie d'ingrédients, ni import Ciqual, ni moteur déterministe de sécurité.                                                               |
| 10 — IA                       | Partiel | Fournisseurs et modèles pressentis, dépendances et variables d'environnement préparées. Aucun adaptateur, prompt, quota ou benchmark exécuté.   |

## Versions et commandes vérifiées

| Élément    | Version ou état                                 |
| ---------- | ----------------------------------------------- |
| Node.js    | 24.18.0                                         |
| npm        | 11.16.0                                         |
| Next.js    | 16.2.11                                         |
| React      | 19.2.4                                          |
| TypeScript | 5.x                                             |
| Vitest     | 3.x                                             |
| Structure  | `apps/web` et `packages/domain`, workspaces npm |
| Contrôles  | `npm run check` et `npm run build` disponibles  |

Les fichiers de configuration et la documentation d'architecture sont présents.
Il n'existe pas encore de projet Supabase relié, de CI ou d'environnement de
staging.

## Risques prioritaires

1. **Sécurité alimentaire** : une sortie IA ne devra jamais être la seule
   autorité pour les allergies et exclusions.
2. **Décisions produit ouvertes** : âge minimum, mineurs, quotas, objectifs et
   répétitions influencent le modèle de données et l'onboarding.
3. **Données personnelles** : date de naissance, allergies et préférences
   exigent minimisation, RLS, information et politique de conservation.
4. **Dépendances** : `npm audit` signale une alerte modérée PostCSS et deux
   alertes hautes Sharp, transitives via la version stable actuelle de Next.js.
5. **Coûts et quotas IA** : les offres gratuites ne constituent pas une garantie
   de capacité en production.
6. **Absence de référentiel** : les ingrédients, synonymes et données Ciqual
   conditionnent la validation des recettes.
7. **Absence de Git sur le poste** : le programme `git` n'est pas installé ou
   n'est pas accessible dans le `PATH`; l'initialisation du dépôt est bloquée.

## Chemin critique actualisé

```text
Décisions produit et identité
  → parcours UX et modèle de données
  → Supabase local, migrations et RLS
  → authentification et onboarding court
  → taxonomie, Ciqual et moteur de sécurité
  → contrats, adaptateurs et benchmark IA
  → planning, recettes et interactions
  → tests de sécurité, bêta et production
```

L'identité visuelle peut avancer en parallèle, mais le modèle de données ne doit
pas être figé avant validation des règles produit essentielles.

## Cinq prochains lots recommandés

1. Finaliser P01 à P04 : identité proposée, décisions à arbitrer, analytics et
   qualité du dépôt.
2. P05 à P09 : CI, environnements, secrets, Supabase local et observabilité.
3. P10 à P14 : parcours UX, design system et accessibilité.
4. P15 à P19 : modèle de données, migrations et politiques RLS.
5. P20 à P29 : authentification, conformité et onboarding progressif.

## Ce qui n'a volontairement pas été fait

- aucune règle produit provisoire n'a été inscrite dans le domaine ;
- aucun compte, domaine ou service externe n'a été créé ;
- aucune tâche de la roadmap n'a été cochée durant P00 ;
- aucun travail mobile n'a été démarré.
