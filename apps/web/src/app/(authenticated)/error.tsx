"use client";

import { Button } from "@/components/ui";

export default function AuthenticatedError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      className="mx-auto w-full max-w-3xl px-6 py-16"
      id="contenu-principal"
    >
      <div className="rounded-xl border border-danger bg-danger-soft p-6">
        <h1 className="text-2xl font-semibold">
          Impossible de charger tes repas
        </h1>
        <p className="mt-2 text-muted">
          Tes données sont conservées. Tu peux relancer le chargement.
        </p>
        <Button className="mt-5" onClick={reset}>
          Réessayer
        </Button>
      </div>
    </main>
  );
}
