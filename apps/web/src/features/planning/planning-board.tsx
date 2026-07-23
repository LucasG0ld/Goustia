"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Button, EmptyState } from "../../components/ui";
import type {
  MealPlanView,
  PlannedMealView,
} from "../../lib/planning/meal-plan-view";

type RecipeOption = {
  recipeVersionId: string;
  recipeId: string;
  title: string;
};

const dayFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "Europe/Paris",
});
const fullDayFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "Europe/Paris",
});

const addDays = (date: string, days: number) => {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
};

const currentMonday = () => {
  const now = new Date();
  const day = now.getUTCDay() || 7;
  now.setUTCDate(now.getUTCDate() - day + 1);
  return now.toISOString().slice(0, 10);
};

async function requestJson(url: string, init: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...init.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      body.message ??
        (body.error === "ai_generation_unavailable"
          ? "La génération IA locale n’est pas activée."
          : "L’opération n’a pas pu être enregistrée."),
    );
  }
  return body;
}

function MealEditor({
  meal,
  plan,
  days,
  mutate,
}: {
  meal: PlannedMealView;
  plan: MealPlanView;
  days: string[];
  mutate: (
    url: string,
    method: "PATCH" | "DELETE",
    body: Record<string, unknown>,
  ) => Promise<void>;
}) {
  return (
    <form
      className="rounded-lg border bg-surface p-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        void mutate(`/api/v1/meal-plans/${plan.id}/meals/${meal.id}`, "PATCH", {
          idempotencyKey: crypto.randomUUID(),
          expectedPlanRevision: plan.revision,
          mealDate: data.get("mealDate"),
          mealType: data.get("mealType"),
          servings: Number(data.get("servings")),
          isLocked: data.get("isLocked") === "on",
        });
      }}
    >
      <h3 className="font-semibold">
        {meal.recipe?.title ?? "Recette en attente"}
      </h3>
      {meal.recipe ? (
        <p className="mt-1 text-sm text-muted">
          {meal.recipe.durationMinutes} min ·{" "}
          {meal.recipe.recommendationExplanation}
        </p>
      ) : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Jour
          <select
            className="mt-1 min-h-11 w-full rounded-md border bg-surface px-3"
            defaultValue={meal.mealDate}
            name="mealDate"
          >
            {days.map((day) => (
              <option key={day} value={day}>
                {fullDayFormatter.format(new Date(`${day}T12:00:00Z`))}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Repas
          <select
            className="mt-1 min-h-11 w-full rounded-md border bg-surface px-3"
            defaultValue={meal.mealType}
            name="mealType"
          >
            <option value="lunch">Déjeuner</option>
            <option value="dinner">Dîner</option>
          </select>
        </label>
        <label className="text-sm font-semibold">
          Portions
          <input
            className="mt-1 min-h-11 w-full rounded-md border bg-surface px-3"
            defaultValue={meal.servings}
            max="8"
            min="1"
            name="servings"
            type="number"
          />
        </label>
        <label className="flex min-h-11 items-center gap-2 self-end text-sm font-semibold">
          <input
            defaultChecked={meal.isLocked}
            name="isLocked"
            type="checkbox"
          />
          Conserver lors d’une régénération
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" type="submit">
          Enregistrer
        </Button>
        <Button
          onClick={() => {
            if (window.confirm("Supprimer ce repas du planning ?")) {
              void mutate(
                `/api/v1/meal-plans/${plan.id}/meals/${meal.id}`,
                "DELETE",
                {
                  idempotencyKey: crypto.randomUUID(),
                  expectedPlanRevision: plan.revision,
                },
              );
            }
          }}
          size="sm"
          type="button"
          variant="ghost"
        >
          Supprimer
        </Button>
      </div>
    </form>
  );
}

export function PlanningBoard({
  initialPlan,
  recipes,
}: {
  initialPlan: MealPlanView | null;
  recipes: RecipeOption[];
}) {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const days = useMemo(
    () =>
      initialPlan
        ? Array.from({ length: 7 }, (_, index) =>
            addDays(initialPlan.weekStart, index),
          )
        : [],
    [initialPlan],
  );

  const mutate = async (
    url: string,
    method: "PATCH" | "DELETE",
    body: Record<string, unknown>,
  ) => {
    setMessage(null);
    try {
      await requestJson(url, { method, body: JSON.stringify(body) });
      setMessage("Planning enregistré.");
      startTransition(() => router.refresh());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur inattendue.");
    }
  };

  if (!initialPlan) {
    return (
      <EmptyState
        action={
          <Button
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                try {
                  await requestJson("/api/v1/meal-plans", {
                    method: "POST",
                    body: JSON.stringify({
                      idempotencyKey: crypto.randomUUID(),
                      weekStart: currentMonday(),
                    }),
                  });
                  router.refresh();
                } catch (error) {
                  setMessage(
                    error instanceof Error
                      ? error.message
                      : "Erreur inattendue.",
                  );
                }
              });
            }}
          >
            Créer ma semaine
          </Button>
        }
        description="Commence par créer le planning de la semaine en cours."
        title="Aucun planning actif"
      />
    );
  }

  return (
    <div>
      <div
        aria-label="Choisir un jour"
        className="flex gap-2 overflow-x-auto pb-2 md:hidden"
        role="tablist"
      >
        {days.map((day, index) => (
          <button
            aria-selected={selectedDay === index}
            className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold ${
              selectedDay === index ? "bg-brand text-white" : "bg-surface"
            }`}
            key={day}
            onClick={() => setSelectedDay(index)}
            role="tab"
            type="button"
          >
            {dayFormatter.format(new Date(`${day}T12:00:00Z`))}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="my-3 min-h-6 text-sm text-muted">
        {isPending ? "Enregistrement…" : message}
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {days.map((day, dayIndex) => {
          const meals = initialPlan.meals.filter(
            ({ mealDate }) => mealDate === day,
          );
          return (
            <section
              aria-labelledby={`day-${day}`}
              className={`rounded-xl border bg-surface-muted p-4 ${
                selectedDay === dayIndex ? "block" : "hidden md:block"
              }`}
              key={day}
              role="tabpanel"
            >
              <h2
                className="text-lg font-semibold capitalize"
                id={`day-${day}`}
              >
                {fullDayFormatter.format(new Date(`${day}T12:00:00Z`))}
              </h2>
              <div className="mt-4 grid gap-3">
                {meals.map((meal) => (
                  <MealEditor
                    days={days}
                    key={meal.id}
                    meal={meal}
                    mutate={mutate}
                    plan={initialPlan}
                  />
                ))}
                {recipes.length > 0 && meals.length < 2 ? (
                  <form
                    className="rounded-lg border border-dashed p-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const data = new FormData(event.currentTarget);
                      void requestJson(
                        `/api/v1/meal-plans/${initialPlan.id}/meals`,
                        {
                          method: "POST",
                          body: JSON.stringify({
                            idempotencyKey: crypto.randomUUID(),
                            expectedPlanRevision: initialPlan.revision,
                            recipeVersionId: data.get("recipeVersionId"),
                            mealDate: day,
                            mealType: data.get("mealType"),
                            servings: Number(data.get("servings")),
                            isLocked: false,
                          }),
                        },
                      )
                        .then(() => {
                          setMessage("Repas ajouté.");
                          startTransition(() => router.refresh());
                        })
                        .catch((error: Error) => setMessage(error.message));
                    }}
                  >
                    <h3 className="font-semibold">Ajouter un repas</h3>
                    <select
                      aria-label="Recette"
                      className="mt-3 min-h-11 w-full rounded-md border bg-surface px-3"
                      name="recipeVersionId"
                    >
                      {recipes.map((recipe) => (
                        <option
                          key={recipe.recipeVersionId}
                          value={recipe.recipeVersionId}
                        >
                          {recipe.title}
                        </option>
                      ))}
                    </select>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <select
                        aria-label="Type de repas"
                        className="min-h-11 rounded-md border bg-surface px-3"
                        name="mealType"
                      >
                        <option value="lunch">Déjeuner</option>
                        <option value="dinner">Dîner</option>
                      </select>
                      <input
                        aria-label="Nombre de portions"
                        className="min-h-11 rounded-md border bg-surface px-3"
                        defaultValue="2"
                        max="8"
                        min="1"
                        name="servings"
                        type="number"
                      />
                    </div>
                    <Button className="mt-3" size="sm" type="submit">
                      Ajouter
                    </Button>
                  </form>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
      <div className="mt-8 rounded-xl border bg-surface p-5">
        <h2 className="font-semibold">Renouveler les suggestions</h2>
        <p className="mt-1 text-sm text-muted">
          Les repas verrouillés sont conservés. Cette action utilise ton quota
          de génération.
        </p>
        <Button
          className="mt-4"
          disabled={
            isPending ||
            initialPlan.status === "generating" ||
            initialPlan.meals.every(({ isLocked }) => isLocked)
          }
          onClick={() => {
            if (
              !window.confirm(
                "Régénérer tous les repas non verrouillés ? Cette action consomme du quota IA.",
              )
            ) {
              return;
            }
            startTransition(async () => {
              try {
                await requestJson(
                  `/api/v1/meal-plans/${initialPlan.id}/regenerate`,
                  {
                    method: "POST",
                    body: JSON.stringify({
                      idempotencyKey: crypto.randomUUID(),
                      expectedPlanRevision: initialPlan.revision,
                    }),
                  },
                );
                setMessage("Régénération lancée.");
                router.refresh();
              } catch (error) {
                setMessage(
                  error instanceof Error ? error.message : "Erreur inattendue.",
                );
              }
            });
          }}
        >
          Régénérer les repas non verrouillés
        </Button>
      </div>
    </div>
  );
}
