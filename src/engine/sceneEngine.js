import { getEnding } from "./effects";
import { recordChoice } from "../state/interactionState";
import { processReaction, detectLoopPattern } from "./stateProcessor";
import { recordReactionTime } from "../state/interactionState";

export function onSceneEnter() {
	recordReactionTime();
}

export function applyChoice(state, choice) {
	recordChoice(choice.text);
	processReaction(choice);
	detectLoopPattern();

	const newState = { ...state };

	for (let key in choice.effects) {
		if (Object.prototype.hasOwnProperty.call(newState, key)) {
			newState[key] += choice.effects[key];
		} else {
			newState[key] = choice.effects[key];
		}
	}

	if (choice.next === "ending") {
		newState.sceneId = getEnding(newState);
	} else if (choice.next === null || choice.next === undefined) {
		newState.sceneId = state.sceneId;
	} else {
		newState.sceneId = choice.next;
	}

	return newState;
}
