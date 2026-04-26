# 14 — Design Token Map

## Purpose

This document defines the design tokens needed to make the Imagination Canvas feel coherent, calm, and premium across objects, panels, transitions, and agentic states.

## Token philosophy

Tokens should make the system feel:

- Spatial.
- Soft but precise.
- Modern but not trendy.
- Calm during idle states.
- Clear during manipulation.
- Cinematic during transitions.
- Accessible in contrast, size, and motion.

## Spacing

```ts
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  canvasGutter: 24,
  panelPadding: 16,
  blockPadding: 12,
  toolbarGap: 8,
};
```

## Typography

```ts
export const typography = {
  canvasLabel: { size: 12, lineHeight: 16, weight: 500 },
  blockBody: { size: 14, lineHeight: 20, weight: 400 },
  blockTitle: { size: 15, lineHeight: 20, weight: 600 },
  richBody: { size: 16, lineHeight: 26, weight: 400 },
  inspectorLabel: { size: 12, lineHeight: 16, weight: 500 },
  inspectorValue: { size: 14, lineHeight: 20, weight: 400 },
  status: { size: 12, lineHeight: 16, weight: 450 },
};
```

## Radius

```ts
export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
};
```

Guidance:

- Blocks: `lg` to `xl`.
- Tool buttons: `md` to `pill`.
- Large app frames: `xl` to `xxl`.
- Handles: `xs` or circular.
- Panels: `xl`.

## Elevation

```ts
export const elevation = {
  none: "none",
  hairline: "0 0 0 1px rgba(0,0,0,0.06)",
  block: "0 2px 8px rgba(0,0,0,0.08)",
  raised: "0 8px 24px rgba(0,0,0,0.12)",
  floating: "0 16px 48px rgba(0,0,0,0.16)",
  modal: "0 24px 80px rgba(0,0,0,0.22)",
};
```

## Motion

```ts
export const motion = {
  instant: 0,
  micro: 80,
  fast: 120,
  standard: 180,
  spatial: 260,
  cinematic: 420,
  slowMax: 600,

  easing: {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    enter: "cubic-bezier(0.16, 1, 0.3, 1)",
    exit: "cubic-bezier(0.4, 0, 1, 1)",
    spatial: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
};
```

Rules:

- Use `micro` for hover/action reveal.
- Use `fast` for menus.
- Use `standard` for panels.
- Use `spatial` for camera and focus.
- Use `cinematic` only for meaningful expansion/presentation.

## Icon sizing

```ts
export const icons = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  toolbar: 20,
  blockAction: 16,
  inspector: 18,
};
```

## Hit targets

```ts
export const hitTargets = {
  desktopMin: 32,
  desktopComfort: 36,
  touchMin: 44,
  touchComfort: 52,
  handleTouchArea: 44,
};
```

## Density modes

```ts
export type CanvasDensity =
  | "comfortable"
  | "compact"
  | "presentation"
  | "immersive";
```

### Comfortable

Default.

- Balanced spacing.
- Full labels.
- Standard shadows.

### Compact

For dense work.

- Smaller blocks.
- Reduced padding.
- More labels hidden until hover.

### Presentation

For storytelling.

- Larger text.
- Reduced controls.
- Frame focus.

### Immersive

For cinematic creation.

- Minimal chrome.
- Soft overlays.
- Agent and object actions hidden until needed.

## Color role tokens

Do not bind implementation to fixed brand colors here. Define semantic roles:

- Canvas background.
- Grid line.
- Object surface.
- Object elevated surface.
- Selected outline.
- Hover outline.
- Locked outline.
- Agent activity.
- Warning.
- Error.
- Success.
- Provenance verified.
- Commerce/AURA.
- Memory.
- Goal.
- Research.
- App.
- Identity.

## Accessibility tokens

Required:

- High contrast mode.
- Reduced motion.
- Larger controls.
- Keyboard focus ring.
- Screen-reader labels.
- Semantic roles for menus/panels.
- Minimum readable font sizes.
- Non-color indicators for status.

## Agent status visual tokens

Agent activity should have specific roles:

- Thinking.
- Generating.
- Waiting for approval.
- Running locally.
- Using device mesh.
- Using extra compute.
- Error.
- Complete.

These should be visually distinct but subtle.

## Token acceptance criteria

- All components use shared tokens.
- Motion is consistent and purposeful.
- Touch targets meet minimums.
- Reduced motion path exists.
- Status colors are semantic and accessible.
- Balnce-native block types can be themed without visual chaos.
