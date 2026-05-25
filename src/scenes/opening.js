export const opening = {
  scene1: {
    id: "scene1",
    lines: [
      { text: "Think back.", pauseAfter: 700 },
      { text: "The last time you picked up your phone…", pauseAfter: 900 },
      { text: "Not because you needed to.", pauseAfter: 800 },
      { text: "Just… because.", pauseAfter: 1000 },
      { text: "", pauseAfter: 700 },
      { text: "Five minutes later...", pauseAfter: 900 },
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
};
