import {
  BalnceFabricRouter,
  InProcessTransport,
  DurableEventAdapter,
} from "@iem/core";

async function main() {
  console.log("=== Durable Pipeline Diagnostic Script ===");

  const transport = new InProcessTransport();
  const router = new BalnceFabricRouter(transport);
  const durableAdapter = new DurableEventAdapter(router);

  // Subscribe to verify event was published
  transport.subscribe({ lanes: ["durable_event"] }, (envelope) => {
    console.log(
      "[Diagnostic] Received durable event:",
      JSON.stringify(envelope, null, 2),
    );
  });

  const runId = `diag-${Date.now()}`;
  console.log(`[Diagnostic] Emitting approval.required for run: ${runId}`);

  await durableAdapter.recordFact(runId, "approval.required", {
    reason: "Developer diagnostic check",
    timestamp: new Date().toISOString(),
  });

  console.log(
    "[Diagnostic] Event emitted. In a real environment, verify Postgres/Cloudflare logs.",
  );

  // Wait a bit for async propagation
  setTimeout(() => {
    console.log("=== Diagnostic Complete ===");
    process.exit(0);
  }, 1000);
}

main().catch(console.error);
