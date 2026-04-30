# 02 - Composer Micro-UX

## Textarea Growth Rules

- **Initial Height:** 1 line + padding (approx `44px` or `56px` depending on density).
- **Growth Trigger:** Grows dynamically as the user types, adjusting its `style.height` based on `scrollHeight`.
- **Max Height:** Capped at `200px` (or approx 30vh on mobile). Once reached, the textarea itself becomes scrollable (overflow-y-auto).
- **Layout Shift:** The growth expands _upwards_ into the conversation stream, never pushing the bottom of the screen down. The `ComposerDock` container handles this expansion smoothly.

## Submit Rules

- **Enablement:** The submit button is only active when `input.trim().length > 0` or an attachment is staged.
- **Visual Feedback:** Button transitions from a muted state to a primary brand color upon enablement.

## Send/Stop Behavior

- **State Toggle:** The moment a prompt is submitted, the "Send" (Up Arrow) button morphs into a "Stop" (Square) button.
- **Action:** Clicking "Stop" triggers an `abort()` controller on the stream request, halting generation immediately.
- **Restoration:** Once generation completes or is stopped, the button returns to the "Send" state (disabled if input is empty).

## Attachment Behavior

- **Staging:** Files dragged into the UI or selected via the paperclip icon are staged in a horizontal, scrollable pill-list _above_ the textarea, inside the ComposerDock.
- **Preview:** Images show thumbnail previews; documents show file-type icons.
- **Removal:** Each staged attachment has an explicit `x` button for removal prior to submission.

## Focus Handling

- **Auto-focus:** Textarea receives focus immediately upon page load and after every submission.
- **Blur:** Focus is maintained unless the user explicitly clicks away (e.g., to interact with a tool call).

## Keyboard Shortcuts

- `Enter`: Submit prompt.
- `Shift + Enter`: Insert new line.
- `Esc`: If focused on an expanded artifact or menu, close it and return focus to composer.

## Disabled / Loading States

- **In-flight:** Textarea remains enabled during streaming to allow queuing the next message (optional) or disabled to prevent race conditions. (Target state: Disabled during active generation, displaying "Agent is thinking...").
