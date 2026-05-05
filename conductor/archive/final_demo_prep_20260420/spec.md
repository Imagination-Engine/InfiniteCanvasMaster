# Specification: Final Demo Preparation & Scripts

## 1. Overview

This track implements Part VI and Appendix A.4 of the Master Plan. It transitions the team from active development to presentation readiness. It ensures every student has a rigorous, timed demo script localized to their workspace, provisions an expanded technical brief for the faculty, and sets up the stretch goal of a native desktop wrapper.

## 2. Functional Requirements

### 2.1 Localized Demo Scripts

- **Scaffolding:** Create a `demo-script.md` file within each of the five `packages/surface-*/` directories.
- **Content:** Each script must rigidly follow the step-by-step actions and timings defined in the Master Plan (e.g., Student A: Sign up, chat, toggle canvas, launch creation, invite player).

### 2.2 Expanded Faculty Brief

- **Creation:** Generate the `docs/demo/faculty-brief.md` document.
- **Content:** Include the project summary, the four invariants, a diagram of the surfaces, the student roster, and links to the live deployment. As requested, expand this brief to include technical deep-dives on the AI stack (Model Context Protocol, Vercel AI SDK, `pgvector`, and the hybrid model routing).

### 2.3 Electrobun Desktop Wrapper (Stretch Goal)

- **Scaffolding:** Initialize a new directory/workspace `apps/desktop` utilizing **Electrobun**.
- **Configuration:** Set up the baseline build configuration to wrap the Vite frontend and embed the local Node.js backend. This will serve as a foundational stretch goal for Week 14.

## 3. Non-Functional Requirements

- **Consistency:** The localized demo scripts must align perfectly with the "Red, Green, Refactor, Adversarial" outputs to ensure zero surprises on stage.
- **TDD:** Adhere to the strict 85% coverage "Red, Green, Refactor, Adversarial" workflow for the Electrobun scaffolding logic.

## 4. Out of Scope

- Actually presenting the demo; this track only builds the _artifacts_ required to ensure the presentation is flawless.
