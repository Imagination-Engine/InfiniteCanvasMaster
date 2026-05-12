import { useEffect, useState } from "react";
import { createTLStore, defaultShapeUtils, type TLStore } from "tldraw";
import { setupYjsProvider } from "../lib/yjs";
import { IemBlockShapeUtil } from "../canvas/IemBlockShape";

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
          // NOTE: We are not currently binding the TLStore to Yjs.
          // This status reflects websocket sync only.
          setStatus("synced-remote");
        }
      });
    } catch (e: any) {
      setError(e);
      setStatus("error");
    }
  }, [roomId, hostUrl]);

  return {
    status,
    store,
    error,
    awareness: yjsProvider?.awareness,
  };
}
