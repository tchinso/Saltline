import test from 'node:test';
import assert from 'node:assert/strict';
import { Scene, THREE, Vector3 } from '../vendor/three.js';
import { createAmmoBags } from '../src/player/ammo-bags.js';
import { createEventBus } from '../src/core/events.js';
import { createPhysics } from '../src/world/physics.js';
import { createProps } from '../src/world/props/registry.js';
import { createRandom } from '../src/core/random.js';
import { fallbacks } from '../src/core/fallbacks.js';
import { act1Maps } from '../src/content/maps/act1/index.js';
import { act2Maps } from '../src/content/maps/act2/index.js';
import { harbor } from '../src/content/maps/harbor/index.js';
import '../src/world/props/industrial.js';
import '../src/world/props/register.js';

function testGame() {
  const events = createEventBus(), pickups = [];
  events.on('weapon:ammoPickup', event => pickups.push(event));
  const weapon = {
    ammo: 30, magSize: 30, reserve: 150, maxReserve: 150,
    refillAmmo() { const before = this.ammo + this.reserve; this.ammo = this.magSize; this.reserve = Math.max(this.reserve, this.maxReserve); return this.ammo + this.reserve - before; }
  };
  return { scene: new Scene(), physics: { nav: { isWalkable: () => true } }, events, pickups, weapon,
    player: { pos: new Vector3(), alive: true }, hud: { message() {} } };
}

test('ammo bag refills magazine and reserve without discarding bonuses and respawns', () => {
  const game = testGame();
  const bags = createAmmoBags(game, [[0, 0, 0]]);
  bags.reset();
  bags.update(.1);
  assert.equal(bags.points[0].model.visible, true, 'full weapon does not consume bag');
  game.weapon.ammo = 3; game.weapon.reserve = 11;
  bags.update(.1);
  assert.deepEqual([game.weapon.ammo, game.weapon.reserve], [30, 150]);
  assert.equal(game.pickups[0].amount, 166);
  assert.equal(bags.points[0].model.visible, false);
  game.weapon.ammo = 4; game.weapon.reserve = 180;
  bags.update(59);
  assert.equal(game.weapon.ammo, 4);
  game.player.pos.x = 5;
  bags.update(1);
  assert.equal(bags.points[0].model.visible, true);
  game.player.pos.x = 0;
  bags.update(.1);
  assert.deepEqual([game.weapon.ammo, game.weapon.reserve], [30, 180], 'bonus ammunition is preserved');
  bags.reset();
  assert.equal(bags.points[0].model.visible, true, 'restart restores bags');
});

test('existing campaign maps place reachable ammo bags along their routes', async () => {
  for (const map of [harbor, ...act1Maps, ...act2Maps]) {
    const game = { THREE, map, scene: new Scene(), world: map.world, mats: fallbacks.mats(), rng: createRandom(), quality: {}, params: {} };
    game.physics = createPhysics(game);
    game.props = createProps(game);
    game.level = await map.createLevel(game);
    game.physics.build();
    const bags = createAmmoBags(game);
    assert.ok(bags.points.length >= 6, `${map.id} bag count`);
    for (const { position } of bags.points) {
      assert.ok(game.physics.nav.isWalkable(position.x, position.z), `${map.id} bag walkable at ${position.x},${position.z}`);
      assert.ok(game.physics.nav.findPath(game.level.playerStart.pos, position), `${map.id} bag reachable`);
    }
  }
});
