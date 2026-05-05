# 05 — Cross-Studio Interoperability

## Principle

The canvas can mix elements from any studio. Every block declares `accepts`, `produces`, and `capabilities`.

## Core Artifact Types

```ts
type ArtifactType =
  | "intent.summary"
  | "dag.plan"
  | "script"
  | "outline"
  | "manuscript"
  | "research.brief"
  | "source.bundle"
  | "image.asset"
  | "video.asset"
  | "audio.asset"
  | "game.spec"
  | "game.build"
  | "app.spec"
  | "app.code"
  | "app.preview"
  | "commerce.offer"
  | "checkout.flow"
  | "brand.response.simulation"
  | "agent.recipe"
  | "tool.recipe"
  | "knowledge.card"
  | "compiled.output";
```

## Required APIs

- `CapabilityRegistry`
- `ArtifactRegistry`
- `StudioInteropResolver`
- `getCompatibleBlocks(sourceBlockId)`
- `suggestNextBlocks(canvasState, selectedBlockId)`
- `canConnectBlocks(source, target)`

## Examples

- Writer script → Video storyboard → Video render.
- Story bible → Game world spec → Game runtime.
- Commerce offer → App checkout UI → Live preview.
- Research brief → Writer/Video/App/Commerce.
- Agent recipe → Saved custom block → Any studio.
