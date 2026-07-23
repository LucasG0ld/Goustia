import { afterEach, describe, expect, it, vi } from "vitest";

import { onboardingProfileSchema } from "./onboarding";

const validProfile = {
  firstName: "Camille",
  lastName: "Martin",
  birthDate: "1990-01-01",
  nutritionGoal: "balanced",
  mealsPerWeek: 7,
  servingsPerMeal: 2,
  restrictions: [],
};

describe("onboardingProfileSchema", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts the validated upper limits", () => {
    expect(
      onboardingProfileSchema.safeParse({
        ...validProfile,
        mealsPerWeek: 14,
        servingsPerMeal: 8,
      }).success,
    ).toBe(true);
  });

  it("rejects values above the validated upper limits", () => {
    expect(
      onboardingProfileSchema.safeParse({
        ...validProfile,
        mealsPerWeek: 15,
      }).success,
    ).toBe(false);
    expect(
      onboardingProfileSchema.safeParse({
        ...validProfile,
        servingsPerMeal: 9,
      }).success,
    ).toBe(false);
  });

  it("refuses an account before the eighteenth birthday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-09T12:00:00.000Z"));

    expect(
      onboardingProfileSchema.safeParse({
        ...validProfile,
        birthDate: "2008-08-10",
      }).success,
    ).toBe(false);

    vi.setSystemTime(new Date("2026-08-10T12:00:00.000Z"));

    expect(
      onboardingProfileSchema.safeParse({
        ...validProfile,
        birthDate: "2008-08-10",
      }).success,
    ).toBe(true);
  });
});
