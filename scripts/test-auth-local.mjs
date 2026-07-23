import { createClient } from "@supabase/supabase-js";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import path from "node:path";

function localStatus() {
  const executable = path.resolve(
    "node_modules",
    "supabase",
    "dist",
    "supabase.js",
  );
  return JSON.parse(
    execFileSync(process.execPath, [executable, "status", "-o", "json"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }),
  );
}

const status =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY
    ? null
    : localStatus();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? status?.API_URL;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? status?.PUBLISHABLE_KEY;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? status?.SERVICE_ROLE_KEY;

if (!url || !publishableKey || !serviceRoleKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY et SUPABASE_SERVICE_ROLE_KEY sont requis.",
  );
}

const email = `auth-journey-${randomUUID()}@example.test`;
const initialPassword = "initial-password-2026";
const updatedPassword = "updated-password-2026";
const client = createClient(url, publishableKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
let userId;

try {
  const { data: signup, error: signupError } = await client.auth.signUp({
    email,
    password: initialPassword,
    options: {
      data: {
        first_name: "Parcours",
        last_name: "Auth",
        birth_date: "1990-01-01",
        legal_acceptance: true,
        legal_document_version: "2026-07-23-draft.1",
      },
    },
  });
  assert.ifError(signupError);
  assert.ok(signup.user);
  userId = signup.user.id;

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("first_name,last_name")
    .eq("id", userId)
    .single();
  assert.ifError(profileError);
  assert.deepEqual(profile, { first_name: "Parcours", last_name: "Auth" });
  const { count: consentCount, error: consentError } = await client
    .from("user_legal_consents")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  assert.ifError(consentError);
  assert.equal(consentCount, 2);

  await client.auth.signOut({ scope: "local" });
  const { error: signinError } = await client.auth.signInWithPassword({
    email,
    password: initialPassword,
  });
  assert.ifError(signinError);

  const { error: resetRequestError } =
    await client.auth.resetPasswordForEmail(email);
  assert.ifError(resetRequestError);
  const { data: recovery, error: recoveryError } =
    await admin.auth.admin.generateLink({
      type: "recovery",
      email,
    });
  assert.ifError(recoveryError);
  assert.ok(recovery.properties.hashed_token);

  await client.auth.signOut({ scope: "local" });
  const { error: verifyError } = await client.auth.verifyOtp({
    type: "recovery",
    token_hash: recovery.properties.hashed_token,
  });
  assert.ifError(verifyError);
  const { error: passwordError } = await client.auth.updateUser({
    password: updatedPassword,
  });
  assert.ifError(passwordError);

  await client.auth.signOut({ scope: "local" });
  const { error: updatedSigninError } = await client.auth.signInWithPassword({
    email,
    password: updatedPassword,
  });
  assert.ifError(updatedSigninError);

  const { error: safetyError } = await client.rpc(
    "complete_food_safety_onboarding",
    { p_constraints: [], p_no_constraints: true },
  );
  assert.ifError(safetyError);
  const { error: goalsError } = await client.rpc("complete_goals_onboarding", {
    p_nutrition_goal: "balanced",
    p_meals_per_week: 7,
    p_servings_per_meal: 2,
  });
  assert.ifError(goalsError);
  const { data: generationJobId, error: tastesError } = await client.rpc(
    "complete_tastes_and_request_plan",
    {
      p_liked_dish_ids: [],
      p_skipped: true,
      p_idempotency_key: randomUUID(),
    },
  );
  assert.ifError(tastesError);
  assert.ok(generationJobId);
  const { data: generationJob, error: generationError } = await client
    .from("ai_generation_jobs")
    .select("status,provider")
    .eq("id", generationJobId)
    .single();
  assert.ifError(generationError);
  assert.deepEqual(generationJob, { status: "succeeded", provider: "fake" });

  const idempotencyKey = randomUUID();
  const { data: requestId, error: requestError } = await client.rpc(
    "request_account_deletion",
    { p_confirmation: "SUPPRIMER", p_idempotency_key: idempotencyKey },
  );
  assert.ifError(requestError);
  assert.ok(requestId);
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  assert.ifError(deleteError);
  userId = undefined;
  const { error: auditError } = await admin
    .from("account_deletion_requests")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", requestId);
  assert.ifError(auditError);

  process.stdout.write(
    "Auth/onboarding journey passed: signup, legal versions, recovery, safety, goals, fake plan and deletion.\n",
  );
} finally {
  if (userId) await admin.auth.admin.deleteUser(userId);
}
