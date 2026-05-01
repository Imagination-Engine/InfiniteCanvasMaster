# A2A Hardened Governance & Provenance Implementation Plan

## Phase 1: Database Policy Engine

- **Task:** Create `DatabasePolicyEngine` implementing `A2APolicyEngine`.
- **Task:** Implement capability checking against user/agent roles in the database.
- **Task:** Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Redaction Layer

- **Task:** Implement the redaction utility function.
- **Task:** Integrate redaction into the message publish pipeline.
- **Task:** Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Provenance & Signatures

- **Task:** Integrate the VLAD library for cryptographic signing.
- **Task:** Apply signatures to envelopes with `provenance_required` delivery class.
- **Task:** Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
