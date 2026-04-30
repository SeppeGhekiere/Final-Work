// scenes.js
export const scenes = {
	scene1: {
		id: "scene1",
		lines: [
			{ text: "It’s quiet.", pauseAfter: 500 },
			{ text: "Not in a good way.", pauseAfter: 600 },
			{ text: "Just… nothing happening.", pauseAfter: 800 },
			{ text: "There was something you were going to do.", pauseAfter: 900 },
			{ text: "…you can’t quite remember what.", pauseAfter: 1000 },
			{ text: "Your phone lights up.", pauseAfter: 700 },
			{ text: "You reach for it without really deciding to.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Check it quickly", effects: { time_loss: 2 }, next: "scene2" },
			{ text: "Ignore it", effects: { tension: 1 }, next: "scene2" },
			{ text: "Turn on the TV", effects: { time_loss: 1 }, next: "scene2" },
			{ text: "Try to remember", effects: { awareness: 1 }, next: "scene2" },
		],
	},

	scene2: {
		id: "scene2",
		lines: [
			{ text: "It’s probably nothing.", pauseAfter: 600 },
			{ text: "But it could be something.", pauseAfter: 800 },
			{ text: "The screen lights up again.", pauseAfter: 700 },
			{ text: "You look at it this time.", pauseAfter: 800 },
			{ text: "You reach for it without really deciding to.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Open it", effects: { time_loss: 2 }, next: "scene3" },
			{ text: "Wait a bit", effects: { tension: 1 }, next: "scene3" },
			{ text: "Flip it over", effects: { resistance: 1 }, next: "scene3" },
			{ text: "Stand up", effects: { awareness: 1 }, next: "scene3" },
		],
	},
	scene3: {
		id: "scene3",

		lines: [
			{ text: "Just a quick look.", pauseAfter: 700 },
			{ text: "", pauseAfter: 500 },
			{ text: "Nothing special.", pauseAfter: 800 },
			{ text: "", pauseAfter: 600 },
			{ text: "You scroll.", pauseAfter: 900 },
			{ text: "", pauseAfter: 500 },
			{ text: "A video. A post. Something else.", pauseAfter: 1000 },
			{ text: "", pauseAfter: 700 },
			{ text: "You pause for a second.", pauseAfter: 800 },
			{ text: "", pauseAfter: 600 },
			{ text: "What was the last thing you just saw?", pauseAfter: 0 },
		],

		choices: [
			{
				text: "Keep scrolling",
				effects: { time_loss: 3 },
				next: "scene4",
			},
			{
				text: "Try to remember",
				effects: { awareness: 2 },
				next: "scene4",
			},
			{
				text: "Scroll back up",
				effects: { tension: 1 },
				next: "scene4",
			},
			{
				text: "Close the app",
				effects: { resistance: 2 },
				next: "scene4",
			},
		],
	},
	scene4: {
		id: "scene4",
		lines: [
			{ text: "One thing leads to another.", pauseAfter: 800 },
			{ text: "You’re not really choosing anymore.", pauseAfter: 1000 },
			{ text: "Just… reacting.", pauseAfter: 1200 },
			{ text: "It doesn’t feel like long.", pauseAfter: 1200 },
			{ text: "But it is.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Keep going", effects: { time_loss: 3 }, next: "scene5" },
			{ text: "Stop now", effects: { resistance: 2 }, next: "scene5" },
			{ text: "Just one more", effects: { time_loss: 3 }, next: "scene5" },
			{ text: "Put it down", effects: { awareness: 2 }, next: "scene5" },
		],
	},

	scene5: {
		id: "scene5",
		lines: [
			{ text: "You didn’t mean to open it again.", pauseAfter: 900 },
			{ text: "But you did.", pauseAfter: 800 },
			{ text: "It’s familiar now.", pauseAfter: 1000 },
			{ text: "Almost automatic.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Keep scrolling", effects: { time_loss: 2 }, next: "scene6" },
			{ text: "Close the app", effects: { resistance: 2 }, next: "scene6" },
			{ text: "Switch to something else", effects: { tension: 1 }, next: "scene6" },
			{ text: "Put phone away", effects: { awareness: 2 }, next: "scene6" },
		],
	},

	scene6: {
		id: "scene6",
		lines: [
			{ text: "A few minutes pass.", pauseAfter: 900 },
			{ text: "Maybe more.", pauseAfter: 900 },
			{ text: "It’s hard to tell anymore.", pauseAfter: 1000 },
			{ text: "You weren’t counting.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Just a bit longer", effects: { time_loss: 3 }, next: "scene7" },
			{ text: "Check the time", effects: { awareness: 1 }, next: "scene7" },
			{ text: "Switch apps", effects: { tension: 2 }, next: "scene7" },
			{ text: "Stop now", effects: { resistance: 2 }, next: "scene7" },
		],
	},

	scene7: {
		id: "scene7",
		lines: [
			{ text: "You notice it now.", pauseAfter: 900 },
			{ text: "The way it pulls you back.", pauseAfter: 1000 },
			{ text: "Even when you don’t want it to.", pauseAfter: 1100 },
			{ text: "You keep reaching for it anyway.", pauseAfter: 0 },
		],
		choices: [
			{ text: "I’ll stop after this", effects: { time_loss: 3 }, next: "scene8" },
			{ text: "Delete it", effects: { resistance: 3 }, next: "scene8" },
			{ text: "One more scroll", effects: { time_loss: 2 }, next: "scene8" },
			{ text: "Put it down", effects: { awareness: 3 }, next: "scene8" },
		],
	},

	scene8: {
		id: "scene8",
		lines: [
			{ text: "You pause longer this time.", pauseAfter: 1000 },
			{ text: "Not because you decided to.", pauseAfter: 1100 },
			{ text: "Because something feels… off.", pauseAfter: 1200 },
			{ text: "Like you’re not fully here.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Check again anyway", effects: { time_loss: 3 }, next: "scene9" },
			{ text: "Put phone down properly", effects: { resistance: 3 }, next: "scene9" },
			{ text: "Do something else", effects: { awareness: 2 }, next: "scene9" },
			{ text: "Ignore the feeling", effects: { tension: 2 }, next: "scene9" },
		],
	},

	scene9: {
		id: "scene9",
		lines: [
			{ text: "You tell yourself it’s fine.", pauseAfter: 900 },
			{ text: "Just a habit.", pauseAfter: 900 },
			{ text: "Something everyone does.", pauseAfter: 1000 },
			{ text: "But it doesn’t feel like that anymore.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Keep scrolling", effects: { time_loss: 3 }, next: "scene10" },
			{ text: "Take a break", effects: { resistance: 3 }, next: "scene10" },
			{ text: "Do something else", effects: { awareness: 2 }, next: "scene10" },
			{ text: "Just one more minute", effects: { time_loss: 2 }, next: "scene10" },
		],
	},

	scene10: {
		id: "scene10",
		lines: [
			{ text: "It’s harder to stop now.", pauseAfter: 1000 },
			{ text: "Not impossible.", pauseAfter: 900 },
			{ text: "Just harder.", pauseAfter: 1000 },
			{ text: "You notice the pattern.", pauseAfter: 900 },
			{ text: "But noticing isn’t the same as changing.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Continue", effects: { time_loss: 3 }, next: "scene11" },
			{ text: "Try to stop", effects: { resistance: 3 }, next: "scene11" },
			{ text: "Step away", effects: { awareness: 3 }, next: "scene11" },
			{ text: "Ignore it", effects: { tension: 2 }, next: "scene11" },
		],
	},
};
