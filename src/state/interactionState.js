const interactionState = {
  clickTimes: [],
  history: [],
  hesitationScore: 0,
  lastReactionTime: 0,
};

export function recordReactionTime() {
  interactionState.lastReactionTime = Date.now();
}

export function recordChoice(choiceText) {
  const reactionTime = Date.now() - interactionState.lastReactionTime;
  interactionState.history.push(choiceText);
  interactionState.clickTimes.push(reactionTime);
}

export function getInteractionState() {
  return interactionState;
}

export function incrementHesitation() {
  interactionState.hesitationScore += 1;
}

export function resetInteraction() {
  interactionState.clickTimes = [];
  interactionState.history = [];
  interactionState.hesitationScore = 0;
  interactionState.lastReactionTime = 0;
}