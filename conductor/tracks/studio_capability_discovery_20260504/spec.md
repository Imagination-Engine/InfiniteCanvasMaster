# Specification: Studio Capability Discovery & Audit

## Overview

This is Track 1 of the "Studio Capability Manifest" implementation, corresponding to Phase 1 of the master prompt. Before any runtime code is written, a rigorous discovery and audit phase must be conducted. The goal is to deeply analyze the current state of the repository (specifically the 51 blocks and registry) and generate explicit mapping documents that will guide all subsequent manifest implementations.

## Functional Requirements

1. **Capability Matrix Generation (`26-current-capability-matrix.md`):**
   - Conduct a Deep Code Analysis of the `packages/**/block*` and registry directories.
   - Generate a comprehensive markdown matrix detailing all 51 blocks.
   - Required Columns: Studio, Block, Current UI, Needed UI, Current Runtime, Needed Runtime, Model Aliases, Tool Mounts, Accepts, Produces, Status, Risk, Priority.
2. **Task Breakdown Generation (`27-generated-task-breakdown.md`):**
   - Based on the gaps identified in the Matrix, generate an exhaustive list of discrete technical tasks required for Phase 2 through 9.
   - Tasks must be hyper-specific to the repository context (e.g., "Add `toolMountIds` to `NoteBlock` interface").
3. **Risk Register Generation (`28-track-risk-register.md`):**
   - Identify and document potential architectural risks (e.g., missing NPM packages, overlapping fabric lanes, un-implemented artifact viewers).
   - Categorize risks by impact and probability.

## Acceptance Criteria

- [ ] `26-current-capability-matrix.md` exists and is populated with high-fidelity data extracted from the codebase.
- [ ] `27-generated-task-breakdown.md` exists and provides a roadmap for the subsequent tracks.
- [ ] `28-track-risk-register.md` exists and highlights critical blockers.

## Out of Scope

- Modifying any application source code (TypeScript, React, etc.). This track is strictly read-only and documentation-focused.
