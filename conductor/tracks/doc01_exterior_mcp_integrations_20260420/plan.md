# Implementation Plan: Doc 01: Exterior Integrations & The 95% Automation Playbook

## Phase 1: Tier 1 MCP Servers

- [x] Task: Implement the Google Workspace MCP Server.
  - [x] Sub-task: Red (Write tests mocking the Google APIs for Gmail read/send and Calendar read/create)
  - [x] Sub-task: Green (Implement `packages/agents/servers/google-workspace/` utilizing the official MCP SDK and Google Node.js client)
  - [x] Sub-task: Refactor (Clean up OAuth token resolution and error handling)
  - [x] Sub-task: Adversarial (Write tests simulating invalid OAuth tokens and API rate limits)
- [x] Task: Connect the official Slack, Discord, Notion, and Obsidian MCP servers.
  - [x] Sub-task: Red/Green/Refactor for configuring connection settings and testing connectivity within the monorepo.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Tier 1 MCP Servers' (Protocol in workflow.md)

## Phase 2: The 95% Automation CLI & Agent Tools

- [x] Task: Build the interactive Node.js CLI suite (`pnpm iem:*`).
  - [x] Sub-task: Red (Write shell/unit tests verifying command execution and expected output formats)
  - [x] Sub-task: Green (Implement `new-mcp`, `new-agent-persona`, `new-adr`, `pr-prep`, `triage-*`, `demo-tag`, `weekly-report` using `commander` and `inquirer`)
  - [x] Sub-task: Refactor (Extract shared Git and file system utilities into a common module)
  - [x] Sub-task: Adversarial (Write tests attempting to run PR prep with failing tests, ensuring it blocks execution)
- [x] Task: Expose the CLI commands as runnable tools for the agent operating on the canvas.
  - [x] Sub-task: Red/Green/Refactor the MCP server binding (`execute_iem_command`) for the CLI suite.
- [x] Task: Conductor - User Manual Verification 'Phase 2: The 95% Automation CLI & Agent Tools' (Protocol in workflow.md)

## Phase 3: Executable Boot Protocol & The Student Playbook

- [x] Task: Implement the executable Agent Session-Opening Protocol (`pnpm iem:boot`).
  - [x] Sub-task: Red (Write tests verifying the script dynamically reads from `AGENTS.md`, `.agent/rules/`, `git log`, and `docs/backlog/TRIAGE.md`)
  - [x] Sub-task: Green (Build the Node.js script that compiles and outputs the 6-stage boot sequence text)
  - [x] Sub-task: Refactor (Optimize read performance for large logs or triage backlogs)
  - [x] Sub-task: Adversarial (Write tests running the boot script in a dirty Git tree or empty triage file to ensure it handles edge cases gracefully)
- [x] Task: Author the conversational Student Playbooks in `docs/playbook/`.
  - [x] Sub-task: Red/Green/Refactor for writing and formatting the Markdown files as defined in Section 6.4.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Executable Boot Protocol & The Student Playbook' (Protocol in workflow.md)
