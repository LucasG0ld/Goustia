import { createClient } from "@supabase/supabase-js";
import { expect, test, type Browser } from "@playwright/test";
import { mkdir } from "node:fs/promises";

import { seededRecipe, testAccount, testAdmin } from "./fixtures";

const planId = "a1000000-0000-4000-8000-000000000003";
const mealId = "a1000000-0000-4000-8000-000000000004";

test("prépare les comptes et sessions reproductibles", async ({ browser }) => {
  const supabaseUrl = required("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = required("SUPABASE_SERVICE_ROLE_KEY");
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const userId = await recreateUser(admin, testAccount, "Utilisateur");
  const adminId = await recreateUser(admin, testAdmin, "Administrateur");
  const now = new Date().toISOString();
  await assertOk(
    admin
      .from("profiles")
      .update({
        onboarding_status: "completed",
        onboarding_completed_at: now,
        nutrition_goal: "no_specific_goal",
        meals_per_week: 5,
        servings_per_meal: 2,
      })
      .in("id", [userId, adminId]),
  );
  await assertOk(
    admin.from("user_roles").upsert({ user_id: adminId, role: "admin" }),
  );

  const { data: ingredient, error: ingredientError } = await admin
    .from("ingredients")
    .select("id")
    .eq("is_active", true)
    .limit(1)
    .single();
  if (ingredientError || !ingredient) {
    throw new Error("Le référentiel doit être importé avant Playwright.", {
      cause: ingredientError,
    });
  }

  await assertOk(admin.from("recipes").delete().eq("id", seededRecipe.id));
  await assertOk(
    admin.from("recipes").insert({
      id: seededRecipe.id,
      canonical_slug: "poelee-goustia-test",
      deduplication_hash: "e".repeat(64),
      created_by: userId,
    }),
  );
  await assertOk(
    admin.from("recipe_versions").insert({
      id: seededRecipe.versionId,
      recipe_id: seededRecipe.id,
      version_number: 1,
      title: seededRecipe.title,
      description: "Une recette stable créée pour les parcours automatisés.",
      servings: 2,
      preparation_minutes: 10,
      cooking_minutes: 15,
      difficulty: "easy",
      cost_level: "low",
      origin: "editorial",
      validation_status: "validated",
      publication_status: "published",
      validated_at: now,
      published_at: now,
    }),
  );
  await assertOk(
    admin.from("recipe_ingredients").insert({
      recipe_version_id: seededRecipe.versionId,
      ingredient_id: ingredient.id,
      position: 1,
      quantity: 200,
      unit: "g",
    }),
  );
  await assertOk(
    admin.from("recipe_steps").insert({
      recipe_version_id: seededRecipe.versionId,
      position: 1,
      instruction: "Préparer puis cuire doucement pendant quinze minutes.",
    }),
  );

  const weekStart = currentMonday();
  await assertOk(admin.from("meal_plans").delete().eq("id", planId));
  await assertOk(
    admin.from("meal_plans").insert({
      id: planId,
      user_id: userId,
      week_start: weekStart,
      status: "ready",
      idempotency_key: "a1000000-0000-4000-8000-000000000005",
    }),
  );
  await assertOk(
    admin.from("planned_meals").insert({
      id: mealId,
      meal_plan_id: planId,
      user_id: userId,
      recipe_version_id: seededRecipe.versionId,
      meal_date: weekStart,
      meal_type: "dinner",
      servings: 2,
    }),
  );

  await mkdir("test-results/.auth", { recursive: true });
  await saveSession(browser, testAccount, "test-results/.auth/user.json");
  await saveSession(browser, testAdmin, "test-results/.auth/admin.json");
});

async function recreateUser(
  admin: ReturnType<typeof createClient>,
  account: { email: string; password: string },
  firstName: string,
) {
  const { data: users, error: listError } = await admin.auth.admin.listUsers({
    perPage: 1000,
  });
  if (listError) throw listError;
  const existing = users.users.find((user) => user.email === account.email);
  if (existing) {
    const { error } = await admin.auth.admin.deleteUser(existing.id);
    if (error) throw error;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: "E2E",
      birth_date: "1990-01-01",
    },
  });
  if (error || !data.user) throw error ?? new Error("Utilisateur E2E absent.");
  return data.user.id;
}

async function saveSession(
  browser: Browser,
  account: { email: string; password: string },
  path: string,
) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/connexion");
  await page.getByLabel("Adresse e-mail").fill(account.email);
  await page.getByLabel("Mot de passe").fill(account.password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).not.toHaveURL(/\/connexion/);
  await context.storageState({ path });
  await context.close();
}

function currentMonday() {
  const date = new Date();
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - day + 1);
  return date.toISOString().slice(0, 10);
}

async function assertOk(
  query: PromiseLike<{ error: { message: string } | null }>,
) {
  const { error } = await query;
  if (error) throw new Error(error.message);
}

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} est requis pour les tests E2E.`);
  return value;
}
