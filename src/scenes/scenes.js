export const scenes = {
	scene1: {
		id: "scene1",
		lines: [
			{ text: "Think back.", pauseAfter: 700 },
			{ text: "The last time you picked up your phone…", pauseAfter: 900 },
			{ text: "Not because you needed to.", pauseAfter: 800 },
			{ text: "Just… because.", pauseAfter: 1000 },
			{ text: "", pauseAfter: 700 },
			{ text: "Five minutes later—", pauseAfter: 900 },
			{ text: "where were you?", pauseAfter: 1000 },
			{ text: "", pauseAfter: 800 },
			{ text: "This isn’t where it starts.", pauseAfter: 900 },
			{ text: "Scrolling comes later.", pauseAfter: 900 },
			{ text: "It starts here.", pauseAfter: 900 },
			{ text: "", pauseAfter: 700 },
			{ text: "What are you avoiding right now?", pauseAfter: 0 },
		],
		choices: [
			{ text: "Something I should be doing", effects: { tension: 2 }, next: "scene2_procrastination" },
			{ text: "Something I don’t want to feel", effects: { tension: 2, awareness: 1 }, next: "scene2_emotion" },
			{ text: "Nothing… just bored", effects: { awareness: 1 }, next: "scene2_boredom" },
			{ text: "I’m just tired", effects: { tension: 1 }, next: "scene2_exhaustion" },
		],
	},

	// ---------------- PROCRASTINATION ----------------

	scene2_procrastination: {
		id: "scene2_procrastination",
		lines: [
			{ text: "The task is still there.", pauseAfter: 900 },
			{ text: "Waiting.", pauseAfter: 900 },
			{ text: "", pauseAfter: 700 },
			{ text: "You know you should start.", pauseAfter: 1000 },
			{ text: "It’s not even that hard.", pauseAfter: 900 },
			{ text: "Just… heavy.", pauseAfter: 1100 },
			{ text: "", pauseAfter: 800 },
			{ text: "“I’ll just check something quickly first.”", pauseAfter: 1200 },
			{ text: "", pauseAfter: 800 },
			{ text: "You unlock your phone.", pauseAfter: 900 },
			{ text: "You don’t even remember deciding to.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Check one thing quickly", effects: { time_loss: 2 }, next: "scene3_scroll" },
			{ text: "Stare at the task instead", effects: { tension: 2, awareness: 1 }, next: "scene3_resist" },
			{ text: "Open something random", effects: { time_loss: 3 }, next: "scene3_scroll" },
			{ text: "Start a tiny part of the task", effects: { resistance: 2 }, next: "scene3_resist" },
		],
	},

	// ---------------- EMOTIONAL ----------------

	scene2_emotion: {
		id: "scene2_emotion",
		lines: [
			{ text: "Something feels off.", pauseAfter: 900 },
			{ text: "You don’t really want to sit with it.", pauseAfter: 1100 },
			{ text: "", pauseAfter: 800 },
			{ text: "It would take effort to figure out why.", pauseAfter: 1100 },
			{ text: "And you’re not sure you want the answer.", pauseAfter: 1100 },
			{ text: "", pauseAfter: 900 },
			{ text: "So you reach for something easier.", pauseAfter: 1000 },
			{ text: "Something that fills the space.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Scroll to distract myself", effects: { time_loss: 3 }, next: "scene3_scroll" },
			{ text: "Try to name the feeling", effects: { awareness: 2, tension: 2 }, next: "scene3_resist" },
			{ text: "Open something loud/fast", effects: { time_loss: 2 }, next: "scene3_scroll" },
			{ text: "Sit in silence for a moment", effects: { resistance: 2 }, next: "scene3_resist" },
		],
	},

	// ---------------- BOREDOM ----------------

	scene2_boredom: {
		id: "scene2_boredom",
		lines: [
			{ text: "Nothing is happening.", pauseAfter: 1000 },
			{ text: "No urgency.", pauseAfter: 900 },
			{ text: "No stimulation.", pauseAfter: 1000 },
			{ text: "", pauseAfter: 900 },
			{ text: "Just… space.", pauseAfter: 1100 },
			{ text: "", pauseAfter: 800 },
			{ text: "Your brain doesn’t like that.", pauseAfter: 1000 },
			{ text: "It wants something.", pauseAfter: 1000 },
			{ text: "", pauseAfter: 800 },
			{ text: "Anything.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Open my phone", effects: { time_loss: 2 }, next: "scene3_scroll" },
			{ text: "Look around instead", effects: { awareness: 2 }, next: "scene3_resist" },
			{ text: "Scroll out of habit", effects: { time_loss: 3 }, next: "scene3_scroll" },
			{ text: "Stay with the boredom", effects: { resistance: 2 }, next: "scene3_resist" },
		],
	},

	// ---------------- EXHAUSTION ----------------

	scene2_exhaustion: {
		id: "scene2_exhaustion",
		lines: [
			{ text: "You’re tired.", pauseAfter: 900 },
			{ text: "The kind of tired that doesn’t go away quickly.", pauseAfter: 1100 },
			{ text: "", pauseAfter: 800 },
			{ text: "You don’t want to think.", pauseAfter: 900 },
			{ text: "You don’t want effort.", pauseAfter: 1000 },
			{ text: "", pauseAfter: 800 },
			{ text: "You just want something easy.", pauseAfter: 1000 },
			{ text: "Something that feels like rest.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Watch something to relax", effects: { time_loss: 3 }, next: "scene3_scroll" },
			{ text: "Try to sleep", effects: { resistance: 2 }, next: "scene3_resist" },
			{ text: "Scroll mindlessly", effects: { time_loss: 3 }, next: "scene3_scroll" },
			{ text: "Put the phone away", effects: { awareness: 2 }, next: "scene3_resist" },
		],
	},

	// ---------------- MERGED PATHS ----------------

	scene3_scroll: {
		id: "scene3_scroll",
		lines: [
			{ text: "Just a quick look.", pauseAfter: 800 },
			{ text: "", pauseAfter: 600 },
			{ text: "A video.", pauseAfter: 900 },
			{ text: "Another.", pauseAfter: 800 },
			{ text: "Something else.", pauseAfter: 900 },
			{ text: "", pauseAfter: 700 },
			{ text: "You’re not choosing anymore.", pauseAfter: 1000 },
			{ text: "You’re reacting.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Keep going", effects: { time_loss: 3 }, next: "scene4_loop" },
			{ text: "Scroll faster", effects: { time_loss: 2, awareness: -1 }, next: "scene4_loop" },
			{ text: "Pause for a second", effects: { awareness: 1 }, next: "scene4_reflect" },
			{ text: "Try to stop", effects: { resistance: 2 }, next: "scene4_reflect" },
		],
	},

	scene3_resist: {
		id: "scene3_resist",
		lines: [
			{ text: "You hesitate.", pauseAfter: 900 },
			{ text: "It’s uncomfortable.", pauseAfter: 1000 },
			{ text: "", pauseAfter: 700 },
			{ text: "Doing nothing feels harder than scrolling.", pauseAfter: 1100 },
			{ text: "", pauseAfter: 800 },
			{ text: "Your mind drifts back.", pauseAfter: 1000 },
			{ text: "To the phone.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Give in and check", effects: { time_loss: 2 }, next: "scene4_loop" },
			{ text: "Wait a bit longer", effects: { resistance: 2 }, next: "scene4_reflect" },
			{ text: "Think about why", effects: { awareness: 2 }, next: "scene4_reflect" },
			{ text: "Open it anyway", effects: { time_loss: 2 }, next: "scene4_loop" },
		],
	},

	// ---------------- LOOP INTENSIFIES ----------------

	scene4_loop: {
		id: "scene4_loop",
		lines: [
			{ text: "Time passes.", pauseAfter: 1200 },
			{ text: "You don’t notice when.", pauseAfter: 1100 },
			{ text: "", pauseAfter: 800 },
			{ text: "Nothing really sticks.", pauseAfter: 1000 },
			{ text: "But you keep going.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Keep scrolling", effects: { time_loss: 3 }, next: "scene5" },
			{ text: "Check the time", effects: { awareness: 1 }, next: "scene5" },
			{ text: "Just one more", effects: { time_loss: 3 }, next: "scene5" },
			{ text: "Try to stop", effects: { resistance: 2 }, next: "scene5" },
		],
	},

	scene4_reflect: {
		id: "scene4_reflect",
		lines: [
			{ text: "You pause.", pauseAfter: 1000 },
			{ text: "Really pause.", pauseAfter: 1100 },
			{ text: "", pauseAfter: 800 },
			{ text: "Something feels off.", pauseAfter: 1000 },
			{ text: "Like you’ve been here before.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Go back to scrolling", effects: { time_loss: 2 }, next: "scene5" },
			{ text: "Sit with the feeling", effects: { awareness: 2 }, next: "scene5" },
			{ text: "Put it down", effects: { resistance: 2 }, next: "scene5" },
			{ text: "Ignore it", effects: { tension: 2 }, next: "scene5" },
		],
	},

	// ---------------- FINAL MERGE ----------------

	scene5: {
		id: "scene5",
		lines: [
			{ text: "You tell yourself it's fine.", pauseAfter: 900 },
			{ text: "Just a habit.", pauseAfter: 900 },
			{ text: "Something everyone does.", pauseAfter: 1000 },
			{ text: "", pauseAfter: 800 },
			{ text: "But it doesn't feel like that anymore.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Continue", effects: { time_loss: 3 }, next: "scene6" },
			{ text: "Try to stop", effects: { resistance: 3 }, next: "scene6" },
			{ text: "Think about why", effects: { awareness: 2 }, next: "scene6" },
			{ text: "Just one more minute", effects: { time_loss: 2 }, next: "scene6" },
		],
	},
	scene6: {
		id: "scene6",
		lines: [
			{ text: "It doesn’t feel like long.", pauseAfter: 1000 },
			{ text: "But it is.", pauseAfter: 1100 },
			{ text: "", pauseAfter: 800 },
			{ text: "Minutes blur together.", pauseAfter: 1100 },
			{ text: "Or maybe longer.", pauseAfter: 1000 },
			{ text: "", pauseAfter: 800 },
			{ text: "You weren’t counting.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Keep scrolling", effects: { time_loss: 3 }, next: "scene7" },
			{ text: "Check the time", effects: { awareness: 1 }, next: "scene7" },
			{ text: "Switch to something else", effects: { time_loss: 2 }, next: "scene7" },
			{ text: "Pause for a second", effects: { awareness: 1 }, next: "scene7" },
		],
	},
	scene7: {
		id: "scene7",
		lines: [
			{ text: "You hesitate.", pauseAfter: 1000 },
			{ text: "Just for a second.", pauseAfter: 900 },
			{ text: "", pauseAfter: 800 },
			{ text: "Something feels… off.", pauseAfter: 1100 },
			{ text: "Like you’ve been here longer than you meant to.", pauseAfter: 1200 },
			{ text: "", pauseAfter: 800 },
			{ text: "But you’re already mid-scroll.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Ignore it", effects: { time_loss: 3 }, next: "scene8" },
			{ text: "Try to remember why you opened it", effects: { awareness: 2 }, next: "scene8" },
			{ text: "Keep going anyway", effects: { time_loss: 3 }, next: "scene8" },
			{ text: "Slow down", effects: { resistance: 1 }, next: "scene8" },
		],
	},
	scene8: {
		id: "scene8",
		lines: [
			{ text: "You notice the loop now.", pauseAfter: 1100 },
			{ text: "The way one thing leads to another.", pauseAfter: 1200 },
			{ text: "", pauseAfter: 900 },
			{ text: "It’s not random.", pauseAfter: 1000 },
			{ text: "It keeps you here.", pauseAfter: 1100 },
			{ text: "", pauseAfter: 900 },
			{ text: "Knowing that…", pauseAfter: 1000 },
			{ text: "doesn’t stop it.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Keep scrolling", effects: { time_loss: 3 }, next: "scene9" },
			{ text: "Try to stop", effects: { resistance: 3 }, next: "scene9" },
			{ text: "Just one more", effects: { time_loss: 2 }, next: "scene9" },
			{ text: "Put the phone down", effects: { awareness: 2 }, next: "scene9" },
		],
	},
	scene9: {
		id: "scene9",
		lines: [
			{ text: "You tell yourself it’s fine.", pauseAfter: 900 },
			{ text: "Everyone does this.", pauseAfter: 1000 },
			{ text: "", pauseAfter: 800 },
			{ text: "It’s just a break.", pauseAfter: 1000 },
			{ text: "Just a moment.", pauseAfter: 1000 },
			{ text: "", pauseAfter: 800 },
			{ text: "But it hasn’t been a moment.", pauseAfter: 1100 },
			{ text: "Not for a while.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Continue", effects: { time_loss: 3 }, next: "scene10" },
			{ text: "Stop now", effects: { resistance: 3 }, next: "scene10" },
			{ text: "Think about why", effects: { awareness: 2 }, next: "scene10" },
			{ text: "Just one more minute", effects: { time_loss: 2 }, next: "scene10" },
		],
	},
	scene10: {
		id: "scene10",
		lines: [
			{ text: "This is the moment.", pauseAfter: 1100 },
			{ text: "You could stop here.", pauseAfter: 1200 },
			{ text: "", pauseAfter: 900 },
			{ text: "Or not.", pauseAfter: 1000 },
			{ text: "", pauseAfter: 900 },
			{ text: "It doesn’t feel like a big decision.", pauseAfter: 1100 },
			{ text: "But it is.", pauseAfter: 0 },
		],
		choices: [
			{ text: "Keep going", effects: { time_loss: 3 }, next: "ending" },
			{ text: "Stop", effects: { resistance: 3 }, next: "ending" },
			{ text: "Pause", effects: { awareness: 2 }, next: "ending" },
			{ text: "Ignore the thought", effects: { tension: 2 }, next: "ending" },
		],
	},
};
