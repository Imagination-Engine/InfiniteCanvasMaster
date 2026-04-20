# Specification: Canvas Runtime Enrichment (Presence & Execution)

## 1. Overview
This track enhances the core React Flow canvas to support the advanced features required by the five surfaces (Section 7 of the Master Plan). It introduces real-time multiplayer presence, a robust topological execution scheduler for the blocks, and the foundational data models and views for the temporal timeline.

## 2. Functional Requirements
### 2.1 Real-Time Presence
- **Implementation:** Integrate Liveblocks (utilizing their open-source stack for local execution) to manage presence.
- **Features:** Broadcast cursor positions, block selections, and edit locks across multiple connected clients in real-time.

### 2.2 DAG Execution Scheduler
- **Streaming-Native Scheduler:** Build `CanvasScheduler` to execute graphs in topological order. The scheduler must natively handle and resolve `AsyncIterable` outputs from streaming blocks.
- **State Preservation:** Implement error boundaries that halt execution on block failure but preserve the partial state and outputs of successful blocks.

### 2.3 Timeline Overlay Foundation
- **Data Model:** Update the canvas block schema to store both `spatial` (x/y) and `temporal` (time track position) coordinates.
- **UI Rendering:** Implement the canvas view toggle to seamlessly switch the React Flow instance between `spatial` mode (free placement) and `temporal` mode (ordered by timeline tracks).

### 2.4 Artifact Registry Hooks
- **Snapshot Logic:** Implement the baseline logic allowing a canvas to package its current graph and block outputs into an idempotent, committable snapshot.

## 3. Non-Functional Requirements
- **Performance:** Presence broadcasts must be throttled to maintain a 60fps rendering experience without overwhelming the websocket.
- **TDD:** Adhere to the strict 85% coverage "Red, Green, Refactor, Adversarial" workflow.

## 4. Out of Scope
- Expanding presence into full game state (handled by Surface A).
- Advanced workflow features like loops and retries (handled by Surface B).
- The actual media rendering pipeline for the timeline (handled by Surface C).