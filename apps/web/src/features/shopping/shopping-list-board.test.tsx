// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ShoppingListView } from "@/lib/shopping/shopping-list";

import { ShoppingListBoard } from "./shopping-list-board";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const list: ShoppingListView = {
  id: "10000000-0000-4000-8000-000000000001",
  title: "Courses de la semaine",
  revision: 2,
  planRevision: 3,
  items: [
    {
      id: "10000000-0000-4000-8000-000000000002",
      label: "Tomates",
      quantity: 500,
      unit: "g",
      aisle: "Fruits et légumes",
      checked: false,
      available: false,
      manual: false,
      revision: 1,
      sources: [
        {
          recipeVersionId: "10000000-0000-4000-8000-000000000003",
          title: "Pâtes aux tomates",
        },
      ],
    },
  ],
};

describe("shopping list board", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ updated: true }),
      }),
    );
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
    });
  });

  it("exposes touch-friendly list actions and an inline editor", () => {
    const { container } = render(
      <ShoppingListBoard
        initialList={list}
        mealPlanId="10000000-0000-4000-8000-000000000004"
        planChanged={false}
      />,
    );
    expect(screen.getByText("Fruits et légumes")).toBeTruthy();
    expect(screen.getByLabelText("Déjà disponible")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Modifier" }));
    expect(screen.getByLabelText("Nouvelle quantité")).toBeTruthy();
    expect(
      container.querySelector(".sm\\:grid-cols-\\[1fr_8rem_8rem_auto\\]"),
    ).toBeTruthy();
  });

  it("keeps a local snapshot and signals degraded connectivity", async () => {
    render(
      <ShoppingListBoard
        initialList={list}
        mealPlanId="10000000-0000-4000-8000-000000000004"
        planChanged={false}
      />,
    );
    expect(localStorage.getItem(`goustia:shopping:${list.id}`)).toContain(
      "Tomates",
    );
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: false,
    });
    fireEvent(window, new Event("offline"));
    expect(
      await screen.findByText(/Hors ligne : ta liste reste consultable/),
    ).toBeTruthy();
  });

  it("has no detectable structural accessibility violation", async () => {
    const { container } = render(
      <main>
        <h1>Liste de courses</h1>
        <ShoppingListBoard
          initialList={list}
          mealPlanId="10000000-0000-4000-8000-000000000004"
          planChanged={false}
        />
      </main>,
    );
    const result = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });
});
