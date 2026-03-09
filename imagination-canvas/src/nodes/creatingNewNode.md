# How to Create a New Node in the Imagination Canvas

The Imagination Canvas uses a highly decoupled, data-driven architecture for its nodes. Instead of building a complex React component for every single node, we define the *data schema* in a central catalog. Then, a `BaseNode` component dynamically renders the UI and wires up the inputs/outputs automatically.

This guide will walk you through the process of creating a new Node from scratch.

---

## The Node Creation Workflow
Creating a new node involves three distinct steps:
1. **Define the Node Schema** (Frontend Catalog)
2. **Register the Node UI** (Frontend Registry)
3. **Implement the Execution Logic** (Backend Service)

---

## Step 1: Define the Node in the Catalog
The single source of truth for node definitions is `src/nodes/nodeCatalog.ts`. Open this file and you will use the `createEntry` function to define your new node's behavior and data types.

### Catalog Entry Example

Here is a template for adding a hypothetical node called `myNewNode`:

```typescript
// Inside src/nodes/nodeCatalog.ts
export const NODE_CATALOG: NodeCatalog = {
  // ... existing nodes ...
  
  myNewNode: createEntry(
    "myNewNode",                 // 1. type string (Unique identifier)
    "creative",                  // 2. category: "creative" | "workflow"
    "My New Node",               // 3. Display label (What the user sees in the UI)
    "Description of what this node does.", // 4. Description shown in the node body
    { sourceText: "text" },      // 5. Input schema (What data types it accepts)
    { resultType: "text" },      // 6. Output schema (What data types it returns)
    { 
      inputs: { sourceText: "" }, 
      config: { additionalInstructions: "default behavior" } 
    },                           // 7. Default values
    "tool"                       // 8. role: "tool" | "action" | "trigger"
  ),
};
```

**Architecture Note:** By strictly defining the `inputSchema` and `outputSchema` here, you enforce data type contracts between nodes before they even attempt to render or connect.

---

## Step 2: Render the Node UI 

Once the node is defined in the catalog, it needs to be mapped to a visual React Flow component. This is handled in `src/nodes/NodeRegistry.ts`.

### 2a. The Default Path (Recommended)
If your node simply needs standard structural inputs (like text inputs and configuration textareas), **you do not need to write any React code.** 

By default, the `NODE_REGISTRY` maps all unrecognized node types to the `BaseNode.tsx` component. The `BaseNode` automatically reads your `inputSchema` and `config` from the catalog and dynamically generates the correct UI fields for you.

### 2b. The Custom UI Path (Advanced)
If your node requires a heavily customized UI (e.g., a custom audio recorder, an interactive map, or a specialized media player):

1. Create a new component file (e.g., `src/nodes/MyCustomNode.tsx`). You can use `src/nodes/TranslatorNode.tsx` as an architectural reference.
2. Open `src/nodes/NodeRegistry.ts`.
3. Explicitly map your new type to your custom component.

```typescript
// Inside src/nodes/NodeRegistry.ts
export const NODE_REGISTRY: NodeRegistry = Object.fromEntries(
  Object.entries(NODE_CATALOG).map(([nodeType, definition]) => [
    nodeType,
    {
      ...definition,
      component: 
        nodeType === "translator" ? TranslatorNode : 
        nodeType === "myNewNode" ? MyCustomNode : // <--- Add this mapping
        BaseNode, // <--- The default fallback
    },
  ]),
);
```

---

## Step 3: Implement the Execution Logic
The visual node is purely the frontend representation. The actual functionality happens in the background service logic, cleanly separated from the UI. 

Where you place this logic depends on the `category` you assigned your node in Step 1.

### If it is a "creative" node (AI, Logic, Formatting)
Open `src/services/ai/creativeNodeService.ts`. Add a new `case` inside the `runCreativeNode` switch statement.

```typescript
// Inside src/services/ai/creativeNodeService.ts
export async function runCreativeNode(
  nodeType: string,
  inputs: Record<string, unknown>,
  config: Record<string, unknown>
): Promise<Record<string, unknown>> {
  
  switch (nodeType) {
    // ... existing cases ...
    
    case "myNewNode": {
      try {
        // 1. Extract your inputs defined in the catalog
        const textToProcess = String(inputs.sourceText ?? "");
        const instructions = String(config.additionalInstructions ?? "");
        
        // 2. Perform your logic (API calls, data transformation, etc.)
        const processedText = await myCustomProcessingLogic(textToProcess, instructions);
        
        // 3. Return the exact structure defined in your outputSchema
        return {
          resultType: processedText
        };
      } catch (error) {
        console.error("MyNewNode error:", error);
        return {
          resultType: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        };
      }
    }
  }
}
```

### If it is a "workflow" node (Third-Party Integrations like Slack or Zoom)
Open `src/services/integrations/workflowService.ts`.
- If your node has the role `"action"`, implement the logic inside the `runIntegrationNode` function.
- If your node has the role `"trigger"`, implement the logic inside the `runTriggerNode` function.

---

## Summary Checklist
- [ ] Added `createEntry` to `src/nodes/nodeCatalog.ts`
- [ ] (Optional) Created a custom UI component and mapped it in `src/nodes/NodeRegistry.ts`
- [ ] Created execution case in `src/services/ai/creativeNodeService.ts` or `src/services/integrations/workflowService.ts`

Following this data-driven pattern ensures that all nodes remain modular, strictly typed, and visually consistent across the application.
