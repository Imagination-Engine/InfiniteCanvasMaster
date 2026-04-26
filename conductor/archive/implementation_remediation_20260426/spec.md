# Specification: Implementation Remediation & Baseline Realization

## 1. Overview

This track executes the "Exceed Original Specification" action plan derived from the Deep Research & Gap Analysis report (`deep_research_gap_analysis_20260426`). It addresses all identified architectural drift, eradicates mock implementations, and pushes the project to full production readiness as defined in `IEM-MASTER-00` through `04`.

## 2. Scope

- **Backend First Execution:** Prioritize resolving the fragmented Mastra integration and missing workflow compilation logic before tackling frontend UI extraction.
- **Unified Brain:** Align `mastra.config.ts` with the shared `@iem/db` Drizzle configuration.
- **Workflow Compilation:** Build a robust `Tldraw-to-Mastra` workflow compiler and backend execution endpoint.
- **Native UI Convergence:** Eliminate the LibreChat iframe (`ChatShell.tsx`) and implement native streaming, markdown, and "thinking" visualizers in the Dual-View container.
- **Comprehensive Spatial Realization:** Implement production-grade Tldraw shapes for all 51+ blocks across all 5 surfaces (Scribe, Playable, Atlas, Reel, Forge).
- **Pragmatic Mock Eradication:** Systematically replace `mock://` implementations. If blocked by external dependencies, document with explicit TODOs, but aim for maximal replacement.
- **CLI Automation:** Expand the `pnpm iem:*` CLI for complete surface scaffolding and PR preparation.

## 3. Objectives

- Achieve 100% architectural alignment with the Master Plan addendums.
- Ensure the backend can dynamically execute complex, multi-surface workflows derived from the Tldraw canvas.
- Deliver a native, seamless Dual-View experience without reliance on iframes.
- Attain parity in the 51-block system with interactive Tldraw components.

## 4. Deliverables

1. **Unified Database/Brain configuration.**
2. **`TldrawToMastra` Compiler & Runner Endpoint.**
3. **Native ChatShell (No iframe).**
4. **41+ New Production Tldraw Shapes.**
5. **Expanded `iem:*` CLI.**

## 5. Constraints & Mandates

- **Perfect Operation Protocol:** Every inflection point or architectural decision must be explicitly surfaced for user guidance.
- Strict TDD enforcement for all new implementations.
