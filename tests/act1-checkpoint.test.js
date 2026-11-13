import test from 'node:test';
import assert from 'node:assert/strict';
import { Vector3 } from '../vendor/three.js';
import { captureAct1Checkpoint, restoreAct1Checkpoint } from '../src/story/act1-checkpoint.js';

function setup() {
  const states = [];
  const player = {
    pos: new Vector3(4, 0, 2), yaw: .5, pitch: .2, health: 37, alive: true,
    reset(start) { this.pos.copy(start.pos); this.yaw = start.yaw; this.health = 70; this.alive = true; }
  };
  const weapon = { ammo: 9, reserve: 53, reset() { this.ammo = 30; this.reserve = 120; } };
  const medkits = { points: [{ remaining: 25, model: { visible: false } }, { remaining: 0, model: { visible: true } }] };
  const enemies = {
    list: [{ type: 'hound', pos: new Vector3(12, 0, 4), hp: 48, alive: true, mode: 'engage' }],
    clear() { this.list.length = 0; },
    spawn(type, pos, options) { const enemy = { type, pos, hp: 140, alive: true, mode: options.state }; this.list.push(enemy); return enemy; }
  };
  const game = { player, weapon, medkits, enemies, fx: { clear() {} }, combat: { stats: { shots: 12, hits: 7, kills: 2 } } };
  const makeItem = (id, cut) => ({ id, cut, t: +cut, o: { object: { userData: { setState: value => states.push([id, value]) } } } });
  const run = {
    clearing: false, queue: [], used: new Map(), relays: [makeItem('stage_1', true), makeItem('stage_2', false), makeItem('optional_1', true)],
    time: 50, cut: 1, allCut: false, alertT: 1, pursuitT: 0, pursuitLeft: 0, contactSaid: true, lowSaid: false
  };
  return { game, run, states };
}

test('checkpoint restores resources, objectives, optional results, and living enemy state', () => {
  const { game, run, states } = setup();
  const checkpoint = captureAct1Checkpoint(game, run);
  game.player.pos.x = -1; game.player.health = 0; game.player.alive = false;
  game.weapon.ammo = 0; game.weapon.reserve = 0;
  game.medkits.points[0].remaining = 0;
  run.relays[0].cut = false; run.relays[1].cut = true; run.relays[2].cut = false;
  run.cut = 2; run.time = 90; run.queue.push({}); run.clearing = true;
  game.enemies.list[0].hp = 1; game.combat.stats.kills = 10;
  restoreAct1Checkpoint(game, run, checkpoint);
  assert.deepEqual(game.player.pos.toArray(), [4, 0, 2]);
  assert.equal(game.player.health, 37); assert.equal(game.player.alive, true);
  assert.equal(game.player.yaw, .5); assert.equal(game.player.pitch, .2);
  assert.deepEqual([game.weapon.ammo, game.weapon.reserve], [9, 53]);
  assert.equal(game.medkits.points[0].remaining, 25); assert.equal(game.medkits.points[0].model.visible, false);
  assert.deepEqual(run.relays.map(item => item.cut), [true, false, true]);
  assert.equal(run.cut, 1); assert.equal(run.time, 50); assert.equal(run.clearing, false); assert.equal(run.queue.length, 0);
  assert.deepEqual(game.enemies.list.map(enemy => [enemy.type, enemy.hp, ...enemy.pos.toArray()]), [['hound', 48, 12, 0, 4]]);
  assert.equal(game.combat.stats.kills, 2);
  assert.deepEqual(states, [['stage_1', 'cut'], ['stage_2', 'live'], ['optional_1', 'cut']]);
});

test('checkpoints cannot capture a partly spawned encounter', () => {
  const { game, run } = setup();
  run.clearing = true;
  assert.throws(() => captureAct1Checkpoint(game, run), /settled encounter/);
  run.clearing = false; run.queue.push({});
  assert.throws(() => captureAct1Checkpoint(game, run), /settled encounter/);
});
