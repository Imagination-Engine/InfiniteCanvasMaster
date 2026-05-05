# Refactoring Orchestrator Chat Shell to Slide-Out Drawer

## Objective

Transition the `FloatingOrchestratorChat` from a draggable, floating window to a fixed, right-docked slide-out drawer, mirroring the structural and behavioral pattern of the `BlockLibraryDrawer`.

## Requirements

1. **Remove Drag Functionality:** Strip out Framer Motion `drag`, `useDragControls`, and related handle logic.
2. **Fixed Positioning:** The open drawer must anchor to `right: 0`, `top: 0`, `bottom: 0`.
3. **Toggle Tab:** When closed, present an un-obtrusive tab on the right edge of the screen (mirroring the Library tab on the left). The tab should contain a relevant icon (e.g., `BrainCircuit` or `Sparkles`) and the vertical text "Agent" or "Orchestrator".
4. **Dimensions:**
   - Width: Fixed to `350px` when open.
   - Height: `100%` of the viewport/container.
5. **Chat UX:** Retain the `GrowingTextarea` and the Framer Motion `AnimatePresence` for the chat stream.

## Implementation Steps

### 1. Refactor `FloatingOrchestratorChat.tsx`

- **State:** Keep the local `isOpen` (currently `isMinimized`) state to manage the drawer visibility, or rename it for clarity.
- **Closed State (The Tab):** Create a `<button>` rendered conditionally when `!isOpen` that sits at `absolute right-4 top-1/2 -translate-y-1/2` containing the icon and vertical text.
- **Open State (The Drawer):**
  - Change the container class to `absolute right-0 top-0 bottom-0 w-[350px] bg-brand-bg-page/95 backdrop-blur-3xl border-l border-white/10 z-50 flex flex-col shadow-2xl`.
  - Remove all inline `style` objects handling width/height calculations.
- **Header:** Replace the drag handle with a simple header containing the title ("Orchestrator") and a close button (`<X />`).
- **Body & Footer:** Retain the existing chat stream container (`flex-1 overflow-y-auto`) and the input area (`shrink-0`).

### 2. Rename Component (Optional but Recommended)

For naming consistency, we should ideally rename this component to `OrchestratorDrawer` in the future, but for this PR, we will maintain the `FloatingOrchestratorChat` name to avoid breaking imports across the monorepo, while changing its internal behavior.

## Verification

- Test that the drawer slides/toggles smoothly.
- Test that the drawer takes up the full height of the canvas.
- Test that typing a long message in the `GrowingTextarea` works without breaking the layout.
- Test that the chat stream auto-scrolls correctly.
