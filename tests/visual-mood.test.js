import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveVisualMood } from '../src/render/visual-mood.js';
import { EPISODE_MOODS } from '../src/content/episode-moods.js';

test('scene moods keep diagnostics and unprofiled content on original rendering', () => {
  assert.equal(resolveVisualMood(null), null);
  for (const params of [{ show: 'level' }, { shot: '1' }, { bench: '1' }]) {
    assert.equal(resolveVisualMood({ exposure: .8 }, params), null);
  }
});

test('all campaign episodes provide distinct bounded visual profiles', () => {
  const distinct = new Set();
  for (let i = 1; i <= 26; i++) {
    const id = `m${String(i).padStart(2, '0')}`;
    const profile = EPISODE_MOODS[id]?.visual;
    assert.ok(profile, `${id} has visual mood`);
    const resolved = resolveVisualMood(profile);
    assert.ok(resolved.exposure >= .75 && resolved.exposure <= 1.2);
    assert.ok(resolved.sunIntensity >= 5 && resolved.sunIntensity <= 12);
    distinct.add(JSON.stringify(resolved));
  }
  assert.equal(distinct.size, 26);
});

test('scene moods reject invalid components and bound rendering values', () => {
  const mood = resolveVisualMood({ sunColor: [1.5, -.5, .4], zenith: [NaN, 0, 0], sunIntensity: 500, exposure: 0, saturation: 4 });
  assert.deepEqual(mood.sunColor, [1, .02, .4]);
  assert.deepEqual(mood.zenith, [.055, .085, .13]);
  assert.equal(mood.sunIntensity, 12);
  assert.equal(mood.exposure, .75);
  assert.equal(mood.saturation, 1.15);
});
