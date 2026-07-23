import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Profil | Goustia",
  description: "Ton compte et tes préférences alimentaires.",
};

export default function ProfileHubPage() {
  return (
    <main
      className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6"
      id="contenu-principal"
    >
      <h1 className="text-3xl font-semibold">Profil</h1>
      <p className="mt-2 text-muted">
        Gère séparément ton identité et ton profil culinaire.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          className="rounded-xl border bg-surface p-6 shadow-card hover:border-brand"
          href="/compte"
        >
          <h2 className="text-xl font-semibold">Compte et sécurité</h2>
          <p className="mt-2 text-sm text-muted">
            Identité, e-mail, sessions, export et suppression.
          </p>
        </Link>
        <Link
          className="rounded-xl border bg-surface p-6 shadow-card hover:border-brand"
          href="/profil-alimentaire"
        >
          <h2 className="text-xl font-semibold">Profil alimentaire</h2>
          <p className="mt-2 text-sm text-muted">
            Régime, goûts, durée, budget et matériel.
          </p>
        </Link>
      </div>
    </main>
  );
}
