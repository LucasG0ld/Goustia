"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui";

const labels: Record<string, string> = {
  cooking_skill: "Quel est ton niveau en cuisine ?",
  max_preparation_time: "Combien de temps veux-tu consacrer à la préparation ?",
  budget: "Quel budget convient le mieux à tes repas ?",
  equipment: "Quels équipements as-tu sous la main ?",
  favorite_cuisines: "Quelles cuisines préfères-tu ?",
};

export function ContextualQuestion({ questionKey }: { questionKey: string }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    void fetch("/api/v1/profile/contextual-question", {
      method: "POST",
      body: JSON.stringify({ questionKey, action: "asked" }),
    });
  }, [questionKey]);
  if (!visible) return null;
  return (
    <aside className="mt-8 rounded-xl border border-brand bg-brand-soft p-5">
      <p className="font-semibold">
        {labels[questionKey] ?? "Complète une préférence utile"}
      </p>
      <p className="mt-1 text-sm text-muted">
        Une seule question secondaire au maximum par semaine, toujours
        facultative.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          className="inline-flex min-h-11 items-center rounded-md bg-brand px-4 font-semibold text-white"
          href="/profil-alimentaire"
        >
          Répondre
        </Link>
        <Button
          onClick={() => {
            setVisible(false);
            void fetch("/api/v1/profile/contextual-question", {
              method: "POST",
              body: JSON.stringify({ questionKey, action: "snoozed" }),
            });
          }}
          variant="ghost"
        >
          Ignorer
        </Button>
      </div>
    </aside>
  );
}
