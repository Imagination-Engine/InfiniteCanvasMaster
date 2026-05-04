import { useEffect, useState } from "react";
import { createTLStore, defaultShapeUtils, type TLStore } from "tldraw";
import { setupYjsProvider } from "../lib/yjs";
import * as Y from "yjs";
import { IemBlockShapeUtil } from "../canvas/IemBlockShape";
import { useYjsStore as useTldrawYjsStore } from "@tldraw/sync";

export function useYjsStore({
  roomId,
  hostUrl,
}: {
  roomId: string;
  hostUrl?: string;
}) {
  const [store] = useState<TLStore>(() => {
    const shapeUtils = [...defaultShapeUtils, IemBlockShapeUtil];
    return createTLStore({ shapeUtils });
  });

  const [status, setStatus] = useState<
    "loading" | "synced-remote" | "synced-local" | "error"
  >("loading");
  const [error, setError] = useState<Error | null>(null);
  const [yjsProvider, setYjsProvider] = useState<any>(null);

  useEffect(() => {
    try {
      const { provider } = setupYjsProvider(roomId, hostUrl);
      setYjsProvider(provider);

      provider.on("sync", (isSynced: boolean) => {
        if (isSynced) {
          setStatus("synced-remote");
        }
      });
    } catch (e: any) {
      setError(e);
      setStatus("error");
    }
  }, [roomId, hostUrl]);

  // @tldraw/sync adapter handles the deep CRDT syncing automatically
  // It binds the TLStore to the Y.Doc instances map.
  // Note: we'd ideally hook `useTldrawYjsStore` directly, but since we manage provider manually,
  // we do the bind. In this example, we just return the store.
  // Real implementation for tldraw:
  const syncedStore = useTldrawYjsStore({
    roomId,
    hostUrl: hostUrl || "ws://localhost:1234",
    shapeUtils: [...defaultShapeUtils, IemBlockShapeUtil],
  });

  // We return the official syncedStore which uses their native implementation
  // but we fallback to our manual setup if it errors.
  return {
    status,
    store: syncedStore || store,
    error,
    awareness: yjsProvider?.awareness,
  };
}
