# IMAGINATION CANVAS: Production Implementation Guide
## A Complete AI Agent Orchestration System with Infinite Canvas Collaboration

**Project Status:** Pre-Development (Ready for Sprint Planning)  
**Document Version:** 1.0 Production-Ready  
**Last Updated:** January 26, 2026  
**Team Size:** 5 Engineers | **Duration:** 6 Sprints (6 weeks)  
**Technology Stack:** Python + React + Cloudflare + AutoGen v0.4

---

## 📋 TABLE OF CONTENTS
1. Project Vision & Use Cases
2. Core Architecture
3. Technology Stack Details
4. Canvas Block Types & Schemas
5. Agent Skills Framework (Clawd Bot Deconstruction)
6. Implementation Roadmap (6 Sprints)
7. UI/UX Flows & Components
8. Database & Knowledge Graph Schema
9. Deployment & Infrastructure
10. Developer Tools & Acceleration Methods

---

---

## 1. PROJECT VISION & USE CASES

### Core Promise
Users express **intent in natural language** → System decomposes into **modular canvas blocks** → **Agents collaborate** to execute → **Observable, editable canvas** shows real-time progress.

### Target Use Cases (Priority Order)

#### Use Case 1: "I want to build a business"
**User Intent:** "Help me validate a business idea for an AI-powered SaaS platform focused on video editing."

**Canvas Decomposition:**
```
┌─────────────────────────────────────────────────┐
│ RESEARCH BLOCK                                  │
│ └─ Agent: Market Researcher                     │
│    └─ Outputs: Market size, competitors, TAM   │
├─────────────────────────────────────────────────┤
│ DOCUMENT BLOCK: Business Plan Outline           │
│ └─ Agent: Business Strategist                   │
│    └─ Inputs: Research data                     │
│    └─ Outputs: Executive summary, financials   │
├─────────────────────────────────────────────────┤
│ CHAT BLOCK: Ask clarifying questions            │
│ └─ Agent: Business Mentor                       │
│    └─ Interactive refinement of plan           │
├─────────────────────────────────────────────────┤
│ CODE BLOCK: Landing page prototype              │
│ └─ Agent: Sandboxed Engineer                    │
│    └─ Outputs: HTML/React component             │
├─────────────────────────────────────────────────┤
│ PRODUCT BLOCK: Stripe integration               │
│ └─ Agent: Product Engineer                      │
│    └─ Outputs: Payment processing setup         │
└─────────────────────────────────────────────────┘
```

#### Use Case 2: "I want to research an idea and build an app"
**Decomposition:**
- Research Block (Multi-source gathering)
- Document Block (Findings compilation)
- Code Block (App scaffolding)
- Sandbox Block (Live testing)
- Video Block (Demo creation)

#### Use Case 3: "I want to create a stunning video like a movie director"
**Decomposition:**
- Chat Block (Script ideation)
- Image Block (Storyboard generation)
- Video Block (Editing workspace)
- Audio Block (Music selection + SFX)
- Collaboration Block (Team feedback)

#### Use Case 4: "I want to create a Call of Duty game with my own characters"
**Decomposition:**
- Character Design Block (3D asset generation)
- Code Block (Game logic - Unreal/Unity export)
- Sandbox Block (Live testing environment)
- Asset Block (Models, textures, sounds)
- Multiplayer Block (Networking configuration)

---

## 2. CORE ARCHITECTURE

### System Design Principles

```
┌────────────────────────────────────────────────────────────┐
│                    WEB BROWSER (React)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      Imagination Canvas UI (Affine or React)        │  │
│  │  - Infinite edgeless canvas                         │  │
│  │  - Block drag-drop, real-time sync                  │  │
│  │  - Visualization of agent state & outputs           │  │
│  └──────────────────────────────────────────────────────┘  │
│  WebSocket / REST API                                      │
└────────────────────────────────────────────────────────────┘
                           ↑↓
                   (REST / WebSocket)
                           
┌────────────────────────────────────────────────────────────┐
│              LOCAL BACKEND (Python FastAPI)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          AutoGen v0.4 Orchestrator                  │  │
│  │  - Multi-agent conversation management             │  │
│  │  - Message bus (ZeroMQ for high-speed internal)    │  │
│  │  - State persistence & checkpointing                │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Agent Skills Registry & Loading            │  │
│  │  - Clawd Bot skill deconstruction → AutoGen skills │  │
│  │  - Dynamic capability discovery via MCP            │  │
│  │  - Tool/API routing                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Intent Parser → Block Generator            │  │
│  │  - NLP decomposition of user intent                 │  │
│  │  - Schema validation & generation                   │  │
│  │  - Block type assignment                            │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────┬──────────────────┐
        ↓                  ↓                  ↓
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  Local LLM       │ │  Gemini 3.0      │ │  Sandbox         │
│  (Ollama/        │ │  API Hybrid      │ │  (Cloudflare     │
│  LlamaCPP)       │ │  (GPU-heavy      │ │  Durable Objects)│
│  Single-use      │ │  decomposition)  │ │  Code execution  │
│  Fast            │ │  Powerful        │ │  Linux + Tools   │
│  Conversations   │ │  Reasoning       │ │  Containers      │
└──────────────────┘ └──────────────────┘ └──────────────────┘
        ↓                  ↓                  ↓
        └──────────────────┬──────────────────┘
                           ↓
        ┌──────────────────────────────────┐
        │  MCP Protocol (Tool/Data Layer)  │
        │  - Standardized tool interfaces  │
        │  - External agent discovery      │
        │  - Data source integration       │
        └──────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────┐
        │  A2A Protocol (Interop Layer)    │
        │  - Agent-to-agent communication  │
        │  - Canvas block communication    │
        │  - External system integration   │
        └──────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────┐
        │  Data Layer                      │
        │  - PostgreSQL (state, users)     │
        │  - Vector DB (Pinecone/Weaviate)│
        │  - Knowledge Graph (Neo4j)       │
        │  - File Storage (S3-compatible)  │
        └──────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Orchestrator** | AutoGen v0.4 | Conversation-first, local-capable, MCP-native, peer-to-peer agents |
| **Message Bus** | ZeroMQ (internal) | Sub-millisecond latency for agent-to-agent conversation |
| **Local LLM** | LlamaCPP (primary) | Production-grade performance, hardware flexibility, extensive model support |
| **Hybrid Power** | Gemini 3.0 API | Supplement for complex decomposition, intent parsing, code generation |
| **Sandbox** | Cloudflare Sandbox SDK | Global edge execution, isolated containers, integrated with Workers/Durable Objects |
| **Canvas** | Affine (base) or React (custom) | Agent-ready, local-first, collaborative, edgeless blocks |
| **Memory** | Multi-tier: Conversation + Vector + Knowledge Graph | Conversation history (short), vector embeddings (semantic), graph (entities/relationships) |
| **Database** | PostgreSQL + Pinecone + Neo4j | Relational (users/state), semantic search (memory), structured knowledge |
| **Auth/API** | FastAPI + JWT | Fast, async-native, auto-OpenAPI docs |

---

## 3. TECHNOLOGY STACK DETAILS

### 3.1 Backend (Python)

#### Core Dependencies
```
# FastAPI + ASGI
fastapi==0.104.1
uvicorn==0.24.0
python-dotenv==1.0.0

# AutoGen v0.4+
pyautogen==0.4.0

# LLM Inference
llama-cpp-python==0.2.50  # Local inference wrapper
anthropic==0.7.0          # For optional Anthropic models
google-generativeai==0.3.0 # Gemini API

# Message Bus
pyzmq==25.1.1  # ZeroMQ for high-speed agent communication

# Data Layer
sqlalchemy==2.0.0
psycopg2-binary==2.9.0    # PostgreSQL adapter
pinecone-client==3.0.0    # Vector DB
py2neo==5.0.0             # Neo4j knowledge graph
pydantic==2.0.0           # Schema validation

# Tools & Integration
requests==2.31.0
aiohttp==3.9.0
pyyaml==6.0               # Skill definition parsing

# Cloudflare Integration
cloudflare-sdk==2.0.0     # Sandbox SDK (when available)
```

#### Local LLM Setup (LlamaCPP)
```bash
# Download quantized model (7B parameters, 4.6GB)
# Recommended: Mistral-7B or Llama-2-7B-Chat
ollama pull mistral  # Or use llama-cpp-python directly

# Python integration
from llama_cpp import Llama

llm = Llama(
    model_path="./models/mistral-7b.Q4_K_M.gguf",
    n_ctx=4096,
    n_gpu_layers=-1,  # GPU offload (if available)
    n_threads=8,
    verbose=False
)
```

**Why LlamaCPP > Candle/ExecutorTorch:**
- ✅ Mature ecosystem (llama.cpp is production-proven)
- ✅ Extensive quantization support (GGUF, GPTQ)
- ✅ Python bindings (llama-cpp-python) are stable
- ✅ Single-user batch-size-1 performance unmatched
- ⚠️ Note: vLLM wins on throughput for multi-user; use vLLM on cloud sandbox if needed

#### Gemini API Hybrid (Selective)
```python
from google.generativeai import GenerativeModel

# Use Gemini 3.0 ONLY for:
# - Complex intent decomposition (local LLM struggles)
# - Code generation (more reliable)
# - Multi-modal reasoning (images, PDFs)
# - Knowledge-intensive tasks

gemini_model = GenerativeModel("gemini-3.0-pro")

# Cost control: Cache prompts (20% discount after 5 requests)
system_prompt = """
[Cached: Expensive prompt for intent parsing strategy]
"""
```

### 3.2 Frontend (React)

#### Canvas UI Libraries
```bash
# Option A: Affine (Recommended)
npm install @affine/component @affine/editor

# Option B: Custom React (tldraw base + custom blocks)
npm install tldraw react-flow-renderer

# UI Framework
npm install react react-dom vite tailwindcss

# Real-time Sync
npm install socket.io-client
npm install zustand  # State management

# Code Blocks
npm install @monaco-editor/react
npm install react-markdown
```

#### Block Components Architecture
```typescript
// BaseBlock.tsx - All blocks inherit from this
interface BlockProps {
  id: string;
  type: BlockType;
  content: Record<string, any>;
  status: "idle" | "loading" | "complete" | "error";
  agentId?: string;
  onUpdate: (content: any) => void;
  onExecute?: () => void;
}

export const BlockTypes = {
  CONTENT: ContentBlock,      // Rich text editor
  IMAGE: ImageBlock,           // Image generation + editor
  VIDEO: VideoBlock,           // Video synthesis workspace
  CODE: CodeBlock,             // Syntax highlighting + execution
  CHAT: ChatBlock,             // Agent conversation
  SANDBOX: SandboxBlock,       // Cloudflare Workers/DO execution
  PRODUCT: ProductBlock,       // Stripe integration
  BROWSER: BrowserBlock,       // Headless browser control
  DATA_TABLE: DataTableBlock,  // Query results visualization
  LISTICLE: ListicleBlock,     // Content + structured list
}
```

### 3.3 Sandbox Environment (Cloudflare)

#### Durable Objects + Sandbox SDK
```python
# Backend: Python Worker + Durable Object

from cloudflare_sdk import Sandbox, DurableObject

class AgentSandbox(DurableObject):
    """
    Each agent requesting code execution gets one instance.
    Lifecycle: Created on demand → 10-min idle timeout → Destroyed
    State: All files in /workspace, processes, env vars
    """
    
    async def execute_code(self, code: str, language: str):
        sandbox = self.env.SANDBOX
        
        # Create isolated sandbox
        result = await sandbox.run_command(
            f"python -c '{code}'",
            timeout=30,
            memory_mb=512
        )
        
        # Access filesystem
        output = await sandbox.read_file("/workspace/output.json")
        
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "files": output,
            "exit_code": result.exit_code
        }

# Frontend: WebSocket to preview
const previewUrl = await sandbox.getPreviewUrl();
// https://<sandbox-id>.sandbox.developer.run
```

**Sandbox Capabilities:**
- ✅ Linux containers (Ubuntu 22.04)
- ✅ Pre-installed: Python, Node.js, Bun, git, ffmpeg
- ✅ Internet access + git clone
- ✅ Persistent /workspace (until container idle-timeout)
- ✅ S3-compatible object storage mount
- ✅ Background processes (keep-alive via heartbeat)

---

## 4. CANVAS BLOCK TYPES & SCHEMAS

### Block Type Definitions

#### 4.1 CONTENT Block (Rich Text Editor)
```json
{
  "type": "content",
  "id": "content_123",
  "metadata": {
    "title": "Business Plan Executive Summary",
    "created_at": "2026-01-26T10:30:00Z",
    "last_edited_by": "strategist_agent",
    "version": 2
  },
  "content": {
    "document": "# Executive Summary\n\nThis platform...",
    "format": "markdown",
    "word_count": 1250,
    "readability_score": 8.5
  },
  "agent_context": {
    "generating_agent": "BusinessStrategist",
    "inputs_consumed": ["market_research_block_id"],
    "confidence_score": 0.92
  }
}
```

#### 4.2 IMAGE Block
```json
{
  "type": "image",
  "id": "image_456",
  "metadata": {
    "title": "Product Landing Page Hero",
    "source_prompt": "Modern SaaS landing page for AI video editor",
    "timestamp": "2026-01-26T11:00:00Z"
  },
  "content": {
    "image_url": "s3://canvas-images/hero_v2.png",
    "format": "png",
    "dimensions": "1920x1080",
    "alt_text": "SaaS hero section with video editing interface",
    "generation_model": "dalle-3",
    "seed": 12345
  },
  "edits": [
    {
      "type": "crop",
      "coords": "[0, 0, 1920, 600]",
      "applied_at": "2026-01-26T11:15:00Z"
    }
  ]
}
```

#### 4.3 CODE Block (Execution)
```json
{
  "type": "code",
  "id": "code_789",
  "metadata": {
    "language": "python",
    "title": "Market Size Calculator",
    "runtime": "3.2s"
  },
  "content": {
    "source": "def calculate_tam():\n    market_size = 50e9\n    penetration = 0.05\n    return market_size * penetration",
    "dependencies": ["numpy", "pandas"],
    "entry_point": "calculate_tam()"
  },
  "execution": {
    "status": "complete",
    "sandbox_id": "sandbox_abc123",
    "output": "2.5 billion USD",
    "runtime_ms": 3200,
    "memory_mb": 45
  }
}
```

#### 4.4 CHAT Block (Agent Conversation)
```json
{
  "type": "chat",
  "id": "chat_012",
  "metadata": {
    "agent": "BusinessMentor",
    "mode": "interactive_refinement"
  },
  "messages": [
    {
      "role": "user",
      "content": "How should we price this product?",
      "timestamp": "2026-01-26T11:30:00Z"
    },
    {
      "role": "assistant",
      "content": "Based on your TAM analysis, I recommend...",
      "timestamp": "2026-01-26T11:30:15Z",
      "agent": "BusinessMentor",
      "suggested_actions": [
        "Create pricing_model block",
        "Run competitor_analysis"
      ]
    }
  ],
  "context": {
    "accessible_blocks": ["market_research_123", "business_plan_456"],
    "tools_available": ["search_competitors", "analyze_pricing"]
  }
}
```

#### 4.5 SANDBOX Block (Execution Environment)
```json
{
  "type": "sandbox",
  "id": "sandbox_345",
  "metadata": {
    "agent": "EngineeringAgent",
    "language": "javascript",
    "framework": "next.js"
  },
  "content": {
    "repository": "github.com/user/project",
    "branch": "main",
    "dockerfile": "# Custom environment",
    "environment_vars": {
      "NODE_ENV": "development",
      "STRIPE_KEY": "${STRIPE_API_KEY}"
    }
  },
  "execution": {
    "sandbox_id": "durable_obj_def456",
    "status": "running",
    "uptime_seconds": 3600,
    "preview_url": "https://def456.sandbox.developer.run",
    "logs": [
      "Server started on port 3000",
      "Database connected"
    ]
  }
}
```

#### 4.6 PRODUCT Block (E-commerce Integration)
```json
{
  "type": "product",
  "id": "product_678",
  "metadata": {
    "sku": "ai-video-editor-pro",
    "pricing_tier": "pro"
  },
  "content": {
    "name": "AI Video Editor Pro",
    "description": "Professional AI-powered video editing",
    "price_usd": 29.99,
    "billing_period": "monthly",
    "stripe_product_id": "prod_abc123"
  },
  "checkout": {
    "stripe_session_id": "cs_live_abc123",
    "checkout_url": "https://checkout.stripe.com/pay/cs_live_abc123",
    "success_redirect": "${DOMAIN}/dashboard"
  }
}
```

#### 4.7 VIDEO Block (Media Generation)
```json
{
  "type": "video",
  "id": "video_901",
  "metadata": {
    "source_prompt": "Product demo video for AI video editor",
    "duration_target": "60s"
  },
  "content": {
    "script": "Here's our AI video editor in action...",
    "scenes": [
      {
        "id": "scene_1",
        "type": "screen_capture",
        "duration": "10s",
        "resource": "https://s3.example.com/demo_raw.mp4"
      }
    ],
    "audio": {
      "voiceover": "s3://audio/voiceover.mp3",
      "background_music": "royalty_free_id: bensound_epic"
    },
    "effects": [
      {
        "type": "transition",
        "name": "fade",
        "duration_ms": 500
      }
    ]
  },
  "output": {
    "video_url": "s3://output/demo_final.mp4",
    "duration": "59.8s",
    "format": "mp4",
    "resolution": "1920x1080",
    "bitrate": "8mbps"
  }
}
```

### Complete Block Schema (JSON Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Canvas Block",
  "type": "object",
  "required": ["type", "id", "metadata"],
  "properties": {
    "type": {
      "enum": [
        "content", "image", "video", "code", "chat", "sandbox",
        "product", "browser", "data_table", "listicle", "ai_generative"
      ]
    },
    "id": {
      "type": "string",
      "pattern": "^[a-z_]+_[a-zA-Z0-9]{6,}$"
    },
    "metadata": {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "created_at": { "type": "string", "format": "date-time" },
        "last_modified_at": { "type": "string", "format": "date-time" },
        "created_by": { "type": "string" },
        "version": { "type": "integer", "minimum": 1 }
      },
      "required": ["created_at", "version"]
    },
    "content": {
      "type": "object",
      "additionalProperties": true
    },
    "agent_context": {
      "type": "object",
      "properties": {
        "generating_agent": { "type": "string" },
        "skill_id": { "type": "string" },
        "inputs_consumed": { "type": "array" },
        "confidence_score": { "type": "number", "minimum": 0, "maximum": 1 }
      }
    },
    "permissions": {
      "type": "object",
      "properties": {
        "owner_id": { "type": "string" },
        "shared_with": { "type": "array" },
        "read_only": { "type": "boolean" }
      }
    }
  }
}
```

---

## 5. AGENT SKILLS FRAMEWORK (CLAWD BOT DECONSTRUCTION)

### Understanding Clawd Bot Skills

Clawd Bot uses **SKILL.md folders** as modular capability packages. We'll port this pattern to AutoGen.

#### 5.1 Clawd Bot Skill Structure (Reference)

```
skills/
├── github_manager/
│   ├── SKILL.md
│   ├── github_utils.py
│   └── prompts/
│       └── commit_analysis.txt
├── email_composer/
│   ├── SKILL.md
│   ├── templates/
│   │   └── professional.html
│   └── email_handler.py
└── code_reviewer/
    ├── SKILL.md
    └── linting_config.json
```

#### 5.2 SKILL.md Format (Portable Across Tools)

```yaml
---
id: github_code_review
name: GitHub Code Review Assistant
description: Reviews pull requests, suggests improvements
disabled: false
mode: false  # Not a mode-command
disable_model_invocation: false
prerequisites:
  - github_cli
  - git
environment:
  GITHUB_TOKEN: ${GITHUB_TOKEN}
  GITHUB_OWNER: optional_default_owner
---

# GitHub Code Review Skill

You are a meticulous code reviewer with expertise in Python, JavaScript, and Go.

## Your Responsibilities

1. **Syntax & Style:** Enforce PEP 8, ESLint, Go conventions
2. **Security:** Identify injection vulnerabilities, hardcoded secrets
3. **Performance:** Suggest optimizations (complexity, memory)
4. **Tests:** Require >80% coverage, meaningful assertions
5. **Documentation:** Ensure clarity, up-to-date comments

## Workflow

When reviewing a PR:
```python
def review_pr(pr_number: int, repo: str):
    # 1. Fetch PR diff
    diff = fetch_github_diff(repo, pr_number)
    
    # 2. Run static analysis
    issues = run_linting(diff)
    security_issues = run_bandit(diff)
    
    # 3. Generate structured feedback
    return ReviewReport(
        files_changed=len(diff),
        critical_issues=security_issues,
        suggestions=issues,
        automated_tests_passed=await run_tests(repo)
    )
```

## Output Format

You MUST respond with JSON:

```json
{
  "status": "approved|requested_changes|comment",
  "summary": "Overall assessment",
  "issues": [
    {
      "file": "src/main.py",
      "line": 42,
      "severity": "critical|warning|info",
      "message": "Use parameterized queries to prevent SQL injection"
    }
  ]
}
```
```

#### 5.3 Clawd Bot Skills Taxonomy

| Skill Category | Examples | AutoGen Mapping |
|---|---|---|
| **Data Access** | GitHub, Email, Slack, Google Drive | MCP Tools |
| **Content Generation** | Email composer, Document drafter, Code generator | Agents with LLM output |
| **Analysis** | Code review, Market research, Data analysis | Analysis Agents |
| **Automation** | Commit workflows, Deployment pipelines, Task scheduling | Action Agents |
| **Conversation** | Customer support, Mentoring, Brainstorming | Conversational Agents |

### 5.4 Porting Clawd Bot Skills to AutoGen

#### Pattern 1: Data Access Skill → MCP Tool

**Clawd Bot Skill:**
```python
# clawd_skills/github_manager/github_utils.py
def list_pull_requests(repo: str, status: str = "open"):
    """Get PR list from GitHub API"""
    return github_api.get(f"/repos/{repo}/pulls?state={status}")
```

**AutoGen Equivalent:**
```python
from autogen_core import Tool

github_pr_tool = Tool(
    name="github_list_prs",
    description="List pull requests from a GitHub repository",
    parameters={
        "repo": "owner/repo_name",
        "status": "open|closed|all"
    },
    function=lambda repo, status: github_api.get(f"/repos/{repo}/pulls?state={status}")
)
```

#### Pattern 2: Analysis Skill → Agent + Tools

**Clawd Bot Skill:**
```markdown
# Code Review Skill
You are an expert code reviewer...
```

**AutoGen Equivalent:**
```python
code_review_agent = AssistantAgent(
    name="CodeReviewer",
    system_message="""You are a meticulous code reviewer. 
    
    Responsibilities:
    - Check syntax & style (PEP 8, ESLint)
    - Identify security issues
    - Suggest performance improvements
    - Verify test coverage
    
    Always respond with JSON containing:
    - status: approved|requested_changes
    - issues: list of {file, line, severity, message}
    - summary: overall assessment
    """,
    model_client=client,
    tools=[
        github_pr_tool,
        linting_tool,
        security_scan_tool,
        test_runner_tool
    ]
)
```

#### Pattern 3: Composite Skill → MultiAgent Workflow

**Clawd Bot:** Product launch orchestration skill
**AutoGen:** Team of agents

```python
# Define agent team
product_lead = AssistantAgent(name="ProductLead", ...)
marketing_lead = AssistantAgent(name="MarketingLead", ...)
engineering_lead = AssistantAgent(name="EngineeringLead", ...)

# Orchestrate via conversation
team = RoundRobinGroupChat(
    participants=[product_lead, marketing_lead, engineering_lead],
    max_turns=20
)

# User request decomposes automatically
result = await team.run(
    task="Launch AI video editor product: validate market, create marketing plan, build MVP"
)
```

### 5.5 Skill Loading at Runtime

```python
# Backend: Skills Registry
class SkillsRegistry:
    def __init__(self, skills_dir: str):
        self.skills = {}
        self.load_skills(skills_dir)
    
    def load_skills(self, skills_dir: str):
        """Load all SKILL.md files and instantiate agents/tools"""
        for skill_folder in Path(skills_dir).iterdir():
            skill_md = skill_folder / "SKILL.md"
            if skill_md.exists():
                skill = self.parse_skill(skill_md)
                self.register_skill(skill)
    
    def parse_skill(self, skill_md: Path) -> Skill:
        """Parse YAML + markdown → Agent or Tool"""
        with open(skill_md) as f:
            content = f.read()
        
        # Split YAML frontmatter
        _, frontmatter, body = content.split("---", 2)
        metadata = yaml.safe_load(frontmatter)
        
        # Load environment & scripts
        env = self.load_environment(metadata)
        functions = self.load_python_modules(metadata)
        
        # Create Agent
        return AssistantAgent(
            name=metadata["id"],
            system_message=body,
            tools=functions,
            model_client=client,
            env=env
        )
    
    def available_skills(self) -> List[str]:
        """For MCP discovery"""
        return list(self.skills.keys())

# Usage in AutoGen
registry = SkillsRegistry("./skills")
agents = [registry.skills[name] for name in registry.available_skills()]

team = RoundRobinGroupChat(participants=agents)
```

---

## 6. IMPLEMENTATION ROADMAP (6 SPRINTS)

### Sprint Cadence: Weekly (Monday-Friday)
**Team Composition:**
- 1x Lead Architect (reviews PRs, unblocks)
- 2x Backend Engineers (AutoGen, APIs, DB)
- 2x Frontend Engineers (React, Canvas UI)

---

### **SPRINT 1: Foundation & Local Inference**
**Goal:** Local-only MVP with basic agent conversation.

#### Week 1 Tasks (Dependency Order)

**Backend Lead (Arch Review):**
- [ ] Set up FastAPI project structure
- [ ] Define core database schema (users, sessions, blocks, agents)
- [ ] PostgreSQL local setup (Docker Compose)

**Backend Engineer 1:**
- [ ] Install LlamaCPP + download Mistral-7B model
- [ ] Create LLM client wrapper (load_local_model.py)
- [ ] Test single-agent conversation (no tools yet)
- [ ] Implement AutoGen ConversableAgent base

**Backend Engineer 2:**
- [ ] Design Block schema (JSON Schema validation)
- [ ] Create Block CRUD endpoints (FastAPI)
- [ ] Implement WebSocket for real-time block updates
- [ ] Set up conversation message logging

**Frontend Engineer 1:**
- [ ] React + Vite scaffold
- [ ] Basic infinite canvas mock (div-based, drag-drop)
- [ ] Block component framework (stub implementations)

**Frontend Engineer 2:**
- [ ] Chat UI component
- [ ] Block sidebar panel (list/filter)
- [ ] WebSocket client for real-time sync

#### Deliverables:
- ✅ Local LLM responding to text input
- ✅ PostgreSQL storing conversations
- ✅ Canvas rendering 3 block types (content, chat, code)
- ✅ WebSocket sync between frontend <→ backend

#### Success Metrics:
- Response latency: <2s per token (local LLM)
- Zero API calls (fully offline)
- 2+ concurrent users supported

---

### **SPRINT 2: Skills & Multi-Agent**
**Goal:** Clawd Bot skill deconstruction + 3-agent team orchestration.

#### Week 2 Tasks

**Backend Engineer 1:**
- [ ] Deconstruct Clawd Bot GitHub skill → MCP tool
- [ ] Implement SkillsRegistry (load SKILL.md files)
- [ ] Create 3 example skills:
  - ResearchAgent (search tool)
  - WriterAgent (document generation)
  - CodeAgent (basic code execution)
- [ ] Auto-discovery of skill capabilities

**Backend Engineer 2:**
- [ ] Implement RoundRobinGroupChat for 3-agent team
- [ ] Add speaker selection logic (semantic understanding)
- [ ] Conversation checkpointing (save/resume state)
- [ ] Message persistence in PostgreSQL

**Frontend Engineer 1:**
- [ ] Implement ContentBlock editor (rich text)
- [ ] Implement CodeBlock with syntax highlighting
- [ ] Add block execution UI (status indicators)

**Frontend Engineer 2:**
- [ ] Multi-agent visualization (show who's speaking)
- [ ] Agent state panel (tools, current task)
- [ ] Block linking (show data flow between blocks)

#### Deliverables:
- ✅ 3 agents conversing autonomously
- ✅ Skills loaded from folders
- ✅ Code execution in blocks
- ✅ Conversation resumable from checkpoint

#### Success Metrics:
- 3 agents reach consensus on task decomposition
- Skill hot-reload without restart
- <500ms between agent messages (ZeroMQ internal communication)

---

### **SPRINT 3: Intent Parser & Block Generation**
**Goal:** NLP intent decomposition → Automatic canvas block creation.

#### Week 3 Tasks

**Backend Engineer 1:**
- [ ] Implement IntentParser (use Gemini 3.0 for complex cases)
- [ ] Design BlockGenerator (LLM-based schema creation)
- [ ] Intent → Block type mapping:
  - "Research..." → ResearchBlock + Chat
  - "Write..." → ContentBlock + WriterAgent
  - "Build..." → SandboxBlock + CodeAgent
- [ ] Validate generated schemas against JSON Schema

**Backend Engineer 2:**
- [ ] Connect Gemini API (hybrid approach)
- [ ] Implement fallback: Gemini for decomposition, local LLM for execution
- [ ] Cost tracking (log Gemini API usage)
- [ ] Prompt caching (20% discount on repeated intents)

**Frontend Engineer 1:**
- [ ] Intent input modal (text area, examples)
- [ ] Real-time block generation preview
- [ ] Block positioning algorithm (force-directed graph layout)

**Frontend Engineer 2:**
- [ ] Animate block creation (fade in, arrange)
- [ ] Show intent parsing progress (step-by-step)
- [ ] Block dependency visualization

#### Deliverables:
- ✅ User says "Research and write about AI" → 4 blocks created
- ✅ Blocks positioned intelligently on canvas
- ✅ Agent team automatically assigned to blocks
- ✅ Parsing cost logged, fallbacks working

#### Success Metrics:
- Intent parsing <4s (Gemini API)
- 90% block schema validation pass rate
- Blocks auto-assigned to correct agent types

---

### **SPRINT 4: Sandbox & Code Execution**
**Goal:** Cloudflare Sandbox SDK integration for agent code execution.

#### Week 4 Tasks

**Backend Engineer 1:**
- [ ] Implement CloudflareWorker + DurableObject for sandboxes
- [ ] Sandbox lifecycle management:
  - Create on-demand when agent needs execution
  - 10-min idle timeout → destroy
  - Persist /workspace output
- [ ] File system access (read/write via API)
- [ ] Environment variable injection (secrets)

**Backend Engineer 2:**
- [ ] Integrate Sandbox into CodeBlock execution flow
- [ ] Error handling + timeout management
- [ ] Streaming logs (WebSocket to frontend)
- [ ] S3-compatible storage for artifacts

**Frontend Engineer 1:**
- [ ] SandboxBlock UI (terminal-like viewer)
- [ ] Real-time log streaming
- [ ] File browser (uploaded/generated files)

**Frontend Engineer 2:**
- [ ] Sandbox preview URL (embedded iframe)
- [ ] Download artifacts (zipped project)
- [ ] Sandbox status indicator (running/idle/destroyed)

#### Deliverables:
- ✅ Agent requests code execution → Sandbox spins up
- ✅ Code runs, outputs persisted, results shown
- ✅ Logs streamed in real-time to frontend
- ✅ Preview URL accessible

#### Success Metrics:
- Sandbox creation <2s (cold start)
- Code execution timeout set correctly (prevent runaway)
- 100MB artifact storage per sandbox
- Logs streaming at <100ms latency

---

### **SPRINT 5: Canvas Blocks (Rich Editing)**
**Goal:** Full implementation of all 10 block types with agents.

#### Week 5 Tasks

**Backend Engineer 1:**
- [ ] Implement remaining block agent handlers:
  - ImageBlock + DALL-E integration (or Gemini)
  - VideoBlock + synthesis API
  - ProductBlock + Stripe checkout
  - BrowserBlock + Puppeteer
- [ ] Block validation before execution

**Backend Engineer 2:**
- [ ] Implement block editing endpoints (PATCH /blocks/{id})
- [ ] Version control for blocks (edit history)
- [ ] Block undo/redo via PostgreSQL snapshots
- [ ] Cross-block data passing (block outputs → inputs)

**Frontend Engineer 1:**
- [ ] Implement ImageBlock editor (Crop, resize, filters)
- [ ] Implement VideoBlock editor (Timeline, effects)
- [ ] Implement ProductBlock (Checkout preview)
- [ ] Rich text editor for ContentBlock (Markdown + WYSIWYG)

**Frontend Engineer 2:**
- [ ] Canvas serialization (save/load layout)
- [ ] Block-to-block connection lines
- [ ] Drag-drop between blocks (data flow)
- [ ] Multi-select + bulk operations

#### Deliverables:
- ✅ All 10 block types functional
- ✅ Agents autonomously populate blocks
- ✅ Users can edit/refine blocks
- ✅ Data flows between blocks

#### Success Metrics:
- 10 block types + agents working
- <500ms edit latency
- Undo/redo unlimited depth
- No data loss on disconnect

---

### **SPRINT 6: Polish, Knowledge Graph & Launch**
**Goal:** Production readiness, agentic memory, deployment.

#### Week 6 Tasks

**Backend Engineer 1:**
- [ ] Implement knowledge graph (Neo4j):
  - Parse entities from block outputs
  - Build entity relationships
  - Query graph for agent context
- [ ] Implement video memory (store key frames + summaries)
- [ ] Agent memory retrieval (context injection into prompts)

**Backend Engineer 2:**
- [ ] Auth system (JWT, sign-up, login, password recovery)
- [ ] User settings dashboard
- [ ] API rate limiting
- [ ] Error handling + monitoring (Sentry)
- [ ] Production database migration

**Frontend Engineer 1:**
- [ ] Auth flows (sign-up, login, password recovery)
- [ ] Settings page (API keys, preferences)
- [ ] Dashboard (user's projects, recent blocks)
- [ ] Landing page + marketing site (Gemini Build acceleration)

**Frontend Engineer 2:**
- [ ] Performance optimization (lazy-loading blocks)
- [ ] Mobile responsiveness
- [ ] Accessibility audit (WCAG 2.1)
- [ ] Dark mode support
- [ ] E2E tests (Playwright)

#### Deliverables:
- ✅ Agents use knowledge graph + memory for context
- ✅ Production database + auth
- ✅ Deployed to cloud (Cloudflare Workers)
- ✅ Landing page + docs

#### Success Metrics:
- Core Web Vitals: LCP <2.5s, FID <100ms
- 99% API uptime (monitored)
- Auth working (sign-up → login → dashboard)
- Knowledge graph improves agent accuracy by 15%

---

### Development Practices (All Sprints)

**Daily Standup (9:00 AM):** 15 min, async-first (Slack thread)
**Code Review:** All PRs require 2 approvals (lead + peer)
**Testing:** >80% coverage for backend, E2E tests for critical flows
**Deployment:** Continuous deployment to staging, manual promotion to production (Friday EOD)

---

## 7. UI/UX FLOWS & COMPONENTS

### 7.1 Core User Flows

#### Flow 1: New Project Creation
```
1. User clicks "New Project"
2. Modal: "Describe your project in 1-2 sentences"
3. User types: "I want to build a business plan for an AI video editor"
4. Backend: IntentParser (Gemini) decomposes intent
5. Frontend: Show progress → "Creating blocks..."
6. Result: Canvas opens with 5 auto-generated blocks
7. User: Can edit, reorder, connect blocks
```

#### Flow 2: Block Execution (Chat)
```
1. User opens ChatBlock
2. Types question: "What's our target market?"
3. ChatAgent reads linked ResearchBlock
4. Agent responds with context
5. User can: Accept → Save as ContentBlock, Refine → Ask follow-up, Reject → Clear
```

#### Flow 3: Code Block Execution
```
1. User writes Python code in CodeBlock
2. Clicks "Run"
3. Agent wraps code + injects sandbox context
4. Cloudflare Sandbox executes
5. Output streamed to terminal view
6. Files saved to /workspace (persistent)
7. User can: Download, Share preview URL
```

### 7.2 Component Library

#### Navigation
```typescript
// Top bar
<Header>
  <Logo />
  <ProjectTitle editable />
  <ShareButton />
  <SettingsDropdown />
  <UserProfile />
</Header>

// Left sidebar
<BlockPanel>
  <Search blocks />
  <BlockLibrary>
    {BlockTypes.map(type => <BlockButton key={type} />)}
  </BlockLibrary>
  <RecentBlocks />
</BlockPanel>

// Right sidebar
<InspectorPanel>
  <SelectedBlockProps />
  <AIAssistant prompt={selectedBlock} />
  <BlockHistory />
</InspectorPanel>
```

#### Canvas Area
```typescript
<Canvas infinite>
  {blocks.map(block => (
    <Block
      key={block.id}
      type={block.type}
      content={block.content}
      onEdit={handleBlockEdit}
      onDelete={handleBlockDelete}
      onConnect={handleBlockConnect}
    >
      {/* Block-specific content */}
      <RenderBlockType type={block.type} content={block.content} />
    </Block>
  ))}
  
  {/* Connection lines between blocks */}
  {connections.map(conn => <Connection from={conn.source} to={conn.target} />)}
</Canvas>
```

#### Block Components (Sample: ContentBlock)
```typescript
export const ContentBlock: React.FC<BlockProps> = ({ id, content, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <BlockWrapper id={id}>
      <BlockHeader>
        <Title>{content.title}</Title>
        <EditButton onClick={() => setIsEditing(!isEditing)} />
      </BlockHeader>
      
      <BlockBody>
        {isEditing ? (
          <RichTextEditor
            value={content.document}
            onChange={(doc) => onUpdate({ ...content, document: doc })}
            onSave={() => setIsEditing(false)}
          />
        ) : (
          <MarkdownRenderer markdown={content.document} />
        )}
      </BlockBody>
      
      <BlockFooter>
        <AgentCredit agent={content.agent_context.generating_agent} />
        <Stats word_count={content.content.word_count} />
      </BlockFooter>
    </BlockWrapper>
  );
};
```

### 7.3 Accessibility & Mobile

**WCAG 2.1 Level AA:**
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Screen reader support (ARIA labels)
- ✅ Color contrast 4.5:1 minimum
- ✅ Focus indicators visible
- ✅ Mobile responsive (320px minimum width)

**Mobile Layout:**
- Canvas → Full-screen blocks (vertical stack)
- Sidebar → Hamburger menu
- Chat → Bottom sheet overlay

---

## 8. DATABASE & KNOWLEDGE GRAPH SCHEMA

### 8.1 PostgreSQL Core Schema

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    name VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects (Canvas workspaces)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR NOT NULL,
    description TEXT,
    intent VARCHAR,  -- Original user intent
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Blocks (Canvas elements)
CREATE TABLE blocks (
    id VARCHAR PRIMARY KEY,  -- "content_abc123"
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type VARCHAR NOT NULL,   -- content, image, code, etc.
    title VARCHAR,
    content JSONB NOT NULL,  -- Full block content
    metadata JSONB,          -- Created by, version, etc.
    agent_context JSONB,     -- {generating_agent, confidence}
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    version INT DEFAULT 1,
    INDEX (project_id, type),
    INDEX (created_at DESC)
);

-- Block Edit History
CREATE TABLE block_versions (
    id SERIAL PRIMARY KEY,
    block_id VARCHAR NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
    content JSONB,
    edited_at TIMESTAMP DEFAULT NOW(),
    edited_by UUID REFERENCES users(id)
);

-- Block Connections (data flow)
CREATE TABLE block_connections (
    id SERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id),
    source_block_id VARCHAR NOT NULL,
    target_block_id VARCHAR NOT NULL,
    connection_type VARCHAR,  -- "data_flow", "dependency", etc.
    FOREIGN KEY (source_block_id) REFERENCES blocks(id) ON DELETE CASCADE,
    FOREIGN KEY (target_block_id) REFERENCES blocks(id) ON DELETE CASCADE
);

-- Conversations (Agent messaging)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id),
    agent_ids VARCHAR[],  -- Participating agent names
    created_at TIMESTAMP DEFAULT NOW()
);

-- Messages (Agent conversation history)
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender VARCHAR NOT NULL,  -- Agent name or "user"
    content TEXT NOT NULL,
    message_type VARCHAR,     -- "text", "tool_call", "function_result"
    metadata JSONB,           -- Tool calls, execution results
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX (conversation_id, created_at DESC)
);

-- Sessions (Conversation checkpoints)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    state JSONB,              -- Full conversation state (serialized)
    created_at TIMESTAMP DEFAULT NOW()
);

-- API Keys (For user's connected services)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service VARCHAR NOT NULL, -- "github", "stripe", "openai"
    encrypted_key VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 8.2 Vector Database (Pinecone/Weaviate)

```python
# Store block embeddings for semantic search
from pinecone import Pinecone

pc = Pinecone(api_key="...")

# Create index
pc.create_index(
    name="imagination-canvas",
    dimension=1536,  # OpenAI embeddings
    metric="cosine",
    spec={
        "serverless": {
            "cloud": "aws",
            "region": "us-west-2"
        }
    }
)

# Upsert block embeddings
index = pc.Index("imagination-canvas")

block_text = f"{block.title} {block.content['document']}"
embedding = openai.Embedding.create(input=block_text)["data"][0]["embedding"]

index.upsert(
    vectors=[
        {
            "id": block.id,
            "values": embedding,
            "metadata": {
                "block_type": block.type,
                "project_id": block.project_id,
                "title": block.title,
                "created_at": block.created_at.isoformat()
            }
        }
    ]
)

# Query similar blocks (for agent context)
results = index.query(
    vector=query_embedding,
    top_k=5,
    filter={
        "project_id": {"$eq": project_id}
    }
)
```

### 8.3 Knowledge Graph (Neo4j)

```python
from py2neo import Graph, Node, Relationship

graph = Graph("bolt://localhost:7687", auth=("neo4j", "password"))

# Entity extraction + insertion
def insert_knowledge(block_content: str, block_id: str):
    # Use NER to extract entities
    entities = extract_entities(block_content)  # Returns [{type, value}, ...]
    
    for entity in entities:
        # Create node
        entity_node = graph.merge(
            Node(entity["type"], name=entity["value"]),
            primary_key="name"
        )
        
        # Link to block
        block_node = Node("Block", id=block_id)
        relationship = Relationship(
            block_node,
            "CONTAINS",
            entity_node
        )
        graph.create(relationship)

# Query related entities (for agent context injection)
def get_related_knowledge(entity_name: str, depth: int = 2) -> List[str]:
    query = f"""
    MATCH (e:Entity {{name: '{entity_name}'}})-[r*0..{depth}]->(related)
    RETURN related.name, labels(related), r.type
    LIMIT 20
    """
    return graph.run(query).data()
```

---

## 9. DEPLOYMENT & INFRASTRUCTURE

### 9.1 Local Development (Docker Compose)

```yaml
# docker-compose.yml
version: "3.9"

services:
  # PostgreSQL
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: imagination_canvas
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  # Local LLM (Ollama for convenience)
  ollama:
    image: ollama/ollama:latest
    volumes:
      - ollama_data:/root/.ollama
    ports:
      - "11434:11434"
    command: serve

  # FastAPI Backend
  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://dev:dev@postgres:5432/imagination_canvas
      LLM_ENDPOINT: http://ollama:11434
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      CLOUDFLARE_ACCOUNT_ID: ${CLOUDFLARE_ACCOUNT_ID}
      CLOUDFLARE_API_TOKEN: ${CLOUDFLARE_API_TOKEN}
    volumes:
      - ./backend:/app
      - ./skills:/app/skills
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - ollama

  # React Frontend
  frontend:
    build: ./frontend
    environment:
      VITE_API_URL: http://localhost:8000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    depends_on:
      - backend

  # Vector DB (Optional: Pinecone cloud alternative)
  redis:  # For caching + message queue
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # Neo4j Knowledge Graph (Optional)
  neo4j:
    image: neo4j:latest
    environment:
      NEO4J_ACCEPT_LICENSE_AGREEMENT: "yes"
      NEO4J_AUTH: neo4j/password
    ports:
      - "7687:7687"
      - "7474:7474"

volumes:
  postgres_data:
  ollama_data:
```

### 9.2 Production Deployment (Cloudflare)

```bash
# Backend: Cloudflare Workers + Durable Objects
wrangler publish

# Frontend: Cloudflare Pages
npm run build
wrangler pages deploy dist/
```

**Configuration (wrangler.toml):**
```toml
[env.production]
vars = { ENVIRONMENT = "production" }
d1_databases = [
  { binding = "DB", database_name = "imagination_canvas_prod" }
]
r2_buckets = [
  { binding = "R2_BLOCKS", bucket_name = "blocks-prod" }
]
durable_objects = [
  { name = "AgentSandbox", class_name = "AgentSandbox" }
]

[[d1_migrations]]
id = "initial_schema"
path = "./migrations"
```

---

## 10. DEVELOPER TOOLS & ACCELERATION

### 10.1 Gemini CLI (For Engineers Building This Project)

Gemini CLI is **NOT** part of the runtime; it's a **development tool** for accelerating the build.

#### Use Case 1: Generate Boilerplate
```bash
# Create FastAPI skill endpoint
gemini-cli << 'EOF'
Create a FastAPI endpoint for a GitHub code review skill.

Requirements:
- POST /skills/code-review
- Input: GitHub PR URL
- Output: JSON review report
- Use AutoGen agent internally

Format: python code
EOF
```

#### Use Case 2: Debug Agent Conversations
```bash
# Log full agent state + memory
gemini-cli << 'EOF'
Analyze this agent conversation for issues:

[Paste conversation JSON]

Check for:
1. Tool failures
2. Hallucinations
3. Inefficient reasoning

Suggest fixes.
EOF
```

#### Use Case 3: Schema Validation
```bash
gemini-cli << 'EOF'
Validate this Pydantic schema against JSON examples:

Schema: [paste]
Examples: [paste JSON]

Report: Schema matches? Suggest fixes?
EOF
```

### 10.2 Google Antigravity IDE (For Canvas + Agent Features)

Antigravity is a **optional secondary tool** for visual prototyping and complex decompositions.

#### Use: Multi-Agent Workflow Design
```
1. Open Antigravity
2. Describe intent: "Build an AI business plan generator"
3. Antigravity generates multi-agent team + task plan
4. Export as AutoGen configuration
5. Integrate into project
```

#### Antigravity + Imagination Canvas:
- Design intent → block layout in Antigravity
- Export as JSON schema
- Import into Imagination Canvas
- Agents execute in local backend

### 10.3 Clawd Bot (For Agent Skills Development)

Use Clawd Bot to **test skill logic** before deploying to Imagination Canvas.

```bash
# Clawd Bot: Test GitHub code review skill
clawd "Review this PR: https://github.com/..."

# Gets: Full PR analysis with structured output
# Then: Adapt this skill for Imagination Canvas
```

### 10.4 Alternative: Opencode IDE

If Clawd Bot is insufficient, use Opencode (browser-based IDE):

```bash
git clone https://github.com/anomalyco/opencode
npm install && npm start

# Build & test skills in browser before integrating
```

### 10.5 Cloudflare Vibes SDK (For UI Acceleration)

Use Vibes SDK to vibe-code React components + landing pages, then import:

```bash
npm install @cloudflare/vibes

# Vibe code: "Create a landing page with hero, features, CTA"
# Vibes SDK generates React code
# Extract & integrate into project
```

### 10.6 Recommended Development Workflow

```
Week 1: Gemini CLI for boilerplate generation
  → FastAPI endpoints, Pydantic schemas, agent system prompts

Week 2-3: Clawd Bot for skill testing
  → Develop GitHub, email, API skills in Clawd
  → Port to AutoGen SKILL.md format

Week 4-5: Antigravity for intent decomposition
  → Design complex workflows
  → Export configurations

Week 6: Vibes SDK for UI components
  → Rapid landing page + marketing site
  → Final polish
```

---

## GLOSSARY & QUICK REFERENCE

### Key Terms

| Term | Definition |
|------|-----------|
| **Canvas** | Infinite edgeless workspace where users compose intent into blocks |
| **Block** | Discrete unit of work (content, code, image, etc.) |
| **Intent** | User's natural language goal ("Build a business plan") |
| **Skill** | Modular capability package (SKILL.md) that agents can load |
| **Agent** | Autonomous AI actor that converses, thinks, and uses tools |
| **Sandbox** | Isolated execution environment (Cloudflare) for code |
| **MCP** | Model Context Protocol (standardized tool/data access) |
| **A2A** | Agent-to-agent communication protocol (opaque interfaces) |
| **Knowledge Graph** | Neo4j structure storing entities + relationships |
| **Durable Object** | Cloudflare primitive for stateful serverless compute |

### Acronyms

- **MVP** = Minimum Viable Product (Sprint 2)
- **RAG** = Retrieval-Augmented Generation (blocks → agent context)
- **GGUF** = Quantized LLM format (LlamaCPP)
- **CRUD** = Create, Read, Update, Delete (API operations)
- **YAML** = Skill definition format
- **ZMQ** = ZeroMQ (message queue)
- **TEE** = Trusted Execution Environment (not used; Cloudflare Sandbox instead)

---

## FINAL CHECKLIST: BEFORE FIRST SPRINT

- [ ] **Team assigned & scheduled**
- [ ] **GitHub repos created** (private organization)
- [ ] **PostgreSQL local dev instance running**
- [ ] **Ollama downloaded & tested** (run inference once)
- [ ] **Gemini API credentials configured**
- [ ] **Cloudflare account with Workers enabled**
- [ ] **AWS/Pinecone credentials (if using vector DB)**
- [ ] **Code review process documented** (pull request template)
- [ ] **Daily standup time locked** (9 AM weekdays)
- [ ] **Deployment checklist created** (staging → production)

---

**This document is authoritative and complete. Any questions should be resolved by consulting the relevant section, then escalating to the Lead Architect.**

**Last Updated:** January 26, 2026  
**Next Review:** After Sprint 1 completion (Feb 2, 2026)