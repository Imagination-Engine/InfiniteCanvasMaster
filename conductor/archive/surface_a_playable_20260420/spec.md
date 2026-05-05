# Specification: Surface A — Playable (Game Studio)

## 1. Overview

This track implements the first of the five specialized surfaces (Section 12 of the Master Plan). Surface A transforms the node-based canvas into a live, collaborative multiplayer game studio. It introduces game-primitive blocks and a sophisticated dual-view where the canvas _becomes_ the playable world.

## 2. Functional Requirements

### 2.1 The Advanced Game Engine (Phaser + Enable3D)

- **Core Engine:** Integrate **Phaser 4** utilizing WebGL 2 for high-performance rendering.
- **Spatial/3D Integration:** Incorporate **Enable3D** to merge Three.js capabilities within the Phaser scenes, allowing for true spatial depth and 3D objects alongside 2D UI.
- **Physics & Animation:** Utilize the built-in **Matter.js** for high-precision rigid body physics and integrate the **Spine 2D** runtime for fluid skeletal animations.

### 2.2 Game-Primitive Blocks & Input Routing

- **Block Definitions:** Implement core game blocks: `Scene`, `Character`, `Item`, `Rule`, `Spawner`, and `Win Condition`.
- **Input Routing:** Map standard keyboard/mouse input directly to **Generic Input Blocks** on the canvas, allowing users to wire physical inputs into the game logic graph.

### 2.3 PlayableCanvas Mode

- **View Toggle:** Create a `PlayableCanvas` view mode that hides the node-editing interface and executes the graph logic within the Phaser engine, filling the screen.
- **Artifact Export:** Implement the "Launch as Creation" flow, bundling the Canvas state into a standalone playable URL.

### 2.4 Multiplayer Sync

- **Deterministic State:** Extend the core Yjs presence layer to handle **Deterministic Sync**. The system must sync the underlying game state (physics, input events) so both clients process identical logic, ensuring true multiplayer playtesting.
- **Invite Flow:** Implement an invite-link mechanism for instant, zero-install peer joining.

## 3. Non-Functional Requirements

- **Performance:** The Phaser rendering pipeline and DAG scheduler must maintain a locked 60 FPS.
- **TDD:** Adhere to the strict 85% coverage "Red, Green, Refactor, Adversarial" workflow.

## 4. Out of Scope

- Building asset creation tools (users will upload or reference external 3D models/Spine assets).
