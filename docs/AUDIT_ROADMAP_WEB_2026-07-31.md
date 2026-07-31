# Audit de la roadmap web — 31 juillet 2026

## Résultat

La roadmap a été rapprochée de l'état réel du dépôt après les lots P1 à P60.
Soixante-sept tâches supplémentaires sont désormais cochées dans
`ROADMAP_PROJET.md`, uniquement lorsque le comportement est présent dans le code
ou qu'un document de décision définit explicitement le résultat attendu.

Les principaux ensembles réconciliés sont :

- les KPI, cibles initiales et seuils d'alerte du MVP décrits dans
  `docs/PLAN_ANALYTICS.md` ;
- l'exécution de Playwright dans la CI ;
- la navigation, la copie, la création et l'historique des semaines du planning
  ;
- la fiche recette, ses interactions et le mode cuisine ;
- les likes, dislikes, motifs, préférences apprises et remplacements sécurisés ;
- les préférences de notification du profil.

Une case reste ouverte lorsqu'elle exige une mesure réelle, une validation
humaine ou une configuration externe. Une implémentation locale ou un document
préparatoire ne suffit pas à déclarer une bêta ou une production validée.

## Actions que le propriétaire du projet doit encore réaliser

### Priorité 1 — comptes et environnements

1. Choisir le domaine Goustia, vérifier sa disponibilité et l'acheter.
2. Créer les projets Supabase de développement, staging et production.
3. Créer le projet de déploiement web et y rattacher les domaines staging et
   production.
4. Créer les comptes GroqCloud et Cloudflare, puis des identifiants distincts
   pour le développement et la production.
5. Activer les restrictions, plafonds de consommation et options de conservation
   minimale des données disponibles chez chaque fournisseur.
6. Ajouter les secrets dans les coffres des environnements en suivant
   `docs/ENVIRONNEMENTS.md` et `docs/RUNBOOK_FOURNISSEURS_IA.md`. Ne jamais
   transmettre ces valeurs dans un ticket, un commit ou une conversation.

Variables concernées en priorité :

- `GROQ_API_KEY` ;
- `CLOUDFLARE_ACCOUNT_ID` ;
- `CLOUDFLARE_API_TOKEN` ;
- les URL et clés Supabase propres à chaque environnement.

### Priorité 2 — services de production

1. Choisir et configurer le SMTP transactionnel, puis publier SPF, DKIM et DMARC
   et tester la délivrabilité selon `docs/EMAILS_NOTIFICATIONS.md`.
2. Créer les projets Sentry et Umami si ces services sont retenus, puis ajouter
   leurs variables décrites dans `apps/web/.env.example`.
3. Configurer un contrôle de disponibilité externe et les alertes réelles sur
   les échecs IA et les budgets.
4. Configurer les sauvegardes Supabase et exécuter une restauration complète
   dans un projet isolé ; consigner le RPO et le RTO observés.

### Priorité 3 — décisions et validations humaines

1. Valider le logo, l'icône et la disponibilité future du nom dans les stores.
2. Tester les wireframes et les parcours avec des utilisateurs cibles.
3. Faire vérifier les transferts hors UE et les documents légaux par un
   professionnel compétent.
4. Exécuter le benchmark réel Groq/Cloudflare, examiner au moins 30 images sur
   les six familles prévues, puis accepter ou corriger les seuils proposés dans
   `docs/benchmarks/2026-07-23-fake-baseline.md`.
5. Exécuter et signer la recette manuelle de `docs/RECETTE_TESTS_MANUELS.md` sur
   les navigateurs et appareils réels.

## Travaux encore réalisables dans le dépôt

Ces éléments ne dépendent pas d'un compte fournisseur, mais constituent de
nouveaux lots de développement ou de validation et ne sont donc pas cochés par
le présent audit :

- compléter les cinq parcours Playwright encore absents : inscription complète,
  connexion/déconnexion, mot de passe oublié, remplacement effectif et
  modification d'allergies ;
- ajouter l'estimation facultative du prix de la liste de courses, après choix
  d'une source de prix et d'une règle de fraîcheur ;
- analyser les requêtes lentes et charger un volume de données réaliste ;
- évaluer les embeddings, qui restent volontairement une évolution P2 ;
- déployer le staging, lancer les tests de fumée, la revue de sécurité et la
  bêta privée ;
- lancer la production uniquement après satisfaction des critères de sortie de
  bêta.

## Limite de l'audit

Les cases génériques de la définition globale de « terminé » restent un
référentiel applicable à chaque fonctionnalité, et non une liste à cocher une
fois pour tout le projet. Les jalons de bêta, lancement, stabilisation, mobile
et évolutions P2 restent également ouverts tant que ces phases n'ont pas
réellement eu lieu.
