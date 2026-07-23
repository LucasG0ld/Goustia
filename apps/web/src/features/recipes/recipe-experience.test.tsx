// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RecipeDetail } from "../../lib/recipes/recipe-detail";

import { RecipeExperience } from "./recipe-experience";

const recipe: RecipeDetail = {
  recipeId: "10000000-0000-4000-8000-000000000001",
  versionId: "10000000-0000-4000-8000-000000000002",
  title: "Curry de lentilles",
  description: "Une recette complète pour les tests.",
  servings: 2,
  preparationMinutes: 10,
  cookingMinutes: 20,
  restingMinutes: 0,
  difficulty: "easy",
  costLevel: "low",
  estimatedCostEur: 6,
  imageUrl: null,
  imageAlt: null,
  tips: [],
  variants: [],
  storageInstructions: null,
  reheatingInstructions: null,
  ingredients: [
    {
      id: "ingredient-1",
      ingredientId: "10000000-0000-4000-8000-000000000003",
      name: "Lentilles",
      quantity: 200,
      unit: "g",
      note: null,
      optional: false,
    },
  ],
  steps: [
    { position: 1, instruction: "Rincer les lentilles.", timerSeconds: null },
    { position: 2, instruction: "Laisser mijoter.", timerSeconds: 60 },
  ],
  nutrition: null,
  allergens: [],
  equipment: [],
  substitutions: [],
  interaction: { reaction: null, favorite: false },
};

describe("recipe experience", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true }),
      }),
    );
  });

  it("rescales portions and supports keyboard step completion", () => {
    render(<RecipeExperience plannedMealId={null} recipe={recipe} />);
    fireEvent.change(screen.getByLabelText(/Portions/), {
      target: { value: "4" },
    });
    expect(screen.getByText(/400/)).toBeTruthy();
    const step = screen.getByRole("checkbox", { name: /Rincer/ });
    step.focus();
    fireEvent.keyDown(step, { key: " " });
    fireEvent.click(step);
    expect((step as HTMLInputElement).checked).toBe(true);
  });

  it("restores an interrupted cooking session", async () => {
    localStorage.setItem(
      `goustia:cooking:${recipe.versionId}`,
      JSON.stringify({ checkedSteps: [1], servings: 3, timerEnd: null }),
    );
    render(<RecipeExperience plannedMealId={null} recipe={recipe} />);
    await waitFor(() => {
      expect(
        (screen.getByRole("checkbox", { name: /Rincer/ }) as HTMLInputElement)
          .checked,
      ).toBe(true);
      expect(
        (screen.getByLabelText(/Portions/) as HTMLSelectElement).value,
      ).toBe("3");
    });
  });

  it("prevents duplicate optimistic actions while a request is pending", async () => {
    let resolveRequest: ((value: { ok: boolean }) => void) | undefined;
    const fetchMock = vi.fn(
      () =>
        new Promise<{ ok: boolean }>((resolve) => {
          resolveRequest = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<RecipeExperience plannedMealId={null} recipe={recipe} />);
    const like = screen.getByRole("button", { name: "J’aime" });
    fireEvent.click(like);
    fireEvent.click(like);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolveRequest?.({ ok: true });
    await waitFor(() => expect(like.getAttribute("aria-pressed")).toBe("true"));
  });
});
