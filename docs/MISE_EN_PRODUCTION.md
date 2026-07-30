# Checklist de mise en production

Statut : **NO-GO**. Ce document prépare le lancement mais ne l’autorise pas.

- [ ] autorisation explicite du propriétaire ;
- [ ] tous les P0 fermés, avis sécurité acceptés/corrigés ;
- [ ] Supabase production distinct, RLS et sauvegardes vérifiées ;
- [ ] domaine, HTTPS/HSTS, redirections Auth et e-mails vérifiés ;
- [ ] secrets, quotas, rate-limit bordure et alertes configurés ;
- [ ] migrations et imports exécutés avec journal ;
- [ ] pages légales validées puis publiées ;
- [ ] smoke tests, E2E, benchmark IA et restauration réussis ;
- [ ] fenêtre, responsables, canal incident et seuils d’arrêt confirmés.

Ouverture progressive recommandée : équipe, 5 %, 25 %, 50 %, 100 %, avec au
moins 30 minutes d’observation à chaque palier. Arrêter si violation
alimentaire, erreur 5xx > 2 %, p95 doublée, coût anormal ou problème
d’authentification.

Rollback : fermer les inscriptions et l’IA, revenir au dernier artefact validé,
ne jamais annuler une migration destructive à l’aveugle, restaurer seulement
dans le cadre de la procédure testée, puis exécuter santé, auth, RLS, recette,
planning et suppression. Documenter chronologie et identifiants de corrélation.
