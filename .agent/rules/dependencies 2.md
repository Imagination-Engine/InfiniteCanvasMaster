# Dependency Hygiene Protocol

This rule governs the addition of new dependencies to the Imagination Engine monorepo. It applies to all AI agents operating within this workspace.

## Core Mandate

Before proposing any new `npm install` or `pnpm add` command, you **MUST** consult the canonical Dependency Atlas located at `docs/DEPENDENCIES.md`.

If the required dependency is listed in the Atlas for the relevant workspace/surface, you may proceed with the installation.

## Deviation Protocol

If you determine that a new dependency _not_ listed in the Atlas is absolutely required to satisfy the user's request, you **MUST** pause execution and prompt the user using the `ask_user` tool.

You must present the 4-point justification checklist to the user for approval.

### The 4-Point justification checklist

When proposing a deviation, your prompt to the user must explicitly address:

1. **Problem solved:** What exact problem does this solve?
2. **Why existing fails:** Why can't the existing stack in the Atlas solve it?
3. **Bundle impact:** What is the estimated size/performance impact?
4. **Maintenance signal:** Is this a well-maintained, standard package (e.g., weekly downloads, last update)?

If the user approves the deviation via the prompt, you must **inject this justification into the PR description** or commit message when finalizing the change.
