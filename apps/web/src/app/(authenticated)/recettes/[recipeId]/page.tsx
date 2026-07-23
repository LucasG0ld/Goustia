import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RecipeExperience } from "@/features/recipes/recipe-experience";
import { requireVerifiedUser } from "@/lib/auth/current-user";
import { getRecipeDetail } from "@/lib/recipes/recipe-detail";

export const metadata: Metadata = {
  title: "Recette | Goustia",
  description: "Consulte et cuisine une recette adaptée à ton profil.",
};

export default async function RecipePage({
  params,
  searchParams,
}: {
  params: Promise<{ recipeId: string }>;
  searchParams: Promise<{ repas?: string }>;
}) {
  const user = await requireVerifiedUser();
  const { recipeId } = await params;
  const result = await getRecipeDetail(user.id, recipeId);
  if (result.status === "not_found") notFound();
  if (result.status === "withdrawn") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12" id="contenu-principal">
        <h1 className="text-3xl font-semibold">Recette indisponible</h1>
        <p className="mt-3 text-muted">
          Cette recette a été retirée ou n’est plus publiée.
        </p>
      </main>
    );
  }
  if (result.status === "incompatible") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12" id="contenu-principal">
        <h1 className="text-3xl font-semibold">
          Recette incompatible avec ton profil
        </h1>
        <p className="mt-3 text-muted">
          Par sécurité, son contenu n’est pas affiché. Vérifie tes contraintes
          alimentaires ou choisis une autre recette.
        </p>
      </main>
    );
  }
  if (result.status !== "ready") notFound();
  const { recipe } = result;
  const plannedMealId = (await searchParams).repas ?? null;

  return (
    <main
      className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6"
      id="contenu-principal"
    >
      <article>
        {recipe.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={recipe.imageAlt ?? `Photo illustrative de ${recipe.title}`}
            className="aspect-[16/9] w-full rounded-2xl object-cover"
            height={720}
            src={recipe.imageUrl}
            width={1280}
          />
        ) : (
          <div
            aria-label="Image de recette indisponible"
            className="aspect-[16/9] rounded-2xl bg-surface-muted"
            role="img"
          />
        )}
        <header className="mt-6">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">
            Recette personnalisée
          </p>
          <h1 className="mt-1 text-4xl font-semibold">{recipe.title}</h1>
          <p className="mt-3 max-w-3xl text-lg text-muted">
            {recipe.description}
          </p>
          <dl className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Metric
              label="Préparation"
              value={`${recipe.preparationMinutes} min`}
            />
            <Metric label="Cuisson" value={`${recipe.cookingMinutes} min`} />
            <Metric label="Repos" value={`${recipe.restingMinutes} min`} />
            <Metric label="Difficulté" value={recipe.difficulty} />
            <Metric label="Portions" value={String(recipe.servings)} />
            <Metric
              label="Coût"
              value={
                recipe.estimatedCostEur !== null
                  ? `${recipe.estimatedCostEur.toFixed(2)} €`
                  : (recipe.costLevel ?? "Non renseigné")
              }
            />
          </dl>
        </header>

        <RecipeExperience plannedMealId={plannedMealId} recipe={recipe} />

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <InfoList
            empty="Aucun allergène déclaré."
            items={recipe.allergens}
            title="Allergènes déclarés"
          />
          <InfoList
            empty="Aucun matériel particulier."
            items={recipe.equipment}
            title="Matériel"
          />
          <InfoList
            empty="Aucune substitution proposée."
            items={recipe.substitutions}
            title="Substitutions"
          />
          <InfoList
            empty="Aucune variante proposée."
            items={recipe.variants}
            title="Variantes"
          />
          <InfoList
            empty="Aucune astuce renseignée."
            items={recipe.tips}
            title="Astuces"
          />
          <div className="rounded-xl border p-5">
            <h2 className="text-xl font-semibold">
              Conservation et réchauffage
            </h2>
            <p className="mt-3">
              {recipe.storageInstructions ?? "Conservation non renseignée."}
            </p>
            <p className="mt-2">
              {recipe.reheatingInstructions ?? "Réchauffage non renseigné."}
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-xl border p-5">
          <h2 className="text-xl font-semibold">Nutrition par portion</h2>
          {recipe.nutrition ? (
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-6">
              <Metric
                label="Calories"
                value={`${recipe.nutrition.caloriesKcal} kcal`}
              />
              <Metric
                label="Protéines"
                value={`${recipe.nutrition.proteinG} g`}
              />
              <Metric
                label="Glucides"
                value={`${recipe.nutrition.carbohydratesG} g`}
              />
              <Metric label="Lipides" value={`${recipe.nutrition.fatG} g`} />
              <Metric
                label="Fibres"
                value={`${recipe.nutrition.fiberG ?? "—"} g`}
              />
              <Metric
                label="Sel"
                value={`${recipe.nutrition.saltG ?? "—"} g`}
              />
            </dl>
          ) : (
            <p className="mt-3 text-muted">
              Données nutritionnelles indisponibles.
            </p>
          )}
        </section>
      </article>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-muted p-3">
      <dt className="text-xs font-bold uppercase text-muted">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}

function InfoList({
  empty,
  items,
  title,
}: {
  empty: string;
  items: string[];
  title: string;
}) {
  return (
    <section className="rounded-xl border p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      {items.length > 0 ? (
        <ul className="mt-3 list-disc space-y-2 pl-5">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-muted">{empty}</p>
      )}
    </section>
  );
}
