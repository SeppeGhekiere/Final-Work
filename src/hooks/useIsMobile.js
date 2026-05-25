import { useState, useEffect } from "react";

export function useIsMobile(breakpoint = "768px") {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint})`);
    setIsMobile(mq.matches); // eslint-disable-line react-hooks/set-state-in-effect
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
}
