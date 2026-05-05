# 03 — Model Policy and Gemini Family

## Purpose

Blocks and studios request model aliases. The runtime resolves aliases to Gemini family models or fallbacks.

## Required Model Aliases

```ts
type StudioModelAlias =
  | "fast_tool_use"
  | "deep_planning"
  | "deep_coding"
  | "long_context_synthesis"
  | "image_generation"
  | "image_editing"
  | "video_generation"
  | "video_understanding"
  | "audio_transcription"
  | "audio_dialogue"
  | "tts"
  | "embeddings"
  | "local_lightweight"
  | "safety_judge";
```

## Mapping Policy

| Alias                  | Primary                                    | Used By                                     |
| ---------------------- | ------------------------------------------ | ------------------------------------------- |
| fast_tool_use          | Gemini 2.5 Flash / Gemini 3 Flash          | quick tool use, block chat, status          |
| deep_planning          | Gemini 3.1 Pro / Gemini 3 Pro family       | DAG planning, architecture, studio planning |
| deep_coding            | Gemini 3.1 Pro / Gemini 3 Pro family       | App Creation Studio                         |
| long_context_synthesis | Gemini 3.1 Pro / Gemini 2.5 Pro            | manuscripts, long research                  |
| image_generation       | Nano Banana 2 / Gemini image models        | image/media assets                          |
| image_editing          | Nano Banana Pro / Gemini image models      | image edits/style                           |
| video_generation       | Veo family                                 | reels, trailers, generated scenes           |
| video_understanding    | Gemini video-capable model                 | video analysis                              |
| audio_dialogue         | Gemini Live/audio model                    | voice-first interactions                    |
| tts                    | Gemini TTS / provider adapter              | narration/voiceover                         |
| embeddings             | Gemini embeddings or local embedding stack | Research Studio                             |
| safety_judge           | Gemini Flash/Pro judge mode                | tool safety/compliance                      |

## Implementation Requirements

Create `packages/core/src/studio-manifests/modelPolicy.ts`.

Expose:

- `ModelAlias`
- `StudioModelPolicy`
- `resolveModelAlias(alias, context)`
- `getStudioModelPolicy(studioId)`

## Rules

- Blocks do not choose concrete model names directly.
- Manifests declare aliases.
- Provider config maps aliases to concrete IDs.
- If unavailable, surface runtime-readiness warning.
