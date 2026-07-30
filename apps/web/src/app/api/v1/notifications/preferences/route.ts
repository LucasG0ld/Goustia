import {
  notificationPreferenceSchema,
  type NotificationPreference,
} from "@recettes/domain";
import { NextResponse } from "next/server";

import { getVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!(await getVerifiedUser())) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }
  const input = notificationPreferenceSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!input.success) {
    return NextResponse.json(
      { error: "invalid_notification_preferences" },
      { status: 400 },
    );
  }
  const value: NotificationPreference = input.data;
  const { error } = await (
    await createClient()
  ).rpc("update_notification_preferences", {
    p_planning_ready: value.planningReadyEnabled,
    p_shopping_reminder: value.shoppingReminderEnabled,
    p_email_enabled: value.emailEnabled,
    p_timezone: value.timezone,
    p_max_per_week: value.maxPerWeek,
  });
  return error
    ? NextResponse.json(
        { error: "notification_preferences_failed" },
        { status: 409 },
      )
    : NextResponse.json({ updated: true });
}
