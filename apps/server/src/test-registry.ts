import { blockRegistry } from "@iem/core";
import { initializeBlockRegistry } from "./registry-init.js";

async function test() {
  console.log("Static import size BEFORE init:", blockRegistry.list().length);
  initializeBlockRegistry();
  console.log("Static import size AFTER init:", blockRegistry.list().length);

  const dyn = await import("@iem/core");
  console.log(
    "Dynamic import size AFTER init:",
    dyn.blockRegistry.list().length,
  );

  const agents = await import("@iem/agents");
  // @ts-ignore
  console.log(
    "Is blockRegistry same in agents?",
    typeof agents.compileGraphToWorkflow !== "undefined",
  );
}

test();
