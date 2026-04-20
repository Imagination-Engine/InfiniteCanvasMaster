# Implementation Plan: Surface C — Reel (Generative Media)

## Phase 1: Media Provider Integrations
- [ ] Task: Implement Nanobanana and ElevenLabs MCP bindings.
    - [ ] Sub-task: Red (Write tests mocking the API responses for both providers)
    - [ ] Sub-task: Green (Implement the API clients and register the `TextToImage` and `TextToSpeech` MCP tools)
    - [ ] Sub-task: Refactor (Clean up token/API key management)
    - [ ] Sub-task: Adversarial (Write tests simulating API rate limits and invalid generation parameters)
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Media Provider Integrations' (Protocol in workflow.md)

## Phase 2: Timeline UI & Scene Blocks
- [ ] Task: Integrate the dedicated Timeline UI library and sync it with Canvas temporal state.
    - [ ] Sub-task: Red (Write tests verifying state synchronization between the React Flow nodes and the timeline data model)
    - [ ] Sub-task: Green (Implement the Timeline UI component rendered below the canvas)
    - [ ] Sub-task: Refactor (Optimize thumbnail rendering in the timeline track)
- [ ] Task: Implement the `Scene` and `Cut` blocks.
    - [ ] Sub-task: Red/Green/Refactor for the schema and minimal UI of the composite blocks.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Timeline UI & Scene Blocks' (Protocol in workflow.md)

## Phase 3: MP4 Render Pipeline
- [ ] Task: Implement the FFmpeg stitching pipeline (evaluating Node.js worker vs. WASM).
    - [ ] Sub-task: Red (Write tests for the render orchestration logic, mocking the FFmpeg binary)
    - [ ] Sub-task: Green (Implement the script that compiles ordered scenes, overlays audio, and generates the MP4)
    - [ ] Sub-task: Refactor (Abstract the render progress state to update the UI during the build)
    - [ ] Sub-task: Adversarial (Test the pipeline with missing media assets or zero-duration scenes)
- [ ] Task: Conductor - User Manual Verification 'Phase 3: MP4 Render Pipeline' (Protocol in workflow.md)