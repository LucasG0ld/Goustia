import "server-only";

import { serverEnv } from "@/lib/env/server";

import { createAiProviders } from "./factory";

export const configuredAiProviders = createAiProviders(serverEnv);
