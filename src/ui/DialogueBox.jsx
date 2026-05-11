import { useEffect, useRef, useMemo, useState } from "react";
import useTypewriter from "../hooks/useTypewriter";
import { gameState } from "../state/gameState";

export default function DialogueBox({ lines, effects, onFinish }) {
	const speed = Math.max(8, 20 / (effects?.textSpeed || 1));
	const textSpeed = effects?.textSpeed || 1;
	const textJitter = effects?.textJitter || 0;
	const [timeJump, setTimeJump] = useState(false);

	// Handle time jump effect (time_loss >= 8)
	useEffect(() => {
		if (effects?.timeJump && Math.random() < 0.3) {
			setTimeJump(true);
			const timer = setTimeout(() => setTimeJump(false), 2000);
			return () => clearTimeout(timer);
		}
	}, [effects?.timeJump]);

	// Apply textSpeed to pauseAfter values - memoized to prevent infinite loops
	// Also evaluate dynamic text functions
	const adjustedLines = useMemo(() => {
		return lines.map((line) => {
			const text = typeof line.text === "function" ? line.text(gameState) : line.text;
			return {
				...line,
				text: text || "",
				pauseAfter: Math.round((line.pauseAfter || 0) / textSpeed),
			};
		});
	}, [lines, textSpeed]);

	const { displayedLines, currentText, isFinished } = useTypewriter(adjustedLines, speed);

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
			{/* Time jump overlay (time_loss >= 8) */}
			{timeJump && (
				<div
					style={{
						position: "absolute",
						inset: 0,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						background: "rgba(0,0,0,0.8)",
						zIndex: 10,
						fontSize: "1.5rem",
						fontStyle: "italic",
					}}
				>
					Time passes...
				</div>
			)}

			{displayedLines.map((line, i) => {
				const totalLines = displayedLines.length;
				const age = totalLines - i * 2;
				const decay = effects?.memoryDecay ?? 0;
				const lineOpacity = Math.min(1, 1 - age * decay * 0.3);

				// Text jitter effect - static offset based on line index
				const jitterOffset = textJitter > 0 ? Math.sin(i * 1.5) * textJitter * 5 : 0;

				return (
					<p
						key={i}
						style={{
							opacity: Math.max(lineOpacity, 0.05),
							transition: "opacity 1s ease",
							transform: `translateX(${jitterOffset}px)`,
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
