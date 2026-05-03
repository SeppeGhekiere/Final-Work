import { useState, useEffect } from "react";

export default function ChoiceList({ choices, onSelect, effects }) {
  const decorImages = [
    "/Option_deco_tl.svg",
    "/Option_deco_tr.svg",
    "/Option_deco_bl.svg",
    "/Option_deco_br.svg",
  ];

  const [hiddenChoices, setHiddenChoices] = useState(new Set());

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- needed to compute unstable choices when props change */
    if (effects.choiceInstability) {
      setHiddenChoices(
        new Set(choices.map((_, i) => i).filter(() => Math.random() < 0.15))
      );
    } else {
      setHiddenChoices(new Set());
    }
  }, [choices, effects.choiceInstability]);

  return (
    <div className="choices-grid">
      {choices.map((choice, i) => {
        if (hiddenChoices.has(i)) return null;

        const isLeftChoice = i % 2 === 0;
        const number = i + 1;
        const hasDrift = effects.drift > 0.1;

        return (
          <button
            key={i}
            onClick={() => onSelect(choice)}
            style={{
              backgroundImage: `url(${decorImages[i]})`,
              animation: hasDrift ? `drift ${3 + i * 0.5}s ease-in-out infinite` : "none",
              animationDelay: `-${i * 0.7}s`,
            }}
            className={isLeftChoice ? "choice-number-right" : "choice-number-left"}
          >
            <span className="choice-text">{choice.text}</span>
            <span className="choice-number">{number}</span>
          </button>
        );
      })}
    </div>
  );
}
