import type { Metadata } from "next";

import { ShoppingListBoard } from "@/features/shopping/shopping-list-board";
import { requireVerifiedUser } from "@/lib/auth/current-user";
import { getCurrentShoppingList } from "@/lib/shopping/shopping-list";

export const metadata: Metadata = {
  title: "Courses | Goustia",
  description: "La liste de courses liée à ton planning.",
};

export default async function ShoppingListPage() {
  const user = await requireVerifiedUser();
  const { plan, list } = await getCurrentShoppingList(user.id);
  return (
    <main
      className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6"
      id="contenu-principal"
    >
      <h1 className="text-3xl font-semibold">Liste de courses</h1>
      <p className="mt-2 text-muted">
        Organisée par rayon et adaptée aux portions de ton planning.
      </p>
      <div className="mt-8">
        <ShoppingListBoard
          initialList={list}
          mealPlanId={plan?.id ?? null}
          planChanged={Boolean(
            list && plan && list.planRevision !== plan.revision,
          )}
        />
      </div>
    </main>
  );
}
