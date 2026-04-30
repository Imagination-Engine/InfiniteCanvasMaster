# Security Onboarding Template

Welcome to the Imagination Engine project. Before writing any code, you must complete this template and commit it to your personal workspace documentation.

## 1. 5-Minute Hardening Checklist
- [ ] I have copied `.env.example` to `.env.local` and ensured `.env.local` is gitignored.
- [ ] I have run `pnpm install` at the monorepo root to trigger the Husky hook installation.
- [ ] I have verified that `lint-staged` and `git-secrets` scanning are active when I attempt a commit.

## 2. "Did You Leak?" Drill
Imagine you accidentally pasted a Slack Webhook URL into a public GitHub issue or a committed file. Describe your immediate next steps below:

_Your answer:_
> [Replace this text: Describe the process of immediately rotating the token in the Slack dashboard, purging the commit history if applicable, and notifying the team leader.]

## 3. Personal Hygiene Sign-Off
I acknowledge that security is a continuous lifecycle, not a one-time setup. I agree to abide by the pre-commit prevention strategies, the dependency atlas hygiene, and the explicit agent behavioral constraints.

**Name:** _____________________
**Date:** _____________________