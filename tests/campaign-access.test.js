import test from 'node:test';
import assert from 'node:assert/strict';
import { browserCampaignStorage, campaignAccess } from '../src/story/campaign-access.js';
import { EPISODES, isEpisodeUnlocked, loadCampaignProgress, recordMissionComplete } from '../src/story/campaign-progress.js';

const stories = EPISODES.map(([id]) => ({ id, mapId: `${id}_map` }));
function storage(completed = [], developer = false) {
  const values = { 'saltline.campaign.v1': JSON.stringify({ version: 1, completed, flags: [] }),
    'saltline.developer-mode.v1': developer ? 'enabled' : null };
  return { getItem: key => values[key] ?? null };
}

test('direct episode requests are normalized and locked requests go to the furthest accessible episode', () => {
  for (const requested of ['21', 'm21', '99', 'm99', '100', 'm100']) {
    assert.deepEqual(campaignAccess({ story: requested, q: 'test' }, stories, storage()).params, { story: 'm01', q: 'test' });
  }
  const oneComplete = storage(['m01']);
  assert.equal(campaignAccess({ story: '21' }, stories, oneComplete).params.story, 'm02');
  assert.equal(campaignAccess({ story: '2' }, stories, oneComplete).params.story, 'm02');
  assert.equal(campaignAccess({ story: 'm01' }, stories, oneComplete).redirected, false);
  assert.equal(campaignAccess({ story: 'm02' }, stories, oneComplete).redirected, false);
});

test('a completed episode and its next episode are accessible without filling skipped gaps', () => {
  const progress = { completed: ['m14'] };
  assert.equal(isEpisodeUnlocked(13, progress), true);
  assert.equal(isEpisodeUnlocked(14, progress), true);
  assert.equal(isEpisodeUnlocked(12, progress), false);
  const saved = storage(['m14']);
  assert.equal(campaignAccess({ story: 'm14' }, stories, saved).redirected, false);
  assert.equal(campaignAccess({ story: 'm15' }, stories, saved).redirected, false);
  assert.equal(campaignAccess({ story: 'm13' }, stories, saved).params.story, 'm15');
  assert.equal(campaignAccess({ story: 'm21' }, stories, saved).params.story, 'm15');
});

test('map URLs and mismatched story/map combinations cannot bypass campaign locks', () => {
  const saved = storage(['m01', 'm02']);
  assert.deepEqual(campaignAccess({ map: 'm21_map', q: 'test' }, stories, saved).params, { story: 'm03', q: 'test' });
  assert.deepEqual(campaignAccess({ story: 'm01', map: 'm21_map' }, stories, saved).params, { story: 'm03' });
  assert.deepEqual(campaignAccess({ story: 'm21', map: 'harbor' }, stories, saved).params, { story: 'm03' });
  assert.equal(campaignAccess({ map: 'm02_map' }, stories, saved).redirected, false);
});

test('retired harbor links fall back to the last accessible episode, including in developer mode', () => {
  for (const developer of [false, true]) {
    const saved = storage(['m01', 'm02'], developer);
    for (const params of [{ story: 'harbormaster' }, { map: 'harbor' }, { story: 'harbormaster', map: 'harbor' }]) {
      const result = campaignAccess({ ...params, q: 'test' }, stories, saved);
      assert.deepEqual(result.params, { story: 'm03', q: 'test' });
      assert.equal(result.redirected, true);
    }
  }
});

test('developer access is separate from progress; broken storage safely starts from episode one', () => {
  assert.deepEqual(campaignAccess({ story: '21' }, stories, storage([], true)).params, { story: 'm21' });
  assert.equal(campaignAccess({ map: 'm21_map' }, stories, storage([], true)).redirected, false);
  const broken = { getItem() { throw new Error('storage blocked'); } };
  assert.equal(campaignAccess({ story: 'm21' }, stories, broken).params.story, 'm01');
  assert.equal(campaignAccess({ story: 'm21' }, stories, { getItem: () => '{bad' }).params.story, 'm01');
  assert.equal(campaignAccess({ show: 'weapon' }, stories, broken).redirected, false);
});

test('a browser that rejects localStorage access remains playable with fresh progress', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('denied'); } });
    assert.equal(browserCampaignStorage(), null);
    assert.deepEqual(loadCampaignProgress(), { version: 1, completed: [], flags: [] });
    assert.deepEqual(recordMissionComplete('m01').completed, ['m01']);
    assert.equal(campaignAccess({ story: 'm21' }, stories, browserCampaignStorage()).params.story, 'm01');
  } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete globalThis.localStorage;
  }
});
