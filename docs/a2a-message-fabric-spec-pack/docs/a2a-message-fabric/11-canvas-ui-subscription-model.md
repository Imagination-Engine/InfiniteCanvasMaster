# 11 — Canvas UI Subscription Model

Canvas observes events, not compiler internals.

Subscribe to `canvas.<canvasId>.block.<blockId>.event`, `dag.<runId>.trace`, node topics, agent task topics, OpenClaw task topics, and approval topics.

Map events to block states: node/tool started -> running; approval.required -> waiting_for_approval; completed -> completed; failed -> failed; policy.blocked -> blocked.

Compact views must redact secrets, credentials, private memory, wallet details, private keys, and raw approval payloads.
