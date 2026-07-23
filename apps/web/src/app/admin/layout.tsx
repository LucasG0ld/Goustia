import Link from "next/link";
import type { Route } from "next";

import { requireAdminUser } from "@/lib/auth/admin";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdminUser();
  return (
    <div className="min-h-screen bg-subtle">
      <header className="border-b bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-5 px-4 py-4">
          <Link className="text-xl font-semibold" href={"/admin" as Route}>
            Administration Goustia
          </Link>
          <nav className="flex gap-4" aria-label="Administration">
            <Link
              className="font-semibold text-brand"
              href={"/admin/utilisateurs" as Route}
            >
              Utilisateurs
            </Link>
            <Link
              className="font-semibold text-brand"
              href={"/admin/recettes" as Route}
            >
              Recettes et signalements
            </Link>
            <Link href="/">Retour à l’application</Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
