import type { ReactNode } from "react";

import { cn } from "./utils";

type BadgeTone = "neutral" | "positive" | "warning";

const badgeStyles: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted text-foreground",
  positive: "bg-brand-soft text-brand",
  warning: "bg-warning-soft text-warning",
};

export function FoodBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        badgeStyles[tone],
      )}
    >
      {children}
    </span>
  );
}

export function RecipeCard({
  href,
  title,
  description,
  durationMinutes,
  difficulty,
  badges,
  image,
  imageAlt,
  imageIllustrative = true,
  reason,
}: {
  href: string;
  title: string;
  description: string;
  durationMinutes: number;
  difficulty: string;
  badges?: ReactNode;
  image?: string;
  imageAlt?: string;
  imageIllustrative?: boolean;
  reason?: string;
}) {
  return (
    <article className="relative overflow-hidden rounded-xl border bg-surface shadow-card">
      {image ? (
        <div className="relative">
          {/* A native image keeps the primitive independent from host allow-lists. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={imageAlt ?? ""}
            className="aspect-[4/3] w-full object-cover"
            height="360"
            src={image}
            width="480"
          />
          {imageIllustrative ? (
            <span className="absolute right-2 bottom-2 rounded-full bg-surface/95 px-2 py-1 text-xs font-medium text-muted">
              Image illustrative
            </span>
          ) : null}
        </div>
      ) : (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Illustration générique du plat"
            className="aspect-[4/3] w-full object-cover"
            height="360"
            src="/images/recipe-placeholder.svg"
            width="480"
          />
          <span className="absolute right-2 bottom-2 rounded-full bg-surface/95 px-2 py-1 text-xs font-medium text-muted">
            Image illustrative
          </span>
        </div>
      )}
      <div className="p-5">
        <div className="flex flex-wrap gap-2">{badges}</div>
        <h3 className="mt-3 text-xl font-semibold">
          <a className="rounded-sm after:absolute after:inset-0" href={href}>
            {title}
          </a>
        </h3>
        <p className="mt-2 text-sm text-muted">{description}</p>
        <dl className="mt-4 flex gap-4 text-sm">
          <div>
            <dt className="sr-only">Durée</dt>
            <dd>{durationMinutes} min</dd>
          </div>
          <div>
            <dt className="sr-only">Difficulté</dt>
            <dd>{difficulty}</dd>
          </div>
        </dl>
        {reason ? (
          <p className="mt-4 border-t pt-4 text-sm text-muted">
            <span className="font-semibold text-foreground">Pourquoi ? </span>
            {reason}
          </p>
        ) : null}
      </div>
    </article>
  );
}
