import { PLAYER } from '../core/config.js';
import { Euler, Vector3 } from '../../vendor/three.js';
import { clamp, damp, lerp, saturate, smoothstep } from '../core/math.js';
var MOVEMENT = {
  walk: 3.8,
  sprint: 6.4,
  crouch: 1.9,
  ads: 2.4,
  accelGround: 34,
  decelGround: 26,
  accelAir: 9,
  gravity: 21,
  jumpApex: 1,
  coyote: .12,
  jumpBuffer: .13,
  standHeight: PLAYER.height,
  crouchHeight: 1.15,
  eyeRate: 11,
  stride: {
    walk: 1.55,
    sprint: 2.1,
    crouch: 1.05
  },
  bobY: .024,
  bobX: .013,
  bobSprint: 1.9,
  bobAds: .22,
  rollStrafe: .02,
  landDip: .36,
  landDipMax: .2,
  fovSprint: 6,
  fovAds: 52,
  adsLook: .6,
  recoilKeep: .35,
  recoilApply: 34,
  recoilRecover: 6.5,
  recoilHold: .09,
  shakeDecay: 1.7,
  shakePitch: .03,
  shakeYaw: .03,
  shakeRoll: .045,
  pitchLimit: 1.5
};
var rC = Math.sqrt(2 * MOVEMENT.gravity * MOVEMENT.jumpApex);
function createPlayer(game) {
  const WORLD = game.world;
  let e = game.camera;
  let t = () => game.render && game.render.post || n;
  let n = {};
  let s = PLAYER.eye;
  let o = MOVEMENT.standHeight;
  let r = 0;
  let a = 0;
  let l = true;
  let c = 0;
  let u = 0;
  let h = 0;
  let f = 0;
  let p = 0;
  let d = 0;
  let v = 0;
  let g = {
    x: 0,
    v: 0
  };
  let x = 0;
  let y = 0;
  let b = 0;
  let m = 0;
  let A = 0;
  let _ = 0;
  let M = 0;
  let w = 0;
  let S = 0;
  let z = 0;
  let H = PLAYER.fov;
  let O = 0;
  let q = "concrete";
  let U = new Vector3();
  let T = new Euler(0, 0, 0, "YXZ");
  let D = new Vector3();
  let C = {
    pos: new Vector3(),
    eye: new Vector3(),
    vel: new Vector3(),
    forward: new Vector3(0, 0, -1),
    yaw: 0,
    pitch: 0,
    health: 100,
    maxHealth: 100,
    alive: true,
    onGround: true,
    sprinting: false,
    crouching: false,
    ads: 0,
    speed: 0,
    enabled: true,
    invulnerable: false,
    baseFov: PLAYER.fov,
    hurtPulse: 0,
    lookScale: 1,
    lastSafe: D,
    tuning: MOVEMENT,
    reset(F) {
      let X = F || game.level && game.level.playerStart || {
        pos: new Vector3(),
        yaw: 0
      };
      C.pos.copy(X.pos);
      C.yaw = X.yaw || 0;
      C.pitch = 0;
      C.vel.set(0, 0, 0);
      C.health = C.maxHealth;
      game.medkits && game.medkits.reset();
      C.alive = true;
      C.onGround = true;
      C.sprinting = false;
      C.crouching = false;
      C.invulnerable = false;
      C.speed = 0;
      s = PLAYER.eye;
      o = MOVEMENT.standHeight;
      r = 0;
      a = 0;
      l = true;
      c = 0;
      u = 0;
      h = 0;
      f = 0;
      p = d = 0;
      v = 0;
      g.x = g.v = 0;
      x = y = b = m = 0;
      A = 0;
      _ = 0;
      w = 0;
      S = 0;
      z = 0;
      C.hurtPulse = 0;
      D.copy(C.pos);
      let ne = t();
      ne.damage = 0;
      ne.lowHealth = 0;
      ne.ads = 0;
      K(0);
    },
    damage(F, X) {
      !C.alive || C.invulnerable || !(F > 0) || (C.health = Math.max(0, C.health - F), w = Math.min(1, w + .35 + F / 40), C.addShake(.22 + F / 70), game.events.emit("player:hit", {
        amount: F,
        fromPos: X
      }), C.health <= 0 && (C.alive = false, z = 0, C.sprinting = false, game.events.emit("player:dead", {})));
    },
    heal(F) {
      C.alive && (C.health = Math.min(C.maxHealth, C.health + F));
    },
    addRecoil(F = 0, X = 0) {
      let ne = MOVEMENT.recoilKeep;
      C.pitch = clamp(C.pitch + F * ne, -MOVEMENT.pitchLimit, MOVEMENT.pitchLimit);
      C.yaw += X * ne;
      x += F * (1 - ne);
      y += X * (1 - ne);
      x = clamp(x, -.3, .3);
      y = clamp(y, -.2, .2);
      A = MOVEMENT.recoilHold;
    },
    addShake(F = .3) {
      _ = Math.min(1, _ + F);
    },
    setFov(F) {
      C.baseFov = clamp(+F || PLAYER.fov, 55, 100);
    },
    update: N
  };
  game.events.on("explosion", F => {
    if (!F || !F.pos) return;
    let X = C.eye.distanceTo(F.pos);
    let ne = F.size || 1;
    let re = saturate(1 - X / (14 + ne * 10)) * (.35 + .35 * ne);
    re > .01 && C.addShake(re);
  });
  function G() {
    let F = game.physics && game.physics.boxes;
    if (!F) return true;
    let X = PLAYER.radius * .9;
    let ne = C.pos.y + MOVEMENT.crouchHeight - .05;
    let re = C.pos.y + MOVEMENT.standHeight;
    for (let $ = 0; $ < F.length; $++) {
      let ue = F[$];
      if (!ue.bulletOnly && !(C.pos.x + X < ue.min.x || C.pos.x - X > ue.max.x || C.pos.z + X < ue.min.z || C.pos.z - X > ue.max.z) && ue.min.y < re && ue.max.y > ne) return false;
    }
    return true;
  }
  function j() {
    let F = C.pos.x;
    let X = C.pos.z;
    try {
      if (game.ground && game.ground.isPuddle && C.pos.y < .05 && game.ground.isPuddle(F, X)) return "water";
    } catch {}
    if (q && q !== "concrete") return q;
    try {
      return game.level && game.level.groundSurfaceAt && game.level.groundSurfaceAt(F, X) || q || "concrete";
    } catch {
      return q || "concrete";
    }
  }
  function N(F) {
    let X = game.input;
    let ne = game.weapon || {};
    if (ne.stub || typeof ne.ads != "number" ? (O = damp(O, C.enabled && X.ads ? 1 : 0, 14, F), C.ads = O) : C.ads = saturate(ne.ads), !C.alive) {
      z += F;
      Q(F);
      K(F);
      ie(F);
      return;
    }
    let re = C.enabled;
    C.lookScale = lerp(1, MOVEMENT.adsLook, C.ads);
    re && (C.yaw -= X.look.dx * C.lookScale, C.pitch = clamp(C.pitch - X.look.dy * C.lookScale, -MOVEMENT.pitchLimit, MOVEMENT.pitchLimit), (C.yaw > Math.PI * 4 || C.yaw < -Math.PI * 4) && (C.yaw = C.yaw % (Math.PI * 2)));
    re && X.crouch ? C.crouching = true : C.crouching && G() && (C.crouching = false);
    o = C.crouching ? MOVEMENT.crouchHeight : MOVEMENT.standHeight;
    let ue = re ? X.move.x : 0;
    let me = re ? X.move.y : 0;
    let ee = ue * ue + me * me > .01;
    let B = re && X.sprint && me > .55 && Math.abs(ue) < .6 && !C.crouching && C.ads < .35 && !X.fire;
    C.sprinting = B && C.onGround && C.speed > MOVEMENT.walk * .6 || B && !C.onGround && C.sprinting;
    let P = MOVEMENT.walk;
    C.crouching ? P = MOVEMENT.crouch : B && (P = MOVEMENT.sprint);
    P = lerp(P, Math.min(P, MOVEMENT.ads), C.ads);
    me < 0 && (P *= lerp(1, .82, -me));
    let V = Math.sin(C.yaw);
    let Y = Math.cos(C.yaw);
    U.set(ue * Y - me * V, 0, -ue * V - me * Y).multiplyScalar(P);
    let L = C.onGround ? ee ? MOVEMENT.accelGround : MOVEMENT.decelGround : ee ? MOVEMENT.accelAir : .6;
    let Z = U.x - C.vel.x;
    let J = U.z - C.vel.z;
    !C.onGround && !ee && (Z = -C.vel.x, J = -C.vel.z);
    let oe = Math.hypot(Z, J);
    let fe = L * F;
    oe <= fe || oe < 1e-6 ? (C.onGround || ee) && (C.vel.x = U.x, C.vel.z = U.z) : (C.vel.x += Z / oe * fe, C.vel.z += J / oe * fe);
    r = C.onGround ? MOVEMENT.coyote : Math.max(0, r - F);
    a = re && X.pressed("jump") ? MOVEMENT.jumpBuffer : Math.max(0, a - F);
    a > 0 && r > 0 && (!C.crouching || G()) && (C.vel.y = rC, a = 0, r = 0, C.onGround = false, C.crouching = false, o = MOVEMENT.standHeight, game.events.emit("player:jump", {
      pos: C.pos
    }));
    C.vel.y -= MOVEMENT.gravity * F * .5;
    C.vel.y < -40 && (C.vel.y = -40);
    let le = C.vel.y;
    let R = game.physics.moveCapsule(C.pos, C.vel, F, PLAYER.radius, o, l) || {};
    R.onGround || (C.vel.y -= MOVEMENT.gravity * F * .5);
    let I = game.physics.bounds;
    if (I && (C.pos.x = clamp(C.pos.x, I.min.x + .4, I.max.x - .4), C.pos.z = clamp(C.pos.z, I.min.z + .4, I.max.z - .4)), C.onGround = !!R.onGround, R.surface && (q = R.surface), C.onGround) {
      if (!l && c > .12) {
        let ce = Math.max(0, -le, u);
        g.v -= Math.min(ce * MOVEMENT.landDip, 3.2);
        ce > 7.5 && C.addShake(Math.min(.5, (ce - 7.5) * .06));
        game.events.emit("player:land", {
          speed: ce,
          surface: j(),
          pos: C.pos
        });
        ce > 13 && C.damage((ce - 13) * 7, null);
        h = .35;
      }
      c = 0;
      u = 0;
      C.pos.x <= WORLD.quayX - 1.2 && C.pos.y > -.5 && D.copy(C.pos);
    } else {
      c += F;
      u = Math.max(u, -C.vel.y);
    }
    l = C.onGround;
    C.pos.y < WORLD.seaY - 2.2 && (C.pos.copy(D), C.vel.set(0, 0, 0), C.onGround = true, l = true, _ = .6, C.yaw += Math.PI, C.damage(12, null), game.events.emit("player:rescued", {}));
    C.speed = Math.hypot(C.vel.x, C.vel.z);
    let se = C.crouching ? MOVEMENT.stride.crouch : C.sprinting ? MOVEMENT.stride.sprint : MOVEMENT.stride.walk;
    if (C.onGround && C.speed > .5) {
      let ce = h;
      h += C.speed * F / se;
      Math.floor(h) > Math.floor(ce) && game.events.emit("player:step", {
        surface: j(),
        sprint: C.sprinting,
        pos: C.pos
      });
    } else C.onGround && (h = damp(h, Math.round(h), 8, F));
    let ae = C.onGround ? saturate(C.speed / MOVEMENT.walk) * (C.sprinting ? MOVEMENT.bobSprint : 1) * lerp(1, MOVEMENT.bobAds, C.ads) * (C.crouching ? .7 : 1) : 0;
    f = damp(f, ae, 9, F);
    d = -Math.cos(h * Math.PI * 2) * MOVEMENT.bobY * f;
    p = Math.sin(h * Math.PI) * MOVEMENT.bobX * f;
    let k = C.vel.x * Y - C.vel.z * V;
    v = damp(v, -k / MOVEMENT.sprint * MOVEMENT.rollStrafe * lerp(1, .4, C.ads), 8, F);
    K(F);
    ie(F);
  }
  function Q(F) {
    C.vel.x = damp(C.vel.x, 0, 5, F);
    C.vel.z = damp(C.vel.z, 0, 5, F);
    C.vel.y -= MOVEMENT.gravity * F;
    try {
      let X = game.physics.moveCapsule(C.pos, C.vel, F, PLAYER.radius, .6, l);
      l = !!(X && X.onGround);
    } catch {}
    C.pos.y < WORLD.seaY - 1 && (C.pos.y = WORLD.seaY - 1, C.vel.y = 0);
    C.speed = 0;
    C.sprinting = false;
    f = damp(f, 0, 10, F);
    p *= .9;
    d *= .9;
  }
  function K(F) {
    let X = C.crouching ? PLAYER.crouchEye : PLAYER.eye;
    let ne = 0;
    let re = 0;
    if (C.alive) F > 0 ? s = damp(s, X, MOVEMENT.eyeRate, F) : s = X;else {
      let Z = smoothstep(0, .85, z);
      let J = Z * Z;
      X = lerp(PLAYER.eye, .22, J);
      s = damp(s, X, 18, F);
      ne = 1.15 * J;
      re = -.25 * Z + .12 * Math.sin(Z * Math.PI);
    }
    if (F > 0) {
      let Z = -g.x * 150 - g.v * 17;
      g.v += Z * F;
      g.x += g.v * F;
      g.x = clamp(g.x, -MOVEMENT.landDipMax, .05);
      A -= F;
      A <= 0 && (x = damp(x, 0, MOVEMENT.recoilRecover, F), y = damp(y, 0, MOVEMENT.recoilRecover, F));
      b = damp(b, x, MOVEMENT.recoilApply, F);
      m = damp(m, y, MOVEMENT.recoilApply, F);
      _ = Math.max(0, _ - MOVEMENT.shakeDecay * F);
      M += F;
    }
    let $ = Math.sin(C.yaw);
    let ue = Math.cos(C.yaw);
    C.eye.set(C.pos.x + p * ue, C.pos.y + s + d + g.x, C.pos.z - p * $);
    let me = clamp(C.pitch + b, -1.55, 1.55);
    let ee = C.yaw + m;
    T.set(me, ee, 0, "YXZ");
    C.forward.set(0, 0, -1).applyEuler(T);
    let B = _ * _;
    let P = M;
    let V = B * MOVEMENT.shakePitch * (Math.sin(P * 43.1) + .6 * Math.sin(P * 71.7 + 1.3));
    let Y = B * MOVEMENT.shakeYaw * (Math.sin(P * 37.3 + 2.1) + .6 * Math.sin(P * 83.9));
    let L = B * MOVEMENT.shakeRoll * (Math.sin(P * 29.7 + .7) + .5 * Math.sin(P * 61.3 + 4));
    if (e.position.copy(C.eye), e.rotation.set(me + V + re + g.x * .12, ee + Y, v + L + ne + p * .35, "YXZ"), !game.params || !game.params.fov) {
      let Z = lerp(C.baseFov + (C.sprinting ? MOVEMENT.fovSprint : 0), MOVEMENT.fovAds, C.ads);
      H = F > 0 ? damp(H, Z, C.ads > .02 && C.ads < .98 ? 30 : 7, F) : Z;
      Math.abs(e.fov - H) > .01 && (e.fov = H, e.updateProjectionMatrix());
    }
  }
  function ie(F) {
    w = Math.max(0, w - F * 1.9);
    C.hurtPulse = w;
    let X = C.alive ? smoothstep(.55, .12, C.health / C.maxHealth) : 1;
    S = damp(S, X, 4, F);
    let ne = t();
    ne.damage = w;
    ne.lowHealth = S;
    ne.ads = C.ads;
  }
  return C;
}
export { createPlayer };
