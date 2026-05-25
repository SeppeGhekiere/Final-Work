import { useState, useEffect } from "react";

export default function ThankYouOverlay({ onComplete }) {
  const [buttonEnabled, setButtonEnabled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setButtonEnabled(true), 3500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="meta-overlay stats-overlay" style={{ textAlign: "center" }}>
      <div className="stats-content" style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: "3rem",
            letterSpacing: "0.2em",
            fontWeight: "300",
            marginBottom: "1rem",
            opacity: 0.9,
          }}
        >
          THE LOOP
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            opacity: 0.6,
            marginBottom: "3rem",
            fontStyle: "italic",
          }}
        >
          Thank you for noticing.
        </p>

        <p style={{ fontSize: "0.9rem", opacity: 0.4, marginBottom: "4rem" }}>
          A project by Ghekiere Seppe
        </p>

        {buttonEnabled && (
          <button className="meta-continue-btn" onClick={onComplete}>
            See Results
          </button>
        )}
      </div>
    </div>
  );
}
