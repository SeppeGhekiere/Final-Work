import { useRef, useState } from "react";
import { gameState, regenerateSessionId } from "../state/gameState";
import { getSimulationProfile, getEnding, profileTitles } from "../engine/effects";
import { getInteractionState } from "../state/interactionState";
import { useIsMobile } from "../hooks/useIsMobile";
import { useAggregatedStats } from "../hooks/useAggregatedStats";
import ReactionTimeChart from "./charts/ReactionTimeChart";
import ComparisonSection from "../components/ComparisonSection";

export default function ReflectionScreen({ onRestart, onClose, onGoBack }) {
	const state = gameState;
	const interaction = getInteractionState();
	const hasCalledClose = useRef(false);
	const isMobile = useIsMobile();
	const { aggregated, fetchError } = useAggregatedStats();
	const [showMore, setShowMore] = useState(false);

	const profile = getSimulationProfile(state);
	const title = profileTitles[profile] || "This loop";

	const userStats = {
		time_loss: state.time_loss || 0,
		tension: state.tension || 0,
		ending: getEnding(state),
		avgReactionMs: 0,
	};

	const dynamicLines = [];
	if (state.time_loss >= 10) {
		dynamicLines.push("You stayed longer than you probably meant to.");
	}
	if (state.awareness >= 5) {
		dynamicLines.push("You noticed what was happening.");
	}
	if (state.resistance >= 8) {
		dynamicLines.push("You tried to stop.");
	}

  const handleRestart = () => {
    if (hasCalledClose.current) return;
    hasCalledClose.current = true;
    regenerateSessionId();
    Object.assign(gameState, {
			sceneId: "scene1",
			time_loss: 0,
			tension: 0,
			awareness: 5,
			resistance: 3,
		});
		onRestart?.();
	};

	const handleClose = () => {
		if (hasCalledClose.current) return;
		hasCalledClose.current = true;
		onClose?.();
	};

  const handleGoBack = () => {
    if (hasCalledClose.current) return;
    hasCalledClose.current = true;
    regenerateSessionId();
    Object.assign(gameState, {
			sceneId: "scene1",
			time_loss: 0,
			tension: 0,
			awareness: 5,
			resistance: 3,
		});
		onGoBack?.();
	};

	return (
		<div
			className="reflection-screen"
			style={{
				maxWidth: "1500px",
				margin: "0 auto",
				padding: isMobile ? "1.5rem 1rem" : "2rem",
				boxSizing: "border-box",
				textAlign: "left",
				color: "#e0e0e0",
				lineHeight: "1.6",
				height: "100vh",
				display: "flex",
				flexDirection: "column",
				overflow: "hidden",
			}}
		>
			{dynamicLines.length > 0 && (
				<div
					style={{
						marginBottom: "0.75rem",
						fontStyle: "italic",
						opacity: 0.8,
					}}
				>
					{dynamicLines.map((line, i) => (
						<p key={i} style={{ margin: "0.25rem 0" }}>
							{line}
						</p>
					))}
				</div>
			)}

			<h1
				style={{
					fontSize: isMobile ? "1.5rem" : "1.8rem",
					marginBottom: "1rem",
					fontWeight: "300",
				}}
			>
				{title}
			</h1>

			<div
				style={{
					flex: 1,
					display: "flex",
					flexDirection: isMobile ? "column" : "row",
					gap: "2rem",
					overflow: "hidden",
				}}
			>
				<div className="reflection-left" style={{ flex: "2", overflowY: "auto" }}>
					<ReactionTimeChart clickTimes={interaction.clickTimes} />

					<p style={{ marginBottom: "0.5rem" }}>What you just experienced isn't random.</p>

					{!showMore && (
						<button
							onClick={() => setShowMore(true)}
							style={{
								background: "none",
								border: "none",
								color: "var(--color-accent)",
								cursor: "pointer",
								fontSize: "0.85rem",
								padding: 0,
								marginBottom: "1rem",
							}}
						>
							Read more &hellip;
						</button>
					)}

					{showMore && (
						<>
							<p style={{ marginBottom: "0.75rem" }}>
								Doomscrolling works because it&apos;s easy to start and hard to notice while it&apos;s
								happening. It&apos;s not just about willpower. These systems are designed to keep your
								attention.
							</p>
							<p style={{ marginBottom: "0.75rem" }}>
								You do not need to stop using your phone completely. But noticing the moment before you
								open it &mdash; that matters.
							</p>
							<p style={{ marginBottom: "0.5rem", fontSize: "0.95rem", opacity: 0.8 }}>
								Next time you reach for your phone automatically: <em>pause for 5 seconds.</em>
							</p>
							<p style={{ marginBottom: "0.5rem", fontSize: "0.95rem", opacity: 0.8 }}>Ask yourself:</p>
							<p
								style={{
									marginBottom: "0.75rem",
									fontSize: "1.05rem",
									opacity: 0.9,
									fontStyle: "italic",
								}}
							>
								&ldquo;What am I looking for right now?&rdquo;
							</p>
							<p style={{ marginBottom: "0.75rem", fontStyle: "italic" }}>
								This loop is hard to notice while you&apos;re inside it.
							</p>

							<button
								onClick={() => setShowMore(false)}
								style={{
									background: "none",
									border: "none",
									color: "var(--color-accent)",
									cursor: "pointer",
									fontSize: "0.85rem",
									padding: 0,
									marginBottom: "1rem",
								}}
							>
								Show less
							</button>
						</>
					)}
				</div>

				<div style={{ flex: "1", overflowY: "auto" }}>
					<div
						style={{
							borderLeft: isMobile ? "none" : "1px solid rgba(255,255,255,0.1)",
							borderTop: isMobile ? "1px solid rgba(255,255,255,0.1)" : "none",
							paddingLeft: isMobile ? 0 : "1.5rem",
							paddingTop: isMobile ? "1.5rem" : 0,
						}}
					>
						{aggregated && <ComparisonSection userStats={userStats} aggregated={aggregated} />}

						{fetchError && (
							<p style={{ fontSize: "0.8rem", opacity: 0.3, textAlign: "center", marginBottom: "2rem" }}>
								Comparison data temporarily unavailable
							</p>
						)}
					</div>
				</div>
			</div>

			<div
				style={{
					display: "flex",
					flexDirection: isMobile ? "column" : "row",
					gap: isMobile ? "0.75rem" : "1rem",
					justifyContent: "center",
					paddingTop: "1rem",
					flexShrink: 0,
				}}
			>
				<button
					onClick={handleGoBack}
					style={{
						padding: "0.75rem 2rem",
						fontSize: "1rem",
						cursor: "pointer",
						background: "transparent",
						border: "1px solid rgba(255,255,255,0.3)",
						color: "rgba(255,255,255,0.7)",
						borderRadius: "4px",
						width: isMobile ? "100%" : undefined,
						textAlign: "center",
					}}
				>
					Go Back
				</button>
				<button
					onClick={handleRestart}
					style={{
						padding: "0.75rem 2rem",
						fontSize: "1rem",
						cursor: "pointer",
						// background: "#e0e0e0",
						// border: "1px solid #e0e0e0",
						// color: "#1a1a1a",
						background: "transparent",
						border: "1px solid rgba(255,255,255,0.3)",
						color: "rgba(255,255,255,0.7)",
						borderRadius: "4px",
						width: isMobile ? "100%" : undefined,
						textAlign: "center",
					}}
				>
					Restart experience
				</button>
				<button
					onClick={() =>
						window.open(
							"https://docs.google.com/forms/d/e/1FAIpQLSdRME4j6yCDipjKoiHAezIJRmixouqu1KpwJ7cZcpipXT2RaQ/viewform?usp=publish-editor",
							"_blank",
						)
					}
					style={{
						padding: "0.75rem 2rem",
						fontSize: "1rem",
						cursor: "pointer",
						background: "var(--color-accent)",
						border: "1px solid var(--color-accent)",
						color: "#fff",
						borderRadius: "4px",
						width: isMobile ? "100%" : undefined,
						textAlign: "center",
					}}
				>
					Fill out survey
				</button>
			</div>
		</div>
	);
}
