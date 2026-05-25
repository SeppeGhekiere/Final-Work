import { gameState } from "../state/gameState";
import { getEnding } from "../engine/effects";
import { useAggregatedStats } from "../hooks/useAggregatedStats";
import ComparisonSection from "../components/ComparisonSection";

export default function ComparisonPage({ onContinue }) {
  const { aggregated, fetchError } = useAggregatedStats();
  const state = gameState;
  const userStats = { ending: getEnding(state) };

  return (
    <div className="meta-overlay" style={{ background: "var(--color-bg)", overflowY: "auto" }}>
      <div className="stats-content" style={{ textAlign: "center" }}>
        <h2 style={{ fontWeight: 300, marginBottom: "2rem", color: "var(--color-accent)" }}>
          Compared to Others
        </h2>
        <ComparisonSection userStats={userStats} aggregated={aggregated} />
        {fetchError && (
          <p style={{ fontSize: "0.8rem", opacity: 0.3, marginBottom: "1rem" }}>
            Comparison data temporarily unavailable
          </p>
        )}
        {aggregated && (
          <button className="meta-continue-btn" onClick={onContinue} style={{ marginTop: "1rem" }}>
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
