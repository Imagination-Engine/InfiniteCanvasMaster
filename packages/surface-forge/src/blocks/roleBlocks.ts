import { z } from "zod";
import type { BlockDefinition, MCPToolBinding } from "@iem/core";

export const architectBlock: BlockDefinition<any, any> = {
  id: "iem.forge.architect",
  name: "Architect",
  description: "Produces the structured spec",
  category: "forge",
  input: z.object({
    goal: z.string().optional(),
    prompt: z.string().optional(),
  }),
  output: z.object({
    success: z.boolean(),
    specs: z.string(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "forge_architect",
    invoke: async (input: any) => {
      const { agentRuntime } = await import("@iem/core");
      const goal =
        input.goal ||
        input.prompt ||
        "No goal provided. Please define what app to build.";
      const response = await agentRuntime.chat({
        model: "gemini-2.5-pro",
        messages: [
          {
            role: "user",
            content: `Design a technical specification for: ${goal}. Return ONLY the spec.`,
          },
        ],
      });
      return { success: true, specs: response.content };
    },
  },
};

export const designerBlock: BlockDefinition<any, any> = {
  id: "iem.forge.designer",
  name: "Designer",
  description: "Produces the layout and styling guidelines",
  category: "forge",
  input: z.object({
    specs: z.string().optional(),
    requirements: z.string().optional(),
  }),
  output: z.object({
    success: z.boolean(),
    assets: z.string(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "forge_designer",
    invoke: async (input: any) => {
      const { agentRuntime } = await import("@iem/core");
      const specs =
        input.specs || "No specs provided. Design generic modern UI.";
      const reqs = input.requirements || "None";
      const response = await agentRuntime.chat({
        model: "gemini-2.5-pro",
        messages: [
          {
            role: "user",
            content: `Create a design and styling guide for this spec: ${specs}. User requirements: ${reqs}. Return ONLY the design assets and guidelines.`,
          },
        ],
      });
      return { success: true, assets: response.content };
    },
  },
};

export const builderBlock: BlockDefinition<any, any> = {
  id: "iem.forge.builder",
  name: "Builder",
  description: "Generates the actual code using Gemini",
  category: "forge",
  input: z.object({
    specs: z.string().optional(),
    assets: z.string().optional(),
  }),
  output: z.object({
    success: z.boolean(),
    generatedCode: z.string(),
    files: z
      .array(
        z.object({
          name: z.string(),
          content: z.string(),
        }),
      )
      .optional(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "forge_builder",
    invoke: async (input: any) => {
      const { agentRuntime } = await import("@iem/core");
      const specs =
        input.specs || "No specs provided. Build a hello world app.";
      const assets = input.assets || "None";
      const response = await agentRuntime.chat({
        model: "gemini-2.5-pro",
        messages: [
          {
            role: "user",
            content: `Generate production-grade code for this spec: ${specs}. Design guidelines: ${assets}.
            
            IMPORTANT: Return a JSON object with a "files" array. Each item in "files" should have a "name" (filename with extension) and "content" (the file body).
            Include:
            1. The main entry point (e.g. app.py, index.tsx, main.ts).
            2. A README.md explaining what the app is and how to use it.
            3. A setup script (e.g. setup.sh or install.bat) that installs dependencies and prepares the environment.
            4. Any other necessary files (requirements.txt, package.json, etc.).

            If the spec is for a browser game, generate a directly playable web game:
            - Include index.html, style.css, game.js, and README.md.
            - The game must run by opening index.html in a browser with no server and no build step.
            - Include clear keyboard/mouse/touch controls, visible score or objective state, win/loss or replay behavior, and a polished game loop.
            - Keep external assets optional; prefer CSS/canvas/DOM primitives so the ZIP works offline.
            
            Return ONLY the raw JSON object, no markdown code blocks, no preamble.`,
          },
        ],
      });

      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          if (result.files && Array.isArray(result.files)) {
            const mainFile = result.files.find(
              (f: any) =>
                f.name.endsWith(".py") ||
                f.name.endsWith(".ts") ||
                f.name.endsWith(".tsx") ||
                f.name.endsWith(".js"),
            );
            return {
              success: true,
              generatedCode: mainFile
                ? mainFile.content
                : JSON.stringify(result, null, 2),
              files: result.files,
            };
          }
        }
      } catch (e) {
        console.warn("Failed to parse builder results as multi-file JSON", e);
      }

      return { success: true, generatedCode: response.content };
    },
  },
};

export const testerBlock: BlockDefinition<any, any> = {
  id: "iem.forge.tester",
  name: "Tester",
  description: "Evaluates the generated code against the initial spec",
  category: "forge",
  input: z.object({
    generatedCode: z.string().optional(),
    specs: z.string().optional(),
  }),
  output: z.object({
    success: z.boolean(),
    results: z.object({
      tests: z.array(
        z.object({
          name: z.string(),
          passed: z.boolean(),
        }),
      ),
    }),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "forge_tester",
    invoke: async (input: any) => {
      const { agentRuntime } = await import("@iem/core");
      const code = input.generatedCode || "// No code provided";
      const specs = input.specs || "No spec provided";
      const response = await agentRuntime.chat({
        model: "gemini-2.5-pro",
        messages: [
          {
            role: "user",
            content: `Test this code: ${code} against this spec: ${specs}. Return a JSON object with a "tests" array where each item has "name" and "passed" (boolean).`,
          },
        ],
      });

      try {
        // Extract JSON from response
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const results = JSON.parse(jsonMatch[0]);
          return { success: true, results };
        }
      } catch (e) {
        console.warn("Failed to parse tester results as JSON", e);
      }

      return {
        success: true,
        results: {
          tests: [
            {
              name: "General Check",
              passed: response.content.toLowerCase().includes("pass"),
            },
          ],
        },
      };
    },
  },
};
