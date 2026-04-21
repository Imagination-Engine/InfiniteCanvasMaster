// We're importing the registry to update it dynamically
import { blockRegistry } from '../../block/registry';

export async function handleCustomAgentComplete(payload: any) {
  // Use a fallback token or retrieve from a store if available
  const token = localStorage.getItem('accessToken') || '';

  const response = await fetch('/api/custom-agents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Failed to save custom agent: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.blockDefinition) {
    blockRegistry.register(data.blockDefinition);
  }

  return data.blockDefinition;
}
