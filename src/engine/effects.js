// Simulation Profiles - control UI behavior based on player state
const simulationProfiles = {
	neutral: {
		textSpeed: 1,
		blur: 0,
		inputDelay: 0,
		choiceStability: 1,
		autoScroll: false,
	},
	deep_scroll: {
		textSpeed: 1.3,
		blur: 0.4,
		inputDelay: 200,
		choiceStability: 0.6,
		autoScroll: true,
	},
	aware_loop: {
		textSpeed: 1.1,
		blur: 0.2,
		inputDelay: 300,
		choiceStability: 0.7,
		autoScroll: false,
	},
	breaking: {
		textSpeed: 0.9,
		blur: 0,
		inputDelay: 0,
		choiceStability: 1,
		autoScroll: false,
	},
	uneasy: {
		textSpeed: 1,
		blur: 0.1,
		inputDelay: 150,
		choiceStability: 0.85,
		autoScroll: false,
	},
};

export function getSimulationProfile(state) {
	if (state.time_loss >= 10 && state.awareness <= 3) return "deep_scroll";
	if (state.time_loss >= 8 && state.awareness >= 5) return "aware_loop";
	if (state.resistance >= 8 && state.awareness >= 5) return "breaking";
	if (state.tension >= 6) return "uneasy";
	return "neutral";
}

export function getEffects(state) {
	const profile = getSimulationProfile(state);
	const sim = simulationProfiles[profile];

	const t = state.time_loss;
	const tension = state.tension;
	const awareness = state.awareness;
	const resistance = state.resistance;

	return {
		// Simulation profile values
		textSpeed: sim.textSpeed,
		blur: sim.blur + Math.min(Math.pow(t, 1.2) * 0.08, 4),
		inputDelay: sim.inputDelay,
		choiceStability: sim.choiceStability,
		autoScroll: sim.autoScroll,

		// Legacy effects (lowered thresholds)
		textDelay: 2 + Math.pow(t, 1.1) * 3,
		choiceInstability: t > 3,
		flicker: t > 5,
		sleepiness: Math.min(Math.pow(t, 1.2) * 0.05, 0.75),
		drift: Math.min(Math.pow(tension + 1, 1.1) * 0.06, 3),

		// === TIME_LOSS effects (time distortion) ===
		timeJump: t >= 8,
		dialogueSkip: Math.min(t / 20, 0.3),

		// === TENSION effects (anxiety/restlessness) ===
		jitter: Math.min(tension * 0.1, 0.5),
		screenShake: tension >= 5,
		visualNoise: Math.min(tension / 20, 0.4),
		transitionSpeed: 1 + tension * 0.05,

		// === AWARENESS effects (clarity - LOW = bad) ===
		confusion: Math.max(0, 1 - (awareness / 10)),
		repeatDialogue: awareness <= 3,
		memoryDecay: Math.max(0, Math.min((10 - awareness) / 10, 1)),

		// === RESISTANCE effects (ability to choose - LOW = bad) ===
		autoSelect: resistance <= 1,
		overrideChoices: resistance <= 2,
		resistanceChoiceStability: Math.max(0.3, resistance / 10),
		resistanceInputDelay: resistance <= 2 ? 1000 : (resistance <= 5 ? 500 : 0),

		// Profile name for debugging
		profile: profile,
	};
}

export function getEnding(state) {
	if (state.time_loss >= 12 && state.awareness <= 3) return "endingA";
	if (state.time_loss >= 10 && state.awareness >= 5) return "endingB";
	if (state.resistance >= 8 && state.awareness >= 5) return "endingC";
	if (state.tension >= 6) return "endingD";
	return "endingB"; // fallback
}
