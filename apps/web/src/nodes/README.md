# Nodes / Block Protocol

This directory contains the implementations of the nodes (blocks) used within the Imagination Engine.

## How to use this
Every node must be refactored to implement the standard Block Protocol (MCP tool binding) to ensure consistency, composability, and testing.

## Structure
- Various `.tsx` and `.ts` files implementing React Flow nodes and their logic.

## Standards
Strict TDD rhythm (Red, Green, Refactor, Adversarial).
All blocks must adhere to the `BlockDefinition` interface and wrap their underlying logic as an MCP Tool.

## Changelog
- 2026-04-20: README initialized.

## See also
- `imagination-canvas/src/agent/` for the Agent Runtime.