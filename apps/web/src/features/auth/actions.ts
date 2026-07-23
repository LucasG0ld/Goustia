"use server";

import {
  passwordResetRequestSchema,
  passwordUpdateSchema,
  signInSchema,
  signUpSchema,
} from "@recettes/domain";
import { createHash } from "node:crypto";
import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { serverEnv } from "@/lib/env/server";
import { createClient } from "@/lib/supabase/server";

import type { ActionState } from "./state";

function fields(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

async function consumeRateLimit(
  action: "signup" | "signin" | "password_reset",
  email: string,
) {
  const requestHeaders = await headers();
  const forwarded = requestHeaders
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const identifier = `${email.toLowerCase()}|${forwarded ?? "unknown"}`;
  const identifierHash = createHash("sha256").update(identifier).digest("hex");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("consume_auth_rate_limit", {
    p_action: action,
    p_identifier_hash: identifierHash,
  });
  return !error && data === true;
}

export async function signUpAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    ...fields(formData),
    termsAccepted: formData.get("termsAccepted") === "on",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Vérifie les champs indiqués.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  if (!(await consumeRateLimit("signup", parsed.data.email))) {
    return {
      status: "error",
      message: "Trop de tentatives. Réessaie dans quelques minutes.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${serverEnv.NEXT_PUBLIC_APP_URL}/auth/callback?retour=/compte`,
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        birth_date: parsed.data.birthDate,
      },
    },
  });

  if (error) {
    return {
      status: "error",
      message:
        "Impossible de créer le compte. L’adresse est peut-être déjà utilisée.",
    };
  }
  if (data.session) redirect("/compte");
  return {
    status: "success",
    message:
      "Compte créé. Consulte tes e-mails pour le valider avant de te connecter.",
  };
}

export async function signInAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signInSchema.safeParse(fields(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Vérifie les champs indiqués.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  if (!(await consumeRateLimit("signin", parsed.data.email))) {
    return {
      status: "error",
      message: "Trop de tentatives. Réessaie dans quelques minutes.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user.email_confirmed_at) {
    if (data.session) await supabase.auth.signOut({ scope: "local" });
    return {
      status: "error",
      message: "Identifiants invalides ou adresse e-mail non validée.",
    };
  }

  const requestedReturn = String(formData.get("returnTo") ?? "");
  const destination =
    requestedReturn.startsWith("/") && !requestedReturn.startsWith("//")
      ? (requestedReturn as Route)
      : "/compte";
  redirect(destination);
}

export async function requestPasswordResetAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = passwordResetRequestSchema.safeParse(fields(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Adresse e-mail invalide.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  if (await consumeRateLimit("password_reset", parsed.data.email)) {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${serverEnv.NEXT_PUBLIC_APP_URL}/auth/callback?retour=/reinitialiser-mot-de-passe`,
    });
  }
  return {
    status: "success",
    message:
      "Si ce compte existe, un lien de réinitialisation vient d’être envoyé.",
  };
}

export async function updatePasswordAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = passwordUpdateSchema.safeParse(fields(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Vérifie le nouveau mot de passe.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub)
    return {
      status: "error",
      message: "Ce lien a expiré. Demande un nouveau lien.",
    };
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error)
    return {
      status: "error",
      message: "Le mot de passe n’a pas pu être modifié.",
    };
  return {
    status: "success",
    message: "Mot de passe modifié. Tu peux continuer à utiliser Goustia.",
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/connexion");
}
