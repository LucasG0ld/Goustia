# Plan de bêta privée

Objectif : valider la sécurité alimentaire, les parcours et la pertinence sans
élargir le produit. Cohorte proposée : 10 à 20 adultes, puis mineurs uniquement
après validation des parcours alcool et consentement adapté.

Chaque participant reçoit l’objectif, la durée, les risques connus, les canaux
de support, la possibilité de se retirer et les règles de confidentialité. Le
consentement est recueilli avant création du compte et conservé avec sa version.

Le formulaire `/feedback` enregistre uniquement le type, le texte, le chemin et
l’utilisateur. Aucun fingerprint n’est collecté. Triage :

1. sécurité alimentaire ou fuite de données : P0, arrêt du parcours concerné ;
2. inscription, connexion, génération ou suppression bloquée : P0/P1 ;
3. qualité récurrente des recettes : P1 ;
4. amélioration ergonomique isolée : P2.

Tableau de bord hebdomadaire : abandon par étape d’onboarding, likes/dislikes/
swaps, erreurs IA, coût par utilisateur, latence p95, signalements ouverts et
délai de résolution. Les seuils de sortie doivent être fixés avant invitation :
0 violation allergène/alcool connue, 100 % des parcours critiques verts, erreur
IA sous 5 %, coût moyen sous le budget approuvé et budgets web respectés.
