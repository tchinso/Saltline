import test from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../src/content/index.js';
import { EPISODES, isEpisodeUnlocked, loadCampaignProgress, recordMissionComplete } from '../src/story/campaign-progress.js';

function memoryStorage(initial = null) {
  let value = initial;
  return { getItem: () => value, setItem: (_, next) => { value = next; } };
}

test('campaign progress unlocks episodes and retains independent choices across replays', () => {
  const storage = memoryStorage();
  let progress = loadCampaignProgress(storage);
  assert.equal(isEpisodeUnlocked(0, progress), true);
  assert.equal(isEpisodeUnlocked(1, progress), false);
  progress = recordMissionComplete('m01', ['flag_m01_technician'], storage);
  assert.equal(isEpisodeUnlocked(1, progress), true);
  progress = recordMissionComplete('m01', ['flag_m01_drone_record'], storage);
  assert.deepEqual(progress.completed, ['m01']);
  assert.deepEqual(progress.flags, ['flag_m01_technician', 'flag_m01_drone_record']);
  assert.deepEqual(loadCampaignProgress(memoryStorage('{bad json')), { version: 1, completed: [], flags: [] });
  assert.equal(isEpisodeUnlocked(6, progress), false, 'ACT 2 stays locked until M06');
  progress = recordMissionComplete('m06', [], storage);
  assert.equal(isEpisodeUnlocked(6, progress), true, 'M06 unlocks M07');
  assert.equal(isEpisodeUnlocked(13, progress), false, 'ACT 3 stays locked until M13');
  progress = recordMissionComplete('m13', [], storage);
  assert.equal(isEpisodeUnlocked(13, progress), true, 'M13 unlocks M14');
});

test('ACT 1 registers six distinct maps and valid main and optional objectives', () => {
  const maps = new Set();
  for (const [id] of EPISODES.slice(0, 6)) {
    const { story, map } = content.resolve({ story: id });
    maps.add(map.id);
    assert.deepEqual(story.objectives.filter(o => !o.optional).map(o => o.id), ['stage_1', 'stage_2', 'stage_3', 'stage_4']);
    assert.ok(story.objectives.some(o => o.optional && o.flag));
  }
  assert.equal(maps.size, 6);
  assert.equal(content.resolve({ story: 'm01' }).story.objectives.filter(o => o.optional).length, 2);
  assert.equal(content.resolve({ story: 'm05' }).story.objectives.find(o => o.optional).flag, 'flag_medical_supply');
});

test('ACT 2 episodes are registered with distinct maps and persistent optional choices', () => {
  const maps = new Set();
  for (const [id] of EPISODES.slice(6, 13)) {
    const { story, map } = content.resolve({ story: id });
    maps.add(map.id);
    assert.deepEqual(story.objectives.filter(o => !o.optional).map(o => o.id), ['stage_1', 'stage_2', 'stage_3', 'stage_4']);
    assert.ok(story.objectives.some(o => o.optional && o.flag));
  }
  assert.equal(maps.size, 7);
});

test('ACT 3 episodes are registered with distinct maps and persistent optional choices', () => {
  const maps = new Set();
  for (const [id] of EPISODES.slice(13, 21)) {
    const { story, map } = content.resolve({ story: id });
    maps.add(map.id);
    assert.deepEqual(story.objectives.filter(o => !o.optional).map(o => o.id), ['stage_1', 'stage_2', 'stage_3', 'stage_4']);
    assert.ok(story.objectives.some(o => o.optional && o.flag));
  }
  assert.equal(maps.size, 8);
});
