import Link from "next/link";

import { OnboardingShell } from "@/components/onboarding-shell";
import { Alert, Skeleton } from "@/components/ui";
import { requireVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

export default async function GenerationPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>;
}) {
  const user = await requireVerifiedUser();
  const { job } = await searchParams;
  const supabase = await createClient();
  const { data } = job
    ? await supabase
        .from("ai_generation_jobs")
        .select("status,user_error_message,provider")
        .eq("id", job)
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };
  const ready = data?.status === "succeeded";
  return (
    <OnboardingShell
      currentStep={4}
      title={
        ready
          ? "Ton profil essentiel est prêt"
          : "Nous préparons ta première semaine"
      }
      description="Cette étape peut être rechargée sans relancer la demande. Le fournisseur local est volontairement factice tant que le pipeline de sécurité réel n’est pas validé."
    >
      {ready ? (
        <Alert title="Première génération simulée terminée" tone="success">
          Tes choix sont enregistrés.{" "}
          <Link className="font-semibold underline" href="/compte">
            Accéder à mon compte
          </Link>
        </Alert>
      ) : data?.status === "failed" ? (
        <Alert title="La génération a échoué" tone="danger">
          {data.user_error_message ??
            "Tu peux reprendre l’onboarding sans perdre tes choix."}
        </Alert>
      ) : (
        <div
          aria-live="polite"
          className="grid gap-4 rounded-xl border bg-surface p-6"
        >
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-24 w-full" />
          <p className="text-sm text-muted">
            Tu peux fermer cette page et revenir plus tard.
          </p>
        </div>
      )}
    </OnboardingShell>
  );
}
