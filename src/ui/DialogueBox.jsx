import { useEffect } from "react";
import useTypewriter from "../hooks/useTypewriter";

export default function DialogueBox({ lines, effects, onFinish }) {
  const speed = Math.max(20, 30 + (effects?.textDelay || 0));
  const { displayedLines, currentText, isFinished } =
    useTypewriter(lines, speed);

  useEffect(() => {
    if (isFinished && onFinish) {
      onFinish();
    }
  }, [isFinished, onFinish]);

  return (
    <div className="dialogue-box">
      {displayedLines.map((line, i) => (
        <p key={i}>{line}</p>
      ))}

      {!isFinished && <p>{currentText}</p>}
    </div>
  );
}
