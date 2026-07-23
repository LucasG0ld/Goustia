# Registre des activités de traitement — brouillon

> **À faire valider par un professionnel du droit et de la protection des
> données avant production.** Ce document de travail ne garantit pas la
> conformité juridique de Goustia.

Responsable envisagé : **[identité juridique, adresse et contact à compléter]**.
Date de revue : 23 juillet 2026. Version : `2026-07-23-draft.1`.

La
[CNIL recommande un registre organisé par finalité](https://www.cnil.fr/fr/RGPD-le-registre-des-activites-de-traitement)
et mis à jour avec les évolutions du traitement. Les durées ci-dessous sont des
hypothèses à confirmer selon la nécessité propre à chaque finalité, conformément
au
[principe de conservation limitée](https://www.cnil.fr/fr/passer-laction/les-durees-de-conservation-des-donnees).

| Traitement                   | Finalités                             | Personnes/données                                                              | Base légale proposée                                                                                             | Destinataires                                                                      | Conservation proposée                                                       |
| ---------------------------- | ------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Compte et authentification   | créer et sécuriser le compte          | identité, e-mail, date de naissance, sessions, journaux de sécurité            | contrat ; intérêt légitime pour la sécurité                                                                      | personnel habilité, Supabase, hébergeur web                                        | vie du compte ; journaux selon nécessité                                    |
| Personnalisation alimentaire | filtrer et ordonner les recettes      | allergies, intolérances, interdictions, goûts, objectif, portions, âge calculé | consentement explicite à confirmer pour les données pouvant révéler la santé ; contrat pour les goûts ordinaires | personnel habilité, base Supabase ; fournisseur IA uniquement sous forme minimisée | vie du compte, suppression immédiate sur demande                            |
| Génération et planning       | fournir plans, recettes et listes     | préférences minimisées, tâches IA, plans, réactions, favoris                   | contrat                                                                                                          | Groq/Cloudflare si activés, Supabase                                               | tâches 30 jours ; détails techniques 14 jours ; contenu jusqu’à suppression |
| Support et signalements      | corriger une recette et répondre      | compte, message, recette signalée                                              | contrat ou intérêt légitime selon la demande                                                                     | personnel support habilité                                                         | durée de traitement puis archivage à définir                                |
| Sécurité et administration   | prévenir les abus et auditer          | identifiant, action administrative, corrélation, erreurs                       | intérêt légitime à confirmer                                                                                     | administrateurs habilités, Sentry si activé                                        | audit 365 jours proposé                                                     |
| Mesure produit               | comprendre les étapes et performances | événements fermés, durées par tranche, aucune allergie ni texte libre          | intérêt légitime ou consentement selon configuration                                                             | Umami si activé                                                                    | événements détaillés 90 jours ; agrégats 13 mois proposés                   |
| Consentements et suppression | prouver les choix et traitements      | identifiant pseudonymisé, version, date, statut                                | obligation légale/intérêt légitime à confirmer                                                                   | personnel habilité                                                                 | six ans proposés, à confirmer                                               |

## Analyse particulière des données alimentaires

Une allergie, une intolérance ou un croisement de données peut permettre de
déduire un état de santé. La
[CNIL rappelle qu’une donnée permettant une telle conclusion peut être une donnée de santé](https://www.cnil.fr/fr/quest-ce-ce-quune-donnee-de-sante).
Avant production, il faut donc :

1. qualifier chaque donnée et chaque finalité avec un professionnel ;
2. confirmer l’exception de l’article 9 du RGPD applicable ;
3. réaliser une analyse d’impact si les critères la rendent nécessaire ;
4. vérifier les exigences éventuelles d’hébergement et de sécurité ;
5. documenter un consentement explicite séparé si cette base est retenue.

## Droits et demandes

L’application fournit rectification, export et suppression depuis le compte. Une
procédure humaine doit compléter ce dispositif pour l’accès, la limitation,
l’opposition, le retrait du consentement et les demandes complexes. L’identité
du demandeur doit être vérifiée de manière proportionnée. Chaque demande doit
être enregistrée sans recopier inutilement ses données alimentaires.

## Mineurs

Le produit limite actuellement l’inscription aux personnes de 18 ans ou plus. Il
n’organise donc aucun consentement parental. Cette règle produit est plus
restrictive que le seuil français de 15 ans applicable à certains traitements
fondés sur le consentement dans les services en ligne, présenté par la
[CNIL](https://www.cnil.fr/fr/le-cadre-national/la-loi-informatique-et-libertes).
Toute ouverture future aux mineurs impose une nouvelle analyse produit,
contractuelle et juridique ainsi qu’une information adaptée.
