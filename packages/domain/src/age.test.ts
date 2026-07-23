import { describe, expect, it } from "vitest";

import { canCreateAccount, canReceiveAlcoholRecipes, getAgeAt } from "./age";

describe("age rules", () => {
  it("calculates age before and after the birthday", () => {
    const birthDate = new Date("2008-08-10T00:00:00.000Z");

    expect(getAgeAt(birthDate, new Date("2026-08-09T12:00:00.000Z"))).toBe(17);
    expect(getAgeAt(birthDate, new Date("2026-08-10T12:00:00.000Z"))).toBe(18);
  });

  it("excludes alcohol recipes for minors", () => {
    const referenceDate = new Date("2026-07-23T12:00:00.000Z");

    expect(
      canReceiveAlcoholRecipes(
        new Date("2009-01-01T00:00:00.000Z"),
        referenceDate,
      ),
    ).toBe(false);
    expect(
      canReceiveAlcoholRecipes(
        new Date("2000-01-01T00:00:00.000Z"),
        referenceDate,
      ),
    ).toBe(true);
  });

  it("allows account creation from the eighteenth birthday", () => {
    const birthDate = new Date("2008-08-10T00:00:00.000Z");

    expect(
      canCreateAccount(birthDate, new Date("2026-08-09T12:00:00.000Z")),
    ).toBe(false);
    expect(
      canCreateAccount(birthDate, new Date("2026-08-10T12:00:00.000Z")),
    ).toBe(true);
  });
});
