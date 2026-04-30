import { useState, useEffect } from "react";

export default function useTypewriter(lines, speed = 30) {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  // Reset state when lines change (new scene)
  useEffect(() => {
    setDisplayedLines([]);
    setCurrentLineIndex(0);
    setCurrentText("");
    setCharIndex(0);
  }, [lines]);

  useEffect(() => {
    if (!lines || currentLineIndex >= lines.length) return;

    const line = lines[currentLineIndex];

    // Handle empty lines: skip typing, just wait
    if (line.text.length === 0) {
      const timeout = setTimeout(() => {
        setDisplayedLines(prev => [...prev, ""]);
        setCurrentText("");
        setCharIndex(0);
        setCurrentLineIndex(prev => prev + 1);
      }, line.pauseAfter || 500);

      return () => clearTimeout(timeout);
    }

    if (charIndex < line.text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prev => prev + line.text[charIndex]);
        setCharIndex(charIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      // line finished → wait pause, then next line
      const timeout = setTimeout(() => {
        setDisplayedLines(prev => [...prev, line.text]);
        setCurrentText("");
        setCharIndex(0);
        setCurrentLineIndex(prev => prev + 1);
      }, line.pauseAfter || 500);

      return () => clearTimeout(timeout);
    }
  }, [charIndex, currentLineIndex, lines, speed]);

  return {
    displayedLines,
    currentText,
    isFinished: currentLineIndex >= lines.length
  };
}
