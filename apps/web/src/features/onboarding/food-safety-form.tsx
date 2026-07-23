"use client";

import type { FoodSafetyStep } from "@recettes/domain";
import { useActionState, useState } from "react";

import { Alert, Button, Checkbox, SelectField } from "@/components/ui";
import { initialActionState } from "@/features/auth/state";

import { saveFoodSafetyAction } from "./actions";
import { markOnboardingStepSubmitted } from "./step-tracker";

type SearchItem = {
  id: string;
  label: string;
  targetType: "ingredient" | "allergen";
  containsAlcohol?: boolean;
};

export function FoodSafetyForm({ commonItems }: { commonItems: SearchItem[] }) {
  const [state, action, pending] = useActionState(
    saveFoodSafetyAction,
    initialActionState,
  );
  const [selected, setSelected] = useState<FoodSafetyStep["constraints"]>([]);
  const [noConstraints, setNoConstraints] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);

  async function search(value: string) {
    setQuery(value);
    if (value.trim().length < 2) return setResults([]);
    const response = await fetch(
      `/api/v1/ingredients/search?q=${encodeURIComponent(value)}`,
    );
    if (response.ok) setResults((await response.json()).items);
  }

  function add(item: SearchItem) {
    if (
      selected.some(
        (entry) =>
          entry.targetId === item.id && entry.targetType === item.targetType,
      )
    )
      return;
    setNoConstraints(false);
    setSelected((current) => [
      ...current,
      {
        targetId: item.id,
        targetType: item.targetType,
        label: item.label,
        kind: "allergy",
        severity: "severe",
      },
    ]);
  }

  return (
    <form
      action={action}
      className="grid gap-7"
      onSubmit={markOnboardingStepSubmitted}
    >
      {state.message ? (
        <Alert title="Vérification nécessaire" tone="danger">
          {state.message}
        </Alert>
      ) : null}
      <input
        name="constraints"
        type="hidden"
        value={JSON.stringify(selected)}
      />
      <input name="noConstraints" type="hidden" value={String(noConstraints)} />

      <section className="rounded-xl border bg-surface p-5">
        <label className="font-semibold" htmlFor="ingredient-search">
          Rechercher un ingrédient ou allergène
        </label>
        <input
          className="mt-2 min-h-12 w-full rounded-md border bg-surface px-3"
          id="ingredient-search"
          onChange={(event) => void search(event.target.value)}
          placeholder="Ex. lait, arachide, gluten…"
          type="search"
          value={query}
        />
        <div aria-live="polite" className="mt-3 grid gap-2">
          {results.map((item) => (
            <button
              className="rounded-md border p-3 text-left hover:bg-brand-soft"
              key={`${item.targetType}-${item.id}`}
              onClick={() => add(item)}
              type="button"
            >
              {item.label}{" "}
              <span className="text-sm text-muted">
                — {item.targetType === "allergen" ? "allergène" : "ingrédient"}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold">Suggestions fréquentes</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {commonItems.map((item) => (
            <button
              className="min-h-11 rounded-full border bg-surface px-4 hover:bg-brand-soft"
              key={`${item.targetType}-${item.id}`}
              onClick={() => add(item)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {selected.length ? (
        <section className="grid gap-4">
          <h2 className="text-xl font-semibold">Contraintes à confirmer</h2>
          {selected.map((item, index) => (
            <div
              className="grid gap-3 rounded-xl border bg-surface p-4 sm:grid-cols-[1fr_12rem_12rem_auto]"
              key={`${item.targetType}-${item.targetId}`}
            >
              <p className="font-semibold">{item.label}</p>
              <SelectField
                aria-label={`Type pour ${item.label}`}
                label="Type"
                value={item.kind}
                onChange={(event) =>
                  setSelected((current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index
                        ? {
                            ...entry,
                            kind: event.target.value as typeof entry.kind,
                          }
                        : entry,
                    ),
                  )
                }
              >
                <option value="allergy">Allergie</option>
                <option value="intolerance">Intolérance</option>
                <option value="strict_exclusion">Interdiction stricte</option>
              </SelectField>
              <SelectField
                aria-label={`Sévérité pour ${item.label}`}
                label="Sévérité"
                value={item.severity}
                onChange={(event) =>
                  setSelected((current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index
                        ? {
                            ...entry,
                            severity: event.target
                              .value as typeof entry.severity,
                          }
                        : entry,
                    ),
                  )
                }
              >
                <option value="mild">Faible</option>
                <option value="moderate">Modérée</option>
                <option value="severe">Sévère</option>
              </SelectField>
              <Button
                onClick={() =>
                  setSelected((current) =>
                    current.filter((_, entryIndex) => entryIndex !== index),
                  )
                }
                type="button"
                variant="ghost"
              >
                Retirer
              </Button>
            </div>
          ))}
        </section>
      ) : null}

      <Checkbox
        checked={noConstraints}
        description="Choisis cette option uniquement si tu n’as aucune allergie, intolérance ou interdiction."
        label="Je n’ai aucune contrainte alimentaire"
        onChange={(event) => {
          setNoConstraints(event.target.checked);
          if (event.target.checked) setSelected([]);
        }}
      />
      <Alert title="Sécurité ≠ préférence" tone="warning">
        Une allergie ou interdiction bloque une recette. Un aliment que tu
        n’aimes pas sera ajouté plus tard comme préférence corrigible.
      </Alert>
      <Checkbox
        label="J’ai relu cette liste et je confirme qu’elle est complète à ma connaissance."
        name="confirmed"
        required
      />
      <Button
        disabled={pending || (!noConstraints && selected.length === 0)}
        type="submit"
      >
        {pending ? "Enregistrement sécurisé…" : "Confirmer et continuer"}
      </Button>
    </form>
  );
}
