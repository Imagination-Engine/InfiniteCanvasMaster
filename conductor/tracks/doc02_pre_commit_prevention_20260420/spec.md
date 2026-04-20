# Specification: Doc 02: Pre-commit Prevention & Secret Hygiene

## 1. Overview
This track implements Parts I, II, and III of the Security Hardening Playbook (IEM-MASTER-02). It establishes the foundational threat model, categorizes secrets into three distinct classes, and implements the critical first line of defense: automated pre-commit hooks that absolutely prevent secrets from entering the git history.

## 2. Functional Requirements
### 2.1 Secret Classification & The Environment Blueprint
- **Canonical Blueprint:** Create a single, canonical `.env.example` at the root of the monorepo.
- **Classification Comments:** Every variable in `.env.example` MUST explicitly state its classification (Class A, Class B, or Class C) and its intended scope as defined in Part II of the Playbook.

### 2.2 Aggressive `.gitignore`
- **Global Exclusions:** Update the root `.gitignore` to aggressively exclude all `.env` variants (except `.example`), cryptographic keys (`*.pem`, `*.key`), and service account JSONs (`*service-account*.json`, `*credentials*.json`).

### 2.3 Pre-commit Hooks (Husky & `git-secrets`)
- **Installation:** Install and configure `husky`, `lint-staged`, and the `git-secrets` hook.
- **Targeted Scanning:** Configure `lint-staged` to run `git-secrets` (along with standard linting and formatting tools) *only* on staged files to maintain developer velocity while ensuring security.
- **Regex Rules:** Configure `git-secrets` with custom regex patterns tailored to the project's specific risks (e.g., catching `sk-ant-*`, `AIza*`, `xoxb-*`, `glpat-*`).

## 3. Non-Functional Requirements
- **Frictionless Security:** The pre-commit checks must execute in under two seconds to ensure they aren't bypassed by impatient developers.
- **TDD:** Adhere to the strict 85% coverage "Red, Green, Refactor, Adversarial" workflow, particularly focusing on adversarial tests that attempt to bypass the git hook with obfuscated keys.

## 4. Out of Scope
- Runtime secret isolation (handling secrets in memory or the database); this track solely addresses the pre-commit boundary.