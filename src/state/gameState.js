function getSessionId() {
  const key = "doomscroll_sessionId"
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export function regenerateSessionId() {
  const id = crypto.randomUUID()
  localStorage.setItem("doomscroll_sessionId", id)
  gameState.sessionId = id
}

export const gameState = {
  sceneId: "scene1",
  sessionId: getSessionId(),
  time_loss: 0,
  tension: 0,
  awareness: 5,
  resistance: 3,
  lastSceneEnterTime: Date.now(),
};

export function updateState(patch) {
  Object.assign(gameState, patch);
}
