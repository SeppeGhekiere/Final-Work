import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "/api";
let cachedAggregated = null;

export function useAggregatedStats() {
  const [aggregated, setAggregated] = useState(() => cachedAggregated);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (cachedAggregated) {
      setAggregated(cachedAggregated); // eslint-disable-line react-hooks/set-state-in-effect
    }
    fetch(API_URL + "/results/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Not available");
        return r.json();
      })
      .then((data) => {
        if (mounted) {
          cachedAggregated = data;
          setAggregated(data);
        }
      })
      .catch(() => {
        if (mounted) setFetchError(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { aggregated, fetchError };
}
