import { describe, expect, it } from "vitest";

import {
  aggregatePreferenceSignals,
  getAgedPreferenceSignalWeight,
  type PreferenceSignal,
} from "./preference-learning";

const now = "2026-07-23T12:00:00.000Z";
const signal = (
  id: string,
  overrides: Partial<PreferenceSignal> = {},
): PreferenceSignal => ({
  id,
  kind: "like",
  subjectKind: "ingredient",
  subjectCode: "tomato",
  occurredAt: now,
  dislikeReason: null,
  revertedAt: null,
  ...overrides,
});

describe("preference learning", () => {
  it("weights explicit interactions by strength", () => {
    const entries = [
      signal("10000000-0000-4000-8000-000000000001"),
      signal("10000000-0000-4000-8000-000000000002", { kind: "favorite" }),
      signal("10000000-0000-4000-8000-000000000003", { kind: "cooked" }),
    ];
    expect(aggregatePreferenceSignals(entries, now)[0]).toMatchObject({
      score: 12,
      confidence: "strong",
      signalCount: 3,
    });
  });

  it("handles conflicts and treats contextual dislikes as weak", () => {
    const entries = [
      signal("10000000-0000-4000-8000-000000000001", { kind: "favorite" }),
      signal("10000000-0000-4000-8000-000000000002", {
        kind: "dislike",
        dislikeReason: "recently_eaten",
      }),
    ];
    expect(aggregatePreferenceSignals(entries, now)[0]?.score).toBe(4);
  });

  it("ages signals and makes corrections reversible", () => {
    const old = signal("10000000-0000-4000-8000-000000000001", {
      occurredAt: "2026-04-24T12:00:00.000Z",
    });
    expect(getAgedPreferenceSignalWeight(old, now)).toBeCloseTo(1.5);
    expect(
      getAgedPreferenceSignalWeight(
        { ...old, revertedAt: "2026-07-01T12:00:00.000Z" },
        now,
      ),
    ).toBe(0);
  });

  it("keeps learned preferences separate from food safety constraints", () => {
    expect(() =>
      signal("10000000-0000-4000-8000-000000000001", {
        subjectKind: "allergy" as PreferenceSignal["subjectKind"],
      }),
    ).not.toThrow();
    expect(() =>
      aggregatePreferenceSignals(
        [
          signal("10000000-0000-4000-8000-000000000001", {
            subjectKind: "allergy" as PreferenceSignal["subjectKind"],
          }),
        ],
        now,
      ),
    ).toThrow();
  });
});
