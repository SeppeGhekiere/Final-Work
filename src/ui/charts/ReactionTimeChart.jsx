function fmtTime(ms) {
	const s = Math.round(ms / 1000);
	if (s < 60) return `${s}s`;
	const m = Math.floor(s / 60);
	const sec = s % 60;
	return sec ? `${m}m ${sec}s` : `${m}m`;
}

function niceTicks(maxVal) {
	const raw = maxVal / 1000;
	const step = raw <= 30 ? 5 : raw <= 60 ? 15 : raw <= 180 ? 30 : raw <= 600 ? 60 : 120;
	const ticks = [];
	for (let v = 0; v <= raw + step; v += step) {
		ticks.push(v * 1000);
	}
	return ticks;
}

export default function ReactionTimeChart({ clickTimes }) {
	if (!clickTimes || clickTimes.length < 2) return null;

	const pad = { top: 30, right: 30, bottom: 40, left: 65 };
	const width = 500;
	const height = 220;
	const plotW = width - pad.left - pad.right;
	const plotH = height - pad.top - pad.bottom;

	const dataMax = Math.max(...clickTimes);
	const maxTime = Math.ceil(dataMax / 1000) * 1000 * 1.15;

	const yScale = (t) => pad.top + plotH - (Math.min(t, maxTime) / maxTime) * plotH;
	const xScale = (i) => pad.left + (i / (clickTimes.length - 1)) * plotW;

	const points = clickTimes.map((t, i) => `${xScale(i)},${yScale(t)}`).join(" ");
	const ticks = niceTicks(maxTime);

	return (
		<div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
			<p style={{ fontSize: "0.85rem", opacity: 0.6, marginBottom: "0.5rem" }}>Time per Choice:</p>
			<svg viewBox={`0 0 ${width} ${height}`} style={{ width: "60%", height: "auto", overflow: "visible" }}>
				{ticks.map((tick) => (
					<g key={tick}>
						<line
							x1={pad.left}
							y1={yScale(tick)}
							x2={width - pad.right}
							y2={yScale(tick)}
							stroke="rgba(255,255,255,0.08)"
							strokeDasharray="3 3"
						/>
						<text
							x={pad.left - 8}
							y={yScale(tick) + 3}
							fontSize="10"
							fill="rgba(255,255,255,0.4)"
							textAnchor="end"
						>
							{fmtTime(tick)}
						</text>
					</g>
				))}

				<line
					x1={pad.left}
					y1={pad.top}
					x2={pad.left}
					y2={height - pad.bottom}
					stroke="rgba(255,255,255,0.2)"
				/>
				<line
					x1={pad.left}
					y1={height - pad.bottom}
					x2={width - pad.right}
					y2={height - pad.bottom}
					stroke="rgba(255,255,255,0.2)"
				/>

				<polyline
					fill="none"
					stroke="#e0e0e0"
					strokeWidth="2"
					strokeLinejoin="round"
					strokeLinecap="round"
					points={points}
				/>

				{clickTimes.map((time, i) => {
					const cx = xScale(i);
					const cy = yScale(time);
					return (
						<g key={i}>
							<circle cx={cx} cy={cy} r="4" fill="#e0e0e0" />
							<text x={cx} y={cy - 8} fontSize="9" fill="rgba(255,255,255,0.5)" textAnchor="middle">
								{fmtTime(time)}
							</text>
						</g>
					);
				})}
			</svg>
		</div>
	);
}
