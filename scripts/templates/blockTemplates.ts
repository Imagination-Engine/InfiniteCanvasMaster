export const blockTemplate = `import { z } from 'zod';

export interface MCPToolBinding {
  kind: 'local' | 'remote';
  toolName: string;
  invoke: (input: any) => Promise<any>;
}

export interface BlockDefinition<TInput extends z.ZodTypeAny, TOutput extends z.ZodTypeAny> {
  id: string;
  name: string;
  description: string;
  category: string;
  input: TInput;
  output: TOutput;
  agent: MCPToolBinding;
  mode: 'triggered' | 'streaming' | 'ambient';
}

export const {{id}}Block: BlockDefinition<any, any> = {
  id: 'iem.{{surface}}.{{id}}',
  name: '{{name}}',
  description: 'Auto-generated {{name}} block',
  category: 'uncategorized',
  input: z.object({
    payload: z.string().optional()
  }),
  output: z.object({
    success: z.boolean()
  }),
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'execute_{{id}}',
    invoke: async (input) => {
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

export interface {{name}}ViewProps {
  data: any;
}

export const {{name}}View: React.FC<{{name}}ViewProps> = ({ data }) => {
  return (
    <div data-testid="{{id}}-view">
      <h3>{{name}}</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
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
    render(<{{name}}View data={{ test: true }} />);
    expect(screen.getByTestId('{{id}}-view')).toBeInTheDocument();
    expect(screen.getByText('{{name}}')).toBeInTheDocument();
  });
});
`;