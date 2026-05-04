# Orchestrator Chat Wiring Plan

## Objective

Port the landing page chat interface into a floating, draggable component on the Imagination Canvas that reacts contextually to user actions.

## Components

1. **FloatingOrchestratorChat**: A beautiful, translucent chat window that can be dragged around the screen.
2. **OrchestratorComposer**: The input area.
3. **OrchestratorCanvasAwareness**: A hidden logical component that listens to `useCanvasStore` and pushes system messages into the Mastra message array when blocks are added or selected.

## Interaction Flow

- User drags an `ImagiClaw Sandbox` onto the canvas.
- `useCanvasStore` registers the new object.
- A `useEffect` in the orchestrator hook notices the new block.
- It pushes a hidden system message to the LLM: `[SYSTEM: User added ImagiClaw Sandbox to the canvas]`.
- The orchestrator responds via the `ui_projection` or standard chat stream: "I see you added an ImagiClaw Sandbox. What autonomous task should we configure it for?"
