import { NotificationPreferences } from "@/features/notifications/notification-preferences";
import { requireVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

export default async function NotificationsPage() {
  const user = await requireVerifiedUser();
  const supabase = await createClient();
  const [{ data: preferences }, { data: notifications }] = await Promise.all([
    supabase
      .from("notification_preferences")
      .select(
        "planning_ready_enabled,shopping_reminder_enabled,email_enabled,timezone,max_per_week",
      )
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("notification_deliveries")
      .select("id,title,body,action_url,status,created_at")
      .eq("user_id", user.id)
      .eq("channel", "web")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);
  return (
    <main className="mx-auto max-w-4xl px-4 py-8" id="contenu-principal">
      <h1 className="text-3xl font-semibold">Notifications</h1>
      <p className="mt-2 text-muted">
        Les messages restent génériques et ne contiennent jamais de donnée
        alimentaire ou de santé.
      </p>
      <NotificationPreferences
        initial={{
          planningReadyEnabled: preferences?.planning_ready_enabled ?? true,
          shoppingReminderEnabled:
            preferences?.shopping_reminder_enabled ?? false,
          emailEnabled: preferences?.email_enabled ?? false,
          timezone: preferences?.timezone ?? "Europe/Paris",
          maxPerWeek: preferences?.max_per_week ?? 3,
        }}
      />
      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Messages récents</h2>
        <ul className="mt-4 grid gap-3">
          {(notifications ?? []).map((notification) => (
            <li
              className="rounded-xl border bg-surface p-4"
              key={notification.id}
            >
              <a
                className="font-semibold text-brand"
                href={notification.action_url}
              >
                {notification.title}
              </a>
              <p className="mt-1">{notification.body}</p>
              <p className="mt-2 text-xs text-muted">
                {new Date(notification.created_at).toLocaleString("fr-FR")}
              </p>
            </li>
          ))}
          {(notifications ?? []).length === 0 ? (
            <li className="text-muted">Aucune notification pour le moment.</li>
          ) : null}
        </ul>
      </section>
    </main>
  );
}
