import { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { scenes } from "./scenes/scenes";
import { getEffects } from "./engine/effects";
import { applyChoice } from "./engine/sceneEngine";
import { gameState, updateState } from "./state/gameState";

import DialogueBox from "./ui/DialogueBox";
import ChoiceList from "./ui/ChoiceList";
import MyceliumLayer from "./ui/MyceliumLayer";

const SCENE_KEYS = Object.keys(scenes);

export default function App() {
  const [isDialogueFinished, setIsDialogueFinished] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [rerenderKey, setRerenderKey] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const [manualOverrides, setManualOverrides] = useState({
    blur: 0,
    sleepiness: 0,
    memoryDecay: 0,
    drift: 0,
  });
  const myceliumRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "p" || e.key === "P") {
        setShowDebug(prev => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const state = gameState;
  const scene = scenes[state.sceneId];
  const sceneIndex = SCENE_KEYS.indexOf(state.sceneId);
  const computedEffects = {
    ...getEffects(state),
    ...(scene?.getSceneEffects ? scene.getSceneEffects(state) : {})
  };
  const effects = {
    ...computedEffects,
    blur: Math.max(computedEffects.blur || 0, manualOverrides.blur),
    sleepiness: Math.max(computedEffects.sleepiness || 0, manualOverrides.sleepiness),
    memoryDecay: Math.max(computedEffects.memoryDecay || 0, manualOverrides.memoryDecay),
    drift: Math.max(computedEffects.drift || 0, manualOverrides.drift),
  };

  if (!scene) {
    return <div className="app"><p>The End</p></div>;
  }

  const handleChoice = (choice) => {
    const newState = applyChoice(gameState, choice);
    updateState(newState);
    setIsDialogueFinished(false);
    setRerenderKey(n => n + 1);
    myceliumRef.current?.triggerPulse(new THREE.Vector3(1.0, 0.0, 0.0));
  };

  const addStat = (key, amount) => {
    updateState({ [key]: (state[key] || 0) + amount });
    setRerenderKey(n => n + 1);
  };

  const toggleEffect = (effectName, maxValue) => {
    setManualOverrides(prev => ({
      ...prev,
      [effectName]: prev[effectName] > 0 ? 0 : maxValue,
    }));
  };

  const resetAll = () => {
    updateState({ time_loss: 0, tension: 0, awareness: 0, resistance: 0 });
    setManualOverrides({ blur: 0, sleepiness: 0, memoryDecay: 0, drift: 0 });
    setIsDialogueFinished(false);
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

  return (
    <div className="app">
      {showDebug && (
        <div className="debug-panel">
          <div className="debug-stats">
            <div>time_loss: {state.time_loss}</div>
            <div>tension: {state.tension}</div>
            <div>awareness: {state.awareness}</div>
            <div>resistance: {state.resistance}</div>
            <div>scene: {state.sceneId}</div>
          </div>
          <div className="debug-stat-buttons">
            <button onClick={() => addStat("time_loss", 1)}>+1 TL</button>
            <button onClick={() => addStat("time_loss", -1)}>-1 TL</button>
            <button onClick={() => addStat("tension", 1)}>+1 T</button>
            <button onClick={() => addStat("tension", -1)}>-1 T</button>
            <button onClick={() => addStat("awareness", 1)}>+1 A</button>
            <button onClick={() => addStat("awareness", -1)}>-1 A</button>
            <button onClick={() => addStat("resistance", 1)}>+1 R</button>
            <button onClick={() => addStat("resistance", -1)}>-1 R</button>
          </div>
          <div className="debug-effect-buttons">
            <button
              className={manualOverrides.blur > 0 ? "active" : ""}
              onClick={() => toggleEffect("blur", 6)}
            >
              {manualOverrides.blur > 0 ? "Disable" : "Activate"} Blur
            </button>
            <button
              className={manualOverrides.sleepiness > 0 ? "active" : ""}
              onClick={() => toggleEffect("sleepiness", 0.75)}
            >
              {manualOverrides.sleepiness > 0 ? "Disable" : "Activate"} Sleepiness
            </button>
            <button
              className={manualOverrides.memoryDecay > 0 ? "active" : ""}
              onClick={() => toggleEffect("memoryDecay", 1)}
            >
              {manualOverrides.memoryDecay > 0 ? "Disable" : "Activate"} Memory
            </button>
            <button
              className={manualOverrides.drift > 0 ? "active" : ""}
              onClick={() => toggleEffect("drift", 3)}
            >
              {manualOverrides.drift > 0 ? "Disable" : "Activate"} Drift
            </button>
          </div>
          <div className="debug-scene-buttons">
            <button onClick={prevScene}>Prev Scene</button>
            <button onClick={nextScene}>Next Scene</button>
            <button onClick={resetAll}>Reset All</button>
          </div>
        </div>
      )}

      <MyceliumLayer ref={myceliumRef} blur={effects.blur} />

      <div className="story-container">
        <DialogueBox
          lines={scene.lines}
          effects={effects}
          onFinish={() => setIsDialogueFinished(true)}
        />
      </div>

      <div className="choices-container">
        {isDialogueFinished && (
          <ChoiceList
            choices={scene.choices}
            onSelect={handleChoice}
            effects={effects}
          />
        )}
      </div>

      <div
        className="sleepiness-overlay"
        style={{ opacity: effects.sleepiness ?? 0 }}
      />
    </div>
  );
}
