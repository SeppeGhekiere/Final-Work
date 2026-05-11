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

export function getTotalChoices() {
  return interactionState.clickTimes.length;
}

export function getAverageReactionTime() {
  const times = interactionState.clickTimes;
  if (times.length === 0) return 0;
  return times.reduce((a, b) => a + b, 0) / times.length;
}

export function getScrollChoiceCount() {
  const keywords = [
    "scroll", "keep", "continue", "one more", "check", "open",
  ];
  return interactionState.history.filter((c) =>
    keywords.some((k) => c.toLowerCase().includes(k))
  ).length;
}

export function getHesitationTrend() {
  const times = interactionState.clickTimes;
  if (times.length < 4) return null;
  const mid = Math.floor(times.length / 2);
  const firstAvg =
    times.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
  const secondAvg =
    times.slice(mid).reduce((a, b) => a + b, 0) / (times.length - mid);
  if (secondAvg < firstAvg * 0.7) return "less";
  if (secondAvg > firstAvg * 1.3) return "more";
  return "stable";
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