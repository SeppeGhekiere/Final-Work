# Customer Journey: The Loop

> An interactive narrative experience about attention, habit, and the quiet loss of time.

---

## 1. Entry Points

### Homepage (`ui/HomePage.jsx`)

The entry point to the experience. A landing page with:

- **Logo:** "The Loop"
- **Heading:** "Realize what happens when you keep scrolling"
- **Subheading:** "An interactive experience about attention, habit, and quiet loss of time."
- **Hero SVG** (`/image_hero_homepage.svg`)
- **Quote:** Susan Albers — *"A lot of times, you might not even be aware you're doing it."*
- **Subhero text:** Explains the loop concept — *"What you're about to experience is a loop, the same one that plays out every time you reach for your phone without thinking."*

#### Navigation buttons

| Button | Action | Destination |
|--------|--------|-------------|
| "Find Out" (hero) | `go("info")` | Info page |
| "Info" (nav) | `go("info")` | Info page |
| "Project" (nav) | `go("project")` | Project page |

---

## 2. Pre-Story Flow

### Info Page (`ui/InfoPage.jsx`)

- **Nav:** "The Loop" (home) | Info (current) | Project (link)
- **Content:**
  - "What is this?" — An interactive narrative about scrolling
  - "It follows the shape of a familiar loop..."
  - "There are no scores, no right answers..."
  - "It takes about five minutes."
- **Button:** "Begin" → Audio Prompt page

### Project Page (`ui/ProjectPage.jsx`)

- **Nav:** "The Loop" (home) | Info (link) | Project (current)
- **Sections:** What it is, Why it exists, How it works, What it wants, The mycelium metaphor
- **Button:** "Begin" → Audio Prompt page

### Audio Prompt (`ui/AudioPrompt.jsx`)

- Headphone + Volume SVG icons
- "We recommend using headphones and turning the volume up"
- **Button:** "Begin" → Story mode (triggers game engine)

### Session Initialization

On first story enter:
- `sessionId` generated via `crypto.randomUUID()`, stored in `localStorage`
- Heartbeat POST to `/api/heartbeat` every 10 seconds
- Ambient room sound starts on first click (`playRoomSound`)
- Audio context initialized

---

## 3. The Game Engine

### Core Architecture

```
App.jsx (page router)
  └── useGameEngine.js (state orchestration)
       ├── gameState.js (mutable stats object)
       ├── interactionState.js (choice history + reaction times)
       ├── sceneEngine.js (applyChoice, onSceneEnter)
       ├── effects.js (profiles, endings, derived effects)
       ├── narrativeEngine.js (dynamic dialogue injection)
       └── stateProcessor.js (reaction time + loop patterns)
```

### Initial Game State (`state/gameState.js`)

```js
{
  sceneId: "scene1",
  sessionId: "<uuid>",
  time_loss: 0,
  tension: 0,
  awareness: 5,
  resistance: 3,
  lastSceneEnterTime: Date.now()
}
```

### Interaction State (`state/interactionState.js`)

```js
{
  clickTimes: [],        // reaction times per choice (ms)
  history: [],           // choice text strings in order
  hesitationScore: 0,
  lastReactionTime: 0
}
```

### State Processor (`engine/stateProcessor.js`)

After every choice, reaction time is analyzed:

| Reaction Time | Effect |
|---------------|--------|
| < 800ms (impulsive) | `time_loss +1`, `tension +0.5` |
| > 2500ms (mindful) | `awareness +1`, `resistance +0.5`, `hesitationScore +1` |

**Loop pattern detection:** If the last 3 choices are scroll-type keywords ("scroll", "keep", "continue", "one more", "check", "open"), then `time_loss +2`, `tension +1`.

### Scene Engine (`engine/sceneEngine.js`)

**`onSceneEnter()`:** Records timestamp for reaction time measurement.

**`applyChoice(state, choice)` flow:**
1. Record choice text in interaction history
2. Process reaction time (stateProcessor)
3. Detect loop patterns
4. Apply choice's `effects` to state (e.g., `{ tension: 2, awareness: 1 }`)
5. If `choice.next === "ending"`, call `getEnding(state)` for ending determination
6. Otherwise, set `state.sceneId = choice.next`

---

## 4. Scene-by-Scene Breakdown

### Scene 1: The Hook

**Lines:**
1. "Think back." [700ms pause]
2. "The last time you picked up your phone…" [900]
3. "Not because you needed to." [800]
4. "Just… because." [1000]
5. "" [700]
6. "Five minutes later..." [900]
7. "where were you?" [1000]
8. "" [800]
9. "This isn't where it starts." [900]
10. "Scrolling comes later." [900]
11. "It starts here." [900]
12. "" [700]
13. "What are you avoiding right now?" [0]

**Choices:**

| Choice | Effects | Next Scene |
|--------|---------|------------|
| "Something I should be doing" | `tension +2` | `scene2_procrastination` |
| "Something I don't want to feel" | `tension +2`, `awareness +1` | `scene2_emotion` |
| "Nothing… just bored" | `awareness +1` | `scene2_boredom` |
| "I'm just tired" | `tension +1` | `scene2_exhaustion` |

---

### Scene 2: Branching (4 emotional paths)

#### scene2_procrastination
**Lines:** "The task is still there." / "Waiting." / "You know you should start." / "It's not even that hard." / "Just… heavy." / "I'll just check something quickly first." / "You unlock your phone." / "You don't even remember deciding to."

| Choice | Effects | Next |
|--------|---------|------|
| "Check one thing quickly" | `time_loss +2` | `scene3_scroll` |
| "Stare at the task instead" | `tension +2`, `awareness +1` | `scene3_resist` |
| "Open something random" | `time_loss +3` | `scene3_scroll` |
| "Start a tiny part of the task" | `resistance +2` | `scene3_resist` |

#### scene2_emotion
**Lines:** "Something feels off." / "You don't really want to sit with it." / "It would take effort to figure out why." / "And you're not sure you want the answer." / "So you reach for something easier."

| Choice | Effects | Next |
|--------|---------|------|
| "Scroll to distract myself" | `time_loss +3` | `scene3_scroll` |
| "Try to name the feeling" | `awareness +2`, `tension +2` | `scene3_resist` |
| "Open something loud/fast" | `time_loss +2` | `scene3_scroll` |
| "Sit in silence for a moment" | `resistance +2` | `scene3_resist` |

#### scene2_boredom
**Lines:** "Nothing is happening." / "No urgency." / "No stimulation." / "Just… space." / "Your brain doesn't like that." / "It wants something." / "Anything."

| Choice | Effects | Next |
|--------|---------|------|
| "Open my phone" | `time_loss +2` | `scene3_scroll` |
| "Look around instead" | `awareness +2` | `scene3_resist` |
| "Scroll out of habit" | `time_loss +3` | `scene3_scroll` |
| "Stay with the boredom" | `resistance +2` | `scene3_resist` |

#### scene2_exhaustion
**Lines:** "You're tired." / "The kind of tired that doesn't go away quickly." / "You don't want to think." / "You don't want effort." / "You just want something easy." / "Something that feels like rest."

| Choice | Effects | Next |
|--------|---------|------|
| "Watch something to relax" | `time_loss +3` | `scene3_scroll` |
| "Try to sleep" | `resistance +2` | `scene3_resist` |
| "Scroll mindlessly" | `time_loss +3` | `scene3_scroll` |
| "Put the phone away" | `awareness +2` | `scene3_resist` |

---

### Scene 3: Merged Paths (2 variants)

#### scene3_scroll
**Lines:** "At first, it feels small." / "Harmless." / "Something to fill the gap." / "Your thumb keeps moving." / "Your mind drifts somewhere softer."
**Scene override:** blur +1, choiceFade +0.1

| Choice | Effects | Next |
|--------|---------|------|
| "Stay here a little longer" | `time_loss +2` | `scene4_loop` |
| "Look for something interesting" | `time_loss +3` | `scene4_loop` |
| "Pause for a second" | `awareness +1` | `scene4_reflect` |
| "Try to focus again" | `resistance +2` | `scene4_reflect` |

#### scene3_resist
**Lines:** "The room feels strangely quiet." / "Too quiet." / "Without distraction, everything becomes noticeable again." / "Reaching for the phone suddenly feels easier than sitting here."
| Choice | Effects | Next |
|--------|---------|------|
| "Check something quickly" | `time_loss +2` | `scene4_loop` |
| "Wait a little longer" | `resistance +2` | `scene4_reflect` |
| "Look around the room" | `awareness +2` | `scene4_reflect` |
| "Give in to the habit" | `time_loss +2` | `scene4_loop` |

---

### Scene 4: Loop vs Reflect

#### scene4_loop
**Lines:** "The light outside changes slowly." / "You barely notice it." / "A message appears." / "Then it disappears beneath everything else." / "Nothing you see feels important." / "But stopping feels harder now."
**Scene override:** blur +2, inputDelay +200

| Choice | Effects | Next |
|--------|---------|------|
| "Keep going" | `time_loss +3` | `scene5_drift` |
| "Switch to something else" | `time_loss +2` | `scene5_drift` |
| "Check the time" | `awareness +1` | `scene5_reflect` |
| "Put the phone down for a moment" | `resistance +2` | `scene5_reflect` |

#### scene4_reflect
**Lines:** "You stop moving for a moment." / "The silence feels unfamiliar." / "You suddenly become aware of your body again." / "Your posture." / "Your eyes burning slightly." / "You don't remember how long you've been sitting here."

| Choice | Effects | Next |
|--------|---------|------|
| "Go back" | `time_loss +2` | `scene5_drift` |
| "Stay in the silence" | `awareness +2` | `scene5_reflect` |
| "Stand up for a second" | `resistance +2` | `scene5_reflect` |
| "Ignore the feeling" | `tension +2` | `scene5_drift` |

---

### Scene 5: Final Convergence

#### scene5_drift
**Lines:** "The content changes." / "Then changes again." / "You stop remembering what you just watched." / "Your thumb moves before you think." / "It almost feels calming." / "Not having to choose anything."

| Choice | Effects | Next |
|--------|---------|------|
| "Stay in the loop" | `time_loss +3` | `scene6_awareness` |
| "Slow down slightly" | `awareness +1` | `scene6_awareness` |
| "Keep searching for something better" | `time_loss +2` | `scene6_awareness` |
| "Try to stop thinking" | `tension +1` | `scene6_awareness` |

#### scene5_reflect
**Lines:** "Something feels wrong." / "Not dangerous." / "Not dramatic." / "Just… empty." / "Like time passed without asking you first."

| Choice | Effects | Next |
|--------|---------|------|
| "Look away from the screen" | `awareness +2` | `scene6_awareness` |
| "Return to the feed" | `time_loss +2` | `scene6_awareness` |
| "Sit with the feeling" | `resistance +2` | `scene6_awareness` |
| "Distract yourself again" | `time_loss +2` | `scene6_awareness` |

---

### Scenes 6-10: Linear Escalation

#### scene6_awareness
**Lines:** "It doesn't feel like long." / "But it is." / "Minutes blur together." / "Or maybe longer." / "You weren't counting."
**Scene override:** blur +3, textJitter +0.4

| Choice | Effects | Next |
|--------|---------|------|
| "Keep scrolling" | `time_loss +3` | `scene7` |
| "Check the time" | `awareness +1` | `scene7` |
| "Switch to something else" | `time_loss +2` | `scene7` |
| "Pause for a second" | `awareness +1` | `scene7` |

#### scene7
**Lines:** "You hesitate." / "Just for a second." / "Something feels… off." / "Like you've been here longer than you meant to." / "But you're already mid-scroll."
**Scene override:** inputDelay +400, textJitter +0.2

| Choice | Effects | Next |
|--------|---------|------|
| "Ignore it" | `time_loss +3` | `scene8` |
| "Try to remember why you opened it" | `awareness +2` | `scene8` |
| "Keep going anyway" | `time_loss +3` | `scene8` |
| "Slow down" | `resistance +1` | `scene8` |

#### scene8
**Lines:** "You notice the loop now." / "The way one thing leads to another." / "It's not random." / "It keeps you here." / "Knowing that… doesn't stop it."
**Scene override:** inputDelay +500

| Choice | Effects | Next |
|--------|---------|------|
| "Keep scrolling" | `time_loss +3` | `scene9` |
| "Try to stop" | `resistance +3` | `scene9` |
| "Just one more" | `time_loss +2` | `scene9` |
| "Put the phone down" | `awareness +2` | `scene9` |

#### scene9
**Lines:** "You tell yourself it's fine." / "Everyone does this." / "It's just a break." / "Just a moment." / "But it hasn't been a moment." / "Not for a while."
**Scene override:** choiceFade +0.4, blur +2

| Choice | Effects | Next |
|--------|---------|------|
| "Continue" | `time_loss +3` | `scene10` |
| "Stop now" | `resistance +3` | `scene10` |
| "Think about why" | `awareness +2` | `scene10` |
| "Just one more minute" | `time_loss +2` | `scene10` |

#### scene10
**Lines:** "This is the moment." / "You could stop here." / "Or not." / "It doesn't feel like a big decision." / "But it is."
**Scene override:** inputDelay +800

| Choice | Effects | Next |
|--------|---------|------|
| "Keep going" | `time_loss +3` | → ending |
| "Stop" | `resistance +3` | → ending |
| "Pause" | `awareness +2` | → ending |
| "Ignore the thought" | `tension +2` | → ending |

All choices trigger ending evaluation via `getEnding(state)`.

---

## 5. Dynamic Narrative Augmentation (`engine/narrativeEngine.js`)

Additional lines injected based on player state:

| Condition | Injected Line |
|-----------|---------------|
| scene >= 5 AND time_loss > 8 | "You've been here longer than you think." |
| scene >= 5 AND awareness > 5 | "You notice it happening." |
| scene >= 6 AND tension > 6 | "Something doesn't feel right." |
| scene >= 3 AND awareness > 6 | "You notice yourself scrolling." |
| scene >= 8 AND hesitationScore > 2 | "You're hesitating more now." |
| scene >= 8 AND time_loss > 10 | "You don't remember how long you've been here." |
| scene >= 8 AND resistance > 5 | "You feel the pull, but you're fighting it." |

---

## 6. Simulation Profiles (`engine/effects.js`)

Stats are mapped to 5 profiles that alter the UI experience:

| Profile | Threshold | textSpeed | blur | jitter | inputDelay | choiceFade | choiceStability |
|---------|-----------|-----------|------|--------|------------|------------|-----------------|
| neutral | (default) | 1.0× | 0 | 0 | 0ms | 0 | 1.0 |
| deep_scroll | time_loss > 12 AND awareness < 3 | 1.3× | 3 | 0.5 | 250ms | 0.3 | 0.6 |
| aware_loop | time_loss > 10 AND awareness >= 4 | 1.1× | 1 | 0.3 | 350ms | 0.2 | 0.7 |
| breaking | resistance > 8 AND awareness >= 5 | 0.9× | 0 | 0 | 0ms | 0 | 1.0 |
| uneasy | tension > 6 | 1.0× | 1 | 0.2 | 150ms | 0.1 | 0.85 |

### Cumulative Derived Effects

Beyond the profile, raw stats produce additional effects:

| Effect | Formula | Component |
|--------|---------|-----------|
| blur | profile.blur + min(time_loss^1.2 × 0.08, 4) | MyceliumLayer CSS filter |
| sleepiness | min(time_loss^1.2 × 0.05, 0.75) | MyceliumLayer darkness |
| drift | min((tension+1)^1.1 × 0.06, 3) | ChoiceList CSS drift |
| jitter | min(tension × 0.1, 0.5) | CSS class |
| screenShake | tension >= 5 | App CSS shake class |
| visualNoise | min(tension / 20, 0.4) | SVG noise overlay |
| memoryDecay | max(0, (5 - awareness) / 5) | DialogueBox line fade |
| timeJump | time_loss >= 8 (30% chance) | "Time passes..." overlay |
| autoSelect | resistance <= 1 | Auto-picks choice after 15s |
| overrideChoices | resistance <= 2 | Healthy choices disabled 5s |

### Scene-Specific Overrides

| Scene | Overrides |
|-------|-----------|
| scene3_scroll | blur +1, choiceFade +0.1 |
| scene4_loop | blur +2, inputDelay +200 |
| scene6_awareness | blur +3, textJitter +0.4 |
| scene7 | inputDelay +400, textJitter +0.2 |
| scene8 | inputDelay +500 |
| scene9 | choiceFade +0.4, blur +2 |
| scene10 | inputDelay +800 |

---

## 7. Ending Determination (`engine/effects.js`)

`getEnding(state)` checks conditions in order. First match wins:

| Ending | Condition | Meaning |
|--------|-----------|---------|
| **endingA** | time_loss >= 12 AND awareness <= 3 | Deep doomscroll — lost time, low awareness |
| **endingB** | time_loss >= 10 AND awareness >= 5 | Aware loop — noticed but kept scrolling |
| **endingC** | resistance >= 8 AND awareness >= 5 | Breaking free — fought the pull |
| **endingD** | tension >= 6 | Uneasy — anxious restlessness |
| **endingB** | (fallback) | Defaults to aware loop |

---

## 8. Transition to Meta Overlays

When `handleChoice` detects `choice.next === "ending"`:

```
scene10 choice made
    │
    ├── applyChoice() runs stateProcessor (reaction time + loops)
    ├── getEnding(state) determines endingA/B/C/D
    ├── updateState({ ...newState, sceneId: originalSceneId }) // preserve old scene
    └── setMetaState("personal_stats")
```

The ending sceneId is NOT set as the active scene. Instead, the old sceneId is preserved and the meta overlay sequence begins.

---

## 9. Meta Overlay Sequence

### Phase 1: personal_stats (`MetaOverlay.jsx`)

- Shown 3 seconds after ending triggers
- Fetches stats from `analyzePersonalStats()` in `events/personalStats.js`
- **Always shown:**
  - "You chose to continue scrolling **{N}** times."
  - "Average decision time: **{X}m {Y}s**"
- **Conditional:**
  - "Most of your choices were made impulsively." (if >50% fast clicks)
  - "You hesitated less and less over time." (if trend = less)
  - "You hesitated more as time went on." (if trend = more)
- **Button:** "Continue"

### Phase 2: cold_facts

- 3 facts displayed one at a time, 4-second delay before button
- **Fact 1:** "The average person touches their phone over 2,000 times a day." — *"Most of those interactions happen automatically."*
- **Fact 2:** "Short-form feeds are designed around rapid decision making." — *"Swipe. Judge. Repeat."*
- **Fact 3:** "People often report feeling less rested after doomscrolling even though they opened their phone to relax."
- **Button:** "Next" (facts 1-2) / "Continue" (last fact)

### Phase 3: thank_you

- 3.5-second delay before button
- **THE LOOP** (large, 3rem)
- *"Thank you for noticing."*
- "A project by Ghekiere Seppe"
- **Button:** "See Results"

### Transition to Reflection

```
"See Results" clicked
    │
    ├── setMetaState returns null (thank_you → null)
    ├── useEffect detects metaState: "thank_you" → null
    ├── setIsDialogueFinished(false)
    ├── updateState({ sceneId: "reflection", tension: 0 })
    └── setRerenderKey(n+1) triggers re-render
    │
    ▼
App.jsx renders <ReflectionScreen>
```

---

## 10. Reflection Screen (`ui/ReflectionScreen.jsx`)

### Dynamic Personal Lines (based on final state)

| Condition | Line |
|-----------|------|
| time_loss >= 10 | "You stayed longer than you probably meant to." |
| awareness >= 5 | "You noticed what was happening." |
| resistance >= 8 | "You tried to stop." |

### Profile Title

| Profile | Title |
|---------|-------|
| deep_scroll | "Doom Scroll" |
| aware_loop | "Aware" |
| breaking | "Breaking" |
| uneasy | "Uneasy" |
| neutral | "Neutral" |

### Reaction Pacing Chart (SVG)

- X-axis: choices in order (first to last)
- Y-axis: reaction time in milliseconds (0–4000ms)
- Red zone (0–800ms): Mindless / Reactive
- Green zone (1500–4000ms): Mindful / Hesitant
- Data points: red (<800ms), green (>2500ms), gray (in between)
- Connected by a polyline

### Main Text

- "What you just experienced isn't random."
- "Doomscrolling works because it's easy to start and hard to notice while it's happening."
- "It's not just about willpower."
- "These systems are designed to keep your attention."

### Comparison Section

Fetches from `GET /api/results/stats`. Expected response:

```json
{
  "totalSessions": 150,
  "choiceMatchPercent": 62,
  "endingPercent": 32,
  "endingDistribution": {
    "endingA": 40, "endingB": 55, "endingC": 30, "endingD": 25
  }
}
```

**Shows:**
- "Based on {N} sessions"
- **Choice match:** "{X}% of other users made the same choices as you"
- **Ending match:** "{X}% of users got the same ending as you"
- **Ending Distribution:** Horizontal bar chart showing % per ending, highlights user's ending

**Fallback:** If API unavailable, shows italic note: "Aggregated results from other participants will appear here once available."

### Practical Help Section

- "You do not need to stop using your phone completely."
- "But noticing the moment before you open it — that matters."
- "Next time you reach for your phone automatically: pause for 5 seconds."
- "Ask yourself: 'What am I looking for right now?'"

### Closing Line

- "This loop is hard to notice while you're inside it."

### Exit Buttons

| Button | Action |
|--------|--------|
| **Close** | Sets `showGoodbye = true` → "Thanks for playing." screen |
| **Go Back** | Resets state → navigates to homepage |
| **Restart experience** | Resets state → navigates to homepage (same as Go Back) |

---

## 11. Complete Journey Map (Visual)

```
[HOME]
  │
  ├── [INFO] ──┐
  ├── [PROJECT]─┤
  └── [Find Out]┘
         │
         ▼
   [AUDIO PROMPT]
         │
         ▼
     [STORY ENGINE]
         │
    scene1 ──── 4 branches ────┐
         │                     │
         ▼                     │
    scene2_procrastination      │
    scene2_emotion             │
    scene2_boredom             │
    scene2_exhaustion          │
         │                     │
         ├── scene3_scroll ────┤
         └── scene3_resist ────┤
                │              │
    scene4_loop ◄──┤     ┌─────┤
    scene4_reflect ◄──┤     │     │
                │     │     │     │
    scene5_drift ◄─────┘     │     │
    scene5_reflect ◄─────────┘     │
                │                   │
         scene6_awareness ◄────────┘
                │
            scene7
                │
            scene8
                │
            scene9
                │
           scene10
                │
        ┌───────┘
        │
        ▼
  getEnding(state)
   ├── endingA (deep doomscroll)
   ├── endingB (aware loop)
   ├── endingC (breaking free)
   └── endingD (uneasy)
        │
        ▼
  [META OVERLAYS]
   ├── personal_stats (3s delay, choice stats)
   ├── cold_facts (3 facts, 4s delay each)
   └── thank_you (3.5s delay → "See Results")
        │
        ▼
  [REFLECTION SCREEN]
   ├── personal insights (dynamic lines)
   ├── reaction chart (SVG)
   ├── comparison section (API fetch)
   ├── practical help text
   ├── Close → "Thanks for playing."
   ├── Go Back → homepage (reset)
   └── Restart → homepage (reset)
```

---

## 12. Stat Influence Map

```
                  ┌─────────────────────┐
                  │      CHOICE         │
                  │  (text + effects)   │
                  └────────┬────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
      ┌──────────┐  ┌───────────┐  ┌──────────┐
      │ Reaction │  │ Loop      │  │ Choice   │
      │ Time     │  │ Detection │  │ Effects  │
      └────┬─────┘  └─────┬─────┘  └────┬─────┘
           │              │             │
           ▼              ▼             ▼
     ┌──────────────────────────────────────┐
     │         GAME STATE (4 stats)         │
     │                                       │
     │  time_loss    tension    awareness    │
     │  resistance                           │
     └────┬──────┬──────┬──────┬────────────┘
          │      │      │      │
    ┌─────┘      │      │      └─────┐
    │            │      │            │
    ▼            ▼      ▼            ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
│Profile │ │Derived │ │Narrative│ │  Ending  │
│Selection│ │Effects │ │Injection│ │(getEnding│
└────┬───┘ └───┬────┘ └───┬────┘ │  )       │
     │         │          │      └──────────┘
     ▼         ▼          ▼
┌─────────────────────────────────────┐
│         UI EXPERIENCE               │
│  blur · jitter · shake · noise      │
│  textSpeed · inputDelay                   │
│  memoryDecay · timeJump · drift     │
│  choiceFade · choiceStability       │
└─────────────────────────────────────┘
```

---

## 13. Data Flow: Choice → Screen

```
Player clicks choice
    │
    ▼
applyChoice(state, choice)        [sceneEngine.js]
    │
    ├── recordChoice(choiceText)  [interactionState.js]
    ├── processReaction()         [stateProcessor.js]
    │     ├── <800ms → time_loss+1, tension+0.5
    │     └── >2500ms → awareness+1, resistance+0.5
    │
    ├── detectLoopPattern()       [stateProcessor.js]
    │     └── 3 scroll choices → time_loss+2, tension+1
    │
    ├── apply choice.effects      [sceneEngine.js]
    │
    ├── determine next sceneId
    │     ├── choice.next === "ending" → getEnding(state)
    │     └── else → choice.next
    │
    ├── logEvent()                [analytics/logEvent.js]
    │     └── POST /api/log
    │
    └── return newState
    │
    ▼
handleChoice()                    [useGameEngine.js]
    │
    ├── if isEnding:
    │     ├── updateState (preserve sceneId)
    │     └── setMetaState("personal_stats")
    │
    └── else:
          ├── updateState(newState)
          ├── setIsDialogueFinished(false)
          └── setRerenderKey(n+1)
    │
    ▼
Re-render                         [App.jsx]
    │
    ├── useGameEngine recomputes:
    │     ├── scene = scenes[gameState.sceneId]
    │     ├── getEffects(state) → profile + derived effects
    │     ├── getAugmentedLines(scene, state) → dynamic lines
    │     └── effects merged with manualOverrides
    │
    └── App renders:
          ├── MyceliumLayer (3D background)
          ├── DialogueBox (typewriter)
          ├── ChoiceList (effect-distorted choices)
          ├── MetaOverlay (if metaState active)
          └── DebugPanel (if toggled, P key)
```

---

## Appendix A: Choice Keywords for Scroll Detection

From `interactionState.js`:

```
scroll, keep, continue, one more, check, open
```

Used for:
- Counting "scroll choices" in personal stats overlay
- Loop pattern detection (3 consecutive scroll-keyword choices)

## Appendix B: UI Component Behaviors

### DialogueBox (`ui/DialogueBox.jsx`)
- Typewriter: speed = max(8, 20/textSpeed)
- Time Jump overlay (30% chance when time_loss >= 8)
- Memory Decay (older lines fade proportional to memoryDecay)
- Text Jitter (horizontal shift: sin(i × 1.5) × textJitter × 5)
- Space bar skips animation

### ChoiceList (`ui/ChoiceList.jsx`)
- Input Delay (choices disabled for inputDelay ms)
- Choice Instability (random hiding based on 1 - choiceStability)
- Drift animation (when drift > 0.1)
- Choice Fade (opacity = max(0.1, 1 - choiceFade))
- Disappear Chance (per-choice vanishing after 1s)
- Auto-Select (if resistance <= 1, auto-picks after 15s)
- Override Choices (if resistance <= 2, healthy choices gated 5s)

### MyceliumLayer (`ui/MyceliumLayer.jsx`)
- Three.js 3D background (mycelium tube network)
- CSS blur filter from effects.blur
- Darkness overlay from effects.sleepiness
- Floating stat indicator texts from statIndicators
- Red pulse on scroll choices via triggerPulse()

### Background (`ui/Background.jsx`)
- Silk shader component (fluid animation)
- Used on homepage, info, project, and audio prompt pages
- Not used in story mode (mycelium replaces it)
