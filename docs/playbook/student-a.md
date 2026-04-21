# Student A Playbook: The Foundation & The Game

Welcome to your segment of the Imagination Engine. Your mission is two-fold:
1. Ensure the core Substrate (the Chat Shell and React Flow canvas) is rock solid.
2. Build Surface A (Playable), a multiplayer game studio.

## Your Context
You are working heavily in `apps/web`, `apps/server`, and `packages/surface-playable`. You need to understand Liveblocks for multiplayer sync and Phaser/Matter.js for the game engine.

## Agent Guidelines
When invoking the CLI agent to help you:
- **Always** run `pnpm iem:boot` first to ensure the agent has the latest context.
- Be explicit about whether you are touching the core Substrate (which affects everyone) or just your Surface.
- Use `pnpm iem:new-block` for any new MCP tools.

## Key Rituals
- Review the `TRIAGE.md` backlog daily.
- Ensure your Phaser engine destroys its WebGL context properly on unmount (this is a common bug).