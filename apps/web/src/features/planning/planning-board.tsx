"use client";

import { addDaysToIsoDate, adjacentIsoWeek } from "@recettes/domain";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Button, EmptyState } from "../../components/ui";
import type {
  MealPlanView,
  PlannedMealView,
} from "../../lib/planning/meal-plan-view";
import { RecipeQuickActions } from "../recipes/recipe-quick-actions";

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
        {meal.recipe ? (
          <Link
            href={{
              pathname: `/recettes/${meal.recipe.recipeId}`,
              query: { repas: meal.id },
            }}
          >
            {meal.recipe.title}
          </Link>
        ) : (
          "Recette en attente"
        )}
      </h3>
      {meal.recipe ? (
        <>
          <p className="mt-1 text-sm text-muted">
            {meal.recipe.durationMinutes} min ·{" "}
            {meal.recipe.recommendationExplanation}
          </p>
          <RecipeQuickActions
            recipeId={meal.recipe.recipeId}
            surface="planning"
          />
        </>
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
  weekStart,
  history,
}: {
  initialPlan: MealPlanView | null;
  recipes: RecipeOption[];
  weekStart: string;
  history: { weekStart: string; status: string }[];
}) {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        addDaysToIsoDate(weekStart, index),
      ),
    [weekStart],
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
      <div>
        <WeekNavigation history={history} weekStart={weekStart} />
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
                        weekStart,
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
              Créer cette semaine
            </Button>
          }
          description="Crée ce planning ou recopie les repas de la semaine précédente."
          title="Aucun planning pour cette semaine"
        />
        <div className="mt-4 text-center">
          <Button
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                try {
                  await requestJson("/api/v1/meal-plans/copy", {
                    method: "POST",
                    body: JSON.stringify({
                      idempotencyKey: crypto.randomUUID(),
                      sourceWeekStart: adjacentIsoWeek(weekStart, "previous"),
                      targetWeekStart: weekStart,
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
            type="button"
            variant="ghost"
          >
            Recopier la semaine précédente
          </Button>
          <p aria-live="polite" className="mt-2 text-sm text-muted">
            {message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <WeekNavigation history={history} weekStart={weekStart} />
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

function WeekNavigation({
  history,
  weekStart,
}: {
  history: { weekStart: string; status: string }[];
  weekStart: string;
}) {
  return (
    <nav
      aria-label="Navigation entre les semaines"
      className="mb-6 flex flex-wrap items-center gap-3"
    >
      <Link
        className="inline-flex min-h-11 items-center rounded-md border px-4 font-semibold"
        href={`/planning?semaine=${adjacentIsoWeek(weekStart, "previous")}`}
      >
        ← Semaine précédente
      </Link>
      <strong className="mr-auto">
        Semaine du{" "}
        {new Date(`${weekStart}T12:00:00Z`).toLocaleDateString("fr-FR")}
      </strong>
      <Link
        className="inline-flex min-h-11 items-center rounded-md border px-4 font-semibold"
        href={`/planning?semaine=${adjacentIsoWeek(weekStart, "next")}`}
      >
        Semaine suivante →
      </Link>
      {history.length > 0 ? (
        <label className="w-full text-sm font-semibold sm:w-auto">
          Historique
          <select
            className="ml-2 min-h-11 rounded-md border bg-surface px-3"
            onChange={(event) => {
              if (event.target.value) {
                window.location.assign(
                  `/planning?semaine=${event.target.value}`,
                );
              }
            }}
            value={
              history.some((item) => item.weekStart === weekStart)
                ? weekStart
                : ""
            }
          >
            <option value="">Choisir…</option>
            {history.map((item) => (
              <option key={item.weekStart} value={item.weekStart}>
                {item.weekStart} · {item.status}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </nav>
  );
}
