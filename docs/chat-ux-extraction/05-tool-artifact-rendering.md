# 05 - Tool & Artifact Rendering

## Hierarchy

Tools must be rendered as distinct sub-nodes within an Assistant Message, chronologically inline with the text stream.

## Tool Call Display States

1. **Compact (Default):** A simple, single-line pill or block.
   - _Icon:_ A wrench, gear, or tool-specific icon.
   - _Status:_ "Executing `tool_name`..." (pulsing) -> "Completed `tool_name`" (green check).
2. **Expanded:** Triggered by a chevron click. Reveals a tabbed or split interface.

## Expanded Views

1. **Human-Readable Mode (Artifact):**
   - If the tool generates a visual artifact (e.g., an image from a generative tool, or a formatted table from a data fetch), render it cleanly here.
   - For `generate_canvas_blueprint`, this could optionally display a mini-map or a "Nodes added to canvas" summary.
2. **Developer Mode (Raw JSON):**
   - A strict, syntax-highlighted code block (`<pre><code>`) displaying the exact JSON `arguments` sent to the tool, and the raw JSON `response` received from the tool.
   - Essential for debugging agent behavior.

## Transitions

- Use Framer Motion (`AnimatePresence` and `motion.div height: "auto"`) to smoothly animate the expansion and collapse of tool blocks, preventing abrupt layout shifts.
