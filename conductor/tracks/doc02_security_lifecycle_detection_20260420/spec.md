# Specification: Doc 02: Security Lifecycle, Detection & Onboarding

## 1. Overview
This track implements the final functional components of the Security Hardening Playbook (IEM-MASTER-02, Parts VII through XIV). It establishes the processes for secret rotation, continuous detection of anomalies, strict behavioral rules for agent CLIs, and the formal security onboarding process for new students.

## 2. Functional Requirements
### 2.1 Anomaly Detection & Monitoring
- **Authentication Tracking:** Create the `auth_events` table schema in Drizzle ORM to track `login_success`, `login_failure`, IP addresses, and user agents.
- **Security Audit Script:** Build the `pnpm iem:security-audit` CLI tool (extending the automation suite from Track 20). This script must query the `auth_events` table, run `pnpm audit`, check Dependabot status, and generate a markdown report (`docs/security/audit/week-NN.md`) summarizing the week's security posture.

### 2.2 Agent CLI Governance
- **Strict Rule File:** Create `.agent/rules/security.md` containing the explicit behavioral constraints outlined in Part X (Never echo secrets, never write secrets to files, detect and refuse paste, redact screenshots).
- **Boot Sequence Injection:** Update the Agent Session-Opening Protocol (`AGENTS.md` and the `iem:boot` script from Track 21) to explicitly require the agent to read and prioritize this security rule file above general helpfulness.

### 2.3 Rotation & Onboarding Scaffolding
- **Rotation Log & Scripts:** Initialize `docs/security/rotation-log.md` and create a `pnpm iem:check-rotation-due` utility script that compares the log dates against the current date, intended to be run by a weekly GitHub Action.
- **Onboarding Template:** Create the `docs/security/onboarding/template.md` containing the "5-Minute Hardening Checklist," the "Did You Leak?" drill, and the personal hygiene sign-off for new team members.

## 3. Non-Functional Requirements
- **Consistency:** Ensure the `pnpm iem:security-audit` script utilizes the same interactive CLI framework established in Track 20.
- **TDD:** Adhere to the strict 85% coverage "Red, Green, Refactor, Adversarial" workflow for the new CLI scripts and the Drizzle schema additions.

## 4. Out of Scope
- Building the actual UI dashboard for viewing authentication anomalies; the data is queried via the CLI script for the weekly markdown report.