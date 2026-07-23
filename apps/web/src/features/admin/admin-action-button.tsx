"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";

export function AdminActionButton({
  endpoint,
  body,
  confirmation,
  children,
  variant = "secondary",
}: {
  endpoint: string;
  body: Record<string, unknown>;
  confirmation: string;
  children: React.ReactNode;
  variant?: "secondary" | "ghost";
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <span>
      <Button
        disabled={pending}
        onClick={() => {
          const entered = window.prompt(
            `Action administrative sensible. Saisis ${confirmation} pour confirmer.`,
          );
          if (entered !== confirmation) return;
          startTransition(async () => {
            const response = await fetch(endpoint, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                ...body,
                confirmation,
                idempotencyKey: crypto.randomUUID(),
              }),
            });
            const payload = await response.json().catch(() => ({}));
            setMessage(
              response.ok
                ? "Action enregistrée dans l’audit."
                : (payload.message ?? "Action refusée."),
            );
            if (response.ok) router.refresh();
          });
        }}
        size="sm"
        variant={variant}
      >
        {pending ? "Traitement…" : children}
      </Button>
      {message ? (
        <small className="ml-2 text-muted" role="status">
          {message}
        </small>
      ) : null}
    </span>
  );
}
