import { describe, it, expect, vi } from 'vitest';
import { WebContainerManager } from './WebContainerManager';
import { BlackboardState } from '../state/BlackboardManager';

describe('WebContainerManager (Red/Green Phase)', () => {
  it('mounts the code from blackboard into WebContainer format', async () => {
    const mockWebContainer = {
      mount: vi.fn().mockResolvedValue(undefined),
      spawn: vi.fn().mockResolvedValue({ exit: Promise.resolve(0) })
    };
    
    const manager = new WebContainerManager(mockWebContainer as any);
    const mockState: BlackboardState = {
      spec: null,
      design: null,
      code: {
        'index.js': 'console.log("hello");',
        'package.json': '{}'
      },
      testResults: null
    };

    await manager.compile(mockState);
    
    expect(mockWebContainer.mount).toHaveBeenCalledWith({
      'index.js': { file: { contents: 'console.log("hello");' } },
      'package.json': { file: { contents: '{}' } }
    });
  });

  describe('Adversarial Sandbox Tests', () => {
    it('adversarial: handles failed npm install gracefully', async () => {
      const mockWebContainer = {
        mount: vi.fn().mockResolvedValue(undefined),
        spawn: vi.fn().mockResolvedValue({ exit: Promise.resolve(1) }) // simulate npm install failure
      };
      
      const manager = new WebContainerManager(mockWebContainer as any);
      
      await expect(manager.compile({ code: {} } as any)).rejects.toThrow('Installation failed');
    });

    it('adversarial: timeout infinite loops during compilation (mock timeout)', async () => {
      // Setup a mock that simulates a spawn never resolving immediately
      const mockWebContainer = {
        mount: vi.fn().mockResolvedValue(undefined),
        spawn: vi.fn().mockImplementation(() => {
          return { exit: new Promise(resolve => setTimeout(() => resolve(0), 100)) };
        })
      };

      const manager = new WebContainerManager(mockWebContainer as any);
      // Let's pass a small timeout to simulate the circuit breaker
      await expect(manager.compileWithTimeout({ code: {} } as any, 10)).rejects.toThrow('Compilation timeout');
    });
  });
});