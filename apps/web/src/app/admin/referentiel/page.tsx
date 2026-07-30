import { ReferenceEditor } from "@/features/admin/reference-editor";
import { createClient } from "@/lib/supabase/server";

export default async function AdminReferencePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; mapping?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const supabase = await createClient();
  let query = supabase
    .from("ingredients")
    .select(
      "id,name_fr,slug,contains_alcohol,is_active,ingredient_synonyms(name_fr),ingredient_allergens(relation,allergens(name_fr)),ingredient_ciqual_mappings(status,food_code,confidence,rationale_fr)",
    )
    .order("name_fr")
    .limit(100);
  if (q) query = query.ilike("name_fr", `%${q.replaceAll("%", "")}%`);
  const [{ data: ingredients, error }, { data: allergens }] = await Promise.all(
    [query, supabase.from("allergens").select("id,name_fr").order("name_fr")],
  );
  if (error) throw new Error("Référentiel alimentaire indisponible.");
  const rows = (ingredients ?? []).filter((ingredient) => {
    if (params.mapping === "missing") {
      return (
        ingredient.ingredient_ciqual_mappings.length === 0 ||
        ingredient.ingredient_ciqual_mappings.some(
          (mapping) => mapping.status === "unmatched",
        )
      );
    }
    return true;
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8" id="contenu-principal">
      <h1 className="text-3xl font-semibold">Référentiel alimentaire</h1>
      <p className="mt-2 text-muted">
        Les modifications sont confirmées, auditées et limitées aux données
        structurées.
      </p>
      <form className="mt-5 grid gap-2 sm:grid-cols-[1fr_15rem_auto]">
        <input
          aria-label="Rechercher un ingrédient"
          className="min-h-12 rounded-md border px-3"
          defaultValue={q}
          name="q"
          placeholder="Nom de l’ingrédient"
        />
        <select
          className="min-h-12 rounded-md border px-3"
          defaultValue={params.mapping ?? ""}
          name="mapping"
        >
          <option value="">Toutes les correspondances</option>
          <option value="missing">Sans correspondance Ciqual</option>
        </select>
        <button className="rounded-md bg-brand px-4 font-semibold text-white">
          Filtrer
        </button>
      </form>
      <div className="mt-8 grid gap-4">
        {rows.map((ingredient) => (
          <article
            className="rounded-xl border bg-surface p-5"
            key={ingredient.id}
          >
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{ingredient.name_fr}</h2>
                <p className="text-sm text-muted">
                  {ingredient.slug} ·{" "}
                  {ingredient.contains_alcohol
                    ? "contient de l’alcool"
                    : "sans alcool déclaré"}
                </p>
              </div>
              <div className="text-sm">
                <p>
                  Synonymes :{" "}
                  {ingredient.ingredient_synonyms
                    .map((item) => item.name_fr)
                    .join(", ") || "—"}
                </p>
                <p>
                  Allergènes :{" "}
                  {ingredient.ingredient_allergens
                    .map(
                      (item) =>
                        `${item.allergens[0]?.name_fr ?? "?"} (${item.relation})`,
                    )
                    .join(", ") || "—"}
                </p>
                <p>
                  Ciqual :{" "}
                  {ingredient.ingredient_ciqual_mappings
                    .map(
                      (item) =>
                        `${item.food_code ?? "sans code"} · ${item.status}`,
                    )
                    .join(", ") || "à traiter"}
                </p>
              </div>
            </div>
            <ReferenceEditor
              allergens={(allergens ?? []).map((allergen) => ({
                id: allergen.id,
                label: allergen.name_fr,
              }))}
              ingredientId={ingredient.id}
            />
          </article>
        ))}
        {rows.length === 0 ? (
          <p className="rounded-xl border bg-surface p-5 text-muted">
            Aucun ingrédient ne correspond aux filtres.
          </p>
        ) : null}
      </div>
    </main>
  );
}
