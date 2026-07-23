"use client";

import { useActionState } from "react";

import { Alert, Button, Checkbox, TextField } from "@/components/ui";

import {
  requestPasswordResetAction,
  signInAction,
  signUpAction,
  updatePasswordAction,
} from "./actions";
import { initialActionState } from "./state";

function Result({
  state,
}: {
  state: typeof initialActionState & { message?: string };
}) {
  if (!state.message) return null;
  return (
    <Alert
      title={
        state.status === "success"
          ? "C’est fait"
          : "Une vérification est nécessaire"
      }
      tone={state.status === "success" ? "success" : "danger"}
    >
      {state.message}
    </Alert>
  );
}

export function SignUpForm() {
  const [state, action, pending] = useActionState(
    signUpAction,
    initialActionState,
  );
  return (
    <form action={action} className="grid gap-5">
      <Result state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          error={state.errors?.firstName?.[0]}
          label="Prénom"
          name="firstName"
          autoComplete="given-name"
          required
        />
        <TextField
          error={state.errors?.lastName?.[0]}
          label="Nom"
          name="lastName"
          autoComplete="family-name"
          required
        />
      </div>
      <TextField
        error={state.errors?.birthDate?.[0]}
        hint="Goustia est réservé aux personnes majeures."
        label="Date de naissance"
        name="birthDate"
        type="date"
        required
      />
      <TextField
        error={state.errors?.email?.[0]}
        label="Adresse e-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <TextField
        error={state.errors?.password?.[0]}
        hint="12 caractères minimum."
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete="new-password"
        required
      />
      <TextField
        error={state.errors?.passwordConfirmation?.[0]}
        label="Confirmer le mot de passe"
        name="passwordConfirmation"
        type="password"
        autoComplete="new-password"
        required
      />
      <Checkbox
        label="J’accepte les conditions d’utilisation et la politique de confidentialité."
        name="termsAccepted"
        required
      />
      <p className="text-sm text-muted">
        Consulte les{" "}
        <a
          className="font-semibold text-brand underline"
          href="/conditions-utilisation"
        >
          conditions d’utilisation
        </a>{" "}
        et la{" "}
        <a
          className="font-semibold text-brand underline"
          href="/confidentialite"
        >
          politique de confidentialité
        </a>
        . Ces documents sont encore des brouillons de développement.
      </p>
      <Button disabled={pending} type="submit">
        {pending ? "Création…" : "Créer mon compte"}
      </Button>
    </form>
  );
}

export function SignInForm({ returnTo = "" }: { returnTo?: string }) {
  const [state, action, pending] = useActionState(
    signInAction,
    initialActionState,
  );
  return (
    <form action={action} className="grid gap-5">
      <Result state={state} />
      <input name="returnTo" type="hidden" value={returnTo} />
      <TextField
        error={state.errors?.email?.[0]}
        label="Adresse e-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <TextField
        error={state.errors?.password?.[0]}
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <Button disabled={pending} type="submit">
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}

export function PasswordResetRequestForm() {
  const [state, action, pending] = useActionState(
    requestPasswordResetAction,
    initialActionState,
  );
  return (
    <form action={action} className="grid gap-5">
      <Result state={state} />
      <TextField
        error={state.errors?.email?.[0]}
        label="Adresse e-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <Button disabled={pending} type="submit">
        {pending ? "Envoi…" : "Envoyer le lien"}
      </Button>
    </form>
  );
}

export function PasswordUpdateForm() {
  const [state, action, pending] = useActionState(
    updatePasswordAction,
    initialActionState,
  );
  return (
    <form action={action} className="grid gap-5">
      <Result state={state} />
      <TextField
        error={state.errors?.password?.[0]}
        label="Nouveau mot de passe"
        name="password"
        type="password"
        autoComplete="new-password"
        required
      />
      <TextField
        error={state.errors?.passwordConfirmation?.[0]}
        label="Confirmer le mot de passe"
        name="passwordConfirmation"
        type="password"
        autoComplete="new-password"
        required
      />
      <Button disabled={pending} type="submit">
        {pending ? "Modification…" : "Modifier le mot de passe"}
      </Button>
    </form>
  );
}
