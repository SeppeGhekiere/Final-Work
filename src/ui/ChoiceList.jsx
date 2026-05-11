import { useState, useEffect, useRef, useMemo } from "react";
import { gameState } from "../state/gameState";

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
  const choiceStability = effects?.choiceStability ?? 1;
  const choiceFade = effects?.choiceFade ?? 0;
  const inputDelay = effects?.inputDelay ?? 0;
  const disappearChance = effects?.disappearChance ?? 0;

  // Resistance effects
  const autoSelect = effects?.autoSelect ?? false;
  const overrideChoices = effects?.overrideChoices ?? false;
  const autoSelectTimerRef = useRef(null);

  // Handle input delay
  useEffect(() => {
    setChoicesEnabled(false);
    setReflectedIndices(new Set());
    const timer = setTimeout(() => {
      setChoicesEnabled(true);
    }, inputDelay);
    return () => clearTimeout(timer);
  }, [choices, inputDelay]);

  // Handle auto-select (low resistance)
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

  // Handle enable reflected choices - disabled positive choices become available after 5 seconds
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

  // Handle auto-select (low resistance)
  useEffect(() => {
    if (autoSelect && choices.length > 0) {
      autoSelectTimerRef.current = setTimeout(() => {
        // Auto-select a random non-hidden choice
        const visibleIndices = choices
          .map((_, i) => i)
          .filter(i => !hiddenChoices.has(i));
        if (visibleIndices.length > 0) {
          const randomIndex = visibleIndices[Math.floor(Math.random() * visibleIndices.length)];
          onSelect(choices[randomIndex]);
        }
      }, 15000); // Auto-select after 15 seconds
    }
    return () => {
      if (autoSelectTimerRef.current) {
        clearTimeout(autoSelectTimerRef.current);
      }
    };
  }, [choices, autoSelect, hiddenChoices, onSelect]);

  // Handle choice instability (both legacy and new system)
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- needed to compute unstable choices when props change */
    const stability = choiceStability;
    if (stability < 1) {
      // Randomly offset choices that fail the stability check
      setHiddenChoices(
        new Set(choices.map((_, i) => i).filter(() => Math.random() > stability))
      );
    } else if (effects.choiceInstability) {
      // Legacy system
      setHiddenChoices(
        new Set(choices.map((_, i) => i).filter(() => Math.random() < 0.15))
      );
    } else {
      setHiddenChoices(new Set());
    }
  }, [choices, choiceStability, effects.choiceInstability]);

  // Handle disappear chance (memory loss effect)
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

  // Filter to get visible choices with their correct positions
  // Also evaluate dynamic choice text
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

  return (
    <div className="choices-grid">
      {visibleChoices.map(({ choice, originalIndex }, visibleIndex) => {
        const isLeftChoice = visibleIndex % 2 === 0;
        const number = visibleIndex + 1;
        const hasDrift = effects.drift > 0.1;

        // Override choices (very low resistance) - disable healthy choices
        let isDisabled = !choicesEnabled;
        let isReflected = false;
        if (overrideChoices && choice.effects) {
          const hasHealthyEffect = choice.effects.resistance || choice.effects.awareness;
          if (hasHealthyEffect) {
            isDisabled = true;
            // Check if this choice is now reflected/available
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
              backgroundImage: `url(${decorImages[visibleIndex]})`,
              animationName: hasDrift ? "drift" : "none",
              animationDuration: hasDrift ? `${3 + visibleIndex * 0.5}s` : "0s",
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDelay: `-${visibleIndex * 0.7}s`,
              opacity: isDisabled ? 0.3 : (choicesEnabled ? Math.max(0.1, 1 - choiceFade) : 0.5),
              cursor: isDisabled ? "not-allowed" : (choicesEnabled ? "pointer" : "not-allowed"),
            }}
            className={`${isLeftChoice ? "choice-number-right" : "choice-number-left"}${isReflected ? " reflected-available" : ""}`}
          >
            <span className="choice-text">{choice.displayText}</span>
            <span className="choice-number">{number}</span>
          </button>
        );
      })}
    </div>
  );
}
