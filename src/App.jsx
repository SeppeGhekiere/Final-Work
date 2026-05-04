import { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { scenes } from "./scenes/scenes";
import { getEffects } from "./engine/effects";
import { applyChoice } from "./engine/sceneEngine";
import { gameState, updateState } from "./state/gameState";

import DialogueBox from "./ui/DialogueBox";
import ChoiceList from "./ui/ChoiceList";
import MyceliumLayer from "./ui/MyceliumLayer";
import ReflectionScreen from "./ui/ReflectionScreen";

const SCENE_KEYS = Object.keys(scenes);

export default function App() {
  const [isDialogueFinished, setIsDialogueFinished] = useState(false);
  const [rerenderKey, setRerenderKey] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const [showGoodbye, setShowGoodbye] = useState(false);
  const [statIndicators, setStatIndicators] = useState([]);
  const [prevStats, setPrevStats] = useState({ time_loss: 5, tension: 0, awareness: 5, resistance: 3 });
  const [manualOverrides, setManualOverrides] = useState({
    blur: 0,
    sleepiness: 0,
    memoryDecay: 0,
    drift: 0,
  });
  const myceliumRef = useRef(null);
  const autoScrollRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "p" || e.key === "P") {
        setShowDebug(prev => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Clean up autoScroll on scene change
  useEffect(() => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  }, [gameState.sceneId]);

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

  // Apply tension effects to app container
  const appClassName = [
    "app",
    effects?.jitter > 0.2 ? "jitter" : "",
    effects?.screenShake ? "shake" : "",
  ].filter(Boolean).join(" ");

  // Handle auto-scroll effect
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

  if (showGoodbye) {
    return <div className="app"><p>Thanks for playing.</p></div>;
  }

  if (state.sceneId === "reflection") {
    return (
    <div className={appClassName}>
        <ReflectionScreen
          onRestart={() => {
            setShowGoodbye(false);
            setRerenderKey(n => n + 1);
          }}
          onClose={() => setShowGoodbye(true)}
        />
      </div>
    );
  }

  if (!scene) {
    return <div className="app"><p>The End</p></div>;
  }

  const handleChoice = (choice) => {
    const newState = applyChoice(gameState, choice);
    
    // Track stat changes for indicators
    const statMessages = [];
    if (newState.time_loss > prevStats.time_loss) {
      statMessages.push({ stat: "time_loss", text: "Time slips away...", color: "#886" });
    }
    if (newState.tension > prevStats.tension) {
      statMessages.push({ stat: "tension", text: "Tension builds...", color: "#a66" });
    }
    if (newState.awareness < prevStats.awareness) {
      statMessages.push({ stat: "awareness", text: "Clarity fades...", color: "#68a" });
    }
    if (newState.awareness > prevStats.awareness) {
      statMessages.push({ stat: "awareness", text: "You feel more aware...", color: "#6a8" });
    }
    if (newState.resistance > prevStats.resistance) {
      statMessages.push({ stat: "resistance", text: "You feel more aware of the pull...", color: "#6a8" });
    }
    if (newState.resistance < prevStats.resistance) {
      statMessages.push({ stat: "resistance", text: "The pull gets stronger...", color: "#a68" });
    }
    
    if (statMessages.length > 0) {
      setStatIndicators(statMessages.slice(0, 2));
      setTimeout(() => setStatIndicators([]), 2000);
    }
    
    setPrevStats({ ...newState });
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
    updateState({ time_loss: 0, tension: 0, awareness: 5, resistance: 3 });
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
            <div>profile: {effects.profile}</div>
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

      <MyceliumLayer ref={myceliumRef} blur={effects.blur} sleepiness={effects.sleepiness ?? 0} />

      {/* Stat change indicators */}
      {statIndicators.length > 0 && (
        <div className="stat-indicators">
          {statIndicators.map((indicator, i) => (
            <div
              key={i}
              className="stat-indicator"
              style={{ color: indicator.color }}
            >
              {indicator.text}
            </div>
          ))}
        </div>
      )}

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

      {/* Visual noise overlay (tension) */}
      {effects?.visualNoise > 0 && (
        <div
          className="visual-noise-overlay"
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 5,
            opacity: effects.visualNoise,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            mixBlendMode: "overlay",
          }}
        />
      )}

    </div>
  );
}
