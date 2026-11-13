import { BoxGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, RingGeometry, SphereGeometry, Vector3 } from '../../vendor/three.js';
import { sM } from './collision.js';

// A slow, telegraphed bridge weapon. Its exposed upper core takes weak-point damage.
export function createBreaker(game) {
  const group = new Group();
  const armor = new MeshStandardMaterial({ color: 0x4b5658, metalness: .65, roughness: .6 });
  const dark = new MeshStandardMaterial({ color: 0x20292c, metalness: .7, roughness: .5 });
  const coreMaterial = new MeshStandardMaterial({ color: 0xe88b32, emissive: 0x7f2607, emissiveIntensity: .3 });
  const box = (w, h, d, x, y, z, material) => {
    const mesh = new Mesh(new BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh);
    return mesh;
  };
  box(2.5, 1.4, 2.1, 0, 1.05, 0, armor);
  box(2.9, .5, 2.6, 0, .35, 0, dark);
  for (const x of [-1.36, 1.36]) box(.42, .55, 2.55, x, .33, 0, dark);
  box(2.1, .55, 1.8, 0, 1.95, 0, dark);
  const core = new Mesh(new SphereGeometry(.36, 16, 12), coreMaterial);
  core.position.set(0, 2.57, 0); group.add(core);
  const turret = new Group(); turret.position.set(0, 1.9, 0); group.add(turret);
  const barrel = new Mesh(new BoxGeometry(.45, .45, 1.7), armor);
  barrel.position.z = .95; turret.add(barrel);
  group.visible = false;
  const ring = new Mesh(new RingGeometry(.7, .83, 32), new MeshBasicMaterial({ color: 0xff642e, transparent: true, opacity: .8, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; ring.visible = false; game.scene.add(ring);
  const target = new Vector3(), muzzle = new Vector3(), direction = new Vector3(), endpoint = new Vector3(), center = new Vector3();
  const enemy = {
    type: 'breaker', id: 0, pos: group.position, rig: { group }, alive: false, active: false,
    passive: false, mode: 'engage', lastKnown: new Vector3(), hp: 620,
    phase: 'cooldown', timer: 2.5,
    _activate(pos) { this.pos.copy(pos); this.active = this.alive = true; this.hp = 620; this.phase = 'cooldown'; this.timer = 2.5; group.visible = true; ring.visible = false; },
    _deactivate() { this.active = this.alive = false; group.visible = ring.visible = false; },
    damage(amount, point, dir, part) {
      if (!this.alive) return false;
      this.hp -= amount;
      game.events.emit('enemy:hit', { enemy: this, point, part: part || 'body' });
      if (this.hp > 0) return false;
      this.alive = false; ring.visible = false; group.visible = false;
      game.fx.explosion?.(this.pos.clone().add(new Vector3(0, 1, 0)), 1.5);
      game.events.emit('enemy:killed', { enemy: this, pos: this.pos, type: 'breaker' });
      return true;
    },
    _raycast(origin, dir, range, hit) {
      let result = false;
      center.copy(this.pos).y += 2.57;
      if (sM(origin, dir, center, .38, range, hit)) { hit.part = this.phase === 'aim' ? 'weak' : 'body'; hit.enemy = this; result = true; }
      center.copy(this.pos).y += 1.1;
      if (sM(origin, dir, center, 1.35, range, hit)) { hit.part = 'body'; hit.enemy = this; result = true; }
      return result;
    },
    _update(dt) {
      if (!this.alive || !game.player || game.player.alive === false) return;
      this.timer -= dt;
      if (this.phase === 'cooldown' && this.timer <= 0) {
        target.copy(game.player.pos); target.y += 1;
        ring.position.set(target.x, .025, target.z); ring.visible = true;
        turret.rotation.y = Math.atan2(target.x - this.pos.x, target.z - this.pos.z);
        this.phase = 'aim'; this.timer = 1.6; coreMaterial.emissiveIntensity = 2;
        game.hud?.warn?.('브레이커 조준 중 — 엄폐하거나 이동하라', 1.6);
      } else if (this.phase === 'aim' && this.timer <= 0) {
        muzzle.copy(this.pos).y += 1.9;
        direction.copy(target).sub(muzzle).normalize();
        muzzle.addScaledVector(direction, 1.1);
        const wall = game.physics.raycast(muzzle, direction, 100);
        const distance = wall ? wall.dist : 70;
        game.combat.enemyShot(muzzle, direction, { damage: 22, range: 100 });
        endpoint.copy(muzzle).addScaledVector(direction, distance);
        game.fx.tracer(muzzle, endpoint, { color: 0xff7535, speed: 200, width: .09 });
        game.fx.muzzleFlash(muzzle, direction, { scale: 1.7 });
        game.events.emit('enemy:fire', { enemy: this, pos: muzzle, dir: direction, type: 'breaker' });
        ring.visible = false; coreMaterial.emissiveIntensity = .3;
        this.phase = 'cooldown'; this.timer = this.hp < 310 ? 2.1 : 3.1;
      }
    }
  };
  return enemy;
}
