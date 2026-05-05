# Specification: Unified Chat Shell & Session Duality

## 1. Overview

This track builds the front door of the Imagination Engine: the Chat Shell (Section 8 of the Master Plan). It establishes the core conversational interface using the Vercel AI SDK and implements the critical "Session" object that maintains a one-to-one, lazily-initialized relationship between the chat history and a React Flow canvas.

## 2. Functional Requirements

### 2.1 The Chat Shell

- **Implementation:** Build a single-pane conversational UI using the Vercel AI SDK (`useChat`), `shadcn/ui` components, and `react-markdown`.
- **Features:** A prominent input area, model selector, "new chat" button, and a "toggle canvas view" button.

### 2.2 Session Duality & Lazy Creation

- **Data Link:** Implement the `Session` object that binds the chat view and the canvas view.
- **Lazy Materialization:** A new session starts as chat-only. The canvas is materialized lazily in the background only when the conversation requires a block, image, or tool call.
- **User Notification:** Provide a gentle inline affordance ("I created a canvas for this. Open canvas?") when the lazy creation triggers.

### 2.3 Onboarding Carousel

- **Implementation:** Build a dismissable, 4-slide swipeable modal using `embla-carousel-react`.
- **Content:** Welcome, "Blocks are Agents", "The Canvas is yours", and a Call to Action.
- **State:** Track completion in the user's data store (`has_completed_onboarding`) so it only shows on first run.

## 3. Non-Functional Requirements

- **UX Parity:** The Chat Shell must feel instantaneous and the streaming must be fluid.
- **TDD:** Adhere to the strict 85% coverage "Red, Green, Refactor, Adversarial" workflow.

## 4. Out of Scope

- The "Creations Drawer" and sidebar history (handled in a separate track).
- The actual LLM routing logic for deciding _when_ to use a tool (handled by the Agent Runtime track).
