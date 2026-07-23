import Link from "next/link";
import type { Route } from "next";

export default function AdminHomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8" id="contenu-principal">
      <h1 className="text-3xl font-semibold">Administration</h1>
      <p className="mt-2 text-muted">
        Les actions sensibles sont confirmées, réversibles quand possible et
        inscrites dans le journal d’audit.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          className="rounded-xl border bg-surface p-6"
          href={"/admin/utilisateurs" as Route}
        >
          <h2 className="text-xl font-semibold">Utilisateurs</h2>
          <p className="mt-2">Statuts de compte et demandes de suppression.</p>
        </Link>
        <Link
          className="rounded-xl border bg-surface p-6"
          href={"/admin/recettes" as Route}
        >
          <h2 className="text-xl font-semibold">Contenu</h2>
          <p className="mt-2">
            Validation, versions, signalements et blocages.
          </p>
        </Link>
      </div>
    </main>
  );
}
