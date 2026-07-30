import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const supabaseCli = require.resolve("supabase/dist/supabase.js");
const playwrightCli = require.resolve("@playwright/test/cli");
const status = spawnSync(
  process.execPath,
  [supabaseCli, "status", "-o", "env"],
  {
    encoding: "utf8",
    shell: false,
  },
);

if (status.status !== 0) {
  console.error(
    "Supabase local doit être démarré avant Playwright (npm run supabase:start).",
  );
  process.exit(status.status ?? 1);
}

const local = {};
for (const line of status.stdout.split(/\r?\n/)) {
  const match = line.match(/^([A-Z_]+)=(?:"(.*)"|(.*))$/);
  if (match) local[match[1]] = match[2] ?? match[3];
}

const env = {
  ...process.env,
  APP_ENV: "test",
  NEXT_PUBLIC_APP_ENV: "test",
  NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3000",
  NEXT_PUBLIC_SUPABASE_URL: local.API_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: local.PUBLISHABLE_KEY ?? local.ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: local.SERVICE_ROLE_KEY,
  AI_GENERATION_ENABLED: "true",
  AI_TEXT_PROVIDER: "fake",
  AI_IMAGE_PROVIDER: "fake",
  OBSERVABILITY_ENABLED: "false",
  NEXT_PUBLIC_OBSERVABILITY_ENABLED: "false",
};

const forwarded = process.argv.slice(2);
const run = spawnSync(process.execPath, [playwrightCli, "test", ...forwarded], {
  env,
  shell: false,
  stdio: "inherit",
});
process.exit(run.status ?? 1);
