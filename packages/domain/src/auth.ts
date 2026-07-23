import { z } from "zod";

import { canCreateAccount } from "./age";

const emailSchema = z.email("Adresse e-mail invalide").trim().toLowerCase();
const passwordSchema = z
  .string()
  .min(12, "Le mot de passe doit contenir au moins 12 caractères")
  .max(128);
const nameSchema = z.string().trim().min(1).max(100);

export const signUpSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    birthDate: z.iso.date("Date de naissance invalide"),
    email: emailSchema,
    password: passwordSchema,
    passwordConfirmation: z.string(),
    termsAccepted: z.literal(
      true,
      "Tu dois accepter les conditions d’utilisation",
    ),
  })
  .superRefine((value, context) => {
    if (value.password !== value.passwordConfirmation) {
      context.addIssue({
        code: "custom",
        path: ["passwordConfirmation"],
        message: "Les mots de passe ne correspondent pas",
      });
    }
    if (!canCreateAccount(new Date(`${value.birthDate}T00:00:00.000Z`))) {
      context.addIssue({
        code: "custom",
        path: ["birthDate"],
        message: "Il faut avoir au moins 18 ans pour créer un compte",
      });
    }
  });

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Saisis ton mot de passe").max(128),
});

export const passwordResetRequestSchema = z.object({ email: emailSchema });
export const passwordUpdateSchema = z
  .object({ password: passwordSchema, passwordConfirmation: z.string() })
  .refine((value) => value.password === value.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "Les mots de passe ne correspondent pas",
  });
export const profileIdentitySchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
});
export const emailUpdateSchema = z.object({ email: emailSchema });
export const accountDeletionSchema = z.object({
  confirmation: z.literal("SUPPRIMER", "Saisis SUPPRIMER pour confirmer"),
  idempotencyKey: z.uuid(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
