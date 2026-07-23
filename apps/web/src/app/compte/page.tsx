import { randomUUID } from "node:crypto";
import Link from "next/link";

import { Button } from "@/components/ui";
import {
  DeleteAccountForm,
  EmailForm,
  IdentityForm,
} from "@/features/account/account-forms";
import {
  revokeAllSessionsAction,
  revokeOtherSessionsAction,
} from "@/features/account/actions";
import { signOutAction } from "@/features/auth/actions";
import { requireVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const user = await requireVerifiedUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name,last_name,birth_date")
    .eq("id", user.id)
    .single();

  return (
    <main
      className="mx-auto w-full max-w-3xl px-6 py-12"
      id="contenu-principal"
    >
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            className="text-sm font-bold uppercase tracking-[0.18em] text-brand"
            href="/"
          >
            Goustia
          </Link>
          <h1 className="mt-2 text-3xl font-semibold">Mon compte</h1>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="ghost">
            Se déconnecter
          </Button>
        </form>
      </header>

      <div className="mt-10 grid gap-6">
        <section className="rounded-xl border bg-surface p-6 shadow-card">
          <h2 className="text-xl font-semibold">Identité</h2>
          <p className="mb-5 mt-1 text-sm text-muted">
            Date de naissance : {profile?.birth_date ?? "non renseignée"} (non
            modifiable en libre-service).
          </p>
          <IdentityForm
            firstName={profile?.first_name ?? ""}
            lastName={profile?.last_name ?? ""}
          />
        </section>
        <section className="rounded-xl border bg-surface p-6 shadow-card">
          <h2 className="text-xl font-semibold">Adresse e-mail</h2>
          <p className="mb-5 mt-1 text-sm text-muted">
            Le changement doit être confirmé par e-mail.
          </p>
          <EmailForm email={user.email ?? ""} />
        </section>
        <section className="rounded-xl border bg-surface p-6 shadow-card">
          <h2 className="text-xl font-semibold">Sécurité et données</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-12 items-center rounded-md border px-4 font-semibold hover:bg-surface-muted"
              href="/mot-de-passe-oublie"
            >
              Modifier le mot de passe
            </Link>
            <a
              className="inline-flex min-h-12 items-center rounded-md border px-4 font-semibold hover:bg-surface-muted"
              href="/api/v1/account/export"
            >
              Exporter mes données
            </a>
            <form action={revokeOtherSessionsAction}>
              <Button type="submit" variant="secondary">
                Déconnecter les autres appareils
              </Button>
            </form>
            <form action={revokeAllSessionsAction}>
              <Button type="submit" variant="secondary">
                Déconnecter tous les appareils
              </Button>
            </form>
          </div>
        </section>
        <section className="rounded-xl border border-danger bg-danger-soft p-6">
          <h2 className="text-xl font-semibold">Zone sensible</h2>
          <p className="mb-5 mt-1 text-sm text-muted">
            La suppression est immédiate et irréversible.
          </p>
          <DeleteAccountForm idempotencyKey={randomUUID()} />
        </section>
      </div>
    </main>
  );
}
