import { profileLabels } from "../engine/effects";

export default function ComparisonSection({ userStats, aggregated }) {
  if (!aggregated) return null;

  const userEnding = userStats.ending || "Unknown";
  const topEnding = aggregated.topEnding || null;
  const totalSessions = aggregated.totalSessions || 0;
  const choicePct = aggregated.choiceMatchPercent;
  const endingPct = aggregated.endingPercent;

  return (
    <div
      style={{
        marginTop: "2rem",
        marginBottom: "2rem",
        padding: "1.5rem",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <h2
        style={{
          fontSize: "1.2rem",
          fontWeight: "300",
          marginBottom: "1.5rem",
          opacity: 0.7,
        }}
      >
        Compared to Other Participants
      </h2>

      {totalSessions > 0 && (
        <p style={{ fontSize: "0.8rem", opacity: 0.4, marginBottom: "1rem" }}>
          Based on {totalSessions} sessions
        </p>
      )}

      {choicePct != null && (
        <div
          style={{
            padding: "1rem",
            marginBottom: "1rem",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "2rem", fontWeight: "300", margin: "0 0 0.3rem 0" }}>{choicePct}%</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.6, margin: 0 }}>
            of other users made the same choices as you
          </p>
        </div>
      )}

      {endingPct != null && (
        <div
          style={{
            padding: "1rem",
            marginBottom: "1rem",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "2rem", fontWeight: "300", margin: "0 0 0.3rem 0" }}>{endingPct}%</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.6, margin: 0 }}>of users got the same ending as you</p>
        </div>
      )}

      {topEnding && (
        <p style={{ marginTop: "1rem", fontSize: "0.9rem", opacity: 0.7 }}>
          Most common ending: <strong>{profileLabels[topEnding] || topEnding}</strong>
          {userEnding !== topEnding && (
            <span style={{ opacity: 0.5 }}>
              {" "}
              &mdash; Yours was <strong>{profileLabels[userEnding] || userEnding}</strong>
            </span>
          )}
        </p>
      )}

      {aggregated.endingDistribution && (
        <div style={{ marginTop: "1rem" }}>
          <p style={{ fontSize: "0.85rem", opacity: 0.6, marginBottom: "1rem" }}>Ending Distribution</p>
          {Object.entries(aggregated.endingDistribution).map(([ending, count]) => {
            const total = Object.values(aggregated.endingDistribution).reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
            const isUser = ending === userEnding;
            return (
              <div
                key={ending}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <span
                  style={{
                    width: "8rem",
                    fontSize: "0.8rem",
                    opacity: isUser ? 1 : 0.5,
                    color: isUser ? "#e0e0e0" : undefined,
                  }}
                >
                  {profileLabels[ending] || ending}
                  {isUser && " (you)"}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: "8px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: pct + "%",
                      height: "100%",
                      background: isUser ? "#e0e0e0" : "rgba(255,255,255,0.2)",
                      borderRadius: "4px",
                    }}
                  />
                </div>
                <span style={{ fontSize: "0.75rem", opacity: 0.4, width: "3rem", textAlign: "right" }}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
