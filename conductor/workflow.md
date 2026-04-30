# Project Workflow

This document outlines the standard development workflow and rules for the Imagination Engine project. Agents and engineers must adhere to this protocol.

## 1. Test-Driven Development (TDD) Protocol

Every new feature, block, and MCP tool must follow the strict four-step rhythm defined in the Master Plan:

1. **Red:** Write the failing test first. The test describes the desired behavior. Run it and watch it fail.
2. **Green:** Write the simplest implementation that makes the test pass.
3. **Refactor:** Clean up the code, extract functions, and rename variables while keeping the tests green.
4. **Adversarial:** Add one test that intentionally tries to break what was just written (e.g., edge cases, malformed inputs, race conditions). If it passes, proceed.
5. **No Stubs/Mocks Rule:** Do not use stubs or mocks in your tests. Use the actual implementation instead.

## 2. Quality & Coverage Standards

- **Test Coverage Requirement:** >85%. Code cannot be considered complete until this threshold is demonstrably met.
- **Required Tests per Tool:** Every MCP tool/block requires a request-schema test, a response-schema test, a happy-path test, and an error-path test.

## 3. Version Control, Branching & Commits

- **Branching Strategy:** All new features, integrations, and tracks MUST be developed on an isolated feature branch (e.g., `feature/descriptive-name`). Do NOT commit directly to `main`.
- **Pull Request (PR) Flow:** Once a feature branch is functionally complete and the workspace is clean, it must be pushed to the remote repository. A Pull Request must then be opened against the `main` branch. This allows the team to review, engage, and validate the code before adopting it into the core repository.
- **Commit Frequency:** Commits are required **Per Phase** (after an entire phase of tasks is completed).
- **Task Summaries:** Task and phase summaries must be recorded directly in the **Commit Messages** (e.g., in the commit body).
- **PR Gates:** No PR is merged unless the commit history visibly reflects the Red/Green/Refactor/Adversarial cycle.

## 4. Phase Completion Verification and Checkpointing Protocol

When generating `plan.md` files, a final verification task must be appended to every phase to ensure quality before moving to the next phase:
`- [ ] Task: Conductor - User Manual Verification '<Phase Name>' (Protocol in workflow.md)`

## 5. Plan Mode File Operations Workaround

When operating in Plan Mode, file creation might inadvertently flatten directory structures. To prevent this, always use a shell command workaround for creating new files within nested directories.
Example: `run_shell_command("mkdir -p path/to/dir && mv flattened_file.md path/to/dir/actual_file.md")` or by ensuring `mkdir -p` is run prior to file writes where applicable.

## Part 16: Known Agentic Tool Constraints & Workarounds

### Gemini Conductor Extension Issue #159 (Path Flattening in Plan Mode)

**The Issue:** When operating in Planning Mode, attempting to write files to nested directories often results in a "path flattening" bug where the file is created in the wrong location or root. (See [Issue #159](https://github.com/gemini-cli-extensions/conductor/issues/159)).

**The Workaround:** While small recommendations exist, they do not consistently work. The most reliable method is to use a Python scaffolding script to overcome the path flattening issue.
Before attempting to write new files to nested paths in Planning Mode, the agent must:

1. Draft a temporary scaffolding script (e.g., Python) at the project root.
2. Use `os.makedirs(target_dir, exist_ok=True)` to ensure the exact nested directory structure exists.
3. Write the file contents directly via the script.
4. Execute the script using a terminal/shell command.
5. Delete the scaffolding script immediately after successful execution.
