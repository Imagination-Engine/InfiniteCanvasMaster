export const blockTemplate = `import { z } from 'zod';
import { {{name}}View } from './{{name}}View';
import type { BlockDefinition } from '@iem/core';

export const {{id}}Input = z.object({
  payload: z.string().optional()
});

export const {{id}}Output = z.object({
  success: z.boolean()
});

export const {{id}}Block: BlockDefinition<typeof {{id}}Input, typeof {{id}}Output> = {
  id: 'iem.{{surface}}.{{id}}',
  name: '{{name}}',
  description: 'Auto-generated {{name}} block',
  category: 'uncategorized',
  input: {{id}}Input,
  output: {{id}}Output,
  view: {{name}}View,
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'execute_{{id}}',
    invoke: async (input) => {
      const parsed = {{id}}Input.parse(input);
      return { success: true };
    }
  }
};
`;

export const blockTestTemplate = `import { describe, it, expect } from 'vitest';
import { {{id}}Block } from './{{id}}Block';

describe('{{name}} Block (Red/Green Phase)', () => {
  it('has valid metadata and schema', () => {
    expect({{id}}Block.id).toBe('iem.{{surface}}.{{id}}');
    expect({{id}}Block.name).toBe('{{name}}');
    
    const validIn = { payload: 'test' };
    expect({{id}}Block.input.parse(validIn)).toEqual(validIn);
  });

  it('executes agent binding successfully', async () => {
    const result = await {{id}}Block.agent.invoke({ payload: 'test' });
    expect(result.success).toBe(true);
  });

  it('adversarial: rejects invalid schema inputs', () => {
    expect(() => {{id}}Block.input.parse({ payload: 123 })).toThrow();
  });
});
`;

export const viewTemplate = `import React from 'react';
import type { BlockViewProps } from '@iem/core';

export const {{name}}View: React.FC<BlockViewProps<any, any>> = ({ id, data, onParamsChange, onRun }) => {
  return (
    <div 
      data-testid="{{id}}-view"
      className="min-w-[260px] rounded-2xl border border-white/10 bg-brand-bg-surface/90 backdrop-blur-xl p-4 text-white shadow-2xl"
    >
      <div className="font-bold uppercase tracking-widest text-brand-purple mb-2">{{name}}</div>
      <button
        onClick={onRun}
        className="px-4 py-2 bg-brand-purple text-white rounded text-xs uppercase font-bold"
      >
        Run
      </button>
      {data.status === 'running' && <div className="text-xs text-yellow-400 mt-2">Running...</div>}
      {data.output && (
        <div className="mt-4 p-2 bg-black/20 rounded text-xs overflow-auto max-h-32">
          <pre>{JSON.stringify(data.output, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
`;

export const viewTestTemplate = `import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { {{name}}View } from './{{name}}View';

describe('{{name}}View Component', () => {
  it('renders correctly with given data', () => {
    const mockData = {
      params: {},
      status: 'idle' as const
    };
    render(<{{name}}View id="test-id" data={mockData} onParamsChange={() => {}} onRun={() => {}} />);
    expect(screen.getByTestId('{{id}}-view')).toBeInTheDocument();
    expect(screen.getByText('{{name}}')).toBeInTheDocument();
  });
});
`;
