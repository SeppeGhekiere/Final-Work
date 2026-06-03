export function getStatMessages(newState, prevStats) {
  const messages = [];

  if (newState.time_loss > prevStats.time_loss) {
    messages.push({ stat: "time_loss", text: "Time slips away...", color: "#ff4444", index: messages.length });
  }
  if (newState.tension > prevStats.tension) {
    messages.push({ stat: "tension", text: "Tension builds...", color: "#ff4444", index: messages.length });
  }
  if (newState.awareness < prevStats.awareness) {
    messages.push({ stat: "awareness", text: "Clarity fades...", color: "#ff4444", index: messages.length });
  }
  if (newState.awareness > prevStats.awareness) {
    messages.push({ stat: "awareness", text: "You feel more aware...", color: "#ff4444", index: messages.length });
  }
  if (newState.resistance > prevStats.resistance) {
    messages.push({ stat: "resistance", text: "You feel more aware of the pull...", color: "#ff4444", index: messages.length });
  }
  if (newState.resistance < prevStats.resistance) {
    messages.push({ stat: "resistance", text: "The pull gets stronger...", color: "#ff4444", index: messages.length });
  }

  return messages;
}

export function mergeEffects(computedEffects, manualOverrides) {
  return {
    ...computedEffects,
    blur: Math.max(computedEffects.blur || 0, manualOverrides.blur),
    sleepiness: Math.max(computedEffects.sleepiness || 0, manualOverrides.sleepiness),
    memoryDecay: Math.max(computedEffects.memoryDecay || 0, manualOverrides.memoryDecay),
    drift: Math.max(computedEffects.drift || 0, manualOverrides.drift),
    textJitter: computedEffects.textJitter + (manualOverrides.textJitter || 0),
    choiceFade: computedEffects.choiceFade + (manualOverrides.choiceFade || 0),
    disappearChance: computedEffects.disappearChance + (manualOverrides.disappearChance || 0),
    inputDelay: computedEffects.inputDelay + (manualOverrides.inputDelay || 0),
  };
}
