"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";

export function ReferenceEditor({
  ingredientId,
  allergens,
}: {
  ingredientId: string;
  allergens: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (body: Record<string, unknown>) => {
    if (
      window.prompt(
        "Saisis MODIFIER LE REFERENTIEL pour confirmer cette modification auditée.",
      ) !== "MODIFIER LE REFERENTIEL"
    ) {
      return;
    }
    startTransition(async () => {
      const response = await fetch("/api/v1/admin/reference", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ingredientId,
          relatedId: null,
          value: null,
          relation: null,
          confidence: null,
          rationale: null,
          ...body,
          confirmation: "MODIFIER LE REFERENTIEL",
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      setMessage(
        response.ok
          ? "Référentiel mis à jour."
          : (payload.message ?? "Modification refusée."),
      );
      if (response.ok) router.refresh();
    });
  };

  return (
    <details className="mt-3">
      <summary className="cursor-pointer font-semibold text-brand">
        Modifier le référentiel
      </summary>
      <div className="mt-3 grid gap-3">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const value = String(new FormData(form).get("synonym"));
            submit({ action: "add_synonym", value });
            form.reset();
          }}
        >
          <input
            aria-label="Nouveau synonyme"
            className="min-h-11 flex-1 rounded-md border px-3"
            name="synonym"
            required
          />
          <Button disabled={pending} size="sm" type="submit">
            Ajouter le synonyme
          </Button>
        </form>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={pending}
            onClick={() => submit({ action: "set_alcohol", value: "true" })}
            size="sm"
            variant="secondary"
          >
            Marquer avec alcool
          </Button>
          <Button
            disabled={pending}
            onClick={() => submit({ action: "set_alcohol", value: "false" })}
            size="sm"
            variant="ghost"
          >
            Retirer le marquage alcool
          </Button>
        </div>
        <form
          className="grid gap-2 sm:grid-cols-[1fr_12rem_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            submit({
              action: "set_allergen",
              relatedId: data.get("allergenId"),
              relation: data.get("relation"),
            });
          }}
        >
          <select className="min-h-11 rounded-md border px-3" name="allergenId">
            {allergens.map((allergen) => (
              <option key={allergen.id} value={allergen.id}>
                {allergen.label}
              </option>
            ))}
          </select>
          <select className="min-h-11 rounded-md border px-3" name="relation">
            <option value="contains">Contient</option>
            <option value="may_contain">Peut contenir</option>
            <option value="derived_from">Dérivé de</option>
          </select>
          <Button disabled={pending} size="sm" type="submit">
            Lier l’allergène
          </Button>
        </form>
        <form
          className="grid gap-2 sm:grid-cols-[1fr_8rem_1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            submit({
              action: "set_ciqual",
              value: data.get("foodCode") || null,
              confidence: Number(data.get("confidence")),
              rationale: data.get("rationale"),
            });
          }}
        >
          <input
            aria-label="Code Ciqual"
            className="min-h-11 rounded-md border px-3"
            name="foodCode"
            placeholder="Code ou vide si sans correspondance"
          />
          <input
            aria-label="Confiance"
            className="min-h-11 rounded-md border px-3"
            defaultValue="1"
            max="1"
            min="0"
            name="confidence"
            step="0.001"
            type="number"
          />
          <input
            aria-label="Justification Ciqual"
            className="min-h-11 rounded-md border px-3"
            name="rationale"
            required
          />
          <Button disabled={pending} size="sm" type="submit">
            Enregistrer Ciqual
          </Button>
        </form>
        <p className="text-sm text-muted" role="status">
          {message}
        </p>
      </div>
    </details>
  );
}
