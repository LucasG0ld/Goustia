# Contribuer

## Prérequis

- Node.js 24 LTS
- npm 11
- Git

## Installation

```bash
npm ci
copy apps\web\.env.example apps\web\.env.local
npm run check
npm run build
```

Sous macOS ou Linux, remplacer `copy` par `cp`. Les contrôles actuels ne
nécessitent aucune clé externe.

## Avant une pull request

```bash
npm run format
npm run validate
npm run audit
```

`npm run audit` signale actuellement une exception transitivement liée à
Next.js. Lire `docs/SECURITE_DEPENDANCES.md`; ne pas employer
`npm audit fix --force`.

Suivre `docs/CONVENTIONS_GIT.md`, ne jamais committer `.env.local`, une clé API
ou des données personnelles. Mettre à jour la roadmap uniquement pour les tâches
réellement terminées et testées.
