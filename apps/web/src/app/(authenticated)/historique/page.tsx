import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/ui";
import { ReuseRecipeButton } from "@/features/favorites/reuse-recipe-button";
import { requireVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

const getCurrentTimestamp = () => Date.now();

export const metadata: Metadata = {
  title: "Historique | Goustia",
  description: "Recettes proposées, cuisinées et évaluées.",
};

type HistoryKind = "proposed" | "cooked" | "liked" | "disliked" | "swapped";
type HistoryEntry = {
  key: string;
  kind: HistoryKind;
  occurredAt: string;
  recipeId: string;
  recipeVersionId: string;
  title: string;
  eligible: boolean;
  reason: string | null;
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; periode?: string; page?: string }>;
}) {
  const user = await requireVerifiedUser();
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page) || 1);
  const supabase = await createClient();
  await supabase.rpc("refresh_user_recipe_eligibility", {
    p_user_id: user.id,
  });
  const [proposed, cooked, reactions, swaps] = await Promise.all([
    supabase
      .from("planned_meals")
      .select("id,recipe_version_id,created_at")
      .eq("user_id", user.id)
      .not("recipe_version_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(300),
    supabase
      .from("cooked_recipes")
      .select("id,recipe_version_id,cooked_at")
      .eq("user_id", user.id)
      .order("cooked_at", { ascending: false })
      .limit(300),
    supabase
      .from("recipe_reaction_events")
      .select("id,recipe_id,reaction,occurred_at")
      .eq("user_id", user.id)
      .order("occurred_at", { ascending: false })
      .limit(300),
    supabase
      .from("recipe_swaps")
      .select("id,from_recipe_version_id,requested_at")
      .eq("user_id", user.id)
      .order("requested_at", { ascending: false })
      .limit(300),
  ]);
  const versionIds = [
    ...(proposed.data ?? []).flatMap((row) =>
      row.recipe_version_id ? [row.recipe_version_id] : [],
    ),
    ...(cooked.data ?? []).map((row) => row.recipe_version_id),
    ...(swaps.data ?? []).map((row) => row.from_recipe_version_id),
  ];
  const recipeIdsFromReactions = (reactions.data ?? []).map(
    (row) => row.recipe_id,
  );
  const { data: versions } = versionIds.length
    ? await supabase
        .from("recipe_versions")
        .select("id,recipe_id,title,version_number")
        .in("id", [...new Set(versionIds)])
    : { data: [] };
  const missingRecipeIds = recipeIdsFromReactions.filter(
    (id) => !(versions ?? []).some((version) => version.recipe_id === id),
  );
  const { data: reactionVersions } = missingRecipeIds.length
    ? await supabase
        .from("recipe_versions")
        .select("id,recipe_id,title,version_number")
        .in("recipe_id", [...new Set(missingRecipeIds)])
        .eq("validation_status", "validated")
        .order("version_number", { ascending: false })
    : { data: [] };
  const allVersions = [...(versions ?? []), ...(reactionVersions ?? [])];
  const byVersion = new Map(
    allVersions.map((version) => [version.id, version]),
  );
  const byRecipe = new Map<string, (typeof allVersions)[number]>();
  for (const version of allVersions.sort(
    (a, b) => b.version_number - a.version_number,
  )) {
    if (!byRecipe.has(version.recipe_id))
      byRecipe.set(version.recipe_id, version);
  }
  const allRecipeIds = [
    ...new Set(allVersions.map((version) => version.recipe_id)),
  ];
  const { data: eligibility } = allRecipeIds.length
    ? await supabase
        .from("user_recipe_eligibility")
        .select("recipe_id,eligible,reason")
        .eq("user_id", user.id)
        .in("recipe_id", allRecipeIds)
    : { data: [] };
  const statusFor = (recipeId: string) =>
    eligibility?.find((item) => item.recipe_id === recipeId);
  const fromVersion = (
    key: string,
    kind: HistoryKind,
    occurredAt: string,
    versionId: string,
  ): HistoryEntry[] => {
    const version = byVersion.get(versionId);
    if (!version) return [];
    const status = statusFor(version.recipe_id);
    return [
      {
        key,
        kind,
        occurredAt,
        recipeId: version.recipe_id,
        recipeVersionId: version.id,
        title: version.title,
        eligible: status?.eligible ?? true,
        reason: status?.reason ?? null,
      },
    ];
  };
  const entries: HistoryEntry[] = [
    ...(proposed.data ?? []).flatMap((row) =>
      row.recipe_version_id
        ? fromVersion(row.id, "proposed", row.created_at, row.recipe_version_id)
        : [],
    ),
    ...(cooked.data ?? []).flatMap((row) =>
      fromVersion(row.id, "cooked", row.cooked_at, row.recipe_version_id),
    ),
    ...(swaps.data ?? []).flatMap((row) =>
      fromVersion(
        row.id,
        "swapped",
        row.requested_at,
        row.from_recipe_version_id,
      ),
    ),
    ...(reactions.data ?? []).flatMap((row) => {
      const version = byRecipe.get(row.recipe_id);
      if (!version) return [];
      const status = statusFor(row.recipe_id);
      return [
        {
          key: row.id,
          kind: row.reaction === "like" ? "liked" : "disliked",
          occurredAt: row.occurred_at,
          recipeId: row.recipe_id,
          recipeVersionId: version.id,
          title: version.title,
          eligible: status?.eligible ?? true,
          reason: status?.reason ?? null,
        } satisfies HistoryEntry,
      ];
    }),
  ];
  const periodDays =
    params.periode === "30" ? 30 : params.periode === "90" ? 90 : null;
  const threshold = periodDays
    ? getCurrentTimestamp() - periodDays * 86_400_000
    : Number.NEGATIVE_INFINITY;
  const filtered = entries
    .filter(
      (entry) =>
        (!params.type || entry.kind === params.type) &&
        Date.parse(entry.occurredAt) >= threshold,
    )
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const pageSize = 20;
  const pageRows = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <main
      className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6"
      id="contenu-principal"
    >
      <h1 className="text-3xl font-semibold">Historique</h1>
      <form className="mt-6 flex flex-wrap gap-3 rounded-xl border p-4">
        <select
          aria-label="Type d’événement"
          className="min-h-12 rounded-md border px-3"
          defaultValue={params.type ?? ""}
          name="type"
        >
          <option value="">Toutes les activités</option>
          <option value="proposed">Proposées</option>
          <option value="cooked">Cuisinées</option>
          <option value="liked">Aimées</option>
          <option value="disliked">Non aimées</option>
          <option value="swapped">Remplacées</option>
        </select>
        <select
          aria-label="Période"
          className="min-h-12 rounded-md border px-3"
          defaultValue={params.periode ?? ""}
          name="periode"
        >
          <option value="">Toute la période</option>
          <option value="30">30 derniers jours</option>
          <option value="90">90 derniers jours</option>
        </select>
        <button className="min-h-12 rounded-md bg-brand px-4 font-semibold text-white">
          Filtrer
        </button>
      </form>
      {pageRows.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            description="Tes propositions et interactions apparaîtront ici."
            title="Aucune activité"
          />
        </div>
      ) : (
        <ol className="mt-8 grid gap-3">
          {pageRows.map((entry) => (
            <li
              className="rounded-xl border bg-surface p-4"
              key={`${entry.kind}-${entry.key}`}
            >
              <div className="flex flex-wrap items-start gap-3">
                <div className="mr-auto">
                  <p className="text-sm font-semibold text-brand">
                    {kindLabel(entry.kind)} ·{" "}
                    {new Date(entry.occurredAt).toLocaleDateString("fr-FR")}
                  </p>
                  <Link
                    className="mt-1 block text-lg font-semibold"
                    href={`/recettes/${entry.recipeId}`}
                  >
                    {entry.title}
                  </Link>
                  {!entry.eligible ? (
                    <p className="mt-1 text-sm text-warning">
                      Plus éligible : {entry.reason ?? "profil modifié"}.
                    </p>
                  ) : null}
                </div>
                <ReuseRecipeButton
                  disabled={!entry.eligible}
                  recipeVersionId={entry.recipeVersionId}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
      {totalPages > 1 ? (
        <nav
          aria-label="Pagination de l’historique"
          className="mt-8 flex gap-3"
        >
          {currentPage > 1 ? (
            <Link
              className="rounded-md border px-4 py-3"
              href={{
                pathname: "/historique",
                query: { ...params, page: currentPage - 1 },
              }}
            >
              Précédent
            </Link>
          ) : null}
          <span className="py-3">
            Page {currentPage} sur {totalPages}
          </span>
          {currentPage < totalPages ? (
            <Link
              className="rounded-md border px-4 py-3"
              href={{
                pathname: "/historique",
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

function kindLabel(kind: HistoryKind) {
  return {
    proposed: "Proposée",
    cooked: "Cuisinée",
    liked: "Aimée",
    disliked: "Non aimée",
    swapped: "Remplacée",
  }[kind];
}
