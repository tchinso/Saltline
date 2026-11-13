import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from '../../vendor/three.js';

// The convoy advances only while the player stays nearby and the route is clear.
// Nearby hostile machines can destroy it, making protection an actual objective.
export function createEscort(game, from, to, label) {
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
  box([2.8, 1, 1.55], [0, .85, 0], bodyMaterial);
  box([1, .7, 1.4], [.75, 1.55, 0], lightMaterial);
  for (const x of [-.9, .9]) for (const z of [-.8, .8]) box([.55, .55, .22], [x, .3, z], darkMaterial);
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
  let finished = false;
  let failed = false;
  function renderStatus(threats = 0, near = true) {
    display.textContent = `${label} · 진행 ${Math.floor(progress * 100)}% · 상태 ${Math.ceil(health)}%${threats ? ' · 공격받는 중' : near ? '' : ' · 가까이에서 호위하라'}`;
  }
  function reset() {
    active = finished = failed = false;
    progress = 0;
    health = 100;
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
    const threats = game.enemies.list.filter(enemy => enemy.alive && enemy.pos &&
      Math.hypot(enemy.pos.x - root.position.x, enemy.pos.z - root.position.z) < 9).length;
    const near = Math.hypot(game.player.pos.x - root.position.x, game.player.pos.z - root.position.z) < 18;
    if (threats) health = Math.max(0, health - Math.min(threats, 3) * 2 * dt);
    else if (near) progress = Math.min(1, progress + dt / (distance / .85));
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
