# 05 Test Matrix

### Unit Testing (Vitest)
- **`packages/core`**: Schema validation, data transformers, utility purity.
- **`packages/db`**: Query builders, encryption/decryption idempotency.
- **`packages/agents`**: Mocked LLM responses, prompt template hydration.

### Integration Testing (Vitest + Testing Library)
- **`packages/ui`**: Component accessibility (a11y), state changes, interaction boundaries.
- **`apps/server`**: API endpoint responses, middleware validation, Cloudflare Worker binding mocks.
- **MCP Protocols**: Ensure external webhooks translate perfectly to Zod schemas.

### End-to-End Testing (Playwright)
- **Flow**: User Login -> Create Workspace -> Open Chat -> Trigger Canvas Generation -> Verify Liveblocks Sync.
- **Surface Sandbox**: Verify WebContainer boots in Forge. Verify Phaser canvas mounts in Playable.
- **Adversarial**: Attempt rapid toggle between Chat and Canvas to force race conditions.

### Security & Compliance
- Run automated tests on `CredentialResolver` to verify AES-256-GCM failure on bad keys.
- SQL injection attempts on Drizzle query parameters.