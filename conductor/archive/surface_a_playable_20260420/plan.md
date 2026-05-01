# Implementation Plan: Surface A — Playable (Game Studio)

## Phase 1: Engine Foundation & Spatial Setup

- [x] Task: Integrate Phaser 4, WebGL 2, and Enable3D into a React component wrapper.
  - [x] Sub-task: Red (Write mount and lifecycle tests for the engine wrapper)
  - [x] Sub-task: Green (Implement the React-to-Phaser bridge with Enable3D context)
  - [x] Sub-task: Refactor (Optimize memory cleanup on component unmount)
  - [x] Sub-task: Adversarial (Write tests aggressively mounting and unmounting the engine to check for WebGL context leaks)
- [x] Task: Integrate Matter.js physics and Spine 2D runtimes.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Engine Foundation & Spatial Setup' (Protocol in workflow.md)

## Phase 2: Game Blocks & Deterministic Sync

- [x] Task: Define and register the game-primitive MCP blocks (`Scene`, `Character`, `Input`, `Rule`).
  - [x] Sub-task: Red (Write schema and logic tests for the game blocks)
  - [x] Sub-task: Green (Implement the blocks and their execution logic mapping to the engine)
- [x] Task: Implement Deterministic Sync via Yjs.
  - [x] Sub-task: Red (Write tests verifying identical physics state across two simulated clients)
  - [x] Sub-task: Green (Wire Yjs updates into the Phaser update loop)
  - [x] Sub-task: Refactor (Abstract the sync logic into a reusable physics-sync manager)
  - [x] Sub-task: Adversarial (Write tests simulating high network jitter during collision events)
- [x] Task: Conductor - User Manual Verification 'Phase 2: Game Blocks & Deterministic Sync' (Protocol in workflow.md)

## Phase 3: Playable Canvas & Export

- [x] Task: Implement the `PlayableCanvas` view mode toggle.
  - [x] Sub-task: Red (Write tests verifying UI state when mode switches)
  - [x] Sub-task: Green (Implement full-screen transition and engine initialization from the canvas graph)
- [x] Task: Implement the "Launch as Creation" artifact export flow and Invite Link mechanism.
  - [x] Sub-task: Red/Green/Refactor for the URL generation and deep-link routing.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Playable Canvas & Export' (Protocol in workflow.md)
