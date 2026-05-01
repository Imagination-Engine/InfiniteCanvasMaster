# A2A Hardened Governance & Provenance Specification

## Overview

This track upgrades the `BasicPolicyEngine` into a full governance layer capable of capability checking, budgeting, and automated redaction. It also implements cryptographic provenance for decision histories.

## Objectives

1.  **Database Integration:** Connect the policy engine to `@iem/db` to enforce `budgetId` limits and `allowedCapabilities`.
2.  **Redaction Engine:** Implement compact and full redaction filters for envelopes marked with high sensitivity.
3.  **Provenance Signatures:** Integrate VLAD (Validation Layer for Agentic Decisions) to hash and sign critical envelopes.

## Architecture

- **Policy Engine:** Refactor to be asynchronous and database-aware.
- **Security Boundary:** The redaction logic runs before the event is sent to the `EventLog` or network transport.
