# 01 — Research Basis and Toolset Decisions

## Model Layer

Use model aliases, not hardcoded provider model strings. The Gemini API model list currently includes Gemini 3.x, Gemini 2.5 Flash/Pro families, Nano Banana / Gemini image models, Veo video models, and Gemini Live/audio models. The Gemini 3 guide positions Gemini 3.1 Pro for complex multimodal reasoning, Gemini 3 Flash for fast high-capability work, Nano Banana Pro/Gemini 3 Pro Image for high-quality image generation, Nano Banana 2/Gemini 3.1 Flash Image for efficient image work, and Veo for video.

Sources:

- https://ai.google.dev/gemini-api/docs/models
- https://ai.google.dev/gemini-api/docs/gemini-3
- https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/2-5-flash
- https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/3-pro-image

## Agent and Workflow Layer

Mastra remains the core substrate for agents, workflows, tools, model routing, streaming, and MCP-oriented tool integration.

Sources:

- https://mastra.ai/docs/agents/overview
- https://mastra.ai/docs/agents/using-tools
- https://mastra.ai/docs/workflows/agents-and-tools
- https://github.com/mastra-ai/mastra

## ImagiClaw / OpenClaw-Inspired Runtime

OpenClaw is useful as a technical reference for local assistant gateways, skills, channels, and canvas-like control surfaces. Product-facing names must use ImagiClaw. Security posture must be strict because public reporting highlights risks with high-privilege skills, local file access, shell execution, and malicious skill distribution.

Sources:

- https://github.com/openclaw/openclaw
- https://github.com/VoltAgent/awesome-openclaw-skills
- https://www.theverge.com/news/874011/openclaw-ai-skill-clawhub-extensions-security-nightmare
- https://www.techradar.com/pro/here-are-the-openclaw-security-risks-you-should-know-about

## Canvas Agent Workspace Reference

OpenCove is not product-facing for Balnce, but it is a relevant technical reference for infinite canvas workspaces containing agents, tasks, terminals, notes, knowledge, and research.

Source:

- https://github.com/DeadWaveWave/opencove

## Video Studio

Recommended layered approach:

- Twick as candidate React timeline editor SDK.
- ffmpeg.wasm for light browser-local edits.
- native FFmpeg worker for heavy renders.
- OpenMontage as agentic video pipeline/recipe source, not direct embed until license/legal/security review; its repo lists AGPLv3.
- Remotion as React-based composition technique where useful.

Sources:

- https://github.com/ncounterspecialist/twick
- https://ncounterspecialist.github.io/twick/
- https://github.com/ffmpegwasm/ffmpeg.wasm
- https://ffmpegwasm.netlify.app/docs/overview
- https://github.com/calesthio/OpenMontage
- https://github.com/calesthio/OpenMontage/blob/main/AGENT_GUIDE.md
- https://github.com/calesthio/OpenMontage/blob/main/docs/PROVIDERS.md

## Writer's Studio

Use a serious editor substrate: Tiptap for custom control, Lexical for performance/accessibility, BlockNote for a fast Notion-like block editor.

Sources:

- https://tiptap.dev/
- https://github.com/ueberdosis/tiptap
- https://lexical.dev/
- https://github.com/facebook/lexical
- https://www.blocknotejs.org/
- https://www.blocknotejs.org/docs

## Game and World Studio

Recommended runtime split:

- Phaser for 2D browser game runtime.
- PixiJS for high-performance 2D rendering and interactive visual worlds.
- Babylon.js for 3D/WebGPU/WebXR.
- Godot as future export/import candidate, not first embedded runtime.

Sources:

- https://docs.phaser.io/
- https://pixijs.com/
- https://www.babylonjs.com/
- https://godotengine.org/

## App Creation Studio

Progressive sandbox stack:

- Sandpack for lightweight React/code previews.
- WebContainers for browser Node/npm/fullstack runtime, subject to licensing/browser constraints.
- E2B/Daytona as secure cloud sandbox candidates for AI-generated code execution and longer-running builds.

Sources:

- https://sandpack.codesandbox.io/
- https://github.com/codesandbox/sandpack
- https://developer.stackblitz.com/platform/api/webcontainer-api
- https://webcontainers.io/
- https://github.com/e2b-dev/e2b
- https://e2b.dev/
- https://www.daytona.io/

## Commerce and Intentcasting Studio

Initial version must be demo-choreographed unless real payment/brand/network connectors exist. Headless commerce references: Medusa, Vendure, Saleor.

Sources:

- https://saleor.io/
- https://docs.saleor.io/
- https://vendure.io/
- https://github.com/vendurehq/vendure
- https://docs.vendure.io/current/core/developer-guide/overview

## Research and Knowledge Studio

Use LlamaIndex.TS as primary TypeScript RAG/context-engineering candidate; Haystack as Python production RAG candidate; LangChain/LangGraph only as integration reference to avoid framework sprawl.

Sources:

- https://developers.llamaindex.ai/typescript/framework/
- https://developers.llamaindex.ai/typescript/framework/modules/agents/workflows/
- https://docs.haystack.deepset.ai/docs/intro
- https://github.com/deepset-ai/haystack
- https://github.com/langchain-ai/langchain

## Automation and Protocol Layer

MCP provides a standard way to expose tools, resources, and prompts. n8n is valuable as a recipe/reference and possible isolated adapter, not as unguarded runtime. Temporal is a future candidate for durable long-running workflows.

Sources:

- https://modelcontextprotocol.io/specification/2025-11-25
- https://github.com/modelcontextprotocol/modelcontextprotocol
- https://docs.n8n.io/
- https://n8n.io/
- https://docs.temporal.io/develop/typescript
- https://temporal.io/

## Image / Audio / Multimodal Support

ComfyUI is a candidate for advanced visual generation workflow adapters. WaveSurfer.js and Tone.js are web-native audio visualization/editing/music candidates.

Sources:

- https://github.com/comfy-org/ComfyUI
- https://www.runflow.io/blog/comfyui-api-developer-guide
- https://wavesurfer.xyz/
- https://wavesurfer.xyz/docs/
- https://tonejs.github.io/
