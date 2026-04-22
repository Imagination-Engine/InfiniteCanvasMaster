# Implementation Plan: Doc 02: Runtime Secret Isolation & Encrypted Storage

## Phase 1: Cryptographic Primitives

- [x] Task: Implement AES-256-GCM encryption and decryption utilities.
  - [x] Sub-task: Red (Write tests verifying encryption round-trips and authenticated tag failures)
  - [x] Sub-task: Green (Implement `encrypt` and `decrypt` in `packages/core/src/crypto/index.ts` using the Node.js `crypto` module, parsing `v1.service.iv.tag.ciphertext`)
  - [x] Sub-task: Refactor (Ensure `deriveKey(master, service)` consistently returns a 32-byte key)
  - [x] Sub-task: Adversarial (Write tests attempting to decrypt a ciphertext with a different service's derived subkey, expecting failure)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Cryptographic Primitives' (Protocol in workflow.md)

## Phase 2: The `CredentialResolver` Service

- [x] Task: Build the `CredentialResolver` class to interface with the database.
  - [x] Sub-task: Red (Write tests mocking the Drizzle `userIntegrations` query and verifying the returned plaintext credentials)
  - [x] Sub-task: Green (Implement the `resolve()` and `store()` methods, handling encryption/decryption seamlessly)
  - [x] Sub-task: Refactor (Ensure the class handles missing or expired credentials correctly by throwing specific error types)
- [x] Task: Conductor - User Manual Verification 'Phase 2: The `CredentialResolver` Service' (Protocol in workflow.md)

## Phase 3: Logging Hygiene (Pino)

- [x] Task: Implement the centralized, auto-redacting logger.
  - [x] Sub-task: Red (Write tests verifying that sensitive fields in log objects are replaced with `[REDACTED]`)
  - [x] Sub-task: Green (Create `apps/server/src/logging.ts` exporting a pre-configured `pino` instance matching the paths in Section 5.4)
  - [x] Sub-task: Refactor (Ensure the logger formats levels correctly for deployment environments)
  - [x] Sub-task: Adversarial (Test the logger with deeply nested objects containing `apiKey` keys to ensure recursive redaction works)
- [x] Task: Conductor - User Manual Verification 'Phase 3: Logging Hygiene (Pino)' (Protocol in workflow.md)
