import Link from "next/link";
import type { Route } from "next";

import { AdminActionButton } from "@/features/admin/admin-action-button";
import { FoodRuleForm } from "@/features/admin/food-rule-form";
import { RecipeRevisionForm } from "@/features/admin/recipe-revision-form";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 20;

export default async function AdminRecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim().toLocaleLowerCase("fr") ?? "";
  const status = params.status ?? "all";
  const page = Math.max(1, Number(params.page) || 1);
  const supabase = await createClient();
  const [versionsResult, reportsResult, ingredientsResult, rulesResult] =
    await Promise.all([
      supabase
        .from("recipe_versions")
        .select(
          "id,recipe_id,version_number,title,description,validation_status,publication_status,validation_notes,updated_at",
        )
        .order("updated_at", { ascending: false })
        .limit(500),
      supabase
        .from("content_reports")
        .select("id,kind,status,user_message,recipe_id,created_at")
        .in("status", ["open", "investigating"])
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("ingredients")
        .select("id,name_fr")
        .order("name_fr")
        .limit(300),
      supabase
        .from("blocked_food_rules")
        .select("id,ingredient_id,paired_ingredient_id,reason,active")
        .order("created_at", { ascending: false }),
    ]);
  if (versionsResult.error) {
    throw new Error("Le catalogue administrateur est indisponible.");
  }
  const latestByRecipe = new Map<
    string,
    NonNullable<typeof versionsResult.data>[number]
  >();
  for (const version of versionsResult.data ?? []) {
    if (!latestByRecipe.has(version.recipe_id)) {
      latestByRecipe.set(version.recipe_id, version);
    }
  }
  const filtered = [...latestByRecipe.values()].filter(
    (version) =>
      (!q ||
        version.title.toLocaleLowerCase("fr").includes(q) ||
        version.recipe_id.includes(q)) &&
      (status === "all" ||
        version.validation_status === status ||
        version.publication_status === status),
  );
  const versions = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const ingredientNames = new Map(
    (ingredientsResult.data ?? []).map((item) => [item.id, item.name_fr]),
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8" id="contenu-principal">
      <h1 className="text-3xl font-semibold">Recettes et signalements</h1>
      <form className="mt-5 grid gap-2 sm:grid-cols-[1fr_14rem_auto]">
        <input
          aria-label="Rechercher une recette"
          className="min-h-12 rounded-md border px-3"
          defaultValue={params.q}
          name="q"
          placeholder="Titre ou identifiant"
        />
        <select
          className="min-h-12 rounded-md border px-3"
          defaultValue={status}
          name="status"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">À valider</option>
          <option value="validated">Validée</option>
          <option value="rejected">Rejetée</option>
          <option value="published">Publiée</option>
          <option value="archived">Dépubliée</option>
        </select>
        <button className="rounded-md bg-brand px-4 font-semibold text-white">
          Filtrer
        </button>
      </form>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold">Catalogue</h2>
        <div className="mt-4 grid gap-4">
          {versions.map((version) => (
            <article
              className="rounded-xl border bg-surface p-5"
              key={version.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold">{version.title}</h3>
                  <p className="text-sm text-muted">
                    Version {version.version_number} · validation{" "}
                    {version.validation_status} · publication{" "}
                    {version.publication_status}
                  </p>
                  {version.validation_notes ? (
                    <p className="mt-2 rounded-md bg-warning-soft p-2 text-sm">
                      {version.validation_notes}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {version.validation_status === "pending" ? (
                    <>
                      <AdminActionButton
                        body={{
                          action: "review",
                          versionId: version.id,
                          approve: true,
                          notes:
                            "Structure et contenu revérifiés avant publication.",
                        }}
                        confirmation="VALIDER"
                        endpoint={`/api/v1/admin/recipes/${version.recipe_id}`}
                      >
                        Valider
                      </AdminActionButton>
                      <AdminActionButton
                        body={{
                          action: "review",
                          versionId: version.id,
                          approve: false,
                          notes: "Révision demandée par l’administration.",
                        }}
                        confirmation="REJETER"
                        endpoint={`/api/v1/admin/recipes/${version.recipe_id}`}
                        variant="ghost"
                      >
                        Rejeter
                      </AdminActionButton>
                    </>
                  ) : null}
                  {version.validation_status === "validated" &&
                  version.publication_status !== "published" ? (
                    <AdminActionButton
                      body={{ action: "publish", versionId: version.id }}
                      confirmation="PUBLIER"
                      endpoint={`/api/v1/admin/recipes/${version.recipe_id}`}
                    >
                      Publier
                    </AdminActionButton>
                  ) : null}
                  {version.publication_status === "published" ? (
                    <AdminActionButton
                      body={{ action: "unpublish", versionId: version.id }}
                      confirmation="DEPUBLIER"
                      endpoint={`/api/v1/admin/recipes/${version.recipe_id}`}
                    >
                      Dépublier
                    </AdminActionButton>
                  ) : null}
                  <AdminActionButton
                    body={{}}
                    confirmation="REGENERER"
                    endpoint={`/api/v1/admin/recipes/${version.recipe_id}/image`}
                    variant="ghost"
                  >
                    Régénérer l’image
                  </AdminActionButton>
                </div>
              </div>
              <RecipeRevisionForm
                description={version.description}
                recipeId={version.recipe_id}
                title={version.title}
                versionId={version.id}
              />
            </article>
          ))}
          {versions.length === 0 ? (
            <p className="rounded-xl border bg-surface p-5 text-muted">
              Aucune recette ne correspond aux filtres.
            </p>
          ) : null}
        </div>
        <nav className="mt-5 flex gap-4" aria-label="Pagination des recettes">
          {page > 1 ? (
            <Link
              href={
                `/admin/recettes?q=${encodeURIComponent(params.q ?? "")}&status=${status}&page=${page - 1}` as Route
              }
            >
              Page précédente
            </Link>
          ) : null}
          {page * PAGE_SIZE < filtered.length ? (
            <Link
              href={
                `/admin/recettes?q=${encodeURIComponent(params.q ?? "")}&status=${status}&page=${page + 1}` as Route
              }
            >
              Page suivante
            </Link>
          ) : null}
        </nav>
      </section>

      <section className="mt-12 rounded-xl border bg-surface p-5">
        <h2 className="text-2xl font-semibold">Signalements ouverts</h2>
        <ul className="mt-4 grid gap-3">
          {(reportsResult.data ?? []).map((report) => (
            <li className="rounded-lg border p-3" key={report.id}>
              <strong>{report.kind}</strong> — {report.user_message}
              <p className="text-sm text-muted">Statut : {report.status}</p>
              <div className="mt-2 flex gap-2">
                <AdminActionButton
                  body={{ status: "investigating" }}
                  confirmation="TRAITER"
                  endpoint={`/api/v1/admin/reports/${report.id}`}
                >
                  Prendre en charge
                </AdminActionButton>
                <AdminActionButton
                  body={{ status: "resolved" }}
                  confirmation="TRAITER"
                  endpoint={`/api/v1/admin/reports/${report.id}`}
                >
                  Résoudre
                </AdminActionButton>
                <AdminActionButton
                  body={{ status: "dismissed" }}
                  confirmation="TRAITER"
                  endpoint={`/api/v1/admin/reports/${report.id}`}
                  variant="ghost"
                >
                  Classer
                </AdminActionButton>
              </div>
            </li>
          ))}
          {(reportsResult.data ?? []).length === 0 ? (
            <li className="text-muted">Aucun signalement en attente.</li>
          ) : null}
        </ul>
      </section>

      <section className="mt-8 rounded-xl border border-danger bg-surface p-5">
        <h2 className="text-2xl font-semibold">
          Ingrédients et associations bloqués
        </h2>
        <p className="mt-2 text-sm text-muted">
          Toute publication est revalidée contre les règles actives.
        </p>
        <FoodRuleForm
          ingredients={(ingredientsResult.data ?? []).map((item) => ({
            id: item.id,
            label: item.name_fr,
          }))}
        />
        <ul className="mt-5 grid gap-2">
          {(rulesResult.data ?? []).map((rule) => (
            <li
              className="flex flex-wrap justify-between gap-3 rounded-lg border p-3"
              key={rule.id}
            >
              <span>
                {ingredientNames.get(rule.ingredient_id) ?? rule.ingredient_id}
                {rule.paired_ingredient_id
                  ? ` + ${ingredientNames.get(rule.paired_ingredient_id) ?? rule.paired_ingredient_id}`
                  : ""}{" "}
                — {rule.reason} ({rule.active ? "actif" : "inactif"})
              </span>
              {rule.active ? (
                <AdminActionButton
                  body={{
                    ruleId: rule.id,
                    ingredientId: rule.ingredient_id,
                    pairedIngredientId: rule.paired_ingredient_id,
                    reason: rule.reason,
                    active: false,
                  }}
                  confirmation="CONFIRMER LE BLOCAGE"
                  endpoint="/api/v1/admin/food-rules"
                  variant="ghost"
                >
                  Désactiver
                </AdminActionButton>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
