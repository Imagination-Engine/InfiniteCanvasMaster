# Implementation Plan: Doc 01: Agent Harness Cleanup & Migration Strategy

## Phase 1: Autogen Retirement
- [ ] Task: Audit and archive the existing `autogen_exploration/` folder.
    - [ ] Sub-task: Red (Write shell test validating the existence of the archive README)
    - [ ] Sub-task: Green (Generate the `README.md` explaining the retirement decision and the shift to the TypeScript Block Protocol)
    - [ ] Sub-task: Refactor (Remove any lingering imports or scripts related to Autogen from the main package.json)
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Autogen Retirement' (Protocol in workflow.md)

## Phase 2: Chain Executor Utility
- [ ] Task: Implement `@iem/core/chain` for linear agent sequences.
    - [ ] Sub-task: Red (Write tests for executing an array of mocked MCP tools in sequence, passing state between them)
    - [ ] Sub-task: Green (Implement the `ChainExecutor` logic, ensuring it properly unwraps and passes the output of one step to the input of the next)
    - [ ] Sub-task: Refactor (Ensure the utility remains lightweight and purely functional)
    - [ ] Sub-task: Adversarial (Write tests simulating one agent in the chain failing or returning invalid output)
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Chain Executor Utility' (Protocol in workflow.md)

## Phase 3: Local Model Onboarding Automation
- [ ] Task: Create the `pnpm setup:models` script.
    - [ ] Sub-task: Red (Write test verifying the script can parse a configuration file of target models)
    - [ ] Sub-task: Green (Implement a Node.js script that checks if the Ollama daemon is active and sequentially executes `ollama pull` for configured models like `hermes3` and `qwen2.5-coder:7b`)
    - [ ] Sub-task: Refactor (Add a progress bar and error handling for missing models)
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Local Model Onboarding Automation' (Protocol in workflow.md)