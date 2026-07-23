import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main
      className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-12"
      id="contenu-principal"
    >
      <Link
        className="mb-8 text-sm font-bold uppercase tracking-[0.18em] text-brand"
        href="/"
      >
        Goustia
      </Link>
      <section className="rounded-xl border bg-surface p-6 shadow-card sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted">{description}</p>
        <div className="mt-8">{children}</div>
      </section>
      {footer ? (
        <div className="mt-6 text-center text-sm text-muted">{footer}</div>
      ) : null}
    </main>
  );
}
