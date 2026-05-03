import { useEffect, useRef } from "react";
import useTypewriter from "../hooks/useTypewriter";

export default function DialogueBox({ lines, effects, onFinish }) {
  const speed = Math.max(20, 30 + (effects?.textDelay || 0));
  const { displayedLines, currentText, isFinished } =
    useTypewriter(lines, speed);

  const hasCalledOnFinish = useRef(false);

  useEffect(() => {
    if (isFinished && !hasCalledOnFinish.current) {
      hasCalledOnFinish.current = true;
      onFinish?.();
    }
  }, [isFinished, onFinish]);

  useEffect(() => {
    hasCalledOnFinish.current = false;
  }, [lines]);

  return (
    <div className="dialogue-box">
      {displayedLines.map((line, i) => {
        const totalLines = displayedLines.length;
        const age = totalLines - 1 - i;
        const decay = effects?.memoryDecay ?? 0;
        const lineOpacity = Math.min(1, 1 - age * decay * 0.3);

        return (
          <p
            key={i}
            style={{
              opacity: Math.max(lineOpacity, 0.05),
              transition: "opacity 1s ease",
            }}
          >
            {line}
          </p>
        );
      })}

      {!isFinished && <p>{currentText}</p>}
    </div>
  );
}
