// A lightweight score is scheduled only while an AudioContext is running.
// Motifs use scale degrees, so the same musical grammar works across modes.
const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10]
};
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

export function normalizeEpisodeScore(profile = {}) {
  const mode = Object.hasOwn(SCALES, profile.mode) ? profile.mode : 'minor';
  const bpm = Number.isFinite(profile.bpm) ? clamp(profile.bpm, 60, 150) : 90;
  const root = Number.isFinite(profile.root) ? clamp(profile.root, 36, 72) : 48;
  const motif = Array.isArray(profile.motif) && profile.motif.some(Number.isFinite)
    ? profile.motif.map(note => Number.isFinite(note) ? Math.trunc(note) : null) : [0, 2, 4, 3, 2, 0, 5, 4];
  const rhythm = Array.isArray(profile.rhythm) && profile.rhythm.some(Boolean)
    ? profile.rhythm.map(Boolean) : [true, false, true, false, true, true, false, true];
  return { bpm, root, mode, motif, rhythm };
}

export function scoreMidiAtDegree(root, mode, degree) {
  const scale = SCALES[mode] || SCALES.minor;
  const octave = Math.floor(degree / scale.length);
  const index = ((degree % scale.length) + scale.length) % scale.length;
  return root + octave * 12 + scale[index];
}

// Exported as a pure operation for deterministic composition and testing.
export function scoreStep(profile, step, intensity = 0) {
  const score = normalizeEpisodeScore(profile);
  const index = ((Math.trunc(step) % 32) + 32) % 32;
  const bar = Math.floor(index / 8);
  const harmony = [0, 5, 3, 4][bar];
  const notes = [];
  const melodic = score.motif[index % score.motif.length];
  if (score.rhythm[index % score.rhythm.length] && melodic !== null) {
    notes.push({ kind: 'melody', midi: scoreMidiAtDegree(score.root + 12, score.mode, melodic), duration: .42, strength: .85 });
  }
  if (index % 8 === 0) {
    notes.push({ kind: 'pad', midi: scoreMidiAtDegree(score.root, score.mode, harmony), duration: 3.5, strength: .45 });
    notes.push({ kind: 'pad', midi: scoreMidiAtDegree(score.root, score.mode, harmony + 2), duration: 3.5, strength: .3 });
  }
  if (index % 4 === 0) notes.push({ kind: 'bass', midi: scoreMidiAtDegree(score.root - 12, score.mode, harmony), duration: .4, strength: .45 + .35 * intensity });
  if (intensity >= .38 && index % 2 === 0) notes.push({ kind: 'pulse', midi: index % 8 === 0 ? 30 : 54, duration: .09, strength: .15 + .45 * intensity });
  return notes;
}

function frequency(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

export function createEpisodeScore(context, destination, profile) {
  const score = normalizeEpisodeScore(profile);
  const output = context.createGain();
  output.gain.value = 0;
  output.connect(destination);
  let nextTime = 0;
  let step = 0;
  let active = false;
  let scheduled = 0;
  const activeVoices = new Set();
  const stepSeconds = 60 / score.bpm / 2;
  function note(event, at) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = event.kind === 'pad' ? 'sine' : event.kind === 'pulse' ? 'square' : event.kind === 'bass' ? 'triangle' : score.mode === 'dorian' ? 'sine' : 'triangle';
    oscillator.frequency.setValueAtTime(frequency(event.midi), at);
    const duration = event.kind === 'pad' ? stepSeconds * 7.6 : Math.min(event.duration, stepSeconds * .85);
    const tail = Math.max(event.kind === 'pad' ? .4 : .06, duration);
    const level = event.strength * (event.kind === 'pad' ? .025 : event.kind === 'pulse' ? .012 : event.kind === 'bass' ? .045 : .055);
    gain.gain.setValueAtTime(.0001, at);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002, level), at + (event.kind === 'pad' ? .35 : .025));
    gain.gain.exponentialRampToValueAtTime(.0001, at + tail);
    oscillator.connect(gain);
    gain.connect(output);
    const voice = { oscillator, gain };
    activeVoices.add(voice);
    oscillator.onended = () => { activeVoices.delete(voice); oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(at);
    oscillator.stop(at + tail + .02);
    scheduled++;
  }
  function silence() {
    for (const voice of activeVoices) {
      try { voice.oscillator.stop(); } catch { /* Already ended. */ }
    }
    activeVoices.clear();
  }
  return {
    profile: score,
    update({ intensity = 0, paused = false, state = 'playing' } = {}) {
      const running = context.state === 'running' && !paused && state !== 'paused';
      const now = context.currentTime;
      if (!running) {
        if (active) { output.gain.value = 0; silence(); }
        active = false;
        return;
      }
      const volume = state === 'dead' ? .18 : state === 'complete' ? .35 : state === 'title' || state === 'briefing' ? .4 : .55;
      // The shared music bus and master compressor attenuate the synthesized score.
      output.gain.value = volume * 3;
      if (!active) { nextTime = now + .04; active = true; }
      // A hidden tab or a stalled frame must not replay an old backlog.
      if (nextTime < now - .2) nextTime = now + .04;
      let limit = 0;
      while (nextTime < now + .14 && limit++ < 4) {
        for (const event of scoreStep(score, step++, clamp(intensity, 0, 1))) note(event, nextTime);
        nextTime += stepSeconds;
      }
    },
    debug() { return { active, scheduled, step, bpm: score.bpm, root: score.root, mode: score.mode }; }
  };
}
