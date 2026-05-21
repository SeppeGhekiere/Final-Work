import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Vector3 } from "three";
import { scenes } from "../scenes/scenes";
import { getEffects, getSceneOverride, getSimulationProfile } from "../engine/effects";
import { applyChoice, onSceneEnter } from "../engine/sceneEngine";
import { getAugmentedLines } from "../engine/narrativeEngine";
import { gameState, updateState } from "../state/gameState";
import { resetInteraction } from "../state/interactionState";
import { logEvent } from "../analytics/logEvent";

const SCENE_KEYS = Object.keys(scenes);

const INITIAL_STATS = { time_loss: 0, tension: 0, awareness: 5, resistance: 3 };

const initialOverrides = {
  blur: 0,
  sleepiness: 0,
  memoryDecay: 0,
  drift: 0,
  textJitter: 0,
  choiceFade: 0,
  disappearChance: 0,
  inputDelay: 0,
  autoScroll: false,
};

export function useGameEngine() {
  const [isDialogueFinished, setIsDialogueFinished] = useState(false);
  const [rerenderKey, setRerenderKey] = useState(0);
  const [metaState, setMetaState] = useState(null);
  const [statIndicators, setStatIndicators] = useState([]);
  const [prevStats, setPrevStats] = useState({ ...INITIAL_STATS });
  const [manualOverrides, setManualOverrides] = useState(initialOverrides);
  const [forcedProfile, setForcedProfile] = useState(null);
  const myceliumRef = useRef(null);
  const autoScrollRef = useRef(null);
  const prevMetaRef = useRef(metaState);

  const scene = scenes[gameState.sceneId];
  const sceneIndex = SCENE_KEYS.indexOf(gameState.sceneId);

  const autoProfile = getSimulationProfile(gameState);
  const profile = forcedProfile || autoProfile;
  const sceneOverride = getSceneOverride(gameState.sceneId);

  const computedEffects = useMemo(() => ({
    ...getEffects(gameState, forcedProfile),
    ...(scene?.getSceneEffects ? scene.getSceneEffects(gameState) : {}),
  }), [rerenderKey, forcedProfile, scene]); // eslint-disable-line react-hooks/exhaustive-deps

  const effects = useMemo(() => ({
    ...computedEffects,
    blur: Math.max(computedEffects.blur || 0, manualOverrides.blur),
    sleepiness: Math.max(computedEffects.sleepiness || 0, manualOverrides.sleepiness),
    memoryDecay: Math.max(computedEffects.memoryDecay || 0, manualOverrides.memoryDecay),
    drift: Math.max(computedEffects.drift || 0, manualOverrides.drift),
    textJitter: computedEffects.textJitter + (manualOverrides.textJitter || 0),
    choiceFade: computedEffects.choiceFade + (manualOverrides.choiceFade || 0),
    disappearChance: computedEffects.disappearChance + (manualOverrides.disappearChance || 0),
    inputDelay: computedEffects.inputDelay + (manualOverrides.inputDelay || 0),
    autoScroll: computedEffects.autoScroll || manualOverrides.autoScroll,
  }), [computedEffects, manualOverrides]);

  // Trigger onSceneEnter when sceneId changes
  useEffect(() => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
    window.scrollTo(0, 0);
    onSceneEnter();
  }, [rerenderKey]);

  // Auto-scroll effect
  useEffect(() => {
    if (effects.autoScroll && !autoScrollRef.current) {
      autoScrollRef.current = setInterval(() => {
        window.scrollBy(0, 1);
      }, 50);
    } else if (!effects.autoScroll && autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
        autoScrollRef.current = null;
      }
    };
  }, [effects.autoScroll, rerenderKey]);

  const fullLines = useMemo(
    () => getAugmentedLines(scene, gameState),
    [rerenderKey, scene] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleDialogueFinish = useCallback(() => {
    gameState.lastSceneEnterTime = Date.now();
    setIsDialogueFinished(true);
  }, []);

  const handleMetaComplete = useCallback(() => {
    setMetaState((current) => {
      switch (current) {
        case "personal_stats":
          return "cold_facts";
        case "cold_facts":
          return "thank_you";
        case "thank_you":
          return null;
        default:
          return null;
      }
    });
  }, []);

  // Transition from meta sequence to reflection screen
  useEffect(() => {
    const prev = prevMetaRef.current;
    prevMetaRef.current = metaState;

    if (prev === "thank_you" && metaState === null) {
      setIsDialogueFinished(false);
      updateState({ sceneId: "reflection", tension: 0 });
      setRerenderKey((n) => n + 1);
    }
  }, [metaState]);

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

    const statMessages = [];
    if (newState.time_loss > prevStats.time_loss) {
      statMessages.push({ stat: "time_loss", text: "Time slips away...", color: "#ff4444", index: statMessages.length });
    }
    if (newState.tension > prevStats.tension) {
      statMessages.push({ stat: "tension", text: "Tension builds...", color: "#ff4444", index: statMessages.length });
    }
    if (newState.awareness < prevStats.awareness) {
      statMessages.push({ stat: "awareness", text: "Clarity fades...", color: "#ff4444", index: statMessages.length });
    }
    if (newState.awareness > prevStats.awareness) {
      statMessages.push({ stat: "awareness", text: "You feel more aware...", color: "#ff4444", index: statMessages.length });
    }
    if (newState.resistance > prevStats.resistance) {
      statMessages.push({ stat: "resistance", text: "You feel more aware of the pull...", color: "#ff4444", index: statMessages.length });
    }
    if (newState.resistance < prevStats.resistance) {
      statMessages.push({ stat: "resistance", text: "The pull gets stronger...", color: "#ff4444", index: statMessages.length });
    }

    if (statMessages.length > 0) {
      setStatIndicators(statMessages.slice(0, 2));
      setTimeout(() => setStatIndicators([]), 2000);
    }

    setPrevStats({ ...newState });

    const isEnding =
      newState.sceneId &&
      typeof newState.sceneId === "string" &&
      newState.sceneId.startsWith("ending");

    if (isEnding) {
      updateState({ ...newState, sceneId: gameState.sceneId });
      setMetaState("personal_stats");
    } else {
      updateState(newState);
      setIsDialogueFinished(false);
      setRerenderKey((n) => n + 1);
      myceliumRef.current?.triggerPulse(new Vector3(1.0, 0.0, 0.0));
    }
  }, [prevStats]);

  const addStat = (key, amount) => {
    updateState({ [key]: (gameState[key] || 0) + amount });
    setRerenderKey(n => n + 1);
  };

  const toggleEffect = (effectName, values) => {
    setManualOverrides(prev => {
      const current = prev[effectName];
      const currentIdx = values.indexOf(current);
      const nextIdx = (currentIdx + 1) % values.length;
      return { ...prev, [effectName]: values[nextIdx] };
    });
  };

  const resetAll = () => {
    updateState({ ...INITIAL_STATS, sceneId: "scene1" });
    resetInteraction();
    setManualOverrides(initialOverrides);
    setForcedProfile(null);
    setIsDialogueFinished(false);
    setMetaState(null);
    setRerenderKey(n => n + 1);
  };

  const nextScene = () => {
    const nextIdx = Math.min(sceneIndex + 1, SCENE_KEYS.length - 1);
    updateState({ sceneId: SCENE_KEYS[nextIdx] });
    setIsDialogueFinished(false);
    setRerenderKey(n => n + 1);
  };

  const prevScene = () => {
    const prevIdx = Math.max(sceneIndex - 1, 0);
    updateState({ sceneId: SCENE_KEYS[prevIdx] });
    setIsDialogueFinished(false);
    setRerenderKey(n => n + 1);
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
    autoScrollRef,
    myceliumRef,
    handleDialogueFinish,
    handleChoice,
    handleMetaComplete,
    setForcedProfile,
    setManualOverrides,
    addStat,
    toggleEffect,
    resetAll,
    nextScene,
    prevScene,
    rerenderKey,
  };
}