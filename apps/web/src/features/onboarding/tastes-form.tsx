"use client";

import { useActionState, useState } from "react";

import { Alert, Button } from "@/components/ui";
import { initialActionState } from "@/features/auth/state";

import { saveTastesAction } from "./actions";
import { markOnboardingStepSubmitted } from "./step-tracker";

type Dish = { id: string; title_fr: string; description_fr: string };

export function TastesForm({
  dishes,
  idempotencyKey,
}: {
  dishes: Dish[];
  idempotencyKey: string;
}) {
  const [state, action, pending] = useActionState(
    saveTastesAction,
    initialActionState,
  );
  const [liked, setLiked] = useState<string[]>([]);
  return (
    <form
      action={action}
      className="grid gap-6"
      onSubmit={markOnboardingStepSubmitted}
    >
      {state.message ? (
        <Alert title="Impossible de continuer" tone="danger">
          {state.message}
        </Alert>
      ) : null}
      <input name="likedDishIds" type="hidden" value={JSON.stringify(liked)} />
      <input name="idempotencyKey" type="hidden" value={idempotencyKey} />
      <div className="grid gap-4 sm:grid-cols-2">
        {dishes.map((dish) => {
          const selected = liked.includes(dish.id);
          return (
            <button
              aria-pressed={selected}
              className={`rounded-xl border p-5 text-left shadow-sm ${selected ? "border-brand bg-brand-soft" : "bg-surface hover:border-brand"}`}
              key={dish.id}
              onClick={() =>
                setLiked((current) =>
                  selected
                    ? current.filter((id) => id !== dish.id)
                    : [...current, dish.id],
                )
              }
              type="button"
            >
              <span className="text-lg font-semibold">{dish.title_fr}</span>
              <span className="mt-2 block text-sm text-muted">
                {dish.description_fr}
              </span>
              <span className="mt-3 block text-sm font-semibold text-brand">
                {selected ? "Sélectionné" : "J’aime ce type de plat"}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button disabled={pending} name="skipped" type="submit" value="false">
          {pending ? "Préparation…" : "Terminer avec mes choix"}
        </Button>
        <Button
          disabled={pending}
          name="skipped"
          type="submit"
          value="true"
          variant="ghost"
        >
          Passer sans enregistrer de dislike
        </Button>
      </div>
    </form>
  );
}
