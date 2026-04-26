import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

export function setupYjsProvider(
  roomName: string,
  serverUrl = "ws://localhost:1234",
) {
  const doc = new Y.Doc();

  // Connect to the y-websocket server
  const provider = new WebsocketProvider(serverUrl, roomName, doc);

  const awareness = provider.awareness;

  return { doc, provider, awareness };
}

export function getAwarenessState(awareness: any) {
  const localState = awareness.getLocalState();
  return localState || {};
}
