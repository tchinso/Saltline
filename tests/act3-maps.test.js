import test from 'node:test';
import assert from 'node:assert/strict';
import { Scene, THREE } from '../vendor/three.js';
import { act3Maps } from '../src/content/maps/act3/index.js';
import { createPhysics } from '../src/world/physics.js';
import { createProps } from '../src/world/props/registry.js';
import { createRandom } from '../src/core/random.js';
import { fallbacks } from '../src/core/fallbacks.js';
import '../src/world/props/industrial.js';
import '../src/world/props/register.js';

test('ACT 3 objectives, extraction, supplies and ground spawns are reachable', async () => {
  for (const map of act3Maps) {
    const game = { THREE, scene:new Scene(), world:map.world, mats:fallbacks.mats(), rng:createRandom(), quality:{}, params:{} };
    game.physics = createPhysics(game);
    game.props = createProps(game);
    const level = await map.createLevel(game);
    game.physics.build();
    const walkable = pos => game.physics.nav.isWalkable(pos.x,pos.z);
    const reachable = (pos, label) => {
      assert.ok(walkable(pos), `${map.id}: ${label} is blocked`);
      assert.ok(game.physics.nav.findPath(level.playerStart.pos,pos), `${map.id}: ${label} has no route`);
    };
    reachable(level.playerStart.pos,'start');
    for (const item of level.objectives) reachable(item.pos,item.id);
    reachable(level.extraction.pos,'extraction');
    assert.ok(level.medkitSites.length >= 10, `${map.id}: medkits`);
    assert.ok(level.ammoSites.length >= 6, `${map.id}: ammunition`);
    for (const site of level.medkitSites) reachable(new THREE.Vector3(...site),`medkit ${site}`);
    for (const site of level.ammoSites) reachable(new THREE.Vector3(...site),`ammunition ${site}`);
    for (const spawn of level.enemySpawns.filter(item=>item.type==='ground')) reachable(spawn.pos,`ground spawn ${spawn.pos.toArray()}`);
    if (['m15_depot','m16_city','m19_retreat','m20_shelter'].includes(map.id)) {
      const start = level.objectives.find(item => item.id === 'stage_3').pos;
      const end = level.objectives.find(item => item.id === 'stage_4').pos;
      // Convoys currently move in a straight line, so test their width as well as the centre.
      for (const offset of [-.8, 0, .8]) {
        const a = start.clone().add(new THREE.Vector3(0,1,offset));
        const b = end.clone().add(new THREE.Vector3(0,1,offset));
        assert.ok(game.physics.lineOfSight(a,b), `${map.id}: escort path obstructed at ${offset}`);
      }
    }
    if (['m14_outpost','m18_encircled'].includes(map.id)) {
      const player = level.objectives.find(item => item.id === 'stage_3').pos.clone().add(new THREE.Vector3(0,1,0));
      const threat = new THREE.Vector3(24,1,0);
      assert.ok(walkable(threat), `${map.id}: boss spawn blocked`);
      assert.ok(game.physics.lineOfSight(player, threat), `${map.id}: initial boss line of sight blocked`);
    }
  }
});
