# Specification: Doc 02: Runtime Secret Isolation & Encrypted Storage

## 1. Overview
This track implements Parts IV and V of the Security Hardening Playbook (IEM-MASTER-02). It focuses on ensuring that "Class B" secrets (user-owned OAuth tokens and API keys) are securely encrypted at rest in the database and only decrypted ephemerally in memory at the exact moment of use. It also establishes strict logging hygiene to prevent accidental leakage.

## 2. Functional Requirements
### 2.1 The Encryption Layer
- **Cryptographic Primitives:** Implement `encrypt` and `decrypt` utilities using the native Node.js `crypto` module with the **AES-256-GCM** algorithm for authenticated encryption.
- **Key Derivation:** Implement a `deriveKey` function that generates a unique, per-service subkey from the root `MASTER_ENCRYPTION_KEY` to ensure the blast radius is isolated if one service's wrapper leaks.
- **Format:** The resulting encrypted string must include a version prefix, the service name, the IV, the auth tag, and the ciphertext (e.g., `v1.service.iv.tag.ciphertext`).

### 2.2 The `CredentialResolver` Service
- **Implementation:** Build the `CredentialResolver` class (`packages/core/src/crypto/credential-resolver.ts`) that interfaces with the Drizzle ORM to fetch the encrypted row, decrypt it, and return the ephemeral plaintext credentials to the caller.
- **Refresh Flow Hook:** Ensure the `resolve()` method includes the logic hook to trigger a token refresh flow if the credentials have expired.

### 2.3 Logging Hygiene (Pino)
- **Centralized Logger:** Implement a custom `pino` logger wrapper (`apps/server/src/logging.ts`).
- **Redaction Rules:** Configure the logger with aggressive redaction paths matching those specified in Section 5.4 to automatically scrub authorization headers, cookies, passwords, and tokens from all log output.

## 3. Non-Functional Requirements
- **Ephemeral State:** The decrypted credentials must *never* be logged, stored on disk, or returned to the client frontend.
- **TDD:** Adhere to the strict 85% coverage "Red, Green, Refactor, Adversarial" workflow, particularly focusing on adversarial tests verifying the GCM auth tag rejects tampered ciphertexts.

## 4. Out of Scope
- Actually implementing the specific OAuth2 refresh flows for each external provider; this track only builds the *foundation* that those integrations will plug into.