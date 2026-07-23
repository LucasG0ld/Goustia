import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";
import { SignUpForm } from "@/features/auth/auth-forms";

export default function SignUpPage() {
  return (
    <AuthShell
      title="Créer ton compte"
      description="Seulement les informations indispensables. Ton profil alimentaire sera complété progressivement."
      footer={
        <>
          Déjà inscrit ?{" "}
          <Link
            className="font-semibold text-brand underline"
            href="/connexion"
          >
            Se connecter
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
