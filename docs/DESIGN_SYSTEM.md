# Design system web Goustia

Statut : **implémenté pour les fondations du MVP web le 23 juillet 2026**

## Principes

Le système visuel traduit le positionnement « cuisine fraîche et chaleureuse » :
surfaces crème et blanches, vert culinaire pour les actions principales et
orange terre cuite comme accent. L’information de sécurité ne dépend jamais
uniquement de la couleur.

Les composants sont situés dans `apps/web/src/components/ui`. Ils restent
spécifiques au web ; les jetons sémantiques pourront être extraits dans un
paquet partagé au démarrage de l’application mobile.

## Jetons

Les variables CSS et leur exposition à Tailwind sont définies dans
`apps/web/src/app/globals.css`.

| Groupe      | Jetons principaux                                      |
| ----------- | ------------------------------------------------------ |
| Surfaces    | `canvas`, `surface`, `surface-muted`                   |
| Texte       | `foreground`, `muted`                                  |
| Marque      | `brand`, `brand-hover`, `brand-soft`, `accent`         |
| États       | `danger`, `warning`, `success`, `focus`                |
| Formes      | rayons `sm` à `xl`, ombres `card` et `overlay`         |
| Typographie | Geist Sans, échelle Tailwind de `text-xs` à `text-6xl` |

Le texte courant conserve un contraste WCAG AA. Le focus visible utilise un
contour bleu de 3 px distinct de la couleur de marque.

## Composants disponibles

- `Button` : variantes principale, secondaire, discrète et dangereuse ;
- `TextField`, `TextareaField`, `SelectField`, `Checkbox`, `Radio` ;
- `Modal` fondée sur le dialogue natif et `Panel` ;
- `Alert` et `LiveNotification` avec annonces adaptées ;
- `Skeleton`, `EmptyState` et `ErrorState` ;
- `RecipeCard` et `FoodBadge` ;
- `OnboardingProgress`.

Les contrôles interactifs ont une cible minimale de 44 px. Les champs associent
libellé, aide et erreur au moyen des attributs accessibles. Les composants
acceptent une classe additionnelle uniquement pour ajuster leur placement, pas
pour recréer leurs états.

## États

- hover : renforcement de la surface ou de la couleur ;
- actif : déplacement discret réservé aux boutons ;
- focus : contour global visible ;
- désactivé : opacité réduite et curseur explicite ;
- erreur : texte préfixé par « Erreur » et association `aria-describedby` ;
- chargement : skeleton masqué aux technologies d’assistance, avec libellé de
  chargement porté par son conteneur.

## Catalogue de développement

La route `/_design-system` présente tous les composants et leurs principaux
états. Elle appelle `notFound()` en production et porte une directive `noindex`.
Elle ne remplace pas Storybook tant que le catalogue reste compact.

## Utilisation

Importer depuis le point d’entrée :

```tsx
import { Button, TextField } from "@/components/ui";

<TextField label="Prénom" required />;
<Button type="submit">Continuer</Button>;
```

Toute nouvelle variante doit répondre à un cas produit réel, conserver la
navigation clavier et recevoir un test proportionné au risque.
