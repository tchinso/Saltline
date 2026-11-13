import test from 'node:test';
import assert from 'node:assert/strict';
import { createEpisodeScore, normalizeEpisodeScore, scoreMidiAtDegree, scoreStep } from '../src/audio/episode-score.js';
import { EPISODE_MOODS } from '../src/content/episode-moods.js';

function mockAudio() {
  const oscillators = [];
  const parameter = () => ({ value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} });
  const context = {
    state: 'running', currentTime: 0,
    createGain: () => ({ gain: parameter(), connect() {}, disconnect() {} }),
    createOscillator() {
      const oscillator = { frequency: parameter(), starts: [], stops: [], connect() {}, disconnect() {},
        start(time) { this.starts.push(time); }, stop(time) { this.stops.push(time); } };
      oscillators.push(oscillator);
      return oscillator;
    }
  };
  return { context, oscillators };
}

test('episode score uses the specified scale, motif, rhythm, and intensity', () => {
  const one = { bpm: 72, root: 48, mode: 'minor', motif: [0, 2, 4], rhythm: [1, 0, 1] };
  const two = { bpm: 120, root: 55, mode: 'major', motif: [4, 1, 0], rhythm: [0, 1, 0] };
  assert.equal(scoreMidiAtDegree(48, 'minor', 2), 51);
  assert.equal(scoreMidiAtDegree(48, 'minor', -1), 46);
  assert.notDeepEqual(scoreStep(one, 0), scoreStep(two, 0));
  assert.equal(scoreStep(one, 1).some(event => event.kind === 'melody'), false);
  assert.equal(scoreStep(two, 1).some(event => event.kind === 'melody'), true);
  assert.equal(scoreStep(one, 0, .1).some(event => event.kind === 'pulse'), false);
  assert.equal(scoreStep(one, 0, .9).some(event => event.kind === 'pulse'), true);
  assert.equal(normalizeEpisodeScore({ bpm: 300 }).bpm, 150);
});

test('all 26 episode profiles yield distinct audible note and rhythm sequences', () => {
  const scores = Object.entries(EPISODE_MOODS);
  assert.equal(scores.length, 26);
  const signatures = scores.map(([id, mood]) => {
    const notes = Array.from({ length: 32 }, (_, step) => scoreStep(mood.music, step)
      .filter(event => event.kind === 'melody').map(event => event.midi));
    assert.ok(notes.filter(step => step.length).length >= 4, `${id} has a discernible melody`);
    return JSON.stringify({ bpm: mood.music.bpm, notes });
  });
  assert.equal(new Set(signatures).size, 26);
});

test('scheduling waits for audio, pauses cleanly, and does not replay background backlog', () => {
  const { context } = mockAudio();
  const score = createEpisodeScore(context, {}, { bpm: 100, root: 48, mode: 'minor', motif: [0], rhythm: [1] });
  context.state = 'suspended';
  score.update({ state: 'title' });
  assert.equal(score.debug().scheduled, 0);
  context.state = 'running';
  score.update({ state: 'playing', intensity: .8 });
  const started = score.debug().scheduled;
  assert.ok(started > 0);
  score.update({ state: 'paused', paused: true });
  context.currentTime = 120;
  score.update({ state: 'paused', paused: true });
  assert.equal(score.debug().scheduled, started);
  score.update({ state: 'playing', intensity: .8 });
  assert.ok(score.debug().scheduled - started <= 6, 'resume schedules a single step, not a backlog');
  const resumed = score.debug().scheduled;
  context.currentTime = 500;
  score.update({ state: 'playing', intensity: .8 });
  assert.ok(score.debug().scheduled - resumed <= 6, 'stalled frames do not burst old notes');
});
