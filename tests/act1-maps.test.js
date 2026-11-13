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
    if (map.id === 'm01_base') {
      const targetHit = game.physics.raycast(new THREE.Vector3(-25, 1.5, -4), new THREE.Vector3(1, 0, 0), 4);
      assert.equal(targetHit?.surface, 'metal', 'nearby training target stops shots');
      assert.ok(targetHit.box.noNav, 'target board leaves the ground navigation route open');
    }
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
    if (['m02_command', 'm03_city', 'm05_hospital', 'm06_bridge'].includes(map.id)) {
      const from = level.objectives.find(o => o.id === 'stage_3').pos;
      const to = level.objectives.find(o => o.id === 'stage_4').pos;
      const dx = to.x - from.x, dz = to.z - from.z;
      const distance = Math.hypot(dx, dz);
      const steps = Math.ceil((distance + 2.8) * 2);
      for (let i = 0; i <= steps; i++) {
        const t = (-1.4 + (distance + 2.8) * i / steps) / distance;
        for (const side of [-.8, 0, .8]) {
          const x = from.x + dx * t - dz / distance * side;
          const z = from.z + dz * t + dx / distance * side;
          assert.ok(game.physics.nav.isWalkable(x, z), `${map.id} escort lane ${x.toFixed(1)},${z.toFixed(1)}`);
        }
      }
    }
  }
});
