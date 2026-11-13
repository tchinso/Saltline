import { BoxGeometry, Group, Mesh, MeshStandardMaterial, PlaneGeometry, Vector3 } from '../../../../vendor/three.js';
import { createLevelBuilder } from '../../../world/level-builder.js';

// These maps are inland; no reachable cell is beyond the harbor water boundary.
const world = {
  min: new Vector3(-40, 0, -25), max: new Vector3(40, 24, 25),
  groundY: 0, seaY: -20, quayX: 1000,
  navigation: { minX: -39, maxX: 39, minZ: -24, maxZ: 24, cellSize: .5 }
};
const v = (x, z, y = 0) => new Vector3(x, y, z);
const definitions = [
  { id: 'm07_lab', title: '점령된 로봇 연구소', kind: 'lab', labels: ['연구소 접근로', '윤세린', '연구 자료', '탈출 통로', '시제품 장비'], people: [1], route: [[-26,-2],[-10,3],[8,-2],[25,3],[0,10]] },
  { id: 'm08_hospital', title: '시립병원 탈환', kind: 'hospital', labels: ['외곽 진입로', '병원 통제실', '생존자', '옥상 제어 설비', '중환자실 전력'], people: [2], route: [[-25,2],[-9,-3],[9,3],[26,-2],[0,10]] },
  { id: 'm09_front', title: '도시 외곽 전선', kind: 'front', labels: ['보병 진격로', '아군 전차', '장갑차 접근로', '방어 거점', '정찰팀'], people: [4], route: [[-26,2],[-10,-2],[8,3],[26,0],[0,10]] },
  { id: 'm10_factory', title: '무인 생산시설', kind: 'factory', labels: ['공장 외곽', '생산라인', '보급 기록', '탈출로', '운송 기록'], people: [], route: [[-26,-2],[-9,3],[8,-3],[26,2],[0,10]] },
  { id: 'm11_zone', title: '기계 통제 보호구역', kind: 'zone', labels: ['통제 검문소', '억류 시민', '탈출 통로', '대피 집결지', '감시 기록'], people: [1, 3], route: [[-26,0],[-9,3],[8,-3],[25,3],[0,10]] },
  { id: 'm12_station', title: '화물역과 관제시설', kind: 'station', labels: ['화물역 진입로', '열차 접근로', '열차 구간', '철도 관제실', '철도 기술자'], people: [4], route: [[-26,-3],[-10,2],[8,-2],[26,3],[0,10]] },
  { id: 'm13_city', title: '점령도시 중심가', kind: 'city', labels: ['도시 외곽', '중심 광장', '중장갑 병기', '군사시설', '포로 수용구역'], people: [4], route: [[-25,2],[-9,-3],[8,2],[26,-2],[0,10]] }
];

function addBox(b, x, z, width, depth, height, mat = 'concrete', collider = true) {
  b.box(mat, width, height, depth, x, height / 2, z);
  if (collider) b.col(x - width / 2, 0, z - depth / 2, x + width / 2, height, z + depth / 2, mat === 'concrete' ? 'concrete' : 'metal');
}
function humanOrDevice(root, position, person, optional) {
  const g = new Group();
  g.position.copy(position);
  const shell = new MeshStandardMaterial({ color: person ? 0x728c91 : 0x7b8787, roughness: .7 });
  const lamp = new MeshStandardMaterial({ color: optional ? 0x56c4ae : 0xe4af4b, emissive: optional ? 0x155a4c : 0x55310b });
  function box(w, h, d, x, y, z, material) {
    const mesh = new Mesh(new BoxGeometry(w,h,d), material); mesh.position.set(x,y,z); mesh.castShadow = true; g.add(mesh);
  }
  if (person) {
    box(.48,.68,.3,0,.86,0,lamp); box(.3,.3,.3,0,1.36,0,shell);
    box(.16,.5,.18,-.14,.25,0,shell); box(.16,.5,.18,.14,.25,0,shell);
  } else {
    box(.85,.7,.65,0,.38,0,shell); box(.55,.26,.08,0,.56,.34,lamp);
    box(.12,.35,.12,0,.9,0,shell);
  }
  g.userData.setState = state => { lamp.emissiveIntensity = state === 'cut' ? .15 : state === 'cutting' ? 1.8 : 1; };
  root.add(g); return g;
}
function vehicle(b, x, z, color = 'steel_dark', length = 5) {
  addBox(b, x, z, length, 2.2, .85, color);
  b.box(color, length * .45, .75, 2, x - .2, 1.2, z);
  for (const dx of [-length*.3,length*.3]) for (const dz of [-1.15,1.15]) b.cyl('rubber', .42, .25, x+dx, .4, z+dz, { axis: 'z' });
}
function facade(b, x, z, width, height, material = 'concrete') {
  addBox(b, x, z, width, 3, height, material);
  for (let dx = -width/2 + 1.5; dx < width/2; dx += 3) for (let y = 2; y < height-1; y += 2.4)
    b.box('glass_dirty', 1.3, 1, .05, x+dx, y, z + (z < 0 ? 1.53 : -1.53));
}
function buildScenery(b, kind) {
  if (kind === 'lab') {
    for (const x of [-27,-13,2,17,30]) {
      addBox(b, x, -15, 8, .5, 5, 'steel_dark');
      b.box('glass_dirty', 5, 2, .08, x, 2.5, -14.7);
      b.place('generator', x, 15, 0, { seed: x + 40 });
    }
    for (const x of [-22,-4,14]) { b.cyl('steel_galv', 1.4, 3.6, x, 1.8, -12, { seg: 16 }); b.box('paint_blue', .12, 1.1, .05, x, 2.1, -10.58); }
  } else if (kind === 'hospital') {
    for (const x of [-28,-13,2,17,30]) {
      addBox(b, x, -15, 10, .5, 5, 'concrete');
      b.box('paint_red', 1.4, .3, .06, x, 2.7, -14.7); b.box('paint_red', .3, 1.4, .06, x, 2.7, -14.69);
      b.place('shelf_rack', x, 15, 0, { seed: x + 45 });
    }
    for (const x of [-25,-9,7,23]) b.box('paint_blue', 10, .08, .08, x, 1, -14.7);
    // Roof equipment appears in the final sector, at ground level due to current AI navigation.
    for (const x of [18,25,32]) b.place('generator', x, 12, 0, { seed: x + 80 });
  } else if (kind === 'front') {
    for (const x of [-28,-12,4,20]) { b.place('sandbags', x, -14, 0, { seed: x + 70 }); b.place('sandbags', x+6, 14, 0, { seed: x + 75 }); }
    vehicle(b, -11, 13, 'steel_dark', 6.5); vehicle(b, 25, -13, 'steel_dark', 6);
    for (const x of [-25,-3,18]) b.place('light_mast', x, -19, 0, { seed: x+50 });
  } else if (kind === 'factory') {
    for (const x of [-27,-12,3,18,30]) {
      b.place('generator', x, -14, 0, { seed: x+60 }); b.place('shelf_rack', x, 14, 0, { seed: x+65 });
      b.cyl('steel_dark', 1.25, 4, x+4, 2, -16, { seg: 12 });
    }
    b.box('steel_dark', 67, .9, 2.5, 0, .65, -12);
    for (const x of [-22,-8,6,20]) { b.box('paint_orange', .35, 4.5, .35, x, 2.25, 17); b.box('steel_galv', .3,.3,7,x,4.4,14); }
  } else if (kind === 'zone') {
    for (const x of [-29,-13,3,19]) { facade(b, x, -17, 11, 7); facade(b, x+4, 17, 10, 6); }
    for (const x of [-25,-5,15]) { b.place('fence_panel', x, -12, 0, { seed: x+50 }); b.place('guard_booth', x, 14, 0, { seed: x+60 }); }
    vehicle(b, 28, -12, 'paint_white', 4.5);
  } else if (kind === 'station') {
    for (const z of [-15,-12]) { b.box('steel_galv', 76, .12, .14, 0, .12, z); }
    for (let x = -35; x <= 35; x += 2) b.box('wood_dark', .18, .1, 4, x, .07, -13.5);
    for (const x of [-24,-7,10]) {
      addBox(b, x, -15, 12, 3.2, 3, 'steel_dark');
      b.box('paint_orange', 11,.25,.04,x,2,-13.37);
    }
    for (const x of [-27,-8,11,27]) b.place('container20', x, 15, 0, { seed: x+50 });
    b.place('guard_booth', 29, -11, 0, { seed: 85 });
  } else {
    for (const x of [-29,-13,3,19]) { facade(b, x, -17, 11, 9); facade(b, x+3, 17, 10, 8); }
    vehicle(b, -23, 12, 'steel_dark', 6); vehicle(b, 23, -12, 'paint_blue', 5);
    for (const x of [-28,-14,0,14,28]) b.box('paint_white', 5, .015, .12, x, .02, 0);
    for (const x of [11,28]) b.place('light_mast', x, 18, 0, { seed: x+44 });
  }
}
function buildLevel(game, spec) {
  const root = new Group(); root.name = `level-${spec.id}`; game.scene.add(root);
  const b = createLevelBuilder(game);
  // The perimeter and varied partial partitions create connected lanes without restricting the AI to a single path.
  for (const z of [-21,21]) addBox(b, 0, z, 77, .5, 3);
  for (const x of [-39,39]) addBox(b, x, 0, .5, 42, 3);
  const cover = [[-28, -5],[-20,5],[-12,-5],[-4,5],[4,-5],[12,5],[20,-5],[28,5]];
  cover.forEach(([x,z],i) => b.place(i%2 ? 'sandbags' : 'jersey_barrier', x,z, 0, { seed: i+100 }));
  buildScenery(b, spec.kind);
  root.add(b.staticRoot,b.dynRoot);
  const positions = spec.route.map(([x,z]) => v(x,z));
  const objectives = spec.labels.map((label, i) => ({ id: i < 4 ? `stage_${i+1}` : `optional_${i-3}`,
    label, pos: positions[i].clone(), object: humanOrDevice(b.dynRoot, positions[i], spec.people.includes(i), i >= 4) }));
  const enemySpawns = [];
  for (const x of [-27,-15,-3,9,21,33]) for (const z of [-9,9]) {
    enemySpawns.push({ type:'ground', zone:'field', pos:v(x,z) });
    enemySpawns.push({ type:'air', zone:'field', pos:v(x,z,7+((x+z+60)%3)) });
  }
  const medkitSites = [[-33,0,2],[-27,0,-2],[-20,0,1],[-13,0,-1],[-6,0,1],[1,0,-1],[8,0,1],[15,0,-1],[22,0,1],[29,0,-1],[34,0,2]];
  return { root, playerStart: { pos:v(-34,0), yaw:-Math.PI/2 }, objectives, medkitSites,
    extraction: { pos:v(32,0), radius:2.5 }, enemySpawns,
    zones:[{ name:'field', min:[-39,-21], max:[39,21] }], coverPoints:cover.map(([x,z]) => v(x,z+(z<0?1.5:-1.5))),
    interiorBoxes:[], skylights:[], shedLights:[], cinematicPath:[{ pos:[-34,2,0],look:[-17,1,0] },{ pos:[-18,2,3],look:[0,1,0] }],
    placed:b.placed, stats:{ labelsAtlased:0, containers:b.placed.filter(p=>p.name.startsWith('container')).length, props:b.placed.length, tris:0, meshes:0 },
    groundSurfaceAt:()=> spec.kind === 'station' ? 'concrete' : 'concrete', update(dt) { for (const update of b.updaters) update(dt); } };
}
async function createGround(game) {
  const mesh = new Mesh(new PlaneGeometry(200,200).rotateX(-Math.PI/2), game.mats.get('asphalt'));
  mesh.receiveShadow = true; game.scene.add(mesh);
  return { update() {}, wetnessAt:()=>.3, isPuddle:()=>false };
}
async function createBackdrop() { return { update() {} }; }
export const act2Maps = definitions.map(spec => ({ id:spec.id, title:spec.title, world,
  createLevel:game=>buildLevel(game,spec), createGround, createBackdrop }));
