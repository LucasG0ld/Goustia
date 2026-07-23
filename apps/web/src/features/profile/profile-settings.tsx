"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";

type Constraint = {
  id: string;
  kind: string;
  severity: string;
  label: string;
};

async function save(body: Record<string, unknown>) {
  const response = await fetch("/api/v1/profile/settings", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("La modification n’a pas été enregistrée.");
}

export function ProfileSettings({
  profile,
  constraints,
  ingredients,
  allergens,
  learned,
}: {
  profile: {
    nutritionGoal: string;
    mealsPerWeek: number;
    servingsPerMeal: number;
  };
  constraints: Constraint[];
  ingredients: { id: string; label: string }[];
  allergens: { id: string; label: string }[];
  learned: {
    subjectKind: string;
    subjectCode: string;
    score: number;
    correctedScore: number | null;
  }[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (body: Record<string, unknown>, success: string) => {
    startTransition(async () => {
      try {
        await save(body);
        setMessage(success);
        router.refresh();
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Erreur inattendue.",
        );
      }
    });
  };
  const correctPreference = (
    item: (typeof learned)[number],
    correctedScore: number | null,
  ) => {
    startTransition(async () => {
      const response = await fetch("/api/v1/preferences/learned", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subjectKind: item.subjectKind,
          subjectCode: item.subjectCode,
          correctedScore,
        }),
      });
      setMessage(
        response.ok
          ? "Préférence déduite corrigée."
          : "La correction n’a pas été enregistrée.",
      );
      if (response.ok) router.refresh();
    });
  };

  return (
    <div className="mt-8 grid gap-8">
      <section className="rounded-xl border bg-surface p-5">
        <h2 className="text-xl font-semibold">Rythme et objectif</h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            submit(
              {
                action: "profile",
                nutritionGoal: data.get("nutritionGoal"),
                mealsPerWeek: Number(data.get("mealsPerWeek")),
                servingsPerMeal: Number(data.get("servingsPerMeal")),
              },
              "Profil mis à jour.",
            );
          }}
        >
          <label className="grid gap-1 font-semibold">
            Objectif
            <select
              className="min-h-12 rounded-md border px-3"
              defaultValue={profile.nutritionGoal}
              name="nutritionGoal"
            >
              <option value="balanced">Équilibre</option>
              <option value="weight_loss">Perte de poids</option>
              <option value="muscle_gain">Prise de masse</option>
              <option value="no_specific_goal">Sans objectif</option>
            </select>
          </label>
          <label className="grid gap-1 font-semibold">
            Repas par semaine
            <input
              className="min-h-12 rounded-md border px-3"
              defaultValue={profile.mealsPerWeek}
              max="21"
              min="1"
              name="mealsPerWeek"
              type="number"
            />
          </label>
          <label className="grid gap-1 font-semibold">
            Portions par repas
            <input
              className="min-h-12 rounded-md border px-3"
              defaultValue={profile.servingsPerMeal}
              max="12"
              min="1"
              name="servingsPerMeal"
              type="number"
            />
          </label>
          <Button disabled={isPending} type="submit">
            Enregistrer
          </Button>
        </form>
      </section>

      <section className="rounded-xl border border-danger bg-surface p-5">
        <h2 className="text-xl font-semibold">
          Allergies et exclusions strictes
        </h2>
        <p className="mt-2 text-sm text-muted">
          Ces règles bloquent les recettes concernées. Vérifie-les avec soin.
        </p>
        <ul className="mt-4 grid gap-2">
          {constraints.map((constraint) => (
            <li
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
              key={constraint.id}
            >
              <span>
                <strong>{constraint.label}</strong> — {constraint.kind},{" "}
                {constraint.severity}
              </span>
              <Button
                disabled={isPending}
                onClick={() => {
                  const confirmation = window.prompt(
                    `Cette suppression peut réautoriser des recettes contenant ${constraint.label}. Saisis RETIRER pour confirmer.`,
                  );
                  if (confirmation !== "RETIRER") return;
                  submit(
                    {
                      action: "remove_constraint",
                      constraintId: constraint.id,
                      confirmation,
                    },
                    "Contrainte retirée et recettes réévaluées.",
                  );
                }}
                size="sm"
                variant="ghost"
              >
                Retirer
              </Button>
            </li>
          ))}
          {constraints.length === 0 ? (
            <li className="text-sm text-muted">Aucune contrainte stricte.</li>
          ) : null}
        </ul>
        <form
          className="mt-5 grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            const [targetType, targetId] = String(data.get("target")).split(
              ":",
            );
            submit(
              {
                action: "add_constraint",
                targetType,
                targetId,
                kind: data.get("kind"),
                severity: data.get("severity"),
                note: null,
              },
              "Contrainte ajoutée et recettes réévaluées.",
            );
            form.reset();
          }}
        >
          <select className="min-h-12 rounded-md border px-3" name="target">
            <optgroup label="Allergènes">
              {allergens.map((item) => (
                <option key={item.id} value={`allergen:${item.id}`}>
                  {item.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Ingrédients">
              {ingredients.map((item) => (
                <option key={item.id} value={`ingredient:${item.id}`}>
                  {item.label}
                </option>
              ))}
            </optgroup>
          </select>
          <select className="min-h-12 rounded-md border px-3" name="kind">
            <option value="allergy">Allergie</option>
            <option value="intolerance">Intolérance</option>
            <option value="strict_exclusion">Exclusion stricte</option>
          </select>
          <select className="min-h-12 rounded-md border px-3" name="severity">
            <option value="severe">Sévère</option>
            <option value="life_threatening">Risque vital</option>
            <option value="moderate">Modérée</option>
            <option value="mild">Légère</option>
          </select>
          <Button disabled={isPending} type="submit">
            Ajouter la contrainte
          </Button>
        </form>
      </section>

      <section className="rounded-xl border bg-surface p-5">
        <h2 className="text-xl font-semibold">Préférences apprises</h2>
        <p className="mt-2 text-sm text-muted">
          Elles personnalisent les propositions, sans jamais remplacer une règle
          de sécurité alimentaire.
        </p>
        <ul className="mt-4 grid gap-2">
          {learned.map((item) => (
            <li
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
              key={`${item.subjectKind}:${item.subjectCode}`}
            >
              <span>
                {item.subjectCode} ({item.subjectKind}) :{" "}
                {item.correctedScore ?? item.score}
              </span>
              <span className="flex gap-2">
                <Button
                  disabled={isPending}
                  onClick={() => correctPreference(item, -3)}
                  size="sm"
                  variant="ghost"
                >
                  Je n’aime pas
                </Button>
                <Button
                  disabled={isPending}
                  onClick={() => correctPreference(item, 3)}
                  size="sm"
                  variant="secondary"
                >
                  J’aime
                </Button>
                <Button
                  disabled={isPending}
                  onClick={() => correctPreference(item, null)}
                  size="sm"
                  variant="ghost"
                >
                  Réinitialiser
                </Button>
              </span>
            </li>
          ))}
          {learned.length === 0 ? (
            <li className="text-sm text-muted">
              Goustia n’a pas encore appris de préférence.
            </li>
          ) : null}
        </ul>
      </section>
      <p aria-live="polite" className="min-h-6 text-sm text-muted">
        {message}
      </p>
    </div>
  );
}
