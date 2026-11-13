import test from 'node:test';
import assert from 'node:assert/strict';
import { Scene, Vector3 } from '../vendor/three.js';
import { createEventBus } from '../src/core/events.js';
import { fallbacks } from '../src/core/fallbacks.js';
import { createEnemies } from '../src/enemies/enemies.js';

async function makeGame() {
  const events = createEventBus();
  const fired = [], killed = [], warnings = [], shots = [];
  events.on('enemy:fire', event => fired.push(event));
  events.on('enemy:killed', event => killed.push(event));
  const game = {
    scene: new Scene(), params: {}, events, mats: fallbacks.mats(),
    player: { pos: new Vector3(-10, 0, 0), vel: new Vector3(), alive: true },
    physics: { raycast: () => null, lineOfSight: () => true },
    combat: { enemyShot: (...args) => { shots.push(args); return false; } },
    fx: fallbacks.fx(), hud: { warn: (...args) => warnings.push(args) }
  };
  game.enemies = await createEnemies(game);
  return { game, fired, killed, warnings, shots };
}

test('breaker is registered, telegraphs fire, exposes a weak point, and dies and resets', async () => {
  const { game, fired, killed, warnings, shots } = await makeGame();
  const boss = game.enemies.spawn('breaker', new Vector3(0, 0, 0), { state: 'alert' });
  assert.equal(game.enemies.aliveCount(), 1);
  assert.ok(game.enemies.list.includes(boss));
  // Enemy update caps delta at 50 ms; the initial cooldown is 2.5 seconds.
  for (let i = 0; i < 51; i++) game.enemies.update(.05);
  assert.equal(boss.phase, 'aim');
  assert.equal(warnings.length, 1);
  assert.equal(shots.length, 0, 'warning precedes the shot');
  const hit = game.enemies.raycast(new Vector3(0, 2.57, 8), new Vector3(0, 0, -1), 50);
  assert.equal(hit.enemy, boss);
  assert.equal(hit.part, 'weak');
  game.player.pos.z = 4; // The attack stays aimed at the position marked by the warning.
  for (let i = 0; i < 33; i++) game.enemies.update(.05);
  assert.equal(boss.phase, 'cooldown');
  assert.equal(shots.length, 1);
  assert.equal(fired[0].type, 'breaker');
  assert.ok(shots[0][1].z === 0, 'aim is locked instead of tracking the player');
  assert.equal(boss.damage(1000, boss.pos, null, 'body'), true);
  assert.equal(killed[0].type, 'breaker');
  assert.equal(game.enemies.aliveCount(), 0);
  game.enemies.clear();
  assert.equal(game.enemies.list.length, 0);
  const retry = game.enemies.spawn('breaker', new Vector3(0, 0, 0));
  assert.equal(retry, boss);
  assert.equal(retry.hp, 620);
  assert.equal(retry.phase, 'cooldown');
});

test('colossus has a distinct larger weak point, telegraph and faster damaged phase', async () => {
  const { game, warnings, shots, killed } = await makeGame();
  const boss = game.enemies.spawn('colossus', new Vector3(0, 0, 0));
  assert.equal(boss.hp, 900);
  for (let i = 0; i < 51; i++) game.enemies.update(.05);
  assert.match(warnings[0][0], /콜로서스/);
  const hit = game.enemies.raycast(new Vector3(0, 3.855, 8), new Vector3(0, 0, -1), 50);
  assert.equal(hit?.part, 'weak');
  boss.damage(500, boss.pos, null, 'body');
  for (let i = 0; i < 33; i++) game.enemies.update(.05);
  assert.equal(shots.length, 1);
  assert.match(warnings[1][0], /연속 포격/);
  for (let i = 0; i < 15; i++) game.enemies.update(.05);
  assert.equal(shots.length, 2);
  assert.equal(boss.phase, 'cooldown');
  assert.ok(boss.timer <= 1.7);
  boss.damage(1000, boss.pos, null, 'body');
  assert.equal(killed[0].type, 'colossus');
  game.enemies.clear();
  assert.equal(game.enemies.spawn('colossus', new Vector3()).hp, 900);
});
