import { useRef, useEffect, useState } from "react";
import { gameState } from "../state/gameState";
import { getSimulationProfile } from "../engine/effects";
import { getInteractionState } from "../state/interactionState";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const profileLabels = {
  deep_scroll: "Deep Scroll",
  aware_loop: "Aware Loop",
  breaking: "Breaking Free",
  uneasy: "Uneasy",
  neutral: "Neutral",
};

const profileTitles = {
  deep_scroll: "Doom Scroll",
  aware_loop: "Aware",
  breaking: "Breaking",
  uneasy: "Uneasy",
  neutral: "Neutral",
};

function ReactionTimeChart({ clickTimes }) {
  if (!clickTimes || clickTimes.length < 2) return null;

  const width = 500;
  const height = 150;
  const padding = 20;
  const maxTime = 4000; // Cap at 4s for visualization

  const points = clickTimes.map((time, i) => {
    const x = padding + (i / (clickTimes.length - 1)) * (width - 2 * padding);
    const y = height - padding - (Math.min(time, maxTime) / maxTime) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
      <p style={{ fontSize: "0.8rem", opacity: 0.6, marginBottom: "0.5rem" }}>Your Reaction Pacing:</p>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
        {/* Zones */}
        <rect x={padding} y={padding} width={width - 2 * padding} height={(height - 2 * padding) * (800 / maxTime)} 
          fill="rgba(255, 0, 0, 0.05)" transform={`translate(0, ${(height - 2 * padding) * (1 - 800 / maxTime)})`} />
        <rect x={padding} y={padding} width={width - 2 * padding} height={(height - 2 * padding) * (1500 / maxTime)} 
          fill="rgba(0, 255, 0, 0.05)" />
          
        {/* Labels for zones */}
        <text x={padding + 5} y={height - padding - 5} fontSize="8" fill="rgba(255, 100, 100, 0.6)">Mindless / Reactive</text>
        <text x={padding + 5} y={padding + 12} fontSize="8" fill="rgba(100, 255, 100, 0.6)">Mindful / Hesitant</text>

        {/* Axis */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.2)" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(255,255,255,0.2)" />

        {/* Data Line */}
        <polyline
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
        
        {/* Data Points */}
        {clickTimes.map((time, i) => {
          const x = padding + (i / (clickTimes.length - 1)) * (width - 2 * padding);
          const y = height - padding - (Math.min(time, maxTime) / maxTime) * (height - 2 * padding);
          return (
            <circle key={i} cx={x} cy={y} r="3" fill={time < 800 ? "#ff4444" : time > 2500 ? "#44ff44" : "#e0e0e0"} />
          );
        })}
      </svg>
    </div>
  );
}

function ComparisonSection({ userStats, aggregated }) {
  if (!aggregated) return null;

  const userEnding = userStats.ending || "Unknown";
  const topEnding = aggregated.topEnding || null;
  const totalSessions = aggregated.totalSessions || 0;
  const choicePct = aggregated.choiceMatchPercent;
  const endingPct = aggregated.endingPercent;

  return (
    <div style={{
      marginTop: "3rem",
      marginBottom: "2rem",
      padding: "1.5rem",
      borderTop: "1px solid rgba(255,255,255,0.1)",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
    }}>
      <h2 style={{
        fontSize: "1.2rem",
        fontWeight: "300",
        marginBottom: "1.5rem",
        opacity: 0.7,
      }}>
        Compared to Other Participants
      </h2>

      {totalSessions > 0 && (
        <p style={{ fontSize: "0.8rem", opacity: 0.4, marginBottom: "1rem" }}>
          Based on {totalSessions} sessions
        </p>
      )}

      {choicePct != null && (
        <div style={{
          padding: "1rem",
          marginBottom: "1rem",
          background: "rgba(255,255,255,0.03)",
          borderRadius: "8px",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "2rem", fontWeight: "300", margin: "0 0 0.3rem 0" }}>
            {choicePct}%
          </p>
          <p style={{ fontSize: "0.85rem", opacity: 0.6, margin: 0 }}>
            of other users made the same choices as you
          </p>
        </div>
      )}

      {endingPct != null && (
        <div style={{
          padding: "1rem",
          marginBottom: "1rem",
          background: "rgba(255,255,255,0.03)",
          borderRadius: "8px",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "2rem", fontWeight: "300", margin: "0 0 0.3rem 0" }}>
            {endingPct}%
          </p>
          <p style={{ fontSize: "0.85rem", opacity: 0.6, margin: 0 }}>
            of users got the same ending as you
          </p>
        </div>
      )}

      {topEnding && (
        <p style={{ marginTop: "1rem", fontSize: "0.9rem", opacity: 0.7 }}>
          Most common ending: <strong>{profileLabels[topEnding] || topEnding}</strong>
          {userEnding !== topEnding && (
            <span style={{ opacity: 0.5 }}> &mdash; Yours was <strong>{profileLabels[userEnding] || userEnding}</strong></span>
          )}
        </p>
      )}

      {aggregated.endingDistribution && (
        <div style={{ marginTop: "1rem" }}>
          <p style={{ fontSize: "0.85rem", opacity: 0.6, marginBottom: "0.5rem" }}>
            Ending Distribution
          </p>
          {Object.entries(aggregated.endingDistribution).map(([ending, count]) => {
            const total = Object.values(aggregated.endingDistribution).reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
            const isUser = ending === userEnding;
            return (
              <div key={ending} style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.3rem",
              }}>
                <span style={{
                  width: "8rem",
                  fontSize: "0.8rem",
                  opacity: isUser ? 1 : 0.5,
                  color: isUser ? "#e0e0e0" : undefined,
                }}>
                  {profileLabels[ending] || ending}
                  {isUser && " (you)"}
                </span>
                <div style={{
                  flex: 1,
                  height: "8px",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: pct + "%",
                    height: "100%",
                    background: isUser ? "#e0e0e0" : "rgba(255,255,255,0.2)",
                    borderRadius: "4px",
                  }} />
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

function getEndingLabel(state) {
  if (state.time_loss >= 12 && state.awareness <= 3) return "endingA";
  if (state.time_loss >= 10 && state.awareness >= 5) return "endingB";
  if (state.resistance >= 8 && state.awareness >= 5) return "endingC";
  if (state.tension >= 6) return "endingD";
  return "endingB";
}

function getUserAvgReactionTime() {
  const interaction = getInteractionState();
  const times = interaction.clickTimes;
  if (!times || times.length === 0) return 0;
  return times.reduce((a, b) => a + b, 0) / times.length;
}

export default function ReflectionScreen({ onRestart, onClose, onGoBack }) {
  const state = gameState;
  const interaction = getInteractionState();
  const hasCalledClose = useRef(false);
  const [aggregated, setAggregated] = useState(null);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch(API_URL + "/results/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Not available");
        return r.json();
      })
      .then((data) => {
        if (mounted) setAggregated(data);
      })
      .catch(() => {
        if (mounted) setFetchError(true);
      });
    return () => { mounted = false; };
  }, []);

  const profile = getSimulationProfile(state);
  const title = profileTitles[profile] || "This loop";

  const userStats = {
    time_loss: state.time_loss || 0,
    tension: state.tension || 0,
    ending: getEndingLabel(state),
    avgReactionMs: getUserAvgReactionTime(),
  };

  const dynamicLines = [];
  if (state.time_loss >= 10) {
    dynamicLines.push("You stayed longer than you probably meant to.");
  }
  if (state.awareness >= 5) {
    dynamicLines.push("You noticed what was happening.");
  }
  if (state.resistance >= 8) {
    dynamicLines.push("You tried to stop.");
  }

  const handleRestart = () => {
    if (hasCalledClose.current) return;
    hasCalledClose.current = true;
    // Reset state
    Object.assign(gameState, {
      sceneId: "scene1",
      time_loss: 0,
      tension: 0,
      awareness: 5,
      resistance: 3,
    });
    onRestart?.();
  };

  const handleClose = () => {
    if (hasCalledClose.current) return;
    hasCalledClose.current = true;
    onClose?.();
  };

  const handleGoBack = () => {
    if (hasCalledClose.current) return;
    hasCalledClose.current = true;
    Object.assign(gameState, {
      sceneId: "scene1",
      time_loss: 0,
      tension: 0,
      awareness: 5,
      resistance: 3,
    });
    onGoBack?.();
  };

  return (
    <div className="reflection-screen" style={{
      maxWidth: "600px",
      margin: "0 auto",
      padding: "2rem",
      textAlign: "left",
      color: "#e0e0e0",
      lineHeight: "1.6",
    }}>
      {/* Dynamic personal lines */}
      {dynamicLines.length > 0 && (
        <div style={{
          marginBottom: "2rem",
          fontStyle: "italic",
          opacity: 0.8,
        }}>
          {dynamicLines.map((line, i) => (
            <p key={i} style={{ margin: "0.5rem 0" }}>{line}</p>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 style={{
        fontSize: "2rem",
        marginBottom: "1.5rem",
        fontWeight: "300",
      }}>
        {title}
      </h1>

      <ReactionTimeChart clickTimes={interaction.clickTimes} />

      {/* Main text */}
      <div style={{ marginBottom: "2rem" }}>
        <p>
          What you just experienced isn't random.
        </p>
        <p>
          Doomscrolling works because it's easy to start
          and hard to notice while it's happening.
        </p>
        <p>
          It's not just about willpower.
        </p>
        <p>
          These systems are designed to keep your attention.
        </p>
      </div>

      {/* Help section - grounded, practical */}
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ marginBottom: "1rem" }}>
          You do not need to stop using your phone completely.
        </p>
        <p style={{ marginBottom: "1rem" }}>
          But noticing the moment before you open it 
          that matters.
        </p>
        <p style={{
          marginTop: "1.5rem",
          fontSize: "0.95rem",
          opacity: 0.8,
          lineHeight: "1.7",
        }}>
          Next time you reach for your phone automatically:
        </p>
        <p style={{
          marginTop: "0.5rem",
          fontSize: "0.95rem",
          opacity: 0.8,
          fontStyle: "italic",
        }}>
          pause for 5 seconds.
        </p>
        <p style={{
          marginTop: "0.5rem",
          fontSize: "0.95rem",
          opacity: 0.8,
        }}>
          Ask yourself:
        </p>
        <p style={{
          marginTop: "0.3rem",
          fontSize: "1.05rem",
          opacity: 0.9,
          fontStyle: "italic",
        }}>
          &ldquo;What am I looking for right now?&rdquo;
        </p>
      </div>

      {/* Closing line */}
      <p style={{
        marginBottom: "2rem",
        fontStyle: "italic",
      }}>
        This loop is hard to notice while you&apos;re inside it.
      </p>

      {/* Buttons */}
      <div style={{
        display: "flex",
        gap: "1rem",
        justifyContent: "center",
      }}>
        <button
          onClick={handleClose}
          style={{
            padding: "0.75rem 2rem",
            fontSize: "1rem",
            cursor: "pointer",
            background: "transparent",
            border: "1px solid #e0e0e0",
            color: "#e0e0e0",
            borderRadius: "4px",
          }}
        >
          Close
        </button>
        <button
          onClick={handleGoBack}
          style={{
            padding: "0.75rem 2rem",
            fontSize: "1rem",
            cursor: "pointer",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "rgba(255,255,255,0.7)",
            borderRadius: "4px",
          }}
        >
          Go Back
        </button>
        <button
          onClick={handleRestart}
          style={{
            padding: "0.75rem 2rem",
            fontSize: "1rem",
            cursor: "pointer",
            background: "#e0e0e0",
            border: "1px solid #e0e0e0",
            color: "#1a1a1a",
            borderRadius: "4px",
          }}
        >
          Restart experience
        </button>
      </div>
    </div>
  );
}
