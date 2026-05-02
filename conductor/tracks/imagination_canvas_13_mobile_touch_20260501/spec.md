# Imagination Canvas Extraction: 13 - Mobile, Touch, and Stylus Rules

## Overview

This track implements touch and stylus interactions for the Imagination Canvas based on `docs/imagination-canvas-extraction/13-mobile-touch-and-stylus-rules.md`. It ensures the canvas behaves natively on mobile devices and tablets, providing appropriate gesture recognition, accessible hit targets, and mobile-optimized layout components (like Bottom Sheets instead of Side Panels).

## Functional Requirements

1. **Touch Gesture Engine:**
   - Implement one-finger pan (on background), pinch-to-zoom, and two-finger pan.
   - Differentiate touch selection (tap) vs drag vs long-press (context menu).
   - Integrate stylus support (drawing vs panning).

2. **Mobile Layout Fallbacks:**
   - Implement a Bottom Sheet component (`MobileInspector`) to replace the `RightInspector` on small screens.
   - Implement a streamlined mobile toolbar/quick-add FAB (Floating Action Button).

3. **Hit Target Accessibility:**
   - Update all transform handles (resize, rotate, connection anchors) to have invisible hit areas of at least 44px on touch devices.

4. **Capture-First / AI Assistance:**
   - Implement UI flows for mobile capture (e.g., triggering a voice note or camera upload that drops directly onto the canvas).
   - Prioritize agentic "organize this" commands for mobile users to offset the difficulty of manual spatial organization.

## Non-Functional Requirements

- **Performance:** Touch events must not trigger unnecessary React re-renders. Use `framer-motion` or direct DOM manipulation for active panning/zooming.
- **Palm Rejection:** If drawing with a stylus, one-finger panning should be disabled or handled gracefully.

## Acceptance Criteria

- Pinch-to-zoom and two-finger panning work fluidly on mobile/tablet devices.
- Tapping a block selects it; dragging a selected block moves it without panning the canvas.
- Opening the Inspector on a screen width < 768px renders a Bottom Sheet instead of a side panel.
- Transform handles are easily grabbable on touch screens.
