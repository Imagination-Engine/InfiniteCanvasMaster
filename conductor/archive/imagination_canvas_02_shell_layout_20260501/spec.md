# Imagination Canvas Extraction: 02 - Shell and Layout

## Overview

This track implements the foundational shell and layout architecture for the Imagination Canvas based on `docs/imagination-canvas-extraction/02-shell-and-layout-audit.md`. It provides the responsive structural components that frame the infinite workspace, accommodating different working modes without crowding the canvas.

## Functional Requirements

1. **CanvasShell Component:**
   - Implement the root wrapper that controls mode transitions (Canvas, Focus, Split, Present).
   - Establish the Z-index layering model (Canvas -> Connectors -> Selection -> UI Chrome -> Modals).
2. **Top Workspace Bar:**
   - Display canvas metadata, sync status, and the command entry/Intent Navigator trigger.
3. **Left Rail / Tool Dock:**
   - Provide persistent but quiet access to core tools (Select, Hand, Draw, Text, Shape, Connector, etc.).
4. **Right Inspector Shell:**
   - Build an expandable/collapsible side panel for object properties, AI settings, and provenance data.
5. **Bottom Command Zone:**
   - Implement a contextual hint and "Ask AI" zone that appears dynamically based on selection.

## Non-Functional Requirements

- **Responsive Adaptation:** Components must gracefully collapse or switch to bottom-sheet patterns on tablet/mobile devices.
- **Visual Restraint:** The UI chrome should feel like a "quiet cockpit"; the canvas itself must remain the visual hero.

## Acceptance Criteria

- `CanvasShell` successfully mounts and exposes its layout regions.
- Modes can be toggled, resulting in the correct visibility of toolbars and panels.
- The Z-index layering strictly adheres to the definitions in the spec document.
