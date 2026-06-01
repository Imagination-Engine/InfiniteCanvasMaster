# 01 - Layout & Shell Audit

## App Shell Structure

- **Dual-View Container:** The overarching layout acts as a master controller split between `ChatShell` and `CanvasViewport`. The ChatShell can run in isolated (centered, max-width) or side-by-side mode.
- **Header:** Fixed, frosted-glass header housing session controls, context pickers (agent/model selection), and global settings.
- **Footer:** In standard mode, the ComposerDock is anchored to the bottom. In full-screen reading mode, it minimizes.

## Sidebar Behavior

- **Left Sidebar (History):** Collapsible panel managing past sessions. Maintains scroll state when toggled. Smooth width transitions (0px to 260px) utilizing Framer Motion.
- **Right Sidebar (Settings/Artifacts):** A secondary drawer exclusively for viewing generated artifacts (e.g., Code previews, Image renders) without losing context of the chat stream.

## Conversation Viewport Behavior

- **Padding:** Generous top padding (to clear the header) and dynamic bottom padding (calculated based on the ComposerDock's exact height) to ensure the latest message is never obscured.
- **Width Constraint:** Text content is strictly capped at `max-w-3xl` (approx. 768px) for optimal reading line length, while artifacts can break out of this boundary for wider layouts.

## Composer Docking Behavior

- **Anchoring:** Always anchored `bottom-0`. It floats slightly above the actual bottom edge of the screen (approx `bottom-6`) with a blur backdrop, giving the illusion that the stream goes "under" it.
- **Z-Index:** High Z-index (e.g., `z-40`) to sit above the message stream.

## Breakpoints

- **Mobile (`<768px`):** Sidebars become full-screen overlays (Drawers). Dual-View stacks vertically or toggles. Composer dock touches the exact bottom edge (`bottom-0`).
- **Tablet (`768px - 1024px`):** Left sidebar is hidden by default. Dual-view is restricted; focus is primarily on chat.
- **Desktop (`>1024px`):** Sidebars can lock open. Dual-view operates natively side-by-side.
