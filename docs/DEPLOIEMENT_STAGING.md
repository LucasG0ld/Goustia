# Préparation staging

Le staging n’a pas été déployé : aucun accès à un projet ou à un hébergeur de
staging n’a été explicitement fourni pour ce lot.

## Configuration manuelle restante

- créer un projet Supabase distinct, sans copie de données personnelles ;
- configurer l’URL de staging et les redirections Auth ;
- poser les secrets serveur via l’hébergeur, jamais dans Git ;
- activer d’abord le fournisseur `fake`, puis Groq/Cloudflare avec quotas bas ;
- configurer Sentry dans un projet staging et tester une erreur synthétique ;
- appliquer les migrations, importer taxonomie, Ciqual et catalogue éditorial ;
- exécuter pgTAP, E2E, smoke tests, benchmark IA et revue de sécurité ;
- tester les e-mails sur une boîte dédiée et vérifier le consentement analytics.

Commandes de validation avant promotion :

```powershell
npm ci
npm run validate
npm run supabase:verify
npm run benchmark:ai:corpus
```

Le catalogue local comprend deux recettes éditoriales contrôlées pour les tests.
Son enrichissement et sa validation culinaire restent nécessaires avant bêta.
