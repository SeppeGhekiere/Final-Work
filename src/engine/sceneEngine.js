export function applyChoice(state, choice) {
  const newState = { ...state };

  for (let key in choice.effects) {
    if (Object.prototype.hasOwnProperty.call(newState, key)) {
      newState[key] += choice.effects[key];
    } else {
      newState[key] = choice.effects[key];
    }
  }

  newState.sceneId = choice.next;

  return newState;
}
