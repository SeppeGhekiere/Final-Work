export const gameState = {
  sceneId: "scene1",
  time_loss: 0,
  tension: 0,
  awareness: 5,
  resistance: 3
};

export function updateState(patch) {
  Object.assign(gameState, patch);
}
