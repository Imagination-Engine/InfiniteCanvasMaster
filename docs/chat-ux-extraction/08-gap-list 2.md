# 08 - Gap List (Current vs. Target)

## Missing in Current App (`apps/web/src/Components/Chat/ChatShell.tsx`)

1. **Dynamic Composer Growth:** The current `textarea` has a fixed height or grows uncontrollably without upward expansion logic.
2. **Scroll Lock & Anchor:** Auto-scroll relies on a basic `useEffect` that forces the user to the bottom even if they try to scroll up to read during a long generation.
3. **Jump-to-Latest Button:** Entirely missing.
4. **Tool Call Expansion:** Tool calls currently render as simple pulsed text blocks without the ability to expand into "Developer Mode" or "Artifact Mode".
5. **Send/Stop Toggle:** There is no mechanism to interrupt/abort a stream mid-generation. The send button is just disabled.
6. **Mobile Layout:** The dock and sidebars do not properly collapse into Drawers on smaller viewports.

## Unstable Behaviors

- **Padding Collisions:** The composer dock sometimes overlays the final message because the dynamic bottom padding on the viewport is not explicitly tracking the composer's height.
- **Empty State:** The empty state is generic and lacks quick-start prompts or branding context.
- **Error Boundaries:** Errors are dumped as raw text blocks rather than graceful, retryable UI components.

## Mocked/Stubbed Paths to Fix

- None remaining in the backend due to previous tracks, but the frontend lacks proper typing for `toolInvocations`, often casting them as `any`. This must be replaced with strict `ToolCall` contracts from the new kit.
