# 14 — Tool Candidate Matrix

| Tool          | Studio           | Status                | Mount Mode                | Warning                               |
| ------------- | ---------------- | --------------------- | ------------------------- | ------------------------------------- |
| Tiptap        | Writer           | candidate_recommended | direct dependency         | more custom UI work                   |
| BlockNote     | Writer           | candidate_fast_path   | direct dependency         | less low-level control                |
| Lexical       | Writer           | candidate             | direct dependency         | more plumbing                         |
| Twick         | Video            | candidate             | direct dependency/adapter | inspect maturity/API                  |
| ffmpeg.wasm   | Video/Audio      | approved_candidate    | web worker                | heavy CPU; no UI thread               |
| Native FFmpeg | Video/Audio      | required_later        | server/sandbox worker     | worker infra required                 |
| OpenMontage   | Video            | recipe_source         | repo adapter              | AGPLv3; do not embed yet              |
| Remotion      | Video/App        | candidate             | node/server render        | rendering infra required              |
| Phaser        | Game             | approved_candidate    | browser runtime           | runtime_simulation lane               |
| PixiJS        | Game/Media       | approved_candidate    | browser runtime           | renderer not full engine              |
| Babylon.js    | Game/World       | candidate             | browser runtime           | heavier runtime                       |
| Sandpack      | App              | approved_candidate    | browser runtime           | limited vs full Node                  |
| WebContainers | App              | candidate             | browser runtime           | licensing/browser constraints         |
| E2B           | App/Agent        | candidate             | cloud sandbox             | cost/external service                 |
| Daytona       | App/Agent        | candidate             | cloud/local sandbox       | external infra                        |
| Medusa        | Commerce         | candidate_later       | backend service           | real commerce later                   |
| Vendure       | Commerce         | candidate_later       | backend service           | backend ops                           |
| Saleor        | Commerce         | candidate_later       | backend service           | Python/Django stack                   |
| Mastra        | Agent/All        | core                  | internal framework        | primary substrate                     |
| MCP           | Agent/All        | core_protocol         | mcp_server                | allowlist + sandbox                   |
| ImagiClaw     | Agent/All        | high_value_candidate  | sandbox runtime           | high security caution                 |
| n8n           | Automation       | recipe_source         | isolated adapter          | do not expose unsafe instance         |
| Temporal      | Automation       | future_candidate      | backend workflow          | not first pass                        |
| LlamaIndex.TS | Research         | candidate_recommended | node package              | avoid duplicating Mastra              |
| Haystack      | Research         | candidate             | python service            | Python complexity                     |
| ComfyUI       | Media/Video/Game | candidate             | API/sandbox adapter       | GPU/server complexity                 |
| WaveSurfer    | Audio/Video      | approved_candidate    | direct dependency         | use precomputed peaks for large files |
| Tone.js       | Audio/Game       | candidate             | browser runtime           | not full DAW                          |
