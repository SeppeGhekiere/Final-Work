import { useState, useEffect, useRef } from "react";

export default function useTypewriter(lines, speed = 30) {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  // Reset when lines change
  const linesRef = useRef(lines);
  useEffect(() => {
    if (linesRef.current !== lines) {
      linesRef.current = lines;
      setDisplayedLines([]);
      setCurrentLineIndex(0);
      setCurrentText("");
      setCharIndex(0);
    }
  }, [lines]);

  useEffect(() => {
    if (!lines || currentLineIndex >= lines.length || !lines[currentLineIndex]) return;

    const line = lines[currentLineIndex];

    if (charIndex < line.text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prev => prev + line.text[charIndex]);
        setCharIndex(charIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setDisplayedLines(prev => [...prev, line.text]);
        setCurrentText("");
        setCharIndex(0);
        setCurrentLineIndex(prev => prev + 1);
      }, line.pauseAfter || 500);

      return () => clearTimeout(timeout);
    }
  }, [charIndex, currentLineIndex, lines, speed]);

  const isFinished = currentLineIndex >= lines.length;

  const skip = () => {
    if (isFinished) return;
    setDisplayedLines(lines.map(l => l.text));
    setCurrentLineIndex(lines.length);
    setCurrentText("");
    setCharIndex(0);
  };

  return {
    displayedLines,
    currentText,
    isFinished,
    skip,
  };
}
