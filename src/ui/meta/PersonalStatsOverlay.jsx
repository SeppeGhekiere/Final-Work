import { useState, useEffect } from "react";
import { analyzePersonalStats } from "../../events/personalStats";

export default function PersonalStatsOverlay({ onComplete }) {
  const [buttonEnabled, setButtonEnabled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setButtonEnabled(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const stats = analyzePersonalStats();

  return (
    <div className="meta-overlay stats-overlay">
      <div className="stats-content">
        {stats.totalChoices > 0 && (
          <p className="stats-line">
            You chose to continue scrolling <strong>{stats.scrollChoices}</strong> times.
          </p>
        )}
        {stats.totalChoices > 0 && (
          <p className="stats-line">
            Average decision time:{" "}
            <strong>
              {stats.avgReactionTime.minutes}m {stats.avgReactionTime.seconds}s
            </strong>
          </p>
        )}
        {stats.impulsiveChoices > stats.totalChoices * 0.5 && (
          <p className="stats-line">Most of your choices were made impulsively.</p>
        )}
        {stats.hesitationTrend === "less" && (
          <p className="stats-line">You hesitated less and less over time.</p>
        )}
        {stats.hesitationTrend === "more" && (
          <p className="stats-line">You hesitated more as time went on.</p>
        )}
        {buttonEnabled && (
          <button className="meta-continue-btn" onClick={onComplete}>
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
