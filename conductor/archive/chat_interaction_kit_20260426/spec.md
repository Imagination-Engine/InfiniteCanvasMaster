# Specification: Chat Interaction Kit Extraction

## 1. Goal

Create a production-grade Chat Interaction Kit for our project that captures the smoothness, stability, and battle-tested UX patterns of mature AI chat systems (like LibreChat), adapting the experience to our own backend, Mastra agents, local inference, and Edge Twin architecture.

## 2. Rules & Constraints

1. Do not blindly copy visual identity.
2. Do not introduce mocked behavior as final implementation.
3. Do not create fake states that are not connected to real backend events.
4. Every interaction must map to a typed state, event, or lifecycle.
5. The shell must remain stable; the conversation stream is the primary kinetic surface.
6. The composer must grow internally without destabilizing the page.
7. Streaming must support interruption, retry, completion, scroll lock, and jump-to-latest behavior.
8. Tool calls must support human-readable display and developer inspection.
9. Mobile and desktop must be treated as first-class surfaces.
10. Accessibility, keyboard behavior, reduced motion, and focus restoration are mandatory.

## 3. Deliverables

1. **UX Extraction Documentation:** A comprehensive 8-document suite in `/docs/chat-ux-extraction/` defining layouts, lifecycles, and design tokens.
2. **Chat Interaction Kit Package:** `/packages/chat-interaction-kit` containing typed contracts, hooks, and reusable components.
   - _Components:_ ChatShell, ConversationViewport, MessageList, AssistantMessage, UserMessage, ComposerDock, GrowingTextarea, ScrollAnchor, JumpToLatestButton, ToolCallBlock, ArtifactPreview, MessageActionBar, EmptyState.
   - _Hooks:_ useAutoScroll, useGrowingTextarea, useStreamingMessage, useComposerSubmit, useMessageActions, useKeyboardShortcuts, useToolDisclosure.
   - _Contracts:_ ChatMessage, StreamEvent, MessageLifecycle, ToolCall, Artifact.

## 4. Acceptance Criteria

1. The composer grows smoothly without moving the shell.
2. The stream unfurls while the UI remains anchored.
3. The user can scroll up without being pulled back down.
4. A jump-to-latest control appears when appropriate.
5. Send becomes stop during streaming.
6. Tool calls have compact, expanded, and developer views.
7. Every loading state is specific, not generic.
8. Every message action has hover/focus/tap behavior.
9. Mobile layout feels native, not compressed desktop.
10. No final code contains "mock," "stub," "placeholder," or "TODO: real implementation."
