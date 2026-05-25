export default function ReactionTimeChart({ clickTimes }) {
  if (!clickTimes || clickTimes.length < 2) return null;

  const width = 500;
  const height = 150;
  const padding = 20;
  const maxTime = 4000;

  const points = clickTimes
    .map((time, i) => {
      const x = padding + (i / (clickTimes.length - 1)) * (width - 2 * padding);
      const y = height - padding - (Math.min(time, maxTime) / maxTime) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
      <p style={{ fontSize: "0.8rem", opacity: 0.6, marginBottom: "0.5rem" }}>Your Reaction Pacing:</p>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
        <rect
          x={padding}
          y={padding}
          width={width - 2 * padding}
          height={(height - 2 * padding) * (800 / maxTime)}
          fill="rgba(255, 0, 0, 0.05)"
          transform={`translate(0, ${(height - 2 * padding) * (1 - 800 / maxTime)})`}
        />
        <rect
          x={padding}
          y={padding}
          width={width - 2 * padding}
          height={(height - 2 * padding) * (1500 / maxTime)}
          fill="rgba(0, 255, 0, 0.05)"
        />
        <text x={padding + 5} y={height - padding - 5} fontSize="8" fill="rgba(255, 100, 100, 0.6)">
          Mindless / Reactive
        </text>
        <text x={padding + 5} y={padding + 12} fontSize="8" fill="rgba(100, 255, 100, 0.6)">
          Mindful / Hesitant
        </text>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.2)" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(255,255,255,0.2)" />
        <polyline fill="none" stroke="#e0e0e0" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={points} />
        {clickTimes.map((time, i) => {
          const x = padding + (i / (clickTimes.length - 1)) * (width - 2 * padding);
          const y = height - padding - (Math.min(time, maxTime) / maxTime) * (height - 2 * padding);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill={time < 800 ? "#ff4444" : time > 2500 ? "#44ff44" : "#e0e0e0"}
            />
          );
        })}
      </svg>
    </div>
  );
}
