# Demo Script: Surface B - Conductor (Workflow Orchestration)

## Overview

This script outlines the exact sequence for Student B during the final presentation.

## Preparation

- Ensure Notion integration and Slack integration tokens are active in `.env`.
- Ensure ngrok is exposing the local port for webhook testing.

## Execution Sequence

1. **Chat Shell:** Type: "Create a workflow that watches a webhook, summarizes the text, and posts it to Slack and Notion."
2. **Canvas Duality:** Review the generated DAG. Highlight the `WebhookTrigger`, `Summarizer`, `If` (conditional), `SlackPost`, and `NotionCreate` blocks.
3. **Execution:** Trigger the webhook via a curl command in the terminal.
4. **Tracing:** Show the visual highlights on the canvas as the blocks execute in sequence.
5. **Verification:** Open the connected Slack channel and Notion workspace to prove the integration succeeded.
