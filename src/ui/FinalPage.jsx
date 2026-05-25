import { useIsMobile } from "../hooks/useIsMobile";

export default function FinalPage({ onResults, onHome }) {
	const isMobile = useIsMobile();

	return (
		<div className="meta-overlay" style={{ background: "var(--color-bg)" }}>
			<div className="stats-content" style={{ textAlign: "center" }}>
				<p style={{ fontSize: "1.2rem", fontWeight: 300, marginBottom: "2rem", opacity: 0.8 }}>
					You&apos;ve reached the end of this experience.
				</p>
				<p style={{ fontSize: "0.9rem", opacity: 0.5, marginBottom: "3rem" }}>What would you like to do?</p>
				<div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
					<button
						onClick={() =>
							window.open(
								"https://docs.google.com/forms/d/e/1FAIpQLSdRME4j6yCDipjKoiHAezIJRmixouqu1KpwJ7cZcpipXT2RaQ/viewform?usp=publish-editor",
								"_blank",
							)
						}
						style={{
							padding: "0.75rem 1rem",
							fontSize: "1rem",
							cursor: "pointer",
							background: "var(--color-accent)",
							border: "none",
							color: "#fff",
							borderRadius: "6px",
							textTransform: "uppercase",
							letterSpacing: "0.1em",
							fontWeight: 600,
							minWidth: "200px",
						}}
					>
						Fill out survey
					</button>
					<button
						className="meta-continue-btn"
						onClick={onResults}
						style={{
							padding: "0.75rem 2rem",
							fontSize: "1rem",
							cursor: "pointer",
							background: "var(--color-accent)",
							border: "none",
							color: "#fff",
							borderRadius: "6px",
							textTransform: "uppercase",
							letterSpacing: "0.1em",
							fontWeight: 600,
							minWidth: "200px",
						}}
					>
						View Results
					</button>
					<button
						className="meta-continue-btn"
						onClick={onHome}
						style={{
							padding: "0.75rem 2rem",
							fontSize: "1rem",
							cursor: "pointer",
							background: "transparent",
							border: "1px solid rgba(255,255,255,0.3)",
							color: "rgba(255,255,255,0.7)",
							borderRadius: "4px",
							minWidth: "200px",
						}}
					>
						Homepage
					</button>
				</div>
			</div>
		</div>
	);
}
