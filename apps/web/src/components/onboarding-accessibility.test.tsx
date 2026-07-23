// @vitest-environment jsdom

import axe from "axe-core";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LegalPage } from "./legal-page";
import { OnboardingShell } from "./onboarding-shell";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.ComponentProps<"a">) => (
    <a href={String(href)} {...props}>
      {children}
    </a>
  ),
}));

afterEach(cleanup);

describe("onboarding and legal accessibility", () => {
  it("has no detectable violations on the onboarding shell", async () => {
    const { container } = render(
      <OnboardingShell
        currentStep={2}
        description="Une étape courte et facultative."
        title="Tes objectifs"
      >
        <form>
          <label htmlFor="meal-count">Repas par semaine</label>
          <input id="meal-count" min={1} type="number" />
          <button type="submit">Continuer</button>
        </form>
      </OnboardingShell>,
    );
    expect(
      (
        await axe.run(container, {
          rules: { "color-contrast": { enabled: false } },
        })
      ).violations,
    ).toEqual([]);
  });

  it("announces the draft status on legal documents", async () => {
    const { container, getByText } = render(
      <LegalPage title="Politique de test">
        <section>
          <h2>Information</h2>
          <p>Contenu accessible.</p>
        </section>
      </LegalPage>,
    );
    expect(
      getByText(/Brouillon à faire valider par un professionnel/),
    ).toBeTruthy();
    expect(
      (
        await axe.run(container, {
          rules: { "color-contrast": { enabled: false } },
        })
      ).violations,
    ).toEqual([]);
  });
});
