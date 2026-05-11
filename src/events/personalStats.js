import { getInteractionState } from "../state/interactionState";

export function analyzePersonalStats() {
  const state = getInteractionState();
  const { clickTimes, history } = state;

  const totalChoices = clickTimes.length;

  const scrollKeywords = [
    "scroll", "keep", "continue", "one more", "check", "open",
  ];
  const scrollChoices = history.filter((c) =>
    scrollKeywords.some((k) => c.toLowerCase().includes(k))
  ).length;

  if (totalChoices === 0) {
    return {
      totalChoices: 0,
      avgReactionTime: 0,
      impulsiveChoices: 0,
      hesitantChoices: 0,
      scrollChoices: 0,
      hesitationTrend: null,
    };
  }

  const avgReactionTime =
    clickTimes.reduce((a, b) => a + b, 0) / totalChoices;

  const impulsiveChoices = clickTimes.filter((t) => t < 800).length;
  const hesitantChoices = clickTimes.filter((t) => t > 2500).length;

  let hesitationTrend = null;
  if (clickTimes.length >= 4) {
    const mid = Math.floor(clickTimes.length / 2);
    const firstHalf = clickTimes.slice(0, mid);
    const secondHalf = clickTimes.slice(mid);
    const firstAvg =
      firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    if (secondAvg < firstAvg * 0.7) {
      hesitationTrend = "less";
    } else if (secondAvg > firstAvg * 1.3) {
      hesitationTrend = "more";
    }
  }

  return {
    totalChoices,
    avgReactionTime: Math.round((avgReactionTime / 100) * 10) / 10,
    impulsiveChoices,
    hesitantChoices,
    scrollChoices,
    hesitationTrend,
  };
}
