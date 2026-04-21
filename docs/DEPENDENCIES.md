# Dependency Atlas

This document is the canonical reference for the permitted technology stack in the Imagination Engine monorepo. Agents and engineers must consult this Atlas before attempting to add new dependencies.

## Core Substrate (`packages/core`)
| Category | Dependency | Justification |
| :--- | :--- | :--- |
| Block Protocol | `@modelcontextprotocol/sdk` | Official foundation for defining tool schemas and transport. |
| Schema Validation | `zod` | Standardized, composable type validation for block parameters. |
| Canvas Engine | `@xyflow/react` | The robust node/edge graph renderer enabling dual-view interaction. |
| Collaboration | `@liveblocks/client`, `@liveblocks/react` | CRDT-powered multiplayer syncing and presence. |
| AI Integration | `ai` (Vercel AI SDK), `@ai-sdk/google` | Streams chat output and manages LLM provider routing natively. |

## UI Component System (`packages/ui`)
| Category | Dependency | Justification |
| :--- | :--- | :--- |
| Core Library | `react`, `react-dom` | The standard UI framework for the entire monorepo. |
| Styling | `tailwindcss`, `tailwind-merge`, `clsx`, `lucide-react` | Strict, utility-first CSS ensuring consistency across surfaces. |
| Components | `@radix-ui/react-*` | The headless foundation used to port and compose the shadcn/ui library. |
| Animation | `framer-motion` | Fluid layout transitions, particularly in the Canvas/Chat duality switch. |

## Database & Persistence (`packages/db`)
| Category | Dependency | Justification |
| :--- | :--- | :--- |
| ORM | `drizzle-orm` | Type-safe schema definitions enforcing data integrity. |
| Driver | `pg` | Core Postgres connectivity, supporting Cloudflare Hyperdrive via connection strings. |
| RAG Engine | `pgvector` | Native vector embeddings stored alongside relational data. |

## Surface A: Playable (Game Studio)
| Category | Dependency | Justification |
| :--- | :--- | :--- |
| Engine | `phaser` | Hardened HTML5 game framework enabling robust 2D rendering. |
| Physics | `matter-js` | Deterministic physics for multiplayer state synchronization. |
| Determinism | `yjs` | CRDT engine mapped to physics coordinates for perfect client alignment. |

## Surface B: Conductor (Workflow Orchestration)
| Category | Dependency | Justification |
| :--- | :--- | :--- |
| Parsing | `yaml` | Used for defining or translating complex orchestration schemas. |
| Backoff | `async-retry` | Essential for external SaaS integration (Slack, Notion) rate-limit handling. |

## Surface C: Reel (Generative Media)
| Category | Dependency | Justification |
| :--- | :--- | :--- |
| Processing | `ffmpeg.wasm` | In-browser/worker audio and visual stitching pipeline. |
| Timeline UI | `react-use-gesture` | Primitives for building the draggable timeline track. |

## Surface D: Forge (App Builder)
| Category | Dependency | Justification |
| :--- | :--- | :--- |
| Execution | `@webcontainer/api` | The in-browser Node.js sandbox required to compile generated apps. |
| Parsing | `acorn`, `acorn-walk` | Safe AST parsing required by the Tester block to validate generated outputs. |

## Surface E: Scribe (Longform Writing)
| Category | Dependency | Justification |
| :--- | :--- | :--- |
| Rich Text | `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm` | Extensible prose editing enabling inline tracked changes and comments. |
| Layout | `dagre` | Required to auto-arrange the visual map of chapters before jumping into Manuscript mode. |
| Export | `puppeteer` (Dev), `epub-gen` | The robust pipeline required to output the standard PDF and EPUB artifacts. |