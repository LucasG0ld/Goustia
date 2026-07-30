import { z } from "zod";

export const notificationKinds = [
  "planning_ready",
  "shopping_reminder",
] as const;

const sensitiveContent =
  /(allerg|intol[eé]rance|alcool|ingr[eé]dient|calorie|poids)/i;

export const notificationMessageSchema = z
  .strictObject({
    kind: z.enum(notificationKinds),
    title: z.string().trim().min(3).max(100),
    body: z.string().trim().min(3).max(240),
    actionUrl: z
      .string()
      .trim()
      .regex(/^\/[a-z0-9/?=&_-]+$/),
  })
  .superRefine((value, context) => {
    if (sensitiveContent.test(`${value.title} ${value.body}`)) {
      context.addIssue({
        code: "custom",
        path: ["body"],
        message: "Le contenu d’une notification ne doit pas être sensible.",
      });
    }
  });

export const notificationPreferenceSchema = z.strictObject({
  planningReadyEnabled: z.boolean(),
  shoppingReminderEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  timezone: z
    .string()
    .trim()
    .regex(/^[A-Za-z_]+(?:\/[A-Za-z_+-]+)+$/),
  maxPerWeek: z.number().int().min(1).max(7),
});

export type NotificationMessage = z.infer<typeof notificationMessageSchema>;
export type NotificationPreference = z.infer<
  typeof notificationPreferenceSchema
>;
