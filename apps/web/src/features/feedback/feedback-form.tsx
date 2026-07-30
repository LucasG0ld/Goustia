"use client";

import { useState } from "react";

import { Button } from "@/components/ui";

export function FeedbackForm() {
  const [status, setStatus] = useState<string | null>(null);
  return (
    <form
      className="mt-6 grid gap-4 rounded-xl border bg-surface p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const response = await fetch("/api/v1/feedback", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            kind: data.get("kind"),
            message: data.get("message"),
            pagePath: window.location.pathname,
          }),
        });
        setStatus(
          response.ok
            ? "Merci, ton retour a bien été enregistré."
            : "Le retour n’a pas pu être enregistré. Réessaie plus tard.",
        );
        if (response.ok) form.reset();
      }}
    >
      <label className="grid gap-2 font-semibold">
        Type de retour
        <select className="min-h-12 rounded-md border px-3" name="kind">
          <option value="bug">Problème technique</option>
          <option value="recipe_quality">Qualité d’une recette</option>
          <option value="food_safety">
            Sécurité alimentaire — prioritaire
          </option>
          <option value="suggestion">Suggestion</option>
        </select>
      </label>
      <label className="grid gap-2 font-semibold">
        Ton retour
        <textarea
          className="min-h-36 rounded-md border p-3"
          maxLength={2000}
          minLength={10}
          name="message"
          required
        />
      </label>
      <Button type="submit">Envoyer le retour</Button>
      {status ? <p role="status">{status}</p> : null}
    </form>
  );
}
