const fs = require("fs");

const PATTERNS = [
  /sk-ant-[a-zA-Z0-9]+/, // Anthropic
  /AIza[0-9A-Za-z-_]{35}/, // Google
  /xox[baprs]-[a-zA-Z0-9]+/, // Slack
  /glpat-[0-9a-zA-Z_\-]+/, // Generic High Entropy / GitLab
];

const files = process.argv.slice(2);
let foundSecret = false;

for (const file of files) {
  if (!fs.existsSync(file)) continue;

  const content = fs.readFileSync(file, "utf8");
  for (const pattern of PATTERNS) {
    if (pattern.test(content)) {
      console.error(`\n[!] SECRET DETECTED in ${file}`);
      console.error(`Pattern matched: ${pattern.toString()}\n`);
      foundSecret = true;
    }
  }
}

if (foundSecret) {
  console.error("COMMIT REJECTED: Secrets found in staged files.");
  process.exit(1);
}

process.exit(0);
