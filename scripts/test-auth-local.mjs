import { createClient } from "@supabase/supabase-js";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
    "Auth journey passed: signup, profile, signin, recovery, password and deletion.\n",
  );
} finally {
  if (userId) await admin.auth.admin.deleteUser(userId);
}
