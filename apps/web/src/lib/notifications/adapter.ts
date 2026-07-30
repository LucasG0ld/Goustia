import {
  notificationMessageSchema,
  type NotificationMessage,
} from "@recettes/domain";

export type NotificationEmail = NotificationMessage & {
  recipient: string;
  unsubscribeUrl: string;
};

export interface NotificationAdapter {
  send(message: NotificationEmail): Promise<{ providerMessageId: string }>;
}

export class FakeNotificationAdapter implements NotificationAdapter {
  readonly sent: NotificationEmail[] = [];

  async send(input: NotificationEmail) {
    const message = notificationMessageSchema.parse({
      kind: input.kind,
      title: input.title,
      body: input.body,
      actionUrl: input.actionUrl,
    });
    if (!input.recipient.includes("@")) throw new Error("INVALID_RECIPIENT");
    this.sent.push({ ...input, ...message });
    return { providerMessageId: `fake-${this.sent.length}` };
  }
}
