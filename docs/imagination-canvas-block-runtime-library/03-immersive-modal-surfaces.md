# Immersive Modal Surfaces Plan

## Objective

Replace the basic ExpandableBlockWrapper with edge-to-edge, functionally deep modal surfaces for core blocks.

## Components

1. **ImmersiveBlockModal**: The root wrapper. Uses Framer Motion to expand from the block canvas bounding box to near-fullscreen.
2. **BlockModalHeader**: Sticky top bar with title, status badge, runtime controls (Play/Pause), and a minimize button.
3. **Split Layout System**:
   - **BlockModalChatPanel**: Left or right sidebar for talking directly to the agent powering the block.
   - **ExpandedBlockSurface**: The main content area.
4. **Specific Deep Surfaces**:
   - ExpandedAgentSurface: Shows prompt engineering, tools available, and task queue.
   - ExpandedAppSurface: The full iframe/sandbox view.
   - ExpandedArtifactSurface: A rich text editor or document viewer.
   - ExpandedCommerceSurface: A choreographed storefront or checkout flow demo.

## State Management

- Bound to useExpansionStore.
- Needs to trap focus and handle Escape to close.
