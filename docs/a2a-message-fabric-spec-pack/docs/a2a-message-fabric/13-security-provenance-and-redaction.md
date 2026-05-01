# 13 — Security, Provenance, and Redaction

Sensitive payloads include wallet data, identity credentials, PLOG/VLAD identifiers, personal memory, private files, auth tokens, API keys, financial offers, raw communications, device mesh topology, and Edge Twin compute details.

Redaction levels: none, compact, full. Compact view shows safe summaries. Full redaction applies when subscriber lacks permission.

Provenance fields: `vladId`, `plogId`, `signature`, `contentHash`, `sourceRefs`.

Do not show secrets in canvas, log private payloads without sensitivity labels, route sensitive data to broad topics, let retrieved content become trusted instructions, or persist unredacted secrets in local logs.
