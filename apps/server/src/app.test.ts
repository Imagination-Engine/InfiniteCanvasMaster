import { describe, it, expect } from 'vitest';
import { app } from './app';
import fs from 'fs';
import path from 'path';

describe('Edge Backend (Hono + Cloudflare Worker)', () => {
  it('handles GET /api/health with app.request()', async () => {
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('status', 'ok');
  });

  it('handles 404 for unknown routes', async () => {
    const res = await app.request('/unknown-route');
    expect(res.status).toBe(404);
  });
});

describe('Adversarial: Cloudflare Worker Configuration', () => {
  it('wrangler.toml must contain nodejs_compat compatibility flag', () => {
    const tomlPath = path.join(__dirname, '../wrangler.toml');
    const tomlContent = fs.readFileSync(tomlPath, 'utf-8');
    expect(tomlContent).toContain('compatibility_flags = ["nodejs_compat"]');
  });
});
