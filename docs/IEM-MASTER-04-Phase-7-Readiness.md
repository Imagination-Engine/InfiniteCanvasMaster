# IEM-MASTER-04 — Phase 7: Surface Realization, "The Final Polish" & Demo Readiness

> **Objective:** Transition the Imagination Engine from a structurally complete, Mastra-powered backend architecture to a fully realized, production-grade frontend experience. This phase defines "Ready" and "Done" by enforcing a rigorous, human-in-the-loop, round-robin iteration cycle for all UI/UX components.

This document serves as the canonical map for Phase 7 to permanently eliminate context drift.

---

## The Definition of "Done"
A feature is only considered "Done" when it has passed the **Live Round-Robin Feedback Loop** (see Section 3) and has been technically extrapolated, fully implemented via strict TDD, and visually verified by the human user.

---

## 7.1. Block View Implementation (The Frontend Awakening)
The 51+ blocks currently exist as robust data schemas and backend Mastra execution bindings. Their frontend React Flow components must be upgraded from auto-generated stubs to rich, interactive, production-grade nodes.

- [ ] **Scribe Surface:** Implement TipTap WYSIWYG for `editorBlock`, `proseBlock`, and `chapterBlock` views.
- [ ] **Playable Surface:** Implement WebGL/Phaser.js viewports for `cameraBlock`, `spriteBlock`, and visual inputs for `joystickBlock`.
- [ ] **Atlas Surface:** Implement drag-and-drop file upload zones for `documentLoaderBlock` and interactive data-tables for `vectorSearchBlock`.
- [ ] **Reel Surface:** Implement timeline scrubbing UI for `timelineBlock` and video preview windows for `sceneBlock`.
- [ ] **Conductor/Forge Surfaces:** Implement syntax-highlighted code editors (Monaco/CodeMirror) for `programmerBlock`, `builderBlock`, and `testerBlock`.

## 7.2. Real-Time Multiplayer Polish (Liveblocks)
Ensure the visual collaboration features are production-ready for a live demo environment.

- [ ] **Presence:** Implement live multiplayer cursors with user identification tags.
- [ ] **Selection:** Implement shared selection bounding boxes (seeing what other users are clicking).
- [ ] **Synchronization:** Verify that the React Flow DAG state (node dragging, edge connecting) is perfectly, instantly synced across multiple authenticated browsers via Yjs/Liveblocks.

## 7.3. The Live Round-Robin Iteration Loop
The core of Phase 7. The human user will drive the final polish through this explicit, repeatable cycle for every major screen and workflow:

### The 5-Step Loop
1. **Physical Testing:** The human user physically tests all functions on a single screen/workflow (e.g., The Dual-View Toggle, generating a specific blueprint).
2. **Functional Feedback:** The human user supplies explicit feedback on broken, missing, or clunky features.
3. **Aesthetic Feedback:** The human user supplies UX and design feedback (spacing, colors, typography, transitions) for that screen.
4. **Technical Extrapolation (The AI PM Role):** The AI acts as a Technical Product Manager. It takes the human feedback and extrapolates the *entire blast radius* of the required changes.
   - *Example:* "Make the chat load faster" -> Extrapolates to: UI loading states + API latency optimization + Database indexing + Mastra memory caching.
   - The AI will document the extrapolated plan across all necessary layers: Logic, Data, Schema, APIs, Agents, AI Models, and Database.
5. **Implementation (Strict TDD):** The AI implements the extrapolated plan using rigorous Test-Driven Development. No code is committed until tests pass.

## 7.4. End-to-End (E2E) Playwright Matrix
Automated browser tests to ensure the UI remains unbreakable during the final faculty demo.

- [ ] **Authentication Flow:** E2E test for login to project dashboard.
- [ ] **Intent to Blueprint:** E2E test for Chat Shell intent capturing -> Mastra backend generation -> Blueprint rendering on the Canvas.
- [ ] **Dual-View Transition:** E2E test verifying the visual transition between Fullscreen Chat and Split Canvas views.

## 7.5. Deployment & CI/CD Hardening
Finalize the deployment topology so the Capstone is hosted and accessible via a public URL.

- [ ] **Frontend (Apps/Web):** Deploy to Cloudflare Pages or Vercel.
- [ ] **Backend (Apps/Server + Agents):** Deploy to a Node.js environment (e.g., Render, Railway, or AWS) capable of handling long-running Mastra workflows and WebSocket connections.
- [ ] **Database:** Ensure the production Postgres database (Neon/Supabase) is properly migrated and seeded.

---
> **End of Spec.** The system is now locked into Phase 7. All future actions must adhere to the Round-Robin Iteration Loop.
