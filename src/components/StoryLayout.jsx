import DebugPanel from "../ui/DebugPanel";
import MyceliumLayer from "../ui/MyceliumLayer";
import DialogueBox from "../ui/DialogueBox";
import ChoiceList from "../ui/ChoiceList";
import ReactionPage from "../ui/ReactionPage";
import ComparisonPage from "../ui/ComparisonPage";
import FinalPage from "../ui/FinalPage";
import MetaOverlay from "../ui/MetaOverlay";
import ReflectionScreen from "../ui/ReflectionScreen";
import VisualNoise from "./VisualNoise";

export default function StoryLayout({ engine, showDebug, onGoodbye, onHome }) {
  const {
    state,
    scene,
    effects,
    fullLines,
    isDialogueFinished,
    metaState,
    statIndicators,
    myceliumRef,
    handleDialogueFinish,
    handleChoice,
    handleMetaComplete,
    resetAll,
    profile,
    autoProfile,
    forcedProfile,
    sceneOverride,
    setForcedProfile,
    addStat,
    toggleEffect,
    nextScene,
    prevScene,
  } = engine;

  const showEnding =
    state.sceneId?.startsWith("ending") || state.sceneId === "reflection";
  const isMetaActive = !!metaState;
  const isReflection = state.sceneId === "reflection";
  const suppressEffects = isMetaActive || isReflection;

  const appClassName = ["app", effects?.screenShake && !suppressEffects ? "shake" : ""]
    .filter(Boolean)
    .join(" ");

  if (isReflection) {
    const goHome = () => {
      resetAll();
      onHome();
    };

    return (
      <div className={appClassName}>
        <ReflectionScreen
          onRestart={goHome}
          onClose={() => onGoodbye()}
          onGoBack={goHome}
        />
      </div>
    );
  }

  if (!scene && !showEnding) {
    return (
      <div className={appClassName}>
        <p>The End</p>
      </div>
    );
  }

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
          manualOverrides={engine.manualOverrides}
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
            <DialogueBox lines={fullLines} effects={effects} onFinish={handleDialogueFinish} />
          </div>

          <div className="choices-container">
            {isDialogueFinished && !metaState && (
              <ChoiceList choices={scene.choices} onSelect={handleChoice} effects={effects} />
            )}
          </div>
        </>
      )}

      {metaState === "reaction_time" && <ReactionPage onNext={handleMetaComplete} />}
      {metaState === "comparison" && <ComparisonPage onContinue={handleMetaComplete} />}
      {metaState === "final" && (
        <FinalPage
          onResults={() => handleMetaComplete()}
          onHome={() => {
            resetAll();
            onHome();
          }}
        />
      )}
      {metaState &&
        (metaState === "personal_stats" ||
          metaState === "cold_facts" ||
          metaState === "reality_check") && (
          <MetaOverlay key={metaState} mode={metaState} onComplete={handleMetaComplete} />
        )}

      {effects?.visualNoise > 0 && <VisualNoise opacity={effects.visualNoise} />}
    </div>
  );
}
