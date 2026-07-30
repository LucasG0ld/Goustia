# Recette de tests manuels

Date d'exécution : _à renseigner_  
Version/commit : _à renseigner_  
Testeur : _à renseigner_  
Environnement : _local, staging ou production_

Les cases restent volontairement décochées tant qu'un humain n'a pas exécuté le
scénario sur la version indiquée. Pour chaque échec, joindre l'URL, une capture,
la console, le navigateur/appareil et les étapes exactes.

## Navigateurs et appareils

- [ ] Chrome bureau, dernière version stable
- [ ] Edge bureau, dernière version stable
- [ ] Firefox bureau, dernière version stable
- [ ] Safari macOS, dernière version stable
- [ ] Safari iOS sur iPhone réel
- [ ] Chrome Android sur appareil réel
- [ ] Petit écran 320 px, téléphone courant, tablette et grand écran
- [ ] Portrait puis paysage, sans débordement horizontal

## Parcours produit

- [ ] Inscription, confirmation d'adresse, onboarding progressif, planning
- [ ] Connexion, déconnexion et retour vers la page demandée
- [ ] Mot de passe oublié et nouveau mot de passe
- [ ] Ouverture d'une recette depuis le planning
- [ ] Like, dislike avec motif, annulation et persistance après rechargement
- [ ] Favori, retrait du favori et liste des favoris
- [ ] Remplacement d'un repas avec contraintes conservées
- [ ] Génération, ajout manuel, coche et export de la liste de courses
- [ ] Modification des allergies avec confirmation explicite
- [ ] Préférences, fréquence et désinscription des notifications
- [ ] Accès administrateur et refus d'accès d'un compte normal

## Accessibilité

- [ ] Effectuer tout le parcours principal au clavier uniquement
- [ ] Vérifier l'ordre du focus et la visibilité de l'indicateur de focus
- [ ] Vérifier les libellés, erreurs et messages avec NVDA ou VoiceOver
- [ ] Vérifier les titres, régions, liens d'évitement et boutons
- [ ] Zoom navigateur à 200 % sans perte de contenu ni d'action
- [ ] Contraste normal, mode sombre et préférence de mouvement réduit

## Réseau, pannes et quotas

- [ ] Réseau lent : affichage d'attente compréhensible et actions non dupliquées
- [ ] Coupure pendant une génération puis reprise/rechargement
- [ ] Quota utilisateur dépassé avec message non technique
- [ ] Plafond global atteint avec mode dégradé
- [ ] Panne Groq puis bascule Cloudflare
- [ ] Panne Cloudflare texte avec recette en cache ou erreur récupérable
- [ ] Panne Cloudflare image avec image générique
- [ ] Échec d'e-mail sans blocage du planning ou des courses

## Données difficiles et sécurité alimentaire

- [ ] Noms, notes et recherches avec accents, apostrophes et tirets
- [ ] Valeurs à longueur maximale et espaces en début/fin
- [ ] Caractères HTML, emoji et chaînes ressemblant à des instructions
- [ ] Allergies multiples et relations d'ingrédients héritées
- [ ] Recette alcoolisée refusée pour un mineur
- [ ] Aucune allergie, préférence alimentaire ou donnée de santé dans un e-mail
- [ ] Deux onglets modifiant le même planning : conflit expliqué sans perte

## Compte rendu

Résultat global : _non exécuté_  
Anomalies bloquantes : _à renseigner_  
Anomalies non bloquantes : _à renseigner_  
Décision de recette : _à renseigner_
