import type { Metadata } from "next";

import { EmptyState } from "@/components/ui";

export const metadata: Metadata = {
  title: "Favoris | Goustia",
  description: "Tes recettes préférées.",
};

export default function FavoritesPage() {
  return (
    <main
      className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6"
      id="contenu-principal"
    >
      <h1 className="text-3xl font-semibold">Favoris</h1>
      <div className="mt-8">
        <EmptyState
          description="Les recettes ajoutées aux favoris apparaîtront ici."
          title="Aucun favori pour le moment"
        />
      </div>
    </main>
  );
}
