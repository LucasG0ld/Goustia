// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MealPlanView } from "@/lib/planning/meal-plan-view";

import { PlanningBoard } from "./planning-board";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

const plan: MealPlanView = {
  id: "10000000-0000-4000-8000-000000000001",
  weekStart: "2026-07-20",
  status: "ready",
  revision: 3,
  meals: [
    {
      id: "10000000-0000-4000-8000-000000000002",
      mealDate: "2026-07-20",
      mealType: "lunch",
      servings: 2,
      isLocked: false,
      revision: 1,
      recipe: {
        recipeId: "10000000-0000-4000-8000-000000000003",
        recipeVersionId: "10000000-0000-4000-8000-000000000004",
        title: "Bowl de lentilles",
        description: "Un repas fictif pour le test.",
        durationMinutes: 25,
        difficulty: "easy",
        servings: 2,
        caloriesKcal: 420,
        proteinG: 22,
        carbohydratesG: 45,
        fatG: 12,
        tags: ["Rapide"],
        imageUrl: null,
        imageAlt: null,
        recommendationExplanation: "Prête en 25 min.",
      },
    },
  ],
};

describe("planning board", () => {
  beforeEach(() => {
    refresh.mockReset();
  });

  it("renders a useful empty state", () => {
    render(<PlanningBoard initialPlan={null} recipes={[]} />);
    expect(screen.getByText("Aucun planning actif")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Créer ma semaine" }),
    ).toBeTruthy();
  });

  it("offers keyboard-accessible alternatives to drag and drop", () => {
    render(<PlanningBoard initialPlan={plan} recipes={[]} />);
    expect(screen.getByRole("tablist")).toBeTruthy();
    expect(screen.getByLabelText("Jour")).toBeTruthy();
    expect(screen.getByLabelText("Repas")).toBeTruthy();
    expect(screen.getByLabelText("Portions")).toBeTruthy();
    expect(
      screen.getByLabelText("Conserver lors d’une régénération"),
    ).toBeTruthy();
  });

  it("has no detectable structural accessibility violation", async () => {
    const { container } = render(
      <main>
        <h1>Planning</h1>
        <PlanningBoard initialPlan={plan} recipes={[]} />
      </main>,
    );
    const result = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });
});
