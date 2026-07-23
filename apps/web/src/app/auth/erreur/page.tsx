import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";
import { Alert } from "@/components/ui";

export default function AuthErrorPage() {
  return (
    <AuthShell
      title="Lien invalide ou expiré"
      description="La vérification n’a pas abouti."
    >
      <Alert title="Nouveau lien nécessaire" tone="danger">
        Demande un nouveau lien ou recommence l’inscription.
      </Alert>
      <Link
        className="mt-6 block text-center font-semibold text-brand underline"
        href="/connexion"
      >
        Retour à la connexion
      </Link>
    </AuthShell>
  );
}
