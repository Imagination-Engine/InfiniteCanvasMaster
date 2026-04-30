import { describe, it, expect, vi } from 'vitest';
import { ChainExecutor, ChainStep } from './ChainExecutor';

describe('ChainExecutor (Red/Green Phase)', () => {
  it('executes a sequence of steps passing output to input', async () => {
    const step1: ChainStep = {
      name: 'Step 1',
      execute: vi.fn().mockResolvedValue({ intermediate: 'data1' })
    };
    
    const step2: ChainStep = {
      name: 'Step 2',
      execute: vi.fn().mockResolvedValue({ final: 'data2' })
    };

    const executor = new ChainExecutor([step1, step2]);
    const initialInput = { start: 'init' };
    
    const result = await executor.run(initialInput);

    expect(step1.execute).toHaveBeenCalledWith(initialInput);
    expect(step2.execute).toHaveBeenCalledWith({ intermediate: 'data1' });
    expect(result).toEqual({ final: 'data2' });
  });

  it('adversarial: handles a failing step by throwing and stopping execution', async () => {
    const step1: ChainStep = {
      name: 'Failing Step',
      execute: vi.fn().mockRejectedValue(new Error('Agent crashed'))
    };
    
    const step2: ChainStep = {
      name: 'Never Reached',
      execute: vi.fn()
    };

    const executor = new ChainExecutor([step1, step2]);
    
    await expect(executor.run({})).rejects.toThrow('Chain execution failed at step Failing Step: Agent crashed');
    expect(step2.execute).not.toHaveBeenCalled();
  });
});