import { Mesh, PlaneGeometry, Vector3 } from '../../vendor/three.js';
import { pm } from './rig.js';
import { xm } from './models.js';
var GULL_TUNING = {
  hp: 45,
  boltDamage: 7,
  boltSpeed: 70,
  burst: 3,
  burstGap: .12,
  telegraph: .55,
  cooldown: [1.9, 3.3],
  rangeMin: 12,
  rangeMax: 25,
  altMin: 4,
  altMax: 8,
  maxSpeed: 8,
  patrolSpeed: 3,
  accel: 11,
  spreadFar: .065,
  spreadNear: .018,
  fireRange: 42,
  explodeRadius: 3,
  explodeDamage: 30
};
var Pn = GULL_TUNING;
var $o = new Vector3();
var iz = new Vector3();
var Bs = new Vector3();
var Co = new Vector3();
var sz = new Vector3();
var ou = new Vector3();
var Hf = new Vector3(0, 1, 0);
var J_ = new Vector3(0, -1, 0);
var ym = [8, 4, .7];
var UC = [14, 1, .35];
var K_ = (i, e) => {
  let t = (i - e) % (Math.PI * 2);
  t > Math.PI ? t -= Math.PI * 2 : t < -Math.PI && (t += Math.PI * 2);
  return t;
};
var bl = (i, e, t) => i < e ? e : i > t ? t : i;
function createGull(i, e, t, n) {
  let s = i.G;
  let o = i.rng;
  let r = t.lensBase.clone();
  let a = pm(e, {
    shell: t.shell,
    metal: t.metal,
    glow: t.glow,
    lens: r,
    disc: t.disc,
    cone: t.cone
  }, {
    radius: .9,
    center: [0, 0, 0],
    extra: {
      def: e.extra,
      radius: 10
    }
  });
  let l = a.bones;
  a.group.rotation.order = "YXZ";
  a.group.visible = false;
  let c = s.mats.label("G-" + String(n + 11), {
    color: "black",
    font: "stencil",
    distress: .35
  });
  let u = .105;
  let h = Math.min(.045, u / (c.aspect || 3));
  let f = new PlaneGeometry(u, h);
  f.rotateX(-Math.PI / 2);
  f.rotateY(Math.PI);
  let p = new Mesh(f, c.material);
  p.position.set(0, .0985, -.085);
  p.castShadow = false;
  p.receiveShadow = true;
  l.body.add(p);
  let d = {
    id: 0,
    type: "gull",
    pos: a.group.position,
    alive: false,
    hp: Pn.hp,
    active: false,
    rig: a,
    lens: r,
    vel: new Vector3(),
    yaw: 0,
    pitch: 0,
    roll: 0,
    home: new Vector3(),
    lastKnown: new Vector3(),
    sensor: new Vector3(),
    fwd: new Vector3(0, 0, 1),
    muzzle: new Vector3(),
    mode: "patrol",
    los: false,
    seeT: 0,
    noSeeT: 0,
    senseT: 0,
    exposure: 0,
    modeT: 0,
    passive: false,
    hasToken: false,
    orbitA: 0,
    orbitDir: 1,
    orbitR: 16,
    alt: 6,
    hoverY: 0,
    phase: 0,
    ceil: 1e9,
    ceilT: 0,
    flipT: 0,
    avoid: new Vector3(),
    atk: "idle",
    atkT: 0,
    cool: 1,
    shots: 0,
    smokeT: 0,
    feeler: 0,
    strobeT: 0,
    flare: 0,
    lensC: [ym[0], ym[1], ym[2]],
    dieT: 0,
    spin: 0,
    lostRotor: 0,
    gy: 0,
    gp: 0,
    loop: null,
    sweep: 0,
    thr: 1,
    damage(y, b, m, A) {
      return d.alive ? (d.hp -= y, s.events.emit("enemy:hit", {
        enemy: d,
        point: b,
        part: A || "body"
      }), m && (d.vel.addScaledVector(m, Math.min(3, y * .09)), d.roll += (o() - .5) * .5, d.pitch += (o() - .5) * .4), i.provoke(d), d.hp <= 0 ? (v(m), true) : false) : false;
    },
    _activate(y, b = {}) {
      d.active = true;
      d.alive = true;
      d.hp = Pn.hp;
      d.passive = !!b.passive;
      d.pos.copy(y);
      d.home.copy(y);
      d.vel.set(0, 0, 0);
      d.yaw = b.yaw ?? o() * 6.283;
      d.pitch = d.roll = 0;
      d.mode = b.state === "alert" ? "investigate" : "patrol";
      d.modeT = 8;
      d.lastKnown.copy(b.target || (s.player ? s.player.pos : y));
      d.los = false;
      d.seeT = d.noSeeT = 0;
      d.exposure = 0;
      d.senseT = o() * .2;
      d.hasToken = false;
      d.orbitDir = o() < .5 ? 1 : -1;
      d.orbitR = Pn.rangeMin + 2 + o() * (Pn.rangeMax - Pn.rangeMin - 5);
      d.alt = b.hover ?? Pn.altMin + .8 + o() * (Pn.altMax - Pn.altMin - 1.6);
      d.hoverFixed = b.hover != null;
      d.patrolR = b.patrolRadius ?? 4 + o() * 5;
      d.phase = o() * 6.283;
      d.orbitA = o() * 6.283;
      d.ceil = 1e9;
      d.flipT = 3 + o() * 4;
      d.atk = "idle";
      d.cool = 1 + o() * 1.5;
      d.dieT = 0;
      d.spin = 0;
      d.lostRotor = -1;
      d.flare = 0;
      d.thr = 1;
      for (let m = 0; m < 4; m++) l["rotor" + m].scale.setScalar(1);
      if (l.lamp.scale.setScalar(1), l.body.rotation.set(0, 0, 0), a.group.visible = true, a.group.rotation.set(0, d.yaw, 0), s.audio && s.audio.loop && !d.loop) try {
        d.loop = s.audio.loop("gull_rotor", {
          pos: d.pos,
          gain: .5
        });
      } catch {
        d.loop = null;
      }
    },
    _deactivate() {
      if (d.active = false, d.alive = false, a.group.visible = false, i.releaseToken(d), d.loop) {
        try {
          d.loop.stop();
        } catch {}
        d.loop = null;
      }
    },
    _raycast(y, b, m, A) {
      let E = y.x - d.pos.x;
      let w = (y.y - d.pos.y + .03) * 2.3;
      let S = y.z - d.pos.z;
      let z = b.x;
      let H = b.y * 2.3;
      let O = b.z;
      let q = z * z + H * H + O * O;
      let U = E * z + w * H + S * O;
      let T = E * E + w * w + S * S - .5 * .5;
      let D = U * U - q * T;
      if (D < 0) return false;
      let C = (-U - Math.sqrt(D)) / q;
      return C < 0 || C > m || C >= A.dist ? false : (A.dist = C, A.part = "body", A.enemy = d, A.point.copy(y).addScaledVector(b, C), A.normal.copy(A.point).sub(d.pos), A.normal.y *= 2.3, A.normal.normalize(), true);
    },
    _update(y) {
      d.alive ? x(y) : g(y);
    }
  };
  function v(y) {
    d.alive = false;
    i.releaseToken(d);
    d.dieT = 0;
    d.lostRotor = Math.floor(o() * 4);
    l["rotor" + d.lostRotor].scale.setScalar(1e-4);
    $o.set(xm.rotors[d.lostRotor][0], .05, xm.rotors[d.lostRotor][2]).applyAxisAngle(Hf, d.yaw).add(d.pos);
    s.fx.sparks($o, Hf, 14);
    s.fx.debris($o, {
      count: 3
    });
    s.fx.smoke($o, {
      size: .5,
      life: 1
    });
    d.spin = (o() < .5 ? -1 : 1) * (5 + o() * 3);
    d.vel.y += 1.5;
    y && d.vel.addScaledVector(y, 2.5);
    l.lamp.scale.setScalar(1e-4);
    l.strobeG.scale.setScalar(1e-4);
    l.strobeR.scale.setScalar(1e-4);
    l.strobeW.scale.setScalar(1e-4);
    r.color.setRGB(.3, .05, .02);
    s.events.emit("enemy:killed", {
      enemy: d,
      pos: d.pos,
      type: "gull"
    });
  }
  function g(y) {
    d.dieT += y;
    d.vel.y -= 9.5 * y;
    d.vel.x *= 1 - .4 * y;
    d.vel.z *= 1 - .4 * y;
    d.spin += Math.sign(d.spin) * 7 * y;
    d.yaw += d.spin * y;
    d.roll += d.spin * .35 * y;
    d.pitch += .9 * y;
    let b = d.vel.length();
    let m = b * y;
    let A = d.dieT > 5 || d.pos.y < -3;
    if (!A && b > .01) {
      Bs.copy(d.vel).multiplyScalar(1 / b);
      let _ = s.physics.raycast(d.pos, Bs, m + .3);
      _ && (d.pos.copy(_.point).addScaledVector(_.normal, .2), A = true);
    }
    A || d.pos.addScaledVector(d.vel, y);
    a.group.rotation.set(d.pitch, d.yaw, d.roll);
    for (let _ = 0; _ < 4; _++) _ !== d.lostRotor && (l["rotor" + _].rotation.y += (_ % 3 === 0 ? 1 : -1) * 30 * Math.max(.2, 1 - d.dieT * .5) * y);
    d.smokeT -= y;
    d.smokeT <= 0 && (d.smokeT = .045, s.fx.smoke(d.pos, {
      size: .45,
      life: 1.3,
      color: 1381914,
      rise: .6
    }), o() < .5 && ($o.set(o() - .5, o(), o() - .5).normalize(), s.fx.sparks(d.pos, $o, 3)));
    d.loop && (d.loop.setPos(d.pos), d.loop.setPitch(Math.max(.4, 1.25 - d.dieT * .4)), d.loop.setGain(.5));
    A && (s.fx.explosion(d.pos, 1.2), s.combat && s.combat.explode && s.combat.explode(d.pos, Pn.explodeRadius, Pn.explodeDamage, "enemy"), i.retire(d));
  }
  function x(y) {
    let b = s.player;
    let m = i.t;
    d.fwd.set(Math.sin(d.yaw), 0, Math.cos(d.yaw));
    d.sensor.set(0, -.17, .27).applyAxisAngle(Hf, d.yaw).add(d.pos);
    i.think(d, y, .4);
    let A = d.mode === "engage";
    let _ = d.hp < Pn.hp * .5;
    let M = Pn.patrolSpeed;
    let E;
    let w;
    let S;
    if (A && b) {
      M = Pn.maxSpeed;
      let P = d.atk !== "idle";
      d.flipT -= y;
      d.flipT <= 0 && (d.flipT = 3 + o() * 5, o() < .6 && (d.orbitDir = -d.orbitDir), d.orbitR = bl(d.orbitR + (o() - .5) * 6, Pn.rangeMin + 1, Pn.rangeMax - 2));
      d.noSeeT > 1.5 ? (E = d.lastKnown.x, S = d.lastKnown.z, w = d.lastKnown.y + d.alt + 1, d.orbitA = Math.atan2(d.pos.z - d.lastKnown.z, d.pos.x - d.lastKnown.x)) : (d.orbitA += d.orbitDir * (P ? .9 : 3.6) / d.orbitR * y, E = b.pos.x + Math.cos(d.orbitA) * d.orbitR, S = b.pos.z + Math.sin(d.orbitA) * d.orbitR, w = b.pos.y + d.alt);
    } else d.mode === "investigate" || d.mode === "search" ? (M = 5.5, d.orbitA += .5 * y, E = d.lastKnown.x + Math.cos(d.orbitA) * 4.5, S = d.lastKnown.z + Math.sin(d.orbitA) * 4.5, w = d.lastKnown.y + Math.min(d.alt, 5.5)) : (d.orbitA += .28 * y * d.orbitDir, E = d.home.x + Math.cos(d.orbitA) * d.patrolR, S = d.home.z + Math.sin(d.orbitA) * d.patrolR, w = d.hoverFixed ? d.alt : d.home.y);
    w > d.ceil && (w = d.ceil);
    !d.hoverFixed && w < 2.2 && (w = 2.2);
    Co.set((E - d.pos.x) * 2.2 - d.vel.x * 2.4, (w - d.pos.y) * 5 - d.vel.y * 3.6, (S - d.pos.z) * 2.2 - d.vel.z * 2.4);
    d.feeler = (d.feeler + 1) % 3;
    let z = Math.hypot(d.vel.x, d.vel.z);
    if (d.feeler === 0 && z > .6) {
      Bs.set(d.vel.x / z, 0, d.vel.z / z);
      let P = 2.2 + z * .5;
      let V = s.physics.raycast(d.pos, Bs, P);
      if (V) {
        let Y = 1 - V.dist / P;
        d.avoid.copy(V.normal).multiplyScalar(26 * Y);
        d.avoid.y += 9 * Y;
        Y > .5 && (d.orbitDir = -d.orbitDir, d.flipT = 2.5);
      }
    } else if (d.feeler === 1) {
      let P = s.physics.raycast(d.pos, J_, 2.4);
      P && !d.hoverFixed && (d.avoid.y += (2.4 - P.dist) * 10);
    } else if (d.feeler === 2 && (d.ceilT -= y * 3, d.ceilT <= 0)) {
      d.ceilT = .35;
      let P = s.physics.raycast(d.pos, Hf, 4);
      d.ceil = P ? d.pos.y + P.dist - 1.3 : 1e9;
    }
    Co.add(d.avoid);
    d.avoid.multiplyScalar(Math.exp(-6 * y));
    _ && (Co.x += Math.sin(m * 7.3 + d.phase) * 5, Co.z += Math.cos(m * 6.1 + d.phase) * 5, Co.y += Math.sin(m * 9.7) * 3);
    let H = Co.length();
    H > Pn.accel && Co.multiplyScalar(Pn.accel / H);
    d.vel.addScaledVector(Co, y);
    let O = d.vel.length();
    O > M && (d.vel.multiplyScalar(M / O), O = M);
    for (let P = 0; P < 3; P++) {
      let V = P === 0 ? d.vel.x : P === 1 ? d.vel.y : d.vel.z;
      if (Math.abs(V) < .02) continue;
      let Y = V > 0 ? 1 : -1;
      let L = P === 1 ? .35 : .62;
      Bs.set(P === 0 ? Y : 0, P === 1 ? Y : 0, P === 2 ? Y : 0);
      let Z = s.physics.raycast(d.pos, Bs, Math.abs(V) * y + L);
      Z && (d.vel.setComponent(P, -V * .25), d.avoid.setComponent(P, d.avoid.getComponent(P) - Y * 8), Z.dist < L && d.pos.setComponent(P, d.pos.getComponent(P) - Y * (L - Z.dist)));
    }
    if (d.pos.addScaledVector(d.vel, y), !d.hoverFixed) {
      let P = s.physics.groundHeight(d.pos.x, d.pos.z, d.pos.y + .5) + 1.1;
      d.pos.y < P && (d.pos.y = P, d.vel.y < 0 && (d.vel.y = 0));
    }
    let q = d.yaw;
    if ((A || d.mode === "search" || d.mode === "investigate") && b) {
      let P = A && d.noSeeT < 1.5 ? b.pos : d.lastKnown;
      q = Math.atan2(P.x - d.pos.x, P.z - d.pos.z);
    } else z > .4 && (q = Math.atan2(d.vel.x, d.vel.z));
    let U = K_(q, d.yaw);
    d.yaw += bl(U, -3.2 * y, 3.2 * y);
    let T = Math.cos(d.yaw);
    let D = Math.sin(d.yaw);
    let C = Co.x * D + Co.z * T;
    let G = Co.x * T - Co.z * D;
    let j = bl(C * .04, -.42, .42);
    let N = bl(-G * .04, -.42, .42);
    _ && (j += Math.sin(m * 11 + d.phase) * .1, N += Math.cos(m * 8.7 + d.phase * 2) * .13);
    let Q = 1 - Math.exp(-7 * y);
    d.pitch += (j - d.pitch) * Q;
    d.roll += (N - d.roll) * Q;
    a.group.rotation.set(d.pitch, d.yaw, d.roll);
    l.body.position.y = Math.sin(m * 2.1 + d.phase) * .045 + Math.sin(m * 3.7 + d.phase * 1.7) * .018;
    d.thr += (1 + bl(Co.y * .03, -.25, .4) + z * .02 - d.thr) * Q;
    let K = 41 * d.thr * y;
    l.rotor0.rotation.y += K;
    l.rotor1.rotation.y -= K * 1.03;
    l.rotor2.rotation.y -= K * .98;
    l.rotor3.rotation.y += K * 1.01;
    let ie = (m * .9 + d.phase * .1) % 1;
    let F = ie < .05 || ie > .13 && ie < .18 ? 1 : 1e-4;
    if (l.strobeR.scale.setScalar(F), l.strobeG.scale.setScalar(F), l.strobeW.scale.setScalar(ie > .5 && ie < .56 ? 1 : 1e-4), A && b) ou.set(b.pos.x, b.pos.y + 1.1, b.pos.z);else if (d.mode !== "patrol") {
      d.sweep += y;
      ou.set(d.lastKnown.x + Math.sin(d.sweep * .9) * 3, d.lastKnown.y, d.lastKnown.z + Math.cos(d.sweep * .7) * 3);
    } else {
      d.sweep += y;
      let P = d.yaw + Math.sin(d.sweep * .5 + d.phase) * .9;
      ou.set(d.pos.x + Math.sin(P) * 5, d.pos.y - (d.hoverFixed ? 1.6 : 5), d.pos.z + Math.cos(P) * 5);
    }
    $o.copy(ou).sub(d.sensor);
    let X = $o.x * T - $o.z * D;
    let ne = $o.x * D + $o.z * T;
    let re = $o.y;
    let $ = Math.atan2(X, ne);
    let ue = bl(Math.atan2(-re, Math.hypot(X, ne)), -.5, 1.5);
    let me = 1 - Math.exp(-9 * y);
    d.gy += K_($, d.gy) * me;
    d.gp += (ue - d.gp) * me;
    l.gimbalYaw.rotation.y = d.gy;
    l.ball.rotation.x = d.gp - d.pitch;
    l.gun.rotation.x = bl(d.gp, -.2, 1.3) - d.pitch;
    let ee = A ? UC : ym;
    let B = 1 + d.flare * 3.2 + (A ? 0 : Math.sin(m * 3 + d.phase) * .15);
    for (let P = 0; P < 3; P++) d.lensC[P] += (ee[P] - d.lensC[P]) * (1 - Math.exp(-8 * y));
    if (r.color.setRGB(d.lensC[0] * B, d.lensC[1] * B, d.lensC[2] * B), d.flare = Math.max(0, d.flare - y * 1.5), d.muzzle.set(0, -.12, .17).applyAxisAngle(Hf, d.yaw).add(d.pos), d.cool -= y, d.atk === "idle") A && d.los && d.cool <= 0 && b && b.alive && Math.abs(U) < .35 && d.pos.distanceTo(b.pos) < Pn.fireRange && i.requestToken(d) && (d.atk = "tele", d.atkT = Pn.telegraph, s.events.emit("enemy:telegraph", {
      enemy: d,
      type: "gull",
      time: Pn.telegraph,
      pos: d.pos
    }));else if (d.atk === "tele") {
      d.atkT -= y;
      d.flare = Math.min(1, d.flare + y * 4.5);
      A ? d.atkT <= 0 && (d.atk = "burst", d.shots = Pn.burst, d.atkT = 0, d.lead = .2 + o() * .65) : (d.atk = "idle", i.releaseToken(d));
    } else if (d.atk === "burst" && (d.atkT -= y, d.flare = 1, d.atkT <= 0)) {
      if (d.atkT = Pn.burstGap, d.shots--, b) {
        let P = d.muzzle.distanceTo(b.pos);
        let V = P / Pn.boltSpeed;
        ou.set(b.pos.x + b.vel.x * V * d.lead, b.pos.y + 1.05, b.pos.z + b.vel.z * V * d.lead);
        Bs.copy(ou).sub(d.muzzle).normalize();
        let Y = (Pn.spreadFar + (Pn.spreadNear - Pn.spreadFar) * d.exposure) * (1 + i.playerSpeed * .45) * (_ ? 1.5 : 1);
        Bs.x += (o() - .5) * 2 * Y;
        Bs.y += (o() - .5) * 2 * Y;
        Bs.z += (o() - .5) * 2 * Y;
        Bs.normalize();
        i.fireBolt(d.muzzle, Bs, d);
        s.fx.muzzleFlash(d.muzzle, Bs, {
          scale: .55
        });
        s.events.emit("enemy:fire", {
          enemy: d,
          pos: d.muzzle,
          dir: Bs,
          type: "gull"
        });
        d.vel.addScaledVector(Bs, -.35);
      }
      d.shots <= 0 && (d.atk = "idle", d.cool = Pn.cooldown[0] + o() * (Pn.cooldown[1] - Pn.cooldown[0]), i.releaseToken(d));
    }
    _ && (d.smokeT -= y, d.smokeT <= 0 && (d.smokeT = .16, s.fx.smoke(d.pos, {
      size: .3,
      life: 1.1,
      color: 2500652,
      rise: .8
    }), o() < .15 && s.fx.sparks(d.pos, J_, 2)));
    d.loop && (d.loop.setPos(d.pos), d.loop.setPitch(.85 + d.thr * .2 + (_ ? Math.sin(m * 13) * .05 : 0)));
  }
  return d;
}
export { GULL_TUNING, createGull };
