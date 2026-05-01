# Specification: Doc 01: Surface E (Scribe) & Exhaustive Block Scaffolding

## 1. Overview

This specification covers two distinct but deeply related tracks from Document 01 (Part II and Part III).

- **Surface E (Scribe):** Replaces the "Atlas" concept with "Scribe," a longform writing studio utilizing a new `Manuscript` view mode, rich text editing, and an automated export pipeline (EPUB, PDF, Web).
- **Exhaustive Block Scaffolding:** Establishes the automated CLI tooling (`pnpm iem:new-block`) required to rapidly generate the 145+ blocks across all surfaces, ensuring every block conforms to the strict TDD and MCP standards. Crucially, this CLI tool must be accessible by agents operating on the canvas.

## 2. Functional Requirements

### 2.1 Surface E: Scribe

- **The Manuscript View:** Implement a third canvas view mode (`spatial`, `temporal`, `manuscript`). In this mode, `Chapter` and `Section` blocks lay out as serial pages of readable text rather than isolated nodes.
- **Rich Text Integration:** Utilize **Tiptap** to power the `Prose` and `Chapter` blocks, supporting styles, comments, and tracked changes natively.
- **The Revision Track:** Implement a slider UI and a linear revision history stored in a Postgres `jsonb` array for each `Chapter` block.
- **Export Pipeline:** Build the surface-specific export toolchain targeting EPUB (`epub-gen`), PDF (`Puppeteer` + `Paged.js`), and Web (Static HTML).

### 2.2 Exhaustive Block Scaffolding (`pnpm iem:new-block`)

- **CLI Automation:** Build a Node.js CLI script that accepts `--surface`, `--id`, and `--name` arguments.
- **Generation:** The script must automatically generate:
  - The TypeScript module definition (`BlockDefinition`).
  - The Zod I/O schemas.
  - The React view component stub.
  - The five mandatory TDD test files (Schema, Agent Binding, Render, Happy-Path, Adversarial).
  - The MCP tool binding stub.
- **Agent Accessibility:** Ensure the script can be invoked programmatically via an MCP tool, allowing autonomous agents to generate new block types on the fly.

## 3. Non-Functional Requirements

- **Consistency:** The auto-generated block files must perfectly match the `typescript.md` style guide.
- **TDD:** Adhere to the strict 85% coverage "Red, Green, Refactor, Adversarial" workflow for the Scribe UI and the generator script logic.

## 4. Out of Scope

- Actually generating all 145 blocks manually; this track only builds the _generator_ and the core Scribe UI. The students (and agents) will use the generator to fulfill the catalog over the 6 weeks.
