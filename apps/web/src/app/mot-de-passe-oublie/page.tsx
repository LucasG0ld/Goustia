import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";
import { PasswordResetRequestForm } from "@/features/auth/auth-forms";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Réinitialiser ton mot de passe"
      description="Nous t’enverrons un lien sécurisé s’il existe un compte pour cette adresse."
      footer={
        <Link className="font-semibold text-brand underline" href="/connexion">
          Retour à la connexion
        </Link>
      }
    >
      <PasswordResetRequestForm />
    </AuthShell>
  );
}
