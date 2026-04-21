import { describe, it, expect, vi } from 'vitest';
import { executeIemCommand } from './cliBinding';

describe('CLI Agent Tool Binding (Red/Green Phase)', () => {
  it('executes a known command successfully', async () => {
    const result = await executeIemCommand('test-cmd', ['--param', 'agent_test']);
    expect(result.success).toBe(true);
    expect(result.output).toContain('Executed test-cmd');
  });

  it('adversarial: blocks execution if command fails (e.g. pr-prep with failing tests)', async () => {
    // In our binding, we might simulate a failure
    const result = await executeIemCommand('pr-prep', ['--fail']);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Command failed');
  });
});