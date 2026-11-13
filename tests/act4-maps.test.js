import test from 'node:test';
import assert from 'node:assert/strict';
import { Scene, THREE, Vector3 } from '../vendor/three.js';
import { act4Maps } from '../src/content/maps/act4/index.js';
import { createPhysics } from '../src/world/physics.js';
import { createProps } from '../src/world/props/registry.js';
import { createRandom } from '../src/core/random.js';
import { captureAct1Checkpoint, restoreAct1Checkpoint } from '../src/story/act1-checkpoint.js';
import { fallbacks } from '../src/core/fallbacks.js';
import '../src/world/props/industrial.js';
import '../src/world/props/register.js';

async function makeLevel(map) {
  const game={THREE,scene:new Scene(),world:map.world,mats:fallbacks.mats(),rng:createRandom(),quality:{},params:{}};
  game.physics=createPhysics(game);game.props=createProps(game);game.level=await map.createLevel(game);game.physics.build();
  return game;
}
test('ACT 4 objectives, supplies, and ground spawns are reachable', async () => {
  for(const map of act4Maps) {
    const game=await makeLevel(map),{level,physics}=game;
    const reachable=(pos,label)=>{
      assert.ok(physics.nav.isWalkable(pos.x,pos.z),`${map.id}: ${label} is blocked at ${pos.x},${pos.z}`);
      assert.ok(physics.nav.findPath(level.playerStart.pos,pos),`${map.id}: ${label} has no path`);
    };
    reachable(level.playerStart.pos,'start');
    for(const obj of level.objectives) reachable(obj.pos,obj.id);
    reachable(level.extraction.pos,'extraction');
    assert.ok(level.medkitSites.length>=10);assert.ok(level.ammoSites.length>=6);
    for(const site of level.medkitSites) reachable(new Vector3(...site),'medkit');
    for(const site of level.ammoSites) reachable(new Vector3(...site),'ammo');
    for(const spawn of level.enemySpawns.filter(s=>s.type==='ground')) reachable(spawn.pos,'spawn');
    if(map.id==='m23_front') {
      const from=level.objectives[2].pos,to=level.objectives[3].pos;
      for(let t=0;t<=1;t+=.05) for(const offset of [-1.2,0,1.2]) {
        const p=from.clone().lerp(to,t);p.z+=offset;
        assert.ok(physics.nav.isWalkable(p.x,p.z),`convoy lane blocked at ${p.x},${p.z}`);
      }
    }
    if(map.id==='m25_factory') {
      const boss=new Vector3(24,0,0),objective=level.objectives[2].pos;
      assert.ok(physics.nav.isWalkable(boss.x,boss.z),'Titan spawn');
      assert.ok(physics.lineOfSight(objective.clone().setY(1.6),boss.clone().setY(2)),'Titan opening sightline');
    }
  }
});
test('power-grid intelligence opens a physical alternate entrance without removing the main route', async () => {
  const previous=globalThis.localStorage;
  const map=act4Maps.find(m=>m.id==='m24_power');
  try {
    let flags=[];
    globalThis.localStorage={getItem:()=>JSON.stringify({version:1,completed:[],flags})};
    const normal=await makeLevel(map);
    assert.equal(normal.level.alternateRouteOpen,false);
    assert.equal(normal.physics.nav.isWalkable(0,-8),false,'side entrance blocked');
    assert.equal(normal.physics.nav.isWalkable(0,8),true,'main entrance remains open');
    assert.ok(normal.physics.nav.findPath(normal.level.playerStart.pos,normal.level.objectives[2].pos));
    flags=['flag_power_grid_data'];
    const informed=await makeLevel(map);
    assert.equal(informed.level.alternateRouteOpen,true);
    assert.equal(informed.physics.nav.isWalkable(0,-8),true,'intelligence opens side entrance');
    assert.equal(informed.physics.nav.isWalkable(0,8),true,'main entrance remains open');
    assert.ok(informed.physics.nav.findPath(informed.level.playerStart.pos,new Vector3(0,0,-8)));
  } finally { if(previous===undefined) delete globalThis.localStorage;else globalThis.localStorage=previous; }
});
test('reconstruction robot starts work only after approval and resets on retry', async () => {
  const game=await makeLevel(act4Maps.find(m=>m.id==='m26_rebuild'));
  const scene=game.level.root.getObjectByName('reconstruction-scene');
  const claw=scene.getObjectByName('robot-claw'), debris=scene.getObjectByName('reconstruction-debris');
  const objective=game.level.objectives.find(item=>item.id==='stage_4').object;
  game.level.update(5);
  assert.equal(claw.position.y,2);
  assert.equal(debris.position.y,.25);
  objective.userData.setState('cut');
  game.level.update(5);
  assert.ok(debris.position.y>.25,'approved robot lifts the debris');
  objective.userData.setState('live');
  assert.equal(claw.position.y,2);
  assert.equal(debris.position.y,.25);
  game.player={pos:new Vector3(25,0,3),yaw:0,pitch:0,health:100,reset(start){this.pos.copy(start.pos);}};
  game.weapon={ammo:30,reserve:150,reset(){}};
  game.enemies={list:[],clear(){},spawn(){throw new Error('no saved enemies expected');}};
  game.fx={clear(){}};game.combat={stats:{shots:0,hits:0,kills:0}};
  const run={clearing:false,queue:[],used:new Map(),cut:3,time:20,relays:game.level.objectives.map((o,i)=>({id:o.id,o,cut:i<3}))};
  const checkpoint=captureAct1Checkpoint(game,run);
  objective.userData.setState('cut');game.level.update(5);
  assert.ok(debris.position.y>.25);
  restoreAct1Checkpoint(game,run,checkpoint);
  assert.equal(claw.position.y,2,'checkpoint restores unapproved robot');
  assert.equal(debris.position.y,.25,'checkpoint restores unmoved rubble');
});
