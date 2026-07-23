# Authentification et compte web — P18 à P19

Statut : **implémenté localement le 23 juillet 2026**

## Parcours disponibles

- inscription e-mail/mot de passe avec profil minimal créé par trigger ;
- validation de l’adresse et échange sécurisé du code PKCE ;
- connexion et déconnexion locale ;
- récupération et modification du mot de passe ;
- renouvellement de session dans le Proxy Next.js ;
- compte protégé par des claims vérifiés puis `getUser()` ;
- modification de l’identité et de l’adresse e-mail ;
- révocation des autres sessions ;
- export JSON des données personnelles ;
- suppression immédiate, explicite et idempotente du compte.

Les erreurs de connexion restent génériques afin de ne pas révéler si une
adresse existe. Les inscriptions, connexions et demandes de récupération ont des
limites fixes stockées côté PostgreSQL ; le navigateur ne choisit jamais ces
limites.

## Suppression et conservation

La phrase `SUPPRIMER` et une clé d’idempotence sont obligatoires. Une demande
auditable est créée avant la suppression via l’API d’administration Supabase. La
suppression de `auth.users` cascade vers le profil et toutes les données
personnelles liées.

Seule une preuve pseudonymisée de traitement est conservée pendant 2 190 jours.
Les détails techniques d’une tentative IA sont conservés 14 jours, les tâches IA
30 jours et l’audit administratif 365 jours. Ces valeurs sont enregistrées dans
`data_retention_policies`; leur purge planifiée sera raccordée au lot
d’exploitation.

## Configuration requise

La suppression de compte côté serveur nécessite `SUPABASE_SERVICE_ROLE_KEY`.
Cette clé ne doit jamais être préfixée par `NEXT_PUBLIC_`, exposée au navigateur
ou versionnée. Les URL de redirection du projet Supabase doivent autoriser :

- `/auth/callback`
- `/auth/confirm`
- `/reinitialiser-mot-de-passe`

En staging et production, la confirmation d’adresse e-mail doit être activée
dans Supabase Auth.
