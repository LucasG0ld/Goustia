import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";
import { SignInForm } from "@/features/auth/auth-forms";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ retour?: string; compte?: string }>;
}) {
  const query = await searchParams;
  return (
    <AuthShell
      title="Bon retour"
      description={
        query.compte === "supprime"
          ? "Ton compte et tes données ont été supprimés."
          : "Connecte-toi pour retrouver tes repas."
      }
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link
            className="font-semibold text-brand underline"
            href="/inscription"
          >
            S’inscrire
          </Link>
        </>
      }
    >
      <SignInForm returnTo={query.retour} />
      <Link
        className="mt-5 block text-center text-sm font-semibold text-brand underline"
        href="/mot-de-passe-oublie"
      >
        Mot de passe oublié ?
      </Link>
    </AuthShell>
  );
}
