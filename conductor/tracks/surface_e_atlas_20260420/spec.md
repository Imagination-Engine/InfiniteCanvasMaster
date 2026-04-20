# Specification: Surface E — Atlas (Knowledge Graph)

## 1. Overview
This track implements the fifth specialized surface (Section 16 of the Master Plan). Surface E transforms the canvas into a "Second Brain" or knowledge graph, allowing users to ingest documents, visualize semantic relationships, and synthesize answers using RAG (Retrieval-Augmented Generation) primitives.

## 2. Functional Requirements
### 2.1 The Atlas View Mode
- **View Toggle:** Implement a specialized `AtlasCanvas` view mode. While it still utilizes the underlying spatial coordinate system, it must feature a custom auto-layout engine (e.g., integrating `dagre` or a force-directed layout algorithm within React Flow) optimized for dense clusters of text nodes and semantic links.

### 2.2 Knowledge-Primitive Blocks
- **Block Definitions:** Implement the core RAG pipeline blocks:
  - `Ingestion`: Ingests raw text, PDFs, or URLs, chunks the content, and stores embeddings in the database via the `pgvector` store established in Track 8.
  - `Retrieval`: Given a query, performs a semantic search against the vector store and outputs the top-$K$ context chunks.
  - `Synthesis`: Takes a query and a set of retrieved context chunks and uses the LLM to generate a cited, synthesized answer.

### 2.3 Creation Export
- **Searchable Brain:** The "Launch as Creation" export for this surface must produce a read-only, searchable interface over the finalized knowledge graph.

## 3. Non-Functional Requirements
- **Scalability:** The auto-layout engine and rendering pipeline must comfortably handle graphs with 100+ nodes without significant frame drops.
- **TDD:** Adhere to the strict 85% coverage "Red, Green, Refactor, Adversarial" workflow, particularly focusing on the RAG pipeline's accuracy and the layout engine's stability.

## 4. Out of Scope
- Building a full web-crawler; the ingestion block will rely on simple, single-page fetching or direct file uploads.