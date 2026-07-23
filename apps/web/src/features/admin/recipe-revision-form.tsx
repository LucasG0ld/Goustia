"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";

export function RecipeRevisionForm({
  recipeId,
  versionId,
  title,
  description,
}: {
  recipeId: string;
  versionId: string;
  title: string;
  description: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <details className="mt-3">
      <summary className="cursor-pointer font-semibold text-brand">
        Créer une correction versionnée
      </summary>
      <form
        className="mt-3 grid gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (
            window.prompt(
              "Saisis CORRIGER pour créer une nouvelle version.",
            ) !== "CORRIGER"
          )
            return;
          const data = new FormData(event.currentTarget);
          startTransition(async () => {
            const response = await fetch(`/api/v1/admin/recipes/${recipeId}`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                action: "revise",
                versionId,
                title: data.get("title"),
                description: data.get("description"),
                confirmation: "CORRIGER",
                idempotencyKey: crypto.randomUUID(),
              }),
            });
            const payload = await response.json().catch(() => ({}));
            setMessage(
              response.ok
                ? "Version créée, à valider avant publication."
                : (payload.message ?? "Correction refusée."),
            );
            if (response.ok) router.refresh();
          });
        }}
      >
        <input
          className="min-h-11 rounded-md border px-3"
          defaultValue={title}
          name="title"
          required
        />
        <textarea
          className="min-h-24 rounded-md border p-3"
          defaultValue={description}
          name="description"
          required
        />
        <Button disabled={pending} size="sm" type="submit">
          Créer la version
        </Button>
        <span className="text-sm text-muted" role="status">
          {message}
        </span>
      </form>
    </details>
  );
}
