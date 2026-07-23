import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function getVerifiedUser() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email_confirmed_at) return null;
  return data.user;
}

export async function requireVerifiedUser() {
  const user = await getVerifiedUser();
  if (!user) redirect("/connexion?retour=/compte");
  return user;
}
