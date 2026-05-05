# Specification: Block Library & Interaction

## Overview

This track addresses the functional and aesthetic shortcomings of the Block Library and its interaction with the canvas. Based on the "IEM Canvas Plz.md" document, the current library is "ugly and shallow" and lacks drag-and-drop capability. This track will redesign the library cards for high scannability and implement robust cross-component drag-and-drop from the library to the canvas spatial engine.

## Functional Requirements

1. **Block Library UI Repair:**
   - Redesign library cards to be premium, highly scannable creative toolkits.
   - Header: Implement the new icon system, clean title, and studio/category badge.
   - Body: Add a brief, meaningful 1-2 sentence description and minimal (2-4) capability chips.
   - Footer: Display runtime readiness (Live, Demo, etc.) and a hover-only drag affordance handle.
   - Fix search bar UI bugs (icon overlap, padding, focus states).
   - Improve carousel/filter styling (active states, hover, spacing).
2. **Library-to-Canvas Drag & Drop:**
   - Implement drag-and-drop functionality for all block library cards.
   - Drop mechanism: Calculate the exact drop coordinates relative to the canvas viewport (`screen-to-canvas` transformation).
   - Instantiation: Creating a typed block in the `useCanvasStore` upon drop.
   - Interaction: The newly dropped block should instantly become selected/focused.
   - Event Emission: Trigger a `canvas.block.added` event (or equivalent) to notify the Orchestrator.

## Acceptance Criteria

- [ ] Block Library cards display meaningful descriptions and capability chips.
- [ ] Search input and filter carousels are visually polished without overlaps.
- [ ] A block can be successfully dragged from the library and dropped onto the canvas.
- [ ] The dropped block appears exactly at the mouse cursor's coordinates (accounting for zoom/pan).
- [ ] Dropping a block selects it and alerts the on-canvas orchestrator.

## Out of Scope

- Internal block runtime logic or backend wiring (reserved for a later track).
