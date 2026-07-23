"use client";

import { useState, useTransition } from "react";

import { Button } from "../../components/ui";

export function ReuseRecipeButton({
  recipeVersionId,
  disabled = false,
}: {
  recipeVersionId: string;
  disabled?: boolean;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <div>
      <Button
        disabled={disabled || pending}
        onClick={() =>
          startTransition(async () => {
            setMessage(null);
            const response = await fetch("/api/v1/recipes/reuse", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                recipeVersionId,
                idempotencyKey: crypto.randomUUID(),
              }),
            });
            setMessage(
              response.ok
                ? "Ajoutée au premier créneau libre de cette semaine."
                : "Impossible de réutiliser cette recette.",
            );
          })
        }
        size="sm"
        type="button"
        variant="secondary"
      >
        Réutiliser cette semaine
      </Button>
      <p aria-live="polite" className="mt-1 text-xs text-muted">
        {message}
      </p>
    </div>
  );
}
