import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = join("apps", "web", ".next", "static", "chunks");
const limits = {
  individualJavaScriptBytes: 450 * 1024,
  totalJavaScriptBytes: 4 * 1024 * 1024,
};

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

const chunks = files(root).filter((file) => file.endsWith(".js"));
const measured = chunks.map((file) => ({
  file: relative(root, file),
  bytes: statSync(file).size,
}));
const tooLarge = measured.filter(
  (item) => item.bytes > limits.individualJavaScriptBytes,
);
const total = measured.reduce((sum, item) => sum + item.bytes, 0);

console.log(
  JSON.stringify(
    {
      chunks: measured.length,
      totalBytes: total,
      largest: measured.sort((a, b) => b.bytes - a.bytes).slice(0, 5),
      limits,
    },
    null,
    2,
  ),
);
if (tooLarge.length > 0 || total > limits.totalJavaScriptBytes) {
  console.error("Le budget JavaScript est dépassé.");
  process.exit(1);
}
