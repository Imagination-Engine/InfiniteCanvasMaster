export interface MCPToolBinding {
  kind: 'local' | 'remote'
  serverUrl?: string           // for remote
  toolName: string
  defaultArgs?: Record<string, unknown>
  invoke: (input: unknown) => Promise<unknown>
}