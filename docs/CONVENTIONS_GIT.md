# Conventions Git

## Stratégie

Le dépôt suit une approche trunk-based :

- `main` reste intégrable et protégée sur la forge ;
- les branches sont courtes et partent de `main` ;
- une pull request relue et validée par la CI est requise ;
- pas de branche longue `develop`.

Noms de branches :

```text
feat/nom-court
fix/nom-court
docs/nom-court
chore/nom-court
```

## Commits

Les messages suivent Conventional Commits :

```text
feat(web): ajoute le parcours d'inscription
fix(domain): bloque un allergène synonyme
docs(product): précise les quotas proposés
test(domain): couvre la majorité à la date anniversaire
chore(deps): met à jour les dépendances sûres
```

Types autorisés : `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`,
`ci`, `chore` et `revert`.

Un commit doit rester cohérent, ne pas contenir de secret et expliquer dans son
corps les décisions non évidentes. Les changements incompatibles utilisent `!`
ou un pied de message `BREAKING CHANGE:`.

## Pull requests

- une intention principale par pull request ;
- roadmap et documentation mises à jour si nécessaire ;
- contrôles locaux exécutés ;
- capture d'écran pour un changement visuel ;
- migration et stratégie de retour arrière pour un changement de données ;
- aucun contournement silencieux d'une alerte de sécurité.
