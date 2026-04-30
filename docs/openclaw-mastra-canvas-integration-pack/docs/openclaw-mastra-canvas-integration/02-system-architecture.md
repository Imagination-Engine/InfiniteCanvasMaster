# 02 — System Architecture

## Target Architecture

```txt
Balnce Imagination Canvas
  ├── Canvas Shell
  ├── Infinite Viewport
  ├── Object Graph
  ├── Block Registry
  ├── Block Inspector
  ├── Expansion Surfaces
  └── Event Bus
        ↓
OpenClaw Block Runtime Layer
  ├── OpenClawBlock contract
  ├── OpenClawBlock renderer
  ├── OpenClawBlock inspector
  ├── OpenClawBlock adapter
  ├── OpenClaw event stream
  ├── OpenClaw policy state
  └── OpenClaw approval queue
        ↓
Mastra Substrate
  ├── Supervisor agents
  ├── Agent networks
  ├── Workflows
  ├── Tools
  ├── Memory
  ├── Model routing
  ├── Observability
  ├── Evaluation
  └── Human-in-the-loop controls
        ↓
Balnce Policy + Runtime Router
  ├── permission engine
  ├── sandbox policy
  ├── budget policy
  ├── model routing policy
  ├── memory policy
  ├── provenance policy
  └── kill switch
        ↓
Execution Targets
  ├── Local OpenClaw Gateway
  ├── Local on-device models
  ├── Personal device mesh
  ├── Cloudflare Edge Twin
  ├── Cloud foundation models
  ├── Specialized modality models
  ├── External APIs/tools
  └── OpenClaw nodes/channels/sessions
```

## Responsibility Boundaries

### Canvas

The canvas owns:

- visual placement
- object rendering
- selection and grouping
- inspection/expansion
- user interactions
- block lifecycle display
- canvas event routing
- spatial context preservation

The canvas does not directly execute host-level OpenClaw tools.

### OpenClaw Block Runtime Layer

The OpenClaw Block layer owns:

- block contract
- adapter boundary
- runtime binding
- session state
- task state
- skills/tool visibility
- approval requests
- event streaming
- runtime status
- safe rendering of OpenClaw activity

It must not bypass policy or sandboxing.

### Mastra

Mastra owns:

- task decomposition
- workflow orchestration
- agent supervision
- model/tool invocation
- human-in-the-loop suspension/resumption
- multi-agent routing
- controlled execution flows
- observability hooks

Mastra should not be treated merely as a chat SDK. It is the orchestration substrate.

### Balnce Policy Layer

The policy layer owns:

- allowed tools
- denied tools
- approved skills
- runtime sandbox mode
- spend limits
- model route permissions
- local vs edge vs cloud routing
- sensitive action approvals
- memory scope
- provenance requirements
- revocation
- kill switch

## Integration Principle

The canvas should communicate with OpenClaw through a stable adapter, not through raw internal implementation details.

Bad:

```txt
React component → raw OpenClaw internal API → host tools
```

Good:

```txt
React component → OpenClawBlockAdapter → Policy Engine → Mastra Runtime → OpenClaw session/tool call
```

## Data Flow: Single OpenClaw Task

```txt
User gives task to OpenClaw Block
  ↓
Canvas emits openclaw.task.requested
  ↓
Policy engine evaluates block permissions and budget
  ↓
Mastra decides whether this is agent, workflow, or supervised task
  ↓
OpenClawBlockAdapter starts or resumes session/task
  ↓
OpenClaw emits events
  ↓
Events stream back into Mastra and Canvas
  ↓
Block updates compact/inspect/expanded state
  ↓
Outputs become artifacts or child blocks
  ↓
PLOG/provenance hooks record action/output history
```

## Data Flow: Group OpenClaw Task

```txt
User selects 5 OpenClaw Blocks and creates group task
  ↓
Canvas creates CanvasAgentGroup
  ↓
Mastra creates supervisor/network/workflow
  ↓
Supervisor assigns subtasks to selected OpenClaw Blocks
  ↓
Each block runs within its own policy/memory/sandbox scope
  ↓
Events stream to group timeline and individual block timelines
  ↓
Approval requests are aggregated for user review
  ↓
Outputs become grouped artifacts, workflow state, or canvas blocks
```

## Non-Goals

Do not implement:

- unrestricted OpenClaw host access
- blind OpenClaw UI iframe
- a fake runtime with static status
- generic automation block without OpenClaw-specific contracts
- direct access to secrets in block UI
- unbounded group execution
- uncontrolled third-party skill installation
