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

- [ ] Task: Scaffold `/packages/chat-interaction-kit` using Turbo/pnpm.
- [ ] Task: Implement typed contracts: `ChatMessage`, `StreamEvent`, `MessageLifecycle`, `ToolCall`, `Artifact`.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Package Initialization & Type Contracts' (Protocol in workflow.md)

## Phase 3: Hooks Implementation (TDD)

- [ ] Task: Implement `useAutoScroll` and `useGrowingTextarea`.
- [ ] Task: Implement `useStreamingMessage` and `useComposerSubmit` (with stop handling).
- [ ] Task: Implement `useMessageActions`, `useKeyboardShortcuts`, and `useToolDisclosure`.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Hooks Implementation' (Protocol in workflow.md)

## Phase 4: Component Implementation (TDD)

- [ ] Task: Implement `ChatShell`, `ConversationViewport`, `ComposerDock`, and `EmptyState`.
- [ ] Task: Implement `MessageList`, `AssistantMessage`, `UserMessage`, and `MessageActionBar`.
- [ ] Task: Implement `GrowingTextarea`, `ScrollAnchor`, and `JumpToLatestButton`.
- [ ] Task: Implement `ToolCallBlock` and `ArtifactPreview` (compact, expanded, dev views).
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Component Implementation' (Protocol in workflow.md)

## Phase 5: Application Integration & E2E Validation

- [ ] Task: Replace existing Chat implementation in `apps/web` with the new kit.
- [ ] Task: Ensure zero "mock", "stub", or "TODO: real implementation" remain in the kit or integration layer.
- [ ] Task: Update Playwright E2E tests to validate auto-scroll, stop generation, and tool call visibility.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Application Integration' (Protocol in workflow.md)
