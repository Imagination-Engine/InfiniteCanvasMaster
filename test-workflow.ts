import { compileGraphToWorkflow } from "./packages/agents/src/workflows/compiler.ts";
import { blockRegistry } from "./packages/core/src/block/registry.ts";
import { initializeBlockRegistry } from "./apps/server/src/registry-init.ts";
import { z } from "zod";

initializeBlockRegistry();

const graph = {
  nodes: [
    {
      id: "test-node",
      type: "forge.builder",
      data: { inputs: { spec: "A simple hello world in javascript." } },
    },
  ],
  edges: [],
};

async function run() {
  const workflow = compileGraphToWorkflow(graph, {});
  const runObj = await workflow.createRun({ disableScorers: true });
  const result = await runObj.start({ inputData: { triggerData: {} } });
  console.log(JSON.stringify(result, null, 2));
}

run().catch(console.error);
