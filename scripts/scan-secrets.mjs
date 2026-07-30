import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const tracked = execFileSync("git", ["ls-files", "-z"], {
  encoding: "utf8",
})
  .split("\0")
  .filter(Boolean)
  .filter(
    (file) =>
      !file.endsWith("package-lock.json") &&
      !file.includes("fixtures/") &&
      !file.endsWith(".svg"),
  );

const rules = [
  { name: "OpenAI API key", pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/g },
  { name: "GitHub token", pattern: /\bgh[opusr]_[A-Za-z0-9]{30,}\b/g },
  {
    name: "Private key",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  },
  {
    name: "Supabase service JWT",
    pattern:
      /\beyJ[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{20,}\b/g,
  },
];

const findings = [];
for (const file of tracked) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  for (const rule of rules) {
    for (const match of content.matchAll(rule.pattern)) {
      const line = content.slice(0, match.index).split("\n").length;
      findings.push(`${file}:${line} — ${rule.name}`);
    }
  }
}

if (findings.length > 0) {
  console.error("Secrets potentiels détectés :\n" + findings.join("\n"));
  process.exit(1);
}
console.log(`Secret scan OK (${tracked.length} fichiers suivis).`);
