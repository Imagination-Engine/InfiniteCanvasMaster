export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
}
interface ConnectionState {
  connections: Record<string, Connection>;
  addConnection: (conn: Connection) => void;
  removeConnection: (id: string) => void;
}
export declare const useConnectionStore: import("zustand").UseBoundStore<
  import("zustand").StoreApi<ConnectionState>
>;
export {};
//# sourceMappingURL=connectionStore.d.ts.map
