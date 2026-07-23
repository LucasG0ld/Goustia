"use client";

import { scaleRecipeQuantity } from "@recettes/domain";
import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "../../components/ui";
import type { RecipeDetail } from "../../lib/recipes/recipe-detail";

type RecipeAction =
  | "like"
  | "dislike"
  | "clear_reaction"
  | "favorite"
  | "unfavorite"
  | "cooked"
  | "shopping"
  | "report";

const unitLabels: Record<string, string> = {
  piece: "pièce",
  teaspoon: "c. à café",
  tablespoon: "c. à soupe",
  pinch: "pincée",
  bunch: "bouquet",
  slice: "tranche",
  clove: "gousse",
  to_taste: "selon le goût",
};

export function RecipeExperience({
  recipe,
  plannedMealId,
}: {
  recipe: RecipeDetail;
  plannedMealId: string | null;
}) {
  const [servings, setServings] = useState(recipe.servings);
  const [reaction, setReaction] = useState(recipe.interaction.reaction);
  const [favorite, setFavorite] = useState(recipe.interaction.favorite);
  const [dislikeOpen, setDislikeOpen] = useState(false);
  const [cooking, setCooking] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [timerEnd, setTimerEnd] = useState<number | null>(null);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const wakeLock = useRef<{ release: () => Promise<void> } | null>(null);
  const actionInFlight = useRef(false);
  const storageKey = `goustia:cooking:${recipe.versionId}`;

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;
    let active = true;
    try {
      const state = JSON.parse(stored) as {
        checkedSteps?: number[];
        servings?: number;
        timerEnd?: number | null;
      };
      queueMicrotask(() => {
        if (!active) return;
        setCheckedSteps(state.checkedSteps ?? []);
        setServings(state.servings ?? recipe.servings);
        setTimerEnd(state.timerEnd ?? null);
      });
    } catch {
      localStorage.removeItem(storageKey);
    }
    return () => {
      active = false;
    };
  }, [recipe.servings, storageKey]);

  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ checkedSteps, servings, timerEnd }),
    );
  }, [checkedSteps, servings, storageKey, timerEnd]);

  useEffect(() => {
    if (!timerEnd) return;
    const update = () => {
      const remaining = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));
      setTimerRemaining(remaining);
      if (remaining === 0) setTimerEnd(null);
    };
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [timerEnd]);

  useEffect(
    () => () => {
      void wakeLock.current?.release();
    },
    [],
  );

  const sendAction = async (
    action: RecipeAction,
    extra: Record<string, unknown> = {},
  ) => {
    const response = await fetch(`/api/v1/recipes/${recipe.recipeId}/actions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action,
        idempotencyKey: crypto.randomUUID(),
        surface: "recipe",
        ...extra,
      }),
    });
    if (!response.ok) throw new Error("L’action n’a pas pu être enregistrée.");
  };

  const optimistic = (
    action: RecipeAction,
    apply: () => void,
    rollback: () => void,
    extra?: Record<string, unknown>,
  ) => {
    if (actionInFlight.current) return;
    actionInFlight.current = true;
    apply();
    setMessage(null);
    startTransition(async () => {
      try {
        await sendAction(action, extra);
        setMessage("Action enregistrée. Tu peux l’annuler à tout moment.");
      } catch (error) {
        rollback();
        setMessage(
          error instanceof Error ? error.message : "Erreur inattendue.",
        );
      } finally {
        actionInFlight.current = false;
      }
    });
  };

  return (
    <>
      <section aria-label="Actions sur la recette" className="my-6">
        <div className="flex flex-wrap gap-2">
          <Button
            aria-pressed={reaction === "like"}
            disabled={isPending}
            onClick={() => {
              const previous = reaction;
              const next = reaction === "like" ? null : "like";
              optimistic(
                next ? "like" : "clear_reaction",
                () => setReaction(next),
                () => setReaction(previous),
              );
            }}
            type="button"
            variant={reaction === "like" ? "primary" : "secondary"}
          >
            J’aime
          </Button>
          <Button
            aria-expanded={dislikeOpen}
            aria-pressed={reaction === "dislike"}
            disabled={isPending}
            onClick={() => setDislikeOpen((value) => !value)}
            type="button"
            variant={reaction === "dislike" ? "primary" : "secondary"}
          >
            Je n’aime pas
          </Button>
          <Button
            aria-pressed={favorite}
            disabled={isPending}
            onClick={() => {
              const previous = favorite;
              optimistic(
                favorite ? "unfavorite" : "favorite",
                () => setFavorite(!favorite),
                () => setFavorite(previous),
              );
            }}
            type="button"
            variant={favorite ? "primary" : "secondary"}
          >
            {favorite ? "Dans mes favoris" : "Ajouter aux favoris"}
          </Button>
          {reaction ? (
            <Button
              disabled={isPending}
              onClick={() => {
                const previous = reaction;
                optimistic(
                  "clear_reaction",
                  () => setReaction(null),
                  () => setReaction(previous),
                );
              }}
              type="button"
              variant="ghost"
            >
              Annuler mon avis
            </Button>
          ) : null}
          <Button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await sendAction("shopping", {
                    versionId: recipe.versionId,
                    servings,
                  });
                  setMessage("Ingrédients ajoutés aux courses.");
                } catch (error) {
                  setMessage(
                    error instanceof Error
                      ? error.message
                      : "Erreur inattendue.",
                  );
                }
              })
            }
            type="button"
            variant="secondary"
          >
            Ajouter aux courses
          </Button>
        </div>
        {dislikeOpen ? (
          <form
            className="mt-3 max-w-xl rounded-lg border bg-surface-muted p-4"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const previous = reaction;
              optimistic(
                "dislike",
                () => {
                  setReaction("dislike");
                  setDislikeOpen(false);
                },
                () => setReaction(previous),
                {
                  reason: data.get("reason") || null,
                  reasonDetail: data.get("detail") || null,
                },
              );
            }}
          >
            <label className="font-semibold">
              Pourquoi ? (facultatif)
              <select
                className="mt-1 min-h-11 w-full rounded-md border bg-surface px-3"
                name="reason"
              >
                <option value="">Passer</option>
                <option value="ingredient">Un ingrédient</option>
                <option value="too_long">Trop long</option>
                <option value="too_complex">Trop complexe</option>
                <option value="too_expensive">Trop cher</option>
                <option value="recently_eaten">Mangé récemment</option>
                <option value="dish_type">Ce type de plat</option>
                <option value="other">Autre</option>
              </select>
            </label>
            <label className="mt-3 block font-semibold">
              Précision libre (facultatif)
              <textarea
                className="mt-1 min-h-24 w-full rounded-md border bg-surface p-3"
                maxLength={500}
                name="detail"
              />
            </label>
            <Button className="mt-3" type="submit">
              Enregistrer
            </Button>
          </form>
        ) : null}
        <p aria-live="polite" className="mt-2 min-h-6 text-sm text-muted">
          {message}
        </p>
      </section>

      <section aria-labelledby="ingredients-title" className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold" id="ingredients-title">
            Ingrédients
          </h2>
          <label className="font-semibold">
            Portions{" "}
            <select
              className="min-h-11 rounded-md border bg-surface px-3"
              onChange={(event) => setServings(Number(event.target.value))}
              value={servings}
            >
              {Array.from({ length: 8 }, (_, index) => index + 1).map(
                (value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {recipe.ingredients.map((ingredient) => (
            <li
              className="rounded-lg border bg-surface p-3"
              key={ingredient.id}
            >
              <strong>{ingredient.name}</strong>{" "}
              {scaleRecipeQuantity(
                ingredient.quantity,
                recipe.servings,
                servings,
              )}{" "}
              {ingredient.unit
                ? (unitLabels[ingredient.unit] ?? ingredient.unit)
                : ""}
              {ingredient.note ? ` · ${ingredient.note}` : ""}
              {ingredient.optional ? " · facultatif" : ""}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="steps-title" className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold" id="steps-title">
            Étapes
          </h2>
          <Button
            onClick={async () => {
              const next = !cooking;
              setCooking(next);
              if (next && "wakeLock" in navigator) {
                try {
                  wakeLock.current = await (
                    navigator as Navigator & {
                      wakeLock: {
                        request: () => Promise<{
                          release: () => Promise<void>;
                        }>;
                      };
                    }
                  ).wakeLock.request();
                } catch {
                  setMessage(
                    "Le maintien de l’écran allumé n’est pas disponible.",
                  );
                }
              } else {
                await wakeLock.current?.release();
                wakeLock.current = null;
              }
            }}
            type="button"
          >
            {cooking ? "Quitter le mode cuisine" : "Démarrer le mode cuisine"}
          </Button>
        </div>
        {timerEnd && timerRemaining !== null ? (
          <p aria-live="polite" className="my-4 text-2xl font-bold">
            Minuteur : {Math.floor(timerRemaining / 60)}:
            {String(timerRemaining % 60).padStart(2, "0")}
          </p>
        ) : null}
        <ol className={`mt-4 grid gap-4 ${cooking ? "text-xl" : ""}`}>
          {recipe.steps.map((step) => (
            <li
              className="rounded-xl border bg-surface p-4"
              key={step.position}
            >
              <label className="flex min-h-11 cursor-pointer items-start gap-3">
                <input
                  checked={checkedSteps.includes(step.position)}
                  className="mt-1 size-6"
                  onChange={() =>
                    setCheckedSteps((current) =>
                      current.includes(step.position)
                        ? current.filter((value) => value !== step.position)
                        : [...current, step.position],
                    )
                  }
                  type="checkbox"
                />
                <span>
                  <strong>Étape {step.position}.</strong> {step.instruction}
                </span>
              </label>
              {step.timerSeconds ? (
                <Button
                  className="mt-3"
                  onClick={() =>
                    setTimerEnd(Date.now() + step.timerSeconds! * 1000)
                  }
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  Lancer {Math.ceil(step.timerSeconds / 60)} min
                </Button>
              ) : null}
            </li>
          ))}
        </ol>
        <Button
          className="mt-6"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              try {
                await sendAction("cooked", {
                  versionId: recipe.versionId,
                  servings,
                });
                localStorage.removeItem(storageKey);
                setMessage("Recette marquée comme cuisinée.");
              } catch (error) {
                setMessage(
                  error instanceof Error ? error.message : "Erreur inattendue.",
                );
              }
            })
          }
          type="button"
        >
          J’ai cuisiné cette recette
        </Button>
      </section>

      {plannedMealId ? (
        <SwapPanel plannedMealId={plannedMealId} onMessage={setMessage} />
      ) : null}

      <details className="mt-8 rounded-lg border p-4">
        <summary className="min-h-11 cursor-pointer font-semibold">
          Signaler un problème
        </summary>
        <form
          className="mt-3"
          onSubmit={(event) => {
            event.preventDefault();
            const messageValue = String(
              new FormData(event.currentTarget).get("message"),
            );
            startTransition(async () => {
              try {
                await sendAction("report", { reportMessage: messageValue });
                setMessage("Merci, le signalement a été transmis.");
              } catch (error) {
                setMessage(
                  error instanceof Error ? error.message : "Erreur inattendue.",
                );
              }
            });
          }}
        >
          <textarea
            aria-label="Description du problème"
            className="min-h-28 w-full rounded-md border p-3"
            minLength={10}
            name="message"
            required
          />
          <Button className="mt-2" type="submit">
            Envoyer
          </Button>
        </form>
      </details>
    </>
  );
}

function SwapPanel({
  plannedMealId,
  onMessage,
}: {
  plannedMealId: string;
  onMessage: (message: string) => void;
}) {
  const [alternatives, setAlternatives] = useState<
    {
      recipeVersionId: string;
      recipeId: string;
      title: string;
      explanation: string;
    }[]
  >([]);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
  const [requestContext, setRequestContext] = useState<{
    freeRequest: string | null;
    preserve: {
      calories: boolean;
      protein: boolean;
      budget: boolean;
      duration: boolean;
    };
  } | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <section className="mt-8 rounded-xl border bg-surface-muted p-5">
      <h2 className="text-xl font-semibold">Remplacer ce repas</h2>
      <form
        className="mt-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          const data = new FormData(event.currentTarget);
          const freeRequestValue = data.get("freeRequest");
          const requestBody = {
            plannedMealId,
            freeRequest:
              typeof freeRequestValue === "string" && freeRequestValue
                ? freeRequestValue
                : null,
            preserve: {
              calories: data.get("calories") === "on",
              protein: data.get("protein") === "on",
              budget: data.get("budget") === "on",
              duration: data.get("duration") === "on",
            },
          };
          const response = await fetch("/api/v1/recipe-swaps/alternatives", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(requestBody),
          });
          const body = await response.json().catch(() => ({}));
          setLoading(false);
          if (!response.ok) {
            onMessage(body.message ?? "Aucune alternative sûre disponible.");
            return;
          }
          setAlternatives(body.alternatives);
          setCurrentVersionId(body.currentVersionId);
          setRequestContext(requestBody);
        }}
      >
        <label className="font-semibold">
          Ce que tu souhaites (facultatif)
          <input
            className="mt-1 min-h-11 w-full rounded-md border bg-surface px-3"
            maxLength={500}
            name="freeRequest"
            placeholder="Par exemple : végétarien et rapide"
          />
        </label>
        <fieldset className="mt-3">
          <legend className="font-semibold">À préserver</legend>
          <div className="mt-2 flex flex-wrap gap-4">
            {[
              ["calories", "Calories"],
              ["protein", "Protéines"],
              ["budget", "Budget"],
              ["duration", "Durée"],
            ].map(([name, label]) => (
              <label className="flex min-h-11 items-center gap-2" key={name}>
                <input name={name} type="checkbox" /> {label}
              </label>
            ))}
          </div>
        </fieldset>
        <Button disabled={loading} type="submit">
          {loading ? "Recherche…" : "Proposer 3 alternatives"}
        </Button>
      </form>
      <div className="mt-4 grid gap-3">
        {alternatives.map((alternative) => (
          <article
            className="rounded-lg border bg-surface p-4"
            key={alternative.recipeVersionId}
          >
            <h3 className="font-semibold">{alternative.title}</h3>
            <p className="mt-1 text-sm text-muted">{alternative.explanation}</p>
            <Button
              className="mt-3"
              onClick={async () => {
                const response = await fetch("/api/v1/recipe-swaps", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({
                    plannedMealId,
                    fromRecipeVersionId: currentVersionId,
                    toRecipeVersionId: alternative.recipeVersionId,
                    idempotencyKey: crypto.randomUUID(),
                    freeRequest: requestContext?.freeRequest ?? null,
                    preserve: requestContext?.preserve ?? {
                      calories: false,
                      protein: false,
                      budget: false,
                      duration: false,
                    },
                  }),
                });
                if (!response.ok) {
                  onMessage(
                    "Le remplacement a échoué : le repas initial est conservé.",
                  );
                  return;
                }
                window.location.assign("/planning");
              }}
              size="sm"
              type="button"
            >
              Choisir
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
