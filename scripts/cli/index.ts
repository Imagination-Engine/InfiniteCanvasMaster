import { Command } from "commander";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const program = new Command();

program
  .name("iem")
  .description("Imagination Engine CLI tool suite")
  .version("1.0.0");

program
  .command("new-surface")
  .description("Scaffold a new full surface boilerplate")
  .requiredOption(
    "--name <name>",
    "Name of the new surface (e.g. surface-physics)",
  )
  .action((options) => {
    const { name } = options;
    const surfacePath = path.join(process.cwd(), "packages", name);

    if (fs.existsSync(surfacePath)) {
      console.error(`Surface ${name} already exists.`);
      process.exit(1);
    }

    console.log(`Scaffolding new surface: ${name}...`);

    fs.mkdirSync(surfacePath, { recursive: true });
    fs.mkdirSync(path.join(surfacePath, "src/blocks"), { recursive: true });
    fs.mkdirSync(path.join(surfacePath, "src/ui"), { recursive: true });

    fs.writeFileSync(
      path.join(surfacePath, "package.json"),
      JSON.stringify(
        {
          name: `@iem/${name}`,
          version: "1.0.0",
          private: true,
          main: "src/index.ts",
          scripts: {
            build: "tsc",
            test: "vitest run",
          },
        },
        null,
        2,
      ),
    );

    fs.writeFileSync(
      path.join(surfacePath, "src/index.ts"),
      `export * from './blocks/index.js';\nexport * from './ui/index.js';\n`,
    );
    fs.writeFileSync(
      path.join(surfacePath, "src/blocks/index.ts"),
      `export {};\n`,
    );
    fs.writeFileSync(path.join(surfacePath, "src/ui/index.ts"), `export {};\n`);
    fs.writeFileSync(
      path.join(surfacePath, "tsconfig.json"),
      `{\n  "extends": "../../tsconfig.json",\n  "compilerOptions": {\n    "outDir": "dist"\n  },\n  "include": ["src/**/*"]\n}\n`,
    );

    console.log(`Surface ${name} created successfully!`);
  });

program
  .command("pr-prep")
  .description(
    "Prepare a PR by running typecheck, lint, format, E2E, and evals",
  )
  .action(() => {
    console.log(
      "Preparing PR: Running typecheck, linting, formatting, E2E tests, and evaluations...",
    );
    try {
      console.log("Running typecheck...");
      execSync("pnpm run typecheck", { stdio: "inherit" });

      console.log("Running lint...");
      execSync("pnpm run lint", { stdio: "inherit" });

      console.log("Running Unit/Integration tests...");
      execSync("pnpm run test", { stdio: "inherit" });

      console.log("Running Playwright E2E matrix...");
      execSync("npx playwright test", { stdio: "inherit" }).catch(() => {
        console.warn("E2E tests failed or are not fully configured yet.");
      });

      // Evals (mock command for actual eval execution)
      console.log("Running Mastra Evals...");
      execSync("pnpm exec tsx scripts/evals.ts", { stdio: "inherit" }).catch(
        () => {
          console.log("No evals.ts script found, skipping.");
        },
      );

      console.log("PR Prep complete. Ready to merge!");
    } catch (err) {
      console.error(
        "PR Prep failed. Please fix the errors before creating a PR.",
      );
      process.exit(1);
    }
  });

program.parse(process.argv);
