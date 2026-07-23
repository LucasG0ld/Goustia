# Observabilité du MVP web

## Choix

Sentry est retenu pour le suivi d'erreurs navigateur et serveur. Le SDK est
installé mais reste entièrement inactif sans DSN et sans les deux indicateurs
`OBSERVABILITY_ENABLED` et `NEXT_PUBLIC_OBSERVABILITY_ENABLED`.

La configuration :

- n'envoie pas les informations personnelles par défaut ;
- désactive Session Replay ;
- retire utilisateur, cookies, en-têtes, corps, query string et paramètres d'URL
  avant envoi ;
- échantillonne au maximum 10 % des traces navigateur/serveur et 5 % Edge ;
- n'envoie les source maps que si un jeton de build est explicitement fourni.

La documentation Sentry confirme qu'un SDK sans DSN n'envoie aucun événement,
que `sendDefaultPii` est désactivé par défaut et que `beforeSend` permet de
filtrer les données avant transmission :
[options du SDK](https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/).

Une revue juridique, le choix de la région et le contrat de sous-traitance
restent nécessaires avant l'activation en production.

## Logs structurés

Les logs serveur sont des objets JSON sur une ligne :

```json
{
  "timestamp": "2026-07-23T12:00:00.000Z",
  "level": "info",
  "service": "goustia-web",
  "environment": "staging",
  "message": "web_vital_recorded",
  "correlationId": "..."
}
```

Niveaux :

- `debug` : diagnostic local uniquement ;
- `info` : événement technique normal ;
- `warn` : dégradation récupérable ou fallback ;
- `error` : opération échouée nécessitant un suivi.

Le masque récursif supprime notamment noms, e-mails, date de naissance,
allergies, restrictions, ingrédients, prompts, cookies, jetons et clés. Ne
jamais journaliser le profil utilisateur, une recette complète, un prompt ou une
réponse IA brute, même si le masque existe.

## Corrélation

Le Proxy Next.js ajoute `x-correlation-id` à chaque requête et réponse hors
ressources statiques. Un identifiant entrant n'est accepté que s'il respecte un
format borné; sinon un UUID est généré. Les routes, tâches IA et appels externes
doivent propager cet identifiant.

## Mesures

- le navigateur transmet CLS, FCP, INP, LCP et TTFB à
  `/api/v1/metrics/web-vitals` ;
- l'endpoint valide strictement les données et les écrit au format structuré ;
- les générations IA publieront fournisseur, modèle, catégorie d'erreur,
  latence, nombre de tentatives et coût estimé, jamais le contenu ;
- `/api/v1/health` fournit l'état public de l'API.

## Tableaux de bord cibles

### Disponibilité

Le workflow GitHub `API availability` interroge le health check toutes les 15
minutes lorsque la variable de dépôt `PRODUCTION_HEALTHCHECK_URL` est définie.
La valeur attendue sera `https://app.goustia.fr/api/v1/health`. L'historique
GitHub Actions constitue le premier journal de disponibilité; un service dédié
sera choisi avant la bêta.

### Sentry

- erreurs par environnement et version ;
- taux d'erreur des routes ;
- p50/p95 des transactions principales ;
- erreurs navigateur par version ;
- groupe `ai-generation` par fournisseur et catégorie.

## Alertes proposées

| Signal                       |            Seuil |  Fenêtre | Canal              |
| ---------------------------- | ---------------: | -------: | ------------------ |
| API indisponible             | 1 échec confirmé |   15 min | GitHub puis e-mail |
| Taux d'erreur serveur        |            > 5 % |    5 min | Sentry             |
| Échecs de génération IA      |    ≥ 5 ou > 10 % |   10 min | Sentry             |
| p95 génération               |          > 5 min |   15 min | Sentry             |
| Coût IA/utilisateur actif    |         > 0,20 € |  semaine | Tableau produit    |
| Violation d'exclusion connue |              ≥ 1 | immédiat | Critique           |

La règle Sentry `ai-generation` ne pourra être créée qu'après création du projet
externe et doit rester ouverte dans la roadmap jusque-là.

## Diagnostic

1. récupérer le `x-correlation-id` sans demander de donnée personnelle ;
2. vérifier le workflow de disponibilité et l'environnement ;
3. rechercher l'identifiant dans les logs structurés ;
4. consulter le groupe Sentry et la version de déploiement ;
5. vérifier dépendances Supabase/IA et quotas ;
6. appliquer la procédure de retour arrière si l'impact augmente ;
7. consigner la cause et ajouter un test de non-régression.
