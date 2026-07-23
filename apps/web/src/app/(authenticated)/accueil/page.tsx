import type { Metadata } from "next";
import Link from "next/link";

import { Alert, EmptyState, FoodBadge, RecipeCard } from "@/components/ui";
import { requireVerifiedUser } from "@/lib/auth/current-user";
import { getActiveMealPlanView } from "@/lib/planning/meal-plan-view";

export const metadata: Metadata = {
  title: "Accueil | Goustia",
  description: "Les recettes personnalisées de ta semaine.",
};

const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Paris",
  }).format(new Date(`${value}T12:00:00+02:00`));

export default async function HomePage() {
  const user = await requireVerifiedUser();
  const plan = await getActiveMealPlanView(user.id);
  return (
    <main
      className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6"
      id="contenu-principal"
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">
            Ta semaine
          </p>
          <h1 className="mt-1 text-3xl font-semibold">
            {plan
              ? `Semaine du ${dateLabel(plan.weekStart)}`
              : "Tes prochains repas"}
          </h1>
        </div>
        <Link
          className="inline-flex min-h-12 items-center rounded-md border bg-surface px-4 font-semibold hover:bg-surface-muted"
          href="/planning"
        >
          Voir le planning
        </Link>
      </header>

      {plan?.status === "generating" ? (
        <Alert className="mt-6" title="Génération en cours">
          Les recettes prêtes apparaissent immédiatement. Les repas verrouillés
          restent inchangés.
        </Alert>
      ) : null}

      {!plan || plan.meals.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            action={
              <Link className="font-semibold underline" href="/planning">
                Préparer ma semaine
              </Link>
            }
            description="Crée ton planning puis ajoute ou génère tes premiers repas."
            title="Ta semaine est encore vide"
          />
        </div>
      ) : (
        <section
          aria-labelledby="weekly-recipes"
          className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          <h2 className="sr-only" id="weekly-recipes">
            Recettes de la semaine
          </h2>
          {plan.meals.map((meal) =>
            meal.recipe ? (
              <div key={meal.id}>
                <p className="mb-2 text-sm font-semibold capitalize text-muted">
                  {dateLabel(meal.mealDate)} ·{" "}
                  {meal.mealType === "lunch" ? "Déjeuner" : "Dîner"}
                </p>
                <RecipeCard
                  badges={
                    <>
                      {meal.recipe.tags.slice(0, 3).map((tag) => (
                        <FoodBadge key={tag}>{tag}</FoodBadge>
                      ))}
                      <FoodBadge tone="positive">
                        {meal.servings} portion{meal.servings > 1 ? "s" : ""}
                      </FoodBadge>
                    </>
                  }
                  description={meal.recipe.description}
                  difficulty={
                    meal.recipe.difficulty === "easy"
                      ? "Facile"
                      : meal.recipe.difficulty === "medium"
                        ? "Intermédiaire"
                        : "Avancée"
                  }
                  durationMinutes={meal.recipe.durationMinutes}
                  href={`/recettes/${meal.recipe.recipeId}`}
                  image={meal.recipe.imageUrl ?? undefined}
                  imageAlt={meal.recipe.imageAlt ?? undefined}
                  reason={meal.recipe.recommendationExplanation}
                  title={meal.recipe.title}
                />
                {meal.recipe.caloriesKcal !== null ? (
                  <p className="mt-2 text-xs text-muted">
                    Estimation par portion :{" "}
                    {Math.round(meal.recipe.caloriesKcal)} kcal ·{" "}
                    {Math.round(meal.recipe.proteinG ?? 0)} g protéines ·{" "}
                    {Math.round(meal.recipe.carbohydratesG ?? 0)} g glucides ·{" "}
                    {Math.round(meal.recipe.fatG ?? 0)} g lipides
                  </p>
                ) : null}
              </div>
            ) : null,
          )}
        </section>
      )}
    </main>
  );
}
