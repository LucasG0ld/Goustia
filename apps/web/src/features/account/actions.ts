"use server";

import {
  accountDeletionSchema,
  emailUpdateSchema,
  profileIdentitySchema,
} from "@recettes/domain";
import { redirect } from "next/navigation";

import { requireVerifiedUser } from "@/lib/auth/current-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/features/auth/state";

const values = (formData: FormData) => Object.fromEntries(formData.entries());

export async function updateIdentityAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireVerifiedUser();
  const parsed = profileIdentitySchema.safeParse(values(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Vérifie les champs indiqués.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
    })
    .eq("id", user.id);
  return error
    ? { status: "error", message: "Le profil n’a pas pu être mis à jour." }
    : { status: "success", message: "Profil mis à jour." };
}

export async function updateEmailAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireVerifiedUser();
  const parsed = emailUpdateSchema.safeParse(values(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Adresse e-mail invalide.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    email: parsed.data.email,
  });
  return error
    ? { status: "error", message: "L’adresse e-mail n’a pas pu être modifiée." }
    : {
        status: "success",
        message:
          "Un e-mail de validation a été envoyé aux adresses concernées.",
      };
}

export async function revokeOtherSessionsAction(): Promise<void> {
  await requireVerifiedUser();
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "others" });
}

export async function revokeAllSessionsAction(): Promise<void> {
  await requireVerifiedUser();
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "global" });
  redirect("/connexion");
}

export async function deleteAccountAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireVerifiedUser();
  const parsed = accountDeletionSchema.safeParse(values(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "La confirmation est incorrecte.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      status: "error",
      message:
        "La suppression est momentanément indisponible. Contacte le support.",
    };
  }

  const supabase = await createClient();
  const { data: requestId, error: requestError } = await supabase.rpc(
    "request_account_deletion",
    {
      p_confirmation: parsed.data.confirmation,
      p_idempotency_key: parsed.data.idempotencyKey,
    },
  );
  if (requestError || !requestId) {
    return {
      status: "error",
      message: "La demande n’a pas pu être enregistrée.",
    };
  }

  const { error: deletionError } = await admin.auth.admin.deleteUser(
    user.id,
    false,
  );
  await admin
    .from("account_deletion_requests")
    .update(
      deletionError
        ? { status: "failed", failure_code: "auth_delete_failed" }
        : { status: "completed", completed_at: new Date().toISOString() },
    )
    .eq("id", requestId);

  if (deletionError) {
    return {
      status: "error",
      message:
        "La demande est enregistrée, mais son traitement doit être repris par le support.",
    };
  }
  redirect("/connexion?compte=supprime");
}
