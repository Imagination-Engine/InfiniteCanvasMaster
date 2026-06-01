# Demo Script: Surface E - Atlas (Knowledge Graph)

## Overview

This script outlines the exact sequence for Student E during the final presentation.

## Preparation

- Ensure the `pgvector` database extension is active.
- Prepare a folder of 3 distinct text documents (e.g., historical facts) on the desktop.

## Execution Sequence

1. **Ingestion:** Open the canvas and drag-and-drop the 3 text documents onto the surface.
2. **Auto-Layout:** Watch the Dagre layout engine visually map the chunks and their relationships.
3. **Retrieval/Synthesis:** Use the chat shell: "Summarize the key events from the 18th century based on the uploaded texts."
4. **RAG Verification:** Highlight the specific nodes on the canvas that the `Retrieval` block activated before passing context to the `Synthesis` block.
5. **Export:** Click "Launch as Creation" to show the read-only, searchable graph explorer.
