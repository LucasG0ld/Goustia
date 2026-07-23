import type { Metadata } from "next";

import { PlanningBoard } from "@/features/planning/planning-board";
import { requireVerifiedUser } from "@/lib/auth/current-user";
import {
  getActiveMealPlanView,
  getAvailableRecipeOptions,
} from "@/lib/planning/meal-plan-view";

export const metadata: Metadata = {
  title: "Planning | Goustia",
  description: "Organise les déjeuners et dîners de ta semaine.",
};

export default async function PlanningPage() {
  const user = await requireVerifiedUser();
  const [plan, recipes] = await Promise.all([
    getActiveMealPlanView(user.id),
    getAvailableRecipeOptions(),
  ]);
  return (
    <main
      className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6"
      id="contenu-principal"
    >
      <header>
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">
          Organisation
        </p>
        <h1 className="mt-1 text-3xl font-semibold">Planning hebdomadaire</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Déplace, ajuste ou verrouille chaque déjeuner et dîner sans
          glisser-déposer.
        </p>
      </header>
      <div className="mt-8">
        <PlanningBoard initialPlan={plan} recipes={recipes} />
      </div>
    </main>
  );
}
