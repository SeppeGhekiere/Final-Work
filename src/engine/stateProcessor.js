import { gameState } from "../state/gameState";
import { getInteractionState, incrementHesitation } from "../state/interactionState";

export function processReaction() {
  const interaction = getInteractionState();
  const reactionTime = interaction.clickTimes[interaction.clickTimes.length - 1];
  
  if (!reactionTime) return;
  
  if (reactionTime < 800) {
    gameState.time_loss += 1;
    gameState.tension += 0.5;
  }
  else if (reactionTime > 2500) {
    gameState.awareness += 1;
    gameState.resistance += 0.5;
    incrementHesitation();
  }
}

export function detectLoopPattern() {
  const interaction = getInteractionState();
  const last3 = interaction.history.slice(-3);
  
  if (last3.length < 3) return false;
  
  const scrollChoices = last3.filter(c => {
    const lower = c.toLowerCase();
    return lower.includes("scroll") || 
           lower.includes("keep") || 
           lower.includes("continue") ||
           lower.includes("one more");
  });
  
  if (scrollChoices.length === 3) {
    gameState.time_loss += 2;
    gameState.tension += 1;
    return true;
  }
  return false;
}