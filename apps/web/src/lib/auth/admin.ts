import "server-only";

import { redirect } from "next/navigation";

import { serverEnv } from "@/lib/env/server";
import { createClient } from "@/lib/supabase/server";

import { getVerifiedUser } from "./current-user";

export async function getAdminUser() {
  const user = await getVerifiedUser();
  if (!user) return null;
  const supabase = await createClient();
  const [{ data: role }, assurance] = await Promise.all([
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);
  if (!role) return null;
  if (
    serverEnv.APP_ENV === "production" &&
    (assurance.error || assurance.data.currentLevel !== "aal2")
  ) {
    return null;
  }
  return user;
}

export async function requireAdminUser() {
  const user = await getAdminUser();
  if (!user) redirect("/connexion?retour=/admin");
  return user;
}
