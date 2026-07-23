import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPage({
  title,
  version = "2026-07-23-draft.1",
  children,
}: {
  title: string;
  version?: string;
  children: ReactNode;
}) {
  return (
    <main
      className="mx-auto w-full max-w-3xl px-6 py-12"
      id="contenu-principal"
    >
      <Link
        className="text-sm font-bold uppercase tracking-[0.18em] text-brand"
        href="/"
      >
        Goustia
      </Link>
      <p className="mt-8 rounded-lg border border-warning bg-warning-soft p-4 font-semibold">
        Brouillon à faire valider par un professionnel du droit avant toute mise
        en production.
      </p>
      <h1 className="mt-8 text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted">
        Version {version} — mise à jour le 23 juillet 2026
      </p>
      <article className="mt-10 grid gap-8 leading-7 [&_a]:text-brand [&_a]:underline [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:ml-6 [&_ul]:list-disc">
        {children}
      </article>
      <nav
        aria-label="Documents légaux"
        className="mt-12 flex flex-wrap gap-4 border-t pt-6 text-sm"
      >
        <Link href="/confidentialite">Confidentialité</Link>
        <Link href="/conditions-utilisation">Conditions d’utilisation</Link>
        <Link href="/mentions-legales">Mentions légales</Link>
        <Link href="/cookies">Traceurs</Link>
        <Link href="/avertissement">Avertissement nutritionnel</Link>
      </nav>
    </main>
  );
}
