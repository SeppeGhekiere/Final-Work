export const act2 = {
  scene3_scroll: {
    id: "scene3_scroll",
    lines: [
      { text: "At first, it feels small.", pauseAfter: 1000 },
      { text: "Harmless.", pauseAfter: 1100 },
      { text: "", pauseAfter: 700 },
      { text: "Something to fill the gap between moments.", pauseAfter: 1300 },
      { text: "A pause before returning to everything else.", pauseAfter: 1300 },
      { text: "", pauseAfter: 900 },
      { text: "Your thumb keeps moving.", pauseAfter: 1100 },
      { text: "Your mind drifts somewhere softer.", pauseAfter: 0 },
    ],
    choices: [
      { text: "Stay here a little longer", effects: { time_loss: 2 }, next: "scene4_loop" },
      { text: "Look for something interesting", effects: { time_loss: 3 }, next: "scene4_loop" },
      { text: "Pause for a second", effects: { awareness: 1 }, next: "scene4_reflect" },
      { text: "Try to focus again", effects: { resistance: 2 }, next: "scene4_reflect" },
    ],
  },

  scene3_resist: {
    id: "scene3_resist",
    lines: [
      { text: "The room feels strangely quiet.", pauseAfter: 1200 },
      { text: "Too quiet.", pauseAfter: 1000 },
      { text: "", pauseAfter: 800 },
      { text: "Without distraction, everything becomes noticeable again.", pauseAfter: 1400 },
      { text: "The unfinished task.", pauseAfter: 1000 },
      { text: "The feeling you were avoiding.", pauseAfter: 1200 },
      { text: "Your own thoughts.", pauseAfter: 1200 },
      { text: "", pauseAfter: 900 },
      { text: "Reaching for the phone suddenly feels easier than sitting here.", pauseAfter: 0 },
    ],
    choices: [
      { text: "Check something quickly", effects: { time_loss: 2 }, next: "scene4_loop" },
      { text: "Wait a little longer", effects: { resistance: 2 }, next: "scene4_reflect" },
      { text: "Look around the room", effects: { awareness: 2 }, next: "scene4_reflect" },
      { text: "Give in to the habit", effects: { time_loss: 2 }, next: "scene4_loop" },
    ],
  },

  scene4_loop: {
    id: "scene4_loop",
    lines: [
      { text: "The light outside changes slowly.", pauseAfter: 1400 },
      { text: "You barely notice it.", pauseAfter: 1200 },
      { text: "", pauseAfter: 900 },
      { text: "A message appears.", pauseAfter: 1000 },
      { text: "You think about answering.", pauseAfter: 1200 },
      { text: "Then it disappears beneath everything else.", pauseAfter: 1400 },
      { text: "", pauseAfter: 900 },
      { text: "Nothing you see feels important.", pauseAfter: 1300 },
      { text: "But stopping feels harder now.", pauseAfter: 0 },
    ],
    choices: [
      { text: "Keep going", effects: { time_loss: 3 }, next: "scene5_drift" },
      { text: "Switch to something else", effects: { time_loss: 2 }, next: "scene5_drift" },
      { text: "Check the time", effects: { awareness: 1 }, next: "scene5_reflect" },
      { text: "Put the phone down for a moment", effects: { resistance: 2 }, next: "scene5_reflect" },
    ],
  },

  scene4_reflect: {
    id: "scene4_reflect",
    lines: [
      { text: "You stop moving for a moment.", pauseAfter: 1200 },
      { text: "", pauseAfter: 1000 },
      { text: "The silence feels unfamiliar.", pauseAfter: 1300 },
      { text: "", pauseAfter: 900 },
      { text: "You suddenly become aware of your body again.", pauseAfter: 1500 },
      { text: "Your posture.", pauseAfter: 1000 },
      { text: "Your eyes burning slightly.", pauseAfter: 1300 },
      { text: "", pauseAfter: 900 },
      { text: "You don't remember how long you've been sitting here.", pauseAfter: 0 },
    ],
    choices: [
      { text: "Go back", effects: { time_loss: 2 }, next: "scene5_drift" },
      { text: "Stay in the silence", effects: { awareness: 2 }, next: "scene5_reflect" },
      { text: "Stand up for a second", effects: { resistance: 2 }, next: "scene5_reflect" },
      { text: "Ignore the feeling", effects: { tension: 2 }, next: "scene5_drift" },
    ],
  },
};
