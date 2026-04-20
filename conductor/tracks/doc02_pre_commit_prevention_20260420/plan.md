# Implementation Plan: Doc 02: Pre-commit Prevention & Secret Hygiene

## Phase 1: Environment Blueprint & Aggressive Ignores
- [ ] Task: Create the canonical `.env.example` at the root, mapping all variables to Classes A, B, and C.
    - [ ] Sub-task: Red (Write tests validating the existence of the file and its required classification comments)
    - [ ] Sub-task: Green (Implement `.env.example` defining variables like `VITE_API_URL` (Class C), `GEMINI_API_KEY` (Class A), `DB_PASSWORD` (Class A))
    - [ ] Sub-task: Refactor (Organize variables by service and clearly document the scope)
- [ ] Task: Update the root `.gitignore` to aggressively exclude sensitive artifacts.
    - [ ] Sub-task: Red/Green/Refactor for adding `.env.*`, `*.pem`, `*.key`, `*.keystore`, and `*service-account*.json` patterns.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Environment Blueprint & Aggressive Ignores' (Protocol in workflow.md)

## Phase 2: Husky & `lint-staged` Integration
- [ ] Task: Install and configure Husky and `lint-staged` in the root `package.json`.
    - [ ] Sub-task: Red (Write shell scripts testing that Husky correctly installs and registers git hooks)
    - [ ] Sub-task: Green (Implement the `.husky/pre-commit` script invoking `npx lint-staged`)
    - [ ] Sub-task: Refactor (Ensure `lint-staged` is configured to run `eslint` and `prettier` on staged files only)
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Husky & `lint-staged` Integration' (Protocol in workflow.md)

## Phase 3: `git-secrets` Scanning
- [ ] Task: Integrate `git-secrets` into the pre-commit hook via `lint-staged`.
    - [ ] Sub-task: Red (Write shell tests that attempt to stage files containing mock secrets like `sk-ant-` or `AIza` to verify they are blocked)
    - [ ] Sub-task: Green (Configure `git-secrets` with custom regex patterns for Anthropic, Google, Slack, and generic high-entropy strings, integrating it into the `lint-staged` workflow)
    - [ ] Sub-task: Refactor (Optimize the regex patterns to minimize false positives while maintaining tight security)
    - [ ] Sub-task: Adversarial (Write tests attempting to bypass the scanner using base64-encoded or heavily fragmented mock secrets)
- [ ] Task: Conductor - User Manual Verification 'Phase 3: `git-secrets` Scanning' (Protocol in workflow.md)