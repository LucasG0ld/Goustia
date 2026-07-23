import assert from "node:assert/strict";

import {
  benchmarkCoverage,
  benchmarkProfiles,
} from "./ai-benchmark-corpus.mjs";

assert.equal(benchmarkProfiles.length >= 50, true);
assert.equal(benchmarkCoverage.multipleAllergyFixtures > 0, true);
assert.equal(benchmarkCoverage.minorFixtures > 0, true);
assert.deepEqual(benchmarkCoverage.goals.sort(), [
  "balanced",
  "muscle_gain",
  "no_specific_goal",
  "weight_loss",
]);
assert.deepEqual(
  benchmarkCoverage.servings.sort((a, b) => a - b),
  [1, 2, 4, 6],
);
assert.equal(
  benchmarkProfiles.every(
    (profile) =>
      !("name" in profile) &&
      !("email" in profile) &&
      !("birthDate" in profile),
  ),
  true,
);

console.log(`AI benchmark corpus: ${benchmarkProfiles.length} fixtures OK`);
