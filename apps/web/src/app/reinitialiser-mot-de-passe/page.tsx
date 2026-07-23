import { AuthShell } from "@/components/auth-shell";
import { PasswordUpdateForm } from "@/features/auth/auth-forms";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choisir un nouveau mot de passe"
      description="Ce lien est temporaire et ne peut être utilisé qu’avec une session de récupération valide."
    >
      <PasswordUpdateForm />
    </AuthShell>
  );
}
