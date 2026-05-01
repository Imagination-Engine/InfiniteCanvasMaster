# Specification: Doc 01: Exterior Integrations & The 95% Automation Playbook

## 1. Overview

This specification covers two critical tracks from Document 01 (Part IV and Part VI).

- **Exterior Integrations:** Implements the Tier 1 external integrations (Google Workspace, Comms, Knowledge) using the Model Context Protocol (MCP) architecture.
- **The 95% Automation Playbook:** Operationalizes the "self-executing master doc" thesis by building a robust suite of `iem:*` CLI commands, an executable agent boot protocol, and the conversational Student Playbooks.

## 2. Functional Requirements

### 2.1 Exterior Integrations (Tier 1 MCP)

- **Google Workspace (In-House):** Build a custom MCP server within `packages/agents/servers/google-workspace` supporting Gmail (read/send) and Google Calendar (read/create).
- **Comms (Official):** Connect and configure the official Slack and Discord MCP servers for use within the Conductor surface.
- **Knowledge (In-House/Official):** Implement or connect MCP servers for Notion and Obsidian to support the Conductor and Scribe surfaces.

### 2.2 The 95% Automation Layers

- **Interactive Node.js CLI & Agent Tool:** Build the suite of `pnpm iem:*` commands (`new-mcp`, `new-agent-persona`, `new-adr`, `pr-prep`, `triage-add`, `triage-review`, `demo-tag`, `weekly-report`) using `commander` and `inquirer`. Crucially, these must be exposed as tools accessible by the agent operating on the canvas/repo.
- **Executable Boot Protocol (`pnpm iem:boot`):** Replace a static Markdown boot sequence with an executable Node.js script. Agents must run this script upon session initialization to dynamically fetch the latest context, open work items, surface rules, and Git status.
- **The Student Playbook:** Author the conversational, agent-readable walkthroughs in `docs/playbook/` as defined in Section 6.4.

## 3. Non-Functional Requirements

- **Consistency:** All custom MCP servers must adhere to the standard `@modelcontextprotocol/sdk` interfaces.
- **TDD:** Adhere to the strict 85% coverage "Red, Green, Refactor, Adversarial" workflow for the CLI scripts and custom MCP servers.

## 4. Out of Scope

- Building the actual surfaces that consume these integrations; this track solely builds the MCP _servers_ and the automation _tooling_.
