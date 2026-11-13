import test from 'node:test';
import assert from 'node:assert/strict';
import { Scene, THREE } from '../vendor/three.js';
import { act1Maps } from '../src/content/maps/act1/index.js';
import { createPhysics } from '../src/world/physics.js';
import { createProps } from '../src/world/props/registry.js';
import { createRandom } from '../src/core/random.js';
import { createMedkits } from '../src/player/medkits.js';
import { fallbacks } from '../src/core/fallbacks.js';
import '../src/world/props/industrial.js';
import '../src/world/props/register.js';

test('ACT 1 objectives, extraction, and ground spawns have connected walkable positions', async () => {
  for (const map of act1Maps) {
    const game = { THREE, scene: new Scene(), world: map.world, mats: fallbacks.mats(), rng: createRandom(), quality: {}, params: {} };
    game.physics = createPhysics(game);
    game.props = createProps(game);
    const level = await map.createLevel(game);
    game.physics.build();
    const walkable = position => game.physics.nav.isWalkable(position.x, position.z);
    assert.ok(walkable(level.playerStart.pos), `${map.id} player start`);
    for (const objective of level.objectives) {
      assert.ok(walkable(objective.pos), `${map.id} ${objective.id}`);
      assert.ok(game.physics.nav.findPath(level.playerStart.pos, objective.pos), `${map.id} path to ${objective.id}`);
    }
    assert.ok(walkable(level.extraction.pos), `${map.id} extraction`);
    assert.ok(game.physics.nav.findPath(level.playerStart.pos, level.extraction.pos), `${map.id} path to extraction`);
    game.level = level;
    game.map = map;
    const supplies = createMedkits(game);
    assert.ok(supplies.points.length >= 10, `${map.id} supply count`);
    for (const { position } of supplies.points) {
      assert.ok(walkable(position), `${map.id} supply position`);
      assert.ok(game.physics.nav.findPath(level.playerStart.pos, position), `${map.id} path to supply`);
    }
    for (const spawn of level.enemySpawns.filter(item => item.type === 'ground')) {
      assert.ok(walkable(spawn.pos), `${map.id} spawn ${spawn.pos.x},${spawn.pos.z}`);
    }
  }
});
