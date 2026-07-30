import { performance } from "node:perf_hooks";

const baseUrl = process.env.LOAD_TEST_BASE_URL ?? "http://127.0.0.1:3000";
const requests = Number(process.env.LOAD_TEST_REQUESTS ?? 300);
const concurrency = Number(process.env.LOAD_TEST_CONCURRENCY ?? 20);
const durations = [];
let errors = 0;
let next = 0;

async function worker() {
  while (next < requests) {
    next += 1;
    const started = performance.now();
    try {
      const response = await fetch(`${baseUrl}/api/v1/health`, {
        signal: AbortSignal.timeout(3_000),
      });
      if (!response.ok) errors += 1;
      await response.arrayBuffer();
    } catch {
      errors += 1;
    } finally {
      durations.push(performance.now() - started);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));
durations.sort((a, b) => a - b);
const percentile = (value) =>
  durations[
    Math.min(durations.length - 1, Math.ceil(value * durations.length) - 1)
  ];
const result = {
  target: "/api/v1/health",
  requests,
  concurrency,
  errors,
  errorRate: errors / requests,
  p50Ms: Number(percentile(0.5).toFixed(2)),
  p95Ms: Number(percentile(0.95).toFixed(2)),
  p99Ms: Number(percentile(0.99).toFixed(2)),
};
console.log(JSON.stringify(result, null, 2));
if (result.errorRate > 0 || result.p95Ms > 250) process.exit(1);
