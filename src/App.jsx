import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useGameEngine } from "./hooks/useGameEngine";
import { useAudioInit } from "./hooks/useAudioInit";
import { useKeyboardShortcut } from "./hooks/useKeyboardShortcut";

import SeoHelmet from "./components/SeoHelmet";
import StoryLayout from "./components/StoryLayout";
import GoodbyeScreen from "./components/GoodbyeScreen";

import HomePage from "./ui/HomePage";
import InfoPage from "./ui/InfoPage";
import ProjectPage from "./ui/ProjectPage";
import AudioPrompt from "./ui/AudioPrompt";

export default function App() {
  const navigate = useNavigate();
  const engine = useGameEngine();
  const [showDebug, setShowDebug] = useState(false);
  const [showGoodbye, setShowGoodbye] = useState(false);

  useAudioInit();
  useKeyboardShortcut("p", () => setShowDebug((prev) => !prev));

  const go = (path) => () => navigate(path);

  const goHome = () => {
    setShowGoodbye(false);
    setShowDebug(false);
    navigate("/");
  };

  if (showGoodbye) {
    return <GoodbyeScreen />;
  }

  return (
    <>
      <SeoHelmet />
      <Routes>
        <Route
          path="/"
          element={<HomePage onStart={go("/info")} onInfo={go("/info")} onProject={go("/project")} />}
        />
        <Route
          path="/info"
          element={<InfoPage onHome={go("/")} onProject={go("/project")} onStart={go("/audio-prompt")} />}
        />
        <Route
          path="/project"
          element={<ProjectPage onHome={go("/")} onInfo={go("/info")} onStart={go("/audio-prompt")} />}
        />
        <Route
          path="/audio-prompt"
          element={<AudioPrompt onContinue={go("/story")} />}
        />
        <Route
          path="/story"
          element={
            <StoryLayout
              engine={engine}
              showDebug={showDebug}
              onGoodbye={() => setShowGoodbye(true)}
              onHome={goHome}
            />
          }
        />
      </Routes>
    </>
  );
}
