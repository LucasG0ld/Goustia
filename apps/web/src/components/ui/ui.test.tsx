// @vitest-environment jsdom

import axe from "axe-core";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./button";
import { Alert, EmptyState } from "./feedback";
import { Checkbox, SelectField, TextField } from "./form-controls";
import { OnboardingProgress } from "./onboarding-progress";
import { FoodBadge, RecipeCard } from "./recipe-card";

describe("web design system", () => {
  it("renders form labels and explicit error associations", () => {
    const { getByLabelText, getByRole } = render(
      <div>
        <TextField error="Le prénom est requis." label="Prénom" required />
        <SelectField label="Objectif">
          <option value="balanced">Équilibre</option>
        </SelectField>
        <Checkbox label="J’ai un four" />
      </div>,
    );

    expect(getByLabelText(/Prénom/).getAttribute("aria-invalid")).toBe("true");
    expect(getByRole("alert").textContent).toContain("Le prénom est requis.");
    expect(getByLabelText("Objectif")).toBeTruthy();
    expect(getByLabelText("J’ai un four")).toBeTruthy();
  });

  it("exposes progress without relying on color", () => {
    const { getByRole } = render(
      <OnboardingProgress
        currentStep={2}
        label="Profil essentiel"
        totalSteps={4}
      />,
    );

    const progress = getByRole("progressbar");
    expect(progress.getAttribute("aria-valuenow")).toBe("2");
    expect(progress.getAttribute("aria-label")).toBe(
      "Profil essentiel : étape 2 sur 4",
    );
  });

  it("has no detectable axe violation on representative primitives", async () => {
    const { container } = render(
      <main>
        <h1>Composants Goustia</h1>
        <Button>Continuer</Button>
        <Alert title="Information">Ta sélection a été enregistrée.</Alert>
        <section>
          <h2 className="sr-only">Recettes</h2>
          <RecipeCard
            badges={<FoodBadge tone="positive">Rapide</FoodBadge>}
            description="Une recette de démonstration."
            difficulty="Facile"
            durationMinutes={20}
            href="/recettes/demo"
            title="Bowl végétarien"
          />
        </section>
        <EmptyState
          description="Ajoute une première recette."
          title="Aucun favori"
        />
      </main>,
    );

    const results = await axe.run(container, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });
    expect(results.violations).toEqual([]);
  });
});
