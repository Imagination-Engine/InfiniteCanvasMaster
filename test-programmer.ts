import { compileGraphToWorkflow } from "./packages/agents/src/workflows/compiler.ts";
import { initializeBlockRegistry } from "./apps/server/src/registry-init.ts";

initializeBlockRegistry();

const graph = {
  nodes: [
    {
      id: "test-node",
      type: "programmer",
      data: { inputs: { prompt: "Write a python script that prints hi" } },
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
