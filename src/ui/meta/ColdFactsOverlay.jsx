import { useState, useEffect } from "react";
import { facts } from "../../events/factData";

export default function ColdFactsOverlay({ onComplete }) {
  const [step, setStep] = useState(0);
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setButtonEnabled(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const handleNextFact = () => {
    if (step < facts.length - 1) {
      setStep((i) => i + 1);
      setFactIndex((i) => i + 1);
      setButtonEnabled(false);
      setTimeout(() => setButtonEnabled(true), 1000);
    } else {
      onComplete();
    }
  };

  const fact = facts[factIndex];

  return (
    <div className="meta-overlay facts-overlay">
      <div className="facts-content">
        <p className="fact-text" key={factIndex}>
          {fact.text}
        </p>
        {fact.footer && (
          <p className="fact-footer" key={`f${factIndex}`}>
            {fact.footer}
          </p>
        )}
        {buttonEnabled && (
          <button
            className="meta-continue-btn"
            onClick={step < facts.length - 1 ? handleNextFact : onComplete}
          >
            {step < facts.length - 1 ? "Next" : "Continue"}
          </button>
        )}
      </div>
    </div>
  );
}
