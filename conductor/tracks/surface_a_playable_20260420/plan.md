# Implementation Plan: Surface A — Playable (Game Studio)

## Phase 1: Engine Foundation & Spatial Setup
- [ ] Task: Integrate Phaser 4, WebGL 2, and Enable3D into a React component wrapper.
    - [ ] Sub-task: Red (Write mount and lifecycle tests for the engine wrapper)
    - [ ] Sub-task: Green (Implement the React-to-Phaser bridge with Enable3D context)
    - [ ] Sub-task: Refactor (Optimize memory cleanup on component unmount)
    - [ ] Sub-task: Adversarial (Write tests aggressively mounting and unmounting the engine to check for WebGL context leaks)
- [ ] Task: Integrate Matter.js physics and Spine 2D runtimes.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Engine Foundation & Spatial Setup' (Protocol in workflow.md)

## Phase 2: Game Blocks & Deterministic Sync
- [ ] Task: Define and register the game-primitive MCP blocks (`Scene`, `Character`, `Input`, `Rule`).
    - [ ] Sub-task: Red (Write schema and logic tests for the game blocks)
    - [ ] Sub-task: Green (Implement the blocks and their execution logic mapping to the engine)
- [ ] Task: Implement Deterministic Sync via Yjs.
    - [ ] Sub-task: Red (Write tests verifying identical physics state across two simulated clients)
    - [ ] Sub-task: Green (Wire Yjs updates into the Phaser update loop)
    - [ ] Sub-task: Refactor (Abstract the sync logic into a reusable physics-sync manager)
    - [ ] Sub-task: Adversarial (Write tests simulating high network jitter during collision events)
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Game Blocks & Deterministic Sync' (Protocol in workflow.md)

## Phase 3: Playable Canvas & Export
- [ ] Task: Implement the `PlayableCanvas` view mode toggle.
    - [ ] Sub-task: Red (Write tests verifying UI state when mode switches)
    - [ ] Sub-task: Green (Implement full-screen transition and engine initialization from the canvas graph)
- [ ] Task: Implement the "Launch as Creation" artifact export flow and Invite Link mechanism.
    - [ ] Sub-task: Red/Green/Refactor for the URL generation and deep-link routing.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Playable Canvas & Export' (Protocol in workflow.md)