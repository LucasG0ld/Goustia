# Runbook des comptes et secrets IA

> Cette procédure prépare P28. Aucun compte, secret ou appel facturable n’a été
> créé ou exécuté par le dépôt.

Références vérifiées le 23 juillet 2026 :

- [projets Groq](https://console.groq.com/docs/projects) ;
- [clés Groq](https://console.groq.com/keys) ;
- [contrôles de données et ZDR Groq](https://console.groq.com/docs/your-data) ;
- [limites de dépense Groq](https://console.groq.com/docs/spend-limits) ;
- [sécurité Groq](https://console.groq.com/docs/production-readiness/security-onboarding)
  ;
- [jetons Cloudflare](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
  ;
- [API REST Workers AI](https://developers.cloudflare.com/workers-ai/get-started/rest-api/)
  ;
- [tarification Workers AI](https://developers.cloudflare.com/workers-ai/platform/pricing/).

## Préparation commune

- [ ] Désigner le propriétaire des comptes et un suppléant.
- [ ] Utiliser une adresse d’organisation protégée par MFA.
- [ ] Choisir des budgets mensuels développement, staging et production.
- [ ] Créer un coffre de secrets ; ne jamais copier une clé dans Git, un ticket
      ou un message.
- [ ] Définir les personnes autorisées à lire ou renouveler chaque secret.

Les environnements doivent rester isolés. Une clé de développement ne doit
jamais pouvoir consommer le quota de production.

## GroqCloud

1. [ ] Créer l’organisation GroqCloud.
2. [ ] Créer trois projets : `goustia-development`, `goustia-staging` et
       `goustia-production`.
3. [ ] Pour chaque projet, autoriser uniquement le modèle texte validé par le
       benchmark. Les permissions de modèle s’appliquent au projet, pas à une
       clé individuelle.
4. [ ] Générer une clé propre à chaque projet et la copier une seule fois dans
       le coffre correspondant.
5. [ ] Activer **Zero Data Retention** dans `Settings > Data Controls`. Vérifier
       que les fonctions incompatibles avec ZDR restent désactivées.
6. [ ] Réduire les limites de requêtes et de jetons de chaque projet au minimum
       nécessaire.
7. [ ] Sur une offre payante, définir une limite de dépense mensuelle et des
       alertes à 50 %, 75 % et 90 %. Cette limite est au niveau organisation et
       le suivi peut avoir un décalage de 10 à 15 minutes.
8. [ ] Enregistrer `GROQ_API_KEY` uniquement côté serveur.
9. [ ] Vérifier depuis la console la consommation du projet sans envoyer de
       profil utilisateur réel.

Groq indique que l’inférence n’est pas conservée par défaut, sauf besoins
limités de fiabilité ou d’abus, et que ZDR désactive cette conservation. Les
éventuels transferts vers les États-Unis restent à valider juridiquement.

## Cloudflare Workers AI

1. [ ] Créer ou sélectionner le compte Cloudflare de l’organisation.
2. [ ] Relever l’identifiant de compte, qui n’est pas un secret mais reste une
       configuration serveur.
3. [ ] Créer un jeton distinct par environnement.
4. [ ] Préférer un **Account API Token** durable pour production.
5. [ ] Limiter le jeton au compte concerné et aux permissions `Workers AI Read`
       et `Workers AI Edit`. Ne jamais utiliser la Global API Key.
6. [ ] Ajouter une date d’expiration et, si compatible avec l’hébergement, une
       restriction d’adresse IP.
7. [ ] Stocker `CLOUDFLARE_ACCOUNT_ID` et `CLOUDFLARE_API_TOKEN` uniquement côté
       serveur.
8. [ ] Surveiller les neurons dans le tableau de bord. L’allocation gratuite
       annoncée est de 10 000 neurons par jour, réinitialisée à 00:00 UTC.
9. [ ] Ajouter les quotas applicatifs Goustia avant tout passage au plan payant.

## Activation par environnement

Variables :

```text
AI_GENERATION_ENABLED=false
AI_TEXT_PROVIDER=groq
AI_TEXT_MODEL=openai/gpt-oss-120b
GROQ_API_KEY=
AI_TEXT_FALLBACK_PROVIDER=cloudflare
CLOUDFLARE_TEXT_MODEL=@cf/qwen/qwen3-30b-a3b-fp8
AI_IMAGE_PROVIDER=cloudflare
AI_IMAGE_MODEL=@cf/black-forest-labs/flux-2-klein-4b
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
```

Ordre d’activation :

1. garder `AI_GENERATION_ENABLED=false` ;
2. ajouter les secrets dans le coffre de l’environnement ;
3. exécuter les tests de configuration, sans génération ;
4. exécuter le benchmark avec des profils fictifs ;
5. valider confidentialité, quotas et budget ;
6. activer d’abord en développement, puis staging ;
7. activer en production uniquement après les contrôles de sécurité.

## Rotation

- [ ] Noter propriétaire, date de création et date d’expiration sans enregistrer
      la valeur du secret.
- [ ] Créer la nouvelle clé avant de révoquer l’ancienne.
- [ ] Déployer la nouvelle valeur dans un seul environnement.
- [ ] Vérifier les erreurs `401`, `403` et les métriques.
- [ ] Révoquer l’ancienne clé dans la console.
- [ ] Confirmer qu’elle ne fonctionne plus.
- [ ] Conserver uniquement la preuve de rotation et les identifiants non
      secrets.

Rotation recommandée : tous les 90 jours, lors d’un départ ou immédiatement
après un doute sur l’exposition.

## Incident de compromission

1. désactiver `AI_GENERATION_ENABLED` ;
2. révoquer immédiatement la clé concernée dans la console fournisseur ;
3. inspecter consommation, modèles, heures et environnements sans exporter de
   données utilisateur inutiles ;
4. créer une nouvelle clé avec le moindre privilège ;
5. déployer et vérifier la nouvelle clé ;
6. rechercher l’origine de l’exposition et purger les journaux ou artefacts
   concernés ;
7. évaluer les obligations de notification et documenter l’incident ;
8. réactiver progressivement après correction.
