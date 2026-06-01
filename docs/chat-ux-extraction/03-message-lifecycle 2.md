# 03 - Message Lifecycle

## State Machine Overview

The UI must explicitly handle distinct phases of a message's lifecycle, eliminating any generic "loading" spinners.

### User Message States

1. **Pending/Staging:** Input exists in composer but not submitted.
2. **Submitted:** Pushed to the stream array. Immediately rendered.
3. **Persisted:** Acknowledged by the backend as saved to Postgres (optional visual cue, usually implicit).

### Assistant Message States

1. **Queued (Thinking):** The UI displays a dedicated "Agent is thinking..." indicator with an animated pulsing dot or wave.
2. **Streaming:** The text payload unfurls sequentially via `useChat`.
3. **Tool Invocation:** The stream yields a `tool_call` event. The UI renders an expandable block indicating the tool's execution (e.g., `Executing web_search...`).
4. **Tool Result:** The stream yields a `tool_result` event. The Tool block updates to a green checkmark or displays the artifact.
5. **Complete:** The stream finishes. Action bars (Copy, Regenerate, Edit) fade in.

### Error / Retry / Interruption States

- **Interrupted:** The user clicks "Stop". The message is finalized in its partial state. A visual indicator (e.g., an orange stop icon) notes the interruption.
- **Error:** The stream fails or a tool throws an exception. A distinct error boundary is rendered inline within the assistant's message bubble, colored distinctively (e.g., Rose/Red).
- **Retry:** An action button allows the user to re-trigger the generation from that specific conversational node.
