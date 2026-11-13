import { BoxGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from '../../vendor/three.js';

const THREAT_RADIUS = 9;
const THREAT_WARNING_SECONDS = 3;
const DAMAGE_PER_THREAT = .75;

// The convoy advances only while the player stays nearby and the route is clear.
// Nearby hostile machines can destroy it, making protection an actual objective.
export function createEscort(game, from, to, label, options = {}) {
  const root = new Group();
  root.name = 'escort';
  const bodyMaterial = new MeshStandardMaterial({ color: 0x8e9a86, roughness: .8 });
  const darkMaterial = new MeshStandardMaterial({ color: 0x273035, roughness: .85 });
  const lightMaterial = new MeshStandardMaterial({ color: 0xe2d5b3, emissive: 0x39301c });
  function box(size, position, material) {
    const mesh = new Mesh(new BoxGeometry(...size), material);
    mesh.position.set(...position);
    mesh.castShadow = true;
    root.add(mesh);
  }
  if (options.style === 'device') {
    box([1.4, 1, 1.2], [0, .5, 0], darkMaterial);
    box([1.1, .35, .9], [0, 1.15, 0], bodyMaterial);
    box([.2, 1.3, .2], [0, 1.95, 0], lightMaterial);
  } else if (options.style === 'person') {
    box([.55, .8, .32], [0, 1.05, 0], bodyMaterial);
    box([.32, .32, .32], [0, 1.65, 0], lightMaterial);
    for (const z of [-.15, .15]) box([.18, .65, .17], [0, .34, z], darkMaterial);
    for (const z of [-.36, .36]) box([.18, .65, .18], [0, 1.03, z], bodyMaterial);
  } else if (options.style === 'tank') {
    box([3.6, 1, 2], [0, .8, 0], bodyMaterial);
    box([1.8, .6, 1.5], [0, 1.55, 0], darkMaterial);
    box([2, .22, .22], [1.5, 1.65, 0], darkMaterial);
    for (const z of [-1, 1]) box([3.5, .55, .4], [0, .3, z], darkMaterial);
  } else if (options.style === 'train') {
    box([4.4, 1.5, 1.9], [0, 1.1, 0], bodyMaterial);
    box([1.3, .65, 1.8], [1.45, 2, 0], lightMaterial);
    for (const x of [-1.5, 1.5]) for (const z of [-.9, .9]) box([.65, .6, .2], [x, .3, z], darkMaterial);
  } else {
    box([2.8, 1, 1.55], [0, .85, 0], bodyMaterial);
    box([1, .7, 1.4], [.75, 1.55, 0], lightMaterial);
    for (const x of [-.9, .9]) for (const z of [-.8, .8]) box([.55, .55, .22], [x, .3, z], darkMaterial);
  }
  root.rotation.y = -Math.atan2(to.z - from.z, to.x - from.x);
  game.scene.add(root);
  const display = document.createElement('div');
  display.className = 'escort-status';
  display.hidden = true;
  game.hud.root.appendChild(display);
  const distance = Math.max(1, from.distanceTo(to));
  let active = false;
  let progress = 0;
  let health = 100;
  let threatSeconds = 0;
  let finished = false;
  let failed = false;
  const target = new Vector3();
  const enemyPoint = new Vector3();
  function renderStatus(threats = 0, near = true) {
    const warning = threatSeconds < THREAT_WARNING_SECONDS ? ' · 적 접근! 막아라' : ' · 적 접근! 상태 감소 중';
    display.textContent = `${label} · 진행 ${Math.floor(progress * 100)}% · 상태 ${Math.ceil(health)}%${threats ? warning : near ? '' : ' · 가까이에서 호위하라'}`;
  }
  function reset() {
    active = finished = failed = false;
    progress = 0;
    health = 100;
    threatSeconds = 0;
    root.position.copy(from);
    root.visible = false;
    display.hidden = true;
  }
  function start() {
    reset();
    active = root.visible = true;
    display.hidden = false;
    renderStatus();
  }
  function restoreFinished() {
    reset();
    progress = 1;
    finished = true;
    root.position.copy(to);
    root.visible = true;
  }
  function update(dt) {
    if (!active) return;
    target.copy(root.position);
    target.y += 1;
    const threats = game.enemies.list.filter(enemy => {
      if (!enemy.alive || !enemy.pos) return false;
      // Enemy positions are at ground level for walkers, but at flight height for drones.
      enemyPoint.copy(enemy.pos);
      if (enemy.type !== 'gull') enemyPoint.y += 1;
      return enemyPoint.distanceTo(target) < THREAT_RADIUS &&
        (!game.physics?.lineOfSight || game.physics.lineOfSight(enemyPoint, target));
    }).length;
    const near = Math.hypot(game.player.pos.x - root.position.x, game.player.pos.z - root.position.z) < 18;
    if (threats) {
      const previous = Math.max(0, threatSeconds - THREAT_WARNING_SECONDS);
      threatSeconds += dt;
      const exposed = Math.max(0, threatSeconds - THREAT_WARNING_SECONDS) - previous;
      health = Math.max(0, health - Math.min(threats, 3) * DAMAGE_PER_THREAT * exposed);
    } else {
      threatSeconds = 0;
      if (near) progress = Math.min(1, progress + dt / (options.duration || distance / .85));
    }
    root.position.lerpVectors(from, to, progress);
    renderStatus(threats, near);
    if (health <= 0 || progress >= 1) {
      active = false;
      failed = health <= 0;
      finished = !failed;
      display.hidden = true;
    }
  }
  reset();
  return { start, reset, restoreFinished, update, root, get active() { return active; }, get finished() { return finished; },
    get failed() { return failed; }, get progress() { return progress; }, get health() { return health; } };
}
