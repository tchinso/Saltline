import { BoxGeometry, Group, Mesh, MeshStandardMaterial, PlaneGeometry, Vector3 } from '../../../../vendor/three.js';
import { createLevelBuilder } from '../../../world/level-builder.js';

// Inland maps keep the harbor's water boundary outside every reachable point.
const world = {
  min: new Vector3(-40, 0, -25), max: new Vector3(40, 24, 25),
  groundY: 0, seaY: -20, quayX: 1000,
  navigation: { minX: -39, maxX: 39, minZ: -24, maxZ: 24, cellSize: .5 }
};
const v = (x, z, y = 0) => new Vector3(x, y, z);
const definitions = [
  { id: 'm01_base', title: '군사기지 훈련장', kind: 'base', labels: ['훈련장', '드론 통제구역', '격납고 입구', '부상병', '기술병', '무인기 기록'] },
  { id: 'm02_command', title: '기지 지휘시설', kind: 'command', labels: ['무기고', '통신실', '정문 방어선', '대피 차량', '고립 장교'] },
  { id: 'm03_city', title: '도심 간선도로', kind: 'city', labels: ['도심 진입로', '경찰 거점', '수송차량', '대피 지점', '고립 소방대'] },
  { id: 'm04_ruins', title: '무너진 도심', kind: 'ruins', labels: ['전복 차량', '고립 분대', '후퇴 경로', '후방 거점', '지휘관 기록'] },
  { id: 'm05_hospital', title: '자동화 종합병원', kind: 'hospital', labels: ['병원 입구', '의료진', '환자 대기실', '대피 차량', '의료물자'] },
  { id: 'm06_bridge', title: '도시 외곽 교량', kind: 'bridge', labels: ['검문소', '교량 방어선', '브레이커 접근로', '철수 지점', '공병 분대'] }
];

// Low-poly, collision-free objective silhouettes identify the interaction positions.
function marker(root, pos, index, kind) {
  const group = new Group();
  group.position.copy(pos);
  const metal = new MeshStandardMaterial({ color: 0x8c9d9f, roughness: .7 });
  const color = new MeshStandardMaterial({ color: index >= 4 ? 0x58bcae : 0xd9a650, emissive: index >= 4 ? 0x174c43 : 0x51320a, roughness: .65 });
  const add = (w, h, d, x, y, z, mat) => {
    const mesh = new Mesh(new BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z); mesh.castShadow = true; group.add(mesh);
  };
  if ((index === 3 && kind !== 'bridge') || index === 4) {
    // A simple person silhouette signals a rescue target.
    add(.46, .7, .3, 0, .8, 0, color); add(.28, .28, .28, 0, 1.31, 0, metal);
    add(.15, .5, .18, -.14, .25, 0, metal); add(.15, .5, .18, .14, .25, 0, metal);
  } else {
    add(.72, .6, .52, 0, .38, 0, metal); add(.5, .26, .08, 0, .52, .29, color);
    add(.1, .32, .1, 0, .86, 0, metal);
  }
  group.userData.setState = state => { color.emissiveIntensity = state === 'cut' ? .15 : state === 'cutting' ? 1.8 : 1; };
  root.add(group);
  return group;
}

function addBlock(b, x, z, w, d, h, material = 'concrete') {
  b.box(material, w, h, d, x, h / 2, z);
  b.col(x - w / 2, 0, z - d / 2, x + w / 2, h, z + d / 2, 'concrete');
}
// Roadside vehicles provide physical cover while leaving the main route open.
function parkedVehicle(b, x, z, paint, damaged = false) {
  b.col(x - 2.25, 0, z - .95, x + 2.25, 1.7, z + .95, 'metal');
  b.box(paint, 4.5, .65, 1.9, x, .64, z);
  b.box(paint, 2.15, .72, 1.75, x - .15, 1.31, z);
  b.box('glass_dirty', 1.65, .44, .025, x - .15, 1.38, z - .89);
  b.box('glass_dirty', 1.65, .44, .025, x - .15, 1.38, z + .89);
  for (const dx of [-1.35, 1.35]) for (const dz of [-.95, .95]) {
    b.cyl('rubber', .38, .22, x + dx, .4, z + dz, { axis: 'z', seg: 12 });
  }
  if (damaged) {
    b.box('steel_dark', 1.2, .09, 1.6, x + 1.2, 1.02, z, { r: [0, 0, .2] });
    b.box('steel_dark', .5, .65, .55, x + 2.5, .32, z + .7, { r: [0, 0, .5] });
  } else {
    b.box('paint_white', .1, .22, 1.45, x + 2.26, .7, z);
  }
}
function addScenery(b, kind) {
  if (kind === 'base') {
    // Hangar entry and training-lane markings.
    for (const x of [2, 24]) b.box('steel_galv', .3, 6.2, .3, x, 3.1, -12.4);
    b.box('steel_galv', 22.4, .3, .3, 13, 6.1, -12.4);
    for (const x of [-30, -24, -18, -12, -6]) b.box('paint_white', 2.8, .015, .08, x, .02, 2.8);
  } else if (kind === 'command') {
    // Radio aerials and a checkpoint arch distinguish the command post.
    for (const x of [-18, 10]) {
      b.rod('steel_galv', [x, 4, -11], [x, 9, -11], .07);
      b.rod('steel_galv', [x - 1, 7, -11], [x + 1, 7, -11], .035);
    }
    for (const z of [-9, 9]) b.box('steel_dark', .35, 5.6, .35, 27, 2.8, z);
    b.box('steel_dark', .35, .35, 18.4, 27, 5.5, 0);
  } else if (kind === 'city' || kind === 'ruins') {
    for (const x of [-33, -21, -9, 3, 15, 27]) b.box('paint_white', 4.5, .015, .12, x, .02, 0);
    parkedVehicle(b, -19, 10.5, kind === 'city' ? 'paint_blue' : 'steel_dark', kind === 'ruins');
    parkedVehicle(b, 16, -10, kind === 'city' ? 'paint_white' : 'paint_red', kind === 'ruins');
    // Window rows on the facades facing the street.
    for (const x of [-28, -12, 5, 22]) for (const dx of [-3, 0, 3]) {
      b.box('glass_dirty', 1.4, 1.15, .04, x + dx, 2.15, -12.47);
      if (kind === 'city') b.box('glass_dirty', 1.4, 1.15, .04, x + dx, 4.1, -12.47);
    }
  } else if (kind === 'hospital') {
    // Corridor lighting, coloured skirting and red crosses face the player route.
    for (const x of [-28, -18, -8, 2, 12, 22, 32]) {
      b.box('paint_white', 2.2, .08, .5, x, 4.4, 0);
      b.box('paint_blue', 5, .32, .04, x, .7, -12.7);
    }
    for (const x of [-22, 8]) {
      b.box('paint_white', 2.4, 2.4, .08, x, 2.4, -12.68);
      b.box('paint_red', 1.65, .35, .1, x, 2.4, -12.62);
      b.box('paint_red', .35, 1.65, .1, x, 2.4, -12.61);
    }
    for (const x of [-30, -22, -14, -6, 2, 10, 18, 26]) b.box('paint_blue', 4, .015, .1, x, .02, -4.2);
    parkedVehicle(b, 30, 10, 'paint_white');
    b.box('paint_red', 1.1, .22, .03, 30, 1.32, 9.08);
    b.box('paint_red', .22, .65, .03, 30, 1.32, 9.07);
  } else if (kind === 'bridge') {
    // Tall pylons and cables frame the road without blocking the route.
    for (const x of [-18, 12]) {
      for (const z of [-11.4, 11.4]) b.box('steel_galv', .8, 11, .8, x, 5.5, z);
      b.box('steel_galv', .8, .8, 23.6, x, 10.7, 0);
      for (const z of [-11.4, 11.4]) {
        b.rod('steel_galv', [x, 10.5, z], [x - 13, 2, z], .07);
        b.rod('steel_galv', [x, 10.5, z], [x + 13, 2, z], .07);
      }
    }
    for (const x of [-34, -26, -18, -10, -2, 6, 14, 22, 30]) b.box('paint_white', 4, .015, .12, x, .02, 0);
    parkedVehicle(b, -30, 8.8, 'paint_white');
  }
}
function construct(b, kind) {
  // Boundary walls and alternating cover leave a clear route down the center.
  for (const z of [-20, 20]) addBlock(b, 0, z, 77, .5, 3, 'concrete');
  for (const x of [-39, 39]) addBlock(b, x, 0, .5, 40, 3, 'concrete');
  const covers = kind === 'bridge'
    ? [[-22,-4],[-14,4],[-5,-4],[4,4],[13,-4],[22,4]]
    : [[-24,-5],[-16,5],[-7,-5],[2,5],[11,-5],[20,5]];
  covers.forEach(([x,z], i) => b.place(i % 2 ? 'sandbags' : 'jersey_barrier', x, z, i % 2 ? .2 : 0, { seed: 30 + i }));
  if (kind === 'base' || kind === 'command') {
    for (const x of [-27, -12, 4, 20]) {
      b.place('light_mast', x, -16, 0, { seed: x + 30 });
      b.place(kind === 'base' ? 'container20' : 'crate_stack', x, 14, 0, { seed: x + 40 });
    }
    if (kind === 'base') {
      // Training target boards and a hangar outline.
      for (const z of [-11, -8, -5]) { b.box('steel_dark', .1, 1.7, .1, -14, .85, z); b.box('paint_orange', .18, .75, .65, -14, 1.35, z); }
      addBlock(b, 13, -13, 24, .5, 5, 'steel_dark');
      addBlock(b, 25, -10, .5, 6, 5, 'steel_dark');
    } else {
      for (const x of [-18, -4, 10, 24]) addBlock(b, x, -11, 8, .6, 4, 'concrete');
      b.place('guard_booth', 27, 11, 0, { seed: 91 });
    }
  } else if (kind === 'city' || kind === 'ruins') {
    for (const x of [-28, -12, 5, 22]) {
      addBlock(b, x, -15, kind === 'ruins' ? 8 : 10, 5, kind === 'ruins' ? 3 : 7, 'concrete');
      addBlock(b, x + 4, 16, 9, 5, kind === 'ruins' ? 4 : 8, 'concrete');
      b.place('dumpster', x + 3, 10, 0, { seed: x + 50 });
    }
    if (kind === 'ruins') for (const x of [-20, 0, 18]) b.place('crate_stack', x, -9, .2, { seed: x + 55 });
  } else if (kind === 'hospital') {
    for (const z of [-13, 13]) for (const x of [-22, -7, 8, 23]) addBlock(b, x, z, 10, .5, 4, 'concrete');
    for (const x of [-14, 1, 16]) { b.place('shelf_rack', x, 9, 0, { seed: x + 44 }); b.place('ibc_tote', x, -9, 0, { seed: x + 48 }); }
    // A red cross on the hospital wall, visible from the approach.
    b.box('paint_red', .2, 2.4, .45, -27, 2.6, -12.65);
    b.box('paint_red', .2, .45, 2.4, -27, 2.6, -12.65);
  } else {
    // Distinct bridge deck, rails, lamps and a gate at each end.
    for (const z of [-11, 11]) {
      addBlock(b, 0, z, 76, .45, 1.1, 'concrete');
      for (const x of [-28, -10, 8, 26]) b.place('light_mast', x, z + (z < 0 ? -3 : 3), 0, { seed: x + 40 });
    }
    b.place('guard_booth', -27, 15, 0, { seed: 101 });
    b.place('gate_arm', -25, 8, 0, { seed: 102 });
  }
  addScenery(b, kind);
  return covers;
}

async function createLevel(game, spec) {
  const root = new Group(); root.name = `level-${spec.id}`; game.scene.add(root);
  const b = createLevelBuilder(game);
  const covers = construct(b, spec.kind);
  root.add(b.staticRoot, b.dynRoot);
  const routes = {
    base: [[-22, 0], [-10, -3], [8, -3], [24, -6], [0, 8], [10, -8]],
    command: [[-24, -3], [-8, -3], [9, 3], [25, 5], [0, 8]],
    city: [[-22, 2], [-7, -3], [8, 3], [26, 0], [0, 8]],
    ruins: [[-25, 1], [-9, 4], [9, -3], [25, 3], [0, 8]],
    hospital: [[-24, 0], [-8, -3], [7, 3], [24, 0], [0, 7]],
    bridge: [[-24, 0], [-8, -2], [9, 2], [26, 0], [0, 8]]
  };
  const positions = routes[spec.kind].map(([x, z]) => v(x, z));
  const objectives = spec.labels.map((label, i) => ({
    id: i < 4 ? `stage_${i + 1}` : `optional_${i - 3}`,
    label, pos: positions[i].clone(), object: marker(b.dynRoot, positions[i], i, spec.kind)
  }));
  const enemySpawns = [];
  for (const x of [-25, -13, -1, 11, 25, 32]) for (const z of [-7, 7]) {
    const groundZ = spec.kind === 'base' && x === 25 && z === -7 ? -3
      : spec.kind === 'bridge' && x === -25 && z === 7 ? 3 : z;
    enemySpawns.push({ type: 'ground', zone: 'field', pos: v(x, groundZ) });
    enemySpawns.push({ type: 'air', zone: 'field', pos: v(x, z, 7 + ((x + z + 50) % 3)) });
  }
  return {
    root, playerStart: { pos: v(-33, 0), yaw: -Math.PI / 2 }, objectives,
    extraction: { pos: v(31, 0), radius: 2.5 }, enemySpawns,
    zones: [{ name: 'field', min: [-39, -20], max: [39, 20] }],
    coverPoints: covers.map(([x,z]) => v(x, z + (z < 0 ? 1.5 : -1.5))),
    interiorBoxes: [], skylights: [], shedLights: [],
    cinematicPath: [ { pos: [-33, 2, 0], look: [-15, 1, 0] }, { pos: [-18, 2, 3], look: [0, 1, 0] } ],
    placed: b.placed,
    stats: { labelsAtlased: 0, containers: b.placed.filter(p => p.name.startsWith('container')).length, props: b.placed.length, tris: 0, meshes: 0 },
    groundSurfaceAt: () => 'concrete',
    update(dt) { for (const update of b.updaters) update(dt); }
  };
}
async function createGround(game) {
  const mesh = new Mesh(new PlaneGeometry(200, 200).rotateX(-Math.PI / 2), game.mats.get('asphalt'));
  mesh.receiveShadow = true; game.scene.add(mesh);
  return { update() {}, wetnessAt: () => .3, isPuddle: () => false };
}
async function createBackdrop() { return { update() {} }; }
export const act1Maps = definitions.map(spec => ({
  id: spec.id, title: spec.title, world, createLevel: game => createLevel(game, spec), createGround, createBackdrop
}));
