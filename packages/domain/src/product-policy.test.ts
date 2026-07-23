import { describe, expect, it } from "vitest";

import {
  canGeneratePersistentPlan,
  getRecipeCooldownDays,
  getSwapGuidance,
  productPolicy,
} from "./product-policy";

describe("product policy", () => {
  it("centralizes the validated MVP limits", () => {
    expect(productPolicy.minimumAccountAge).toBe(18);
    expect(productPolicy.launchCountries).toEqual(["FR"]);
    expect(productPolicy.mealTypes).toEqual(["lunch", "dinner"]);
    expect(productPolicy.mealsPerWeek.max).toBe(14);
    expect(productPolicy.servingsPerMeal.max).toBe(8);
    expect(productPolicy.quotas).toEqual({
      fullPlanRegenerationsPerWeek: 3,
      swapsPerDay: 5,
    });
  });

  it("applies reaction cooldowns", () => {
    expect(getRecipeCooldownDays("liked")).toBe(7);
    expect(getRecipeCooldownDays("neutral")).toBe(14);
    expect(getRecipeCooldownDays("disliked")).toBe(28);
  });

  it("changes guidance after repeated swaps", () => {
    expect(getSwapGuidance(0)).toBe("generate_alternative");
    expect(getSwapGuidance(1)).toBe("generate_alternative");
    expect(getSwapGuidance(2)).toBe("ask_optional_reason");
    expect(getSwapGuidance(3)).toBe("use_curated_alternatives");
    expect(getSwapGuidance(4)).toBe("use_curated_alternatives");
    expect(() => getSwapGuidance(-1)).toThrow(RangeError);
    expect(() => getSwapGuidance(1.5)).toThrow(RangeError);
  });

  it("requires a verified email before persistent generation", () => {
    expect(canGeneratePersistentPlan(false)).toBe(false);
    expect(canGeneratePersistentPlan(true)).toBe(true);
  });
});
