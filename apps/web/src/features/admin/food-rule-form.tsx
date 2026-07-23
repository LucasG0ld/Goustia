"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";

export function FoodRuleForm({
  ingredients,
}: {
  ingredients: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="mt-4 grid gap-3 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (
          window.prompt(
            "Saisis CONFIRMER LE BLOCAGE pour valider cette règle.",
          ) !== "CONFIRMER LE BLOCAGE"
        )
          return;
        const form = event.currentTarget;
        const data = new FormData(form);
        startTransition(async () => {
          const response = await fetch("/api/v1/admin/food-rules", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              ruleId: null,
              ingredientId: data.get("ingredientId"),
              pairedIngredientId: data.get("pairedIngredientId") || null,
              reason: data.get("reason"),
              active: true,
              confirmation: "CONFIRMER LE BLOCAGE",
              idempotencyKey: crypto.randomUUID(),
            }),
          });
          const payload = await response.json().catch(() => ({}));
          setMessage(
            response.ok
              ? "Règle active et auditée."
              : (payload.message ?? "Règle refusée."),
          );
          if (response.ok) {
            form.reset();
            router.refresh();
          }
        });
      }}
    >
      <select
        className="min-h-12 rounded-md border px-3"
        name="ingredientId"
        required
      >
        {ingredients.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
      <select
        className="min-h-12 rounded-md border px-3"
        name="pairedIngredientId"
      >
        <option value="">Bloquer cet ingrédient seul</option>
        {ingredients.map((item) => (
          <option key={item.id} value={item.id}>
            Avec {item.label}
          </option>
        ))}
      </select>
      <input
        className="min-h-12 rounded-md border px-3"
        name="reason"
        placeholder="Motif obligatoire"
        required
      />
      <Button disabled={pending} type="submit">
        Créer le blocage
      </Button>
      <span className="text-sm text-muted sm:col-span-2" role="status">
        {message}
      </span>
    </form>
  );
}
