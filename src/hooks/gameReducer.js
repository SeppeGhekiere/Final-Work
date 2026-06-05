import { nextMetaState } from "../engine/metaStateMachine";

export const INITIAL_STATS = { time_loss: 0, tension: 0, awareness: 5, resistance: 3 };

const initialOverrides = {
	blur: 0,
	sleepiness: 0,
	memoryDecay: 0,
	drift: 0,
	textJitter: 0,
	choiceFade: 0,
	disappearChance: 0,
	inputDelay: 0,
};

export const initialState = {
	isDialogueFinished: false,
	rerenderKey: 0,
	metaState: null,
	prevMetaState: null,
	statIndicators: [],
	prevStats: { ...INITIAL_STATS },
	manualOverrides: { ...initialOverrides },
	forcedProfile: null,
};

export function gameReducer(state, action) {
	switch (action.type) {
		case "DIALOGUE_FINISHED":
			return { ...state, isDialogueFinished: true };

		case "META_COMPLETE":
			return { ...state, metaState: nextMetaState(state.metaState), prevMetaState: state.metaState };

		case "MADE_CHOICE":
			if (action.isEnding) {
				return {
					...state,
					prevStats: { ...action.newState },
					metaState: "personal_stats",
					prevMetaState: state.metaState,
				};
			}
			return {
				...state,
				prevStats: { ...action.newState },
				isDialogueFinished: false,
				rerenderKey: state.rerenderKey + 1,
			};

		case "SHOW_INDICATORS":
			return { ...state, statIndicators: action.indicators };

		case "HIDE_INDICATORS":
			return { ...state, statIndicators: [] };

		case "TOGGLE_EFFECT": {
			const current = state.manualOverrides[action.effectName];
			const currentIdx = action.values.indexOf(current);
			const nextIdx = (currentIdx + 1) % action.values.length;
			return {
				...state,
				manualOverrides: { ...state.manualOverrides, [action.effectName]: action.values[nextIdx] },
			};
		}

		case "SET_FORCED_PROFILE":
			return { ...state, forcedProfile: action.profile };

		case "TRIGGER_REALITY_CHECK":
			if (state.metaState !== null) return state;
			return { ...state, metaState: "reality_check", prevMetaState: state.metaState };

		case "RESET":
			return { ...initialState, rerenderKey: state.rerenderKey + 1 };

		case "RENEW_SCENE":
			return { ...state, isDialogueFinished: false, rerenderKey: state.rerenderKey + 1 };

		default:
			return state;
	}
}
