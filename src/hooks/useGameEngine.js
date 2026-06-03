import { useRef, useEffect, useMemo, useCallback, useReducer } from "react";
import { Vector3 } from "three";
import { scenes } from "../scenes/scenes";
import { getEffects, getSceneOverride, getSimulationProfile } from "../engine/effects";
import { applyChoice, onSceneEnter } from "../engine/sceneEngine";
import { getAugmentedLines } from "../engine/narrativeEngine";
import { gameState, updateState } from "../state/gameState";
import { resetInteraction } from "../state/interactionState";
import { logEvent } from "../analytics/logEvent";
import { getStatMessages, mergeEffects } from "../engine/statMessages";
import { gameReducer, INITIAL_STATS, initialState } from "./gameReducer";

const SCENE_KEYS = Object.keys(scenes);

export function useGameEngine() {
  const [game, dispatch] = useReducer(gameReducer, initialState);
  const myceliumRef = useRef(null);
  const {
    isDialogueFinished,
    rerenderKey,
    metaState,
    prevMetaState,
    statIndicators,
    prevStats,
    manualOverrides,
    forcedProfile,
  } = game;

  const scene = scenes[gameState.sceneId];
  const sceneIndex = SCENE_KEYS.indexOf(gameState.sceneId);

  const autoProfile = getSimulationProfile(gameState);
  const profile = forcedProfile || autoProfile;
  const sceneOverride = getSceneOverride(gameState.sceneId);

  const computedEffects = useMemo(() => ({
    ...getEffects(gameState, forcedProfile),
    ...(scene?.getSceneEffects ? scene.getSceneEffects(gameState) : {}),
  }), [rerenderKey, forcedProfile, scene]); // eslint-disable-line react-hooks/exhaustive-deps

  const effects = useMemo(
    () => mergeEffects(computedEffects, manualOverrides),
    [computedEffects, manualOverrides]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    onSceneEnter();

    if (gameState.sceneId?.startsWith("scene5") && metaState === null) {
      dispatch({ type: "TRIGGER_REALITY_CHECK" });
    }
  }, [rerenderKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (prevMetaState === "final" && metaState === null) {
      updateState({ sceneId: "reflection", tension: 0 });
      dispatch({ type: "RENEW_SCENE" });
    }
  }, [metaState, prevMetaState]);

  const fullLines = useMemo(
    () => getAugmentedLines(scene, gameState),
    [rerenderKey, scene] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleDialogueFinish = useCallback(() => {
    gameState.lastSceneEnterTime = Date.now();
    dispatch({ type: "DIALOGUE_FINISHED" });
  }, []);

  const handleMetaComplete = useCallback(() => {
    dispatch({ type: "META_COMPLETE" });
  }, []);

  const handleChoice = useCallback((choice) => {
    const newState = applyChoice(gameState, choice);

    const reactionTime = Date.now() - (gameState.lastSceneEnterTime || Date.now());
    logEvent({
      sessionId: gameState.sessionId,
      scene: gameState.sceneId,
      choice: choice.text,
      reactionTime,
      state: {
        time_loss: newState.time_loss,
        awareness: newState.awareness,
        tension: newState.tension,
        resistance: newState.resistance,
      },
      timestamp: Date.now(),
    });

    const statMessages = getStatMessages(newState, prevStats);
    if (statMessages.length > 0) {
      dispatch({ type: "SHOW_INDICATORS", indicators: statMessages.slice(0, 2) });
      setTimeout(() => dispatch({ type: "HIDE_INDICATORS" }), 2000);
    }

    const isEnding =
      newState.sceneId &&
      typeof newState.sceneId === "string" &&
      newState.sceneId.startsWith("ending");

    if (isEnding) {
      updateState({ ...newState, sceneId: gameState.sceneId });
      dispatch({ type: "MADE_CHOICE", newState, isEnding: true });
    } else {
      updateState(newState);
      dispatch({ type: "MADE_CHOICE", newState, isEnding: false });
      myceliumRef.current?.triggerPulse(new Vector3(1.0, 0.0, 0.0));
    }
  }, [prevStats]);

  const addStat = (key, amount) => {
    updateState({ [key]: (gameState[key] || 0) + amount });
    dispatch({ type: "RENEW_SCENE" });
  };

  const toggleEffect = (effectName, values) => {
    dispatch({ type: "TOGGLE_EFFECT", effectName, values });
  };

  const resetAll = () => {
    updateState({ ...INITIAL_STATS, sceneId: "scene1" });
    resetInteraction();
    dispatch({ type: "RESET" });
  };

  const nextScene = () => {
    const nextIdx = Math.min(sceneIndex + 1, SCENE_KEYS.length - 1);
    updateState({ sceneId: SCENE_KEYS[nextIdx] });
    dispatch({ type: "RENEW_SCENE" });
  };

  const prevScene = () => {
    const prevIdx = Math.max(sceneIndex - 1, 0);
    updateState({ sceneId: SCENE_KEYS[prevIdx] });
    dispatch({ type: "RENEW_SCENE" });
  };

  return {
    state: gameState,
    scene,
    effects,
    fullLines,
    profile,
    autoProfile,
    sceneOverride,
    isDialogueFinished,
    metaState,
    statIndicators,
    manualOverrides,
    forcedProfile,
    myceliumRef,
    handleDialogueFinish,
    handleChoice,
    handleMetaComplete,
    setForcedProfile: (profile) => dispatch({ type: "SET_FORCED_PROFILE", profile }),
    setManualOverrides: () => {},
    addStat,
    toggleEffect,
    resetAll,
    nextScene,
    prevScene,
    rerenderKey,
  };
}
