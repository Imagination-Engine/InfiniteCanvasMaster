# Implementation Plan: Doc 02: Security Lifecycle, Detection & Onboarding

## Phase 1: Anomaly Detection & Monitoring
- [ ] Task: Create the `auth_events` schema in Drizzle ORM.
    - [ ] Sub-task: Red (Write repository-level tests validating the logging of success/failure events and IP tracking)
    - [ ] Sub-task: Green (Implement the table schema, constraints, and the `logAuthEvent()` helper function)
    - [ ] Sub-task: Refactor (Abstract common authentication logging logic into a reusable middleware)
    - [ ] Sub-task: Adversarial (Write tests attempting to log events with massive payloads in the `metadata` column)
- [ ] Task: Build the `pnpm iem:security-audit` CLI tool.
    - [ ] Sub-task: Red (Write tests verifying the script executes `pnpm audit` and queries `auth_events`, parsing the outputs)
    - [ ] Sub-task: Green (Implement the CLI command that compiles findings into `docs/security/audit/week-NN.md`)
    - [ ] Sub-task: Refactor (Extract report generation logic into testable, pure functions)
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Anomaly Detection & Monitoring' (Protocol in workflow.md)

## Phase 2: Agent CLI Governance & Onboarding
- [ ] Task: Create `.agent/rules/security.md` and inject it into the boot protocol.
    - [ ] Sub-task: Red (Write a test script that validates the boot protocol correctly fetches the security rules)
    - [ ] Sub-task: Green (Generate the rule file prohibiting echoing, writing, and hardcoding secrets; update `pnpm iem:boot`)
    - [ ] Sub-task: Refactor (Ensure the security rules explicitly override general agent helpfulness in the prompt hierarchy)
- [ ] Task: Initialize the `docs/security/rotation-log.md` and `pnpm iem:check-rotation-due` script.
    - [ ] Sub-task: Red/Green/Refactor for parsing the rotation log and comparing dates.
- [ ] Task: Create the student onboarding template (`docs/security/onboarding/template.md`).
    - [ ] Sub-task: Red/Green/Refactor for transcribing the 5-Minute Checklist and the 15-Minute Drill.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Agent CLI Governance & Onboarding' (Protocol in workflow.md)