export const act1 = {
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
};
