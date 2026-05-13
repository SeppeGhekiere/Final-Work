import { useState, useEffect, useRef } from "react";
import { useGameEngine } from "./hooks/useGameEngine";
import { playRoomSound, ensureAudioContext } from "./hooks/useSound";

import DialogueBox from "./ui/DialogueBox";
import ChoiceList from "./ui/ChoiceList";
import MyceliumLayer from "./ui/MyceliumLayer";
import ReflectionScreen from "./ui/ReflectionScreen";
import MetaOverlay from "./ui/MetaOverlay";
import DebugPanel from "./ui/DebugPanel";

export default function App() {
  const {
    state,
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
    setForcedProfile,
    addStat,
    toggleEffect,
    resetAll,
    nextScene,
    prevScene,
  } = useGameEngine();

  const [showDebug, setShowDebug] = useState(false);
  const [showGoodbye, setShowGoodbye] = useState(false);
  const stopRoomRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "p" || e.key === "P") {
        setShowDebug(prev => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      ensureAudioContext();
      const stop = playRoomSound();
      stopRoomRef.current = stop;
    };
    document.addEventListener("click", handler, { once: true });
    return () => document.removeEventListener("click", handler);
  }, []);

  const showEnding =
    state.sceneId?.startsWith("ending") || state.sceneId === "reflection";

  if (showGoodbye) {
    return <div className="app"><p>Thanks for playing.</p></div>;
  }

  if (state.sceneId === "reflection") {
    return (
      <div className="app">
        <ReflectionScreen
          onRestart={() => {
            setShowGoodbye(false);
            resetAll();
          }}
          onClose={() => setShowGoodbye(true)}
        />
      </div>
    );
  }

  if (!scene && !showEnding) {
    return <div className="app"><p>The End</p></div>;
  }

  const appClassName = [
    "app",
    effects?.jitter > 0.2 ? "jitter" : "",
    effects?.screenShake ? "shake" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={appClassName}>
      {showDebug && (
        <DebugPanel
          profile={profile}
          autoProfile={autoProfile}
          forcedProfile={forcedProfile}
          setForcedProfile={setForcedProfile}
          state={state}
          sceneOverride={sceneOverride}
          effects={effects}
          addStat={addStat}
          prevScene={prevScene}
          nextScene={nextScene}
          resetAll={resetAll}
          manualOverrides={manualOverrides}
          toggleEffect={toggleEffect}
        />
      )}

      <MyceliumLayer
        ref={myceliumRef}
        blur={effects.blur}
        sleepiness={effects.sleepiness ?? 0}
        floatingTexts={statIndicators}
      />

      {(!metaState || metaState === "reality_check") && (
        <>
          <div className="story-container">
            <DialogueBox
              lines={fullLines}
              effects={effects}
              onFinish={handleDialogueFinish}
            />
          </div>

          <div className="choices-container">
            {isDialogueFinished && !metaState && (
              <ChoiceList
                choices={scene.choices}
                onSelect={handleChoice}
                effects={effects}
              />
            )}
          </div>
        </>
      )}

      {metaState && (
        <MetaOverlay key={metaState} mode={metaState} onComplete={handleMetaComplete} />
      )}

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
