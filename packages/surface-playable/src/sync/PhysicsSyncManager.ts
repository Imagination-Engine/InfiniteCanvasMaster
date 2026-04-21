import * as Y from 'yjs';

export interface EntityState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export class PhysicsSyncManager {
  private doc: Y.Doc;
  private stateMap: Y.Map<any>;

  constructor(doc: Y.Doc, roomName: string) {
    this.doc = doc;
    this.stateMap = doc.getMap(roomName);
  }

  updateEntity(id: string, state: EntityState) {
    this.stateMap.set(id, state);
  }

  getEntity(id: string): EntityState | undefined {
    return this.stateMap.get(id) as EntityState | undefined;
  }
}