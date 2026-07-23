const allergies = [
  [],
  ["peanuts"],
  ["milk"],
  ["eggs", "milk"],
  ["fish", "crustaceans"],
];
const exclusions = [[], ["pork"], ["celery"], ["mushroom"]];
const goals = ["weight_loss", "balanced", "muscle_gain", "no_specific_goal"];
const servings = [1, 2, 4, 6];
const mealTypes = ["breakfast", "lunch", "dinner", "snack"];
const cuisines = ["french", "mediterranean", "italian", "levantine", "asian"];
const families = ["salad", "soup", "pasta", "curry", "oven_dish", "bowl"];

/**
 * Strictly fictitious, deterministic and pseudonymous profiles.
 * No name, email, date of birth or production identifier is ever present.
 */
export const benchmarkProfiles = Array.from({ length: 60 }, (_, index) => ({
  fixtureId: `fixture-${String(index + 1).padStart(2, "0")}`,
  ageClass: index % 4 === 0 ? "minor" : "adult",
  alcoholAllowed: index % 4 !== 0,
  allergyCodes: allergies[index % allergies.length],
  strictExcludedIngredientIds: exclusions[index % exclusions.length],
  dislikedIngredientIds: exclusions[(index + 1) % exclusions.length],
  nutritionGoal: goals[index % goals.length],
  servings: servings[index % servings.length],
  maximumPreparationMinutes: [15, 30, 45, null][index % 4],
  budgetLevel: ["low", "moderate", "flexible"][index % 3],
  preferredCuisineCodes: [cuisines[index % cuisines.length]],
  mealType: mealTypes[index % mealTypes.length],
  expectedDishFamily: families[index % families.length],
}));

export const benchmarkCoverage = {
  minimumProfiles: 50,
  profileCount: benchmarkProfiles.length,
  allergyFixtures: benchmarkProfiles.filter(
    ({ allergyCodes }) => allergyCodes.length > 0,
  ).length,
  multipleAllergyFixtures: benchmarkProfiles.filter(
    ({ allergyCodes }) => allergyCodes.length > 1,
  ).length,
  minorFixtures: benchmarkProfiles.filter(
    ({ ageClass }) => ageClass === "minor",
  ).length,
  goals: [
    ...new Set(benchmarkProfiles.map(({ nutritionGoal }) => nutritionGoal)),
  ],
  servings: [...new Set(benchmarkProfiles.map(({ servings }) => servings))],
  dishFamilies: [
    ...new Set(
      benchmarkProfiles.map(({ expectedDishFamily }) => expectedDishFamily),
    ),
  ],
};
