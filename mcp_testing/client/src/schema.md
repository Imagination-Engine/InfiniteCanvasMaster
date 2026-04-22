# BALNCE AI Core Graph Spec (v1.0)

The **BALNCE AI Core Graph Spec** is a standardized, semantic JSON format designed to store and exchange canvas logic while remaining completely decoupled from UI-specific implementation details (like React Flow's internal state).

This schema ensures interoperability between the frontend, the FastAPI orchestration layer, the Neo4j Knowledge Graph, and the AutoGen agents.

## Core Principles
- **Semantic Mapping**: UI-specific component names are mapped to functional agentic types.
- **UI Decoupling**: Viewport state (zoom/pan) and temporary UI states (selected/dragging) are stripped during serialization.
- **Data Integrity**: The `payload` object contains pure business logic, ensuring LLMs aren't distracted by DOM metadata.

---

## Schema Overview

### 1. Node Object
Represents a functional unit (Agent, Trigger, Logic block) within the canvas.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier for the node. |
| `type` | `string` | Semantic type (mapped from UI component type). |
| `x` | `number` | Persistent horizontal position. |
| `y` | `number` | Persistent vertical position. |
| `width` | `number` | Visual width of the node. |
| `height` | `number` | Visual height of the node. |
| `payload` | `object` | The internal data/logic (e.g., system prompts, values, variables). |

### 2. Edge Object
Represents a logical connection or trigger between two nodes.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier for the edge. |
| `from` | `string` | The `id` of the source node. |
| `to` | `string` | The `id` of the target node. |
| `label` | `string` | Human-readable or machine-trigger description (default: `connected_to`). |

---

## Type Mappings (Adapter Layer)

The following table defines how React Flow UI components map to the **BALNCE AI Core Graph Spec** semantic types:

| UI Component Type | Semantic Spec Type | Description |
| :--- | :--- | :--- |
| `action` | `agent_action` | Represents an LLM or Sandbox execution step. |
| `audioRecording` | `media_audio` | Audio input or processing node. |
| `trigger` | `trigger` | Entry point for a workflow or event listener. |
| `filter` | `logic_filter` | Conditional execution branch. |
| `link` | `external_link` | Reference to an external source or destination. |
| *default* | `generic` | Fallback for any unregistered custom nodes. |

---

## Example Output
Below is an example of the serialized JSON produced by the **Serialization Gate**:

```json
{
  "nodes": [
    {
      "id": "node-1",
      "type": "agent_action",
      "x": 150,
      "y": 100,
      "width": 200,
      "height": 100,
      "payload": {
        "agentName": "Planner",
        "model": "gemini-3.0"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1-2",
      "from": "node-1",
      "to": "node-2",
      "label": "triggers"
    }
  ]
}
```
