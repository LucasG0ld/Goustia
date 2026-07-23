import { describe, expect, it } from "vitest";

import {
  accountDeletionSchema,
  recipeReactionSchema,
  shoppingListItemSchema,
  signUpSchema,
} from "./index";

const validSignup = {
  firstName: "Ana",
  lastName: "Martin",
  birthDate: "1990-06-15",
  email: "ANA@EXAMPLE.TEST",
  password: "une-phrase-solide",
  passwordConfirmation: "une-phrase-solide",
  termsAccepted: true as const,
};

describe("auth input contracts", () => {
  it("normalizes a valid adult signup", () => {
    expect(signUpSchema.parse(validSignup).email).toBe("ana@example.test");
  });

  it("rejects a password mismatch", () => {
    expect(
      signUpSchema.safeParse({
        ...validSignup,
        passwordConfirmation: "different-value",
      }).success,
    ).toBe(false);
  });

  it("requires the explicit deletion phrase and an idempotency key", () => {
    expect(
      accountDeletionSchema.safeParse({
        confirmation: "supprimer",
        idempotencyKey: crypto.randomUUID(),
      }).success,
    ).toBe(false);
  });
});

describe("planning contracts", () => {
  it("keeps dislike reasons off likes", () => {
    expect(
      recipeReactionSchema.safeParse({
        recipeId: crypto.randomUUID(),
        reaction: "like",
        reason: "too_long",
        idempotencyKey: crypto.randomUUID(),
      }).success,
    ).toBe(false);
  });

  it("requires exactly one shopping item identity", () => {
    expect(
      shoppingListItemSchema.safeParse({
        ingredientId: crypto.randomUUID(),
        manualLabel: "Tomates",
        quantity: 2,
        unit: "piece",
        checkedAt: null,
      }).success,
    ).toBe(false);
  });
});
