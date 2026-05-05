# Specification: Studio Manifest Infrastructure & Registration

## Overview

This is Track 4 of the "Studio Capability Manifest" implementation, executing Phases 4 & 5 of the master prompt. It bridges the type definitions (Track 2) into concrete, structured manifest files for each major studio and sets up the global `ToolMountRegistry`.

## Functional Requirements

1. **Concrete Studio Manifests:**
   - Create rigorous manifest instances (matching the `StudioManifest` schema) for: Writer, Video, Game, App Creation, Commerce, Agent, and Research studios.
   - Place these in a central `/studios` or `/manifests` registry directory.
2. **Tool Mount Registry:**
   - Implement the `ToolMountRegistry`.
   - Seed it with the researched tools identified during the Track 1 Audit.
   - Do NOT build the actual tool execution logic yet, only the formal mount points (the API boundary description).

## Acceptance Criteria

- [ ] At least 7 concrete studio manifests are registered and exportable.
- [ ] The `ToolMountRegistry` exists and successfully validates incoming mount configurations.
- [ ] The engine can programmatically list all registered studios and their promised tool mounts.

## Out of Scope

- Orchestrator integration (Track 7).
- Cross-studio logic (Track 5).
