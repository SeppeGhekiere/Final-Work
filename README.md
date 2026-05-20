# The Loop — Doomscroll Experience

An interactive narrative web experience about doomscrolling, digital fatigue, and self-reflection. Created by **Ghekiere Seppe**.

The player progresses through a branching dialogue tree, making choices to scroll or resist. Hidden stats (`time_loss`, `tension`, `awareness`, `resistance`) track the player's behavior and progressively distort the UI — simulating the psychological experience of being lost in a doomscrolling loop. A procedurally generated 3D mycelium network rendered with custom GLSL shaders provides real-time visual feedback.

---

## Tech Stack

- **Vite** + **React 19** — UI framework and build tool
- **Three.js** (`r184`) — custom WebGL rendering for the mycelium
- **Custom GLSL shaders** — vertex displacement and fragment effects
- **@react-three/fiber** — used only for the background silk component
- Pure CSS animations, no game engine

---

## Scene System

### Scene Structure

All scenes are defined in `src/scenes/scenes.js` as a single exported object. Each scene has:

| Field | Description |
|---|---|
| `id` | Unique string identifier (e.g. `"scene1"`, `"scene5_drift"`) |
| `lines[]` | Array of `{ text, pauseAfter }` dialogue objects |
| `choices[]` | Array of `{ text, effects, next }` choice objects |

```js
scene5_reflect: {
    id: "scene5_reflect",
    lines: [
        { text: "Something feels wrong.", pauseAfter: 1300 },
        { text: "Just… empty.", pauseAfter: 1400 },
        { text: "Like time passed without asking you first.", pauseAfter: 0 },
    ],
    choices: [
        { text: "Look away from the screen",    effects: { awareness: 2 }, next: "scene6_awareness" },
        { text: "Return to the feed",           effects: { time_loss: 2 }, next: "scene6_awareness" },
        { text: "Sit with the feeling",         effects: { resistance: 2 }, next: "scene6_awareness" },
        { text: "Distract yourself again",      effects: { time_loss: 2 }, next: "scene6_awareness" },
    ],
}
```

### Navigation Flow

The scene graph branches from `scene1` through 4 emotional paths, then converges through escalating states of immersion:

```
scene1
  ├── scene2_procrastination
  ├── scene2_emotion
  ├── scene2_boredom
  └── scene2_exhaustion
         │
         ├── scene3_scroll  (giving in)
         └── scene3_resist  (resisting)
                │
                ├── scene4_loop
                └── scene4_reflect
                       │
                       ├── scene5_drift
                       └── scene5_reflect
                              │
                              └── scene6_awareness → scene7 → scene8 → scene9 → scene10
                                                                                     │
                                                                                     └── "ending"
                                                                                           │
                                                                                           └── endingA / endingB / endingC / endingD
```

### Scene Engine

`src/engine/sceneEngine.js` — `applyChoice(state, choice)`:

1. Records the choice text and reaction time in `interactionState`
2. Processes reaction time via `stateProcessor.js` (fast clicks <800ms penalize `time_loss` / `tension`; slow clicks >2500ms reward `awareness` / `resistance`)
3. Detects loop patterns (3+ scroll choices in a row adds bonus `time_loss`)
4. Applies `choice.effects` deltas to the player stats
5. Routes: if `choice.next === "ending"`, calls `getEnding(state)` to pick one of 4 endings; otherwise sets `sceneId = choice.next`

### Narrative Augmentation

`src/engine/narrativeEngine.js` — `getAugmentedLines(scene, state)`:

Dynamically injects extra dialogue lines based on player stats (e.g., `"You've been here longer than you think."` when `time_loss > 8` and `sceneNum >= 5`). Lines are appended to the scene's base lines.

### Game State

`src/state/gameState.js` — 4 hidden stats drive the entire experience:

| Stat | Initial | Effect when high |
|---|---|---|
| `time_loss` | 0 | Blur, darkness, memory decay, auto-scroll, text jitter |
| `tension` | 0 | Screen shake, visual noise, drift, pulse speed, red shift |
| `awareness` | 5 | Unlocks clarity; low → high memory decay |
| `resistance` | 3 | Prevents auto-select and choice overriding |

---

## Mycelium & Tube System

### Overview

A procedurally generated 3D network of tube-like structures resembling mycelium (fungal roots). It fills the background of the experience, growing continuously as the camera moves forward. The system lives in `src/three/`.

### Procedural Generation

**Initial nest** (`generateNest` in `TubeGenerator.js`):
- Creates 130 curves (`CURVE_COUNT`) using `buildCurvePoints()`
- Each curve: 55 random walk points → `THREE.CatmullRomCurve3` smooth spline
- Curves snap to existing "snap points" (start, 25%, 50%, 75%, end of each tube), forming an interconnected web
- Tubes are weakly pulled toward center (1% lerp) to keep the nest compact
- Direction is constrained to have a minimum Z component (no purely vertical tubes)

**Continuous generation** (`generateNewTubes`):
- Every frame, if the camera has advanced enough past `lastGeneratedZ`, a batch of 20 new tubes is generated ahead
- New tubes use the last 50 snap points as connection anchors
- Ensures the mycelium always fills the space ahead of the camera

### Tube Geometry

`src/three/TubeGeometry.js` — `createSolidTubeGeometry(curve, radius, reverseDirection)`:

- Samples 50 segments along the curve
- For each segment: center vertex + 24 radial vertices forming a circle
- Builds triangle indices for the outer cylinder wall and capped ends
- Each vertex gets a custom attribute `aAlong` (0.0 → 1.0 along tube length), critical for shader effects (growth, pulse)
- If `reverseDirection` is true, `aAlong` is flipped so growth animates in the correct direction

### Growth & Shrink Animation

- **Spawn**: `spawnTime` is recorded on creation. Each frame, `uGrowth` ramps from 0 → 1 over 1.5 seconds. The fragment shader discards fragments where `vAlong > uGrowth`, making the tube appear to grow from its origin.
- **Despawn**: Tubes more than 30 units behind the camera get `despawnTime` set. `uGrowth` shrinks from current → 0 over 1.5 seconds, then geometry/material are disposed.

### Camera Motion

The camera moves forward along the Z-axis at a base speed of 0.05 units/frame, with a boost proportional to `tension` (up to +0.05 additional). It weaves sinusoidally in X and Y (amplitudes 6 and 4, respectively) for a floating, exploratory feel.

### React-to-Three.js Bridge

`src/ui/MyceliumLayer.jsx` mounts a `MyceliumWorld` instance into a container div. The Three.js renderer canvas is appended directly to the DOM. The `blur` prop applies CSS blur/scale to the layer, and `sleepiness` controls a darkness overlay. Floating text indicators (stat messages) are rendered as billboarded `PlaneGeometry` meshes in the 3D scene.

---

## Shaders

`src/three/shaders.js` — Custom `ShaderMaterial` with two programs:

### Vertex Shader

Inputs: `aAlong` (attribute), `time`, `uNoiseAmp`, `uNoiseSpeed`, `uNoiseFreq`, `uTimeLoss`

- **Sway**: Noise-driven horizontal (XY) displacement along the tube. Angle from `noise(aAlong*2, 0, time*speed*0.3)`, magnitude from `noise(aAlong*3, 1, time*speed*0.4)`. Magnitude scaled by `uNoiseAmp * (1 + uTimeLoss * 0.15)` — time_loss amplifies the writhing.
- **Local noise**: Per-vertex displacement along the normal using noise at `(position * freq * distortion + time * speed * 0.5)`. Adds surface bumpiness, also amplified by time_loss.
- Outputs: `vAlong`, `vWorldPosition` (world-space for fragment distance calculations), `vDepth` (for depth fading).

### Fragment Shader

Inputs: `uGrowth`, `uPulse`, `uSpatialWave`, `uRedPulseTime`, `uTension`, `uTimeLoss`, `uGlowIntensity`, `uGlowColor`, `uCameraPos`

Processing order:

1. **Growth cull** — discard if `vAlong > uGrowth`
2. **Proximity mask** — discard within 6 units of camera (prevents blocking view)
3. **Darkness** — base color `rgb(0.8, 0.5, 0.1)` × `(1 - uTimeLoss * 0.05)`, clamped to [0.2, 1.0]. More time_loss = darker mycelium.
4. **Color noise** — subtle 3D noise variation on the base color.
5. **Pulse effect** — two modes:
   - *Spatial wave*: a bright band sweeps along the Z-axis. Speed increases with tension (`pulseSpeedMultiplier = 1 + uTension * 0.3`).
   - *Along-tube*: a 2-cycle repeating pulse travels along `vAlong`.
   - Pulse color shifts from warm orange to deep red as tension rises.
6. **Red pulse** — triggered externally via `triggerPulse()`. A solid red wave propagates outward from `cameraZ - 15` at 20 units/sec for 5 seconds. Pure red is mixed in.
7. **Glow** — sinusoidal wave along tube `sin(vAlong * 8 - time * 1.5 * speedMultiplier)`. Intensity: `uGlowIntensity * (1 + uTension * 0.2)`. Color shifts red with tension.
8. **Rim lighting** — screen-space derivatives compute surface normal; edge highlight colored with glow color.
9. **Depth fade** — `exp(-vDepth * 0.04)` attenuates distant tubes.

---

## Effects System

The effects system translates the 4 hidden stats into escalating UI/UX distortions. It has 3 layers:

### Layer 1 — Simulation Profiles

`getSimulationProfile(state)` selects one of 5 profiles based on stat thresholds:

| Profile | Threshold | textSpeed | blur | textJitter | inputDelay | choiceFade | choiceStability | disappearChance | autoScroll |
|---|---|---|---|---|---|---|---|---|---|
| **neutral** | (default) | 1.0x | 0 | 0 | 0ms | 0 | 1.0 | 0% | false |
| **deep_scroll** | `time_loss>12 && awareness<3` | 1.3x | 3 | 0.5 | 250ms | 0.3 | 0.6 | 20% | true |
| **aware_loop** | `time_loss>10 && awareness>=4` | 1.1x | 1 | 0.3 | 350ms | 0.2 | 0.7 | 10% | false |
| **breaking** | `resistance>8 && awareness>=5` | 0.9x | 0 | 0 | 0ms | 0 | 1.0 | 0% | false |
| **uneasy** | `tension>6` | 1.0x | 1 | 0.2 | 150ms | 0.1 | 0.85 | 5% | false |

Each parameter affects the UI as follows:

| Parameter | Consumed by | Effect |
|---|---|---|
| `textSpeed` | DialogueBox | Typewriter speed multiplier |
| `blur` | MyceliumLayer | CSS `filter: blur(Npx)` on background |
| `textJitter` | DialogueBox | Horizontal `translateX(sin(i) * N * 5)` per line |
| `inputDelay` | ChoiceList | Milliseconds before choices become clickable |
| `choiceFade` | ChoiceList | Opacity reduction on visible choices |
| `choiceStability` | ChoiceList | Probability each choice stays visible on mount |
| `disappearChance` | ChoiceList | Per-choice probability of vanishing after 1s |
| `autoScroll` | App | `window.scrollBy(0, 1)` every 50ms |

### Layer 2 — Scene-Specific Overrides

`sceneEffects` in `effects.js` override specific values per scene, escalating toward the end:

| Scene | Override |
|---|---|
| `scene3_scroll` | `blur: 1, choiceFade: 0.1` |
| `scene3_resist` | `autoScroll: false` |
| `scene4_loop` | `blur: 2, inputDelay: 200` |
| `scene4_reflect` | `autoScroll: false` |
| `scene6_awareness` | `blur: 3, textJitter: 0.4, disappearChance: 0.15` |
| `scene7` | `inputDelay: 400, textJitter: 0.2` |
| `scene8` | `disappearChance: 0.3, inputDelay: 500` |
| `scene9` | `choiceFade: 0.4, blur: 2` |
| `scene10` | `inputDelay: 800, disappearChance: 0.5` |

These merge on top of the active profile via object spread (`{ ...profile, ...override }`).

### Layer 3 — Derived Effects

`getEffects()` computes additional effects from individual stats:

| Effect | From | Formula | Component |
|---|---|---|---|
| `sleepiness` | time_loss | `min(t^1.2 * 0.05, 0.75)` | MyceliumLayer darkness overlay |
| `drift` | tension | `min((t+1)^1.1 * 0.06, 3)` | ChoiceList CSS drift animation |
| `timeJump` | time_loss | `t >= 8` (30% chance) | DialogueBox "Time passes..." overlay |
| `jitter` | tension | `min(t * 0.1, 0.5)` | App CSS class |
| `screenShake` | tension | `t >= 5` | App CSS `shake` class |
| `visualNoise` | tension | `min(t / 20, 0.4)` | App SVG noise overlay |
| `memoryDecay` | awareness | `max(0, (10 - a) / 10)` | DialogueBox line opacity fade |
| `autoSelect` | resistance | `r <= 1` | ChoiceList auto-picks after 15s |
| `overrideChoices` | resistance | `r <= 2` | ChoiceList disables healthy choices for 5s |

Additionally, the **MyceliumWorld** reads `tension` and `time_loss` directly from `gameState` each frame to drive shader uniforms (pulse speed, color, darkness, vertex distortion).

### Data Flow

```
Player clicks a choice
  → choice.effects applied to gameState (sceneEngine.applyChoice)
  → reaction time + loop pattern processed (stateProcessor)
  → getEffects() recomputed:
      → getSimulationProfile(state) picks profile
      → profile merged with scene-specific overrides
      → derived effects computed from individual stats
  → useGameEngine merges with manualOverrides (debug panel)
  → Effects passed as props:
      DialogueBox   → textSpeed, textJitter, timeJump, memoryDecay
      ChoiceList    → inputDelay, choiceFade, choiceStability, disappearChance,
                      drift, autoSelect, overrideChoices
      MyceliumLayer → blur, sleepiness
      App           → jitter (CSS), screenShake (CSS), visualNoise (overlay)
      MyceliumWorld → tension, time_loss (shader uniforms)
  → If choice.next === "ending":
      → getEnding(state) picks endingA/B/C/D
      → MetaOverlay shown (personal_stats → cold_facts → thank_you)
      → ReflectionScreen with reaction chart + psychoeducational content
```

### Ending Determination

When a choice has `next: "ending"`, the scene engine calls `getEnding(state)`:

| Ending | Condition |
|---|---|
| `endingA` | `time_loss >= 12 && awareness <= 3` — lost in the scroll |
| `endingB` | `time_loss >= 10 && awareness >= 5` — aware but still scrolling (fallback) |
| `endingC` | `resistance >= 8 && awareness >= 5` — broke the loop |
| `endingD` | `tension >= 6` — overwhelmed by anxiety |

After the ending, a meta overlay shows personal stats, doomscrolling facts, and a thank-you screen, then transitions to the ReflectionScreen with a reaction-time chart and practical advice.

---

## Project Structure

```
src/
├── App.jsx                     # Root app: routing, effects consumption, UI layout
├── main.jsx                    # Entry point
├── index.css                   # Global styles + CSS animations
│
├── scenes/
│   └── scenes.js               # All scene definitions (dialogue + choices)
│
├── engine/
│   ├── sceneEngine.js          # applyChoice: stat effects, scene routing, ending dispatch
│   ├── narrativeEngine.js      # Dynamic dialogue line injection
│   ├── effects.js              # Simulation profiles, scene overrides, derived effects, endings
│   └── stateProcessor.js       # Reaction time processing, loop pattern detection
│
├── hooks/
│   ├── useGameEngine.js        # Central orchestrator: state, effects merging, scene lifecycle
│   ├── useTypewriter.js        # Typewriter animation hook
│   └── useSound.js             # Audio context + room sound
│
├── state/
│   ├── gameState.js            # Mutable game state object + updateState()
│   └── interactionState.js     # Choice history, reaction times, hesitation tracking
│
├── three/
│   ├── MyceliumWorld.js        # Three.js scene, camera, animation loop, floating texts
│   ├── TubeGenerator.js        # Procedural curve generation (nest + continuous)
│   ├── TubeGeometry.js         # CatmullRomCurve3 → solid tube mesh with aAlong attribute
│   └── shaders.js              # Custom GLSL vertex + fragment shaders
│
├── ui/
│   ├── DialogueBox.jsx         # Typewriter-rendered scene lines
│   ├── ChoiceList.jsx          # Choice buttons with all effect-driven behaviors
│   ├── MyceliumLayer.jsx       # React wrapper for Three.js mycelium world
│   ├── Background.jsx          # Silk shader background
│   ├── MetaOverlay.jsx         # Post-ending overlay (stats, facts, thank-you)
│   ├── ReflectionScreen.jsx    # Final reflection with reaction chart
│   ├── HomePage.jsx            # Landing page
│   ├── InfoPage.jsx            # About/info page
│   ├── ProjectPage.jsx         # Project credits page
│   ├── AudioPrompt.jsx         # Audio permission prompt
│   └── DebugPanel.jsx          # Debug panel (press P) for stat/effect manipulation
│
├── analytics/
│   └── logEvent.js             # Choice event logging
│
├── events/
│   ├── factData.js             # Doomscrolling statistics for cold_facts overlay
│   └── personalStats.js        # analyzePersonalStats() for meta overlay
│
└── components/
    └── Silk/
        └── Silk.jsx            # @react-three/fiber background shader component
```
