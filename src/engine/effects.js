// Simulation Profiles - control UI behavior based on player state
const simulationProfiles = {
	neutral: {
		textSpeed: 1,
		blur: 0,
		textJitter: 0,
		inputDelay: 0,
		choiceFade: 0,
		choiceStability: 1,
		disappearChance: 0,
		autoScroll: false,
	},
	deep_scroll: {
		textSpeed: 1.3,
		blur: 3,
		textJitter: 0.5,
		inputDelay: 250,
		choiceFade: 0.3,
		choiceStability: 0.6,
		disappearChance: 0.2,
		autoScroll: true,
	},
	aware_loop: {
		textSpeed: 1.1,
		blur: 1,
		textJitter: 0.3,
		inputDelay: 350,
		choiceFade: 0.2,
		choiceStability: 0.7,
		disappearChance: 0.1,
		autoScroll: false,
	},
	breaking: {
		textSpeed: 0.9,
		blur: 0,
		textJitter: 0,
		inputDelay: 0,
		choiceFade: 0,
		choiceStability: 1,
		disappearChance: 0,
		autoScroll: false,
	},
	uneasy: {
		textSpeed: 1,
		blur: 1,
		textJitter: 0.2,
		inputDelay: 150,
		choiceFade: 0.1,
		choiceStability: 0.85,
		disappearChance: 0.05,
		autoScroll: false,
	},
};

// Scene-specific effect overrides
const sceneEffects = {
	scene3_scroll: {
		override: {
			blur: 1,
			choiceFade: 0.1,
		},
	},
	scene4_loop: {
		override: {
			blur: 2,
			inputDelay: 200,
		},
	},
	scene6: {
		override: {
			blur: 3,
			textJitter: 0.4,
			disappearChance: 0.15,
		},
	},
	scene7: {
		override: {
			inputDelay: 400,
			textJitter: 0.2,
		},
	},
	scene8: {
		override: {
			disappearChance: 0.3,
			inputDelay: 500,
		},
	},
	scene9: {
		override: {
			choiceFade: 0.4,
			blur: 2,
		},
	},
	scene10: {
		override: {
			inputDelay: 800,
			disappearChance: 0.5,
		},
	},
};

export function getSceneOverride(sceneId) {
	return sceneEffects[sceneId]?.override || {};
}

export function getSimulationProfile(state) {
	// Your new profile logic
	if (state.time_loss > 12 && state.awareness < 3) return "deep_scroll";
	if (state.time_loss > 10 && state.awareness >= 4) return "aware_loop";
	if (state.resistance > 8 && state.awareness >= 5) return "breaking";
	if (state.tension > 6) return "uneasy";
	return "neutral";
}

export function getEffects(state, forcedProfile = null) {
	const profile = forcedProfile || getSimulationProfile(state);
	const sim = simulationProfiles[profile];
	
	// Get scene-specific overrides
	const sceneId = state.sceneId || "neutral";
	const sceneOverride = getSceneOverride(sceneId);

	const t = state.time_loss;
	const tension = state.tension;
	const awareness = state.awareness;
	const resistance = state.resistance;

	// Merge base profile with scene overrides
	const merged = { ...sim, ...sceneOverride };

	return {
		// Simulation profile values (with scene overrides applied)
		textSpeed: merged.textSpeed,
		blur: (merged.blur || 0) + Math.min(Math.pow(t, 1.2) * 0.08, 4),
		textJitter: merged.textJitter || 0,
		inputDelay: merged.inputDelay || 0,
		choiceFade: merged.choiceFade || 0,
		choiceStability: sim.choiceStability, // Keep legacy choiceStability
		disappearChance: merged.disappearChance || 0,
		autoScroll: merged.autoScroll,

		// Legacy effects
		choiceInstability: t > 3,
		sleepiness: Math.min(Math.pow(t, 1.2) * 0.05, 0.75),
		drift: Math.min(Math.pow(tension + 1, 1.1) * 0.06, 3),

		// === TIME_LOSS effects (time distortion) ===
		timeJump: t >= 8,

		// === TENSION effects (anxiety/restlessness) ===
		jitter: Math.min(tension * 0.1, 0.5),
		screenShake: tension >= 5,
		visualNoise: Math.min(tension / 20, 0.4),

		// === AWARENESS effects (clarity - LOW = bad) ===
		memoryDecay: Math.max(0, Math.min((10 - awareness) / 10, 1)),

		// === RESISTANCE effects (ability to choose - LOW = bad) ===
		autoSelect: resistance <= 1,
		overrideChoices: resistance <= 2,

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
