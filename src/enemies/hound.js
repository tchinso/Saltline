import { $v } from './models.js';
import { Mesh, PlaneGeometry, Vector3 } from '../../vendor/three.js';
import { pm, q_ } from './rig.js';
import { nM, sM } from './collision.js';
var HOUND_TUNING = {
  hp: 140,
  shotDamage: 5,
  burst: 4,
  burstGap: .11,
  telegraph: .5,
  cooldown: [1.8, 3],
  runSpeed: 4.5,
  stalkSpeed: 2,
  patrolSpeed: 1.5,
  accel: 7,
  turnRate: 2.5,
  rangeMin: 8,
  rangeMax: 18,
  spreadFar: .12,
  spreadNear: .045,
  lungeRange: 3,
  lungeDamage: 15,
  lungeCooldown: 3.5,
  lungeSpeed: 9.5,
  replan: .6,
  smokeBelow: .4
};
var Gt = HOUND_TUNING;
var ni = $v;
var ps = new Vector3();
var ru = new Vector3();
var Po = new Vector3();
var Io = new Vector3();
var eM = new Vector3();
var Vf = new Vector3();
var jv = new Vector3(0, 1, 0);
var bm = {
  abd: 0,
  hip: 0,
  knee: 0,
  reach: 0
};
var _m = [8, 4, .7];
var NC = [14, 1, .35];
var Mm = (i, e) => {
  let t = (i - e) % (Math.PI * 2);
  t > Math.PI ? t -= Math.PI * 2 : t < -Math.PI && (t += Math.PI * 2);
  return t;
};
var uo = (i, e, t) => i < e ? e : i > t ? t : i;
var wm = [[0, 3], [1, 2]];
function xa(i, e, t, n, s) {
  i.v += ((e - i.x) * t - i.v * n) * s;
  i.x += i.v * s;
  return i.x;
}
function createHound(i, e, t, n) {
  let s = i.G;
  let o = i.rng;
  let r = t.lensBase.clone();
  let a = pm(e, {
    shell: t.shell,
    metal: t.metal,
    glow: t.glow,
    lens: r
  }, {
    radius: 1.5,
    center: [0, .6, 0]
  });
  let l = a.bones;
  a.group.visible = false;
  let c = [];
  let u = [];
  let h = [];
  for (let T = 0; T < 4; T++) {
    c.push(l["abd" + ni.legs[T]]);
    u.push(l["thigh" + ni.legs[T]]);
    h.push(l["shin" + ni.legs[T]]);
  }
  let f = s.mats.label("H-" + String(n + 3).padStart(2, "0"), {
    color: "black",
    font: "stencil",
    distress: .3
  });
  let p = .2;
  let d = Math.min(.085, p / (f.aspect || 3));
  let v = new PlaneGeometry(p, d);
  v.rotateY(Math.PI / 2);
  v.translate(.1675, .03, -.085);
  let g = new PlaneGeometry(p, d);
  g.rotateY(-Math.PI / 2);
  g.translate(-.1675, .03, -.085);
  let x = i.mergeSimple([v, g]);
  let y = new Mesh(x, f.material);
  y.castShadow = false;
  y.receiveShadow = true;
  l.body.add(y);
  let b = [0, 1, 2, 3].map(() => ({
    p: new Vector3(),
    from: new Vector3(),
    to: new Vector3(),
    slide: new Vector3()
  }));
  let m = {
    id: 0,
    type: "hound",
    pos: a.group.position,
    alive: false,
    hp: Gt.hp,
    active: false,
    rig: a,
    lens: r,
    feet: b,
    yaw: 0,
    speed: 0,
    yawRate: 0,
    home: new Vector3(),
    lastKnown: new Vector3(),
    goal: new Vector3(),
    firePos: new Vector3(),
    firePlayer: new Vector3(),
    sensor: new Vector3(),
    fwd: new Vector3(0, 0, 1),
    muzzle: new Vector3(),
    headPos: new Vector3(),
    push: new Vector3(),
    mode: "patrol",
    los: false,
    seeT: 0,
    noSeeT: 0,
    senseT: 0,
    exposure: 0,
    modeT: 0,
    passive: false,
    hasToken: false,
    es: "move",
    esT: 0,
    cool: 1,
    shots: 0,
    bursts: 0,
    lungeCd: 0,
    path: null,
    wp: 0,
    planT: 0,
    hasGoal: false,
    waitT: 0,
    moveT: 0,
    stuckT: 0,
    sw: -1,
    swT: 0,
    swDur: .2,
    lastPair: 1,
    idleT: 0,
    lift: .08,
    sY: {
      x: 0,
      v: 0
    },
    sP: {
      x: 0,
      v: 0
    },
    sR: {
      x: 0,
      v: 0
    },
    sL: {
      x: 0,
      v: 0
    },
    sA: {
      x: 0,
      v: 0
    },
    sA2: {
      x: 0,
      v: 0
    },
    crouch: 0,
    tyaw: 0,
    tpitch: 0,
    hyaw: 0,
    hpitch: 0,
    flare: 0,
    lensC: [_m[0], _m[1], _m[2]],
    smokeT: 0,
    phase: 0,
    scan: 0,
    dieT: 0,
    vy: 0,
    dieRoll: 0,
    diePitch: 0,
    wreck: false,
    sink: 0,
    loop: null,
    prevSpeed: 0,
    maxSpeed: Gt.patrolSpeed,
    damage(T, D, C, G) {
      if (!m.alive) return false;
      if (m.hp -= T, s.events.emit("enemy:hit", {
        enemy: m,
        point: D,
        part: G || "body"
      }), C) {
        let j = Math.cos(m.yaw);
        let N = Math.sin(m.yaw);
        let Q = Math.min(1.6, T / 28);
        let K = C.x * N + C.z * j;
        let ie = C.x * j - C.z * N;
        m.sL.v += ie * 1.4 * Q;
        m.sR.v += -ie * 3.2 * Q;
        m.sP.v += K * 2.4 * Q * (G === "weak" ? 1.6 : 1);
        m.sY.v -= .5 * Q;
      }
      i.provoke(m);
      return m.hp <= 0 ? (q(C), true) : false;
    },
    _activate(T, D = {}) {
      m.active = true;
      m.alive = true;
      m.wreck = false;
      m.hp = Gt.hp;
      m.passive = !!D.passive;
      m.sink = 0;
      m.pos.copy(T);
      m.pos.y = s.physics.groundHeight(T.x, T.z, T.y + 1);
      m.home.copy(m.pos);
      m.yaw = D.yaw ?? o() * 6.283;
      m.speed = 0;
      m.yawRate = 0;
      m.push.set(0, 0, 0);
      m.mode = D.state === "alert" ? "investigate" : "patrol";
      m.modeT = 10;
      m.modeSeen = m.mode;
      m.lastKnown.copy(D.target || (s.player ? s.player.pos : T));
      m.los = false;
      m.seeT = m.noSeeT = 0;
      m.exposure = 0;
      m.senseT = o() * .2;
      m.hasToken = false;
      m.patrolR = D.patrolRadius ?? 7;
      m.patrolLine = D.patrolLine || null;
      m.patrolI = 0;
      m.es = "move";
      m.cool = .6 + o();
      m.lungeCd = .3;
      m.path = null;
      m.hasGoal = false;
      m.waitT = o() * 1.5;
      m.planT = 0;
      m.sw = -1;
      m.idleT = 0;
      m.crouch = 0;
      m.feelT = 0;
      m.blocked = false;
      m.flare = 0;
      m.phase = o() * 6.283;
      m.dieT = 0;
      m.tyaw = m.hyaw = 0;
      m.tpitch = m.hpitch = 0;
      for (let C of [m.sY, m.sP, m.sR, m.sL, m.sA, m.sA2]) {
        C.x = 0;
        C.v = 0;
      }
      for (let C = 0; C < 4; C++) A(b[C].p, C, m.pos.x, m.pos.z, m.yaw);
      if (l.neck.rotation.set(0, 0, 0), l.gun.rotation.set(0, 0, 0), a.group.visible = true, O(.016), s.audio && s.audio.loop && !m.loop) try {
        m.loop = s.audio.loop("hound_servo", {
          pos: m.pos,
          gain: 0
        });
      } catch {
        m.loop = null;
      }
    },
    _deactivate() {
      if (m.active = false, m.alive = false, m.wreck = false, a.group.visible = false, i.releaseToken(m), m.loop) {
        try {
          m.loop.stop();
        } catch {}
        m.loop = null;
      }
    },
    _raycast(T, D, C, G) {
      let j = false;
      sM(T, D, m.headPos, .155, C, G) && (G.part = "weak", G.enemy = m, j = true);
      let N = Math.cos(m.yaw);
      let Q = Math.sin(m.yaw);
      let K = m.pos.y + ni.stand + m.sY.x - m.crouch;
      ps.set(m.pos.x - Q * .45, K + .03, m.pos.z - N * .45);
      ru.set(m.pos.x + Q * .47, K + .03, m.pos.z + N * .47);
      nM(T, D, ps, ru, .27, C, G) && (G.part = "body", G.enemy = m, j = true);
      ps.y = ru.y = m.pos.y + (K - m.pos.y) * .45;
      nM(T, D, ps, ru, .25, C, G) && (G.part = "body", G.enemy = m, j = true);
      return j;
    },
    _update(T) {
      m.alive ? S(T) : U(T);
    }
  };
  function A(T, D, C, G, j) {
    let N = ni.side[D] * ni.footX;
    let Q = ni.footZ[D];
    let K = Math.cos(j);
    let ie = Math.sin(j);
    T.set(C + N * K + Q * ie, 0, G - N * ie + Q * K);
    return T;
  }
  function _(T, D) {
    !D && m.hasGoal && m.goal.distanceToSquared(T) < .25 || (m.goal.copy(T), m.hasGoal = true, m.planT = 0, m.stuckT = 0);
  }
  function M() {
    m.planT = Gt.replan + o() * .15;
    let T = null;
    try {
      T = s.physics.nav.findPath(m.pos, m.goal);
    } catch {
      T = null;
    }
    m.path = T && T.length ? T : null;
    m.wp = 0;
    m.path && m.path.length > 1 && m.path[0].distanceToSquared(m.pos) < .36 && (m.wp = 1);
  }
  function E(T, D) {
    if (!m.hasGoal) {
      m.maxSpeed = 0;
      return true;
    }
    m.planT -= T;
    m.planT <= 0 && M();
    let C = m.goal;
    if (m.path) {
      for (; m.wp < m.path.length - 1 && Math.hypot(m.path[m.wp].x - m.pos.x, m.path[m.wp].z - m.pos.z) < .55;) m.wp++;
      C = m.path[Math.min(m.wp, m.path.length - 1)];
    }
    let G = m.goal.x - m.pos.x;
    let j = m.goal.z - m.pos.z;
    let N = Math.hypot(G, j);
    if (N < .45) {
      m.hasGoal = false;
      m.maxSpeed = 0;
      return true;
    }
    let Q = C.x - m.pos.x;
    let K = C.z - m.pos.z;
    m.wantYaw = Math.atan2(Q, K);
    let ie = Math.abs(Mm(m.wantYaw, m.yaw));
    m.maxSpeed = ie > 1.1 ? 0 : Math.min(D * (1 - ie * .5), .4 + N * 2.6);
    return false;
  }
  function w() {
    let T = s.player;
    if (!T) return;
    let D = 1 / 0;
    let C = T.eye || T.pos;
    let G = (Q, K) => {
      let ie = Math.hypot(Q.x - T.pos.x, Q.z - T.pos.z);
      if (ie < Gt.rangeMin || ie > Gt.rangeMax || s.physics.nav.isWalkable && !s.physics.nav.isWalkable(Q.x, Q.z)) return;
      let F = Math.hypot(Q.x - m.pos.x, Q.z - m.pos.z) * .9 + K + o() * 3;
      let X = Q.x - T.pos.x;
      let ne = Q.z - T.pos.z;
      for (let re of i.list) {
        if (re === m || !re.alive || re.type !== "hound" || re.mode !== "engage") continue;
        let $ = re.es === "move" ? re.firePos : re.pos;
        let ue = $.x - T.pos.x;
        let me = $.z - T.pos.z;
        let ee = (X * ue + ne * me) / (Math.hypot(X, ne) * Math.hypot(ue, me) + 1e-4);
        ee > .86 && (F += 14 * (ee - .86) / .14);
        Math.hypot(Q.x - $.x, Q.z - $.z) < 3 && (F += 16);
      }
      F >= D || (Vf.set(Q.x, Q.y + .95, Q.z), s.physics.lineOfSight(Vf, C) || (F += 22), F < D && (D = F, m.firePos.set(Q.x, Q.y, Q.z)));
    };
    let j = s.level && s.level.coverPoints;
    if (j) for (let Q = 0; Q < j.length; Q++) G(j[Q], -2);
    for (let Q = 0; Q < 7; Q++) {
      let K = s.physics.nav.randomPoint(T.pos, Gt.rangeMax);
      K && G(K, 0);
    }
    let N = Math.atan2(m.pos.z - T.pos.z, m.pos.x - T.pos.x);
    for (let Q = 0; Q < 5; Q++) {
      let K = N + (o() - .5) * 2.6;
      let ie = Gt.rangeMin + 1 + o() * (Gt.rangeMax - Gt.rangeMin - 2);
      Io.set(T.pos.x + Math.cos(K) * ie, T.pos.y, T.pos.z + Math.sin(K) * ie);
      Io.y = s.physics.groundHeight(Io.x, Io.z, T.pos.y + 1);
      G(Io, 1);
    }
    D === 1 / 0 && m.firePos.copy(m.pos);
    m.firePlayer.copy(T.pos);
    _(m.firePos, true);
    m.es = "move";
    m.esT = 0;
    m.moveT = 0;
    m.bursts = 0;
  }
  function S(T) {
    let D = s.player;
    let C = i.t;
    m.fwd.set(Math.sin(m.yaw), 0, Math.cos(m.yaw));
    m.sensor.copy(m.headPos);
    i.think(m, T, .55);
    m.mode !== m.modeSeen && (m.modeSeen = m.mode, m.hasGoal = false, m.path = null, m.waitT = 0, m.mode === "engage" ? w() : (m.es === "tele" || m.es === "burst") && (i.releaseToken(m), m.es = "move"));
    m.wantYaw = m.yaw;
    m.maxSpeed = 0;
    m.cool -= T;
    m.lungeCd -= T;
    let G = null;
    let j = null;
    let N = 0;
    let Q = false;
    let K = D ? Math.hypot(D.pos.x - m.pos.x, D.pos.z - m.pos.z) : 1e9;
    if (m.mode === "patrol") {
      if (m.hasGoal) E(T, Gt.patrolSpeed) && (m.waitT = 1.5 + o() * 3);else if (m.waitT -= T, m.waitT <= 0) if (m.patrolLine) {
        m.patrolI = (m.patrolI + 1) % m.patrolLine.length;
        _(m.patrolLine[m.patrolI], true);
      } else {
        let I = s.physics.nav.randomPoint(m.home, m.patrolR);
        I ? _(I, true) : m.waitT = 1;
      }
    } else if (m.mode === "investigate" || m.mode === "search") {
      j = m.lastKnown;
      let I = Math.hypot(m.lastKnown.x - m.pos.x, m.lastKnown.z - m.pos.z);
      I > 2.2 ? (_(m.lastKnown), E(T, I < 8 ? Gt.stalkSpeed : Gt.runSpeed)) : (m.hasGoal = false, m.scan += T, m.wantYaw = m.yaw + Math.sin(m.scan * .8) * .9, j = null);
    } else if (D) {
      G = D.pos;
      j = D.pos;
      let I = Math.atan2(D.pos.x - m.pos.x, D.pos.z - m.pos.z);
      switch ((m.es === "move" || m.es === "aim" || m.es === "cool") && K < Gt.lungeRange && m.lungeCd <= 0 && D.alive && (m.es = "wind", m.esT = .28, i.releaseToken(m), s.events.emit("enemy:telegraph", {
        enemy: m,
        type: "hound",
        time: .28,
        pos: m.pos,
        melee: true
      })), m.es) {
        case "move":
          {
            m.moveT += T;
            let se = E(T, Gt.runSpeed);
            let ae = K > Gt.rangeMin - 1 && K < Gt.rangeMax + 2;
            se || m.moveT > 1.4 && m.los && ae && o() < T * .7 || m.moveT > 7 ? (m.es = "aim", m.esT = 0, m.hasGoal = false) : D.pos.distanceToSquared(m.firePlayer) > 49 && w();
            break;
          }
        case "aim":
        case "cool":
          {
            m.wantYaw = I;
            m.esT += T;
            m.los ? K < Gt.rangeMin - 3 && m.esT > .8 ? w() : m.cool <= 0 && D.alive && Math.abs(Mm(I - m.yaw, m.tyaw)) < .14 && i.requestToken(m) && (m.es = "tele", m.esT = Gt.telegraph, s.events.emit("enemy:telegraph", {
              enemy: m,
              type: "hound",
              time: Gt.telegraph,
              pos: m.pos
            })) : (m.noSeeT > 1.1 || m.esT > 3) && w();
            break;
          }
        case "tele":
          {
            m.wantYaw = I;
            m.esT -= T;
            m.flare = Math.min(1, m.flare + T * 5);
            N = .05;
            m.esT <= 0 && (m.es = "burst", m.shots = Gt.burst, m.esT = 0);
            break;
          }
        case "burst":
          {
            m.wantYaw = I;
            m.esT -= T;
            m.flare = 1;
            N = .05;
            m.esT <= 0 && (m.esT = Gt.burstGap, m.shots--, z(D));
            m.shots <= 0 && (i.releaseToken(m), m.cool = Gt.cooldown[0] + o() * (Gt.cooldown[1] - Gt.cooldown[0]), m.bursts++, m.bursts >= 1 + (o() < .4 ? 1 : 0) ? w() : (m.es = "cool", m.esT = 0));
            break;
          }
        case "wind":
          {
            m.wantYaw = I;
            m.esT -= T;
            N = .16;
            m.sP.v += 3 * T;
            m.esT <= 0 && (m.es = "lunge", m.esT = .36, m.speed = Gt.lungeSpeed, m.yaw = I);
            break;
          }
        case "lunge":
          {
            Q = true;
            m.esT -= T;
            m.wantYaw = I;
            m.maxSpeed = Gt.lungeSpeed;
            m.speed = Gt.lungeSpeed;
            K < 1.35 && D.alive && (D.damage(Gt.lungeDamage, m.pos), s.events.emit("enemy:melee", {
              enemy: m,
              pos: m.pos
            }), m.esT = 0, m.sP.v -= 4);
            m.esT <= 0 && (m.es = "recover", m.esT = .55, m.lungeCd = Gt.lungeCooldown, m.speed *= .3);
            break;
          }
        case "recover":
          {
            m.esT -= T;
            m.wantYaw = I;
            m.esT <= 0 && w();
            break;
          }
      }
    }
    let ie = Mm(m.wantYaw, m.yaw);
    let F = uo(ie * 6, -Gt.turnRate, Gt.turnRate) * (Q ? 2 : 1);
    m.yawRate += (F - m.yawRate) * (1 - Math.exp(-10 * T));
    m.yaw += m.yawRate * T;
    let X = m.maxSpeed > m.speed ? Gt.accel : -Gt.accel * 1.4;
    m.prevSpeed = m.speed;
    m.speed = Q ? m.speed : uo(m.speed + X * T, 0, Math.max(m.maxSpeed, 0));
    !Q && X < 0 && m.speed < m.maxSpeed && (m.speed = m.maxSpeed);
    let ne = Math.sin(m.yaw);
    let re = Math.cos(m.yaw);
    for (let I of i.list) {
      if (I === m || I.type !== "hound" || !I.active) continue;
      let se = m.pos.x - I.pos.x;
      let ae = m.pos.z - I.pos.z;
      let k = Math.hypot(se, ae);
      if (k < 1.7 && k > .001) {
        let ce = (1.7 - k) * 2.2 / k;
        m.push.x += se * ce * T * 6;
        m.push.z += ae * ce * T * 6;
      }
    }
    if (D && !Q && K < 1.25 && K > .001) {
      let I = (1.25 - K) * 3 / K;
      m.push.x += (m.pos.x - D.pos.x) * I * T * 6;
      m.push.z += (m.pos.z - D.pos.z) * I * T * 6;
    }
    m.push.multiplyScalar(Math.exp(-5 * T));
    let $ = m.pos.x + (ne * m.speed + m.push.x) * T;
    let ue = m.pos.z + (re * m.speed + m.push.z) * T;
    let me = s.physics.nav;
    if (m.feelT -= T, m.feelT <= 0 && m.speed > .3) {
      m.feelT = .12;
      Io.set(m.pos.x, m.pos.y + .55, m.pos.z);
      Po.set(ne, 0, re);
      let I = s.physics.raycast(Io, Po, .75 + m.speed * .12);
      m.blocked = !!I;
    } else m.speed <= .3 && (m.blocked = false);
    (me.isWalkable && !me.isWalkable($, ue) || m.blocked && !Q || m.blocked && Q && m.esT < .3) && (m.blocked ? ($ = m.pos.x + m.push.x * T, ue = m.pos.z + m.push.z * T, m.yawRate += (m.phase > 3.14 ? 1 : -1) * 4 * T) : me.isWalkable($, m.pos.z) ? ue = m.pos.z : me.isWalkable(m.pos.x, ue) ? $ = m.pos.x : ($ = m.pos.x, ue = m.pos.z), m.speed *= .6, m.stuckT += T, m.stuckT > .5 && (m.stuckT = 0, m.planT = 0, m.mode === "engage" && m.es === "move" ? w() : m.mode === "patrol" && (m.hasGoal = false)));
    m.pos.x = $;
    m.pos.z = ue;
    m.pos.y += (s.physics.groundHeight($, ue, m.pos.y + .6) - m.pos.y) * (1 - Math.exp(-12 * T));
    H(T);
    m.crouch += (N - m.crouch) * (1 - Math.exp(-12 * T));
    let ee = Math.cos(m.yaw);
    let B = Math.sin(m.yaw);
    let P = 0;
    let V = 0;
    let Y = 0;
    let L = .05;
    let Z = m.pos.y + ni.stand + m.sY.x - m.crouch;
    if (G) {
      let I = G.x - m.pos.x;
      let se = G.z - m.pos.z;
      let ae = G.y + 1 - (Z + .25);
      P = Math.atan2(I * ee - se * B, I * B + se * ee);
      V = uo(Math.atan2(-ae, Math.hypot(I, se)), -.9, .35);
    } else {
      m.scan += T * .5;
      P = Math.sin(m.scan * .9 + m.phase) * 1.1;
    }
    if (j) {
      let I = j.x - m.pos.x;
      let se = j.z - m.pos.z;
      let ae = j.y + 1.2 - (Z + .2);
      Y = uo(Math.atan2(I * ee - se * B, I * B + se * ee), -1.2, 1.2);
      L = uo(Math.atan2(-ae, Math.hypot(I, se)), -.6, .5);
    } else Y = Math.sin(i.t * .7 + m.phase) * .5 + uo(m.yawRate * .25, -.6, .6);
    let J = uo(4.5 * T, 0, 1);
    m.tyaw += uo(Mm(P, m.tyaw), -J, J);
    m.tpitch += (V - m.tpitch) * (1 - Math.exp(-10 * T));
    let oe = 1 - Math.exp(-7 * T);
    m.hyaw += (Y - m.hyaw) * oe;
    m.hpitch += (L - m.hpitch) * oe;
    O(T);
    let fe = (i.t * (m.mode === "patrol" ? .8 : 2.2) + m.phase) % 1;
    l.beacon.scale.setScalar(fe < .12 || fe > .22 && fe < .3 ? 1 : 1e-4);
    let le = m.mode === "engage" ? NC : _m;
    let R = 1 + m.flare * 3.5;
    for (let I = 0; I < 3; I++) m.lensC[I] += (le[I] - m.lensC[I]) * (1 - Math.exp(-8 * T));
    r.color.setRGB(m.lensC[0] * R, m.lensC[1] * R, m.lensC[2] * R);
    m.flare = Math.max(0, m.flare - T * 2);
    m.hp < Gt.hp * Gt.smokeBelow && (m.smokeT -= T, m.smokeT <= 0 && (m.smokeT = .2, ps.set(m.pos.x - ne * .3, Z + .2, m.pos.z - re * .3), s.fx.smoke(ps, {
      size: .35,
      life: 1.3,
      color: 2303272,
      rise: .9
    }), o() < .2 && s.fx.sparks(ps, jv, 3)));
    m.loop && (m.loop.setPos(m.pos), m.loop.setGain(uo(.12 + m.speed * .12 + Math.abs(m.yawRate) * .1, 0, .8)), m.loop.setPitch(.8 + m.speed * .08));
  }
  function z(T) {
    let D = Math.cos(m.yaw + m.tyaw);
    let C = Math.sin(m.yaw + m.tyaw);
    Io.setFromMatrixPosition(l.gun.matrixWorld);
    (Io.lengthSq() < 1e-6 || Math.abs(Io.x - m.pos.x) > 2) && Io.set(m.pos.x, m.pos.y + ni.stand + .25, m.pos.z);
    Vf.set(T.pos.x, T.pos.y + 1, T.pos.z);
    Po.copy(Vf).sub(Io).normalize();
    m.muzzle.copy(Io).addScaledVector(Po, .43);
    let G = (Gt.spreadFar + (Gt.spreadNear - Gt.spreadFar) * m.exposure) * (1 + i.playerSpeed * .3);
    Po.x += (o() - .5) * 2 * G;
    Po.y += (o() - .5) * 2 * G;
    Po.z += (o() - .5) * 2 * G;
    Po.normalize();
    let j = s.physics.raycast(m.muzzle, Po, 200);
    let Q = s.combat.enemyShot(m.muzzle, Po, {
      damage: Gt.shotDamage,
      range: 200
    }) ? m.muzzle.distanceTo(Vf) : j ? j.dist : 90;
    eM.copy(m.muzzle).addScaledVector(Po, Q);
    s.fx.tracer(m.muzzle, eM, {
      color: 16760944,
      speed: 260,
      width: .035
    });
    s.fx.muzzleFlash(m.muzzle, Po, {
      scale: .9
    });
    s.render && s.render.lightPool && s.render.lightPool.flash(m.muzzle, 16756832, 22, 7, .05);
    s.events.emit("enemy:fire", {
      enemy: m,
      pos: m.muzzle,
      dir: Po,
      type: "hound"
    });
    m.sP.v += 1.1;
    m.sY.v -= .25;
  }
  function H(T) {
    let D = Math.sin(m.yaw) * m.speed + m.push.x;
    let C = Math.cos(m.yaw) * m.speed + m.push.z;
    let G = m.speed > .15 || Math.abs(m.yawRate) > .25;
    if (m.sw < 0) {
      m.idleT = G ? 0 : m.idleT + T;
      let j = m.speed + Math.abs(m.yawRate) * .5;
      let N = uo(.27 - j * .026, .14, .27);
      let Q = -1;
      let K = 0;
      for (let F = 0; F < 2; F++) {
        let X = 0;
        for (let ne of wm[F]) {
          A(ps, ne, m.pos.x + D * N, m.pos.z + C * N, m.yaw + m.yawRate * N);
          let re = Math.hypot(ps.x - b[ne].p.x, ps.z - b[ne].p.z);
          re > X && (X = re);
        }
        F !== m.lastPair && (X *= 1.25);
        X > K && (K = X, Q = F);
      }
      let ie = G ? .09 : m.idleT > .25 ? .035 : 1e9;
      if (Q >= 0 && K > ie) {
        m.sw = Q;
        m.swT = 0;
        m.swDur = N;
        m.lift = .065 + Math.min(.09, j * .02);
        for (let F of wm[Q]) {
          let X = b[F];
          X.from.copy(X.p);
          A(X.to, F, m.pos.x + D * N * 1.5, m.pos.z + C * N * 1.5, m.yaw + m.yawRate * N * 1.5);
          X.to.y = s.physics.groundHeight(X.to.x, X.to.z, m.pos.y + .6);
        }
      }
    } else {
      m.swT += T / m.swDur;
      let j = m.swT >= 1 ? 1 : m.swT;
      let N = j * j * (3 - 2 * j);
      for (let Q of wm[m.sw]) {
        let K = b[Q];
        K.p.lerpVectors(K.from, K.to, N);
        K.p.y += Math.sin(Math.PI * j) * m.lift;
      }
      if (m.swT >= 1) {
        let Q = b[wm[m.sw][0]];
        s.events.emit("enemy:step", {
          pos: Q.p,
          type: "hound",
          enemy: m,
          speed: m.speed
        });
        m.sY.v -= .12 + m.speed * .03;
        m.lastPair = m.sw;
        m.sw = -1;
      }
    }
  }
  function O(T) {
    let D = Math.cos(m.yaw);
    let C = Math.sin(m.yaw);
    let G = (b[0].p.y + b[1].p.y) * .5;
    let j = (b[2].p.y + b[3].p.y) * .5;
    let N = (b[0].p.y + b[2].p.y) * .5;
    let Q = (b[1].p.y + b[3].p.y) * .5;
    let K = (G + j) * .5 - m.pos.y;
    let ie = T > 0 ? (m.speed - m.prevSpeed) / T : 0;
    let F = Math.atan2(j - G, .8) * .6 + uo(ie * .006, -.07, .07);
    let X = Math.atan2(N - Q, .55) * .6 + uo(m.yawRate * m.speed * .02, -.12, .12);
    let ne = K * .45 - Math.min(.05, m.speed * .011);
    m.alive || (F = m.diePitch, X = m.dieRoll, ne = 0);
    m.alive && (xa(m.sY, ne, 160, 17, T), xa(m.sP, F, 130, 15, T), xa(m.sR, X, 130, 15, T), xa(m.sL, 0, 110, 13, T));
    let re = m.alive ? Math.sin(i.t * 1.7 + m.phase) * .004 : 0;
    let $ = m.sL.x;
    let ue = ni.stand + m.sY.x - m.crouch + re;
    let me = m.sP.x;
    let ee = m.sR.x;
    a.group.rotation.y = m.yaw;
    l.body.position.set($, ue, 0);
    l.body.rotation.set(me, 0, ee);
    l.turret.rotation.y = m.tyaw;
    l.gun.rotation.x = m.tpitch - me * .5;
    l.head.rotation.set(m.hpitch, m.hyaw, 0);
    xa(m.sA, uo(-ie * .03 - me, -.6, .6), 60, 5, T);
    xa(m.sA2, uo(m.yawRate * .12 - ee, -.6, .6), 60, 5, T);
    l.antenna.rotation.set(m.sA.x, 0, m.sA2.x);
    let B = Math.cos(me);
    let P = Math.sin(me);
    let V = Math.cos(ee);
    let Y = Math.sin(ee);
    for (let L = 0; L < 4; L++) {
      let Z = b[L].p;
      let J = Z.x - m.pos.x;
      let oe = Z.y + ni.footR * .6 - m.pos.y;
      let fe = Z.z - m.pos.z;
      let le = J * D - fe * C - $;
      let R = oe - ue;
      let I = J * C + fe * D;
      let se = R * B + I * P;
      let ae = -R * P + I * B;
      let k = le * V + se * Y;
      let ce = -le * Y + se * V;
      q_(bm, k - ni.side[L] * ni.hipX, ce - ni.hipY, ae - ni.fore[L] * ni.hipZ, ni.side[L], ni.l0, ni.L1, ni.L2 - ni.footR * .6);
      c[L].rotation.z = bm.abd;
      u[L].rotation.x = bm.hip;
      h[L].rotation.x = bm.knee;
    }
    a.group.updateMatrixWorld(true);
    m.headPos.setFromMatrixPosition(l.head.matrixWorld);
  }
  function q(T) {
    m.alive = false;
    i.releaseToken(m);
    m.dieT = 0;
    m.vy = 0;
    m.es = "move";
    l.beacon.scale.setScalar(1e-4);
    m.dieRoll = (o() < .5 ? -1 : 1) * (.25 + o() * .3);
    m.diePitch = (o() - .5) * .25;
    m.sR.v += m.dieRoll * 3;
    m.sP.v += (o() - .5) * 2;
    for (let D = 0; D < 4; D++) {
      let C = b[D];
      m.sw >= 0 && (C.p.y = m.pos.y);
      let G = m.yaw;
      let j = ni.side[D] * (.16 + o() * .2);
      let N = ni.fore[D] * (.05 + o() * .22) + (o() - .5) * .1;
      C.slide.set(j * Math.cos(G) + N * Math.sin(G), 0, -j * Math.sin(G) + N * Math.cos(G));
    }
    m.sw = -1;
    m.speed *= .3;
    ps.copy(m.headPos);
    s.fx.sparks(ps, jv, 16);
    s.fx.debris(ps, {
      count: 4
    });
    s.events.emit("enemy:killed", {
      enemy: m,
      pos: m.pos,
      type: "hound"
    });
    i.addWreck(m);
  }
  function U(T) {
    if (m.sink > 0) {
      m.sink += T;
      m.pos.y -= .22 * T;
      m.sink > 3.2 && i.retire(m);
      return;
    }
    m.dieT += T;
    let D = m.dieT;
    if (D < 2.2) {
      let C = .215 - ni.stand;
      m.vy -= 9.8 * T * (D < .12 ? .3 : 1);
      m.sY.x += m.vy * T;
      m.sY.x < C && (m.sY.x = C, m.vy < -1.2 && (s.events.emit("enemy:step", {
        pos: m.pos,
        type: "hound",
        enemy: m,
        speed: 5,
        crash: true
      }), s.fx.dust(m.pos, jv)), m.vy = -m.vy * .22);
      xa(m.sP, m.diePitch, 60, 9, T);
      xa(m.sR, m.dieRoll, 60, 9, T);
      xa(m.sL, 0, 40, 8, T);
      let G = Math.exp(-3.2 * T);
      for (let N = 0; N < 4; N++) {
        let Q = b[N];
        Q.p.x += Q.slide.x * (1 - G);
        Q.p.z += Q.slide.z * (1 - G);
        Q.slide.multiplyScalar(G);
      }
      m.pos.x += Math.sin(m.yaw) * m.speed * T;
      m.pos.z += Math.cos(m.yaw) * m.speed * T;
      m.speed *= Math.exp(-5 * T);
      m.hpitch += (.55 - m.hpitch) * (1 - Math.exp(-5 * T));
      m.hyaw += (m.dieRoll - m.hyaw) * (1 - Math.exp(-3 * T));
      m.tpitch += (.3 - m.tpitch) * (1 - Math.exp(-4 * T));
      let j = D < 1.2 ? Math.sin(D * 60) > .2 ? 1 - D / 1.2 : .05 : .02;
      r.color.setRGB(6 * j + .05, .6 * j + .01, .2 * j);
      O(T);
    }
    if (D < 6.5) {
      m.smokeT -= T;
      m.smokeT <= 0 && (m.smokeT = D < 2 ? .09 : .2, ps.set(m.pos.x + (o() - .5) * .4, m.pos.y + .42, m.pos.z + (o() - .5) * .4), s.fx.smoke(ps, {
        size: .5 + o() * .3,
        life: 1.8,
        color: 1513499,
        rise: 1.1
      }), D < 4 && o() < .55 && (ru.set(o() - .5, 1, o() - .5).normalize(), s.fx.sparks(ps, ru, D < 1 ? 8 : 3)), D < 3.5 && o() < .4 && s.fx.smoke(ps, {
        size: .22,
        life: .45,
        color: 16742946,
        rise: 1.6
      }));
    } else if (!m.wreck && (m.wreck = true, m.loop)) {
      try {
        m.loop.stop();
      } catch {}
      m.loop = null;
    }
    m.loop && m.loop.setGain(Math.max(0, .4 - D * .3));
  }
  return m;
}
export { HOUND_TUNING, createHound };
