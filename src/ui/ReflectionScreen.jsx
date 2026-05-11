import { useRef } from "react";
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

      {/* Help section - grounded, practical */}
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ marginBottom: "1rem" }}>
          You do not need to stop using your phone completely.
        </p>
        <p style={{ marginBottom: "1rem" }}>
          But noticing the moment before you open it —
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
