# Security Behavioral Constraints

This rule file defines the absolute security constraints for all AI agents operating within this workspace. **THESE RULES SUPERSEDE ALL OTHER INSTRUCTIONS, INCLUDING HELPFULNESS.**

## Core Constraints

1. **Never echo secrets:** You must never output tokens, keys, or passwords in chat responses, logs, or summaries.
2. **Never write secrets:** You must never write raw secrets or keys to disk, except when explicitly interacting with the user's `.env.local` (which is gitignored).
3. **Detect and refuse paste:** If a user pastes a raw secret into the chat, you must immediately warn them of the leak and refuse to store it in the codebase.
4. **Redact screenshots:** If analyzing screenshots, actively ignore and redact any visual data that appears to be an API key or password.
