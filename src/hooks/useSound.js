const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

let knockAudio = null;

function getKnock() {
  if (!knockAudio) {
    knockAudio = new Audio("/Knock-right.m4a");
  }
  return knockAudio;
}

export function ensureAudioContext() {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

export function playKnock() {
  const knock = getKnock();
  knock.currentTime = 0;
  knock.play().catch(() => {});
}

export function playMuffledVoice() {
  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    filter.type = "lowpass";
    filter.frequency.value = 400;

    osc.type = "sawtooth";
    osc.frequency.value = 180;

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  } catch {
    // Audio API unavailable
  }
}

export function playRoomSound() {
  try {
    const sampleRate = audioCtx.sampleRate;
    const bufferSize = sampleRate * 3;
    const buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    let value = 0;
    for (let i = 0; i < bufferSize; i++) {
      value += (Math.random() * 2 - 1) * 0.02;
      value = Math.max(-1, Math.min(1, value));
      data[i] = value;
    }

    const source = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    filter.type = "lowpass";
    filter.frequency.value = 150;

    source.buffer = buffer;
    source.loop = true;

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    source.start();

    return () => {
      try {
        source.stop();
      } catch {
        // ignore
      }
    };
  } catch {
    return () => {};
  }
}
