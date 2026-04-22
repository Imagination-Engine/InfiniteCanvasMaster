import { build } from "bun";

async function runBuild() {
  console.log("Building Desktop application...");

  try {
    const result = await build({
      entrypoints: ["./src/index.ts"],
      outdir: "./dist",
      target: "bun",
      minify: process.env.NODE_ENV === "production",
      sourcemap: "external",
    });

    if (!result.success) {
      console.error("Build failed with the following errors:");
      for (const message of result.logs) {
        console.error(message);
      }
      process.exit(1);
    }

    console.log(
      `Build completed successfully. Generated ${result.outputs.length} files in ./dist`,
    );
  } catch (err) {
    console.error(
      "An unexpected error occurred during the build process:",
      err,
    );
    process.exit(1);
  }
}

runBuild();
