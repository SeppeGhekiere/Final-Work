import { useState, useRef } from "react";
import * as THREE from "three";
import { scenes } from "./scenes/scenes";
import { getEffects } from "./engine/effects";
import { applyChoice } from "./engine/sceneEngine";
import { gameState, updateState } from "./state/gameState";

import DialogueBox from "./ui/DialogueBox";
import ChoiceList from "./ui/ChoiceList";
import MyceliumLayer from "./ui/MyceliumLayer";

export default function App() {
  const [isDialogueFinished, setIsDialogueFinished] = useState(false);
  const [, rerender] = useState(0);
  const myceliumRef = useRef(null);

  // Sync React state from shared gameState
  const state = gameState;
  const scene = scenes[state.sceneId];
  const effects = {
    ...getEffects(state),
    ...(scene?.getSceneEffects ? scene.getSceneEffects(state) : {})
  };

  if (!scene) {
    return <div className="app"><p>The End</p></div>;
  }

  const handleChoice = (choice) => {
    const newState = applyChoice(gameState, choice);
    updateState(newState);
    setIsDialogueFinished(false);
    rerender(n => n + 1);
    myceliumRef.current?.triggerPulse(new THREE.Vector3(1.0, 0.0, 0.0));
  };

  return (
    <div
      className="app"
      style={{
        filter: `blur(${effects.blur}px)`,
        transform: `scale(${1 - effects.blur * 0.002})`
      }}
    >
      <MyceliumLayer ref={myceliumRef} />

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
    </div>
  );
}
