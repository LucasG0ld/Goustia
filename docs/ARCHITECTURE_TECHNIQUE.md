# Architecture technique

## 1. Décision

La solution retenue est une architecture React avec deux applications :

- **Web : Next.js avec App Router et TypeScript**
- **Mobile : Expo avec React Native et Expo Router**, ajouté après la
  stabilisation de la version web

Les deux applications vivront dans le même monorepo et partageront le métier,
les validations et les contrats d'API. Les composants d'interface ne seront
partagés que lorsqu'ils sont réellement compatibles avec les deux plateformes.

Cette approche permet de profiter des qualités de Next.js pour le web sans
contraindre l'application mobile à reproduire une interface pensée pour un
navigateur.

## 2. Pourquoi React seul ne suffit pas

React fournit le modèle de composants, mais pas toute l'infrastructure
nécessaire au produit :

- routage ;
- rendu serveur ;
- API sécurisée ;
- gestion des métadonnées ;
- optimisation des images ;
- conventions de déploiement.

Next.js complète React pour l'application web. Expo joue le même rôle pour les
applications iOS et Android.

Une application web simplement emballée dans une WebView serait plus rapide à
porter, mais offrirait une expérience mobile moins naturelle et compliquerait
l'accès futur aux notifications, au partage, à la caméra ou au mode hors ligne.

## 3. Stack retenue

| Besoin            | Technologie                                      | Justification                                           |
| ----------------- | ------------------------------------------------ | ------------------------------------------------------- |
| Langage           | TypeScript                                       | Types et contrats partagés entre web, mobile et serveur |
| Interface web     | React 19 + Next.js 16 App Router                 | Rendu serveur, routage, API et bonnes performances web  |
| Styles web        | Tailwind CSS 4                                   | Construction rapide et cohérente de l'interface         |
| Interface mobile  | Expo + React Native + Expo Router                | Applications natives iOS/Android basées sur React       |
| Monorepo          | npm workspaces                                   | Partage du code sans outil supplémentaire au démarrage  |
| Validation        | Zod                                              | Validation commune des formulaires, API et sorties IA   |
| Base de données   | PostgreSQL via Supabase                          | Données fortement relationnelles et portabilité SQL     |
| Authentification  | Supabase Auth                                    | Sessions compatibles Next.js et React Native            |
| Autorisation      | PostgreSQL Row Level Security                    | Isolation des données de chaque utilisateur             |
| Fichiers          | Supabase Storage                                 | Images de recettes et avatars avec règles d'accès       |
| API du MVP        | Route Handlers Next.js sous `/api/v1`            | API HTTP consommable ensuite par l'application mobile   |
| Tests unitaires   | Vitest                                           | Tests rapides des règles métier partagées               |
| Tests de parcours | Playwright, à ajouter avec les premiers parcours | Validation de l'inscription et du planning              |
| Déploiement web   | Vercel                                           | Déploiement naturel de Next.js et prévisualisations     |
| Suivi d'erreurs   | Sentry, inactif sans DSN                         | Erreurs client/serveur et filtrage des données          |
| Builds mobiles    | Expo Application Services ou builds natifs       | Publication iOS et Android lorsque le mobile démarre    |

## 4. Organisation du dépôt

```text
.
├── apps/
│   ├── web/
│   │   ├── src/app/              Routes et pages Next.js
│   │   ├── src/features/         Fonctionnalités web par domaine
│   │   └── src/lib/              Adaptateurs web et clients externes
│   └── mobile/                   Créé lors de la phase mobile
├── packages/
│   ├── domain/                   Métier pur, types et schémas Zod
│   ├── api-client/               À ajouter avec les premiers endpoints
│   └── design-tokens/            À ajouter après définition de l'identité
├── supabase/
│   └── migrations/               À ajouter lors de la conception des données
└── docs/
```

Le paquet `domain` ne dépend ni du navigateur, ni de Next.js, ni de React
Native. Il peut donc être testé et exécuté partout.

## 5. Séparation des responsabilités

### Application web

- pages publiques ;
- inscription et connexion ;
- onboarding progressif ;
- planning et fiches recettes ;
- interactions utilisateur ;
- rendu serveur lorsque cela améliore le chargement.

### API serveur

- génération de recettes ;
- génération ou sélection d'images ;
- contrôle des quotas ;
- validation des sorties IA ;
- opérations nécessitant un secret ;
- endpoints versionnés utilisables par le mobile.

Les clés privées des fournisseurs IA ne sont jamais exposées au navigateur ou à
l'application mobile.

### Supabase

- comptes et sessions ;
- base PostgreSQL ;
- politiques de sécurité par utilisateur ;
- stockage des images ;
- migrations SQL et génération future des types de base.

### Domaine partagé

- objectifs alimentaires ;
- contraintes et allergies ;
- règles liées à l'âge ;
- structures des recettes ;
- schémas de validation ;
- contrats de l'API ;
- calculs déterministes et contrôles de sécurité.

## 6. Stratégie mobile

La version mobile ne sera pas une copie HTML de la version web. Elle réutilisera
:

- les types TypeScript ;
- les schémas Zod ;
- les règles métier ;
- le client d'API ;
- les jetons de design ;
- les sessions Supabase.

Elle possédera ses propres écrans React Native afin de respecter la navigation,
les interactions tactiles et l'accessibilité mobile.

Le mobile pourra être ajouté sous `apps/mobile` avec Expo sans déplacer
l'application web existante, car le dépôt est déjà organisé en workspaces.

## 7. Stratégie IA

La décision détaillée est documentée dans
[`ETUDE_IA_FREEMIUM.md`](ETUDE_IA_FREEMIUM.md).

Pour le MVP, les fournisseurs retenus sont :

- GroqCloud avec `openai/gpt-oss-120b` pour les recettes ;
- Cloudflare Workers AI avec `@cf/black-forest-labs/flux-2-klein-4b` pour les
  images ;
- Cloudflare Workers AI comme fournisseur de secours pour le texte.

La couche IA reste indépendante du fournisseur. Le métier appellera une
interface interne, par exemple :

```ts
interface RecipeGenerator {
  generate(input: RecipeGenerationInput): Promise<GeneratedRecipe>;
}
```

L'intégration TypeScript utilisera AI SDK pour la génération de texte et Zod
pour la validation. L'API Cloudflare sera appelée côté serveur pour les images.
Les identifiants de modèles resteront configurables par variables
d'environnement.

L’implémentation détaillée des adaptateurs, tâches persistées, images et quotas
est documentée dans [`GENERATION_IA.md`](GENERATION_IA.md). Les tâches sont
créées par une réservation PostgreSQL atomique puis exécutées après la réponse
HTTP. Leur état reste consultable par l’API v1, ce qui permettra au futur client
mobile de reprendre le suivi sans dépendre du cycle de rendu web.

Toute sortie IA passe par :

1. une validation de forme avec Zod ;
2. un contrôle déterministe des allergies et interdictions ;
3. un contrôle de cohérence des ingrédients et étapes ;
4. une journalisation technique sans données personnelles inutiles ;
5. une mise en cache pour éviter les générations identiques.

Les valeurs nutritionnelles seront calculées à partir des données ouvertes ANSES
Ciqual, et non reprises directement de la réponse du modèle.

## 8. Données sensibles et sécurité

- Les allergies et la date de naissance sont des données personnelles.
- Seules les informations nécessaires au service sont collectées.
- Toutes les tables exposées doivent activer la Row Level Security.
- Un utilisateur ne peut accéder qu'à ses propres préférences et plannings.
- Les clés de service Supabase et les clés IA restent exclusivement côté
  serveur.
- Les variables préfixées `NEXT_PUBLIC_` sont considérées comme publiques.
- Les routes authentifiées ne doivent pas être mises en cache publiquement.
- Les décisions d'exclusion alimentaire sont appliquées par du code
  déterministe, et non uniquement par un modèle génératif.

## 9. Évolution de l'API

Les endpoints applicatifs sont versionnés dès le départ :

```text
/api/v1/health
/api/v1/profile
/api/v1/meal-plans
/api/v1/recipes
/api/v1/recommendations
```

Le shell web authentifié repose sur des Server Components pour la semaine et les
recettes. Les formulaires interactifs du planning utilisent des Route Handlers
v1, des clés d’idempotence et une révision optimiste. Le moteur de
recommandation et l’apprentissage pondéré restent dans `@recettes/domain` afin
d’être réutilisables par le futur client mobile.

Pour le MVP, ces endpoints peuvent être hébergés par Next.js. Si la charge IA ou
les traitements asynchrones deviennent importants, ils pourront être déplacés
vers un service dédié sans modifier leurs contrats ni les applications clientes.

## 10. Choix reportés volontairement

- Fournisseur final de génération de texte
- Fournisseur final de génération d'images
- Outil de file d'attente pour les générations longues
- Bibliothèque complète de composants
- Paiement et modèle économique

Ces choix n'empêchent pas le développement du MVP et doivent être décidés avec
des mesures réelles de qualité, de latence et de coût.

## 11. Règles de développement

- TypeScript en mode strict.
- Validation aux frontières : formulaires, API, base et IA.
- Server Components par défaut ; Client Components uniquement pour
  l'interactivité.
- Secrets marqués comme code serveur uniquement.
- Logique métier placée dans `packages/domain`.
- API versionnée et documentée.
- Migrations SQL versionnées.
- Tests obligatoires sur les exclusions alimentaires et les règles d'âge.

## 12. État initial des dépendances

Au 23 juillet 2026, le projet utilise la dernière version stable publiée de
Next.js (`16.2.11`). `npm audit` remonte néanmoins une alerte modérée sur une
dépendance PostCSS intégrée à Next.js et deux alertes hautes liées à Sharp.

La correction automatique proposée par npm rétrograderait Next.js vers une
ancienne version majeure et n'a donc pas été appliquée. Ces alertes transitives
doivent être réévaluées à chaque mise à jour de Next.js et impérativement avant
une mise en production.
