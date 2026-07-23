import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState, FoodBadge, RecipeCard } from "@/components/ui";
import { ReuseRecipeButton } from "@/features/favorites/reuse-recipe-button";
import { requireVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Favoris | Goustia",
  description: "Recherche et réutilise tes recettes préférées.",
};

const pageSize = 12;

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    duree?: string;
    type?: string;
    statut?: string;
    tri?: string;
    page?: string;
  }>;
}) {
  const user = await requireVerifiedUser();
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page) || 1);
  const supabase = await createClient();
  await supabase.rpc("refresh_user_recipe_eligibility", {
    p_user_id: user.id,
  });
  const { data: favorites } = await supabase
    .from("favorite_recipes")
    .select("recipe_id,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(500);
  const recipeIds = (favorites ?? []).map((favorite) => favorite.recipe_id);
  const [{ data: versions }, { data: eligibility }] = await Promise.all([
    recipeIds.length
      ? supabase
          .from("recipe_versions")
          .select(
            "id,recipe_id,title,description,preparation_minutes,cooking_minutes,difficulty,version_number",
          )
          .in("recipe_id", recipeIds)
          .eq("validation_status", "validated")
          .order("version_number", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    recipeIds.length
      ? supabase
          .from("user_recipe_eligibility")
          .select("recipe_id,eligible,reason")
          .eq("user_id", user.id)
          .in("recipe_id", recipeIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  const latest = new Map<string, NonNullable<typeof versions>[number]>();
  for (const version of versions ?? []) {
    if (!latest.has(version.recipe_id)) latest.set(version.recipe_id, version);
  }
  const query = params.q?.trim().toLocaleLowerCase("fr-FR") ?? "";
  const durationLimit = params.duree === "30" ? 30 : null;
  const difficultyFilter = ["easy", "medium", "advanced"].includes(
    params.type ?? "",
  )
    ? params.type
    : null;
  const statusFilter =
    params.statut === "eligible" || params.statut === "incompatible"
      ? params.statut
      : null;
  const rows = (favorites ?? [])
    .flatMap((favorite) => {
      const version = latest.get(favorite.recipe_id);
      if (!version) return [];
      const status = eligibility?.find(
        (item) => item.recipe_id === favorite.recipe_id,
      );
      return [
        {
          ...version,
          favoriteAt: favorite.created_at,
          duration: version.preparation_minutes + version.cooking_minutes,
          eligible: status?.eligible ?? true,
          reason: status?.reason ?? null,
        },
      ];
    })
    .filter(
      (row) =>
        (!query ||
          row.title.toLocaleLowerCase("fr-FR").includes(query) ||
          row.description.toLocaleLowerCase("fr-FR").includes(query)) &&
        (!durationLimit || row.duration <= durationLimit) &&
        (!difficultyFilter || row.difficulty === difficultyFilter) &&
        (!statusFilter ||
          (statusFilter === "eligible" ? row.eligible : !row.eligible)),
    )
    .sort((left, right) => {
      if (params.tri === "duree") return left.duration - right.duration;
      if (params.tri === "nom")
        return left.title.localeCompare(right.title, "fr");
      if (params.tri === "type")
        return left.difficulty.localeCompare(right.difficulty, "fr");
      return right.favoriteAt.localeCompare(left.favoriteAt);
    });
  const pageRows = rows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  return (
    <main
      className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6"
      id="contenu-principal"
    >
      <h1 className="text-3xl font-semibold">Favoris</h1>
      <form className="mt-6 grid gap-3 rounded-xl border p-4 sm:grid-cols-5">
        <input
          aria-label="Rechercher dans les favoris"
          className="min-h-12 rounded-md border px-3"
          defaultValue={params.q}
          name="q"
          placeholder="Rechercher"
          type="search"
        />
        <select
          aria-label="Filtrer par type"
          className="min-h-12 rounded-md border px-3"
          defaultValue={params.type ?? ""}
          name="type"
        >
          <option value="">Tous les types</option>
          <option value="easy">Facile</option>
          <option value="medium">Intermédiaire</option>
          <option value="advanced">Avancé</option>
        </select>
        <select
          aria-label="Filtrer par durée"
          className="min-h-12 rounded-md border px-3"
          defaultValue={params.duree ?? ""}
          name="duree"
        >
          <option value="">Toutes les durées</option>
          <option value="30">30 minutes maximum</option>
        </select>
        <select
          aria-label="Filtrer par éligibilité"
          className="min-h-12 rounded-md border px-3"
          defaultValue={params.statut ?? ""}
          name="statut"
        >
          <option value="">Tous les statuts</option>
          <option value="eligible">Compatible</option>
          <option value="incompatible">Devenue incompatible</option>
        </select>
        <select
          aria-label="Trier les favoris"
          className="min-h-12 rounded-md border px-3"
          defaultValue={params.tri ?? "date"}
          name="tri"
        >
          <option value="date">Ajout récent</option>
          <option value="duree">Durée</option>
          <option value="nom">Nom</option>
          <option value="type">Type</option>
        </select>
        <button
          className="min-h-12 rounded-md bg-brand px-4 font-semibold text-white sm:col-span-5"
          type="submit"
        >
          Appliquer
        </button>
      </form>
      {pageRows.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            description="Ajoute des recettes aux favoris ou élargis les filtres."
            title="Aucun favori correspondant"
          />
        </div>
      ) : (
        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {pageRows.map((row) => (
            <div key={row.id}>
              <RecipeCard
                badges={
                  <FoodBadge tone={row.eligible ? "positive" : "warning"}>
                    {row.eligible ? "Compatible" : "Incompatible"}
                  </FoodBadge>
                }
                description={row.description}
                difficulty={row.difficulty}
                durationMinutes={row.duration}
                href={`/recettes/${row.recipe_id}`}
                reason={
                  row.eligible
                    ? "Enregistrée dans tes favoris."
                    : `Non éligible : ${eligibilityLabel(row.reason)}.`
                }
                title={row.title}
              />
              <div className="relative z-10 mt-2">
                <ReuseRecipeButton
                  disabled={!row.eligible}
                  recipeVersionId={row.id}
                />
              </div>
            </div>
          ))}
        </section>
      )}
      {totalPages > 1 ? (
        <nav aria-label="Pagination des favoris" className="mt-8 flex gap-3">
          {currentPage > 1 ? (
            <Link
              className="rounded-md border px-4 py-3 font-semibold"
              href={{
                pathname: "/favoris",
                query: { ...params, page: currentPage - 1 },
              }}
            >
              Précédent
            </Link>
          ) : null}
          <span className="px-3 py-3">
            Page {currentPage} sur {totalPages}
          </span>
          {currentPage < totalPages ? (
            <Link
              className="rounded-md border px-4 py-3 font-semibold"
              href={{
                pathname: "/favoris",
                query: { ...params, page: currentPage + 1 },
              }}
            >
              Suivant
            </Link>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}

function eligibilityLabel(reason: string | null) {
  if (reason === "ingredient") return "ingrédient désormais exclu";
  if (reason === "allergen") return "allergène désormais déclaré";
  if (reason === "alcohol") return "alcool non autorisé";
  if (reason === "withdrawn") return "recette retirée";
  return "profil alimentaire modifié";
}
