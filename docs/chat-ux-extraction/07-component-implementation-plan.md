# 07 - Component Implementation Plan

## Components

1. **ChatShell:** The main orchestrator component. Manages layout, sidebar toggles, and provides context.
2. **ConversationViewport:** The scrollable container for messages. Implements `useAutoScroll`.
3. **MessageList:** Renders the array of messages.
4. **AssistantMessage / UserMessage:** Specific bubble implementations enforcing the design token map.
5. **ComposerDock:** The absolute-positioned bottom container.
6. **GrowingTextarea:** The core input field utilizing `useGrowingTextarea`.
7. **ScrollAnchor:** A zero-height div at the bottom of the message list.
8. **JumpToLatestButton:** A floating action button appearing when auto-scroll is disengaged.
9. **ToolCallBlock:** The expandable block for rendering tool executions.
10. **ArtifactPreview:** Renders outputs from specific tools natively.
11. **MessageActionBar:** The hover-state actions (copy, regenerate, edit).
12. **EmptyState:** The initial view before any conversation exists.

## Hooks

1. `useAutoScroll`: Manages the intersection observer and manual lock overrides for streaming.
2. `useGrowingTextarea`: Manages the dynamic height adjustment of the composer.
3. `useStreamingMessage`: Adapts `@ai-sdk/react`'s `useChat` to our specific lifecycle states.
4. `useComposerSubmit`: Handles keyboard shortcuts (Enter vs Shift+Enter) and dispatching.
5. `useMessageActions`: Handles copying to clipboard and retry logic.
6. `useToolDisclosure`: Manages the compact vs expanded vs dev views of tool calls.

## Typed Contracts

- `ChatMessage`: `id`, `role`, `content`, `toolInvocations`, `createdAt`.
- `StreamState`: `'idle' | 'thinking' | 'streaming' | 'error'`.
- `ToolCallState`: `'executing' | 'completed' | 'error'`.
