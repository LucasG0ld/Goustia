# Étude des solutions IA freemium

Date de l'étude : 23 juillet 2026

## 1. Résumé de la décision

La combinaison retenue pour le MVP est :

| Fonction                | Solution principale   | Modèle initial                          |
| ----------------------- | --------------------- | --------------------------------------- |
| Génération de recettes  | GroqCloud             | `openai/gpt-oss-120b`                   |
| Génération d'images     | Cloudflare Workers AI | `@cf/black-forest-labs/flux-2-klein-4b` |
| Secours pour le texte   | Cloudflare Workers AI | Qwen 3 30B ou Llama 3.3 70B             |
| Intégration TypeScript  | Vercel AI SDK         | `ai` et `@ai-sdk/groq`                  |
| Validation              | Zod                   | Schémas du paquet `@recettes/domain`    |
| Données nutritionnelles | ANSES Ciqual 2025     | Import local des données ouvertes       |

Cette combinaison est la plus attrayante pour le MVP, car elle offre :

- des quotas gratuits réellement exploitables ;
- des sorties JSON strictes pour les recettes ;
- une bonne vitesse de génération ;
- une génération d'images très peu coûteuse ;
- des conditions de confidentialité plus adaptées que le niveau gratuit de
  Gemini ;
- un modèle d'image exploitable commercialement sous licence Apache 2.0 ;
- une évolution payante progressive sans changement complet d'architecture.

## 2. Critères de comparaison

Les fournisseurs ont été comparés selon :

1. La qualité du français et le suivi d'instructions.
2. La capacité à retourner une recette conforme à un schéma JSON.
3. Le volume gratuit réellement utilisable.
4. La qualité et le prix des images culinaires.
5. L'utilisation éventuelle des données pour l'entraînement.
6. Les droits d'utilisation commerciale.
7. La facilité d'intégration dans Next.js et TypeScript.
8. La possibilité de remplacer le fournisseur.
9. La prévisibilité des coûts après le quota gratuit.

## 3. Comparatif pour la génération de recettes

### 3.1. GroqCloud — choix principal

Modèle recommandé : `openai/gpt-oss-120b`.

Points forts :

- 1 000 requêtes par jour sur le plan gratuit ;
- 200 000 jetons par jour pour GPT-OSS 120B ;
- sorties structurées strictes conformes à un schéma JSON ;
- API compatible avec le format OpenAI ;
- très faible latence ;
- les entrées et sorties ne sont pas utilisées pour entraîner les modèles ;
- absence de conservation par défaut pour les requêtes d'inférence ;
- option Zero Data Retention disponible.

Points de vigilance :

- les quotas gratuits ne constituent pas une garantie de service ;
- les données éventuellement conservées sont localisées aux États-Unis ;
- les modèles disponibles et leurs identifiants peuvent évoluer ;
- aucune donnée personnelle directe ne doit être envoyée dans les prompts.

Utilisation retenue :

- génération structurée d'une ou plusieurs recettes ;
- génération des variantes ;
- rédaction des étapes ;
- production du prompt destiné au générateur d'image.

Les prompts ne contiendront jamais le nom, l'adresse e-mail ou la date de
naissance. Le serveur transmettra uniquement un profil alimentaire pseudonymisé,
par exemple :

```json
{
  "alcoholAllowed": false,
  "strictlyExcludedIngredientIds": ["peanut", "shrimp"],
  "dislikedIngredientIds": ["celery"],
  "goal": "balanced",
  "servings": 2
}
```

### 3.2. Cloudflare Workers AI — meilleur secours et option tout-en-un

Modèles intéressants :

- Qwen 3 30B pour son multilinguisme et son faible coût ;
- Llama 3.3 70B pour son mode JSON ;
- GPT-OSS pour conserver une famille de modèles similaire à Groq.

Points forts :

- 10 000 neurons gratuits par jour ;
- inférence texte et image chez le même fournisseur ;
- API REST et endpoints compatibles OpenAI pour le texte ;
- Cloudflare n'utilise pas le contenu client pour entraîner ou améliorer ses
  services ;
- tarification à l'usage très faible après le quota gratuit ;
- bonne solution de continuité si Groq est indisponible.

Points de vigilance :

- le mode JSON de certains modèles n'offre pas toujours une garantie stricte ;
- le budget gratuit est partagé entre le texte et les images ;
- les licences doivent être vérifiées modèle par modèle.

Cloudflare n'est pas retenu comme premier générateur de recettes, car Groq offre
actuellement une meilleure garantie de conformité au schéma avec GPT-OSS.

### 3.3. Google Gemini — excellent pour comparer, moins adapté au gratuit réel

Modèles intéressants :

- Gemini 3.5 Flash ;
- Gemini 2.5 Flash ;
- Gemini 2.5 Flash-Lite.

Points forts :

- jetons d'entrée et de sortie gratuits sur plusieurs modèles ;
- très bonne compréhension des instructions ;
- sorties structurées compatibles avec JSON Schema et Zod ;
- bon niveau en français ;
- passage au payant simple.

Points de vigilance :

- Google indique que le contenu envoyé au niveau gratuit peut être utilisé pour
  améliorer ses produits ;
- la génération d'images Gemini n'est pas disponible gratuitement via l'API ;
- les limites réelles varient selon le projet et sont consultables dans AI
  Studio.

Décision :

- utilisable pour des benchmarks avec des profils entièrement fictifs ;
- à ne pas utiliser avec les préférences réelles des utilisateurs sur le niveau
  gratuit ;
- peut redevenir candidat en offre payante, où Google indique que les contenus
  ne servent pas à améliorer ses produits.

### 3.4. OpenRouter — utile en laboratoire

Points forts :

- accès unifié à de nombreux modèles ;
- plus de 25 modèles gratuits ;
- format d'API compatible OpenAI ;
- pratique pour comparer rapidement plusieurs modèles.

Limites :

- seulement 50 requêtes gratuites par jour sans achat préalable de crédits ;
- disponibilité variable des modèles gratuits ;
- le routeur gratuit peut changer de modèle ;
- le service indique lui-même que l'offre gratuite n'est généralement pas
  adaptée à la production.

Décision :

- outil de benchmark ou de dépannage manuel ;
- pas de dépendance de production pour le MVP.

### 3.5. Hugging Face Inference Providers

Points forts :

- vaste catalogue de modèles ;
- changement de fournisseur simplifié ;
- bon outil d'expérimentation.

Limites :

- seulement 0,10 USD de crédit mensuel pour un compte gratuit ;
- insuffisant pour l'usage régulier de l'application.

Décision :

- utile pour tester un modèle précis ;
- non retenu comme offre freemium principale.

### 3.6. Replicate

Points forts :

- très vaste choix de modèles d'image ;
- tarification transparente à l'exécution ;
- ajout rapide de nouveaux modèles.

Limites :

- achat de crédit prépayé nécessaire ;
- pas de quota gratuit durable.

Décision :

- bonne solution payante de secours ;
- ne correspond pas à l'objectif freemium initial.

## 4. Comparatif pour la génération d'images

### 4.1. FLUX.2 Klein 4B sur Cloudflare — choix principal

Identifiant :

```text
@cf/black-forest-labs/flux-2-klein-4b
```

Pourquoi ce modèle :

- génération et modification d'images ;
- très faible latence ;
- coût de 0,000287 USD par tuile de sortie 512 × 512 annoncé par Cloudflare ;
- quota Cloudflare de 10 000 neurons gratuits par jour ;
- licence Apache 2.0 pour les poids du modèle 4B ;
- utilisation commerciale autorisée ;
- possibilité future d'auto-héberger le modèle.

Pour le MVP, une image sera générée une seule fois par recette canonique puis
stockée dans Supabase Storage. Elle ne sera pas régénérée à chaque affichage ou
pour chaque utilisateur.

### 4.2. FLUX.1 Schnell

Alternative très économique et éprouvée :

- licence Apache 2.0 ;
- génération rapide ;
- coût Cloudflare extrêmement faible.

Il pourra servir de repli si FLUX.2 Klein est indisponible ou si un benchmark
montre une meilleure qualité sur les plats.

### 4.3. Leonardo Lucid Origin sur Cloudflare

Alternative de qualité supérieure à évaluer pour certaines recettes :

- bonne adhérence aux prompts ;
- résolutions élevées ;
- coût plus important, mais toujours accessible.

Ce modèle pourra être réservé :

- aux recettes mises en avant ;
- à une régénération demandée par un administrateur ;
- aux cas où FLUX produit une image peu réaliste.

### 4.4. Images Gemini

Gemini 2.5 Flash Image et Gemini 3.1 Flash Image offrent une bonne qualité, mais
ne disposent pas de niveau gratuit via l'API. Leur prix reste raisonnable, mais
Cloudflare est plus intéressant pour le MVP freemium.

## 5. Personnalisation et embeddings

Le MVP n'a pas besoin d'un modèle IA supplémentaire pour chaque like ou dislike.

La personnalisation commence par un score déterministe dans PostgreSQL :

- poids positif pour les ingrédients et cuisines aimés ;
- exclusion absolue des allergies et interdictions ;
- poids négatif pour les dislikes ;
- pénalité pour les répétitions ;
- bonus pour la durée, le budget et l'objectif recherchés.

Si une recherche sémantique devient utile, Supabase prend déjà en charge
`pgvector`. Cette évolution ne nécessitera donc pas l'ajout immédiat d'une base
vectorielle externe.

## 6. Nutrition et allergies : ne pas déléguer la sécurité à l'IA

### Nutrition

Les calories et macronutriments ne seront pas acceptés aveuglément depuis le
modèle génératif.

La source recommandée pour la France est la table ANSES Ciqual 2025 :

- données publiques et gratuites ;
- 3 484 aliments ;
- 74 constituants ;
- source française de référence.

L'application fera correspondre les ingrédients aux aliments Ciqual, puis
calculera les valeurs selon les quantités.

### Allergies et interdictions

Le contrôle est déterministe :

1. normalisation de chaque ingrédient ;
2. association à une taxonomie interne ;
3. détection des parents et dérivés allergènes ;
4. rejet de la recette avant enregistrement si une exclusion est rencontrée ;
5. contrôle une seconde fois avant affichage.

Open Food Facts pourra compléter les informations pour les produits emballés,
mais ne remplacera pas la taxonomie interne.

## 7. Architecture d'intégration

```text
Profil alimentaire pseudonymisé
            ↓
API Next.js côté serveur
            ↓
AI SDK + adaptateur RecipeGenerator
       ↙                    ↘
Groq GPT-OSS          Cloudflare secours
       ↓
JSON conforme au schéma Zod
       ↓
Contrôles allergies, âge et cohérence
       ↓
Calcul nutritionnel avec Ciqual
       ↓
Prompt visuel sans donnée utilisateur
       ↓
Cloudflare FLUX.2 Klein 4B
       ↓
Supabase Storage + recette en base
```

## 8. Règles de maîtrise des coûts

- Générer des recettes par lot plutôt qu'une requête par plat.
- Mettre en cache les recettes validées.
- Réutiliser une recette compatible entre plusieurs utilisateurs.
- Générer une image par recette canonique.
- Ne pas générer d'image pour une recette rejetée par les contrôles.
- Plafonner les générations par utilisateur et par jour.
- Conserver les recettes appréciées lors d'une régénération.
- Enregistrer le fournisseur, le modèle, la latence et la consommation.
- Prévoir un coupe-circuit lorsque le quota gratuit est proche de la limite.
- Désactiver automatiquement un fournisseur qui renvoie trop d'erreurs.

## 9. Benchmark obligatoire avant ouverture au public

Un corpus d'au moins 50 profils alimentaires fictifs sera utilisé pour comparer
:

- respect des allergies ;
- respect de l'absence d'alcool ;
- qualité du français ;
- cohérence ingrédients/étapes ;
- diversité des repas ;
- exactitude du format JSON ;
- réalisme des quantités ;
- temps de réponse ;
- coût moyen par semaine générée ;
- qualité visuelle des plats.

Le choix des modèles restera configurable par variables d'environnement afin de
pouvoir changer de modèle sans redéployer toute la logique métier.

## 10. Conclusion

Pour démarrer :

1. **Groq GPT-OSS 120B** génère les recettes au format strict.
2. **Zod et les règles métier** valident puis filtrent le résultat.
3. **Ciqual** sert aux calculs nutritionnels.
4. **Cloudflare FLUX.2 Klein 4B** génère les illustrations.
5. **Supabase Storage** conserve les images générées.
6. **Cloudflare Text** sert de secours à Groq.

Cette combinaison minimise les coûts du MVP sans compromettre la possibilité de
passer à une offre payante ou à un hébergement autonome.
