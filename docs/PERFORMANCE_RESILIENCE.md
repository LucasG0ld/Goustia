# Résilience et performance

## Contrats

| Dépendance         | Timeout | Retry                   | Coupe-circuit   |
| ------------------ | ------: | ----------------------- | --------------- |
| Groq texte         |    30 s | 2, exponentiel + jitter | 5 échecs, 60 s  |
| Cloudflare texte   |    30 s | 2, exponentiel + jitter | 5 échecs, 60 s  |
| Cloudflare image   |    45 s | 1                       | 4 échecs, 90 s  |
| Test de santé HTTP |     3 s | aucun                   | seuil de charge |

Les écritures critiques utilisent une clé d’idempotence. Une génération
`running` sans mise à jour depuis 15 minutes peut être clôturée par un
administrateur avec l’action auditée `RECUPERER LES TACHES`, puis relancée
séparément.

## Budgets web

- aucun chunk JavaScript individuel supérieur à 450 Kio (framework inclus) ;
- total des chunks JavaScript de build inférieur à 4 Mio ;
- santé locale : 0 % d’erreur et p95 inférieur à 250 ms sous 20 connexions ;
- LCP p75 inférieur à 2,5 s, INP p75 inférieur à 200 ms, CLS p75 inférieur à
  0,1, mesurés par le reporter Web Vitals existant ;
- pagination API bornée à 50 recettes et pages UI à 12 éléments ;
- images locales dimensionnées, images de recette dérivées et placeholder SVG.

Les Server Components restent la valeur par défaut. Le cache partagé est
autorisé seulement pour les recettes publiées et validées. Toute API liée à une
session reçoit `private, no-store`.

## Base de données

Les index ajoutés ciblent le catalogue publié, les repas d’un planning, le
triage bêta et l’expiration des compteurs. Avant modification, les accès
correspondants reposaient sur des filtres/ordres sans index composite dédié.
Après reset local, contrôler avec `EXPLAIN (ANALYZE, BUFFERS)` sur un jeu
anonymisé réaliste ; aucune mesure de production n’est autorisée ici.

## Sauvegarde et disponibilité

Objectif bêta : RPO 24 h, RTO 4 h. Objectif production à valider : RPO 24 h, RTO
2 h. Exporter la base et les objets de stockage chiffrés, conserver 30 jours et
tester trimestriellement une restauration dans un projet Supabase isolé.

Procédure de restauration : créer un projet vide, vérifier la version Postgres,
restaurer le schéma puis les données, contrôler les comptes/RLS, lancer pgTAP,
smoke tests et rapprochement des volumes. La restauration reste **non validée**
tant que ce scénario n’a pas été réellement exécuté et consigné.

## Rapport de mesure

Mesure locale exécutée le 30 juillet 2026, Windows, build Next.js 16.2.11 du lot
P55-P60 :

- JavaScript : 32 chunks, 1 381 714 octets au total ;
- plus gros chunk : 426 149 octets ;
- charge santé : 300 requêtes, concurrence 20, 0 erreur ;
- p50 66,35 ms, p95 169,85 ms, p99 211,10 ms.

Les deux budgets automatisés passent. Ce test raisonnable vérifie le socle HTTP,
pas une capacité de production ni un volume réaliste de recettes.

Commandes de reproduction :

```powershell
npm run build
npm run performance:budget
npm run start
# dans un second terminal
npm run performance:load
```

La date, la machine, le commit, le nombre de requêtes, p50/p95/p99 et le taux
d’erreur doivent être conservés dans le rapport de lot.
