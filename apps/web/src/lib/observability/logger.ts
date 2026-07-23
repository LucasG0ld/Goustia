import "server-only";

import { serverEnv } from "@/lib/env/server";

import { redact } from "./redact";

type LogLevel = "debug" | "info" | "warn" | "error";
type LogContext = Record<string, unknown>;

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function shouldLog(level: LogLevel): boolean {
  return levelPriority[level] >= levelPriority[serverEnv.LOG_LEVEL];
}

function write(level: LogLevel, message: string, context: LogContext): void {
  if (!shouldLog(level)) {
    return;
  }

  const entry = redact({
    timestamp: new Date().toISOString(),
    level,
    service: "goustia-web",
    environment: serverEnv.APP_ENV,
    message,
    ...context,
  });

  const serialized = JSON.stringify(entry);

  if (level === "error") {
    console.error(serialized);
  } else if (level === "warn") {
    console.warn(serialized);
  } else {
    console.log(serialized);
  }
}

export const logger = {
  debug(message: string, context: LogContext = {}) {
    write("debug", message, context);
  },
  info(message: string, context: LogContext = {}) {
    write("info", message, context);
  },
  warn(message: string, context: LogContext = {}) {
    write("warn", message, context);
  },
  error(message: string, context: LogContext = {}) {
    write("error", message, context);
  },
};
