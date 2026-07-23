"use client";

import { useActionState } from "react";

import { Alert, Button, TextField } from "@/components/ui";
import { initialActionState } from "@/features/auth/state";

import {
  deleteAccountAction,
  updateEmailAction,
  updateIdentityAction,
} from "./actions";

function Feedback({
  state,
}: {
  state: typeof initialActionState & { message?: string };
}) {
  return state.message ? (
    <Alert
      title={
        state.status === "success" ? "Enregistré" : "Échec de l’enregistrement"
      }
      tone={state.status === "success" ? "success" : "danger"}
    >
      {state.message}
    </Alert>
  ) : null;
}

export function IdentityForm({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) {
  const [state, action, pending] = useActionState(
    updateIdentityAction,
    initialActionState,
  );
  return (
    <form action={action} className="grid gap-4">
      <Feedback state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          defaultValue={firstName}
          error={state.errors?.firstName?.[0]}
          label="Prénom"
          name="firstName"
          required
        />
        <TextField
          defaultValue={lastName}
          error={state.errors?.lastName?.[0]}
          label="Nom"
          name="lastName"
          required
        />
      </div>
      <Button
        className="justify-self-start"
        disabled={pending}
        type="submit"
        variant="secondary"
      >
        Enregistrer le profil
      </Button>
    </form>
  );
}

export function EmailForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(
    updateEmailAction,
    initialActionState,
  );
  return (
    <form action={action} className="grid gap-4">
      <Feedback state={state} />
      <TextField
        defaultValue={email}
        error={state.errors?.email?.[0]}
        label="Nouvelle adresse e-mail"
        name="email"
        type="email"
        required
      />
      <Button
        className="justify-self-start"
        disabled={pending}
        type="submit"
        variant="secondary"
      >
        Modifier l’adresse
      </Button>
    </form>
  );
}

export function DeleteAccountForm({
  idempotencyKey,
}: {
  idempotencyKey: string;
}) {
  const [state, action, pending] = useActionState(
    deleteAccountAction,
    initialActionState,
  );
  return (
    <form action={action} className="grid gap-4">
      <Feedback state={state} />
      <input name="idempotencyKey" type="hidden" value={idempotencyKey} />
      <TextField
        error={state.errors?.confirmation?.[0]}
        hint="Cette action supprime définitivement le compte, le profil, les préférences et les plannings. Une preuve pseudonymisée est conservée 6 ans."
        label="Saisis SUPPRIMER"
        name="confirmation"
        autoComplete="off"
        required
      />
      <Button
        className="justify-self-start"
        disabled={pending}
        type="submit"
        variant="danger"
      >
        {pending ? "Suppression…" : "Supprimer définitivement mon compte"}
      </Button>
    </form>
  );
}
