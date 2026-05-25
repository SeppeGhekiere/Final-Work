import { useEffect } from "react";

export function useHeartbeat() {
  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId") || crypto.randomUUID();
    localStorage.setItem("sessionId", sessionId);

    const interval = setInterval(() => {
      fetch("/api/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }).catch(() => {});
    }, 10000);

    return () => clearInterval(interval);
  }, []);
}
