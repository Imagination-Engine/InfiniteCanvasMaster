# 22 — Verification Prompt

Copy this after implementation.

```md
# Studio Capability Manifest Verification

Do not add features. Verify whether the manifest layer exists and is wired.

Check:

1. StudioManifest type exists.
2. ToolMount type exists.
3. ArtifactContract type exists.
4. Model aliases exist.
5. Existing blocks were normalized.
6. Seven studio manifests exist.
7. Tool mount registry exists.
8. Tool entries include status, mount mode, permissions, adapter.
9. Cross-studio resolver exists.
10. Blocks declare accepts/produces.
11. Orchestrator can read manifest/capability data.
12. No raw Gemini model strings are hardcoded in block runtime code.
13. No external repo/tool is directly mounted without ToolMount.
14. No fake live runtime is shown.
15. Commerce flows are labeled demo unless real connectors exist.
16. ImagiClaw is product-facing name.
17. OpenCove is not product-facing name.
18. Typecheck/lint/test/build results are recorded.

Create `/docs/studio-capability-manifests/30-verification-report.md`.

Use table:
| Area | Expected | Found | Status | Evidence | Risk | Required Fix |
```
