import { useState, useEffect } from "react";
import { playKnock, ensureAudioContext } from "../hooks/useSound";
import { facts } from "../events/factData";
import { analyzePersonalStats } from "../events/personalStats";

export default function MetaOverlay({ mode, onComplete }) {
	const [step, setStep] = useState(0);
	const [buttonEnabled, setButtonEnabled] = useState(false);
	const [factIndex, setFactIndex] = useState(0);
	const [dimmed, setDimmed] = useState(false);

	// ─── Reality Check ──────────────────────────────────
	useEffect(() => {
		if (mode !== "reality_check") return;

		let mounted = true;
		ensureAudioContext();

		const tKnock = setTimeout(() => {
			if (mounted) playKnock();
		}, 2000);

		const t2 = setTimeout(() => {
			if (mounted) {
				setDimmed(true);
				setStep(1);
			}
		}, 4500);

		const t3 = setTimeout(() => {
			if (mounted) setStep(2);
		}, 6500);

		const t4 = setTimeout(() => {
			if (mounted) setButtonEnabled(true);
		}, 8500);

		return () => {
			mounted = false;
			clearTimeout(tKnock);
			clearTimeout(t2);
			clearTimeout(t3);
			clearTimeout(t4);
		};
	}, [mode]);

	// ─── Personal Stats ─────────────────────────────────
	useEffect(() => {
		if (mode !== "personal_stats") return;
		const t = setTimeout(() => setButtonEnabled(true), 3000);
		return () => clearTimeout(t);
	}, [mode]);

	// ─── Cold Facts ─────────────────────────────────────
	useEffect(() => {
		if (mode !== "cold_facts") return;
		const t = setTimeout(() => setButtonEnabled(true), 4000);
		return () => clearTimeout(t);
	}, [mode]);

	// ─── Thank You ──────────────────────────────────────
	useEffect(() => {
		if (mode !== "thank_you") return;
		const t = setTimeout(() => setButtonEnabled(true), 3500);
		return () => clearTimeout(t);
	}, [mode]);

	const handleContinue = () => {
		onComplete();
	};

	const handleNextFact = () => {
		if (factIndex < facts.length - 1) {
			setFactIndex((i) => i + 1);
			setButtonEnabled(false);
			setTimeout(() => setButtonEnabled(true), 2500);
		} else {
			handleContinue();
		}
	};

	// ─── Render: Thank You ──────────────────────────────
	if (mode === "thank_you") {
		return (
			<div className="meta-overlay stats-overlay" style={{ textAlign: "center" }}>
				<div className="stats-content" style={{ textAlign: "center" }}>
					<h1
						style={{
							fontSize: "3rem",
							letterSpacing: "0.2em",
							fontWeight: "300",
							marginBottom: "1rem",
							opacity: 0.9,
						}}
					>
						THE LOOP
					</h1>
					<p
						style={{
							fontSize: "1.1rem",
							opacity: 0.6,
							marginBottom: "3rem",
							fontStyle: "italic",
						}}
					>
						Thank you for noticing.
					</p>

					<p style={{ fontSize: "0.9rem", opacity: 0.4, marginBottom: "4rem" }}>
						A project by Ghekiere Seppe
					</p>

					{buttonEnabled && (
						<button className="meta-continue-btn" onClick={handleContinue}>
							See Results
						</button>
					)}
				</div>
			</div>
		);
	}

	// ─── Render: Reality Check ──────────────────────────
	if (mode === "reality_check") {
		return (
			<div className="meta-overlay reality-overlay">
				{dimmed && <div className="reality-dim-overlay" />}
				<div className="reality-content">
					{step >= 1 && (
						<p className="reality-line" key="l1">
							You finally looked away.
						</p>
					)}
					{step >= 2 && (
						<>
							<p className="reality-line" key="l2">
								How long were you scrolling?
							</p>
							<p className="reality-sub" key="sub">
								Most people don&apos;t notice how long they&apos;ve been scrolling until something
								interrupts them.
							</p>
						</>
					)}
					{buttonEnabled && (
						<button className="meta-continue-btn" onClick={handleContinue}>
							Are you sure you want to continue?
						</button>
					)}
				</div>
			</div>
		);
	}

	// ─── Render: Personal Stats ─────────────────────────
	if (mode === "personal_stats") {
		const stats = analyzePersonalStats();

		return (
			<div className="meta-overlay stats-overlay">
				<div className="stats-content">
					{stats.totalChoices > 0 && (
						<p className="stats-line">
							You chose to continue scrolling <strong>{stats.scrollChoices}</strong> times.
						</p>
					)}
					{stats.totalChoices > 0 && (
						<p className="stats-line">
							Average decision time:{" "}
							<strong>
								{stats.avgReactionTime.minutes}m {stats.avgReactionTime.seconds}s
							</strong>
						</p>
					)}
					{stats.impulsiveChoices > stats.totalChoices * 0.5 && (
						<p className="stats-line">Most of your choices were made impulsively.</p>
					)}
					{stats.hesitationTrend === "less" && (
						<p className="stats-line">You hesitated less and less over time.</p>
					)}
					{stats.hesitationTrend === "more" && (
						<p className="stats-line">You hesitated more as time went on.</p>
					)}
					{buttonEnabled && (
						<button className="meta-continue-btn" onClick={handleContinue}>
							Continue
						</button>
					)}
				</div>
			</div>
		);
	}

	// ─── Render: Cold Facts ─────────────────────────────
	if (mode === "cold_facts") {
		const fact = facts[factIndex];

		return (
			<div className="meta-overlay facts-overlay">
				<div className="facts-content">
					<p className="fact-text" key={factIndex}>
						{fact.text}
					</p>
					{fact.footer && (
						<p className="fact-footer" key={`f${factIndex}`}>
							{fact.footer}
						</p>
					)}
					{buttonEnabled && (
						<button
							className="meta-continue-btn"
							onClick={factIndex < facts.length - 1 ? handleNextFact : handleContinue}
						>
							{factIndex < facts.length - 1 ? "Next" : "Continue"}
						</button>
					)}
				</div>
			</div>
		);
	}

	return null;
}
