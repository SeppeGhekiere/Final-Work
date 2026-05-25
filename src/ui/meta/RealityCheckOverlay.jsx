import { useState, useEffect } from "react";
import { playKnock, ensureAudioContext } from "../../hooks/useSound";

export default function RealityCheckOverlay({ onComplete }) {
  const [step, setStep] = useState(0);
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [dimmed, setDimmed] = useState(false);

  useEffect(() => {
    let mounted = true;
    ensureAudioContext();

    const tKnock = setTimeout(() => {
      if (mounted) playKnock();
    }, 2000);

    const t2 = setTimeout(() => {
      if (mounted) {
        setDimmed(true);
        setStep(1);
      }
    }, 4500);

    const t3 = setTimeout(() => {
      if (mounted) setStep(2);
    }, 6500);

    const t4 = setTimeout(() => {
      if (mounted) setButtonEnabled(true);
    }, 8500);

    return () => {
      mounted = false;
      clearTimeout(tKnock);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <div className="meta-overlay reality-overlay">
      {dimmed && <div className="reality-dim-overlay" />}
      <div className="reality-content">
        {step >= 1 && (
          <p className="reality-line" key="l1">
            You finally looked away.
          </p>
        )}
        {step >= 2 && (
          <>
            <p className="reality-line" key="l2">
              How long were you scrolling?
            </p>
            <p className="reality-sub" key="sub">
              Most people don&apos;t notice how long they&apos;ve been scrolling until something
              interrupts them.
            </p>
          </>
        )}
        {buttonEnabled && (
          <button className="meta-continue-btn" onClick={onComplete}>
            Are you sure you want to continue?
          </button>
        )}
      </div>
    </div>
  );
}
