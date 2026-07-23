import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/ui";

export const metadata: Metadata = {
  title: "Courses | Goustia",
  description: "La liste de courses liée à ton planning.",
};

export default function ShoppingListPage() {
  return (
    <main
      className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6"
      id="contenu-principal"
    >
      <h1 className="text-3xl font-semibold">Liste de courses</h1>
      <div className="mt-8">
        <EmptyState
          action={
            <Link className="font-semibold underline" href="/planning">
              Voir mon planning
            </Link>
          }
          description="Elle sera calculée à partir des recettes de ton planning dans le prochain lot dédié."
          title="Aucune liste générée"
        />
      </div>
    </main>
  );
}
