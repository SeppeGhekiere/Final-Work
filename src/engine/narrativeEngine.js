import { getInteractionState } from "../state/interactionState";

export function getAugmentedLines(scene, state) {
  const dynamicLines = [];
  const interaction = getInteractionState();
  
  const sceneId = scene.id || "";
  const sceneNum = parseInt(sceneId.replace(/\D/g, '')) || 0;
  
  if (sceneNum >= 5 && state.time_loss > 8) {
    dynamicLines.push({ text: "You've been here longer than you think." });
  }
  
  if (sceneNum >= 5 && state.awareness > 5) {
    dynamicLines.push({ text: "You notice it happening." });
  }
  
  if (sceneNum >= 6 && state.tension > 6) {
    dynamicLines.push({ text: "Something doesn't feel right." });
  }
  
  if (sceneNum >= 8) {
    if (interaction.hesitationScore > 2) {
      dynamicLines.push({ text: "You're hesitating more now." });
    }
    if (state.time_loss > 10) {
      dynamicLines.push({ text: "You don't remember how long you've been here." });
    }
    if (state.resistance > 5) {
      dynamicLines.push({ text: "You feel the pull, but you're fighting it." });
    }
  }
  
  if (sceneNum >= 3 && state.awareness > 6) {
    dynamicLines.push({ text: "You notice yourself scrolling." });
  }
  
  return [...scene.lines, ...dynamicLines];
}

export function getScrollText(state) {
  if (state.awareness > 6) return "You notice you're still scrolling.";
  if (state.time_loss > 8) return "You keep scrolling.";
  return "You scroll.";
}

export function getStopText(state) {
  if (state.awareness > 5) return "Stop… seriously";
  return "Stop";
}

export function getContinueText(state) {
  if (state.resistance > 6) return "You could put it down right now.";
  if (state.time_loss > 8) return "Just one more…";
  return "Continue";
}