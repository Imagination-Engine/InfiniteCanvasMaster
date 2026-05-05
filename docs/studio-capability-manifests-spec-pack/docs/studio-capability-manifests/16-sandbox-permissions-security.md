# 16 — Sandbox, Permissions, and Security Model

Deny by default:

- host shell access,
- unrestricted filesystem,
- unrestricted network,
- secrets,
- real payments,
- outbound brand messaging,
- installation of third-party skills,
- arbitrary MCP servers,
- untrusted ImagiClaw skills.

Human approval required for:

- running code,
- installing dependencies,
- executing shell,
- writing files outside sandbox,
- sending outbound communication,
- spending money/credits,
- payment/checkout,
- publishing/exporting externally,
- deleting artifacts,
- connecting real accounts,
- high-cost video generation.

Runtime labels:

- Live
- Demo
- Adapter ready
- Waiting for runtime
- Requires approval
- Blocked by policy
