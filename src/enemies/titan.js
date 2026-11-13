import { BoxGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, RingGeometry, SphereGeometry, Vector3 } from '../../vendor/three.js';
import { sM } from './collision.js';

// The final weapon advances between its telegraphed firing sequences. Its core
// opens during aiming and is the weak point; damage changes the attack cadence.
export function createTitan(game) {
  const root = new Group();
  const armor = new MeshStandardMaterial({ color: 0x485053, metalness: .7, roughness: .56 });
  const dark = new MeshStandardMaterial({ color: 0x1c2528, metalness: .65, roughness: .65 });
  const glow = new MeshStandardMaterial({ color: 0xff9e35, emissive: 0xac3006, emissiveIntensity: .25 });
  const box = (parent, w, h, d, x, y, z, material) => {
    const mesh = new Mesh(new BoxGeometry(w,h,d), material);
    mesh.position.set(x,y,z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  };
  box(root, 3.6, 2.4, 2.6, 0, 3.3, 0, armor);
  box(root, 4.6, .8, 2.8, 0, 2.2, 0, dark);
  for (const x of [-1.55,1.55]) {
    box(root, .9, 2.1, 1.2, x, 1.1, 0, armor);
    box(root, 1.4, .4, 2, x, .2, .3, dark);
    box(root, .75, 1.8, 1, x * 1.38, 3.25, 0, dark);
  }
  const turret = new Group(); turret.position.set(0, 4.5, 0); root.add(turret);
  box(turret, 3.4, .8, 2.4, 0, 0, 0, armor);
  for (const x of [-1.15,1.15]) box(turret, .55, .55, 2.2, x, 0, 1.6, dark);
  const core = new Mesh(new SphereGeometry(.5, 20, 12), glow); core.position.set(0, 5.18, 0); root.add(core);
  root.visible = false; game.scene.add(root);
  const ring = new Mesh(new RingGeometry(.8, .98, 32), new MeshBasicMaterial({ color: 0xff642e, transparent: true, opacity: .85, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; ring.visible = false; game.scene.add(ring);
  const target = new Vector3(), muzzle = new Vector3(), direction = new Vector3(), end = new Vector3(), center = new Vector3();
  let path = [], routeTimer = 0;
  const maxHealth = 1200;
  const boss = {
    type: 'titan', id: 0, pos: root.position, rig: { group: root }, alive: false, active: false,
    mode: 'engage', passive: false, lastKnown: new Vector3(), hp: maxHealth,
    phase: 'cooldown', timer: 2.5, shotsLeft: 0,
    _activate(position) { this.pos.copy(position); this.alive = this.active = true; this.hp = maxHealth; this.phase = 'cooldown'; this.timer = 2.5; this.shotsLeft = 0; root.visible = true; ring.visible = false; glow.emissiveIntensity = .25; path = []; routeTimer = 0; },
    _deactivate() { this.active = this.alive = false; root.visible = ring.visible = false; },
    damage(amount, point, dir, part) {
      if (!this.alive) return false;
      this.hp -= amount * (part === 'weak' ? 1 : .75);
      game.events.emit('enemy:hit', { enemy: this, point, part: part || 'body' });
      if (this.hp > 0) return false;
      this.alive = false; root.visible = ring.visible = false;
      game.fx.explosion?.(this.pos.clone().add(new Vector3(0,2,0)), 2);
      game.events.emit('enemy:killed', { enemy: this, pos: this.pos, type: 'titan' });
      return true;
    },
    _raycast(origin, dir, range, hit) {
      let result = false;
      center.copy(this.pos).y += 5.18;
      if (sM(origin, dir, center, .55, range, hit)) { hit.part = this.phase === 'aim' ? 'weak' : 'body'; hit.enemy = this; result = true; }
      center.copy(this.pos).y += 3;
      if (sM(origin, dir, center, 2.2, range, hit)) { hit.part = 'body'; hit.enemy = this; result = true; }
      return result;
    },
    _update(dt) {
      if (!this.alive || !game.player?.alive) return;
      const stage = this.hp > maxHealth * 2 / 3 ? 1 : this.hp > maxHealth / 3 ? 2 : 3;
      if (this.phase === 'cooldown') {
        routeTimer -= dt;
        if (routeTimer <= 0) {
          routeTimer = 2;
          path = game.physics.nav?.findPath?.(this.pos, game.player.pos) || [];
        }
        if (this.pos.distanceTo(game.player.pos) > 12 && path.length) {
          direction.copy(path[0]).sub(this.pos); direction.y = 0;
          if (direction.length() < .8) path.shift();
          else {
            direction.normalize();
            const x = this.pos.x + direction.x * dt * .8, z = this.pos.z + direction.z * dt * .8;
            if (game.physics.nav?.isWalkable?.(x,z)) { this.pos.x = x; this.pos.z = z; }
          }
        }
      }
      this.timer -= dt;
      if (this.timer > 0) return;
      if (this.phase === 'cooldown') {
        target.copy(game.player.pos); target.y += 1;
        ring.position.set(target.x, .03, target.z); ring.visible = true;
        turret.rotation.y = Math.atan2(target.x - this.pos.x, target.z - this.pos.z);
        this.phase = 'aim'; this.timer = stage === 3 ? 1.1 : 1.6; this.shotsLeft = stage;
        glow.emissiveIntensity = 2;
        game.hud?.warn?.(`타이탄 ${stage}단계 조준 — 표시 지점에서 벗어나라`, this.timer);
      } else {
        muzzle.copy(this.pos).y += 4.5;
        direction.copy(target).sub(muzzle).normalize(); muzzle.addScaledVector(direction, 1.5);
        const wall = game.physics.raycast(muzzle, direction, 100);
        game.combat.enemyShot(muzzle, direction, { damage: stage === 1 ? 24 : 18, range: 100 });
        end.copy(muzzle).addScaledVector(direction, wall ? wall.dist : 70);
        game.fx.tracer(muzzle, end, { color: 0xff7535, speed: 200, width: .12 });
        game.fx.muzzleFlash(muzzle, direction, { scale: 2 });
        game.events.emit('enemy:fire', { enemy: this, pos: muzzle, dir: direction, type: 'titan' });
        if (--this.shotsLeft > 0) { this.timer = .65; game.hud?.warn?.('타이탄 연속 포격 — 엄폐하라', .65); }
        else { ring.visible = false; glow.emissiveIntensity = .25; this.phase = 'cooldown'; this.timer = stage === 3 ? 1.8 : 2.8; }
      }
    }
  };
  return boss;
}
