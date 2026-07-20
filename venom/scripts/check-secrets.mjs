import { spawnSync } from "node:child_process";

const patterns = [
  "postgres(ql)?://[^[:space:]]+:[^[:space:]]+@",
  "npg_[A-Za-z0-9]{12,}",
  "sk-[A-Za-z0-9_-]{20,}",
  "ghp_[A-Za-z0-9]{20,}",
];

const result = spawnSync("git", ["grep", "-n", "-I", "-E", patterns.join("|")], {
  encoding: "utf8",
});

if (result.status === 0 && result.stdout.trim()) {
  console.error("Potential committed secret detected:\n" + result.stdout.trim());
  process.exit(1);
}
if (result.status !== 0 && result.status !== 1) {
  console.error(result.stderr || "Secret scan failed");
  process.exit(result.status ?? 1);
}
console.log("Secret scan passed");
