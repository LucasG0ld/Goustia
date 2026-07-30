import { describe, expect, it } from "vitest";

import { FakeNotificationAdapter } from "./adapter";

describe("fake notification adapter", () => {
  it("is simulable and retains only explicit delivery data", async () => {
    const adapter = new FakeNotificationAdapter();
    const result = await adapter.send({
      recipient: "user@example.test",
      kind: "planning_ready",
      title: "Ton planning est prêt",
      body: "Tes nouvelles propositions sont disponibles dans Goustia.",
      actionUrl: "/planning",
      unsubscribeUrl: "/notifications/desinscription",
    });
    expect(result.providerMessageId).toBe("fake-1");
    expect(adapter.sent).toHaveLength(1);
  });

  it("rejects sensitive message content before delivery", async () => {
    const adapter = new FakeNotificationAdapter();
    await expect(
      adapter.send({
        recipient: "user@example.test",
        kind: "shopping_reminder",
        title: "Rappel",
        body: "Ton allergie a changé.",
        actionUrl: "/courses",
        unsubscribeUrl: "/notifications/desinscription",
      }),
    ).rejects.toThrow();
  });
});
