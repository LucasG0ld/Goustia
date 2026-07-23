# Recettes personnalisées

Application de recommandation de recettes personnalisées, développée d'abord
pour le web puis portée sur iOS et Android.

## Architecture

Ce dépôt est un monorepo npm :

```text
apps/
  web/             Application Next.js
  mobile/          Application Expo à ajouter après stabilisation du MVP web
packages/
  domain/          Règles métier, schémas de validation et types partagés
docs/
  ARCHITECTURE_TECHNIQUE.md
```

Le détail des choix se trouve dans
[`docs/ARCHITECTURE_TECHNIQUE.md`](docs/ARCHITECTURE_TECHNIQUE.md).

Le choix des modèles et fournisseurs IA est expliqué dans
[`docs/ETUDE_IA_FREEMIUM.md`](docs/ETUDE_IA_FREEMIUM.md).

La liste complète des tâches, du MVP web jusqu'aux applications mobiles et aux
évolutions avancées, se trouve dans [`ROADMAP_PROJET.md`](ROADMAP_PROJET.md).

Les prompts séquentiels permettant d'exécuter chaque lot de cette roadmap sont
regroupés dans [`PROMPTS_PROJET.md`](PROMPTS_PROJET.md).

## Prérequis

- Node.js 24 LTS
- npm 11 ou version compatible

## Installation

```bash
npm install
```

Copier ensuite `apps/web/.env.example` vers `apps/web/.env.local` et ajouter les
identifiants du projet Supabase quand celui-ci aura été créé.

## Commandes

```bash
npm run dev
npm run check
npm run build
npm run format
npm run validate
```

L'application web est disponible par défaut sur `http://localhost:3000`.

Le point de contrôle de l'API est disponible sur
`http://localhost:3000/api/v1/health`.

Les règles de contribution et les exceptions de sécurité connues se trouvent
dans [`CONTRIBUTING.md`](CONTRIBUTING.md) et
[`docs/SECURITE_DEPENDANCES.md`](docs/SECURITE_DEPENDANCES.md).
