import Link from "next/link";
import type { ReactNode } from "react";

import { OnboardingProgress } from "./ui";

export function OnboardingShell({
  currentStep,
  title,
  description,
  children,
}: {
  currentStep: number;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main
      className="mx-auto w-full max-w-3xl px-6 py-10"
      id="contenu-principal"
    >
      <Link
        className="text-sm font-bold uppercase tracking-[0.18em] text-brand"
        href="/"
      >
        Goustia
      </Link>
      <div className="mt-8">
        <OnboardingProgress
          currentStep={currentStep}
          label={title}
          totalSteps={4}
        />
      </div>
      <h1 className="mt-8 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-muted">{description}</p>
      <div className="mt-8">{children}</div>
    </main>
  );
}
