# Bilan de stabilité web avant mobile

Décision au 30 juillet 2026 : **NO-GO pour démarrer le portage mobile**.

Les contrats publics v1 sont versionnés, paginés et documentés. Les protections
web, la reprise des tâches et les budgets locaux sont prêts. En revanche, aucun
lancement production ni bêta réelle n’a eu lieu ; il n’existe donc pas de
mesures fiables d’erreurs, latence, coût, abandon ou qualité des recommandations
en conditions réelles. La restauration, la validation juridique et les avis de
dépendances restent ouverts.

Le go mobile exigera :

- une bêta conclue et tous les critères P0 fermés ;
- une période de stabilisation production avec métriques représentatives ;
- aucun changement cassant de l’API v1 pendant la fenêtre convenue ;
- OpenAPI validé par tests de contrat et stratégie de dépréciation publiée ;
- arbitrage des P1 retenues et capacité de support suffisante.

Geler un contrat signifie ajouter de nouveaux champs de façon compatible,
versionner toute rupture sous `/api/v2`, conserver les codes d’erreur existants
et annoncer la dépréciation avant suppression.
