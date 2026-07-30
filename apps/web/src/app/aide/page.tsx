import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Aide et FAQ | Goustia",
  description:
    "Réponses sur les recettes, le profil alimentaire et les données.",
};

const questions = [
  {
    question: "Comment Goustia choisit-il mes recettes ?",
    answer:
      "L’application combine tes contraintes strictes, tes préférences modifiables, ton objectif et tes réactions précédentes. Une suggestion n’est jamais un avis médical.",
  },
  {
    question: "Une allergie est-elle traitée comme un simple goût ?",
    answer:
      "Non. Les allergies et exclusions strictes bloquent une recette avant son affichage. Vérifie néanmoins toujours les étiquettes et les contaminations croisées.",
  },
  {
    question: "Pourquoi une recette a-t-elle disparu ?",
    answer:
      "Elle peut être devenue incompatible avec ton profil, avoir été retirée après contrôle ou avoir été remplacée dans ton planning.",
  },
  {
    question: "Puis-je corriger ce que l’application a appris ?",
    answer:
      "Oui. Les préférences apprises sont visibles et réversibles depuis le profil. Les contraintes de sécurité sont gérées séparément.",
  },
  {
    question: "Comment récupérer ou supprimer mes données ?",
    answer:
      "Les actions d’export et de suppression se trouvent dans ton compte. La suppression nécessite une confirmation explicite.",
  },
  {
    question: "Les images représentent-elles exactement la recette ?",
    answer:
      "Les images peuvent être générées ou génériques et portent la mention « image illustrative ». La fiche écrite reste la référence.",
  },
] as const;

export default function HelpPage() {
  return (
    <main
      className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6"
      id="contenu-principal"
    >
      <h1 className="text-4xl font-semibold">Aide et questions fréquentes</h1>
      <p className="mt-4 text-muted">
        Les points essentiels pour utiliser Goustia en confiance.
      </p>
      <div className="mt-8 grid gap-4">
        {questions.map((item) => (
          <details
            className="rounded-xl border bg-surface p-5"
            key={item.question}
          >
            <summary className="cursor-pointer font-semibold">
              {item.question}
            </summary>
            <p className="mt-3 text-muted">{item.answer}</p>
          </details>
        ))}
      </div>
      <p className="mt-8">
        Un problème pendant la bêta ?{" "}
        <Link
          className="font-semibold text-brand underline"
          href={"/feedback" as Route}
        >
          Envoyer un retour
        </Link>
        .
      </p>
    </main>
  );
}
