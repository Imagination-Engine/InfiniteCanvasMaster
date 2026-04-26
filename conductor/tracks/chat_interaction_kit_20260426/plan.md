# Implementation Plan: Chat Interaction Kit Extraction

## Phase 1: UX/UI Extraction Documentation

- [x] Task: Create `/docs/chat-ux-extraction/` directory.
- [x] Task: Generate `01-layout-shell-audit.md` (App shell, viewport, docking).
- [x] Task: Generate `02-composer-micro-ux.md` (Textarea, submit/stop, shortcuts).
- [x] Task: Generate `03-message-lifecycle.md` (States, streaming, errors).
- [x] Task: Generate `04-scroll-and-streaming-behavior.md` (Auto-scroll, anchoring).
- [x] Task: Generate `05-tool-artifact-rendering.md` (Hierarchy, previews, JSON view).
- [x] Task: Generate `06-design-token-map.md` (Spacing, typography, motion).
- [x] Task: Generate `07-component-implementation-plan.md` (Components, hooks, contracts).
- [x] Task: Generate `08-gap-list.md` (Current vs Target state).
- [x] Task: Conductor - User Manual Verification 'Phase 1: UX/UI Extraction Documentation' (Protocol in workflow.md)

## Phase 2: Package Initialization & Type Contracts

- [x] Task: Scaffold `/packages/chat-interaction-kit` using Turbo/pnpm.
- [x] Task: Implement typed contracts: `ChatMessage`, `StreamEvent`, `MessageLifecycle`, `ToolCall`, `Artifact`.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Package Initialization & Type Contracts' (Protocol in workflow.md)

## Phase 3: Hooks Implementation (TDD)

- [x] Task: Implement `useAutoScroll` and `useGrowingTextarea`.
- [x] Task: Implement `useStreamingMessage` and `useComposerSubmit` (with stop handling).
- [x] Task: Implement `useMessageActions`, `useKeyboardShortcuts`, and `useToolDisclosure`.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Hooks Implementation' (Protocol in workflow.md)

## Phase 4: Component Implementation (TDD)

- [x] Task: Implement `ChatShell`, `ConversationViewport`, `ComposerDock`, and `EmptyState`.
- [x] Task: Implement `MessageList`, `AssistantMessage`, `UserMessage`, and `MessageActionBar`.
- [x] Task: Implement `GrowingTextarea`, `ScrollAnchor`, and `JumpToLatestButton`.
- [x] Task: Implement `ToolCallBlock` and `ArtifactPreview` (compact, expanded, dev views).
- [x] Task: Conductor - User Manual Verification 'Phase 4: Component Implementation' (Protocol in workflow.md)

## Phase 5: Application Integration & E2E Validation

- [x] Task: Replace existing Chat implementation in `apps/web` with the new kit.
- [x] Task: Ensure zero "mock", "stub", or "TODO: real implementation" remain in the kit or integration layer.
- [x] Task: Update Playwright E2E tests to validate auto-scroll, stop generation, and tool call visibility.
- [x] Task: Conductor - User Manual Verification 'Phase 5: Application Integration' (Protocol in workflow.md)
