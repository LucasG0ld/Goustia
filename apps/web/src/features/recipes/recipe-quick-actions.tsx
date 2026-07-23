"use client";

import { useRef, useState } from "react";

export function RecipeQuickActions({
  recipeId,
  surface,
}: {
  recipeId: string;
  surface: "home" | "planning";
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [reasonOpen, setReasonOpen] = useState(false);
  const inFlight = useRef(false);

  const send = async (
    action: "like" | "dislike" | "favorite",
    reason?: string | null,
  ) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setMessage("Enregistrement…");
    try {
      const response = await fetch(`/api/v1/recipes/${recipeId}/actions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action,
          reason: reason || null,
          surface,
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      if (!response.ok) throw new Error();
      setMessage("Enregistré");
      setReasonOpen(false);
    } catch {
      setMessage("Échec, réessaie.");
    } finally {
      inFlight.current = false;
    }
  };

  return (
    <div className="relative z-10 mt-2">
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Avis recette"
      >
        <button
          className="min-h-11 rounded-md border bg-surface px-3 text-sm font-semibold"
          onClick={() => void send("like")}
          type="button"
        >
          J’aime
        </button>
        <button
          aria-expanded={reasonOpen}
          className="min-h-11 rounded-md border bg-surface px-3 text-sm font-semibold"
          onClick={() => setReasonOpen((value) => !value)}
          type="button"
        >
          Je n’aime pas
        </button>
        <button
          className="min-h-11 rounded-md border bg-surface px-3 text-sm font-semibold"
          onClick={() => void send("favorite")}
          type="button"
        >
          Favori
        </button>
      </div>
      {reasonOpen ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className="text-sm font-semibold">
            Motif facultatif
            <select
              className="ml-2 min-h-11 rounded-md border bg-surface px-2"
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) {
                  void send("dislike", event.target.value);
                }
              }}
            >
              <option value="">Choisir…</option>
              <option value="ingredient">Un ingrédient</option>
              <option value="too_long">Trop long</option>
              <option value="too_complex">Trop complexe</option>
              <option value="too_expensive">Trop cher</option>
              <option value="recently_eaten">Mangé récemment</option>
              <option value="dish_type">Ce type de plat</option>
              <option value="other">Autre</option>
            </select>
          </label>
          <button
            className="min-h-11 rounded-md px-3 text-sm font-semibold underline"
            onClick={() => void send("dislike", null)}
            type="button"
          >
            Enregistrer sans motif
          </button>
        </div>
      ) : null}
      <span aria-live="polite" className="ml-2 text-xs text-muted">
        {message}
      </span>
    </div>
  );
}
