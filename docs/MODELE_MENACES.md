# Modèle de menaces web

Date de revue : 30 juillet 2026. Périmètre : application Next.js, API v1,
Supabase, fournisseurs IA et stockage d’images. Ce document ne constitue pas une
homologation de production.

## Actifs et frontières

Les actifs prioritaires sont les contraintes alimentaires, la date de naissance,
l’identité, les sessions, les recettes privées, les secrets IA et les droits
administrateur. Le navigateur, Next.js, Supabase et chaque fournisseur IA sont
des frontières distinctes. L’IA ne reçoit qu’un contexte pseudonymisé.

| Menace                     | Mesure appliquée                                                                             | Vérification                |
| -------------------------- | -------------------------------------------------------------------------------------------- | --------------------------- |
| Accès horizontal           | RLS, `auth.uid()`, tests pgTAP                                                               | suite Supabase              |
| Injection SQL              | requêtes paramétrées Supabase, fonctions avec `search_path = ''`                             | lint DB et pgTAP            |
| XSS                        | React échappe le texte, aucun HTML utilisateur injecté, CSP à nonce                          | tests HTTP et revue         |
| Requête intersite sensible | comparaison stricte de l’en-tête `Origin`, cookies Supabase et confirmations administratives | test unitaire               |
| Abus d’un endpoint coûteux | quotas métier et limite durable par utilisateur                                              | RPC réservé au service role |
| Corps démesuré             | lecture JSON bornée sur les endpoints exposés/coûteux                                        | test unitaire               |
| Prompt injection           | données JSON délimitées, système prioritaire, schéma strict et contrôle de sortie            | tests du domaine            |
| Exfiltration de secret     | variables serveur, redaction des logs, scan du dépôt                                         | CI                          |
| Cache de données privées   | API authentifiée `private, no-store`; cache public uniquement pour le catalogue validé       | proxy et revue              |
| Tâche IA bloquée           | détection temporelle, clôture auditée, relance manuelle distincte                            | fonction admin              |

## Règles de développement

- Toute entrée serveur nouvelle reçoit un schéma strict, des bornes et un test.
- Une fonction `security definer` fixe toujours son `search_path`, vérifie
  l’appelant et révoque `public`.
- Une donnée utilisateur placée dans un prompt reste une donnée délimitée. Les
  clés, e-mails, identifiants directs et dates de naissance y sont interdits.
- Aucun test offensif n’est exécuté sur staging ou production sans périmètre et
  autorisation écrits.

## Risques résiduels et décision

Le limiteur à fenêtre fixe protège l’endpoint IA mais n’est pas un WAF. Un
limiteur IP en bordure reste requis avant une ouverture publique. Les avis npm
transitifs documentés dans `SECURITE_DEPENDANCES.md` empêchent le go production
tant qu’ils ne sont pas corrigés ou formellement acceptés. Une validation
juridique et un test de restauration restent aussi ouverts.

## Réponse à incident

1. Désactiver la génération ou les inscriptions sans supprimer de preuve.
2. Révoquer/faire tourner le secret concerné et invalider les sessions si utile.
3. Conserver identifiants de corrélation, audit admin et chronologie.
4. Qualifier données/personnes touchées avec le référent confidentialité.
5. Corriger, ajouter un test de non-régression, restaurer progressivement.
6. Rédiger le compte rendu sans secret ni donnée alimentaire nominative.
