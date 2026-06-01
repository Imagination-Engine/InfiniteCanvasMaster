# Student B Playbook: The Orchestrator

Welcome to your segment of the Imagination Engine. Your mission is to build Surface B (Conductor), turning the canvas into a powerful workflow orchestrator.

## Your Context

You are working heavily in `packages/core` (for the `CanvasScheduler`) and `packages/surface-conductor` (for the UI and SaaS blocks).

## Agent Guidelines

When invoking the CLI agent to help you:

- **Always** run `pnpm iem:boot` first to ensure the agent has the latest context.
- Ask the agent to generate adversarial tests specifically for infinite loops and rate-limit handling.
- Use `pnpm iem:new-block` for your SaaS integration blocks (Slack, Notion, etc.).

## Key Rituals

- Ensure your DAG scheduler correctly handles cyclic dependencies.
- Always implement exponential backoff for external API calls.
