import test from 'node:test';
import assert from 'node:assert/strict';
import { Scene, THREE, Vector3 } from '../vendor/three.js';
import { createEscort } from '../src/story/escort.js';
import { createPhysics } from '../src/world/physics.js';
import { createProps } from '../src/world/props/registry.js';
import { createRandom } from '../src/core/random.js';
import { fallbacks } from '../src/core/fallbacks.js';
import { act1Maps } from '../src/content/maps/act1/index.js';
import '../src/world/props/industrial.js';
import '../src/world/props/register.js';

// Escort only needs a small DOM surface for its status display.
globalThis.document = { createElement: () => ({ hidden: false, textContent: '' }) };

function fixture({ stationary = false, duration = 20 } = {}) {
  const world = {
    min: new Vector3(-50, 0, -50), max: new Vector3(50, 30, 50),
    groundY: 0, seaY: -20, quayX: 1000,
    navigation: { minX: -49, maxX: 49, minZ: -49, maxZ: 49, cellSize: 1 }
  };
  const displays = [];
  const game = {
    world, scene: new Scene(), player: { pos: new Vector3() }, enemies: { list: [] },
    hud: { root: { appendChild: element => displays.push(element) } }
  };
  game.physics = createPhysics(game);
  const from = new Vector3();
  const to = stationary ? from.clone() : new Vector3(10, 0, 0);
  const escort = createEscort(game, from, to, '수송차', { duration });
  escort.start();
  return { game, escort, displays };
}

function enemy(x, y, z) {
  return { alive: true, pos: new Vector3(x, y, z), sensor: new Vector3(x, y + 1, z) };
}

test('a real wall protects the escort; removing it exposes the threat', () => {
  const { game, escort } = fixture();
  const wall = game.physics.addBox(new Vector3(3, 0, -2), new Vector3(4, 4, 2));
  game.enemies.list.push(enemy(6, 0, 0));
  assert.equal(game.physics.lineOfSight(new Vector3(6, 1, 0), new Vector3(0, 1, 0)), false);
  escort.update(1);
  assert.equal(escort.health, 100);
  assert.ok(escort.progress > 0, 'a hidden enemy does not stop the convoy');
  const progress = escort.progress;
  game.physics.removeBox(wall);
  escort.update(1);
  assert.equal(escort.progress, progress, 'visible enemy stops the convoy');
  assert.equal(escort.health, 100, 'a new threat has a warning period');
});

test('M05 hospital wall prevents a hidden enemy damaging the patient convoy', async () => {
  const map = act1Maps.find(entry => entry.id === 'm05_hospital');
  const game = { THREE, map, scene: new Scene(), world: map.world, mats: fallbacks.mats(),
    rng: createRandom(), quality: {}, params: {}, player: { pos: new Vector3(7, 0, 3) },
    enemies: { list: [] }, hud: { root: { appendChild() {} } } };
  game.physics = createPhysics(game);
  game.props = createProps(game);
  game.level = await map.createLevel(game);
  game.physics.build();
  const from = game.level.objectives.find(item => item.id === 'stage_3').pos;
  const to = game.level.objectives.find(item => item.id === 'stage_4').pos;
  const hidden = enemy(8.5, 0, 8.5);
  assert.ok(game.physics.nav.isWalkable(hidden.pos.x, hidden.pos.z));
  assert.ok(hidden.pos.distanceTo(from) < 9);
  assert.equal(game.physics.lineOfSight(hidden.sensor, from.clone().add(new Vector3(0, 1, 0))), false);
  game.enemies.list.push(hidden);
  const escort = createEscort(game, from, to, '환자 수송차');
  escort.start();
  escort.update(10);
  assert.equal(escort.health, 100);
  assert.ok(escort.progress > 0);
});

test('an airborne enemy outside the three-dimensional threat radius is harmless', () => {
  const { game, escort } = fixture();
  game.enemies.list.push({ ...enemy(0, 12, 0), type: 'gull' });
  escort.update(1);
  assert.equal(escort.health, 100);
  assert.ok(escort.progress > 0);
});

test('visible threats have a three-second warning and capped damage, and can still defeat the escort', () => {
  const { game, escort } = fixture();
  game.enemies.list.push(enemy(3, 0, 0), enemy(4, 0, 0), enemy(5, 0, 0), enemy(6, 0, 0));
  for (let i = 0; i < 3; i++) escort.update(1);
  assert.equal(escort.health, 100);
  assert.equal(escort.progress, 0);
  escort.update(1);
  assert.equal(escort.health, 97.75, 'at most three enemies deal 0.75 damage per second each');
  for (let i = 0; i < 50 && escort.active; i++) escort.update(1);
  assert.equal(escort.failed, true);
  assert.equal(escort.health, 0);
  assert.equal(escort.finished, false);
});

test('clearing threats resumes movement and a new threat gets its own warning', () => {
  const { game, escort } = fixture();
  game.enemies.list.push(enemy(3, 0, 0));
  for (let i = 0; i < 5; i++) escort.update(1);
  const health = escort.health;
  assert.ok(health < 100);
  game.enemies.list[0].alive = false;
  escort.update(1);
  assert.ok(escort.progress > 0);
  game.enemies.list.push(enemy(4, 0, 0));
  escort.update(1);
  assert.equal(escort.health, health);
  escort.reset();
  assert.equal(escort.health, 100);
  assert.equal(escort.progress, 0);
  assert.equal(escort.active, false);
  assert.equal(escort.failed, false);
  escort.start();
  escort.update(1);
  assert.equal(escort.health, 100, 'reset clears the previous warning timer');
});

test('player proximity still matters, and stationary objectives finish on their configured duration', () => {
  const { game, escort } = fixture({ stationary: true, duration: 25 });
  game.player.pos.set(30, 0, 0);
  escort.update(5);
  assert.equal(escort.progress, 0);
  game.player.pos.set(0, 0, 0);
  escort.update(24);
  assert.equal(escort.finished, false);
  assert.ok(escort.progress > .95);
  escort.update(1);
  assert.equal(escort.progress, 1);
  assert.equal(escort.finished, true);
});
