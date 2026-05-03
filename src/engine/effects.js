export function getEffects(state) {
  const t = state.time_loss;
  const tension = state.tension;

  return {
    blur: Math.min(Math.pow(t, 1.4) * 0.12, 6),
    textDelay: 40 + Math.pow(t, 1.2) * 5,
    choiceInstability: t > 6,
    flicker: t > 8,
    sleepiness: Math.min(Math.pow(t, 1.3) * 0.08, 0.75),
    memoryDecay: Math.max(0, Math.min((t - 2) / 8, 1)),
    drift: Math.min(Math.pow(tension, 1.2) * 0.04, 3),
  };
}
