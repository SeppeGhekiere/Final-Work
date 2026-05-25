import { useRef } from "react";
import { gameState } from "../state/gameState";
import { getSimulationProfile, getEnding, profileTitles } from "../engine/effects";
import { getInteractionState } from "../state/interactionState";
import { useIsMobile } from "../hooks/useIsMobile";
import { useAggregatedStats } from "../hooks/useAggregatedStats";
import ReactionTimeChart from "./charts/ReactionTimeChart";
import ComparisonSection from "../components/ComparisonSection";

export default function ReflectionScreen({ onRestart, onClose, onGoBack }) {
  const state = gameState;
  const interaction = getInteractionState();
  const hasCalledClose = useRef(false);
  const isMobile = useIsMobile();
  const { aggregated, fetchError } = useAggregatedStats();

  const profile = getSimulationProfile(state);
  const title = profileTitles[profile] || "This loop";

  const userStats = {
    time_loss: state.time_loss || 0,
    tension: state.tension || 0,
    ending: getEnding(state),
    avgReactionMs: 0,
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
    <div
      className="reflection-screen"
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: isMobile ? "1.5rem 1rem" : "2rem",
        boxSizing: "border-box",
        textAlign: "left",
        color: "#e0e0e0",
        lineHeight: "1.6",
        maxHeight: "100vh",
        overflowY: "auto",
      }}
    >
      {dynamicLines.length > 0 && (
        <div
          style={{
            marginBottom: "2rem",
            fontStyle: "italic",
            opacity: 0.8,
          }}
        >
          {dynamicLines.map((line, i) => (
            <p key={i} style={{ margin: "0.5rem 0" }}>
              {line}
            </p>
          ))}
        </div>
      )}

      <h1
        style={{
          fontSize: isMobile ? "1.5rem" : "2rem",
          marginBottom: "2rem",
          fontWeight: "300",
        }}
      >
        {title}
      </h1>

      <ReactionTimeChart clickTimes={interaction.clickTimes} />

      <div style={{ marginBottom: "2rem" }}>
        <p>What you just experienced isn't random.</p>
        <p>Doomscrolling works because it's easy to start and hard to notice while it's happening.</p>
        <p>It's not just about willpower.</p>
        <p>These systems are designed to keep your attention.</p>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <p style={{ marginBottom: "1rem" }}>You do not need to stop using your phone completely.</p>
        <p style={{ marginBottom: "1rem" }}>But noticing the moment before you open it that matters.</p>
        <p
          style={{
            marginBottom: "1rem",
            fontSize: "0.95rem",
            opacity: 0.8,
            lineHeight: "1.7",
          }}
        >
          Next time you reach for your phone automatically:
        </p>
        <p
          style={{
            marginBottom: "1rem",
            fontSize: "0.95rem",
            opacity: 0.8,
            fontStyle: "italic",
          }}
        >
          pause for 5 seconds.
        </p>
        <p
          style={{
            marginBottom: "1rem",
            fontSize: "0.95rem",
            opacity: 0.8,
          }}
        >
          Ask yourself:
        </p>
        <p
          style={{
            marginBottom: "1rem",
            fontSize: "1.05rem",
            opacity: 0.9,
            fontStyle: "italic",
          }}
        >
          &ldquo;What am I looking for right now?&rdquo;
        </p>
      </div>

      <p
        style={{
          marginBottom: "2rem",
          fontStyle: "italic",
        }}
      >
        This loop is hard to notice while you&apos;re inside it.
      </p>

      {aggregated && <ComparisonSection userStats={userStats} aggregated={aggregated} />}

      {fetchError && (
        <p style={{ fontSize: "0.8rem", opacity: 0.3, textAlign: "center", marginBottom: "2rem" }}>
          Comparison data temporarily unavailable
        </p>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "0.75rem" : "1rem",
          justifyContent: "center",
        }}
      >
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
            width: isMobile ? "100%" : undefined,
            textAlign: "center",
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
            width: isMobile ? "100%" : undefined,
            textAlign: "center",
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
            width: isMobile ? "100%" : undefined,
            textAlign: "center",
          }}
        >
          Restart experience
        </button>
      </div>
    </div>
  );
}
