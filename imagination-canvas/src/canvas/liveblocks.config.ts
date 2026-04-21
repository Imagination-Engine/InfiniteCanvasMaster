import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  // In a local/demo environment, we might use a public key or a mock
  // For now, we'll use a placeholder and assume the local stack is running if needed
  publicApiKey: "pk_demo", 
});

export type Presence = {
  cursor: { x: number; y: number } | null;
  selection: string[];
};

export type Storage = {
  // Define shared storage if needed
};

export const {
  RoomProvider,
  useMyPresence,
  useUpdateMyPresence,
  useOthers,
  // ... other hooks
} = createRoomContext<Presence, Storage>(client);
