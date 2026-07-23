# Wireframes web responsive

Ces wireframes décrivent la hiérarchie et les états, pas l'identité graphique
finale. « Mobile » désigne ici un navigateur étroit, pas une application native.

## Grille responsive

| Largeur       | Navigation                                  | Contenu                         |
| ------------- | ------------------------------------------- | ------------------------------- |
| `< 768 px`    | Barre inférieure, action principale visible | 1 colonne, panneaux plein écran |
| `768–1199 px` | Barre supérieure compacte                   | 2 colonnes, panneaux latéraux   |
| `≥ 1200 px`   | Barre supérieure complète                   | Conteneur 1200 px, 3–4 cartes   |

## Landing et inscription

```text
MOBILE                         TABLETTE / ORDINATEUR
┌────────────────────┐         ┌────────────────────────────────────────┐
│ Goustia      Entrer│         │ Goustia    Fonctionnement  Entrer      │
│                    │         ├────────────────────────────────────────┤
│ Des repas qui      │         │ Des repas qui apprennent vos goûts     │
│ apprennent tes     │         │ [Créer mon planning]  [Voir exemples]  │
│ goûts              │         │                         [plats exemple] │
│ [Créer mon planning│         ├────────────────────────────────────────┤
│ [Voir des exemples]│         │ 1. Préférences  2. Propositions  3. IA │
│ ────────────────── │         └────────────────────────────────────────┘
│ Comment ça marche  │
│ Recettes exemples  │
└────────────────────┘
```

L'inscription utilise une seule colonne, même sur ordinateur, pour réduire les
erreurs. Le mot de passe affiche ses critères avant validation.

## Onboarding

```text
┌──────────────────────────────────────────────┐
│ Étape 2 sur 4  ●━━━━●━━━━○━━━━○  Sauvegardé │
│                                              │
│ Y a-t-il des aliments à exclure absolument ?│
│ [ Rechercher un ingrédient...              ]│
│ [Allergie] [Intolérance] [Exclusion stricte]│
│ + Arachide — Allergie                 [×]    │
│                                              │
│ ℹ Ces choix passent avant toutes tes envies.│
│ [Retour]                         [Continuer]  │
└──────────────────────────────────────────────┘
```

Sur mobile, les actions restent en bas de la fenêtre. La progression utilise
texte et forme, pas seulement la couleur. Les premiers goûts s'affichent en
cartes de deux colonnes sur mobile et quatre sur ordinateur, avec « Passer pour
l'instant ».

## Accueil

```text
MOBILE                         ORDINATEUR
┌────────────────────┐         ┌────────────────────────────────────────┐
│ Goustia       Profil│        │ Goustia  Accueil Planning Courses ...  │
│ Semaine 30    [⌄]  │         ├────────────────────────────────────────┤
│ Ton prochain repas │         │ Semaine 30             [Changer]       │
│ ┌────────────────┐ │         │ ┌──────────────┐  Tes repas            │
│ │ image          │ │         │ │ prochain     │  [carte][carte][carte]│
│ │ Curry pois ... │ │         │ │ repas        │  [carte][carte][carte]│
│ │ 25 min  facile │ │         │ └──────────────┘                       │
│ │ ♡  👎  Changer │ │         │ [Voir le planning] [Liste de courses]  │
│ └────────────────┘ │         └────────────────────────────────────────┘
│ Tes repas          │
│ [carte] [carte]    │
├────────────────────┤
│Accueil Plan Courses│
└────────────────────┘
```

États :

- vide : illustration légère, bénéfice et bouton « Générer ma semaine » ;
- génération : squelettes et étapes réelles ;
- partiel : recettes prêtes affichées, cartes restantes en attente ;
- erreur : plan précédent conservé et action de reprise.

## Planning

```text
┌──────────────────────────────────────────────────────────┐
│ ‹ Semaine précédente    20–26 juillet     Semaine suivante ›│
│ [Lun] [Mar] [Mer] [Jeu] [Ven] [Sam] [Dim]                │
├──────────────────────────────────────────────────────────┤
│ Lundi                                                     │
│ Déjeuner  [Salade lentilles  20 min] [♡] [👎] [Changer]   │
│ Dîner     [Curry légumes    35 min] [♡] [👎] [Changer]    │
└──────────────────────────────────────────────────────────┘
```

Sur mobile, un seul jour est visible et se change par onglets défilants. Sur
ordinateur, la semaine peut s'afficher en grille; le détail reste accessible au
clavier et sans glisser-déposer obligatoire.

## Fiche recette

```text
┌──────────────────────────────────────────────────────────┐
│ [Retour]                         ♡  👎  [Remplacer]        │
│ ┌──────────────────┐ Curry de légumes                     │
│ │ image IA         │ 35 min · Facile · 4 portions         │
│ │ Image illustrative│ Allergènes : aucun connu            │
│ └──────────────────┘ [Marquer comme cuisiné]              │
├──────────────────────────┬───────────────────────────────┤
│ Ingrédients              │ Étapes                        │
│ □ 2 carottes             │ 1  Préparer...               │
│ □ 400 g pois chiches     │ 2  Cuire...                   │
├──────────────────────────┴───────────────────────────────┤
│ Nutrition estimée · Source Ciqual · fourchettes          │
└──────────────────────────────────────────────────────────┘
```

Sur mobile, image, résumé, ingrédients puis étapes s'empilent. Un mode cuisine
ultérieur pourra agrandir les étapes sans modifier cette structure.

## Panneau de swap

```text
┌────────────────────────────────────┐
│ Remplacer ce repas              [×]│
│ Pourquoi ? Facultatif              │
│ ( ) Pas envie  ( ) Trop long       │
│ ( ) Ingrédient ( ) Déjà mangé      │
│                                    │
│ [Garder la recette] [Proposer autre]│
└────────────────────────────────────┘
```

Après génération, l'alternative apparaît avant confirmation. Sur mobile le
panneau occupe l'écran; sur ordinateur il est latéral. Fermer ne change rien.

## Liste de courses

```text
┌───────────────────────────────────────┐
│ Courses · Semaine 30  [Recalculer]    │
│ Fruits et légumes                    │
│ ☑ Carottes · 6                       │
│ ☐ Courgettes · 800 g                 │
│ Épicerie                             │
│ ☐ Pois chiches · 2 boîtes            │
│ [+ Ajouter]           [Partager]      │
└───────────────────────────────────────┘
```

Les cases possèdent une cible tactile de 44 px minimum. L'état coché n'est pas
transmis uniquement par une couleur.

## Favoris et profil

Favoris : recherche, filtres en boutons, grille de cartes et état vide.  
Profil : menu de sections à gauche sur ordinateur, liste puis sous-écran sur
mobile. La section « Sécurité alimentaire » est toujours visible en premier
niveau et distingue clairement exclusions absolues et préférences.

## Administration

```text
┌──────────────┬──────────────────────────────────────────┐
│ Vue globale  │ Alertes sécurité       0                 │
│ Signalements │ Générations en erreur  2                 │
│ Recettes     │ Coût IA aujourd'hui    0,42 €            │
│ IA & quotas  │ [Voir les erreurs] [Voir signalements]   │
│ Référentiel  │                                          │
└──────────────┴──────────────────────────────────────────┘
```

Les tableaux deviennent des cartes libellées sur petit écran. Aucun champ
personnel n'est visible dans les listes par défaut.

## Accessibilité à valider au prototype

- ordre de tabulation et retour du focus après fermeture d'un panneau ;
- annonces des erreurs, sauvegardes et générations via régions live ;
- zoom 200 % sans perte de contenu ;
- actions like/dislike avec libellés, état pressé et texte ;
- alternatives à toutes les interactions tactiles ;
- cibles de 44 × 44 px et contraste WCAG AA.
