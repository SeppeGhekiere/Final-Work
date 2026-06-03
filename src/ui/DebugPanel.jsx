import { getEffects } from "../engine/effects";

export default function DebugPanel({
  profile,
  autoProfile,
  forcedProfile,
  setForcedProfile,
  state,
  sceneOverride,
  effects,
  addStat,
  prevScene,
  nextScene,
  resetAll,
  manualOverrides,
  toggleEffect,
}) {
  return (
    <div className="debug-panel">
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
            : <span style={{ color: '#666' }}>(none)</span>}
        </div>
      </div>

      <div className="debug-section">
        <div className="debug-section-title">STATE VALUES</div>
        <div className="debug-row">
          time_loss: <strong>{state.time_loss}</strong> |
          tension: <strong>{state.tension}</strong> |
          awareness: <strong>{state.awareness}</strong> |
          resistance: <strong>{state.resistance}</strong>
        </div>
      </div>

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
        </div>
        <div className="debug-row">
          disappearChance:{getEffects(state, profile).disappearChance?.toFixed(2) || 0}
          {' | '}textSpeed:{getEffects(state, profile).textSpeed?.toFixed(1) || 1}
        </div>
      </div>

      <div className="debug-section">
        <div className="debug-section-title">SCENE OVERRIDE (raw)</div>
        <div className="debug-row">
          {Object.keys(sceneOverride).length > 0
            ? Object.entries(sceneOverride).map(([k, v]) => `${k}:${v}`).join(' | ')
            : <span style={{ color: '#666' }}>(none)</span>}
        </div>
      </div>

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
        </div>
        <div className="debug-row">
          disappearChance:{effects.disappearChance?.toFixed(2)}
          {' | '}textSpeed:{effects.textSpeed?.toFixed(1)}
        </div>
      </div>

      <div className="debug-section">
        <div className="debug-section-title">LEGACY EFFECTS</div>
        <div className="debug-row">
          sleepiness:{effects.sleepiness?.toFixed(2)}
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
        <div className="debug-section-title" style={{ marginTop: '8px' }}>SCENE NAVIGATION</div>
        <div className="debug-buttons-row">
          <button onClick={prevScene}>Prev Scene</button>
          <button onClick={nextScene}>Next Scene</button>
          <button onClick={resetAll}>Reset All</button>
        </div>
      </div>

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
            className={manualOverrides.choiceFade > 0 ? "active" : ""}
            onClick={() => toggleEffect("choiceFade", [0, 0.3, 0.6])}
          >
            ChoiceFade: {manualOverrides.choiceFade}
          </button>
          <button
            className={manualOverrides.textJitter > 0 ? "active" : ""}
            onClick={() => toggleEffect("textJitter", [0, 0.5, 1])}
          >
            TextJitter: {manualOverrides.textJitter}
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
  );
}
