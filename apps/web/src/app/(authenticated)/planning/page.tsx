import type { Metadata } from "next";
import { currentIsoWeekStart, isoWeekStartSchema } from "@recettes/domain";

import { PlanningBoard } from "@/features/planning/planning-board";
import { requireVerifiedUser } from "@/lib/auth/current-user";
import {
  getMealPlanHistory,
  getMealPlanView,
  getAvailableRecipeOptions,
} from "@/lib/planning/meal-plan-view";

export const metadata: Metadata = {
  title: "Planning | Goustia",
  description: "Organise les déjeuners et dîners de ta semaine.",
};

export default async function PlanningPage({
  searchParams,
}: {
  searchParams: Promise<{ semaine?: string }>;
}) {
  const user = await requireVerifiedUser();
  const requestedWeek = (await searchParams).semaine;
  const weekStart =
    isoWeekStartSchema.safeParse(requestedWeek).data ??
    currentIsoWeekStart(new Date(), "Europe/Paris");
  const [plan, recipes, history] = await Promise.all([
    getMealPlanView(user.id, weekStart),
    getAvailableRecipeOptions(),
    getMealPlanHistory(user.id),
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
        <PlanningBoard
          history={history}
          initialPlan={plan}
          recipes={recipes}
          weekStart={weekStart}
        />
      </div>
    </main>
  );
}
