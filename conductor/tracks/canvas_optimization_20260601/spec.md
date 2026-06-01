# Specification: Canvas Node Rendering and Performance Optimization

## Overview

This track addresses significant performance and usability issues within the Imagination Canvas. Currently, dragging nodes across the canvas results in noticeable lag, primarily due to inefficient state updates during drag events. Additionally, the nodes lack clear, discoverable connection handles (affordances), making it difficult for users to manually wire blocks together. This track will resolve the drag lag and introduce visible connection handles on both the left and right sides of all nodes, enabling users to draw custom flowing SVG connections between them.

## Functional Requirements

1. **Connection Handles:** Every node on the canvas must render a visible connection handle (e.g., a small circle) on both its left and right edges.
2. **Manual Routing:** Users must be able to click and drag from any connection handle to another node's connection handle to establish a relationship.
3. **Connection Visuals:** The resulting connection must be rendered as a "Custom Flowing SVG" that aligns with the established directional, flowing style of the Imagination Engine.

## Non-Functional Requirements

1. **Drag Performance:** Dragging nodes must feel fluid and responsive, with no perceptible lag.
2. **State Management Optimization:** Optimize the state update cycle during drag events (likely within Zustand or the React Flow adapter) to prevent unnecessary re-renders of the entire canvas or unaffected nodes.

## Acceptance Criteria

- [ ] Visual connection handles (circles) are clearly visible on the left and right sides of all node types.
- [ ] A user can successfully drag a connection from a left/right handle to another node.
- [ ] Established connections are visually represented using the Custom Flowing SVG style.
- [ ] Dragging any node across the canvas is smooth and exhibits no noticeable lag compared to the current state.

## Out of Scope

- Introducing new node types or changing the underlying behavior of existing node logic beyond their spatial representation and connectivity.
- Changing the primary canvas rendering engine.
