# 04 - Scroll & Streaming Behavior

## Auto-Scroll Rules

- **Active Streaming:** The `ConversationViewport` must automatically scroll down as new tokens arrive, keeping the latest token visible.
- **Scroll Anchor:** A dedicated `div` at the absolute bottom of the list serves as the anchor point for `scrollIntoView()`.

## Scroll Lock Rules (The Crucial UX Feature)

- **User Interruption:** If the user scrolls _up_ while generation is actively streaming, auto-scroll must **immediately disengage**.
- **Preserve Reading:** The user must be able to read past messages without the UI jarringly yanking them back to the bottom.

## Jump-to-Latest Behavior

- **Trigger:** When auto-scroll is locked (user scrolled up) and the viewport is not at the bottom.
- **UI:** A floating, circular "Arrow Down" button fades into view, hovering just above the `ComposerDock`.
- **Action:** Clicking it triggers a smooth `scrollIntoView` to the anchor and re-engages the auto-scroll lock.

## Bottom Padding Rules

- **Dynamic Calculation:** The `ConversationViewport` must calculate the height of the `ComposerDock` (which changes as the textarea grows) and apply an equivalent `padding-bottom`.
- **Visibility:** This ensures the final message is never trapped behind the absolute-positioned composer.

## Stream Completion Behavior

- Ensure the final scroll snaps precisely to the bottom once the stream closes.
