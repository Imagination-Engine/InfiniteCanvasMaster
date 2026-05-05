# 17 — Artifact Output Contracts

```ts
interface StudioArtifact<T = unknown> {
  id: string;
  type: ArtifactType;
  title: string;
  description?: string;
  createdByBlockId: string;
  createdByStudioId: string;
  createdAt: string;
  version: number;
  payload: T;
  preview?: ArtifactPreview;
  sourceRefs?: ArtifactSourceRef[];
  readiness: "draft" | "review_needed" | "accepted" | "compiled" | "failed";
}
```

Lifecycle:
`created → draft → review_needed → accepted → compiled → exported`

Routing:

- draft streaming: `agent_stream` / `ui_projection`
- accepted artifact: `document_state`
- important creation: `durable_event`
- origin trail: `provenance` placeholder/static for now
