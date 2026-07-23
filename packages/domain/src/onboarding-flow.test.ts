import { describe, expect, it } from "vitest";

import {
  foodSafetyStepSchema,
  getProfileCompletion,
  getSafeAgeContext,
  selectContextualQuestion,
  tastesStepSchema,
} from "./index";

describe("safe onboarding", () => {
  it("rejects an empty unconfirmed safety step", () => {
    expect(
      foodSafetyStepSchema.safeParse({
        constraints: [],
        noConstraints: false,
        confirmed: true,
      }).success,
    ).toBe(false);
  });

  it("rejects contradictory constraints on the same ingredient", () => {
    const targetId = crypto.randomUUID();
    expect(
      foodSafetyStepSchema.safeParse({
        constraints: [
          {
            targetType: "ingredient",
            targetId,
            label: "Lait",
            kind: "allergy",
            severity: "severe",
          },
          {
            targetType: "ingredient",
            targetId,
            label: "Lait",
            kind: "intolerance",
            severity: "moderate",
          },
        ],
        noConstraints: false,
        confirmed: true,
      }).success,
    ).toBe(false);
  });

  it("does not turn skipped taste cards into dislikes", () => {
    expect(
      tastesStepSchema.parse({
        likedDishIds: [],
        skipped: true,
        idempotencyKey: crypto.randomUUID(),
      }).likedDishIds,
    ).toEqual([]);
  });

  it("never exposes birth date in the age context", () => {
    expect(
      getSafeAgeContext(
        new Date("1990-01-01T00:00:00Z"),
        new Date("2026-01-01T00:00:00Z"),
      ),
    ).toEqual({ isAdult: true, alcoholRecipesAllowed: true });
  });
});

describe("progressive profile", () => {
  it("reserves most completion weight for required safety steps", () => {
    expect(
      getProfileCompletion({
        foodSafetyConfirmed: true,
        goalsCompleted: true,
        tastesCompleted: true,
        dietaryPattern: false,
        cookingSkill: false,
        duration: false,
        budget: false,
        cuisines: false,
        equipment: false,
        ingredientPreferences: false,
      }),
    ).toBe(60);
  });

  it("asks no more than one contextual question every seven days", () => {
    const now = new Date("2026-07-23T12:00:00Z");
    expect(
      selectContextualQuestion({
        missing: ["budget"],
        usefulActionCount: 4,
        lastAskedAt: new Date("2026-07-20T12:00:00Z"),
        now,
      }),
    ).toBeNull();
    expect(
      selectContextualQuestion({
        missing: ["budget"],
        usefulActionCount: 4,
        lastAskedAt: new Date("2026-07-10T12:00:00Z"),
        now,
      }),
    ).toBe("budget");
  });
});
