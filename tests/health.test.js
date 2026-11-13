import test from 'node:test';
import assert from 'node:assert/strict';
import { PerspectiveCamera, Scene, Vector3 } from '../vendor/three.js';
import { createEventBus } from '../src/core/events.js';
import { createMedkits } from '../src/player/medkits.js';
import { createPlayer } from '../src/player/player.js';

function makeGame() {
  return {
    scene: new Scene(), camera: new PerspectiveCamera(), events: createEventBus(),
    world: { quayX: 30, seaY: -2 },
    physics: { boxes: [], nav: { isWalkable: () => true }, moveCapsule: () => ({ onGround: true }) },
    input: { move: { x: 0, y: 0 }, look: { dx: 0, dy: 0 }, pressed: () => false },
    hud: { message() {} }
  };
}

test('health only recovers from a supply, which respawns after its cooldown', () => {
  const game = makeGame();
  game.player = createPlayer(game);
  game.medkits = createMedkits(game, [[0, 0, 0]]);
  game.player.reset({ pos: new Vector3(0, 0, 0), yaw: 0 });
  game.medkits.update(.1);
  assert.equal(game.medkits.points[0].model.visible, true, 'full health does not consume supply');
  game.player.damage(40);
  for (let i = 0; i < 100; i++) game.player.update(.1);
  assert.equal(game.player.health, 60, 'health does not regenerate over time');
  game.medkits.update(.1);
  assert.equal(game.player.health, 100, 'a supply restores full health');
  assert.equal(game.medkits.points[0].model.visible, false);
  game.player.damage(80);
  game.medkits.update(59);
  assert.equal(game.player.health, 20);
  game.player.pos.x = 10;
  game.medkits.update(1);
  assert.equal(game.medkits.points[0].model.visible, true);
  game.player.pos.x = 0;
  game.medkits.update(.1);
  assert.equal(game.player.health, 100, 'healing is capped at maximum health');
  game.player.reset({ pos: new Vector3(0, 0, 0), yaw: 0 });
  assert.equal(game.medkits.points[0].model.visible, true, 'retry restores supplies');
});

test('campaign supplies follow the inland route and the hospital choice adds bridge supplies', () => {
  const previousStorage = globalThis.localStorage;
  try {
    let flags = [];
    globalThis.localStorage = { getItem: () => JSON.stringify({ version: 1, completed: [], flags }) };
    const ordinary = makeGame();
    ordinary.map = { id: 'm06_bridge' };
    const withoutBonus = createMedkits(ordinary);
    assert.equal(withoutBonus.points.length, 10);
    assert.ok(withoutBonus.points.every(({ position }) => Math.abs(position.z) <= 3));
    flags = ['flag_medical_supply'];
    const supplied = makeGame();
    supplied.map = { id: 'm06_bridge' };
    assert.equal(createMedkits(supplied).points.length, 12);
    const earlier = makeGame();
    earlier.map = { id: 'm05_hospital' };
    assert.equal(createMedkits(earlier).points.length, 10);
    const act2 = makeGame();
    act2.map = { id: 'm07_lab' };
    assert.equal(createMedkits(act2).points.length, 12);
    const harbor = makeGame();
    harbor.map = { id: 'harbor' };
    assert.equal(createMedkits(harbor).points.length, 12);
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});

