import { useState, useEffect, useRef, useMemo } from "react";
import { gameState } from "../state/gameState";
import { useIsMobile } from "../hooks/useIsMobile";

export default function ChoiceList({ choices, onSelect, effects }) {
  const decorImages = [
    "/Option_deco_tl.svg",
    "/Option_deco_tr.svg",
    "/Option_deco_bl.svg",
    "/Option_deco_br.svg",
  ];

  const [hiddenChoices, setHiddenChoices] = useState(new Set());
  const [choicesEnabled, setChoicesEnabled] = useState(false);
  const [reflectedIndices, setReflectedIndices] = useState(new Set());
  const isMobile = useIsMobile();
  const choiceStability = effects?.choiceStability ?? 1;
  const choiceFade = effects?.choiceFade ?? 0;
  const inputDelay = effects?.inputDelay ?? 0;
  const disappearChance = effects?.disappearChance ?? 0;

  const autoSelect = effects?.autoSelect ?? false;
  const overrideChoices = effects?.overrideChoices ?? false;
  const autoSelectTimerRef = useRef(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- reset state when choices change */
    setChoicesEnabled(false);
    setReflectedIndices(new Set());
    const timer = setTimeout(() => {
      setChoicesEnabled(true);
    }, inputDelay);
    return () => clearTimeout(timer);
  }, [choices, inputDelay]);

  useEffect(() => {
    if (autoSelect && choices.length > 0) {
      autoSelectTimerRef.current = setTimeout(() => {
        const visibleIndices = choices
          .map((_, i) => i)
          .filter(i => !hiddenChoices.has(i));
        if (visibleIndices.length > 0) {
          const randomIndex = visibleIndices[Math.floor(Math.random() * visibleIndices.length)];
          onSelect(choices[randomIndex]);
        }
      }, 15000);
    }
    return () => {
      if (autoSelectTimerRef.current) {
        clearTimeout(autoSelectTimerRef.current);
      }
    };
  }, [choices, autoSelect, hiddenChoices, onSelect]);

  useEffect(() => {
    if (!overrideChoices) return;

    const reflected = new Set();
    choices.forEach((choice, i) => {
      if (choice.effects && (choice.effects.awareness || choice.effects.resistance)) {
        reflected.add(i);
      }
    });

    if (reflected.size === 0) return;

    const timer = setTimeout(() => {
      setReflectedIndices(reflected);
    }, 5000);

    return () => clearTimeout(timer);
  }, [choices, overrideChoices]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- needed to compute unstable choices when props change */
    const stability = choiceStability;
    if (stability < 1) {
      setHiddenChoices(
        new Set(choices.map((_, i) => i).filter(() => Math.random() > stability))
      );
    } else if (effects.choiceInstability) {
      setHiddenChoices(
        new Set(choices.map((_, i) => i).filter(() => Math.random() < 0.15))
      );
    } else {
      setHiddenChoices(new Set());
    }
  }, [choices, choiceStability, effects.choiceInstability]);

  useEffect(() => {
    if (disappearChance > 0 && choices.length > 0) {
      const timer = setTimeout(() => {
        choices.forEach((_, i) => {
          if (Math.random() < disappearChance) {
            setHiddenChoices(prev => new Set([...prev, i]));
          }
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [choices, disappearChance]);

  const visibleChoices = useMemo(() => {
    return choices
      .map((choice, i) => {
        const text = typeof choice.text === "function"
          ? choice.text(gameState)
          : choice.text;
        return { choice: { ...choice, displayText: text }, originalIndex: i };
      })
      .filter(({ originalIndex }) => !hiddenChoices.has(originalIndex));
  }, [choices, hiddenChoices]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      if (!["1", "2", "3", "4"].includes(key)) return;
      if (!choicesEnabled) return;

      const index = parseInt(key, 10) - 1;
      if (index >= visibleChoices.length) return;

      const { choice, originalIndex } = visibleChoices[index];

      const isDisabled = overrideChoices && choice.effects &&
          (choice.effects.resistance || choice.effects.awareness) &&
          !reflectedIndices.has(originalIndex);

      if (!isDisabled) {
        e.preventDefault();
        onSelect(choice);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [choicesEnabled, visibleChoices, overrideChoices, reflectedIndices, onSelect]);

  return (
    <div className="choices-grid">
      {visibleChoices.map(({ choice, originalIndex }, visibleIndex) => {
        const isLeftChoice = visibleIndex % 2 === 0;
        const number = visibleIndex + 1;
        const hasDrift = effects.drift > 0.1;
        const decorIndex = isMobile ? 1 : visibleIndex;
        const alignClass = isMobile ? "choice-number-left" : (isLeftChoice ? "choice-number-right" : "choice-number-left");
        const bgPos = isMobile ? "right center" : "center";

        let isDisabled = !choicesEnabled;
        let isReflected = false;
        if (overrideChoices && choice.effects) {
          const hasHealthyEffect = choice.effects.resistance || choice.effects.awareness;
          if (hasHealthyEffect) {
            isDisabled = true;
            if (reflectedIndices.has(originalIndex)) {
              isDisabled = false;
              isReflected = true;
            }
          }
        }

        return (
          <button
            key={originalIndex}
            onClick={() => choicesEnabled && !isDisabled && onSelect(choice)}
            disabled={isDisabled}
            style={{
              backgroundImage: `url(${decorImages[decorIndex]})`,
              backgroundPosition: bgPos,
              animationName: hasDrift ? "drift" : "none",
              animationDuration: hasDrift ? `${3 + visibleIndex * 0.5}s` : "0s",
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDelay: `-${visibleIndex * 0.7}s`,
              opacity: isDisabled ? 0.3 : (choicesEnabled ? Math.max(0.1, 1 - choiceFade) : 0.5),
              cursor: isDisabled ? "not-allowed" : (choicesEnabled ? "pointer" : "not-allowed"),
            }}
            className={`${alignClass}${isReflected ? " reflected-available" : ""}`}
          >
            <span className="choice-text">{choice.displayText}</span>
            <span className="choice-number">{number}</span>
          </button>
        );
      })}
    </div>
  );
}
