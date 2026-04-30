# Autogen Exploration Archive

## Notice of Retirement
This directory contains early explorations using the Python-based Microsoft Autogen framework. 

We have decided to **retire** this approach and archive the code here for historical reference. The decision to deprecate Autogen in favor of a bespoke TypeScript implementation was driven by the following factors:

1. **Language Mismatch:** The core application (React, Node.js, Hono) is entirely TypeScript. Introducing a Python-heavy agentic layer fragmented the monorepo, complicating CI/CD, deployment, and testing.
2. **Metaphor Mismatch:** Autogen's conversational multi-agent paradigm was too rigid for the Imagination Engine's Block Protocol. We require discrete, composable tools (MCP blocks) executing within a directed acyclic graph (DAG) managed by a central scheduler.
3. **Redundancy:** The introduction of the Vercel AI SDK natively within our TypeScript stack provided the necessary streaming primitives and LLM routing without the overhead of an external framework.

## Future Architecture
All future agent orchestration and block definitions will be built using the TypeScript-native `@modelcontextprotocol/sdk` and our custom `CanvasScheduler`.