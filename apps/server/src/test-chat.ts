import { mastra } from "@iem/agents";
import { toAISdkStream } from "@mastra/ai-sdk";

async function testStream() {
  console.log("--- [APPS/SERVER] Testing Mastra to AI SDK Stream ---");
  try {
    const orchestrator = mastra.getAgent("orchestrator");
    console.log(
      "Orchestrator loaded. Model:",
      (orchestrator.model as any).modelId || "unknown",
    );

    const mastraStream = await orchestrator.stream('Say "Test Successful"');

    console.log("Stream started, transforming to AI SDK v6 format...");
    const aiSdkStream = toAISdkStream(mastraStream, {
      from: "agent",
      version: "v6",
    });

    const reader = aiSdkStream.getReader();
    let count = 0;
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value.type === "text-delta") {
        fullText += value.textDelta;
      }
      console.log(`Chunk ${++count}:`, JSON.stringify(value));
    }

    console.log("Full Response:", fullText);
    console.log("--- Test Complete: Success ---");
    process.exit(0);
  } catch (err) {
    console.error("--- Test Failed ---");
    console.error(err);
    process.exit(1);
  }
}

testStream();
