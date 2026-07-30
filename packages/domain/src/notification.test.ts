import { describe, expect, it } from "vitest";

import {
  notificationMessageSchema,
  notificationPreferenceSchema,
} from "./notification";

describe("notification contracts", () => {
  it("accepts a minimal product notification", () => {
    expect(
      notificationMessageSchema.parse({
        kind: "planning_ready",
        title: "Ton planning est prêt",
        body: "Tes nouvelles propositions sont disponibles dans Goustia.",
        actionUrl: "/planning",
      }),
    ).toBeTruthy();
  });

  it.each(["allergie", "alcool", "calories", "poids", "ingrédient"])(
    "rejects sensitive content: %s",
    (word) => {
      expect(() =>
        notificationMessageSchema.parse({
          kind: "shopping_reminder",
          title: "Rappel",
          body: `Information sur ${word}`,
          actionUrl: "/courses",
        }),
      ).toThrow();
    },
  );

  it("bounds frequency and requires an IANA-like timezone", () => {
    expect(
      notificationPreferenceSchema.safeParse({
        planningReadyEnabled: true,
        shoppingReminderEnabled: false,
        emailEnabled: false,
        timezone: "Europe/Paris",
        maxPerWeek: 3,
      }).success,
    ).toBe(true);
    expect(
      notificationPreferenceSchema.safeParse({
        planningReadyEnabled: true,
        shoppingReminderEnabled: true,
        emailEnabled: true,
        timezone: "UTC",
        maxPerWeek: 20,
      }).success,
    ).toBe(false);
  });
});
