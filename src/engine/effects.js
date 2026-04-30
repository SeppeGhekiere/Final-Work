export function getEffects(state) {
  const t = state.time_loss;

  return {
    blur: Math.min(Math.pow(t, 1.4) * 0.12, 6), // soft start, capped at 6px
    textDelay: 40 + Math.pow(t, 1.2) * 5, // base 40ms delay, slow ramp
    choiceInstability: t > 6, // only triggers mid-late game
    flicker: t > 8 // late-game visual flicker
  };
}
