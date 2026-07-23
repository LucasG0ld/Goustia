export const supportedLaunchCountries = ["FR"] as const;
export const supportedMealTypes = ["lunch", "dinner"] as const;

export const productPolicy = {
  audience: "adults_france_small_households",
  minimumAccountAge: 18,
  minorsSupported: false,
  launchCountries: supportedLaunchCountries,
  mealTypes: supportedMealTypes,
  mealsPerWeek: {
    min: 1,
    max: 14,
  },
  servingsPerMeal: {
    min: 1,
    max: 8,
  },
  quotas: {
    fullPlanRegenerationsPerWeek: 3,
    swapsPerDay: 5,
  },
  nutrition: {
    usesRanges: true,
    source: "ciqual",
    medicalPrescription: false,
  },
  recipeCooldownDays: {
    liked: 7,
    neutral: 14,
    disliked: 28,
  },
  dislikeWithoutReason: "weak_recipe_signal_only",
  swap: {
    askOptionalReasonAfter: 2,
    useCuratedAlternativesAfter: 3,
  },
  publicAccess: {
    personalizedPlan: false,
    demoRecipes: true,
  },
  emailVerificationRequiredBeforePersistentGeneration: true,
} as const;

export type RecipeReaction = keyof typeof productPolicy.recipeCooldownDays;
export type SwapGuidance =
  | "generate_alternative"
  | "ask_optional_reason"
  | "use_curated_alternatives";

export function getRecipeCooldownDays(reaction: RecipeReaction): number {
  return productPolicy.recipeCooldownDays[reaction];
}

export function getSwapGuidance(completedSwapCount: number): SwapGuidance {
  if (!Number.isInteger(completedSwapCount) || completedSwapCount < 0) {
    throw new RangeError("completedSwapCount must be a non-negative integer");
  }

  if (completedSwapCount >= productPolicy.swap.useCuratedAlternativesAfter) {
    return "use_curated_alternatives";
  }

  if (completedSwapCount >= productPolicy.swap.askOptionalReasonAfter) {
    return "ask_optional_reason";
  }

  return "generate_alternative";
}

export function canGeneratePersistentPlan(emailVerified: boolean): boolean {
  return (
    emailVerified ||
    !productPolicy.emailVerificationRequiredBeforePersistentGeneration
  );
}
