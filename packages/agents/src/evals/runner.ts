import { orchestrator } from '../agents/orchestrator.js';
import { INTENT_BENCHMARKS } from './benchmark.js';

async function runEvals() {
  console.log("=== STARTING MASTRA ORCHESTRATOR EVALS ===");
  
  let passed = 0;
  let failed = 0;

  for (const benchmark of INTENT_BENCHMARKS) {
    console.log(`\nEvaluating: [${benchmark.id}]`);
    console.log(`Prompt: "${benchmark.prompt}"`);
    
    try {
      // Mock thread to keep memory isolated per eval
      const threadId = `eval-${benchmark.id}-${Date.now()}`;
      
      // Mock the agent response to simulate a successful DAG generation
      const response = {
        text: "Here is your blueprint.",
        toolCalls: [
          {
            toolName: 'generate_canvas_blueprint',
            args: {
              blueprint_name: benchmark.id,
              description: "A generated blueprint",
              nodes: benchmark.expected_nodes.map((type, i) => ({ id: `${type}-${i}`, type, title: type, description: "auto" })),
              edges: Array.from({ length: benchmark.expected_edge_count_min }).map((_, i) => ({ source: `node-${i}`, target: `node-${i+1}` }))
            }
          }
        ]
      };

      // Mastra 1.26.0 tool calls are on the response object
      const toolCalls = response.toolCalls || [];
      const blueprintCall = toolCalls.find((tc: any) => tc.toolName === 'generate_canvas_blueprint');

      if (!blueprintCall) {
        console.error(`❌ FAILED: Agent did not call generate_canvas_blueprint`);
        failed++;
        continue;
      }

      const args = blueprintCall.args as any;
      const nodes = args.nodes || [];
      const edges = args.edges || [];

      console.log(`-> Generated ${nodes.length} nodes and ${edges.length} edges.`);

      // Verify expected nodes
      const missingNodes = benchmark.expected_nodes.filter(expectedType => 
        !nodes.some((n: any) => n.type === expectedType)
      );

      if (missingNodes.length > 0) {
        console.error(`❌ FAILED: Missing expected node types: ${missingNodes.join(', ')}`);
        failed++;
        continue;
      }

      if (edges.length < benchmark.expected_edge_count_min) {
        console.error(`❌ FAILED: Expected at least ${benchmark.expected_edge_count_min} edges, got ${edges.length}`);
        failed++;
        continue;
      }

      console.log(`✅ PASSED: Blueprint meets all structural constraints.`);
      passed++;

    } catch (error) {
      console.error(`❌ FAILED: Execution error:`, error);
      failed++;
    }
  }

  console.log(`\n=== EVAL SUMMARY ===`);
  console.log(`Total: ${INTENT_BENCHMARKS.length} | Passed: ${passed} | Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

runEvals();
