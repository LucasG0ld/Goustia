import Link from "next/link";
import type { Route } from "next";

import { AdminActionButton } from "@/features/admin/admin-action-button";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 25;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const q = params.q?.trim() ?? "";
  const supabase = await createClient();
  let query = supabase
    .from("admin_user_directory")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (q) {
    query = query.or(
      `email.ilike.%${q.replaceAll(",", "")}%,first_name.ilike.%${q.replaceAll(",", "")}%,last_name.ilike.%${q.replaceAll(",", "")}%`,
    );
  }
  const { data: users, count, error } = await query;
  if (error) throw new Error("Annuaire administrateur indisponible.");

  return (
    <main className="mx-auto max-w-7xl px-4 py-8" id="contenu-principal">
      <h1 className="text-3xl font-semibold">Utilisateurs</h1>
      <p className="mt-2 text-muted">
        Vue volontairement limitée à l’identité, l’activité du compte et les
        demandes de suppression.
      </p>
      <form className="mt-5 flex gap-2">
        <input
          aria-label="Rechercher un utilisateur"
          className="min-h-12 flex-1 rounded-md border px-3"
          defaultValue={q}
          name="q"
          placeholder="Nom ou e-mail"
        />
        <button className="rounded-md bg-brand px-4 font-semibold text-white">
          Rechercher
        </button>
      </form>
      <div className="mt-6 overflow-x-auto rounded-xl border bg-surface">
        <table className="w-full min-w-[850px] text-left">
          <thead>
            <tr className="border-b">
              <th className="p-3">Utilisateur</th>
              <th className="p-3">Inscription / dernière connexion</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Suppression</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((user) => (
              <tr className="border-b align-top" key={user.id}>
                <td className="p-3">
                  <strong>
                    {user.first_name} {user.last_name}
                  </strong>
                  <br />
                  <span className="text-sm text-muted">{user.email}</span>
                </td>
                <td className="p-3 text-sm">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString("fr-FR")
                    : "—"}
                  <br />
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString("fr-FR")
                    : "Jamais"}
                </td>
                <td className="p-3">{user.status ?? "active"}</td>
                <td className="p-3">{user.deletion_status ?? "—"}</td>
                <td className="p-3">
                  {user.id && user.status !== "suspended" ? (
                    <AdminActionButton
                      body={{
                        action: "status",
                        status: "suspended",
                        reason: "Suspension depuis l’administration",
                      }}
                      confirmation="SUSPENDRE"
                      endpoint={`/api/v1/admin/users/${user.id}`}
                    >
                      Suspendre
                    </AdminActionButton>
                  ) : user.id ? (
                    <AdminActionButton
                      body={{
                        action: "status",
                        status: "active",
                        reason: "Réactivation depuis l’administration",
                      }}
                      confirmation="REACTIVER"
                      endpoint={`/api/v1/admin/users/${user.id}`}
                    >
                      Réactiver
                    </AdminActionButton>
                  ) : null}
                  {user.id && user.deletion_request_id ? (
                    <AdminActionButton
                      body={{
                        action: "deletion",
                        requestId: user.deletion_request_id,
                        status: "processing",
                      }}
                      confirmation="TRAITER LA SUPPRESSION"
                      endpoint={`/api/v1/admin/users/${user.id}`}
                      variant="ghost"
                    >
                      Traiter la suppression
                    </AdminActionButton>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(users ?? []).length === 0 ? (
        <p className="mt-5 text-muted">Aucun utilisateur trouvé.</p>
      ) : null}
      <nav className="mt-5 flex gap-4" aria-label="Pagination">
        {page > 1 ? (
          <Link
            href={
              `/admin/utilisateurs?q=${encodeURIComponent(q)}&page=${page - 1}` as Route
            }
          >
            Page précédente
          </Link>
        ) : null}
        {page * PAGE_SIZE < (count ?? 0) ? (
          <Link
            href={
              `/admin/utilisateurs?q=${encodeURIComponent(q)}&page=${page + 1}` as Route
            }
          >
            Page suivante
          </Link>
        ) : null}
      </nav>
    </main>
  );
}
