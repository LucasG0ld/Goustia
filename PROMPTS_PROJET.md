# Bibliothèque complète de prompts — Application de recettes personnalisées

Ce document contient les prompts à utiliser, dans l'ordre, pour réaliser le
projet décrit dans :

- [`CAHIER_DES_CHARGES.md`](CAHIER_DES_CHARGES.md)
- [`ROADMAP_PROJET.md`](ROADMAP_PROJET.md)
- [`docs/ARCHITECTURE_TECHNIQUE.md`](docs/ARCHITECTURE_TECHNIQUE.md)
- [`docs/ETUDE_IA_FREEMIUM.md`](docs/ETUDE_IA_FREEMIUM.md)

Dernière mise à jour : 23 juillet 2026

---

## 1. Mode d'emploi

1. Utiliser les prompts dans l'ordre indiqué.
2. Copier le **bloc commun** au début de chaque nouvelle conversation.
3. Ajouter ensuite un seul prompt de travail.
4. Ne lancer plusieurs prompts en parallèle que si leurs fichiers et dépendances
   ne se chevauchent pas.
5. Ne jamais fournir de vraie clé API dans un prompt.
6. Remplacer les valeurs entre crochets uniquement lorsqu'elles sont connues.
7. À la fin de chaque lot, vérifier le diff, les tests et les cases cochées.
8. Ne pas passer au prompt suivant lorsqu'un critère bloquant reste ouvert.

Les prompts de décision demandent une validation humaine. Les prompts
d'implémentation autorisent la modification du dépôt dans le périmètre indiqué.

---

## 2. Bloc commun à joindre à chaque prompt

```text
Tu travailles dans le dépôt de l'application de recettes personnalisées.

Avant toute action :
1. Lis intégralement les fichiers AGENTS.md applicables.
2. Lis CAHIER_DES_CHARGES.md, ROADMAP_PROJET.md,
   docs/ARCHITECTURE_TECHNIQUE.md et docs/ETUDE_IA_FREEMIUM.md.
3. Inspecte le code, l'état Git, les dépendances et les changements existants.
4. Préserve tous les changements utilisateur sans rapport avec ce lot.

Règles permanentes :
- Respecte l'architecture Next.js + TypeScript + Supabase + packages partagés.
- Place le métier déterministe et les schémas partagés dans @recettes/domain.
- Utilise des Server Components par défaut et limite les Client Components.
- Valide toutes les frontières avec Zod.
- N'expose aucun secret au navigateur ou au mobile.
- N'envoie aucune donnée personnelle directe aux fournisseurs IA.
- Ne confie jamais les allergies, l'alcool ou les calculs nutritionnels
  uniquement à un modèle génératif.
- Active et teste RLS pour toute donnée appartenant à un utilisateur.
- Utilise uniquement les documentations officielles pour vérifier une API ou
  une bibliothèque susceptible d'avoir changé.
- N'ajoute pas une abstraction, une dépendance ou une fonctionnalité hors lot
  sans nécessité démontrée.
- Traite chargement, vide, succès et erreur.
- Respecte WCAG 2.2 AA et le responsive.
- Écris les tests proportionnés au risque.

Avant de terminer :
1. Exécute formatage, lint, typecheck, tests et build pertinents.
2. Corrige les erreurs introduites par le lot.
3. Mets à jour la documentation.
4. Coche dans ROADMAP_PROJET.md uniquement les tâches réellement terminées et
   vérifiées. Ne coche jamais une tâche partielle ou dépendante d'un compte,
   d'une validation humaine ou d'un service non configuré.
5. Fournis un bilan concis : résultat, fichiers majeurs, validations,
   migrations, variables à configurer et blocages restants.
```

---

# PARTIE A — CADRAGE ET FONDATIONS

## P00 — Audit initial et plan d'exécution

```text
Applique le bloc commun. Réalise un audit en lecture seule de l'état actuel du
projet. Compare le dépôt aux sections 3 à 10 de ROADMAP_PROJET.md. Identifie ce
qui est terminé, partiel, absent ou bloqué par une décision humaine. Vérifie les
versions, scripts, structure du monorepo et documents existants. Produis
docs/AUDIT_INITIAL.md avec le chemin critique actualisé, les risques et l'ordre
des cinq prochains lots. Ne modifie pas encore l'application et ne coche aucune
tâche supplémentaire.
```

## P01 — Nom, identité et direction visuelle

```text
Applique le bloc commun. Traite la section 3.1 de la roadmap comme un atelier de
décision. Propose plusieurs noms, positionnements, tons éditoriaux et directions
visuelles adaptés à une application française de recettes personnalisées.
Vérifie sur le web les disponibilités qui peuvent changer, sans acheter ni
réserver quoi que ce soit. Présente les compromis, recommande une option et
consigne les décisions validées dans docs/IDENTITE_PRODUIT.md. N'implémente
l'identité qu'après choix explicite du responsable produit.
```

## P02 — Décisions produit et règles métier ouvertes

```text
Applique le bloc commun. À partir de la section 3.2 de la roadmap, transforme
chaque décision encore ouverte en question courte avec recommandation,
conséquences et valeur par défaut réversible. Couvre public cible, âge minimum,
mineurs, pays, repas, portions, quotas, objectifs, répétitions, dislikes,
remplacements, accès sans compte et vérification d'e-mail. Après validation
humaine, écris docs/DECISIONS_PRODUIT.md et reporte les règles stables dans
@recettes/domain avec tests si elles sont exécutables.
```

## P03 — Indicateurs produit et plan analytics

```text
Applique le bloc commun. Définis les KPI et événements de la section 3.3 sans
collecter de données sensibles inutiles. Crée docs/PLAN_ANALYTICS.md avec nom,
déclencheur, propriétés autorisées, durée de conservation, finalité et tableau
de bord cible pour chaque événement. Inclue onboarding, première génération,
likes, dislikes, swaps, plat cuisiné, rétention et coût IA. Propose un outil
respectueux du RGPD, mais ne crée aucun compte externe sans autorisation.
```

## P04 — Git, conventions et qualité du dépôt

```text
Applique le bloc commun. Implémente les tâches restantes de la section 4.1 :
Git racine si absent, conventions, formatage, modèles de contribution, scripts
de contrôle et politique de dépendances. Ne modifie pas l'historique existant.
Analyse les alertes npm, applique uniquement des corrections sûres et documente
les exceptions. Ajoute un guide CONTRIBUTING.md et vérifie qu'un nouveau
contributeur peut installer puis valider le projet avec des commandes simples.
```

## P05 — Intégration continue

```text
Applique le bloc commun. Implémente la section 4.2. Crée une CI adaptée à la
plateforme Git choisie : installation verrouillée, cache, lint, typecheck,
tests, build, migrations et futurs tests Playwright. Applique le moindre
privilège aux permissions du workflow. Ajoute les badges ou la documentation
utile. Valide localement les commandes exactes utilisées par la CI.
```

## P06 — Environnements et secrets

```text
Applique le bloc commun. Prépare la section 4.3 sans créer ni facturer de
ressource externe sans autorisation. Définis local, test, staging et production,
leurs variables, propriétaires et règles de promotion. Complète les fichiers
.env.example sans secret, ajoute une validation typée de l'environnement et
fais échouer clairement le serveur lorsqu'une variable requise manque. Crée
docs/ENVIRONNEMENTS.md avec rotation, séparation et matrice des secrets.
```

## P07 — Supabase local et migrations

```text
Applique le bloc commun. Implémente la section 4.4. Initialise Supabase local,
les migrations, seeds non sensibles, scripts npm et génération des types
TypeScript. Respecte les versions actuelles de la CLI et la documentation
officielle. Vérifie qu'une base vide peut être reconstruite de manière
déterministe. Documente démarrage, reset, migration, génération des types et
restauration dans docs/SUPABASE_LOCAL.md.
```

## P08 — Observabilité et journalisation

```text
Applique le bloc commun. Conçois puis implémente la section 4.5 avec une
solution compatible Next.js et les contraintes RGPD. Ajoute logs structurés,
correlation IDs, masquage, suivi d'erreurs et métriques essentielles. Ne
journalise jamais prompts complets, allergies, date de naissance, jetons ou
secrets. Prévois une configuration inactive sans clé et documente tableaux de
bord, alertes et procédure de diagnostic.
```

---

# PARTIE B — UX ET DONNÉES

## P09 — Parcours utilisateurs et wireframes

```text
Applique le bloc commun. Réalise la section 5.1. Cartographie tous les parcours
du MVP, leurs bifurcations, états d'erreur et reprises. Produis des wireframes
responsive suffisamment précis pour inscription, onboarding, accueil,
planning, recette, swap, courses, favoris, profil et administration. Utilise
des artefacts faciles à relire dans docs/UX/. Distingue les hypothèses des
décisions validées et prépare un protocole court de test utilisateur.
```

## P10 — Design system web

```text
Applique le bloc commun. À partir de l'identité validée et des wireframes,
implémente la section 5.2. Crée tokens, composants accessibles, variantes,
états et documentation visuelle. Évite une bibliothèque lourde sans nécessité.
Les composants doivent couvrir formulaires, cartes recette, badges, modales,
notifications, skeletons et états vides. Ajoute des tests de composants
pertinents et une page de démonstration non exposée en production.
```

## P11 — Audit et fondations d'accessibilité

```text
Applique le bloc commun. Implémente la section 5.3 et crée
docs/ACCESSIBILITE.md. Configure les outils automatiques pertinents, puis vérifie
contrastes, titres, focus, clavier, annonces dynamiques, réduction des
animations, textes alternatifs et tailles tactiles. Corrige les composants
existants. Documente les tests manuels restant obligatoires ; un scanner
automatique ne suffit pas à cocher toute la section.
```

## P12 — Schéma utilisateurs et préférences

```text
Applique le bloc commun. Conçois et implémente les migrations de la section
6.1. Modélise profils, objectif, portions, fréquence, onboarding et préférences
progressives sans surcharger une seule colonne JSON. Ajoute contraintes,
index, timestamps et commentaires SQL. Mets à jour les types générés et les
schémas du domaine. Ajoute seeds et tests de migration, sans encore implémenter
l'interface.
```

## P13 — Schéma ingrédients, allergènes et contraintes

```text
Applique le bloc commun. Implémente la section 6.2. Modélise ingrédients
canoniques, synonymes, familles, dérivés, allergènes et contraintes utilisateur.
Distingue strictement allergie, intolérance, interdiction et préférence
négative. Prévois recherche française tolérante aux accents. Ajoute contraintes
d'intégrité, index, types, seeds minimaux et tests SQL.
```

## P14 — Schéma recettes et nutrition

```text
Applique le bloc commun. Implémente la section 6.3. Modélise recettes,
versions, ingrédients, étapes, tags, portions, durées, difficulté, coût,
nutrition, provenance IA, prompt versionné, validation, publication,
déduplication et images. Normalise ce qui doit être interrogé. Ajoute
contraintes, index, cascade maîtrisée, types et tests de migration.
```

## P15 — Schéma planning et interactions

```text
Applique le bloc commun. Implémente la section 6.4. Crée plannings, repas
planifiés, jours, types, portions, verrouillage, réactions, motifs, swaps,
favoris et statut cuisiné. Garantit l'idempotence et empêche les doublons.
Prévois l'historique nécessaire à l'apprentissage sans conserver d'information
inutile. Ajoute index, types et tests.
```

## P16 — Schéma courses, tâches IA et administration

```text
Applique le bloc commun. Implémente la section 6.5. Crée listes et éléments de
courses, tâches IA, tentatives, consommation, quotas, signalements, rôles et
audit administrateur. Sépare messages utilisateur et détails techniques.
Définis les politiques de rétention des tâches. Ajoute contraintes, index,
types, seeds et tests.
```

## P17 — RLS et tests d'isolation

```text
Applique le bloc commun. Implémente toute la section 6.6 sur le schéma complet.
Active RLS, retire les privilèges implicites, écris les politiques minimales et
indexe leurs prédicats. Crée des tests automatisés avec deux utilisateurs, un
anonyme et un administrateur. Vérifie lecture, insertion, modification,
suppression, fonctions, vues et Storage. Aucun écran applicatif ne doit
compenser une autorisation absente en base.
```

---

# PARTIE C — COMPTE, CONFORMITÉ ET ONBOARDING

## P18 — Authentification web complète

```text
Applique le bloc commun. Implémente la section 7.1 selon la documentation
Supabase SSR et la version installée de Next.js. Ajoute inscription, connexion,
déconnexion, vérification, oubli et réinitialisation. Finalise clients, proxy,
claims, cookies, redirections, expiration et rate limiting. N'utilise pas une
session non vérifiée pour autoriser un accès. Ajoute tests d'intégration et de
parcours.
```

## P19 — Gestion et suppression du compte

```text
Applique le bloc commun. Implémente la section 7.2 : consultation et
modification du compte, changement d'e-mail et mot de passe, révocation des
sessions, export et suppression. La suppression doit être explicite,
confirmée, auditable et conforme à la politique de rétention. Ajoute une
fonction serveur idempotente, les politiques nécessaires et des tests couvrant
les données liées.
```

## P20 — RGPD, mineurs et documents légaux

```text
Applique le bloc commun. Traite la section 7.3. Produis des brouillons complets
mais clairement marqués « à valider par un professionnel » : registre des
traitements, conservation, sous-traitants, transferts, mineurs, cookies,
politique de confidentialité, CGU, mentions légales et avertissement
nutritionnel. Implémente le versionnement des consentements et les pages.
N'affirme jamais fournir un avis médical ou une conformité juridique garantie.
```

## P21 — Onboarding : compte et sécurité alimentaire

```text
Applique le bloc commun. Implémente les sections 8.1 et 8.2 avec une expérience
très courte. Crée les écrans, validations client/serveur, recherche
d'ingrédients, option sans contrainte, explications et confirmation. Calcule
l'âge côté métier sans transmettre la date à l'IA. Empêche contradictions et
soumissions partielles dangereuses. Ajoute analytics autorisés, tests
d'accessibilité et tests de parcours.
```

## P22 — Onboarding : objectif, goûts, reprise et première génération

```text
Applique le bloc commun. Implémente les sections 8.3 à 8.5 : objectif, fréquence,
portions, cartes facultatives, progression, sauvegarde par étape, reprise et
déclenchement de génération. Une carte ignorée n'est pas un dislike. Ajoute un
écran d'attente résilient et les événements d'abandon. Utilise un fournisseur
IA factice tant que le pipeline réel n'est pas validé.
```

## P23 — Profil progressif et questions contextuelles

```text
Applique le bloc commun. Implémente la section 8.6. Ajoute complétion, goûts,
cuisines, niveau, temps, budget et équipements. Crée un moteur simple qui pose
une question pertinente, ignorable et peu fréquente après certaines actions.
Stocke la provenance explicite ou déduite de chaque préférence. Permets la
correction et teste que ces données ne deviennent jamais des exclusions de
sécurité.
```

---

# PARTIE D — RÉFÉRENTIEL, NUTRITION ET SÉCURITÉ

## P24 — Taxonomie des ingrédients

```text
Applique le bloc commun. Implémente la section 9.1. Crée une taxonomie française
versionnée avec ingrédients, synonymes, pluriels, familles, dérivés,
allergènes, alcool et unités. Commence par le périmètre nécessaire au benchmark
plutôt qu'une liste non vérifiée infinie. Ajoute import idempotent, tests de
recherche et procédure de correction administrateur. Cite les sources.
```

## P25 — Import ANSES Ciqual 2025

```text
Applique le bloc commun. Implémente la section 9.2 à partir de la source
officielle. Vérifie licence et attribution, conserve le fichier source ou sa
procédure reproductible, crée un import idempotent et versionné, puis rapproche
les ingrédients internes. Gère explicitement absences, traces et incertitudes.
Teste le volume, les doublons et plusieurs aliments connus. Documente la mise à
jour future.
```

## P26 — Calcul nutritionnel et conversions

```text
Applique le bloc commun. Implémente la section 9.3 dans @recettes/domain. Crée
types d'unités, conversions, calcul par ingrédient, recette et portion, gestion
des valeurs manquantes et indice de confiance. Ne fabrique aucune valeur
absente. Affiche les résultats comme estimatifs et masque ceux sous le seuil
validé. Ajoute un jeu riche de tests numériques et de limites.
```

## P27 — Moteur de sécurité alimentaire

```text
Applique le bloc commun. Implémente la section 9.4 comme module métier pur.
Normalise chaque ingrédient, traverse synonymes, familles, dérivés, allergènes
et alcool, puis produit un rapport explicable. Bloque toute recette ambiguë ou
incompatible avant stockage et revalide avant affichage. Crée un corpus de
tests adversariaux pour allergies multiples, traces, alcool caché et majorité.
Ce lot est bloquant pour toute génération réelle.
```

---

# PARTIE E — INTELLIGENCE ARTIFICIELLE

## P28 — Comptes fournisseurs et runbook de secrets

```text
Applique le bloc commun. Prépare la section 10.1 sans créer de compte ni
afficher de secret à la place du propriétaire. Produis une procédure pas à pas
pour Groq et Cloudflare : comptes, clés par environnement, permissions, ZDR,
quotas, budgets, rotation et incident. Vérifie les documentations officielles
actuelles. Ajoute des tests de configuration sans effectuer de génération
facturable. Laisse non cochées les actions humaines non exécutées.
```

## P29 — Contrats de génération de recettes

```text
Applique le bloc commun. Implémente la section 10.2 dans @recettes/domain.
Définis entrée pseudonymisée, recette structurée, ingrédients, unités, étapes,
nutrition attendue, allergènes déclarés, prompt visuel et rapport technique.
Utilise Zod et JSON Schema compatibles avec le fournisseur principal. Versionne
le contrat et ajoute exemples valides, invalides et tests de compatibilité.
```

## P30 — Adaptateurs IA et fournisseur factice

```text
Applique le bloc commun. Implémente la section 10.3. Crée RecipeGenerator et
RecipeImageGenerator, fabrique configurable, adaptateurs Groq, Cloudflare texte,
Cloudflare image et fake déterministe. Utilise AI SDK seulement là où il
apporte une abstraction réelle. Normalise erreurs, timeouts, retries et
coupe-circuit. Marque tout le code secret comme server-only. Teste les
adaptateurs sans réseau avec des réponses simulées.
```

## P31 — Prompts de génération versionnés

```text
Applique le bloc commun. Implémente la section 10.4. Rédige et versionne le
prompt système, les exemples et le prompt visuel. Impose français, schéma,
quantités, cohérence, exclusions et absence d'alcool. Sépare données et
instructions afin de résister aux injections. N'inclus jamais identité ou date
de naissance. Ajoute snapshots, changelog, critères d'évaluation et tests de
construction des prompts.
```

## P32 — Orchestration complète de génération

```text
Applique le bloc commun. Implémente la section 10.5 avec tâches persistées et
états observables. Vérifie identité/quota, pseudonymise, génère par lot, valide,
normalise, contrôle allergies, calcule nutrition, vérifie cohérence, déduplique,
retente puis enregistre uniquement les résultats sûrs. Gère panne, timeout,
reprise et idempotence. Ajoute API v1, fake en tests et tests d'intégration de
tous les échecs.
```

## P33 — Pipeline d'images

```text
Applique le bloc commun. Implémente la section 10.6 avec FLUX.2 Klein 4B puis
FLUX.1 Schnell en secours. Une image n'est générée qu'après validation de la
recette et une seule fois par recette canonique. Vérifie contenu technique,
dimensions, format, compression, métadonnées et stockage Supabase. Ajoute
placeholder, mention illustrative, régénération admin et tests simulés.
```

## P34 — Quotas, coûts et dégradation

```text
Applique le bloc commun. Implémente la section 10.7. Ajoute quotas utilisateur
et globaux, compteurs idempotents, consommation par modèle, coûts estimés,
seuils d'alerte et coupe-circuit. Définis les modes dégradés : cache, fournisseur
de secours et absence d'image. Empêche la concurrence de dépasser un quota.
Expose uniquement les informations nécessaires à l'utilisateur et le détail à
l'administration.
```

## P35 — Corpus et benchmark IA

```text
Applique le bloc commun. Implémente la section 10.8. Crée au moins 50 profils
strictement fictifs, un runner reproductible et des métriques pour format,
allergies, alcool, quantités, étapes, français, diversité, latence, coût et
images. Compare Groq et Cloudflare sans envoyer de donnée réelle. Produis un
rapport daté dans docs/benchmarks/. Ne valide pas le fournisseur tant que les
seuils de sortie n'ont pas été acceptés.
```

---

# PARTIE F — RECOMMANDATION ET EXPÉRIENCE WEB

## P36 — Recommandation déterministe

```text
Applique le bloc commun. Implémente la section 11.1 comme fonctions métier
testables : éligibilité absolue, régime, goûts, dislikes, récence, durée,
budget, objectif et diversité hebdomadaire. Sépare filtrage et scoring. Produis
une explication courte sans révéler de données sensibles. Ajoute fixtures,
tests de stabilité, égalités et absence de contournement des exclusions.
```

## P37 — Apprentissage par interactions

```text
Applique le bloc commun. Implémente la section 11.2. Convertis like, favori,
cuisiné, dislike motivé, swap et ignorance en signaux pondérés, traçables et
réversibles. Ne transforme jamais une préférence en allergie. Mets à jour le
profil sans bloquer la requête utilisateur et permets la correction. Ajoute
tests sur répétitions, conflits et vieillissement des signaux.
```

## P38 — Shell authentifié et accueil

```text
Applique le bloc commun. Implémente les sections 12.1 et 12.2 depuis les
wireframes. Crée layout, navigation responsive, protections, semaine active,
cartes recettes, informations, explication, progression, états vides et
erreurs. Utilise Server Components pour les données et des îlots clients pour
les interactions. Ajoute tests d'accessibilité, composants et parcours.
```

## P39 — Planning hebdomadaire

```text
Applique le bloc commun. Implémente la section 12.3. Ajoute vue responsive,
types de repas, ajout, suppression, déplacement, portions, verrouillage et
régénération des éléments non verrouillés. Préserve l'intégrité en cas de
conflit ou d'échec et confirme les opérations coûteuses. Utilise des mutations
idempotentes et ajoute tests métier, API et parcours.
```

## P40 — Navigation entre semaines

```text
Applique le bloc commun. Implémente la section 12.4 : semaines précédente et
suivante, création, copie, historique et prévention des doublons. Définis les
fuseaux et bornes temporelles de manière explicite. Assure une URL partageable
sans exposer un autre utilisateur. Ajoute tests autour des changements d'année
et de fuseau.
```

## P41 — Fiche recette

```text
Applique le bloc commun. Implémente la section 13.1. Crée la route dynamique et
affiche image, description, durées, difficulté, portions, coût, nutrition,
allergènes, matériel, ingrédients, étapes, variantes, substitutions,
conservation et réchauffage. Revalide la compatibilité avec l'utilisateur avant
affichage. Traite recette absente, retirée ou devenue incompatible.
```

## P42 — Actions recette et mode cuisine

```text
Applique le bloc commun. Implémente les sections 13.2 et 13.3. Ajoute portions
et recalcul, like, dislike, favori, cuisiné, courses, remplacement et
signalement, avec idempotence. Ajoute ensuite mode cuisine, étapes cochables,
minuteurs, grands contrôles et maintien d'écran lorsque possible. Teste clavier,
tactile, reprise et doubles clics.
```

## P43 — Like, favori et dislike motivé

```text
Applique le bloc commun. Finalise les sections 14.1 et 14.2 sur toutes les
surfaces. Ajoute retours optimistes réversibles, motifs prédéfinis et libres,
annulation et mise à jour des signaux. Distingue like et favori. Un dislike ne
devient jamais une contrainte de sécurité. Ajoute analytics autorisés et tests
d'idempotence, d'accessibilité et de concurrence.
```

## P44 — Remplacement d'une recette

```text
Applique le bloc commun. Implémente la section 14.3. Propose trois alternatives
ou une demande libre, permet de conserver nutrition, budget ou durée, applique
toutes les exclusions et remplace uniquement le repas choisi. Restaure l'ancien
état en cas d'échec, compte le quota une seule fois et enregistre le signal
contextuel. Teste pannes, contenu dangereux et demandes contradictoires.
```

## P45 — Génération de la liste de courses

```text
Applique le bloc commun. Implémente la section 15.1 dans le domaine puis l'API.
Agrège les ingrédients, convertit les unités compatibles, conserve les
provenances, ajuste les portions et classe par rayon. Préserve les ajouts
manuels lors d'une régénération. Définis clairement les cas non fusionnables et
ajoute de nombreux tests de quantités.
```

## P46 — Interface, partage et export des courses

```text
Applique le bloc commun. Implémente les sections 15.2 et 15.3. Crée une
interface utilisable en magasin : groupes, cases, édition, suppression,
disponible, filtres et reset confirmé. Ajoute copie texte, impression, partage
natif et export. L'estimation de prix reste masquée tant qu'une source fiable
n'est pas disponible. Teste petits écrans et fonctionnement réseau dégradé.
```

## P47 — Favoris, historique et profil

```text
Applique le bloc commun. Implémente les sections 16.1 à 16.3. Ajoute recherche,
filtres, réutilisation, historique, statut d'éligibilité, modification du profil
et préférences déduites. Une suppression d'allergie demande une confirmation
renforcée. Recalcule l'éligibilité après tout changement strict. Ajoute
pagination, états vides, RLS et tests de parcours.
```

---

# PARTIE G — ADMINISTRATION, COMMUNICATIONS ET QUALITÉ

## P48 — Accès administrateur et gestion des utilisateurs

```text
Applique le bloc commun. Implémente les sections 17.1 et 17.2. Crée un espace
séparé, rôle vérifié côté serveur et base, authentification renforcée et audit.
Limite les données utilisateur visibles. Ajoute recherche, statut, suspension
et traitement des suppressions avec confirmation. Teste qu'un utilisateur
normal ou suspendu ne peut jamais accéder à l'administration.
```

## P49 — Administration des recettes et signalements

```text
Applique le bloc commun. Implémente la section 17.3. Ajoute listes et filtres,
erreurs de validation, dépublication, correction versionnée, régénération
d'image, signalements et blocage d'ingrédients. Toute action sensible doit être
auditée et réversible lorsque possible. Revalide une recette corrigée avant
publication. Ajoute tests d'autorisation et d'intégrité.
```

## P50 — Administration IA et référentiel

```text
Applique le bloc commun. Implémente les sections 17.4 et 17.5. Affiche volume,
erreurs, latence, coût, quotas, modèles, prompts et tâches. Permets les bascules
contrôlées, retries et gestion du référentiel alimentaire. Ne révèle jamais les
clés ou prompts contenant des données. Ajoute confirmation, audit, permissions
et tests pour chaque mutation.
```

## P51 — E-mails et notifications web

```text
Applique le bloc commun. Implémente les sections 18.1 et 18.2. Personnalise les
e-mails transactionnels, documente domaine, SPF, DKIM et DMARC, puis ajoute les
notifications produit validées avec préférences, fuseau, fréquence et
désinscription. N'envoie aucune allergie ou donnée alimentaire sensible par
e-mail ou push. Utilise un adaptateur simulable et ajoute des tests.
```

## P52 — Couverture de tests unitaires

```text
Applique le bloc commun. Complète la section 19.1. Audite le domaine puis ajoute
des tests ciblés sur schémas, âge, unités, nutrition, allergènes, scoring,
quotas, déduplication et courses. Privilégie cas limites et propriétés
invariantes aux snapshots volumineux. Mesure la couverture sans viser un
pourcentage artificiel. Documente les risques encore non couverts.
```

## P53 — Tests d'intégration et RLS

```text
Applique le bloc commun. Implémente la section 19.2 sur une base éphémère
reproductible. Couvre migrations, RLS, profil, onboarding, fournisseur factice,
sortie invalide, allergène, alcool, swap, courses et suppression. Les tests
doivent échouer si une politique manque et ne doivent utiliser aucune clé de
production.
```

## P54 — Playwright et plan de tests manuels

```text
Applique le bloc commun. Implémente les sections 19.3 et 19.4. Configure
Playwright, utilisateurs de test et parcours critiques sur plusieurs tailles
d'écran. Ajoute contrôles d'accessibilité raisonnables. Crée
docs/RECETTE_TESTS_MANUELS.md pour navigateurs, appareils, clavier, lecteurs
d'écran, réseau lent, pannes, quotas et caractères spéciaux. Ne coche les tests
manuels qu'après exécution réelle documentée.
```

## P55 — Revue de sécurité applicative

```text
Applique le bloc commun. Traite toute la section 20.1 avec une revue basée sur
OWASP : validation, SQL, XSS, actions sensibles, CSP, headers, tailles, rate
limits, prompt injection, secrets, dépendances et Supabase. Corrige les failles
confirmées, ajoute tests de régression et docs/MODELE_MENACES.md. N'effectue
aucun test intrusif sur une production sans autorisation explicite.
```

## P56 — Résilience et performance

```text
Applique le bloc commun. Implémente les sections 20.2 et 20.3. Définis timeouts,
retries, coupe-circuits, idempotence, tâches bloquées, sauvegarde/restauration,
budgets web, images, pagination, index et cache sûr. Mesure avant d'optimiser.
Ajoute tests de charge raisonnables et rapport de résultats. Ne coche
restauration ou charge qu'après essai réel.
```

---

# PARTIE H — BÊTA ET LANCEMENT WEB

## P57 — Contenu initial et staging

```text
Applique le bloc commun. Implémente les sections 21.1 et 21.2. Prépare
catégories, ingrédients, import Ciqual, catalogue validé, cartes, placeholders,
aide et FAQ. Déploie staging uniquement si les accès sont autorisés, applique
migrations, quotas de test, observabilité et tests de fumée. Documente
exactement ce qui reste à configurer manuellement.
```

## P58 — Bêta privée et critères de sortie

```text
Applique le bloc commun. Prépare les sections 21.3 et 21.4 : plan de recrutement,
consentement, feedback, tableaux de bord, triage prioritaire et checklist de
sortie. Pendant la bêta, analyse incidents et métriques sans élargir le
périmètre. Corrige les blocages, rejoue les tests et produis
docs/RAPPORT_BETA.md. Les critères nécessitant des utilisateurs réels restent
non cochés avant mesure.
```

## P59 — Déploiement production et lancement

```text
Applique le bloc commun. Exécute les sections 22.1 et 22.2 seulement avec
autorisation explicite de mise en production. Vérifie projet Supabase séparé,
domaine, HTTPS, secrets, quotas, sauvegardes, alertes, migrations, smoke tests,
e-mails, analytics et pages légales. Prépare rollback, ouverture progressive et
surveillance. Arrête le lancement si un critère P0 ou sécurité reste ouvert.
```

## P60 — Stabilisation web et gel de l'API mobile

```text
Applique le bloc commun. Traite la section 22.3 après lancement. Analyse erreurs,
latence, coûts, abandons et qualité des recommandations. Corrige, optimise,
ajuste prompts et quotas avec benchmarks de non-régression. Finalise les P1
retenues. Versionne et documente les contrats API nécessaires à Expo, puis
produis un bilan autorisant ou refusant le démarrage mobile.
```

---

# PARTIE I — APPLICATIONS MOBILES

## P61 — Cadrage mobile et scaffold Expo

```text
Applique le bloc commun. Traite les sections 23.1 et 23.2. Décide versions OS,
appareils, différences, navigation, hors-ligne, push et deep links. Vérifie les
règles actuelles des stores. Crée apps/mobile avec Expo Router dans le monorepo,
branche domain, API client, tokens, Supabase React Native, stockage sécurisé,
CI et profils EAS. Ne publie ni ne crée de compte payant sans autorisation.
```

## P62 — Authentification et écrans mobiles

```text
Applique le bloc commun. Implémente les sections 23.3 et 23.4 avec des écrans
React Native natifs, pas une WebView. Porte authentification, liens, session,
onboarding, accueil, planning, recette, interactions, courses, favoris,
historique, profil, export et suppression. Réutilise domaine et API, pas les
composants DOM. Ajoute états, accessibilité et tests à chaque écran.
```

## P63 — Fonctions natives et mode hors ligne

```text
Applique le bloc commun. Implémente la section 23.5. Ajoute push, partage, deep
links, écran actif, haptique et cache local. Définis précisément ce qui est
lisible ou modifiable hors ligne. Utilise une file de mutations idempotentes,
résolution de conflits et indicateur de synchronisation. Ne mets jamais de
secret ou donnée sensible dans une notification.
```

## P64 — Qualité mobile et publication stores

```text
Applique le bloc commun. Traite les sections 23.6 et 23.7. Ajoute tests,
accessibilité, réseau, mémoire, démarrage et appareils physiques. Prépare IDs,
icônes, captures, fiches, confidentialité, signatures et builds EAS. Les étapes
Apple Developer, Google Play, TestFlight, soumission et publication exigent
autorisation et comptes du propriétaire. Documente chaque rejet et correction.
```

---

# PARTIE J — ÉVOLUTIONS POST-MVP

## P65 — Foyers et profils multiples

```text
Applique le bloc commun. Implémente la section 24 seulement après validation du
périmètre P2. Modélise foyer, invitations, membres, contraintes, préférences
contradictoires, repas communs ou variantes et portions. Les exclusions strictes
de tous les membres sont prioritaires. Ajoute RLS multi-tenant, audit,
révocation d'invitation et tests avec plusieurs foyers.
```

## P66 — Garde-manger, code-barres et réfrigérateur

```text
Applique le bloc commun. Implémente la section 25 par incréments : garde-manger
manuel, quantités et dates, consommation, priorisation, puis code-barres Open
Food Facts et enfin photo. Toute détection visuelle doit être confirmée. Respecte
licences, quotas, vie privée et droit à l'image. Ajoute synchronisation,
anti-gaspillage et tests d'inventaire.
```

## P67 — Import et recettes personnelles

```text
Applique le bloc commun. Implémente la section 26. Ajoute import URL respectueux
des droits d'auteur, extraction structurée, complément IA minimal,
normalisation, sécurité et nutrition. Ajoute création et modification de
recettes privées, versionnement et partage seulement si validé. Ne republie
jamais automatiquement un texte ou une image protégés.
```

## P68 — Suivi nutritionnel et intégrations santé

```text
Applique le bloc commun. Avant la section 27, réalise une analyse juridique,
produit et sécurité avec professionnels compétents. Puis seulement, ajoute
journal facultatif, tendances non médicales et intégrations Apple
Health/Health Connect avec consentements granulaires. Minimise, chiffre et
isole les données. N'établis aucun diagnostic et ne coche aucune validation
professionnelle sans preuve.
```

## P69 — Prix, promotions et paniers partenaires

```text
Applique le bloc commun. Traite la section 28. Étudie les API et conditions
actuelles par zone, puis implémente prix datés, estimation, alternatives,
promotions et export panier. Distingue estimation et prix garanti. Affiche
affiliation et liens commerciaux, gère consentement et indisponibilité. Ajoute
cache, expiration et tests de calcul.
```

## P70 — Assistant vocal de cuisine

```text
Applique le bloc commun. Implémente la section 29 après validation P2. Limite
l'assistant à la recette active, substitutions sûres et techniques. Ajoute
lecture, commandes et minuteurs avec confirmation des actions ambiguës. Passe
toute substitution par le moteur allergène. Gère bruit, erreurs, quotas et
confidentialité audio. Interdis les conseils médicaux.
```

## P71 — Internationalisation

```text
Applique le bloc commun. Implémente la section 30. Choisis une solution i18n
compatible web/mobile, extrais les textes, gère nombres, dates et unités, puis
traduis taxonomie et contenus. Chaque pays doit avoir règles d'âge, droit,
nutrition et disponibilité alimentaire explicites. Ne considère pas une
traduction automatique comme validée sans relecture.
```

## P72 — Embeddings et recommandation sémantique

```text
Applique le bloc commun. Traite la section 11.3 uniquement si les métriques
montrent une limite du scoring déterministe. Établis une baseline, choisis un
embedding multilingue, active pgvector, crée migrations et index HNSW, puis
combine proximité et règles. Mesure pertinence, coût et latence par A/B test.
Supprime l'évolution si elle n'apporte pas de gain significatif.
```

## P73 — Maintenance et exploitation continue

```text
Applique le bloc commun. Mets en place les sections 31.1 et 31.2 : calendrier
de mises à jour, sécurité, dépréciations IA, benchmarks, Ciqual, taxonomie,
sauvegardes, restauration, feedback, qualité, rétention et coûts. Automatise les
contrôles sûrs, mais garde une validation humaine pour migrations majeures,
modèles et règles alimentaires. Crée runbooks, responsables et fréquence.
```

---

# PARTIE K — AUDITS DE FIN DE JALON

## P74 — Audit de fin de MVP

```text
Applique le bloc commun. Effectue un audit en lecture seule de toutes les tâches
P0 des sections 3 à 21. Pour chaque case cochée, trouve une preuve dans le code,
les tests, la configuration ou un rapport d'exécution. Signale les cases
cochées à tort, dépendances manquantes, risques de sécurité, données sensibles,
écarts d'accessibilité et absence de tests. Produis docs/AUDIT_MVP.md avec une
décision GO/NO-GO. Ne corrige rien dans ce prompt.
```

## P75 — Audit avant lancement production

```text
Applique le bloc commun. Effectue l'audit final des sections 20 à 22 :
sécurité, RLS, sauvegarde/restauration, performance, RGPD, benchmark IA, coûts,
alertes, e-mails, domaines, migrations et rollback. Vérifie les preuves
d'exécution sur staging. Produis une checklist signable et une décision
GO/NO-GO. Toute absence de preuve sur allergies, alcool, RLS ou suppression des
données impose NO-GO.
```

## P76 — Audit avant démarrage mobile

```text
Applique le bloc commun. Vérifie que la section 22.3 est réellement terminée,
que l'API v1 est documentée, stable, testée et indépendante du rendu Next.js.
Contrôle auth par bearer/cookies selon client, erreurs, pagination, idempotence,
versionnement et limites. Produis docs/AUDIT_PRE_MOBILE.md avec écarts et
décision GO/NO-GO. Ne crée pas encore l'application Expo.
```

## P77 — Audit final de couverture de la roadmap

```text
Applique le bloc commun. Lorsque toutes les phases demandées sont annoncées
terminées, audite l'intégralité de ROADMAP_PROJET.md. Vérifie chaque case cochée
par une preuve et classe chaque case ouverte : volontairement reportée,
bloquée, obsolète ou oubliée. Contrôle également documentation, architecture,
coûts, conformité, web, mobile et exploitation. Produis
docs/AUDIT_FINAL_PROJET.md et ne déclare le projet terminé que si aucun élément
requis pour le périmètre convenu ne manque.
```

---

## 3. Matrice de couverture de la roadmap

| Section de `ROADMAP_PROJET.md`    | Prompts principaux     |
| --------------------------------- | ---------------------- |
| 1. Convention                     | Bloc commun            |
| 2. Définition de terminé          | Bloc commun, P74 à P77 |
| 3. Cadrage produit                | P01 à P03              |
| 4. Fondations techniques          | P04 à P08              |
| 5. UX et design system            | P09 à P11              |
| 6. Modèle de données              | P12 à P17              |
| 7. Authentification et conformité | P18 à P20              |
| 8. Onboarding                     | P21 à P23              |
| 9. Référentiel et nutrition       | P24 à P27              |
| 10. Pipeline IA                   | P28 à P35              |
| 11. Recommandation                | P36, P37 et P72        |
| 12. Accueil et planning           | P38 à P40              |
| 13. Fiche recette                 | P41 et P42             |
| 14. Like, dislike et remplacement | P43 et P44             |
| 15. Liste de courses              | P45 et P46             |
| 16. Favoris, historique et profil | P47                    |
| 17. Administration                | P48 à P50              |
| 18. Notifications                 | P51                    |
| 19. Tests                         | P52 à P54              |
| 20. Sécurité et performance       | P55 et P56             |
| 21. Bêta privée                   | P57 et P58             |
| 22. Lancement web                 | P59 et P60             |
| 23. Applications mobiles          | P61 à P64              |
| 24. Foyers                        | P65                    |
| 25. Garde-manger                  | P66                    |
| 26. Import de recettes            | P67                    |
| 27. Santé                         | P68                    |
| 28. Prix et promotions            | P69                    |
| 29. Assistant de cuisine          | P70                    |
| 30. Internationalisation          | P71                    |
| 31. Exploitation continue         | P73                    |
| 32. Chemin critique               | Ordre P00 à P77        |
| 33. Prochain lot                  | P00 puis P01 à P08     |

---

## 4. Prompts utilitaires

### U01 — Reprendre le projet après une interruption

```text
Applique le bloc commun. Reconstitue l'état du lot en cours depuis Git,
ROADMAP_PROJET.md, les tests et les documents. Identifie la dernière preuve de
travail terminée, les changements non validés et les blocages. Propose un plan
court pour reprendre sans refaire les tâches déjà achevées. Continue le lot
uniquement après avoir confirmé que les changements présents sont cohérents.
```

### U02 — Diagnostiquer un échec sans corriger

```text
Applique le bloc commun en lecture seule. Reproduis le problème, collecte les
preuves minimales, localise la cause racine et distingue cause, symptômes et
facteurs aggravants. Évalue l'impact sur données, sécurité et utilisateurs.
Présente les options de correction avec risques, mais ne modifie aucun fichier
et n'exécute aucune action destructive.
```

### U03 — Corriger un bug confirmé

```text
Applique le bloc commun. À partir du diagnostic fourni, écris d'abord un test
qui reproduit le bug, implémente la correction la plus étroite possible, puis
vérifie l'absence de régression. Ne refactore pas les zones sans rapport. Mets à
jour la roadmap uniquement si le bug correspondait à une tâche ouverte.
```

### U04 — Mettre à jour une dépendance majeure

```text
Applique le bloc commun. Consulte la documentation officielle, les notes de
version et guides de migration de la dépendance ciblée. Inventorie les usages,
crée un plan de migration, mets à jour par étapes et exécute tous les contrôles.
Analyse les changements de sécurité, runtime, types et build. Documente les
ruptures et n'utilise pas de correction forcée qui masque des incompatibilités.
```

### U05 — Revue de pull request

```text
Applique le bloc commun en lecture seule. Compare le diff au prompt et aux cases
de roadmap visées. Cherche d'abord bugs, failles, pertes de données, contournement
RLS/allergies, régressions, erreurs de concurrence et tests manquants. Classe
les constats par sévérité avec fichier et ligne. Termine par les questions et
risques résiduels, sans modifier le code.
```

### U06 — Préparer un commit

```text
Applique le bloc commun. Inspecte le diff, sépare les changements sans rapport,
vérifie qu'aucun secret ou artefact ne sera commité, puis exécute les contrôles
pertinents. Propose un message de commit clair et un résumé. Ne crée le commit
que si l'utilisateur le demande explicitement et ne pousse jamais sans
autorisation.
```

---

## 5. Règles de maintenance de cette bibliothèque

- Mettre à jour un prompt lorsque la roadmap ou l'architecture change.
- Ajouter un nouveau prompt seulement si aucun lot existant ne couvre le besoin.
- Garder les prompts centrés sur un livrable vérifiable.
- Ne jamais intégrer une vraie clé, un identifiant utilisateur ou une donnée de
  production dans un exemple.
- Versionner les changements importants de prompts IA applicatifs séparément de
  cette bibliothèque de prompts de développement.
- Réviser les prompts P28 à P35 à chaque changement de fournisseur ou modèle.
- Réviser P61 à P64 à chaque version majeure d'Expo ou changement des stores.
- Réviser P20 et P68 avec les professionnels compétents avant lancement.
