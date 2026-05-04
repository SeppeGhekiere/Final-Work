import { useRef, useEffect } from "react";
import { gameState } from "../state/gameState";
import { getSimulationProfile } from "../engine/effects";

const profileTitles = {
  deep_scroll: "Doom Scroll",
  aware_loop: "Aware",
  breaking: "Breaking",
  uneasy: "Uneasy",
  neutral: "Neutral",
};

export default function ReflectionScreen({ onRestart, onClose }) {
  const state = gameState;
  const hasCalledClose = useRef(false);

  const profile = getSimulationProfile(state);
  const title = profileTitles[profile] || "This loop";

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

      {/* Help section */}
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ marginBottom: "1rem" }}>
          If you want to interrupt the loop, small things can help:
        </p>
        <ul style={{ paddingLeft: "1.5rem" }}>
          <li style={{ marginBottom: "0.5rem" }}>move your phone out of reach</li>
          <li style={{ marginBottom: "0.5rem" }}>turn off non-essential notifications</li>
          <li style={{ marginBottom: "0.5rem" }}>set a moment to check in with yourself</li>
        </ul>
        <p style={{ marginTop: "1rem", fontSize: "0.9rem", opacity: 0.7 }}>
          Not perfect solutions—just ways to create a pause.
        </p>
      </div>

      {/* Closing line */}
      <p style={{
        marginBottom: "2rem",
        fontStyle: "italic",
      }}>
        Noticing it is already a step.
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
