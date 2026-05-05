# 15 — Open Source Repo Assimilation Protocol

For every external repo/tool:

1. Identify exact purpose.
2. Identify license.
3. Classify mount mode: direct dependency, browser runtime, worker runtime, server worker, sandbox runtime, MCP server, iframe app, repo adapter, recipe source, inspiration only.
4. Identify needed filesystem/network/shell/secrets/GPU/server permissions.
5. Define typed adapter.
6. Define artifact outputs.
7. Define Message Fabric lanes.
8. Define human approvals.
9. Define uninstall/replacement path.
10. Document risk.

## Decisions

- OpenMontage: recipe_source until license/security/legal review.
- OpenCove: technical reference only; fold capabilities into Balnce-native concepts.
- OpenClaw: ImagiClaw sandbox adapter; skill allowlist and human approvals required.
- n8n: recipe/reference or isolated adapter only; no unguarded public/runtime exposure.
