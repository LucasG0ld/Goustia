# Sous-traitants, hébergement et transferts — brouillon

> **À faire valider par un professionnel.** Aucun fournisseur marqué « envisagé
> » ne doit être présenté comme effectivement sous-traitant tant que son compte,
> son contrat et sa configuration ne sont pas activés.

| Fournisseur envisagé        | Rôle                            | Données prévues                                                                | Région/transfert à vérifier                                      | État             |
| --------------------------- | ------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ---------------- |
| Supabase                    | PostgreSQL, Auth, Storage       | compte, profil, contenu utilisateur                                            | projet UE, entité contractante, DPA et sous-traitants ultérieurs | local uniquement |
| Vercel                      | hébergement Next.js             | requêtes web et journaux minimisés                                             | région d’exécution, DPA, transferts et logs                      | non configuré    |
| Groq                        | génération de texte             | contraintes et préférences strictement minimisées, jamais la date de naissance | politique ZDR, DPA et mécanisme de transfert                     | non configuré    |
| Cloudflare                  | génération de secours et images | description de recette minimisée                                               | région, DPA et transferts                                        | non configuré    |
| Sentry                      | erreurs                         | erreurs nettoyées, sans e-mail, allergie ni prompt                             | région UE, rétention, DPA                                        | inactif sans DSN |
| Umami Cloud UE              | audience                        | événements fermés non nominatifs                                               | région UE et configuration sans cookie à confirmer               | non configuré    |
| Fournisseur e-mail Supabase | e-mails transactionnels         | adresse e-mail et contenu technique                                            | prestataire réel du projet et DPA                                | local Mailpit    |

## Vérifications obligatoires avant activation

- identité de l’entité contractante et liste des sous-traitants ultérieurs ;
- localisation effective du stockage et des traitements ;
- DPA, mesures de sécurité, notification d’incident et assistance aux droits ;
- transferts hors EEE, décision d’adéquation ou clauses contractuelles types ;
- durée de conservation, suppression, entraînement des modèles et option ZDR ;
- configuration par environnement et contrôle qu’aucune donnée interdite ne
  quitte le serveur.

Le registre doit être mis à jour à chaque activation, changement de modèle,
nouvelle région ou nouveau destinataire.
