import { useEffect, useRef } from "react";
import { playRoomSound, ensureAudioContext } from "./useSound";

export function useAudioInit() {
  const stopRoomRef = useRef(null);

  useEffect(() => {
    const handler = () => {
      ensureAudioContext();
      const stop = playRoomSound();
      stopRoomRef.current = stop;
    };
    document.addEventListener("click", handler, { once: true });
    return () => document.removeEventListener("click", handler);
  }, []);

  return stopRoomRef;
}
