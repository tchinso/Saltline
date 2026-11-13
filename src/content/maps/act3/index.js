import { BoxGeometry, Group, Mesh, MeshStandardMaterial, PlaneGeometry, Vector3 } from '../../../../vendor/three.js';
import { createLevelBuilder } from '../../../world/level-builder.js';

// Each location is an inland, connected single-level combat space.
const world = {
  min: new Vector3(-40, 0, -25), max: new Vector3(40, 24, 25),
  groundY: 0, seaY: -20, quayX: 1000,
  navigation: { minX: -39, maxX: 39, minZ: -24, maxZ: 24, cellSize: .5 }
};
const point = (x, z, y = 0) => new Vector3(x, y, z);
const definitions = [
  { id: 'm14_outpost', title: '연합군 전진기지', kind: 'outpost', start:[-34,-10], exit:[32,8], labels: ['외곽 방어선', '측면 탄약 적치장', '방어 설비', '전투 기록', '신형 기계 부품'], people: [], route: [[-26,-12],[-10,8],[8,-4],[25,3],[0,10]] },
  { id: 'm15_depot', title: '고립된 군수창고', kind: 'depot', start:[-34,10], exit:[32,-8], labels: ['창고 진입로', '필수 보급품', '보급차량', '전선 전달 지점', '추가 군수품'], people: [], route: [[-25,11],[-9,-10],[9,3],[26,-2],[0,10]] },
  { id: 'm16_city', title: '무장해제 도시', kind: 'city', start:[-34,-12], exit:[32,7], labels: ['도시 검문소', '탈출 희망자', '탈출 경로', '도시 외곽', '고립 정보요원'], people: [1,4], route: [[-26,-11],[-10,10],[8,3],[26,0],[0,10]] },
  { id: 'm17_industry', title: '발전시설 외곽 산업지대', kind: 'industry', start:[-34,10], exit:[32,-8], labels: ['원정군 집결지', '산업지대 진입로', '외곽 방어선', '전진거점', '전력망 설계자료'], people: [], route: [[-26,11],[-9,-8],[8,3],[26,9],[0,10]] },
  { id: 'm18_encircled', title: '포위된 원정군 진지', kind: 'encircled', start:[-34,-10], exit:[32,8], labels: ['포위망 탈출구', '지휘소 통신기', '헌터 접근로', '철수로', '고립 정찰부대'], people: [4], route: [[-26,-9],[-9,3],[8,-3],[25,3],[0,10]] },
  { id: 'm19_retreat', title: '붕괴한 군사 도로', kind: 'retreat', start:[-34,10], exit:[32,-8], labels: ['부상자 집결지', '후퇴 차량', '후퇴 경로', '마지막 수송차', '고립 장교와 자료'], people: [0,4], route: [[-26,8],[-10,6],[8,-2],[26,3],[0,10]] },
  { id: 'm20_shelter', title: '마지막 방어선', kind: 'shelter', start:[-34,-10], exit:[32,8], labels: ['외곽 방어 진지', '피난민 대피소', '지하 통로 입구', '탈출 통로', '야전의료팀'], people: [4], route: [[-25,-9],[-9,9],[8,2],[26,-2],[0,10]] },
  { id: 'm21_underground', title: '지하 대피소와 통신시설', kind: 'underground', start:[-34,10], exit:[32,-8], labels: ['생존자 집결지', '통신시설 입구', '방어 로봇 구역', '자료 송신 장치', '고립 시민'], people: [0,4], route: [[-26,9],[-9,-9],[8,3],[25,2],[0,10]] }
];

function block(b, x, z, width, depth, height, material = 'concrete') {
  b.box(material, width, height, depth, x, height / 2, z);
  b.col(x - width / 2, 0, z - depth / 2, x + width / 2, height, z + depth / 2, material === 'concrete' ? 'concrete' : 'metal');
}
function vehicle(b, x, z, material = 'steel_dark', length = 5) {
  block(b, x, z, length, 2.3, .85, material);
  b.box(material, length * .45, .75, 2, x - .3, 1.2, z);
  for (const dx of [-length * .3, length * .3]) for (const dz of [-1.15,1.15]) b.cyl('rubber', .42, .25, x + dx, .4, z + dz, { axis:'z' });
}
function facade(b, x, z, width, height, material = 'concrete') {
  block(b, x, z, width, 3, height, material);
  for (let dx = -width / 2 + 1.5; dx < width / 2; dx += 3) for (let y = 2; y < height - 1; y += 2.4)
    b.box('glass_dirty', 1.3, 1, .05, x + dx, y, z + (z < 0 ? 1.53 : -1.53));
}
function objectiveModel(root, pos, person, optional) {
  const group = new Group(); group.position.copy(pos);
  const metal = new MeshStandardMaterial({ color: 0x788888, roughness: .7 });
  const marker = new MeshStandardMaterial({ color: optional ? 0x56c4ae : 0xe4af4b, emissive: optional ? 0x155a4c : 0x55310b });
  function box(w,h,d,x,y,z,material) { const m = new Mesh(new BoxGeometry(w,h,d), material); m.position.set(x,y,z); m.castShadow = true; group.add(m); }
  if (person) {
    box(.48,.68,.3,0,.86,0,marker); box(.3,.3,.3,0,1.36,0,metal);
    box(.16,.5,.18,-.14,.25,0,metal); box(.16,.5,.18,.14,.25,0,metal);
  } else {
    box(.85,.7,.65,0,.38,0,metal); box(.55,.26,.08,0,.56,.34,marker); box(.12,.35,.12,0,.9,0,metal);
  }
  group.userData.setState = state => { marker.emissiveIntensity = state === 'cut' ? .15 : state === 'cutting' ? 1.8 : 1; };
  root.add(group); return group;
}
// Cross-walls divide locations into actual sectors. Their offset openings give
// each episode a different route instead of repeating the same open yard.
function crossWall(b, x, openingZ, material = 'concrete', kind = '') {
  const bottom = -20.5, top = 20.5, halfGap = 3.5;
  const lowEnd = openingZ - halfGap, highStart = openingZ + halfGap;
  const height = kind === 'city' ? 6 : kind === 'underground' ? 5.8 : kind === 'depot' ? 4 : 2.6;
  if (lowEnd > bottom) block(b, x, (bottom + lowEnd) / 2, .8, lowEnd - bottom, height, material);
  if (highStart < top) block(b, x, (highStart + top) / 2, .8, top - highStart, height, material);
  if (kind === 'city') {
    for (const [lo,hi] of [[bottom,lowEnd],[highStart,top]]) {
      for (let z = lo + 1.6; z < hi - 1; z += 3) for (const y of [2,4]) {
        b.box('glass_dirty', .05, 1, 1.3, x - .43, y, z);
        b.box('glass_dirty', .05, 1, 1.3, x + .43, y, z);
      }
    }
  }
}
const sectors = {
  // A forward perimeter gives way to a second fallback line.
  outpost: [[-17, -9], [6, 9]],
  // Interior aisles weave between the loading and dispatch areas.
  depot: [[-18, 9], [6, -9]],
  // A zig-zag of streets and controlled passages.
  city: [[-18, -9], [-2, 9]],
  // Industrial partitions leave wide side access around machinery.
  industry: [[-18, 9], [6, -9]],
  // Open central fire lane for the Hunter; the surrounding cover creates the pocket.
  encircled: [],
  // Collapsed barriers force a retreat through alternating shoulders.
  retreat: [[-18, 9], [-2, -9]],
  // Approach to the shelter passes successive defensive positions.
  shelter: [[-17, -9], [-2, 9]],
  // Enclosed service passages snake between connected equipment rooms.
  underground: [[-18, 8], [-2, -8], [18, 8]]
};
function buildScenery(b, kind) {
  if (kind === 'outpost') {
    for (const x of [-29,-13,3,19]) {
      b.place('sandbags', x,-14,0,{ seed:x+45 }); b.place('light_mast', x,15,0,{ seed:x+50 });
    }
    vehicle(b, -18, 12, 'steel_dark', 6); vehicle(b, 22, -13, 'steel_dark', 6);
    b.place('guard_booth', 30, 14, 0, { seed:31 });
    // Raised watch platform distinguishes the military perimeter from a road junction.
    for (const dx of [-1.7,1.7]) for (const dz of [-1.7,1.7]) b.box('steel_dark', .25, 5.8, .25, -28 + dx, 2.9, -16 + dz);
    b.box('steel_galv', 4, .35, 4, -28, 5.2, -16);
    b.box('paint_green', 3.5, 1.5, .16, -28, 6, -17.7);
  } else if (kind === 'depot') {
    for (const x of [-29,-13,3,19]) {
      b.place('container20', x, -16, 0, { seed:x+44 });
      b.place('shelf_rack', x, 15, 0, { seed:x+54 });
      b.place('barrel', x+5, -12, 0, { seed:x+59 });
    }
    vehicle(b, 25, 12, 'steel_dark', 7);
  } else if (kind === 'city') {
    for (const x of [-29,-13,3,19]) { facade(b,x,-17,11,8); facade(b,x+3,17,10,7); }
    for (const x of [-20,0,20]) b.place('fence_panel', x,-12,0,{seed:x+30});
    b.place('guard_booth', -30, 13, 0, { seed:32 }); vehicle(b, 22, 12, 'paint_white', 4.5);
  } else if (kind === 'industry') {
    for (const x of [-27,-12,3,18,30]) {
      b.place('generator',x,-15,0,{seed:x+60}); b.place('shelf_rack',x,15,0,{seed:x+65});
      b.cyl('steel_dark',1.2,5,x+4,2.5,-17,{seg:12});
    }
    b.box('steel_galv', 70, .8, .8, 0, 5.4, -16);
    for (const x of [-24,-4,16]) {
      b.box('steel_dark', .6, 7, .6, x, 3.5, 18);
      b.box('steel_dark', .6, .4, 6, x, 6.8, 15);
    }
  } else if (kind === 'encircled') {
    for (const x of [-28,-12,4,20]) {
      b.place('jersey_barrier',x,-14,.18,{seed:x+40});
      b.place('sandbags',x+4,14,-.18,{seed:x+50});
      b.place('barrel',x+6,-12,0,{seed:x+55});
    }
    vehicle(b,-22,12,'steel_dark',6); vehicle(b,24,-13,'steel_dark',6);
    for (const z of [-15,15]) { b.box('paint_orange', .3, 5, .3, 34, 2.5, z); b.box('steel_dark', .3, .3, 7, 34, 5, z+(z<0?3:-3)); }
  } else if (kind === 'retreat') {
    for (const x of [-30,-14,2,18]) { facade(b,x,-17,9,4,'concrete'); b.place('crate_wood',x+4,15,0,{seed:x+40}); }
    vehicle(b,-20,12,'steel_dark',6); vehicle(b,17,-12,'steel_dark',5);
    for (const x of [-30,-16,-2,12,26]) b.box('paint_white',5,.015,.12,x,.02,0);
    for (const x of [-22,4,26]) b.place('jersey_barrier',x,14,.25,{seed:x+30});
  } else if (kind === 'shelter') {
    for (const x of [-29,-13,3,19]) { b.place('sandbags',x,-14,0,{seed:x+35}); b.place('fence_panel',x,15,0,{seed:x+45}); }
    vehicle(b,-22,12,'paint_white',5); vehicle(b,22,-13,'steel_dark',6);
    for (const z of [-14,14]) { block(b,29,z,2,7,5,'concrete'); b.box('steel_dark',2,1,21,29,5.5,0); }
  } else {
    // Tunnel ribs and divided equipment rooms remain a single navigable level.
    for (const x of [-30,-15,0,15,30]) {
      block(b,x,-14,1,5,5,'concrete'); block(b,x,14,1,5,5,'concrete');
      b.box('steel_dark',1,.4,28,x,5,0);
      b.box('paint_white',2,.08,.5,x,4.8,0);
      b.place('generator',x,-18,0,{seed:x+60}); b.place('shelf_rack',x,18,0,{seed:x+65});
    }
    b.box('steel_dark',76,.25,42,0,6.5,0);
  }
}
function buildLevel(game, spec) {
  const root = new Group(); root.name = `level-${spec.id}`; game.scene.add(root);
  const firstCollider = game.physics.boxes.length;
  const b = createLevelBuilder(game);
  for (const z of [-21,21]) block(b,0,z,77,.5,3);
  for (const x of [-39,39]) block(b,x,0,.5,42,3);
  const covers = {
    outpost: [[-28,-5],[-20,5],[-12,-5],[-4,5],[4,-5],[12,5],[20,-5],[28,5]],
    depot: [[-30,5],[-22,-5],[-14,5],[-6,-5],[2,5],[10,-5],[18,5],[28,-5]],
    city: [[-29,-6],[-20,6],[-11,-6],[-2,6],[7,-6],[16,6],[25,-6],[32,6]],
    industry: [[-30,-5],[-21,5],[-12,-5],[-3,5],[6,-5],[15,5],[24,-5],[32,5]],
    encircled: [[-29,5],[-21,-6],[-13,6],[-5,-5],[3,5],[11,-6],[19,6],[29,-5]],
    retreat: [[-29,-6],[-21,6],[-13,5],[-5,-6],[3,-5],[11,6],[19,5],[28,-6]],
    shelter: [[-30,-5],[-22,5],[-14,-5],[-6,5],[2,-5],[10,5],[18,-5],[29,5]],
    underground: [[-29,6],[-21,-6],[-13,6],[-5,-6],[3,6],[11,-6],[19,6],[29,-6]]
  };
  const cover = covers[spec.kind];
  const sectorWalls = sectors[spec.kind];
  // Sites close to a cross-wall belong in its opening, not inside its collider.
  const inOpening = (x, z) => {
    const wall = sectorWalls.find(([wallX]) => Math.abs(x - wallX) <= 1.75);
    return wall ? wall[1] : z;
  };
  for (const [x,z] of sectorWalls) crossWall(b, x, z, spec.kind === 'depot' ? 'steel_dark' : 'concrete', spec.kind);
  const reachableCover = cover.filter(([x]) => sectorWalls.every(([wallX]) => Math.abs(x - wallX) > 2));
  reachableCover.forEach(([x,z],i) => b.place(i%2 ? 'sandbags' : 'jersey_barrier',x,z,0,{seed:i+100}));
  buildScenery(b,spec.kind); root.add(b.staticRoot,b.dynRoot);
  const positions = spec.route.map(([x,z]) => point(x,inOpening(x,z)));
  const objectives = spec.labels.map((label,i) => ({ id:i<4 ? `stage_${i+1}` : `optional_${i-3}`,
    label,pos:positions[i].clone(),object:objectiveModel(b.dynRoot,positions[i],spec.people.includes(i),i>=4) }));
  const enemySpawns = [];
  for (const x of [-27,-15,-3,9,21,33]) for (const z of [-9,9]) {
    enemySpawns.push({ type:'ground', zone:'field', pos:point(x,inOpening(x,z)) });
    enemySpawns.push({ type:'air', zone:'field', pos:point(x,z,7+((x+z+60)%3)) });
  }
  const medkitSites = [[-33,0,2],[-27,0,-2],[-20,0,1],[-13,0,-1],[-6,0,1],[1,0,-1],[8,0,1],[15,0,-1],[22,0,1],[29,0,-1],[34,0,2]].map(([x,y,z]) => [x,y,inOpening(x,z)]);
  const ammoSites = [[-30,0,-3],[-20,0,3],[-10,0,-3],[0,0,3],[10,0,-3],[20,0,3],[30,0,-3]].map(([x,y,z]) => [x,y,inOpening(x,z)]);
  for (const [wallX, gapZ] of sectorWalls) {
    medkitSites.push([wallX - 2.5, 0, gapZ]);
    ammoSites.push([wallX + 2.5, 0, gapZ]);
  }
  const start = point(...spec.start), exit = point(...spec.exit);
  const coverPoints = reachableCover.map(([x,z])=>point(x,z+(z<0?1.5:-1.5)));
  // On the retreat and shelter maps the player moves west, giving the fall-back
  // route an opposite orientation while keeping all collisions in world space.
  const reverse = spec.kind === 'retreat' || spec.kind === 'shelter';
  if (reverse) {
    root.rotation.y = Math.PI;
    const turn = p => { p.x = -p.x; p.z = -p.z; };
    turn(start); turn(exit);
    for (const objective of objectives) turn(objective.pos);
    for (const spawn of enemySpawns) turn(spawn.pos);
    for (const coverPoint of coverPoints) turn(coverPoint);
    for (const site of [...medkitSites,...ammoSites]) { site[0] = -site[0]; site[2] = -site[2]; }
    for (const box of game.physics.boxes.slice(firstCollider)) {
      [box.min.x,box.max.x] = [-box.max.x,-box.min.x];
      [box.min.z,box.max.z] = [-box.max.z,-box.min.z];
    }
  }
  return { root,playerStart:{pos:start,yaw:reverse ? Math.PI/2 : -Math.PI/2},objectives,medkitSites,ammoSites,
    extraction:{pos:exit,radius:2.5},enemySpawns,
    zones:[{name:'field',min:[-39,-21],max:[39,21]}],coverPoints,
    interiorBoxes:[],skylights:[],shedLights:[],cinematicPath:[{pos:[start.x,2,start.z],look:[objectives[0].pos.x,1,objectives[0].pos.z]},{pos:[reverse?18:-18,2,reverse?-3:3],look:[0,1,0]}],
    placed:b.placed,stats:{labelsAtlased:0,containers:b.placed.filter(p=>p.name.startsWith('container')).length,props:b.placed.length,tris:0,meshes:0},
    groundSurfaceAt:()=> 'concrete',update(dt){for(const update of b.updaters) update(dt);} };
}
async function createGround(game) {
  const mesh = new Mesh(new PlaneGeometry(200,200).rotateX(-Math.PI/2), game.mats.get('asphalt'));
  mesh.receiveShadow = true; game.scene.add(mesh);
  return { update(){},wetnessAt:()=>.3,isPuddle:()=>false };
}
async function createBackdrop() { return { update(){} }; }
export const act3Maps = definitions.map(spec => ({ id:spec.id,title:spec.title,world,
  createLevel:game=>buildLevel(game,spec),createGround,createBackdrop }));
