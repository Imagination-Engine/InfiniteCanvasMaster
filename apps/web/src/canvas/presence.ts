import { useMyPresence, useUpdateMyPresence, useOthers } from './liveblocks.config';

export function usePresence() {
  const myPresence = useMyPresence();
  const updatePresence = useUpdateMyPresence();
  const others = useOthers();

  return {
    myPresence,
    updatePresence,
    others,
  };
}
