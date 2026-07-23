import { z } from "zod";

export const preferenceInteractionKinds = [
  "like",
  "favorite",
  "cooked",
  "dislike",
  "swap",
  "ignored",
] as const;
export const learnedPreferenceSubjectKinds = [
  "ingredient",
  "cuisine",
  "duration",
  "budget",
  "dish_type",
] as const;

export const preferenceSignalSchema = z.strictObject({
  id: z.uuid(),
  kind: z.enum(preferenceInteractionKinds),
  subjectKind: z.enum(learnedPreferenceSubjectKinds),
  subjectCode: z.string().trim().min(1).max(160),
  occurredAt: z.iso.datetime(),
  dislikeReason: z
    .enum([
      "ingredient",
      "too_long",
      "too_complex",
      "too_expensive",
      "recently_eaten",
      "dish_type",
      "other",
    ])
    .nullable(),
  revertedAt: z.iso.datetime().nullable(),
});

export type PreferenceSignal = z.infer<typeof preferenceSignalSchema>;

const BASE_WEIGHTS: Record<PreferenceSignal["kind"], number> = {
  like: 3,
  favorite: 5,
  cooked: 4,
  dislike: -4,
  swap: -1.5,
  ignored: -0.25,
};

function contextualWeight(signal: PreferenceSignal) {
  if (signal.kind !== "dislike") return BASE_WEIGHTS[signal.kind];
  if (
    signal.dislikeReason === "recently_eaten" ||
    signal.dislikeReason === "other"
  ) {
    return -1;
  }
  return BASE_WEIGHTS.dislike;
}

export function getAgedPreferenceSignalWeight(
  signalInput: PreferenceSignal,
  nowInput: string,
  halfLifeDays = 90,
) {
  const signal = preferenceSignalSchema.parse(signalInput);
  const now = new Date(nowInput);
  if (!Number.isFinite(now.getTime()) || halfLifeDays <= 0) {
    throw new Error("INVALID_PREFERENCE_AGING_CONTEXT");
  }
  if (signal.revertedAt) return 0;
  const ageDays = Math.max(
    0,
    (now.getTime() - new Date(signal.occurredAt).getTime()) / 86_400_000,
  );
  return contextualWeight(signal) * 2 ** (-ageDays / halfLifeDays);
}

export type LearnedPreference = {
  subjectKind: PreferenceSignal["subjectKind"];
  subjectCode: string;
  score: number;
  confidence: "weak" | "moderate" | "strong";
  signalCount: number;
};

export function aggregatePreferenceSignals(
  signalsInput: PreferenceSignal[],
  now: string,
  halfLifeDays = 90,
): LearnedPreference[] {
  const groups = new Map<string, PreferenceSignal[]>();
  for (const input of signalsInput) {
    const signal = preferenceSignalSchema.parse(input);
    const key = `${signal.subjectKind}:${signal.subjectCode}`;
    groups.set(key, [...(groups.get(key) ?? []), signal]);
  }
  return [...groups.values()]
    .map((signals) => {
      const rawScore = signals.reduce(
        (sum, signal) =>
          sum + getAgedPreferenceSignalWeight(signal, now, halfLifeDays),
        0,
      );
      // Repeated identical signals matter, with a cap that prevents runaway profiles.
      const score =
        Math.round(Math.max(-12, Math.min(12, rawScore)) * 100) / 100;
      const magnitude = Math.abs(score);
      return {
        subjectKind: signals[0]!.subjectKind,
        subjectCode: signals[0]!.subjectCode,
        score,
        confidence:
          magnitude >= 7 ? "strong" : magnitude >= 3 ? "moderate" : "weak",
        signalCount: signals.filter((signal) => !signal.revertedAt).length,
      } satisfies LearnedPreference;
    })
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.subjectKind.localeCompare(right.subjectKind) ||
        left.subjectCode.localeCompare(right.subjectCode),
    );
}
