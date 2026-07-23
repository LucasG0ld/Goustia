"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { Button } from "@/components/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="bg-background text-foreground">
        <main
          className="mx-auto grid min-h-screen max-w-xl content-center px-6 py-16"
          id="contenu-principal"
        >
          <h1 className="text-3xl font-semibold">
            Une erreur inattendue est survenue
          </h1>
          <p className="mt-4 text-muted">
            Réessaie. Si le problème persiste, notre suivi technique aidera à le
            diagnostiquer.
          </p>
          <Button className="mt-6 justify-self-start" onClick={reset}>
            Réessayer
          </Button>
        </main>
      </body>
    </html>
  );
}
