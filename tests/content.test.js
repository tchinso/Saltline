import test from 'node:test';
import assert from 'node:assert/strict';
import { createContentRegistry } from '../src/content/registry.js';
import { content } from '../src/content/index.js';
import { createHarborLayout } from '../src/content/maps/harbor/layout.js';
import { createPhysics } from '../src/world/physics.js';
import { Vector3 } from '../vendor/three.js';

test('episode one is the default and the original harbor remains selectable', () => {
  const selected = content.resolve();
  assert.equal(selected.story.id, 'm01');
  assert.equal(selected.map.id, 'm01_base');
  assert.equal(content.resolve({ map: 'harbor' }).story.id, 'harbormaster');
  assert.equal(content.resolve({ story: 'harbormaster' }).map.id, 'harbor');
  assert.throws(() => content.resolve({ story: 'missing' }), /Unknown story/);
  assert.throws(() => content.resolve({ map: 'missing' }), /Unknown map/);
});

test('a second map/story can register without modifying the bootstrap', () => {
  const { map, story } = content.resolve({ story: 'harbormaster' });
  const secondMap = { ...map, id: 'second-map' };
  const secondStory = { ...story, id: 'second-story', mapId: secondMap.id };
  const registry = createContentRegistry({ maps: [map, secondMap], stories: [story, secondStory], defaultStoryId: story.id });
  assert.equal(registry.resolve({ story: secondStory.id }).map, secondMap);
  assert.equal(registry.resolve({ map: secondMap.id }).story, secondStory);
  assert.throws(() => registry.resolve({ story: secondStory.id, map: map.id }), /does not support/);
  assert.throws(() => createContentRegistry({ maps: [map, map], stories: [story], defaultStoryId: story.id }), /duplicate/);
  assert.throws(() => createContentRegistry({ maps: [map], stories: [secondStory], defaultStoryId: secondStory.id }), /unknown map/);
  assert.throws(() => createContentRegistry({ maps: [{ ...map, world: {} }], stories: [story], defaultStoryId: story.id }), /navigation/);
});

test('map layout creates fresh mutable spawn and cover vectors', () => {
  const first = createHarborLayout();
  const second = createHarborLayout();
  assert.equal(first.enemySpawns.length, 42);
  assert.equal(first.cinematicPath.length, 12);
  assert.deepEqual(first.playerStart.pos.toArray(), [-32, 0, 6]);
  first.enemySpawns[0].pos.x = 1000;
  first.coverPoints[0].z = 1000;
  first.cinematicPath[0].pos[0] = 1000;
  assert.notEqual(second.enemySpawns[0].pos.x, 1000);
  assert.notEqual(second.coverPoints[0].z, 1000);
  assert.notEqual(second.cinematicPath[0].pos[0], 1000);
});

test('physics uses per-map bounds, ground and navigation without leaking colliders', () => {
  const world = {
    min: new Vector3(100, 0, 100), max: new Vector3(120, 30, 120),
    groundY: 3, seaY: -4, quayX: 118,
    navigation: { minX: 100, maxX: 120, minZ: 100, maxZ: 120, cellSize: 1 }
  };
  const physics = createPhysics({ world });
  const harborPhysics = createPhysics({ world: content.resolve({ story: 'harbormaster' }).map.world });
  physics.build();
  assert.equal(physics.nav.isWalkable(110, 110), true);
  assert.equal(physics.nav.isWalkable(0, 0), false);
  assert.equal(physics.groundHeight(110, 110), 3);
  assert.equal(physics.groundHeight(119, 110), -4);
  const box = physics.addBox([109, 3, 109], [111, 5, 111], { surface: 'metal' });
  const hit = physics.raycast(new Vector3(110, 10, 110), new Vector3(0, -1, 0));
  assert.equal(hit.surface, 'metal');
  assert.equal(hit.dist, 5);
  assert.equal(harborPhysics.boxes.length, 0);
  physics.removeBox(box);
  assert.equal(physics.raycast(new Vector3(110, 10, 110), new Vector3(0, -1, 0)).dist, 7);
});

test('relay objectives support counts other than the original three', () => {
  const { story } = content.resolve({ story: 'harbormaster' });
  assert.equal(story.objectiveText(3, 3), '중계기 세 개를 차단하라');
  assert.equal(story.objectiveText(5, 5), '남은 중계기 5개를 차단하라');
  assert.equal(story.objectiveText(1, 5), '마지막 중계기를 차단하라');
  assert.equal(story.objectiveText(0, 5), '보트에 도착하라');
});
