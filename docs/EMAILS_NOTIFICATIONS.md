# E-mails et notifications

## Contenu implémenté

Les modèles locaux Supabase de confirmation d’adresse et de récupération de mot
de passe sont versionnés dans `supabase/templates`. Ils utilisent uniquement les
variables techniques Supabase et ne contiennent aucune préférence, allergie,
information nutritionnelle ou donnée de santé.

Les notifications produit sont limitées à :

- la disponibilité d’un planning ;
- un rappel facultatif d’ouverture de la liste de courses.

Chaque utilisateur contrôle les deux catégories, le canal e-mail, son fuseau
horaire et un maximum hebdomadaire. La désactivation est disponible depuis
`/notifications`, destination utilisée comme lien de désinscription dans les
futurs e-mails produit. Une limite en base bloque les envois au-delà de la
fréquence choisie. Les messages sont validés une seconde fois par le domaine et
la base refuse les termes pouvant révéler une donnée alimentaire sensible.

L’adaptateur `FakeNotificationAdapter` permet les tests sans envoyer de message.
Le raccordement à un fournisseur réel reste volontairement absent tant que le
domaine d’envoi et le sous-traitant ne sont pas validés.

## Configuration locale

Après une modification de modèle :

```text
npm run supabase:stop
npm run supabase:start
```

Mailpit reçoit les messages locaux. Aucun SMTP externe n’est nécessaire.

## Prérequis staging et production

Ces opérations exigent une validation humaine et ne sont donc pas considérées
comme terminées :

1. choisir un fournisseur SMTP et signer son DPA ;
2. réserver un sous-domaine transactionnel, par exemple `auth.goustia.fr` ;
3. publier l’enregistrement SPF fourni par le prestataire ;
4. publier les clés DKIM du prestataire ;
5. publier une politique DMARC en mode observation, analyser les rapports, puis
   renforcer progressivement la politique ;
6. désactiver le suivi des liens dans les e-mails d’authentification ;
7. configurer le SMTP personnalisé et recopier les modèles dans le tableau de
   bord Supabase hébergé ;
8. tester confirmation, récupération, changement d’adresse, rebonds et
   délivrabilité sur plusieurs fournisseurs de messagerie.

Références officielles :

- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/auth-email-templates
- https://supabase.com/docs/guides/local-development/customizing-email-templates

Le SMTP par défaut Supabase n’est pas une solution de production. Depuis juin
2026, les nouveaux projets gratuits doivent notamment raccorder un SMTP
personnalisé pour conserver des modèles modifiables.
