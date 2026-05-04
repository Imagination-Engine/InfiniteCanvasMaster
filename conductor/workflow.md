# Project Workflow

This document outlines the standard development workflow and rules for the Imagination Engine project. Agents and engineers must adhere to this protocol.

## 1. Test-Driven Development (TDD) Protocol

Every new feature, block, and MCP tool must follow the strict four-step rhythm defined in the Master Plan:

1. **Red:** Write the failing test first. The test describes the desired behavior. Run it and watch it fail.
2. **Green:** Write the simplest implementation that makes the test pass.
3. **Refactor:** Clean up the code, extract functions, and rename variables while keeping the tests green.
4. **Adversarial:** Add one test that intentionally tries to break what was just written (e.g., edge cases, malformed inputs, race conditions). If it passes, proceed.
5. **No Stubs/Mocks Rule:** Do not use stubs or mocks in your tests. Use the actual implementation instead.

## 1.1 The Four Tenets

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

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

### 17. No-Stub Scaffolding Protocol

**The Issue:** Automated mass-scaffolding of tracks can lead to "hollow" or "stubbed" tracks where `spec.md` and `plan.md` contain only one-line placeholders instead of detailed requirements.

**The Rule:**

1.  **Source-Driven Content:** Every `spec.md` and `plan.md` MUST be derived from its corresponding source documentation.
2.  **No Generic Tasks:** Tasks like "- [ ] Task: Execute requirements" are strictly forbidden.
3.  **Contextual Indexing:** Every track`s `index.md` must link to the original source/knowledge documents in the project`s documentation folder.
4.  **Batch Limitation:** Do not scaffold more than 3 tracks in a single tool call.

### Gemini CLI File Modification Bug (Cannot read properties of undefined (reading 'type'))

**The Issue:** When attempting to use `replace` or `write_file` tools, the agent might receive an error: `Cannot read properties of undefined (reading 'type')`. This causes the tool execution to fail.

**The Workaround:** If `replace` or `write_file` fails with this error, the agent must fallback to using `run_shell_command` with tools like `cat`, `sed`, `awk`, or a temporary Python script to perform the file modifications.
