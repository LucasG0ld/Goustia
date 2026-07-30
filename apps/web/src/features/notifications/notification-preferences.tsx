"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";

export function NotificationPreferences({
  initial,
}: {
  initial: {
    planningReadyEnabled: boolean;
    shoppingReminderEnabled: boolean;
    emailEnabled: boolean;
    timezone: string;
    maxPerWeek: number;
  };
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="mt-5 grid gap-4 rounded-xl border bg-surface p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(async () => {
          const response = await fetch("/api/v1/notifications/preferences", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              planningReadyEnabled: data.get("planningReady") === "on",
              shoppingReminderEnabled: data.get("shoppingReminder") === "on",
              emailEnabled: data.get("email") === "on",
              timezone: data.get("timezone"),
              maxPerWeek: Number(data.get("maxPerWeek")),
            }),
          });
          setMessage(
            response.ok
              ? "Préférences enregistrées."
              : "Les préférences n’ont pas été enregistrées.",
          );
          if (response.ok) router.refresh();
        });
      }}
    >
      <label className="flex min-h-11 items-center gap-3 font-semibold">
        <input
          defaultChecked={initial.planningReadyEnabled}
          name="planningReady"
          type="checkbox"
        />
        Prévenir lorsque mon planning est prêt
      </label>
      <label className="flex min-h-11 items-center gap-3 font-semibold">
        <input
          defaultChecked={initial.shoppingReminderEnabled}
          name="shoppingReminder"
          type="checkbox"
        />
        Me rappeler de faire les courses
      </label>
      <label className="flex min-h-11 items-center gap-3 font-semibold">
        <input
          defaultChecked={initial.emailEnabled}
          name="email"
          type="checkbox"
        />
        Autoriser également les e-mails produit
      </label>
      <label className="grid gap-1 font-semibold">
        Fuseau horaire
        <select
          className="min-h-12 rounded-md border px-3"
          defaultValue={initial.timezone}
          name="timezone"
        >
          <option value="Europe/Paris">Europe/Paris</option>
          <option value="Europe/Brussels">Europe/Brussels</option>
          <option value="Europe/Luxembourg">Europe/Luxembourg</option>
          <option value="Europe/Zurich">Europe/Zurich</option>
          <option value="America/Montreal">America/Montreal</option>
        </select>
      </label>
      <label className="grid gap-1 font-semibold">
        Maximum par semaine
        <input
          className="min-h-12 rounded-md border px-3"
          defaultValue={initial.maxPerWeek}
          max="7"
          min="1"
          name="maxPerWeek"
          type="number"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button disabled={pending} type="submit">
          Enregistrer
        </Button>
        <Button
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              await fetch("/api/v1/notifications/preferences", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  ...initial,
                  emailEnabled: false,
                  planningReadyEnabled: false,
                  shoppingReminderEnabled: false,
                }),
              });
              router.refresh();
            });
          }}
          type="button"
          variant="ghost"
        >
          Tout désactiver
        </Button>
      </div>
      <p className="text-sm text-muted" role="status">
        {message}
      </p>
    </form>
  );
}
