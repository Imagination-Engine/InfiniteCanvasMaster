import { mastra, storage } from "../packages/agents/src/mastra.config.js";

async function check() {
  console.log("Mastra instance:", !!mastra);
  try {
    const mem = (mastra as any).memory;
    console.log("Mastra memory type:", typeof mem);
    if (mem) {
      console.log("Memory keys:", Object.keys(mem));
      const result = await mem.recall({ threadId: "test-thread" });
      console.log("Recall result:", result);
    }
  } catch (err) {
    console.error("Memory check failed:", err);
  }
}

check().catch(console.error);
