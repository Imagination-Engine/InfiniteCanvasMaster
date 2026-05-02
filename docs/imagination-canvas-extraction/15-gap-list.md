# 15 — Gap List: Imagination Canvas Extraction

## Overview

This document tracks the delta between the current prototype-grade canvas implementation and the target state.

## 1. Architectural Gaps

- [ ] **Package Isolation**: Core canvas logic is currently trapped in apps/web. It must be extracted.
- [ ] **Store Unified Implementation**: Current implementation uses a basic useYjsStore hook. Needs formal store suite.
- [ ] **Typed Mutation Model**: Mutations should be transactional and undoable.

## 2. Shell & Layout Gaps

- [ ] **Multi-Density Shell**: Creation and Review modes are missing.
- [ ] **Contextual Inspector**: The right inspector panel is not implemented.
- [ ] **Floating Tool Dock**: Need custom Balnce-native floating dock.

## 3. Interaction & Viewport Gaps

- [ ] **Semantic Zoom**: Viewport does not support detail scaling.
- [ ] **Focus Mode**: No ability to zoom into regions while maintaining return context.

## 4. Block & Content Gaps

- [ ] **Balnce-Native Blocks**: NoteCard, AgentBlock, GoalBlock, etc. need formal implementations.
- [ ] **Expansion System**: No support for Peek or Fullscreen transitions.

## 5. Agentic & AI Gaps

- [ ] **Selection-Scoped Actions**: AI actions cannot be scoped to marquee selection.
- [ ] **Mutation Previews**: Changes applied without preview step.
- [ ] **Provenance Metadata**: AI-created objects lack persistent links.

## 6. Persistence & History Gaps

- [ ] **Robust Undo/Redo**: Integrated undo with agentic mutations.
- [ ] **Snapshots & Forking**: No ability to branch canvas state.
