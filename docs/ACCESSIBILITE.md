# Accessibilité

Statut : **fondations automatisées en place le 23 juillet 2026**

## Objectif

Goustia vise **WCAG 2.2 niveau AA** sur le MVP web. Cet objectif concerne les
pages publiques, l’authentification, l’onboarding, le planning, les recettes et
les outils d’administration.

## Fondations implémentées

- lien d’évitement vers le contenu principal ;
- hiérarchie de titres documentée et un `h1` unique par page ;
- focus visible global de 3 px ;
- cibles tactiles interactives de 44 px minimum ;
- libellés explicites et erreurs associées aux champs ;
- dialogue natif pour le focus modal, la touche Échap et le retour du focus ;
- régions `status` et `alert` pour les changements dynamiques ;
- progression exposée par son libellé et ses valeurs, pas seulement sa couleur ;
- réduction globale des animations avec `prefers-reduced-motion` ;
- images utiles avec texte alternatif, images décoratives avec `alt=""` ;
- contenu des cartes compréhensible sans illustration.

## Contrôles automatiques

ESLint Next.js active `eslint-plugin-jsx-a11y`. Les tests de composants
utilisent Testing Library et Axe sur un échantillon représentatif. Ces outils
détectent les erreurs structurelles courantes, mais ne prouvent pas la
conformité d’un parcours complet.

Les contrastes des couples principaux ont été calculés sur les valeurs sRGB :

| Couple                             |   Ratio |
| ---------------------------------- | ------: |
| texte / fond crème                 | 15,02:1 |
| texte secondaire / fond crème      |  6,31:1 |
| marque / fond crème                |  6,27:1 |
| blanc / action principale          |  6,51:1 |
| erreur / fond erreur               |  6,05:1 |
| avertissement / fond avertissement |  6,35:1 |

Le contrôle Axe en DOM simulé désactive sa règle de contraste, indisponible sans
moteur de rendu. Chaque nouvelle couleur doit donc être calculée puis vérifiée
visuellement dans un navigateur.

La commande de contrôle est :

```bash
npm run check
```

## Règles de contribution

1. Donner un nom accessible à chaque contrôle.
2. Conserver un ordre du DOM cohérent avec l’ordre visuel.
3. Ne pas utiliser un élément non interactif à la place d’un bouton ou lien.
4. Ajouter un texte alternatif décrivant la fonction d’une image utile.
5. Annoncer les résultats asynchrones sans déplacer brutalement le focus.
6. Respecter les préférences de réduction des animations.
7. Vérifier zoom à 200 %, reflow à 320 px et tailles tactiles.
8. Ne jamais coder un état de sécurité uniquement par une couleur.

## Tests manuels encore obligatoires

Les cases de tests manuels de la roadmap restent ouvertes jusqu’à leur exécution
sur les vrais parcours. Avant la bêta, vérifier :

- clavier seul, y compris ordre du focus, modales et fermeture par Échap ;
- NVDA + Firefox ou Chrome sous Windows ;
- VoiceOver + Safari sur macOS et iOS ;
- TalkBack + Chrome sur Android ;
- zoom 200 % et reflow sans défilement horizontal non nécessaire ;
- contraste de chaque nouvelle combinaison de couleurs ;
- messages de validation et annonces après chargement ;
- contenu lorsque les images échouent ;
- confort avec réduction des animations ;
- Chrome, Firefox, Safari et Edge sur les tailles principales.

Chaque défaut bloquant les contraintes alimentaires, l’inscription ou l’accès à
une recette est prioritaire.
