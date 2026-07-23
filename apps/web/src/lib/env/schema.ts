import { z } from "zod";

const optionalSecret = z.string().trim().min(1).optional().or(z.literal(""));
const optionalUrl = z.url().optional().or(z.literal(""));

export const appEnvironments = [
  "local",
  "test",
  "staging",
  "production",
] as const;

export const logLevels = ["debug", "info", "warn", "error"] as const;
export const aiTextProviders = ["fake", "groq", "cloudflare"] as const;
export const aiImageProviders = ["fake", "cloudflare"] as const;

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z.enum(appEnvironments),
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().trim().min(1),
  NEXT_PUBLIC_SENTRY_DSN: optionalUrl,
  NEXT_PUBLIC_OBSERVABILITY_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: optionalSecret,
  NEXT_PUBLIC_UMAMI_SCRIPT_URL: optionalUrl,
});

export const serverEnvSchema = publicEnvSchema.extend({
  APP_ENV: z.enum(appEnvironments),
  OBSERVABILITY_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  LOG_LEVEL: z.enum(logLevels).default("info"),
  SENTRY_DSN: optionalUrl,
  SENTRY_ORG: optionalSecret,
  SENTRY_PROJECT: optionalSecret,
  SENTRY_AUTH_TOKEN: optionalSecret,
  SENTRY_RELEASE: optionalSecret,
  SUPABASE_SERVICE_ROLE_KEY: optionalSecret,
  AI_GENERATION_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  AI_TEXT_PROVIDER: z.enum(aiTextProviders).default("groq"),
  AI_TEXT_MODEL: z.string().trim().min(1).default("openai/gpt-oss-120b"),
  GROQ_API_KEY: optionalSecret,
  AI_TEXT_FALLBACK_PROVIDER: z.enum(aiTextProviders).default("cloudflare"),
  CLOUDFLARE_TEXT_MODEL: z
    .string()
    .trim()
    .min(1)
    .default("@cf/qwen/qwen3-30b-a3b-fp8"),
  AI_IMAGE_PROVIDER: z.enum(aiImageProviders).default("cloudflare"),
  AI_IMAGE_MODEL: z
    .string()
    .trim()
    .min(1)
    .default("@cf/black-forest-labs/flux-2-klein-4b"),
  CLOUDFLARE_ACCOUNT_ID: optionalSecret,
  CLOUDFLARE_API_TOKEN: optionalSecret,
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

export type AiConfigurationReadiness = {
  ready: boolean;
  issues: string[];
};

export function getAiConfigurationReadiness(
  environment: ServerEnv,
): AiConfigurationReadiness {
  if (!environment.AI_GENERATION_ENABLED) {
    return { ready: true, issues: [] };
  }

  const issues: string[] = [];
  const usesGroq =
    environment.AI_TEXT_PROVIDER === "groq" ||
    environment.AI_TEXT_FALLBACK_PROVIDER === "groq";
  const usesCloudflare =
    environment.AI_TEXT_PROVIDER === "cloudflare" ||
    environment.AI_TEXT_FALLBACK_PROVIDER === "cloudflare" ||
    environment.AI_IMAGE_PROVIDER === "cloudflare";

  if (usesGroq && !environment.GROQ_API_KEY) {
    issues.push("GROQ_API_KEY manque pour le fournisseur sélectionné");
  }
  if (usesCloudflare && !environment.CLOUDFLARE_ACCOUNT_ID) {
    issues.push("CLOUDFLARE_ACCOUNT_ID manque pour le fournisseur sélectionné");
  }
  if (usesCloudflare && !environment.CLOUDFLARE_API_TOKEN) {
    issues.push("CLOUDFLARE_API_TOKEN manque pour le fournisseur sélectionné");
  }

  return { ready: issues.length === 0, issues };
}

function formatEnvironmentError(error: z.ZodError): Error {
  const variables = [
    ...new Set(
      error.issues.map((issue) => String(issue.path[0] ?? "environment")),
    ),
  ].join(", ");

  return new Error(
    `Configuration d'environnement invalide ou incomplète : ${variables}. ` +
      "Consultez apps/web/.env.example et docs/ENVIRONNEMENTS.md.",
    { cause: error },
  );
}

export function parsePublicEnv(input: unknown): PublicEnv {
  const result = publicEnvSchema.safeParse(input);

  if (!result.success) {
    throw formatEnvironmentError(result.error);
  }

  return result.data;
}

export function parseServerEnv(input: unknown): ServerEnv {
  const result = serverEnvSchema.safeParse(input);

  if (!result.success) {
    throw formatEnvironmentError(result.error);
  }

  return result.data;
}
