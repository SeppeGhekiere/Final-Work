const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

app.use((req, res, next) => {
	const start = Date.now();
	res.on("finish", () => {
		const duration = Date.now() - start;
		console.log(`[API] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
	});

	next();
});

// ─────────────────────────────
// ROUTER (mounted at / and /api)
// ─────────────────────────────
const router = express.Router();

// LOGGING
router.post("/log", (req, res) => {
	const data = {
		time: new Date().toISOString(),
		body: req.body,
	};
	fs.appendFileSync("logs.json", JSON.stringify(data) + "\n");
	res.send({ status: "ok" });
});

// STATS
router.get("/stats", (req, res) => {
	const raw = fs.readFileSync("logs.json", "utf-8").trim();

	if (!raw) {
		return res.json({
			totalEvents: 0,
			choiceCounts: {},
			sceneCounts: {},
			avgReactionTime: { ms: 0, seconds: 0, minutes: 0 },
		});
	}

	const logs = raw
		.split("\n")
		.filter(Boolean)
		.map((line) => JSON.parse(line));
	const totalEvents = logs.length;
	const choiceCounts = {};
	const sceneCounts = {};
	let totalReactionTime = 0;
	let reactionCount = 0;

	for (const entry of logs) {
		const { body } = entry;
		if (body.choice) choiceCounts[body.choice] = (choiceCounts[body.choice] || 0) + 1;
		if (body.scene) sceneCounts[body.scene] = (sceneCounts[body.scene] || 0) + 1;
		if (body.reactionTime != null) {
			totalReactionTime += body.reactionTime;
			reactionCount++;
		}
	}

	const ms = reactionCount ? Math.round(totalReactionTime / reactionCount) : 0;

	res.json({
		totalEvents,
		choiceCounts,
		sceneCounts,
		avgReactionTime: {
			ms,
			seconds: +(ms / 1000).toFixed(2),
			minutes: +(ms / 60000).toFixed(2),
		},
	});
});

// RESULTS / AGGREGATED STATS
function getEndingFromState(state) {
	if (!state) return "endingB";
	if (state.time_loss >= 12 && state.awareness <= 3) return "endingA";
	if (state.time_loss >= 10 && state.awareness >= 5) return "endingB";
	if (state.resistance >= 8 && state.awareness >= 5) return "endingC";
	if (state.tension >= 6) return "endingD";
	return "endingB";
}

router.get("/results/stats", (req, res) => {
	const raw = fs.readFileSync("logs.json", "utf-8").trim();

	if (!raw) {
		const empty = { totalSessions: 0, topEnding: null, choiceMatchPercent: null, endingPercent: null, endingDistribution: {} };
		return res.json(empty);
	}

	const logs = raw
		.split("\n")
		.filter(Boolean)
		.map((line) => JSON.parse(line));

	const choiceEvents = logs.filter((entry) => entry.body && entry.body.scene && entry.body.choice && entry.body.state);

	const sessionMap = new Map();
	for (const entry of choiceEvents) {
		const sid = entry.body.sessionId;
		if (!sid) continue;
		if (!sessionMap.has(sid)) sessionMap.set(sid, []);
		sessionMap.get(sid).push(entry.body);
	}

	const totalSessions = sessionMap.size;
	const endingCounts = {};
	for (const events of sessionMap.values()) {
		events.sort((a, b) => a.timestamp - b.timestamp);
		const ending = getEndingFromState(events[events.length - 1].state);
		endingCounts[ending] = (endingCounts[ending] || 0) + 1;
	}

	let topEnding = null;
	let topCount = 0;
	for (const [ending, count] of Object.entries(endingCounts)) {
		if (count > topCount) {
			topCount = count;
			topEnding = ending;
		}
	}

	let totalMatchRate = 0;
	let sessionCount = 0;
	const sessionsList = [...sessionMap.values()];

	for (let i = 0; i < sessionsList.length; i++) {
		const choicesA = new Set(sessionsList[i].map((e) => e.choice));
		if (choicesA.size === 0) continue;
		let matchCount = 0;
		for (const choice of choicesA) {
			const foundElsewhere = sessionsList.some((other, j) => {
				if (i === j) return false;
				return other.some((e) => e.choice === choice);
			});
			if (foundElsewhere) matchCount++;
		}
		totalMatchRate += matchCount / choicesA.size;
		sessionCount++;
	}

	const choiceMatchPercent = totalSessions > 1 && sessionCount > 0 ? Math.round((totalMatchRate / sessionCount) * 100) : null;

	const endingPercent = topEnding && totalSessions > 0 ? Math.round(((endingCounts[topEnding] || 0) / totalSessions) * 100) : null;

	const result = {
		totalSessions,
		topEnding,
		choiceMatchPercent,
		endingPercent,
		endingDistribution: endingCounts,
	};
	res.json(result);
});
// HEALTH
router.get("/health", (req, res) => {
	res.send("backend running");
});

// ─────────────────────────────
// MOUNT — works at / and /api
// ─────────────────────────────
app.use(router);
app.use("/api", router);

// ─────────────────────────────
// START
// ─────────────────────────────
app.listen(3001, () => {
	console.log("Backend running on port 3001");
});
