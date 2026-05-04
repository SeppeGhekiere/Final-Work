// scenes.js - Reworked with branching paths and endings
export const scenes = {
	scene1: {
		id: "scene1",
		lines: [
			{ text: "It's quiet.", pauseAfter: 500 },
			{ text: "Not in a good way.", pauseAfter: 600 },
			{ text: "Just… nothing happening.", pauseAfter: 800 },
			{ text: "There was something you were going to do.", pauseAfter: 900 },
			{ text: "…you can't quite remember what.", pauseAfter: 1000 },
			{ text: "Your phone lights up.", pauseAfter: 700 },
		],
		choices: [
			{ text: "Check it quickly", effects: { time_loss: 2 }, next: "scene2a" },
			{ text: "Ignore it", effects: { tension: 1 }, next: "scene2b" },
			{ text: "Turn on the TV", effects: { distraction: 1, time_loss: 1 }, next: "scene2b" },
			{ text: "Try to remember", effects: { awareness: 1, tension: -1 }, next: "scene2b" },
		],
	},

	scene2a: {
		id: "scene2a",
		lines: [
			{ text: "Just a second.", pauseAfter: 600 },
			{ text: "You unlock it without thinking.", pauseAfter: 800 },
			{ text: "A post. A video.", pauseAfter: 900 },
			{ text: "Nothing important.", pauseAfter: 800 },
			{ text: "Still… you keep looking.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Scroll", effects: { time_loss: 2 }, next: "scene3a" },
			{ text: "Check something specific", effects: { awareness: 1, tension: 1 }, next: "scene3a" },
			{ text: "Pause for a second", effects: { tension: 1, time_loss: 1 }, next: "scene3b" },
			{ text: "Lock the phone", effects: { resistance: 2, tension: -1 }, next: "scene3b" },
		],
	},

	scene2b: {
		id: "scene2b",
		lines: [
			{ text: "You don't pick it up.", pauseAfter: 700 },
			{ text: "Not yet.", pauseAfter: 800 },
			{ text: "", pauseAfter: 500 },
			{ text: "But it stays there.", pauseAfter: 900 },
			{ text: "Waiting.", pauseAfter: 900 },
			{ text: "You think about it anyway.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Just check quickly", effects: { time_loss: 2, tension: 1 }, next: "scene3a" },
			{ text: "Ignore it again", effects: { tension: 2, awareness: 1 }, next: "scene3b" },
			{ text: "Do something else", effects: { awareness: 1, tension: -1 }, next: "scene3b" },
			{ text: "Pick it up without unlocking", effects: { tension: 1, time_loss: 1 }, next: "scene3a" },
		],
	},

	scene3a: {
		id: "scene3a",
		lines: [
			{ text: "You're in it now.", pauseAfter: 800 },
			{ text: "Scrolling without really seeing.", pauseAfter: 1000 },
			{ text: "Something passes by.", pauseAfter: 900 },
			{ text: "Then something else.", pauseAfter: 900 },
			{ text: "You pause.", pauseAfter: 800 },
			{ text: "What was the last thing you just saw?", pauseAfter: 0 },
		],
		choices: [
			{ text: "Keep scrolling", effects: { time_loss: 3, tension: 1 }, next: "scene4" },
			{ text: "Scroll back up", effects: { tension: 1, awareness: 1 }, next: "scene4" },
			{ text: "Try to remember", effects: { awareness: 2, time_loss: 1 }, next: "scene4" },
			{ text: "Close the app", effects: { resistance: 2, tension: -1 }, next: "scene4" },
		],
	},

	scene3b: {
		id: "scene3b",
		lines: [
			{ text: "You try to focus on something else.", pauseAfter: 900 },
			{ text: "It doesn't really stick.", pauseAfter: 900 },
			{ text: "", pauseAfter: 600 },
			{ text: "Your mind drifts back.", pauseAfter: 1000 },
			{ text: "To the phone.", pauseAfter: 900 },
			{ text: "You don't remember deciding to pick it up.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Open it", effects: { time_loss: 2, tension: 1 }, next: "scene4" },
			{ text: "Wait a bit longer", effects: { tension: 2, awareness: 1 }, next: "scene4" },
			{ text: "Try to focus", effects: { awareness: 2, tension: -1 }, next: "scene4" },
			{ text: "Pick it up anyway", effects: { time_loss: 2, tension: 1 }, next: "scene4" },
		],
	},

	scene4: {
		id: "scene4",
		lines: [
			{ text: "One thing leads to another.", pauseAfter: 800 },
			{ text: "You're not really choosing anymore.", pauseAfter: 1000 },
			{ text: "Just… reacting.", pauseAfter: 1200 },
			{ text: "", pauseAfter: 800 },
			{ text: "It doesn't feel like long.", pauseAfter: 1200 },
			{ text: "But it is.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Keep going", effects: { time_loss: 3, tension: 1 }, next: "scene6a" },
			{ text: "Stop now", effects: { resistance: 2, tension: -1 }, next: "scene6b" },
			{ text: "Just one more", effects: { time_loss: 3, tension: 1 }, next: "scene6a" },
			{ text: "Put it down", effects: { awareness: 2, time_loss: 1 }, next: "scene6b" },
		],
	},

	scene6a: {
		id: "scene6a",
		lines: [
			{ text: "Time passes.", pauseAfter: 1200 },
			{ text: "You don't notice when.", pauseAfter: 1000 },
			{ text: "", pauseAfter: 800 },
			{ text: "It all blends together.", pauseAfter: 1100 },
			{ text: "Nothing really sticks.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Keep scrolling", effects: { time_loss: 3, tension: 1 }, next: "scene7a" },
			{ text: "Check the time", effects: { awareness: 1, time_loss: 1 }, next: "scene7b" },
			{ text: "Scroll faster", effects: { time_loss: 2, awareness: -1 }, next: "scene7a" },
			{ text: "Try to stop", effects: { resistance: 2, tension: -1 }, next: "scene7b" },
		],
	},

	scene6b: {
		id: "scene6b",
		lines: [
			{ text: "You put it down.", pauseAfter: 900 },
			{ text: "", pauseAfter: 700 },
			{ text: "…", pauseAfter: 900 },
			{ text: "Something pulls you back.", pauseAfter: 1100 },
			{ text: "Not a thought.", pauseAfter: 900 },
			{ text: "A habit.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Pick it up again", effects: { time_loss: 2, tension: 1 }, next: "scene7a" },
			{ text: "Stay away", effects: { resistance: 3, tension: -1 }, next: "scene7b" },
			{ text: "Just check quickly", effects: { time_loss: 2, tension: 1 }, next: "scene7a" },
			{ text: "Distract yourself", effects: { awareness: 2, time_loss: 1 }, next: "scene7b" },
		],
	},

	scene7a: {
		id: "scene7a",
		lines: [
			{ text: "You're not deciding anymore.", pauseAfter: 1000 },
			{ text: "It just… keeps going.", pauseAfter: 1100 },
			{ text: "", pauseAfter: 800 },
			{ text: "You try to stop.", pauseAfter: 1000 },
			{ text: "But you're already mid-scroll.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Keep going", effects: { time_loss: 3, tension: 1 }, next: "scene8a" },
			{ text: "Stop", effects: { resistance: 2, tension: -1 }, next: "scene8b" },
			{ text: "Just one more", effects: { time_loss: 3, tension: 1 }, next: "scene8a" },
			{ text: "Look away", effects: { awareness: 2, time_loss: 1 }, next: "scene8b" },
		],
	},

	scene7b: {
		id: "scene7b",
		lines: [
			{ text: "You notice it clearly now.", pauseAfter: 1000 },
			{ text: "The loop.", pauseAfter: 900 },
			{ text: "The pull.", pauseAfter: 1000 },
			{ text: "", pauseAfter: 800 },
			{ text: "Knowing doesn't stop it.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Put it down properly", effects: { resistance: 3, tension: -1 }, next: "scene8b" },
			{ text: "Check again", effects: { time_loss: 2, tension: 1 }, next: "scene8a" },
			{ text: "Do something else", effects: { awareness: 2, time_loss: 1 }, next: "scene8b" },
			{ text: "Ignore the feeling", effects: { tension: 2, awareness: 1 }, next: "scene8a" },
		],
	},

	scene8a: {
		id: "scene8a",
		lines: [
			{ text: "It's automatic now.", pauseAfter: 1100 },
			{ text: "You don't even question it.", pauseAfter: 1100 },
			{ text: "", pauseAfter: 900 },
			{ text: "You're just… here.", pauseAfter: 1000 },
			{ text: "Scrolling.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Continue", effects: { time_loss: 3, tension: 1 }, next: "scene9" },
			{ text: "Try to stop", effects: { resistance: 2, tension: -1 }, next: "scene9" },
			{ text: "Just one more", effects: { time_loss: 3, tension: 1 }, next: "scene9" },
			{ text: "Pause", effects: { awareness: 1, time_loss: 1 }, next: "scene9" },
		],
	},

	scene8b: {
		id: "scene8b",
		lines: [
			{ text: "You pause longer this time.", pauseAfter: 1100 },
			{ text: "Really pause.", pauseAfter: 1000 },
			{ text: "", pauseAfter: 900 },
			{ text: "It feels strange.", pauseAfter: 1000 },
			{ text: "Like something's missing.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Put it away", effects: { resistance: 3, tension: -1 }, next: "scene9" },
			{ text: "Check again", effects: { time_loss: 2, tension: 1 }, next: "scene9" },
			{ text: "Sit with it", effects: { awareness: 2, tension: -1 }, next: "scene9" },
			{ text: "Distract yourself", effects: { tension: 2, awareness: 1 }, next: "scene9" },
		],
	},

	scene9: {
		id: "scene9",
		lines: [
			{ text: "You tell yourself it's fine.", pauseAfter: 900 },
			{ text: "Just a habit.", pauseAfter: 900 },
			{ text: "Something everyone does.", pauseAfter: 1000 },
			{ text: "But it doesn't feel like that anymore.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Continue", effects: { time_loss: 3 }, next: "ending" },
			{ text: "Try to stop", effects: { resistance: 3 }, next: "ending" },
			{ text: "Do something else", effects: { awareness: 2 }, next: "ending" },
			{ text: "Just one more minute", effects: { time_loss: 2 }, next: "ending" },
		],
	},

	endingA: {
		id: "endingA",
		lines: [
			{ text: "It keeps going.", pauseAfter: 1000 },
			{ text: "You stop noticing it.", pauseAfter: 1200 },
			{ text: "Time passes.", pauseAfter: 1400 },
			{ text: "You don't check it anymore.", pauseAfter: 1000 },
			{ text: "Not really.", pauseAfter: 1000 },
			{ text: "You're just here.", pauseAfter: 1200 },
			{ text: "", pauseAfter: 800 },
			{ text: "Still scrolling.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Continue", effects: {}, next: "reflection" },
		],
	},

	endingB: {
		id: "endingB",
		lines: [
			{ text: "You notice it now.", pauseAfter: 1000 },
			{ text: "Every time.", pauseAfter: 900 },
			{ text: "The pull.", pauseAfter: 1000 },
			{ text: "The habit.", pauseAfter: 1000 },
			{ text: "The loop.", pauseAfter: 900 },
			{ text: "You tell yourself to stop.", pauseAfter: 1100 },
			{ text: "And then—", pauseAfter: 800 },
			{ text: "you don't.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Continue", effects: {}, next: "reflection" },
		],
	},

	endingC: {
		id: "endingC",
		lines: [
			{ text: "You pause.", pauseAfter: 1200 },
			{ text: "Longer this time.", pauseAfter: 1000 },
			{ text: "It still pulls.", pauseAfter: 1100 },
			{ text: "But you don't move.", pauseAfter: 1000 },
			{ text: "Not immediately.", pauseAfter: 900 },
			{ text: "", pauseAfter: 800 },
			{ text: "That's new.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Continue", effects: {}, next: "reflection" },
		],
	},

	endingD: {
		id: "endingD",
		lines: [
			{ text: "Something feels off.", pauseAfter: 1000 },
			{ text: "You've felt it for a while now.", pauseAfter: 1200 },
			{ text: "You don't like it.", pauseAfter: 1000 },
			{ text: "But you don't stop either.", pauseAfter: 1100 },
			{ text: "", pauseAfter: 900 },
			{ text: "You just sit with it.", pauseAfter: 1000 },
			{ text: "And then—", pauseAfter: 800 },
			{ text: "you scroll again.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Continue", effects: {}, next: "reflection" },
		],
	},
};
