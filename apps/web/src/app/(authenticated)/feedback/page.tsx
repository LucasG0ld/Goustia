import type { Metadata } from "next";

import { FeedbackForm } from "@/features/feedback/feedback-form";

export const metadata: Metadata = {
  title: "Donner mon avis | Goustia",
};

export default function FeedbackPage() {
  return (
    <main
      className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6"
      id="contenu-principal"
    >
      <h1 className="text-3xl font-semibold">Donner mon avis</h1>
      <p className="mt-3 text-muted">
        Pendant la bêta, les signalements de sécurité alimentaire sont examinés
        en priorité. N’indique aucune donnée médicale inutile dans ton message.
      </p>
      <FeedbackForm />
    </main>
  );
}
