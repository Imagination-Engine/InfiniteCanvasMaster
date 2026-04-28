# A2A Canvas Observation & UI Bridge Specification

## Overview

This track connects the backend A2A Message Fabric to the frontend React Imagination Canvas, enabling real-time observation, block state updates, and timeline debugging.

## Objectives

1.  **Transport Bridge:** Implement a WebSocket or Server-Sent Events (SSE) bridge that securely serializes internal `BalnceEnvelope` objects into NDJSON for the frontend.
2.  **Frontend Subscriptions:** Create React hooks (`useA2ASubscription`, `useA2AHistory`) in `@iem/ui` or `@iem/imagination-canvas-kit` to consume the stream.
3.  **Timeline UI:** Build a "Debug Timeline" component that visualizes the fabric events (DAG progress, tool calls, policy blocks).

## Architecture

- **Boundary:** The server routes (e.g., `/api/a2a/stream`) will subscribe to the `messageBus` and forward matching topics.
- **Security:** Ensure the bridge honors the `policy.visibility` field (e.g., dropping 'private' or 'secret' envelopes before they hit the network).
