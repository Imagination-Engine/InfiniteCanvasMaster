# BALNCE AI: Imagination Canvas Platform
## Technical Specification & Implementation Blueprint

**Project**: Imagination Canvas - Multi-Agent Orchestrated Creative Collaboration Platform  
**Revision**: 1.0  
**Date**: January 26, 2026  
**Status**: Production Ready - 6 Sprint Implementation Plan  
**Team Size**: 5 Engineers | 6 Weeks Duration

---

## EXECUTIVE SUMMARY

BALNCE AI's Imagination Canvas is a web-based, agent-orchestrated platform that empowers users to transform intent into collaborative digital artifacts. By combining multi-agent autonomy (AutoGen), local intelligence (LLMs via LlamaCPP/Candle), cloud-scale processing (Gemini 3.0 API), and robust sandbox execution (Cloudflare Durable Objects), the platform provides a non-linear, intelligent canvas where users can think, create, and build without friction.

**Core Hypothesis**: Intelligent agents + powerful tooling + sandboxed execution + knowledge persistence = exponential human creative velocity.

**Desired Outcome**: Beta-ready platform enabling users to accomplish use cases like "I want to build a business," "I want to research and build an app," or "I want to create a movie-quality video with my own characters"—all orchestrated by coordinating AI agents within a single unified canvas.

---

## SECTION 1: ARCHITECTURE OVERVIEW

### 1.1 System Layers

```
┌─────────────────────────────────────────────────────┐
│         WEB UI / IMAGINATION CANVAS (React)         │
│              (Affine or React Custom)               │
├─────────────────────────────────────────────────────┤
│    Canvas Block Layer (Intelligent Block Agents)    │
│   (Content, Image, Video, Chat, Code, Sandbox, etc) │
├─────────────────────────────────────────────────────┤
│   Orchestration Layer (AutoGen + Message Bus)       │
│      (Agent Coordination, Intent Parsing, Flow)     │
├─────────────────────────────────────────────────────┤
│   Local Backend (Python FastAPI)                    │
│      (Logic, State, Local LLM Inference)            │
├─────────────────────────────────────────────────────┤
│   Hybrid Intelligence Layer                         │
│   ┌─────────────────┬──────────────┬──────────────┐ │
│   │  LlamaCPP/      │  Gemini 3.0  │  Specialized │ │
│   │  Candle (SLM)   │  API (Cloud) │  Models      │ │
│   └─────────────────┴──────────────┴──────────────┘ │
├─────────────────────────────────────────────────────┤
│   Sandbox Execution Layer (Durable Objects)         │
│      (RAM, Terminal, Linux, Coding Tools)           │
├─────────────────────────────────────────────────────┤
│   Persistence Layer                                 │
│   ┌──────────────┬──────────────┬─────────────────┐ │
│   │  Vector DB   │  Document DB │  Knowledge      │ │
│   │  (Embeddings)│  (Metadata)  │  Graph (Neo4j)  │ │
│   └──────────────┴──────────────┴─────────────────┘ │
├─────────────────────────────────────────────────────┤
│   Protocol Layer                                    │
│   ┌──────────┬──────────┬──────────┬──────────────┐ │
│   │ MCP      │ A2A      │ ZeroMQ   │ WebSocket    │ │
│   │ (Tools)  │ (Agents) │ (Bus)    │ (Realtime)   │ │
│   └──────────┴──────────┴──────────┴──────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 1.2 Data Flow: Intent to Artifact

```
User Input (Natural Language)
    ↓ [Canvas UI captures intent]
Parsed Intent + Context
    ↓ [LLM analyzes intent structure]
Intent Deconstruction → Interconnected Canvas Blocks
    ↓ [AutoGen orchestrates agent delegation]
Multi-Agent Execution Pipeline
    ├→ [Local SLM for light ops]
    ├→ [Gemini API for complex reasoning]
    └→ [Durable Object sandbox for code/compute]
Block Artifacts Generated (Rich Content)
    ↓ [Knowledge graph updated, embeddings stored]
Canvas Updated + Rendered
    ↓ [User can iterate, branch, or spawn new agents]
Artifacts Persisted → Knowledge Graph Enriched
```

---

## SECTION 2: TECHNOLOGY STACK (DETAILED)

### 2.1 Frontend Layer

**Primary UI Framework**: React 18+ (TypeScript)
- **State Management**: Zustand or Jotai (lightweight, agentic-friendly)
- **Canvas/Infinite Editor**:
  - **Option A (Recommended Start)**: Affine (open-source, agent-ready, active community)
  - **Option B (Custom)**: React + TldrawJS or Excalidraw (faster iteration if vibe-coded)
  - **Decision Gate**: Week 1 PoC testing determines final choice

**Styling & Components**:
- TailwindCSS + Headless UI for rapid iteration
- Custom design tokens for "imagination canvas" aesthetic
- Dark mode as default (creative work environment)

**Real-time Communication**: WebSocket (Socket.io) → Local backend
- Bi-directional block updates
- Live agent status indicators
- Streaming responses from agents

**Vibe Coding Acceleration**:
- Use Gemini Build or similar tool to rapidly prototype UI/UX
- Extract React components into project
- Landing pages + marketing materials (time permitting)

### 2.2 Backend: Local Intelligence Layer

**Core Framework**: Python 3.11+ FastAPI
- Async-first architecture for high concurrency
- Dependency injection for modular agent wiring
- Built-in OpenAPI documentation

**Local LLM Inference Options** (Rank by Recommendation):

1. **LlamaCPP** (llama-cpp-python)
   - Most mature, battle-tested, easy setup
   - CPU + GPU acceleration (CUDA/Metal)
   - Model: Llama 2 13B or Mistral 7B (default)
   - Typical latency: 0.5-2s per token (GPU), 5-10s (CPU)

2. **Candle** (Rust-based, emerging leader)
   - Superior performance, memory efficiency
   - Excellent for production systems
   - Learning curve steeper; consider for Sprint 2+

3. **Executorch** (Meta's optimized runtime)
   - Mobile-first optimization, small footprints
   - Excellent for edge deployment
   - Less mature for server-side use (Sprint 3+)

**Decision**: Start with **LlamaCPP** (week 1 setup), evaluate Candle in Sprint 2 if performance requirements demand it.

**Model Strategy**:
- Local SLM: Llama 2 13B or Mistral 7B (instruction-tuned)
- Fine-tune on domain tasks (agent instructions, block parsing)
- Quantize to 4-bit for memory efficiency (GGUF format)

### 2.3 Hybrid Cloud Intelligence

**Gemini 3.0 API Integration**:
- **Purpose**: Supplement local SLM for complex reasoning, code generation, cross-domain synthesis
- **Trigger Logic**: 
  - SLM confidence < 0.7 → escalate to Gemini
  - Complex multi-step reasoning → Gemini
  - Code generation requiring high accuracy → Gemini
  - Fall back to SLM when latency critical (streaming, real-time)
  
**Connection Strategy**:
- Async API calls with fallback patterns
- Circuit breaker for quota management
- Request batching to optimize API costs
- Cache responses in vector DB for future intent matching

**Cost Optimization**:
- Default to local SLM for 80% of workloads
- Use Gemini for high-impact, low-frequency tasks
- Monitor token usage weekly; adjust routing dynamically

### 2.4 Agent Orchestration: AutoGen + Extensions

**AutoGen Core** (v0.2+):
- **Agent Types**:
  - **UserProxyAgent**: Canvas UI interface (receives user intent, approves major decisions)
  - **AssistantAgent**: Core reasoning agents (one per major capability)
  - **ToolUseAgent**: Executes tools, commands, API calls
  - **ExecutorAgent**: Manages Durable Object sandbox execution
  - **BlockAgent**: Specialized per-block logic (ContentBlockAgent, CodeBlockAgent, etc.)

**Multi-Agent Conversation Architecture**:
```
UserProxyAgent (Canvas)
    ├─→ IntentParserAgent (decodes user intent)
    ├─→ WorkflowCoordinatorAgent (maps to block pipeline)
    ├─→ BlockAgents (one per active canvas block)
    │   ├─→ ContentBlockAgent
    │   ├─→ CodeBlockAgent
    │   ├─→ SandboxBlockAgent
    │   └─→ [others per block type]
    ├─→ KnowledgeGraphAgent (updates semantic connections)
    └─→ MemoryAgent (stores intent→solution patterns, video memory)
```

**High-Speed Internal Communication** (Message Bus):
- **Primary**: ZeroMQ (for inter-agent communication within backend)
  - Pub/Sub pattern for broadcast (state updates, new task notifications)
  - Request/Reply for synchronous agent queries
  - Configuration: localhost:5555 (default, configurable)
  - Language-agnostic; allows Python ↔ Node.js communication if needed

- **Alternative** (if ZeroMQ insufficient): Apache Kafka or RabbitMQ (Sprint 2 evaluation)

**Message Bus Schema** (JSON):
```json
{
  "msg_id": "uuid",
  "timestamp": "ISO8601",
  "source_agent": "IntentParserAgent",
  "dest_agents": ["BlockAgent::content_1", "KnowledgeGraphAgent"],
  "msg_type": "task_dispatch|query|update|result",
  "payload": {
    "intent": "...",
    "context": {...},
    "parameters": {...}
  },
  "priority": "critical|high|normal|low"
}
```

**Agent Memory** (Innovations):
- **Conversational Memory**: Multi-turn context window (last 20 exchanges per agent)
- **Episodic Memory**: Successful task completions stored as reusable templates
- **Semantic Memory**: Knowledge graph (see Section 2.7)
- **Video Memory** (Future Innovation):
  - Frame embeddings from user video uploads
  - Enables agents to reason about visual intent
  - Implementation: Spring 2 (after core canvas stable)

**Clawd Bot Integration**:
- **Analysis**: Deconstruct ClaudBot codebase for:
  - Agent skill libraries (custom tools, plugins)
  - Emergence patterns (how capabilities compound)
  - Error handling & recovery strategies
- **Implementation Approach**:
  - Extract core skill definitions as AutoGen ToolGroup
  - Map ClaudBot's tool composition patterns to AutoGen GroupChat
  - Reuse proven interaction patterns for complex workflows

### 2.5 Agentic Sandbox: Cloudflare Durable Objects

**Architecture**:
```
FastAPI Backend receives "execute code" request
    ↓
ExecutorAgent determines sandbox requirement
    ↓
Request → Cloudflare Durable Object (SandboxRuntime class)
    ↓
Durable Object instantiates isolated execution environment:
    ├─ RAM: ~512MB - 2GB (configurable per task)
    ├─ Storage: Transactional KV store
    ├─ Network: Full internet access
    ├─ Terminal: Full bash shell access
    ├─ OS: Linux container (Cloudflare managed)
    ├─ Preinstalled: Node.js, Python, Git, Docker CLI
    └─ Execution Timeout: 30min (configurable)
    ↓
Agent executes code/commands in sandbox
    ↓
Output streamed back to ExecutorAgent
    ↓
Final artifact moved to Canvas via WebSocket
```

**Key Durable Object Methods**:
```python
class SandboxRuntime:
    async def execute_code(self, code: str, language: str) -> ExecutionResult:
        """Execute code in isolated sandbox."""
        pass
    
    async def execute_shell(self, command: str) -> TerminalOutput:
        """Execute bash command with full shell access."""
        pass
    
    async def mount_volume(self, path: str, contents: str) -> VolumeHandle:
        """Create temporary mounted volume (e.g., file structure)."""
        pass
    
    async def get_status(self) -> SandboxStatus:
        """Check sandbox resource usage."""
        pass
    
    async def cleanup(self) -> None:
        """Clean shutdown, return output to caller."""
        pass
```

**Provisioning Strategy**:
- On-demand: Agent requests sandbox → Durable Object instantiated within 100ms
- Pooling (optional optimization): 2-3 warm sandboxes in pool for instant access
- Billing: Per-execution cost (~$0.15 per 10min of execution on Cloudflare)

**Integration Points**:
- Worker (Frontend API Gateway) → routes sandbox requests → Durable Object
- Durable Object → maintains persistent state for long-running tasks
- Stateful coordination: multiple requests to same sandbox use same instance

### 2.6 Protocol Layer: MCP, A2A, WebSocket

**Model Context Protocol (MCP)**:
- **Used for**: Tool integration, external API connections
- **Implementation**: FastAPI-based MCP server per tool category
  - `tools/browser.py` (web scraping, navigation)
  - `tools/code.py` (code analysis, generation)
  - `tools/search.py` (web search, knowledge retrieval)
  - `tools/math.py` (symbolic computation, verification)
  
- **Agent Access**:
  ```python
  @tool("web_search")
  def search_web(query: str) -> list[SearchResult]:
      """Search the web for information."""
      pass
  
  # AutoGen agent automatically gains access
  agent.register_tool(search_web)
  ```

**A2A (Agent-to-Agent) Protocol**:
- **Standard**: OpenAI Agent Protocol (emerging standard)
- **Message Format**: Standardized JSON exchanges (task, response, error)
- **Benefits**: Enables external agents to join canvas (future extensibility)
- **Implementation**: Wrapper layer translating AutoGen messages ↔ OpenAI Agent Protocol

**ZeroMQ Message Bus** (detailed):
- **Topology**: PUB/SUB + REQUEST/REPLY hybrid
- **Pub/Sub endpoints**:
  - `tcp://127.0.0.1:5555` (state broadcasts, events)
  - All agents subscribe to relevant topics
  
- **Request/Reply endpoints**:
  - `tcp://127.0.0.1:5556` (synchronous queries)
  - Agent waits for response (timeout: 5s default)

**WebSocket (Client ↔ Server)**:
- Used exclusively for human user interactions with Canvas UI
- Separate from internal agent communication (ZeroMQ)
- Heartbeat: 30s (keep-alive)
- Reconnection: exponential backoff, max 5 retries

---

## SECTION 3: CANVAS BLOCKS & SCHEMA

### 3.1 Block Taxonomy (Core Blocks for MVP)

| Block Type | Purpose | Agent Capability | Integration |
|-----------|---------|-----------------|---|
| **ContentBlock** | Rich text, markdown editor | ContentBlockAgent | Local SLM (editing assist) |
| **ImageBlock** | Image creation, editing, gallery | ImageBlockAgent | Gemini Vision API (analysis + generation) |
| **VideoBlock** | Video generation, editing, composition | VideoBlockAgent | External API (Runway, D-ID) + Sandbox for ffmpeg |
| **CodeBlock** | Code editor, syntax highlight, execution | CodeBlockAgent | Sandbox execution (compile + run) |
| **ChatBlock** | Multi-turn conversation, agent chat | ChatBlockAgent | Local SLM + Gemini hybrid |
| **SandboxBlock** | Agentic coder, full execution environment | SandboxBlockAgent | Durable Object (execution) |
| **BrowserBlock** | Web browsing, screenshot, scraping | BrowserBlockAgent | MCP browser tool + headless Chrome |
| **ProductBlock** | Ecommerce integration, checkout | ProductBlockAgent | Stripe/Payment API integration |
| **ListicleBlock** | Structured content lists, rankings | ListicleBlockAgent | Local SLM (content generation) |
| **SearchBlock** | Knowledge search, research interface | SearchBlockAgent | MCP search + knowledge graph query |
| **AIGenerativeBlock** | Generic AI generation (image, text, code) | AIGenBlockAgent | Gemini + specialized models |

### 3.2 Canvas Block Schema (JSON)

```json
{
  "block_id": "uuid",
  "block_type": "ContentBlock | ImageBlock | CodeBlock | ...",
  "created_at": "ISO8601",
  "updated_at": "ISO8601",
  "position": {
    "x": 100,
    "y": 200,
    "width": 400,
    "height": 300,
    "z_index": 1
  },
  "metadata": {
    "title": "My First Thought",
    "tags": ["research", "idea"],
    "importance": "high"
  },
  "content": {
    "raw": "...",
    "formatted": "...",
    "media": [{"type": "image", "url": "..."}]
  },
  "state": {
    "locked": false,
    "editing": false,
    "agent_active": true
  },
  "relations": {
    "linked_blocks": ["block_id_2", "block_id_3"],
    "parent_block": "block_id_parent"
  },
  "agent_metadata": {
    "agent_id": "ContentBlockAgent::instance_1",
    "capabilities_applied": ["grammar_check", "tone_adjustment"],
    "last_agent_edit": "ISO8601",
    "confidence": 0.92
  }
}
```

### 3.3 Knowledge Graph Schema (Neo4j)

```cypher
// Node Labels
CREATE CONSTRAINT user_id UNIQUE FOR (n:User) REQUIRE n.user_id IS UNIQUE;
CREATE CONSTRAINT block_id UNIQUE FOR (n:CanvasBlock) REQUIRE n.block_id IS UNIQUE;
CREATE CONSTRAINT intent_id UNIQUE FOR (n:Intent) REQUIRE n.intent_id IS UNIQUE;
CREATE CONSTRAINT concept_name UNIQUE FOR (n:Concept) REQUIRE n.name IS UNIQUE;

// Relationship Types
(User) -[CREATED]-> (Canvas)
(Canvas) -[CONTAINS]-> (CanvasBlock)
(CanvasBlock) -[IMPLEMENTS]-> (Intent)
(CanvasBlock) -[REFERENCES]-> (Concept)
(Concept) -[RELATED_TO]-> (Concept)
(Intent) -[COMPOSED_OF]-> (Intent)  // Intent decomposition
(Agent) -[MODIFIED]-> (CanvasBlock)
(Task) -[PRODUCES]-> (CanvasBlock)

// Example Query: Find all blocks related to "machine learning"
MATCH (c:Concept {name: "machine learning"}) 
<-[r:REFERENCES]- (b:CanvasBlock)
RETURN b, r, c
```

### 3.4 Intent Parsing & Block Decomposition

**Challenge**: Transform free-form user intent into structured, interconnected canvas blocks.

**Solution: Three-Tier Intent Pipeline**

**Tier 1: Local Fast Path** (LlamaCPP, <200ms)
- Input: Raw user intent string
- Process: Template matching against known intents
- Output: High-confidence intent classification (95%+ on common queries)
- Examples:
  - "write me an article about AI" → ContentBlock (Article template)
  - "generate an image of a spaceship" → ImageBlock (generation prompt)
  - "code a Python function" → CodeBlock (with language hint)

**Tier 2: Hybrid Reasoning** (Gemini API, 1-2s)
- Input: Medium-confidence or novel intents (<95%)
- Process: 
  1. Structured reasoning about user goal
  2. Identification of sub-intents (decomposition)
  3. Block mapping recommendation
  4. Relationship inference (which blocks link?)
- Output: Block structure + relationships (JSON)

**Tier 3: Complex Synthesis** (Durable Object, 5-30s)
- Input: Multi-step, creative, or deeply novel intents
- Process:
  1. Environment research (web search for context)
  2. Precedent analysis (similar projects/approaches)
  3. Block pipeline generation (ordered sequence)
  4. Agent assignment (which agents execute each block)
- Output: Full execution plan + intermediate checkpoints

**Example: "I want to build a business"**

```
User Intent: "I want to build a business"
    ↓ [Tier 1: Fast classification]
Primary Intent: "Entrepreneurship Ideation"
    ↓ [Tier 2: Decompose + recommend blocks]
Sub-Intents:
  1. "Validate business idea" → SearchBlock (market research)
  2. "Define business model" → ContentBlock (canvas for planning)
  3. "Create financial projections" → CodeBlock (spreadsheet + formulas)
  4. "Build landing page" → SandboxBlock (agentic coder)
  5. "Generate marketing materials" → ImageBlock + ContentBlock
    ↓ [Create interconnected blocks]
Canvas initialized with 5 blocks, auto-linked by intent
    ↓ [Agents activate]
SearchBlockAgent: Begin market research...
ContentBlockAgent: Prepare business model template...
CodeBlockAgent: Initialize financial model...
    ↓
User iterates, adds new blocks, refines intent
```

**Intent Parsing Implementation**:

```python
# intent_parser.py
class IntentParser:
    def __init__(self, local_llm, gemini_client, vector_store):
        self.local_llm = local_llm
        self.gemini = gemini_client
        self.vector_store = vector_store  # embeddings for intent matching
    
    async def parse(self, intent: str, context: dict) -> IntentResult:
        """Parse user intent → block structure."""
        
        # Tier 1: Fast path
        embedding = self.vector_store.embed(intent)
        similar_intents = self.vector_store.search(embedding, k=3)
        
        if similar_intents[0].confidence > 0.95:
            return self._map_to_blocks(similar_intents[0])
        
        # Tier 2: Hybrid reasoning
        gemini_result = await self.gemini.analyze_intent(
            intent=intent,
            context=context,
            prompt=INTENT_ANALYSIS_PROMPT
        )
        
        if gemini_result.confidence > 0.80:
            blocks = self._construct_blocks(gemini_result)
            # Store for future reference
            self.vector_store.add(intent, gemini_result.embedding)
            return blocks
        
        # Tier 3: Complex synthesis (expensive, rare)
        sandbox_result = await self._invoke_durable_object(
            task="deep_intent_analysis",
            payload={"intent": intent, "gemini_reasoning": gemini_result}
        )
        return self._construct_complex_blocks(sandbox_result)
    
    async def _invoke_durable_object(self, task: str, payload: dict):
        """Request complex reasoning from sandbox."""
        response = await self.durable_object_client.post(
            f"/analyze/{task}",
            json=payload
        )
        return response.json()
```

---

## SECTION 4: USER FLOWS & UI/UX ARCHITECTURE

### 4.1 Core User Flows

**Flow 1: Onboarding & Authentication**
```
User lands on site
    ↓
Sign Up / Log In (OAuth + Email)
    ├─→ Identity service (Auth0 or custom)
    ├─→ Create user profile
    └─→ Generate default workspace
    ↓
Set preferences (local vs cloud inference, theme, etc.)
    ↓
Tutorial / First Canvas (interactive walkthrough)
    ↓
Ready to create
```

**Flow 2: Core Creation Loop**
```
User opens Canvas (blank or existing)
    ↓
Express Intent (natural language input)
    ↓
Intent Parsed → Blocks Created + Linked
    ↓
Agents Activate (each block gets agent)
    ↓
User Iterates:
    ├─→ Add/remove blocks
    ├─→ Modify block content
    ├─→ Request agent assistance (highlight text → "improve this")
    ├─→ Merge/branch blocks
    └─→ Review agent suggestions (approve/reject)
    ↓
Export / Publish (move canvas artifacts to external platforms)
```

**Flow 3: Collaboration & Sharing**
```
User creates canvas
    ↓
Share link generated (public or private)
    ↓
Collaborator joins
    ↓
Real-time sync (WebSocket) for:
    ├─ Block edits
    ├─ Agent activity
    ├─ Comments & mentions
    └─ Version history
    ↓
Collaborators can spawn sub-agents for parallel work
```

**Flow 4: Settings & Account Management**
```
User settings page
    ├─ Profile info (name, avatar, bio)
    ├─ Workspace settings (name, members, permissions)
    ├─ Inference preferences:
    │  ├─ Local-first vs cloud-first
    │  ├─ Gemini API key management
    │  └─ Model selection (Llama vs other SLMs)
    ├─ Data & Privacy:
    │  ├─ Canvas export (JSON, markdown, media)
    │  ├─ Data deletion
    │  └─ Usage analytics
    └─ Billing (if applicable)
```

### 4.2 Open-Source UI/UX Acceleration Options

**Identity & Auth**:
- **Supabase Auth** (open-source Firebase alternative) ✓ Recommended
  - Built-in OAuth, email/password, magic links
  - Row-level security for canvases
  - PostgreSQL backend
  
- Alternative: **Keycloak** (enterprise-grade, self-hosted)

**Form Building & Validation**:
- **React Hook Form** + **Zod** (type-safe validation)
- Pre-built component library (Headless UI, Shadcn/ui)

**Canvas/Infinite Editor**:
- **Affine** (open-source, canvas-native, agent-friendly)
  - Rich block editing
  - Real-time collaboration
  - Plugin system for custom blocks
  
- Alternative custom build: **React** + **TldrawJS** (if custom styling required)

**UI Component Kit**:
- **Shadcn/ui** (Radix UI + Tailwind, composable, copy-paste)
- **Storybook** for component documentation

**Charts & Data Visualization** (if needed):
- **Recharts** or **Visx** (lightweight, React-native)

**Real-time Sync**:
- **Socket.io** (fallback: **ws** or **@hapi/nes**)
- **Yjs** for operational transformation (if CRDT collaboration needed later)

**Vibe Coding for Speed**:
- **Gemini Build**: Generate React components from descriptions
  - Generates component code → extract to project
  - Builds landing pages rapidly
  
- Alternative: **v0.dev** (Vercel's design-to-code tool)

### 4.3 Page Structure (Sitemap)

```
/
  ├─ /auth
  │   ├─ /signup
  │   ├─ /login
  │   └─ /recover-password
  ├─ /dashboard
  │   ├─ / (workspace overview, recent canvases)
  │   ├─ /new (create new canvas, choose template)
  │   └─ /templates (template gallery)
  ├─ /canvas/:canvas_id
  │   ├─ / (main canvas editor)
  │   ├─ /history (version history)
  │   └─ /share (sharing & collaboration settings)
  ├─ /settings
  │   ├─ /profile
  │   ├─ /workspace
  │   ├─ /inference
  │   ├─ /privacy
  │   └─ /billing
  └─ /docs
      ├─ /guides
      ├─ /api
      └─ /faq
```

---

## SECTION 5: IMPLEMENTATION ROADMAP (6 Sprints)

### Sprint 1 (Week 1): Foundation & Setup
**Goal**: Vertical slice of core platform working (intent → canvas block)

**Tasks** (Dependencies-ordered for 5-person team):

1. **Backend Setup** (Engineer A: Backend Lead)
   - [ ] Initialize FastAPI project, PostgreSQL DB, Redis
   - [ ] Configure LlamaCPP with Llama 2 13B model (GGUF, quantized)
   - [ ] Set up AutoGen environment, install dependencies
   - [ ] Create basic FastAPI routes (health, inference)
   - **Deliverable**: Local LLM responds to inference requests (<2s latency)

2. **Gemini Integration** (Engineer B: Cloud Integration)
   - [ ] Register Gemini 3.0 API credentials
   - [ ] Build Gemini API client with circuit breaker + fallback logic
   - [ ] Create hybrid inference router (local vs cloud decision tree)
   - [ ] Test cost estimation (log all API calls)
   - **Deliverable**: System routes requests optimally (80% local, 20% Gemini)

3. **Frontend Scaffold** (Engineer C: Frontend Lead)
   - [ ] Create React + TypeScript project (Vite starter)
   - [ ] Set up TailwindCSS, Shadcn/ui
   - [ ] Evaluate Affine vs custom React canvas (PoC testing)
   - [ ] Build layout shell (nav, sidebar, canvas area)
   - [ ] Implement WebSocket client (stub endpoints)
   - **Deliverable**: Canvas UI renders, connects to backend, no errors

4. **Agent Core** (Engineer D: Agent Orchestration)
   - [ ] Build IntentParserAgent (local + Gemini paths)
   - [ ] Create BlockAgentFactory (generates agents per block type)
   - [ ] Set up ZeroMQ message bus (basic pub/sub)
   - [ ] Test agent-to-agent communication
   - **Deliverable**: Agent team can coordinate, respond to parsed intents

5. **Vector Store & Knowledge Graph** (Engineer E: Persistence)
   - [ ] Set up Qdrant or Pinecone (vector embeddings)
   - [ ] Set up Neo4j (knowledge graph)
   - [ ] Create intent embedding pipeline (store successful intents)
   - [ ] Build graph schema (User, Canvas, Block, Intent, Concept)
   - **Deliverable**: System can embed intents and query similar past intents

**End-of-Sprint Acceptance**: User enters intent ("write an article about AI") → system creates ContentBlock with agent-generated outline.

**Estimated Hours**: 160h team / ~32h per engineer

---

### Sprint 2 (Week 2): Canvas Blocks & Agents
**Goal**: Multiple block types working, agents autonomously generating content

**Tasks** (Engineer rotation; maintain dependencies):

1. **Block Implementation** (Engineer A + C)
   - [ ] ContentBlockAgent (text editing, grammar assist)
   - [ ] CodeBlockAgent (syntax highlighting, execution prep)
   - [ ] ImageBlockAgent (basic image display, generation prompt UI)
   - [ ] ChatBlockAgent (multi-turn conversation interface)
   - [ ] Build block CRUD operations (create, read, update, delete)
   - [ ] Canvas persistence (save/load blocks from DB)
   - **Deliverable**: Create 5 different block types on canvas, persist, reload

2. **Agent Capability Expansion** (Engineer D)
   - [ ] Implement block-specific agents with specialized tools
   - [ ] Add tool integration (web search via MCP, code execution hints)
   - [ ] Build agent memory system (episodic + semantic)
   - [ ] Implement confidence scoring for agent outputs
   - **Deliverable**: Agents produce higher-quality outputs with reasoning

3. **Sandbox Foundation** (Engineer B)
   - [ ] Set up Cloudflare Durable Objects account + configuration
   - [ ] Build SandboxRuntime class (execute code, shell commands)
   - [ ] Create Worker that routes requests to Durable Objects
   - [ ] Test basic code execution (Python, Node.js)
   - [ ] Implement sandbox pooling (optional optimization)
   - **Deliverable**: CodeBlock can execute code in sandbox, return output

4. **Affine or Custom Canvas Integration** (Engineer C)
   - [ ] Full canvas selection decision made (commit to Affine or custom)
   - [ ] Block components embedded in canvas
   - [ ] Real-time drag-and-drop repositioning
   - [ ] Infinite scroll/pan capabilities
   - **Deliverable**: Canvas behaves like design tool (Figma-like experience)

5. **Knowledge Graph Queries** (Engineer E)
   - [ ] Implement block relationship inference (when to link blocks)
   - [ ] Build intent decomposition queries (show sub-intents)
   - [ ] Create visualization of block relationships (graph view)
   - [ ] Add search by concept (find blocks related to "blockchain")
   - **Deliverable**: Users can explore canvas through knowledge graph

**End-of-Sprint Acceptance**: User intent "I want to research AI" → system creates SearchBlock (finds articles) + ContentBlock (summarizes) + CodeBlock (generates example code). User can ask "show related topics" → graph visualization appears.

**Estimated Hours**: 160h team

---

### Sprint 3 (Week 3): Hybrid Intelligence & Advanced Blocks
**Goal**: Full local + cloud intelligence, advanced block types, ClaudBot integration

**Tasks**:

1. **ClaudBot Deconstruction & Integration** (Engineer D + E)
   - [ ] Analyze ClaudBot repository (skill extraction)
   - [ ] Map ClaudBot tools/skills to AutoGen ToolGroup format
   - [ ] Integrate top 5 ClaudBot capabilities as agent tools
   - [ ] Test skill composition (chaining multiple tools)
   - [ ] Benchmark: ClaudBot integration performance impact
   - **Deliverable**: SandboxBlockAgent can execute ClaudBot-style complex workflows

2. **Advanced Block Types** (Engineer A + B)
   - [ ] SandboxBlockAgent (full agentic coder)
     - User describes feature → agent codes → sandbox executes → artifact on canvas
   - [ ] ImageBlockAgent (generation + editing)
     - Integrate Gemini Image API + VAE-based editing
   - [ ] VideoBlockAgent (video composition)
     - Integrate ffmpeg in sandbox, orchestrate video generation
   - [ ] BrowserBlockAgent (web scraping, screenshots)
   - [ ] ProductBlockAgent (mock Stripe integration)
   - **Deliverable**: 8+ block types fully functional

3. **Video Memory** (Engineer E)
   - [ ] Frame extraction pipeline (upload video → extract key frames)
   - [ ] Frame embedding (store in vector DB)
   - [ ] Agent reasoning over video (agents can "watch" and extract insights)
   - [ ] Example: User uploads product demo video → agents understand UI and suggest improvements
   - **Deliverable**: Agents can analyze user-provided videos and reference in suggestions

4. **MCP Tool Ecosystem** (Engineer C + D)
   - [ ] Expand MCP tools (research, code analysis, math, etc.)
   - [ ] Build tool discovery interface (agents/users see available tools)
   - [ ] Document MCP tool creation (template for custom tools)
   - [ ] Test cross-tool workflows (chain 3+ tools in one task)
   - **Deliverable**: 10+ tools accessible to agents

5. **Collaboration & Real-time Sync** (Engineer C)
   - [ ] Implement canvas sharing (generate shareable links)
   - [ ] Real-time block updates via WebSocket (multi-user editing)
   - [ ] User presence indicators (see who's editing what)
   - [ ] Conflict resolution (when two users edit same block simultaneously)
   - [ ] Comment system on blocks
   - **Deliverable**: Two users can edit shared canvas in real-time

**End-of-Sprint Acceptance**: User case "I want to build an app" → SearchBlock (finds similar projects) + ContentBlock (design doc) + SandboxBlockAgent (user describes feature, agent codes, sandbox runs) + ProductBlock (mock shopping cart) all connected and synchronized in real-time with collaborators.

**Estimated Hours**: 160h team

---

### Sprint 4 (Week 4): Inference Optimization & UI Polish
**Goal**: Production-grade performance, beautiful UI, fast inference

**Tasks**:

1. **Inference Performance Optimization** (Engineer B)
   - [ ] Benchmark current latencies (local vs cloud)
   - [ ] Evaluate Candle vs LlamaCPP (performance comparison)
   - [ ] Implement request batching for API calls
   - [ ] Cache frequent intents + responses (Redis)
   - [ ] Profile and optimize hot paths
   - [ ] Implement adaptive fallback (if local slow, use Gemini)
   - **Deliverable**: P95 latency <1s for common operations

2. **UI/UX Vibe Coding** (Engineer C)
   - [ ] Use Gemini Build to rapidly prototype:
     - Dashboard (canvas overview, recent projects)
     - Settings pages (profile, workspace, inference preferences)
     - Landing page (marketing)
   - [ ] Extract generated components into React project
   - [ ] Apply design system (consistent colors, typography, spacing)
   - [ ] Test responsive design (mobile, tablet, desktop)
   - [ ] A/B test critical flows (onboarding completion rate)
   - **Deliverable**: Beautiful, responsive, marketing-ready UI

3. **Authentication & User Management** (Engineer A)
   - [ ] Implement Supabase Auth (OAuth + email)
   - [ ] Build user profile management
   - [ ] Implement workspace creation & permissions
   - [ ] Add password recovery flow
   - [ ] Set up email notifications (canvas shared, collaboration invite)
   - **Deliverable**: Full auth flow, users can sign up → manage account → collaborate

4. **Logging, Monitoring & Analytics** (Engineer D + E)
   - [ ] Structured logging (Python logging → JSON)
   - [ ] Metrics collection (inference latency, API costs, error rates)
   - [ ] Build observability dashboard (Grafana or simple web dashboard)
   - [ ] Error tracking (Sentry integration)
   - [ ] User analytics (usage patterns, feature adoption)
   - [ ] Cost tracking (Gemini API spend, Durable Object costs)
   - **Deliverable**: Team can monitor system health and costs in real-time

5. **Documentation & Onboarding** (Team leads)
   - [ ] API documentation (FastAPI auto-docs)
   - [ ] User guides (how to create blocks, invite collaborators, etc.)
   - [ ] Developer guides (adding custom blocks, extending agents)
   - [ ] Video tutorials (quick-start, advanced features)
   - [ ] FAQ + troubleshooting
   - **Deliverable**: New users can onboard independently; developers can extend system

**End-of-Sprint Acceptance**: System handles 100 concurrent users, response times <500ms, zero errors, beautiful UI, comprehensive documentation.

**Estimated Hours**: 160h team

---

### Sprint 5 (Week 5): Production Hardening & Use Case Demos
**Goal**: Production-ready code, validate core use cases, prepare for launch

**Tasks**:

1. **Security & Compliance** (Engineer A + B)
   - [ ] Security audit (OWASP top 10, input validation, XSS prevention)
   - [ ] Sandbox isolation validation (ensure sandboxed code can't access host)
   - [ ] API rate limiting (prevent abuse)
   - [ ] Data encryption (at rest, in transit)
   - [ ] Privacy compliance (GDPR, data deletion flows)
   - [ ] Penetration testing (if resources allow)
   - **Deliverable**: System passes security review

2. **Use Case Implementation & Demo** (Full team, rotations)
   - **Use Case 1**: "I want to build a business"
     - [ ] Template creation (pre-built block structure)
     - [ ] Guided workflow (step-by-step prompts)
     - [ ] Agent assistance (market research, financial modeling)
     - [ ] Output export (business plan PDF)
   
   - **Use Case 2**: "I want to research and build an app"
     - [ ] Scaffold (SearchBlock → ContentBlock → CodeBlock → SandboxBlock)
     - [ ] Agent orchestration (research → design → code → test)
     - [ ] Output export (GitHub repo creation)
   
   - **Use Case 3**: "I want to create a movie-quality video"
     - [ ] Storyboard creation (ContentBlock with images)
     - [ ] Script generation (agent assistance)
     - [ ] Video composition (VideoBlockAgent)
     - [ ] Output export (downloadable video)
   
   - **Deliverable**: 3 fully working, documented use cases with demo videos

3. **Performance Testing & Load Simulation** (Engineer D)
   - [ ] Load testing (simulate 100+ concurrent users)
   - [ ] Stress testing (identify breaking points)
   - [ ] Spike testing (sudden traffic increase)
   - [ ] Soak testing (system behavior over 24+ hours)
   - [ ] Optimize based on findings
   - **Deliverable**: System can handle expected launch load

4. **Data Export & Integrations** (Engineer C + E)
   - [ ] Canvas → JSON export (full structure)
   - [ ] Canvas → Markdown export (content-only)
   - [ ] Canvas → PDF export (formatted output)
   - [ ] GitHub integration (push code from SandboxBlock)
   - [ ] Slack/Discord notifications (canvas shared, collaboration invite)
   - [ ] Zapier integration (if applicable)
   - **Deliverable**: Users can export work to multiple formats

5. **Beta Launch Preparation** (Team leads)
   - [ ] Create launch checklist (final validation)
   - [ ] Prepare release notes & blog post
   - [ ] Set up support channels (Discord, email, docs)
   - [ ] Recruit beta testers (select early adopters)
   - [ ] Create onboarding email sequence
   - **Deliverable**: System ready for controlled beta launch

**End-of-Sprint Acceptance**: Platform is production-ready, 3 use cases fully validated, passed security review, handles expected load, documentation comprehensive.

**Estimated Hours**: 160h team

---

### Sprint 6 (Week 6): Beta Launch, Iteration, Future Planning
**Goal**: Controlled beta launch, gather feedback, plan next phase

**Tasks**:

1. **Beta Launch Execution** (Full team)
   - [ ] Deploy to production (Vercel for frontend, Railway/Render for backend)
   - [ ] Enable monitoring dashboards
   - [ ] Onboard first 50 beta users
   - [ ] Daily standup on support tickets & issues
   - [ ] Daily metrics review (usage, errors, feedback)
   - **Deliverable**: 50 beta users actively using platform

2. **Feedback Loop & Quick Fixes** (Rotating support duty)
   - [ ] Triage user feedback (features, bugs, UX issues)
   - [ ] Fix critical bugs (within 2-4 hours)
   - [ ] Implement quick UX improvements (based on usage patterns)
   - [ ] Document feature requests (for future sprints)
   - **Deliverable**: Response time <4h for critical issues

3. **Innovation Experiments** (Optional, time permitting)
   - [ ] Implement Video Memory enhancements (if not done Sprint 3)
   - [ ] Experiment with advanced prompt engineering (improve agent reasoning)
   - [ ] Prototype knowledge graph visualization improvements
   - [ ] Test A/B variations of critical flows
   - **Deliverable**: Data on what works, what doesn't

4. **Documentation & Learning Capture** (Engineer leads)
   - [ ] Capture lessons learned (what went well, what to improve)
   - [ ] Document technical debt (list of "quick wins" for later)
   - [ ] Create runbook for common operations (deployments, debugging)
   - [ ] Update API documentation based on user feedback
   - **Deliverable**: Knowledge base for next phase

5. **Sprint 7+ Planning** (Team leads + product)
   - [ ] Analyze beta feedback (prioritize features)
   - [ ] Plan Sprint 7 (likely focus: Candle performance migration, advanced agents, team/org features)
   - [ ] Update roadmap for 3 months ahead
   - [ ] Identify hiring needs (if expanding team)
   - **Deliverable**: Clear plan for next phase, team aligned

**End-of-Sprint Acceptance**: 50+ beta users, <5% critical bug rate, user engagement metrics healthy, team has clear path to next phase.

**Estimated Hours**: 160h team

---

## SECTION 6: TECHNICAL DEEP DIVES

### 6.1 AutoGen Multi-Agent Architecture

**GroupChat Setup**:
```python
# agents.py
from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager

# Create user proxy (represents canvas UI)
user_proxy = UserProxyAgent(
    name="CanvasInterface",
    human_input_mode="NEVER",  # Full automation; validation happens in UI
    system_message="You are the interface to the user's imagination canvas.",
    code_execution_config={
        "work_dir": "/tmp/canvas_work",
        "use_docker": False  # Durable Objects handle sandboxing
    }
)

# Create specialized agents
intent_parser = AssistantAgent(
    name="IntentParserAgent",
    system_message="""You are the Intent Parser. Your job is to:
1. Analyze user intent (raw natural language)
2. Identify the primary goal and sub-goals
3. Recommend canvas block structure
4. Propose inter-block relationships

Respond in structured JSON format:
{
  "primary_intent": "...",
  "sub_intents": [...],
  "recommended_blocks": [...],
  "relationships": [...]
}
""",
    llm_config={
        "config_list": [
            {
                "model": "local",  # Will route to LlamaCPP or Gemini
                "api_base": "http://localhost:8000",
                "api_type": "local"
            }
        ]
    }
)

content_block_agent = AssistantAgent(
    name="ContentBlockAgent",
    system_message="""You are specialized in content creation. Help users:
- Write, edit, and improve text
- Check grammar and tone
- Suggest structure and organization
- Generate outlines and summaries

When the user asks for content assistance, provide:
1. Original content (if provided)
2. Suggested improvements
3. Reasoning for changes
4. Alternative versions
""",
    llm_config={"config_list": [{"model": "local", "api_base": "http://localhost:8000"}]}
)

code_block_agent = AssistantAgent(
    name="CodeBlockAgent",
    system_message="""You are a code expert. Help users:
- Write, review, and optimize code
- Debug errors
- Explain code logic
- Generate code from descriptions

When providing code:
1. Include comments
2. Follow best practices
3. Provide explanation
4. Suggest improvements
""",
    llm_config={"config_list": [{"model": "local", "api_base": "http://localhost:8000"}]}
)

# GroupChat for orchestration
group_chat = GroupChat(
    agents=[user_proxy, intent_parser, content_block_agent, code_block_agent],
    messages=[],
    max_round=8,  # Prevent infinite loops
    admin_name="user_proxy"
)

manager = GroupChatManager(
    groupchat=group_chat,
    llm_config={"config_list": [{"model": "local", "api_base": "http://localhost:8000"}]}
)

# Initiate conversation
user_proxy.initiate_chat(
    manager,
    message="I want to write an article about AI"
)
```

**ZeroMQ Message Bus Integration**:
```python
# message_bus.py
import zmq
import json
from datetime import datetime

class MessageBus:
    def __init__(self, pub_port=5555, req_port=5556):
        self.context = zmq.Context()
        
        # Pub/Sub for broadcasts
        self.pub_socket = self.context.socket(zmq.PUB)
        self.pub_socket.bind(f"tcp://127.0.0.1:{pub_port}")
        
        # Req/Rep for request-reply
        self.rep_socket = self.context.socket(zmq.REP)
        self.rep_socket.bind(f"tcp://127.0.0.1:{req_port}")
    
    def publish(self, topic: str, message: dict):
        """Broadcast message to all subscribers."""
        msg = {
            "timestamp": datetime.utcnow().isoformat(),
            "topic": topic,
            "payload": message
        }
        self.pub_socket.send(f"{topic}".encode(), zmq.SNDMORE)
        self.pub_socket.send(json.dumps(msg).encode())
    
    def request(self, destination: str, request: dict, timeout_ms=5000) -> dict:
        """Send request, wait for reply."""
        request["destination"] = destination
        request["timestamp"] = datetime.utcnow().isoformat()
        self.pub_socket.send_json(request)
        # Implement timeout handling
        return self.rep_socket.recv_json()

# Usage in agent
bus = MessageBus()

# Publish state update
bus.publish("canvas_state_update", {
    "block_id": "content_1",
    "state": "editing",
    "agent": "ContentBlockAgent"
})

# Request data from another agent
result = bus.request(
    "KnowledgeGraphAgent",
    {"query": "find_related_blocks", "concept": "AI"}
)
```

### 6.2 LlamaCPP Setup & Configuration

**Installation & Model Loading**:
```bash
# Install llama-cpp-python
pip install llama-cpp-python

# Download model (Llama 2 13B quantized)
wget https://huggingface.co/TheBloke/Llama-2-13B-chat-GGML/resolve/main/llama-2-13b-chat.ggmlv3.q4_K_M.gguf

# Alternative: Mistral 7B (faster)
wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF/resolve/main/Mistral-7B-Instruct-v0.1.Q4_K_M.gguf
```

**FastAPI Integration**:
```python
# inference.py
from fastapi import FastAPI, HTTPException
from llama_cpp import Llama
import asyncio
from concurrent.futures import ThreadPoolExecutor

app = FastAPI()

# Load model once
llm = Llama(
    model_path="./models/llama-2-13b-chat.ggmlv3.q4_K_M.gguf",
    n_gpu_layers=32,  # Offload to GPU (adjust based on VRAM)
    n_ctx=2048,  # Context window
    n_threads=8,
    verbose=True
)

# Thread pool for blocking inference
executor = ThreadPoolExecutor(max_workers=4)

@app.post("/v1/completions")
async def completions(prompt: str, max_tokens: int = 256):
    """Inference endpoint compatible with OpenAI API format."""
    def run_inference():
        return llm(
            prompt,
            max_tokens=max_tokens,
            temperature=0.7,
            top_p=0.95,
            echo=False
        )
    
    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(executor, run_inference)
        return {
            "choices": [{"text": result["choices"][0]["text"]}],
            "usage": result["usage"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/v1/chat/completions")
async def chat_completions(messages: list, model: str = "local"):
    """Chat endpoint (compatible with OpenAI SDK)."""
    formatted_prompt = format_messages(messages)
    
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        executor,
        lambda: llm(formatted_prompt, max_tokens=512, temperature=0.7)
    )
    
    return {
        "choices": [{"message": {"content": result["choices"][0]["text"]}}]
    }

def format_messages(messages: list) -> str:
    """Convert OpenAI message format to prompt format."""
    prompt = ""
    for msg in messages:
        if msg["role"] == "system":
            prompt += f"System: {msg['content']}\n"
        elif msg["role"] == "user":
            prompt += f"User: {msg['content']}\n"
        elif msg["role"] == "assistant":
            prompt += f"Assistant: {msg['content']}\n"
    prompt += "Assistant: "
    return prompt
```

**Performance Optimization**:
```python
# config.py
INFERENCE_CONFIG = {
    # Model
    "model_path": "./models/llama-2-13b-chat.ggmlv3.q4_K_M.gguf",
    "n_ctx": 2048,  # Larger context = more VRAM; adjust based on hardware
    
    # GPU acceleration
    "n_gpu_layers": 32,  # Metal (Mac) or CUDA (Nvidia); CPU-only if 0
    
    # Threading
    "n_threads": 8,  # Match CPU core count for optimal performance
    
    # Inference parameters
    "temperature": 0.7,  # Higher = more creative, lower = more consistent
    "top_p": 0.95,  # Nucleus sampling
    "top_k": 40,
    "max_tokens": 256,  # Default completion length
    
    # Optimization
    "use_mlock": True,  # Keep model in RAM (if enough memory)
}

# Hardware detection (auto-configure)
import psutil
import platform

def get_optimal_config():
    """Auto-configure based on system specs."""
    cpu_count = psutil.cpu_count()
    total_ram = psutil.virtual_memory().total / (1024**3)  # GB
    
    config = INFERENCE_CONFIG.copy()
    config["n_threads"] = max(4, cpu_count - 2)
    
    # GPU detection
    try:
        import torch
        if torch.cuda.is_available():
            config["n_gpu_layers"] = 32  # CUDA
            print(f"CUDA available: {torch.cuda.get_device_name()}")
        elif platform.system() == "Darwin":
            config["n_gpu_layers"] = 32  # Metal (Mac)
            print("Metal acceleration enabled")
    except:
        print("GPU acceleration unavailable; using CPU")
    
    return config
```

### 6.3 Gemini 3.0 API Hybrid Routing

**Decision Tree for Local vs Cloud**:
```python
# hybrid_inference.py
import time
from datetime import datetime, timedelta

class HybridInferenceRouter:
    def __init__(self, local_llm, gemini_client):
        self.local_llm = local_llm
        self.gemini = gemini_client
        self.local_latencies = []  # Track performance
        self.gemini_costs = 0  # Track spending
        self.last_cost_reset = datetime.utcnow()
    
    async def infer(self, prompt: str, context: dict = None) -> dict:
        """Route inference request to local or cloud."""
        
        # Tier 1: Decide based on prompt complexity & latency
        complexity = self._estimate_complexity(prompt)
        local_available = self._check_local_health()
        
        if not local_available:
            # Fall back to Gemini
            return await self.gemini.generate(prompt)
        
        if complexity == "simple":
            # Use local for <50ms expected latency
            return await self._local_infer(prompt)
        
        elif complexity == "medium":
            # Try local first, fall back to Gemini if slow
            start = time.time()
            try:
                result = await asyncio.wait_for(
                    self._local_infer(prompt),
                    timeout=1.0  # 1 second timeout
                )
                elapsed = time.time() - start
                self.local_latencies.append(elapsed)
                return result
            except asyncio.TimeoutError:
                print(f"Local timeout after 1s; using Gemini")
                return await self.gemini.generate(prompt)
        
        else:  # complex
            # Use Gemini for reasoning-heavy tasks
            return await self.gemini.generate(prompt)
    
    def _estimate_complexity(self, prompt: str) -> str:
        """Estimate prompt complexity from keywords."""
        keywords_simple = ["write", "summarize", "explain"]
        keywords_complex = ["reason about", "design", "architect", "debug"]
        
        prompt_lower = prompt.lower()
        
        if any(k in prompt_lower for k in keywords_complex):
            return "complex"
        elif any(k in prompt_lower for k in keywords_simple):
            return "simple"
        else:
            return "medium"
    
    def _check_local_health(self) -> bool:
        """Check if local model is responsive."""
        try:
            # Quick health check (1 token inference)
            result = self.local_llm("test", max_tokens=1)
            return result is not None
        except:
            return False
    
    async def _local_infer(self, prompt: str) -> dict:
        """Inference via local LLM."""
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: self.local_llm(prompt, max_tokens=256)
        )
        return {"source": "local", "result": result}

# Cost tracking
def track_gemini_cost(tokens_used: int):
    """Track API costs (adjust pricing based on current rates)."""
    # Gemini 3.0 pricing (example; verify current rates)
    input_cost = 0.00075  # per 1K tokens
    output_cost = 0.003   # per 1K tokens
    
    cost = (tokens_used * input_cost) / 1000
    
    # Log for monitoring
    print(f"Gemini API cost: ${cost:.4f}")
    return cost
```

### 6.4 Durable Objects Sandbox Integration

**Durable Object Implementation**:
```typescript
// sandbox-runtime.ts (Worker script)

export interface Env {
  SANDBOX: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    
    // Route sandbox requests to Durable Object
    if (url.pathname.startsWith("/sandbox/")) {
      const id = env.SANDBOX.idFromName("default-sandbox");
      const stub = env.SANDBOX.get(id);
      return stub.fetch(request);
    }
    
    return new Response("Not found", { status: 404 });
  }
};

export class SandboxRuntime {
  state: DurableObjectState;
  env: Env;
  
  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }
  
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    
    if (path === "/execute/code") {
      return this.executeCode(request);
    } else if (path === "/execute/shell") {
      return this.executeShell(request);
    } else if (path === "/status") {
      return this.getStatus();
    }
    
    return new Response("Not found", { status: 404 });
  }
  
  async executeCode(request: Request): Promise<Response> {
    const { code, language } = await request.json();
    
    try {
      let output: string;
      
      if (language === "python") {
        output = await this.runPython(code);
      } else if (language === "node" || language === "javascript") {
        output = await this.runNode(code);
      } else {
        return new Response("Unsupported language", { status: 400 });
      }
      
      return new Response(JSON.stringify({ success: true, output }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  
  async runPython(code: string): Promise<string> {
    // Use Python subprocess in sandbox environment
    const process = await this.state.storage.get("python_runner");
    // Simplified; actual implementation uses child_process or wasm-python
    return "Python execution output";
  }
  
  async runNode(code: string): Promise<string> {
    // Eval-like execution (WITH security considerations)
    // Recommended: use VM2 or isolated-vm for security
    const vm = new VM({
      sandbox: { console, fetch, crypto }
    });
    
    const result = vm.run(code);
    return JSON.stringify(result);
  }
  
  async executeShell(request: Request): Promise<Response> {
    const { command } = await request.json();
    
    try {
      // In real implementation, use child_process.exec with timeout
      const output = "Shell execution output";
      return new Response(JSON.stringify({ success: true, output }));
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500
      });
    }
  }
  
  getStatus(): Response {
    // Return sandbox resource usage
    return new Response(JSON.stringify({
      status: "healthy",
      uptime_ms: Date.now() - this.state.getWebSocketAccepted?.()?[2] || 0,
      memory_usage: "estimation"
    }));
  }
}
```

**Backend Integration**:
```python
# durable_objects_client.py
import aiohttp
import asyncio

class DurableObjectClient:
    def __init__(self, worker_url: str):
        self.worker_url = worker_url  # e.g., "https://your-worker.dev"
    
    async def execute_code(self, code: str, language: str = "python") -> dict:
        """Execute code in Durable Object sandbox."""
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.worker_url}/sandbox/execute/code",
                json={"code": code, "language": language},
                timeout=aiohttp.ClientTimeout(total=30)
            ) as resp:
                return await resp.json()
    
    async def execute_shell(self, command: str) -> dict:
        """Execute shell command in sandbox."""
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.worker_url}/sandbox/execute/shell",
                json={"command": command},
                timeout=aiohttp.ClientTimeout(total=30)
            ) as resp:
                return await resp.json()

# Usage in CodeBlockAgent
class CodeBlockAgent(AssistantAgent):
    def __init__(self, sandbox_client: DurableObjectClient):
        super().__init__(name="CodeBlockAgent")
        self.sandbox = sandbox_client
    
    async def execute_user_code(self, code: str, language: str):
        """User clicks 'Run'; execute in sandbox."""
        result = await self.sandbox.execute_code(code, language)
        return result["output"]
```

---

## SECTION 7: OPEN SOURCE TOOLS & RESOURCES

### 7.1 Essential Tools for Engineers

**Development Tools**:
- **Gemini CLI**: Not directly integrated; used for local development, testing, and building components
  - [Gemini AI CLI](https://ai.google.dev/tutorials/python_quickstart)
  - Official Google docs: [Build with Gemini](https://ai.google.dev)
  - Tips: Use for quick local testing, prompt engineering, component generation

- **Gemini Build**: For rapid UI generation
  - [Gemini Build](https://build.google.com) (beta)
  - Use case: Generate React components from descriptions, landing pages
  - Workflow: Generate → Export code → Integrate into project

- **Google Anti Gravity IDE**: For agentic development
  - [Research](https://research.google/pubs/anti-gravity/) (emerging)
  - Future integration: debugging multi-agent systems, step-through execution

**Helpful Resources**:
- [AutoGen Documentation](https://microsoft.github.io/autogen)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers)
- [LlamaCPP Guide](https://github.com/ggerganov/llama.cpp#readme)
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial)
- [React Best Practices](https://react.dev)

### 7.2 YouTube Channels & Learning Resources

**AutoGen & Multi-Agent AI**:
- [AutoGen Crash Course](https://www.youtube.com/results?search_query=autogen+framework+tutorial)
- [Multi-Agent Systems Explained](https://www.youtube.com/@byteaxe/search?query=multi+agent)

**Local LLMs & Inference**:
- [LlamaCPP Setup Guide](https://www.youtube.com/results?search_query=llama+cpp+setup)
- [Running LLMs Locally](https://www.youtube.com/@Fireship0/videos) (Fireship)

**Cloudflare Workers & Durable Objects**:
- [Cloudflare Workers 101](https://www.youtube.com/results?search_query=cloudflare+workers)
- [Durable Objects Deep Dive](https://developers.cloudflare.com/workers/learning/using-durable-objects)

**Frontend Development**:
- [React Advanced Patterns](https://www.youtube.com/@jsmastery/videos)
- [TailwindCSS Tips](https://www.youtube.com/@TailwindLabs/videos)
- [Affine Canvas Tutorial](https://affine.pro/blog)

### 7.3 Tricks, Tips & Best Practices

**LlamaCPP Performance**:
- Quantize models to 4-bit (reduces VRAM by 75%)
- Use Metal acceleration on Mac, CUDA on Nvidia
- Start with 7B model; scale to 13B if needed
- Monitor context window size (balance memory vs capacity)

**AutoGen Optimization**:
- Limit group chat rounds (set `max_round=8` to prevent runaway conversations)
- Use specialized agents (one agent per capability = better outputs)
- Implement agent memory pruning (forget old conversations after N rounds)
- Test agent prompts extensively (small wording changes = big differences)

**Gemini API Cost Reduction**:
- Cache similar prompts (use Redis for embedding-based caching)
- Batch requests (combine multiple small requests into one)
- Use local SLM for 80%+ of workloads
- Set up spending alerts ($50/month recommended for beta)

**Frontend Development Speed**:
- Use component library (Shadcn/ui) to avoid reimplementing basics
- Vibe code with Gemini Build or v0.dev for rapid prototyping
- Keep design system simple (3-4 colors, 2 fonts, consistent spacing)
- Test on mobile early and often

**Database Design**:
- PostgreSQL (local development) → Supabase (production)
- Keep schema normalized (avoid denormalization until proven necessary)
- Index frequently queried fields (canvas_id, user_id, block_type)
- Use migrations (Alembic for Python) to manage schema changes

**Deployment**:
- Frontend: Vercel (free, automatic deployments from Git)
- Backend: Railway or Render (PostgreSQL included)
- Or: Docker containers on any VPS (DigitalOcean, Linode)
- Monitoring: Sentry (error tracking), Grafana (metrics)

---

## SECTION 8: CRITICAL SUCCESS FACTORS

### Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Intent parsing inaccuracy | Users get wrong blocks | Start with template library (pre-defined intents), gradually add learning |
| Gemini API quota exhaustion | System becomes non-functional | Implement strict rate limiting, escalation alerts, failover to local-only mode |
| Sandbox security breach | User code escapes sandbox | Security audit (sprints 4-5), penetration testing, run untrusted code in isolated DO instance |
| Agent infinite loops | System hangs | Set max conversation rounds, implement timeouts, add human interrupt (user can stop agents) |
| Cold start latency | Poor UX on first load | Warm up model on startup, cache common inference results, optimize frontend bundle |
| Real-time sync conflicts | Collaboration breaks | Use Yjs (CRDT) for operational transformation, implement conflict resolution UI |
| Knowledge graph complexity | Queries slow down | Implement caching (Redis), batch updates, use Neo4j query optimization |

### Go/No-Go Criteria (End of Each Sprint)

**Sprint 1**: 
- ✅ Backend responds to inference requests <2s
- ✅ Frontend canvas renders without errors
- ✅ Agent coordinates multi-turn conversation
- ✅ Simple intent ("write article") creates ContentBlock

**Sprint 2**:
- ✅ 5 block types functional
- ✅ Agents produce reasonable output (manual review, not perfect)
- ✅ Code execution in sandbox works
- ✅ Canvas persistence (save/load) works

**Sprint 3**:
- ✅ All 8+ block types working
- ✅ Real-time collaboration with 2+ users
- ✅ ClaudBot skills integrated (3+ capabilities)
- ✅ Video memory frame extraction works

**Sprint 4**:
- ✅ P95 latency <500ms (excluding external APIs)
- ✅ UI passes accessibility audit (a11y)
- ✅ Error logging + monitoring operational
- ✅ Documentation comprehensive (developer + user guides)

**Sprint 5**:
- ✅ 3 full use cases working end-to-end
- ✅ Load test: 100 concurrent users, <5% error rate
- ✅ Security audit: zero critical findings
- ✅ Data export working (JSON, PDF, markdown)

**Sprint 6**:
- ✅ 50 beta users actively using platform
- ✅ Daily active users tracking at >30%
- ✅ <5% critical bug rate
- ✅ Net Promoter Score (NPS) >30 (early stage acceptable)

---

## SECTION 9: TEAM ROLE BREAKDOWN (5 Engineers)

### Engineer A: Backend Lead
**Responsibility**: FastAPI, LlamaCPP, database, core API  
**Sprint Focus**: Database design → LLM integration → auth system → monitoring  
**Key Deliverables**: Health-check endpoints, inference API, CRUD operations

### Engineer B: Cloud Integration Specialist
**Responsibility**: Gemini API, Cloudflare integration, Durable Objects, cost optimization  
**Sprint Focus**: Gemini setup → hybrid routing → sandbox provisioning → load testing  
**Key Deliverables**: API client, cost tracking, sandbox execution

### Engineer C: Frontend Lead
**Responsibility**: React, canvas UI, real-time sync, responsive design  
**Sprint Focus**: Canvas framework selection → block components → collaboration → UI polish  
**Key Deliverables**: Canvas editor, component library, vibe-coded pages

### Engineer D: Agent Orchestration Specialist
**Responsibility**: AutoGen, multi-agent coordination, message bus, agent memory  
**Sprint Focus**: Agent setup → skill integration → ClaudBot decomposition → performance  
**Key Deliverables**: Agent team, message bus, episodic memory system

### Engineer E: Data & Persistence Specialist
**Responsibility**: Vector DB, Neo4j knowledge graph, vector embeddings, caching  
**Sprint Focus**: Vector store setup → knowledge graph schema → embedding pipeline → optimization  
**Key Deliverables**: Intent embeddings, semantic relationships, graph queries

---

## SECTION 10: DEPLOYMENT & OPERATIONS

### Deployment Architecture

```
┌─────────────────────────────────────────────┐
│ Frontend (Vercel)                           │
│ - React build → auto-deploy on Git push     │
│ - CDN globally distributed                  │
│ - Environment: staging, production          │
└──────────────┬──────────────────────────────┘
               │ HTTPS + WebSocket
┌──────────────▼──────────────────────────────┐
│ Cloudflare Workers (Edge)                   │
│ - API Gateway                               │
│ - Rate limiting                             │
│ - DDoS protection                           │
│ - Routes to Durable Objects & Backend       │
└──────────────┬──────────────────────────────┘
               │
        ┌──────┴────────┐
        │               │
        ▼               ▼
┌─────────────┐  ┌──────────────────┐
│Backend      │  │Durable Objects   │
│(Railway)    │  │(Cloudflare)      │
│- FastAPI    │  │- SandboxRuntime  │
│- LlamaCPP   │  │- Code execution  │
│- ZeroMQ     │  │- Persistent state│
└──────┬──────┘  └──────────────────┘
       │
    ┌──┴──┐
    │     │
    ▼     ▼
┌──────────────┐  ┌──────────────────┐
│PostgreSQL    │  │Redis             │
│(data)        │  │(cache + queue)   │
└──────────────┘  └──────────────────┘

┌──────────────────────────────────────┐
│ External Services (as needed)        │
├──────────────────────────────────────┤
│ - Gemini API (Google Cloud)          │
│ - Qdrant/Pinecone (vector DB)        │
│ - Neo4j (knowledge graph)            │
│ - Supabase Auth (authentication)     │
│ - Sentry (error tracking)            │
│ - Stripe (payments, if applicable)   │
└──────────────────────────────────────┘
```

### Environment Configuration

**.env.local** (development):
```bash
# Backend
FASTAPI_ENV=development
LLM_MODEL_PATH=./models/llama-2-13b-chat.ggmlv3.q4_K_M.gguf
LLM_N_THREADS=8
LLM_GPU_LAYERS=32

# Gemini
GEMINI_API_KEY=xxx
GEMINI_HYBRID_THRESHOLD=0.7  # Use local if confidence > 0.7

# Database
DATABASE_URL=postgresql://user:pass@localhost/balnce_ai_dev
REDIS_URL=redis://localhost:6379

# Message Bus
ZEROMQ_PUB_PORT=5555
ZEROMQ_REQ_PORT=5556

# Durable Objects
CLOUDFLARE_WORKER_URL=http://localhost:8787

# Frontend
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

**.env.production** (production):
```bash
# Backend
FASTAPI_ENV=production
LLM_MODEL_PATH=/model/llama-2-13b-chat.ggmlv3.q4_K_M.gguf
LLM_N_THREADS=16
LLM_GPU_LAYERS=40

# Gemini
GEMINI_API_KEY=${SECRETS.GEMINI_API_KEY}
GEMINI_HYBRID_THRESHOLD=0.75

# Database
DATABASE_URL=${SECRETS.DATABASE_URL}
REDIS_URL=${SECRETS.REDIS_URL}

# Message Bus
ZEROMQ_PUB_PORT=5555
ZEROMQ_REQ_PORT=5556

# Durable Objects
CLOUDFLARE_WORKER_URL=https://balnce-ai.workers.dev

# Frontend
VITE_API_URL=https://api.balnce.ai
VITE_WS_URL=wss://api.balnce.ai

# Monitoring
SENTRY_DSN=${SECRETS.SENTRY_DSN}
```

### Monitoring & Alerting

**Metrics Dashboard** (Grafana or custom):
- Inference latency (p50, p95, p99)
- Agent response quality (user ratings)
- API error rate (<0.5% target)
- Gemini API costs (daily, weekly)
- Durable Object execution time
- Database query performance
- WebSocket connection health
- User engagement (DAU, MAU)

**Alerts** (PagerDuty or Sentry):
- Inference latency > 2s: page on-call engineer
- API error rate > 1%: alert team
- Gemini costs > $100/day: alert manager
- Database CPU > 80%: alert DBA
- Sandbox execution time > 5min: warn user

---

## SECTION 11: CONCLUSION & SUCCESS VISION

### What We're Building

BALNCE AI's Imagination Canvas is not just another creative tool—it's a **paradigm shift** in how humans collaborate with AI. By orchestrating multiple specialized agents, leveraging hybrid intelligence (local + cloud), providing sandboxed execution, and maintaining a rich knowledge graph, we're enabling users to think in canvas space and let AI amplify their creativity.

### Why This Matters

- **User Empowerment**: Non-technical users can build, code, create, and share without traditional barriers
- **Developer Velocity**: Engineers get a powerful platform for extending AI capabilities
- **Responsible AI**: Local inference + transparency + human approval gates = trustworthy automation
- **Economical**: Hybrid approach keeps costs manageable while maintaining quality

### Next Phase (Post-Sprint 6)

- Expand to 500+ beta users, gather feature requests
- Implement advanced use cases (team collaboration, multi-workspace, org management)
- Explore video memory at scale (process user videos, extract insights)
- Migrate to Candle for performance gains
- Launch public beta or monetization strategy

---

## APPENDIX: Quick Reference Commands

### Development Setup
```bash
# Clone repo
git clone https://github.com/balnce-ai/imagination-canvas.git
cd imagination-canvas

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python main.py  # Starts FastAPI on localhost:8000

# Frontend setup
cd frontend
npm install
npm run dev  # Starts Vite on localhost:5173

# Database
psql -U postgres
CREATE DATABASE balnce_ai_dev;
python -c "from alembic.config import main; main(['upgrade', 'head'])"  # Run migrations

# Message Bus (ZeroMQ)
# ZeroMQ runs in-process; no separate startup needed
```

### Deployment Commands
```bash
# Deploy frontend (Vercel)
vercel deploy --prod

# Deploy backend (Railway)
railway up

# Deploy Worker (Cloudflare)
wrangler deploy

# Check logs
railway logs
wrangler tail

# Monitor metrics
grafana open http://localhost:3000
```

### Common Debug Commands
```bash
# Check inference latency
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "hello"}]}'

# Check database connection
psql -c "SELECT version();"

# Check Redis cache
redis-cli PING

# Monitor agent communication
zeromq-monitor tcp://127.0.0.1:5555

# Check API costs
curl https://generativelanguage.googleapis.com/v1/models:list \
  -H "x-goog-api-key=$GEMINI_API_KEY"
```

---

**Document Version**: 1.0  
**Last Updated**: January 26, 2026  
**Status**: Ready for Implementation  
**Confidence Level**: Production-Ready

---

## DOCUMENT GOVERNANCE

This specification is the single source of truth for the BALNCE AI Imagination Canvas project. All updates must be approved by the Technical Lead and Product Owner. Version control maintained in Git.

**Contact for Questions**: 
- Technical Lead: [Engineer A / Backend Lead]
- Product Owner: [CEO / Product Manager]

---

**END OF SPECIFICATION**