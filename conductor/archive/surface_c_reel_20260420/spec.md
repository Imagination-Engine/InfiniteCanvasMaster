# Specification: Surface C — Reel (Generative Media)

## 1. Overview

This track implements the third specialized surface (Section 14 of the Master Plan). Surface C transforms the canvas into a generative media studio, allowing users to arrange prompts for images, audio, and dialogue on a temporal timeline to produce short films (e.g., an anime scene).

## 2. Functional Requirements

### 2.1 Media Generation Blocks

- **Implement Providers:** Integrate **Nanobanana** for the `TextToImage` MCP block and **ElevenLabs** for the `TextToAudio` / `TextToSpeech` MCP blocks.
- **Scene & Transition Blocks:** Implement a `Scene` block (composing image, dialogue, and duration) and a `Cut` block (for transitions).

### 2.2 Dedicated Timeline UI

- **Integration:** Integrate a dedicated timeline UI library (synced with the React Flow canvas state) to represent the horizontal time track.
- **Interaction:** Allow dragging and reordering of `Scene` blocks within the timeline track to adjust chronological sequence and duration.

### 2.3 Render & Export Pipeline

- **Implementation:** Build a robust video stitching pipeline. Evaluate and implement either a local backend Node.js worker utilizing `fluent-ffmpeg` or a purely client-side approach utilizing `ffmpeg.wasm`.
- **Output:** The pipeline must ingest the ordered scenes, images, and audio tracks and output a downloadable MP4 artifact.

## 3. Non-Functional Requirements

- **Performance:** Ensure the timeline UI remains responsive even when loading multiple generated image thumbnails.
- **TDD:** Adhere to the strict 85% coverage "Red, Green, Refactor, Adversarial" workflow.

## 4. Out of Scope

- Real-time video generation (e.g., Sora/Runway); this track focuses on stitching still images and audio into a cinematic sequence.
