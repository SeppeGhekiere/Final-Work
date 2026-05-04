import { getEnding } from "./effects";

export function applyChoice(state, choice) {
	const newState = { ...state };

	for (let key in choice.effects) {
		if (Object.prototype.hasOwnProperty.call(newState, key)) {
			newState[key] += choice.effects[key];
		} else {
			newState[key] = choice.effects[key];
		}
	}

	// Handle ending transition
	if (choice.next === "ending") {
		newState.sceneId = getEnding(newState);
	} else if (choice.next === null || choice.next === undefined) {
		// Stay on same scene - just refresh to show new effects
		newState.sceneId = state.sceneId;
	} else {
		newState.sceneId = choice.next;
	}

	return newState;
}
