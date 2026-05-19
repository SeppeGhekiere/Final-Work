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
// LOGGING
// ─────────────────────────────
app.post("/log", (req, res) => {
	const data = {
		time: new Date().toISOString(),
		body: req.body,
	};

	fs.appendFileSync("logs.json", JSON.stringify(data) + "\n");

	res.send({ status: "ok" });
});

// ─────────────────────────────
// SESSION TRACKING
// ─────────────────────────────
const sessions = new Map();
// sessionId → lastSeen

app.post("/heartbeat", (req, res) => {
	const { sessionId } = req.body;

	if (!sessionId) return res.status(400).send("missing sessionId");

	sessions.set(sessionId, Date.now());

	res.json({ ok: true });
});

// cleanup stale sessions
setInterval(() => {
	const now = Date.now();

	for (const [id, lastSeen] of sessions.entries()) {
		if (now - lastSeen > 30000) {
			sessions.delete(id);
		}
	}
}, 10000);

// ─────────────────────────────
// ACTIVE USERS (REAL SESSIONS)
// ─────────────────────────────
app.get("/active-users", (req, res) => {
	res.json({ active: sessions.size });
});

// ─────────────────────────────
// STATS
// ─────────────────────────────
app.get("/stats", (req, res) => {
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

		if (body.choice) {
			choiceCounts[body.choice] = (choiceCounts[body.choice] || 0) + 1;
		}

		if (body.scene) {
			sceneCounts[body.scene] = (sceneCounts[body.scene] || 0) + 1;
		}

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

// ─────────────────────────────
// HEALTH
// ─────────────────────────────
app.get("/health", (req, res) => {
	res.send("backend running");
});

// ─────────────────────────────
// START
// ─────────────────────────────
app.listen(3001, () => {
	console.log("Backend running on port 3001");
});
