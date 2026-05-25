import { useEffect } from "react";

export function useKeyboardShortcut(key, callback) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key.toLowerCase() === key.toLowerCase()) {
        callback(e);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback]);
}
