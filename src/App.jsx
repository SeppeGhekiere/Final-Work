import { useState, useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { scenes } from "./scenes/scenes";
import { getEffects, getSceneOverride, getSimulationProfile } from "./engine/effects";
import { applyChoice, onSceneEnter } from "./engine/sceneEngine";
import { getAugmentedLines } from "./engine/narrativeEngine";
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
  const [prevStats, setPrevStats] = useState({ time_loss: 0, tension: 0, awareness: 5, resistance: 3 });
  const [manualOverrides, setManualOverrides] = useState({
    blur: 0,
    sleepiness: 0,
    memoryDecay: 0,
    drift: 0,
    textJitter: 0,
    choiceFade: 0,
    disappearChance: 0,
    inputDelay: 0,
    autoScroll: false,
  });
  const [forcedProfile, setForcedProfile] = useState(null);
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
    onSceneEnter();
  }, [gameState.sceneId]);

  const state = gameState;
  const scene = scenes[state.sceneId];
  const sceneIndex = SCENE_KEYS.indexOf(state.sceneId);
  
  // Get raw profile and scene override for debug display
  const autoProfile = getSimulationProfile(state);
  const profile = forcedProfile || autoProfile;
  const sceneOverride = getSceneOverride(state.sceneId);
  
  const computedEffects = {
    ...getEffects(state, forcedProfile),
    ...(scene?.getSceneEffects ? scene.getSceneEffects(state) : {})
  };
  const effects = {
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
  };

  // Memoize augmented lines to prevent dialogue restart
  const fullLines = useMemo(
    () => getAugmentedLines(scene, state),
    [scene.id, state.time_loss, state.awareness, state.tension, state.resistance]
  );

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
      statMessages.push({ stat: "time_loss", text: "Time slips away...", color: "#0f0", index: statMessages.length });
    }
    if (newState.tension > prevStats.tension) {
      statMessages.push({ stat: "tension", text: "Tension builds...", color: "#0f0", index: statMessages.length });
    }
    if (newState.awareness < prevStats.awareness) {
      statMessages.push({ stat: "awareness", text: "Clarity fades...", color: "#0f0", index: statMessages.length });
    }
    if (newState.awareness > prevStats.awareness) {
      statMessages.push({ stat: "awareness", text: "You feel more aware...", color: "#0f0", index: statMessages.length });
    }
    if (newState.resistance > prevStats.resistance) {
      statMessages.push({ stat: "resistance", text: "You feel more aware of the pull...", color: "#0f0", index: statMessages.length });
    }
    if (newState.resistance < prevStats.resistance) {
      statMessages.push({ stat: "resistance", text: "The pull gets stronger...", color: "#0f0", index: statMessages.length });
    }
    
    if (statMessages.length > 0) {
      console.log('App: setting statIndicators:', statMessages);
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

  const toggleEffect = (effectName, values) => {
    setManualOverrides(prev => {
      const current = prev[effectName];
      const currentIdx = values.indexOf(current);
      const nextIdx = (currentIdx + 1) % values.length;
      return { ...prev, [effectName]: values[nextIdx] };
    });
  };

  const resetAll = () => {
    updateState({ time_loss: 0, tension: 0, awareness: 5, resistance: 3 });
    setManualOverrides({ 
      blur: 0, 
      sleepiness: 0, 
      memoryDecay: 0, 
      drift: 0,
      textJitter: 0,
      choiceFade: 0,
      disappearChance: 0,
      inputDelay: 0,
      autoScroll: false,
    });
    setForcedProfile(null);
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
          {/* PROFILE & SCENE */}
          <div className="debug-section">
            <div className="debug-section-title">PROFILE & SCENE</div>
            <div className="debug-row">
              <span>Profile: <strong>{profile}</strong> {forcedProfile ? "(forced)" : `(auto: ${autoProfile})`}</span>
              <select 
                value={forcedProfile === null ? "" : forcedProfile} 
                onChange={(e) => setForcedProfile(e.target.value === "" ? null : e.target.value)}
              >
                <option value="">Auto - calculated</option>
                <option value="neutral">neutral</option>
                <option value="deep_scroll">deep_scroll</option>
                <option value="aware_loop">aware_loop</option>
                <option value="breaking">breaking</option>
                <option value="uneasy">uneasy</option>
              </select>
            </div>
            <div className="debug-row">Scene: <strong>{state.sceneId}</strong></div>
            <div className="debug-row">
              Scene Override: {Object.keys(sceneOverride).length > 0 
                ? JSON.stringify(sceneOverride) 
                : <span style={{color: '#666'}}>(none)</span>}
            </div>
          </div>

          {/* STATE VALUES */}
          <div className="debug-section">
            <div className="debug-section-title">STATE VALUES</div>
            <div className="debug-row">
              time_loss: <strong>{state.time_loss}</strong> | 
              tension: <strong>{state.tension}</strong> | 
              awareness: <strong>{state.awareness}</strong> | 
              resistance: <strong>{state.resistance}</strong>
            </div>
          </div>

          {/* BASE PROFILE VALUES */}
          <div className="debug-section">
            <div className="debug-section-title">BASE PROFILE (raw: {profile})</div>
            <div className="debug-row">
              blur:{getEffects(state, profile).blur?.toFixed(1) || 0} 
              {' | '}textJitter:{getEffects(state, profile).textJitter?.toFixed(1) || 0}
              {' | '}inputDelay:{getEffects(state, profile).inputDelay}
            </div>
            <div className="debug-row">
              choiceFade:{getEffects(state, profile).choiceFade?.toFixed(1) || 0}
              {' | '}choiceStability:{getEffects(state, profile).choiceStability?.toFixed(1) || 1}
              {' | '}autoScroll:{String(getEffects(state, profile).autoScroll)}
            </div>
            <div className="debug-row">
              disappearChance:{getEffects(state, profile).disappearChance?.toFixed(2) || 0}
              {' | '}textSpeed:{getEffects(state, profile).textSpeed?.toFixed(1) || 1}
            </div>
          </div>

          {/* SCENE OVERRIDE VALUES */}
          <div className="debug-section">
            <div className="debug-section-title">SCENE OVERRIDE (raw)</div>
            <div className="debug-row">
              {Object.keys(sceneOverride).length > 0 
                ? Object.entries(sceneOverride).map(([k, v]) => `${k}:${v}`).join(' | ')
                : <span style={{color: '#666'}}>(none)</span>}
            </div>
          </div>

          {/* FINAL MERGED VALUES */}
          <div className="debug-section">
            <div className="debug-section-title">FINAL MERGED VALUES</div>
            <div className="debug-row">
              blur:{effects.blur?.toFixed(1)} 
              {' | '}textJitter:{effects.textJitter?.toFixed(1)}
              {' | '}inputDelay:{effects.inputDelay}
            </div>
            <div className="debug-row">
              choiceFade:{effects.choiceFade?.toFixed(1)}
              {' | '}choiceStability:{effects.choiceStability?.toFixed(1)}
              {' | '}autoScroll:{String(effects.autoScroll)}
            </div>
            <div className="debug-row">
              disappearChance:{effects.disappearChance?.toFixed(2)}
              {' | '}textSpeed:{effects.textSpeed?.toFixed(1)}
            </div>
          </div>

          {/* LEGACY EFFECTS */}
          <div className="debug-section">
            <div className="debug-section-title">LEGACY EFFECTS</div>
            <div className="debug-row">
              textDelay:{effects.textDelay?.toFixed(0)} 
              {' | '}sleepiness:{effects.sleepiness?.toFixed(2)}
              {' | '}drift:{effects.drift?.toFixed(2)}
            </div>
            <div className="debug-row">
              memoryDecay:{effects.memoryDecay?.toFixed(2)}
              {' | '}jitter:{effects.jitter?.toFixed(2)}
              {' | '}visualNoise:{effects.visualNoise?.toFixed(2)}
            </div>
            <div className="debug-row">
              autoSelect:{String(effects.autoSelect)}
              {' | '}overrideChoices:{String(effects.overrideChoices)}
            </div>
          </div>

          {/* STAT MODIFIERS & SCENE NAV */}
          <div className="debug-section">
            <div className="debug-section-title">STAT MODIFIERS</div>
            <div className="debug-buttons-row">
              <button onClick={() => addStat("time_loss", 1)}>+1 TL</button>
              <button onClick={() => addStat("time_loss", -1)}>-1 TL</button>
              <button onClick={() => addStat("tension", 1)}>+1 T</button>
              <button onClick={() => addStat("tension", -1)}>-1 T</button>
              <button onClick={() => addStat("awareness", 1)}>+1 A</button>
              <button onClick={() => addStat("awareness", -1)}>-1 A</button>
              <button onClick={() => addStat("resistance", 1)}>+1 R</button>
              <button onClick={() => addStat("resistance", -1)}>-1 R</button>
            </div>
            <div className="debug-section-title" style={{marginTop: '8px'}}>SCENE NAVIGATION</div>
            <div className="debug-buttons-row">
              <button onClick={prevScene}>Prev Scene</button>
              <button onClick={nextScene}>Next Scene</button>
              <button onClick={resetAll}>Reset All</button>
            </div>
          </div>

          {/* EFFECT TOGGLES */}
          <div className="debug-section">
            <div className="debug-section-title">EFFECT TOGGLES (Manual Override)</div>
            <div className="debug-buttons-row">
              <button 
                className={manualOverrides.blur > 0 ? "active" : ""}
                onClick={() => toggleEffect("blur", [0, 3, 6])}
              >
                Blur: {manualOverrides.blur}
              </button>
              <button 
                className={manualOverrides.textJitter > 0 ? "active" : ""}
                onClick={() => toggleEffect("textJitter", [0, 0.5, 1])}
              >
                Jitter: {manualOverrides.textJitter}
              </button>
              <button 
                className={manualOverrides.choiceFade > 0 ? "active" : ""}
                onClick={() => toggleEffect("choiceFade", [0, 0.3, 0.6])}
              >
                ChoiceFade: {manualOverrides.choiceFade}
              </button>
              <button 
                className={manualOverrides.disappearChance > 0 ? "active" : ""}
                onClick={() => toggleEffect("disappearChance", [0, 0.2, 0.4])}
              >
                Disappear: {manualOverrides.disappearChance}
              </button>
            </div>
            <div className="debug-buttons-row">
              <button 
                className={manualOverrides.inputDelay > 0 ? "active" : ""}
                onClick={() => toggleEffect("inputDelay", [0, 250, 500, 800])}
              >
                InputDelay: {manualOverrides.inputDelay}
              </button>
              <button 
                className={manualOverrides.autoScroll ? "active" : ""}
                onClick={() => toggleEffect("autoScroll", [false, true])}
              >
                AutoScroll: {String(manualOverrides.autoScroll)}
              </button>
              <button 
                className={manualOverrides.sleepiness > 0 ? "active" : ""}
                onClick={() => toggleEffect("sleepiness", [0, 0.75])}
              >
                Sleepiness: {manualOverrides.sleepiness}
              </button>
              <button 
                className={manualOverrides.drift > 0 ? "active" : ""}
                onClick={() => toggleEffect("drift", [0, 3])}
              >
                Drift: {manualOverrides.drift}
              </button>
            </div>
          </div>
        </div>
      )}

      <MyceliumLayer 
        ref={myceliumRef} 
        blur={effects.blur} 
        sleepiness={effects.sleepiness ?? 0}
        floatingTexts={statIndicators}
      />

      <div className="story-container">
        <DialogueBox
          lines={fullLines}
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
