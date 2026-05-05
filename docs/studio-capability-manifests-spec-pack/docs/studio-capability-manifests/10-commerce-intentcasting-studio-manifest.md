# 10 — Commerce & Intentcasting Studio Manifest

## Product Role

Simulates and later enables offers, checkout, payments, storefronts, brand responses, sovereign carts, and agent-mediated commerce.

## Core Blocks

- Commerce Studio
- Intentcasting
- Offer
- Brand Response
- Negotiation
- Wallet
- Checkout
- Payment Flow
- Storefront
- Product
- Digital Asset Sale
- Sovereign Cart

## Model Policy

Use aliases only:

- `fast_tool_use` for quick edits/tool calls.
- `deep_planning` for architecture/planning.
- `deep_coding` where code is created.
- `long_context_synthesis` for long documents/research.
- `image_generation`, `image_editing`, `video_generation`, `audio_dialogue`, `tts`, `embeddings` where relevant.

## Recommended Tool Mounts

- Medusa candidate
- Vendure candidate
- Saleor candidate

## Artifact Contracts

Produces:

- `commerce.offer`
- `checkout.flow`
- `brand.response.simulation`

Accepts:

- `intent.summary`
- `product`
- `app.preview`
- `video.asset`
- `script`
- `research.brief`

## Required Surfaces

### Minimized Block

- clear purpose title,
- studio icon,
- runtime readiness,
- latest status or output cue,
- human-in-the-loop indicator when relevant.

### Expanded Surface

- studio-specific workspace,
- block chat/control panel,
- tools/capabilities panel,
- artifact output area,
- runtime readiness/status,
- activity timeline.

## Implementation Slice

Demo-choreographed only unless real payment/brand/network connectors exist. Do not process money or claim real brand connectivity.

## Acceptance Criteria

- [ ] Manifest exists in code registry.
- [ ] Blocks declare accepts/produces/capabilities.
- [ ] Tool mounts are registered, not ad hoc imported.
- [ ] Runtime readiness is honest.
- [ ] Cross-studio exports are possible.
