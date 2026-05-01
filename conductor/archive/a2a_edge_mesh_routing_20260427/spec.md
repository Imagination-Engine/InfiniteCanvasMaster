# A2A Edge Mesh & Advanced Routing Specification

## Overview

This track realizes the distributed future of the A2A Message Fabric. It enables routing messages between different cloud runtimes, local device meshes, and OpenClaw execution cells.

## Objectives

1.  **Distributed Transport:** Implement cross-instance pub/sub using Redis or Kafka.
2.  **OpenClaw Bridge:** Create the adapter mapping OpenClaw native execution events to A2A envelopes.
3.  **Edge Twin Routing:** Define the mechanism for routing envelopes to offline/edge devices.

## Architecture

- **Transport Abstraction:** Seamless switching between `LocalTransport` and `DistributedTransport` based on environment config.
- **Topic Gateway:** Rules for bridging specific topics between the local mesh and cloud mesh.
