"use client";

import type { ProgressiveProfile } from "@recettes/domain";
import { useActionState, useState } from "react";

import {
  Alert,
  Button,
  Checkbox,
  SelectField,
  TextField,
} from "@/components/ui";
import { initialActionState } from "@/features/auth/state";

import { saveProgressiveProfileAction } from "./actions";

type Equipment = { id: string; name_fr: string };
type IngredientPreference =
  ProgressiveProfile["ingredientPreferences"][number] & {
    label: string;
  };

export function ProgressiveProfileForm({
  defaults,
  equipment,
}: {
  defaults: ProgressiveProfile & {
    ingredientPreferences: IngredientPreference[];
  };
  equipment: Equipment[];
}) {
  const [state, action, pending] = useActionState(
    saveProgressiveProfileAction,
    initialActionState,
  );
  const [cuisines, setCuisines] = useState(defaults.cuisineCodes);
  const [equipmentIds, setEquipmentIds] = useState(defaults.equipmentIds);
  const [ingredients, setIngredients] = useState<IngredientPreference[]>(
    defaults.ingredientPreferences,
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    Array<{ id: string; label: string; targetType: string }>
  >([]);

  async function search(value: string) {
    setQuery(value);
    if (value.trim().length < 2) return setResults([]);
    const response = await fetch(
      `/api/v1/ingredients/search?q=${encodeURIComponent(value)}`,
    );
    if (response.ok) {
      const payload = await response.json();
      setResults(
        payload.items.filter(
          (item: { targetType: string }) => item.targetType === "ingredient",
        ),
      );
    }
  }

  return (
    <form action={action} className="grid gap-8">
      {state.message ? (
        <Alert
          title={
            state.status === "success"
              ? "Enregistré"
              : "Vérification nécessaire"
          }
          tone={state.status === "success" ? "success" : "danger"}
        >
          {state.message}
        </Alert>
      ) : null}
      <input
        name="cuisineCodes"
        type="hidden"
        value={JSON.stringify(cuisines)}
      />
      <input
        name="equipmentIds"
        type="hidden"
        value={JSON.stringify(equipmentIds)}
      />
      <input
        name="ingredientPreferences"
        type="hidden"
        value={JSON.stringify(
          ingredients.map(({ ingredientId, signal }) => ({
            ingredientId,
            signal,
          })),
        )}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          defaultValue={defaults.dietaryPattern ?? ""}
          label="Style alimentaire"
          name="dietaryPattern"
        >
          <option value="">Non précisé</option>
          <option value="omnivore">Omnivore</option>
          <option value="vegetarian">Végétarien</option>
          <option value="vegan">Végétalien</option>
          <option value="pescatarian">Pescétarien</option>
          <option value="pork_free">Sans porc</option>
        </SelectField>
        <SelectField
          defaultValue={defaults.cookingSkill ?? ""}
          label="Niveau en cuisine"
          name="cookingSkill"
        >
          <option value="">Non précisé</option>
          <option value="beginner">Débutant</option>
          <option value="intermediate">Intermédiaire</option>
          <option value="advanced">Avancé</option>
        </SelectField>
        <TextField
          defaultValue={defaults.maxPreparationMinutes ?? ""}
          label="Temps maximal de préparation"
          max={480}
          min={5}
          name="maxPreparationMinutes"
          type="number"
        />
        <SelectField
          defaultValue={defaults.budgetLevel ?? ""}
          label="Budget"
          name="budgetLevel"
        >
          <option value="">Non précisé</option>
          <option value="low">Économique</option>
          <option value="moderate">Modéré</option>
          <option value="flexible">Flexible</option>
        </SelectField>
      </div>

      <fieldset>
        <legend className="text-lg font-semibold">Cuisines appréciées</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            ["french", "Française"],
            ["italian", "Italienne"],
            ["indian", "Indienne"],
            ["mexican", "Mexicaine"],
            ["maghrebi", "Maghrébine"],
            ["east_asian", "Asie de l’Est"],
          ].map(([code, label]) => (
            <Checkbox
              checked={cuisines.includes(code)}
              key={code}
              label={label}
              onChange={(event) =>
                setCuisines((current) =>
                  event.target.checked
                    ? [...current, code]
                    : current.filter((item) => item !== code),
                )
              }
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-lg font-semibold">
          Équipements disponibles
        </legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {equipment.map((item) => (
            <Checkbox
              checked={equipmentIds.includes(item.id)}
              key={item.id}
              label={item.name_fr}
              onChange={(event) =>
                setEquipmentIds((current) =>
                  event.target.checked
                    ? [...current, item.id]
                    : current.filter((id) => id !== item.id),
                )
              }
            />
          ))}
        </div>
      </fieldset>

      <section>
        <h2 className="text-lg font-semibold">
          Ingrédients aimés ou non aimés
        </h2>
        <p className="mt-1 text-sm text-muted">
          Ces choix restent des préférences et ne bloquent jamais une recette
          pour raison de sécurité.
        </p>
        <input
          className="mt-3 min-h-12 w-full rounded-md border bg-surface px-3"
          onChange={(event) => void search(event.target.value)}
          placeholder="Rechercher un ingrédient"
          type="search"
          value={query}
        />
        <div className="mt-3 grid gap-2">
          {results.map((item) => (
            <div
              className="flex flex-wrap items-center gap-2 rounded-md border p-3"
              key={item.id}
            >
              <span className="mr-auto font-medium">{item.label}</span>
              <Button
                onClick={() =>
                  setIngredients((current) => [
                    ...current.filter(
                      (entry) => entry.ingredientId !== item.id,
                    ),
                    {
                      ingredientId: item.id,
                      label: item.label,
                      signal: "liked",
                    },
                  ])
                }
                size="sm"
                type="button"
                variant="secondary"
              >
                J’aime
              </Button>
              <Button
                onClick={() =>
                  setIngredients((current) => [
                    ...current.filter(
                      (entry) => entry.ingredientId !== item.id,
                    ),
                    {
                      ingredientId: item.id,
                      label: item.label,
                      signal: "disliked",
                    },
                  ])
                }
                size="sm"
                type="button"
                variant="ghost"
              >
                Je n’aime pas
              </Button>
            </div>
          ))}
        </div>
        <ul className="mt-4 grid gap-2">
          {ingredients.map((item) => (
            <li
              className="flex items-center gap-3 rounded-md bg-surface-muted p-3"
              key={item.ingredientId}
            >
              <span className="mr-auto">
                {item.label} — {item.signal === "liked" ? "aimé" : "non aimé"}
              </span>
              <Button
                onClick={() =>
                  setIngredients((current) =>
                    current.filter(
                      (entry) => entry.ingredientId !== item.ingredientId,
                    ),
                  )
                }
                size="sm"
                type="button"
                variant="ghost"
              >
                Corriger
              </Button>
            </li>
          ))}
        </ul>
      </section>
      <Button disabled={pending} type="submit">
        {pending ? "Enregistrement…" : "Enregistrer mon profil"}
      </Button>
    </form>
  );
}
