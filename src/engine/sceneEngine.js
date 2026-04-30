export function applyChoice(state, choice) {
  const newState = { ...state };

  for (let key in choice.effects) {
    newState[key] += choice.effects[key];
  }

  newState.sceneId = choice.next;

  return newState;
}
