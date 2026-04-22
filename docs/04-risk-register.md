# 04 Risk Register

1. **State Divergence Risk**: Dual-view (Chat vs Canvas) could result in conflicting state mutations if Liveblocks and Vercel AI SDK streams are not sequenced strictly. 
   - *Mitigation*: Introduce a command-sourcing architecture where both Chat and Canvas emit deterministic Redux-style actions to a shared state machine before propagating to Liveblocks.
2. **Cloudflare Worker Limits**: Edge Workers have tight CPU time execution limits (e.g., 50ms for free tier, more for paid but still restricted). Heavy agent orchestration could timeout.
   - *Mitigation*: Offload long-running generations to background Durable Objects or step-functions.
3. **Secret Leakage in Monorepo**: Multiple app boundaries increase the risk of `.env` files leaking.
   - *Mitigation*: Strict Husky `pre-commit` hook running `scan-secrets.js` and blocking commits.
4. **Heavy Bundle Sizes**: Phaser, FFmpeg (WASM), and WebContainers will severely impact TTI (Time to Interactive).
   - *Mitigation*: Implement strict lazy-loading boundaries using React `Suspense`. Load Surface engines only when a Canvas explicitly mounts them.