import { GULL_TUNING, createGull } from './gull.js';
import { HOUND_TUNING, createHound } from './hound.js';
import { createBreaker } from './breaker.js';
import { createTitan } from './titan.js';
import { AdditiveBlending, Color, CylinderGeometry, DoubleSide, DynamicDrawUsage, Group, InstancedMesh, Matrix4, MeshBasicMaterial, Quaternion, ShaderMaterial, Vector3 } from '../../vendor/three.js';
import { createRandom } from '../core/random.js';
import { mergeGeometries } from '../geometry/merge.js';
import { Z_, j_ } from './models.js';
var ENEMY_TUNING = {
  gull: GULL_TUNING,
  hound: HOUND_TUNING,
  sightRange: 45,
  sightCone: 200,
  loseSight: 4,
  searchTime: 8,
  hearRadius: 45,
  maxTokens: 2,
  maxTokensCrowd: 3,
  tokenGap: 1.25,
  exposureUp: .1,
  exposureDown: .45,
  poolGulls: 10,
  poolHounds: 8,
  maxWrecks: 5,
  maxBolts: 32
};
var BC = Math.cos(ENEMY_TUNING.sightCone / 2 * Math.PI / 180);
var oM = new Vector3();
var pz = new Vector3();
var Qv = new Vector3();
var rM = new Quaternion();
var aM = new Matrix4();
var lM = new Vector3(1, 1, 1);
var OC = new Vector3(0, 0, 1);
var mz = new Vector3(0, -1, 0);
var cM = new Vector3();
var uM = new Vector3();
async function createEnemies(game) {
  let e = createRandom(+(game.params && game.params.eseed || 9001));
  let t = [];
  let n = [];
  let s = new Group();
  s.name = "enemies";
  game.scene.add(s);
  let o = game.mats.emissive(16777215, 1);
  let r = o && o.isMeshBasicMaterial ? o.clone() : new MeshBasicMaterial();
  r.color.setRGB(1, 1, 1);
  r.vertexColors = true;
  r.needsUpdate = true;
  let a = game.mats.emissive(16752704, 6);
  let l = a && a.isMeshBasicMaterial ? a : new MeshBasicMaterial({
    color: 16752704
  });
  let c = o && o.toneMapped !== void 0 ? o.toneMapped : true;
  let u = {
    shell: game.mats.get("armor_white", {
      triplanar: true,
      vertexColors: true
    }),
    metal: game.mats.get("gunmetal", {
      triplanar: true,
      vertexColors: true
    }),
    glow: r,
    lensBase: l,
    disc: new MeshBasicMaterial({
      color: 789775,
      transparent: true,
      opacity: .42,
      depthWrite: false,
      side: DoubleSide,
      toneMapped: c
    }),
    cone: new ShaderMaterial({
      uniforms: {
        uColor: {
          value: new Color(1, .9, .74)
        },
        uGain: {
          value: .085
        }
      },
      vertexShader: `
        #include <common>
        #include <skinning_pars_vertex>
        varying float vT; varying vec3 vN; varying vec3 vV;
        void main() {
          #include <beginnormal_vertex>
          #include <skinbase_vertex>
          #include <skinnormal_vertex>
          #include <begin_vertex>
          #include <skinning_vertex>
          vec4 mv = modelViewMatrix * vec4(transformed, 1.0);
          vN = normalMatrix * objectNormal; vV = -mv.xyz; vT = 1.0 - uv.y;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 uColor; uniform float uGain;
        varying float vT; varying vec3 vN; varying vec3 vV;
        void main() {
          float f = abs(dot(normalize(vN), normalize(vV)));
          f = f * f * (3.0 - 2.0 * f);
          float t = clamp(vT, 0.0, 1.0);
          float k = pow(1.0 - t, 1.7) * (0.35 + 0.65 * smoothstep(0.0, 0.06, t));
          gl_FragColor = vec4(uColor * (uGain * f * k), 1.0);
        }`,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide,
      fog: false
    })
  };
  let h = {
    G: game,
    rng: e,
    list: t,
    t: 0,
    playerSpeed: 0,
    tokens: 0,
    tokenT: -9,
    lastType: "",
    wantT: {
      gull: -9,
      hound: -9
    },
    mergeSimple: T => mergeGeometries(T, false),
    requestToken(T) {
      if (T.hasToken) return true;
      let D = 0;
      for (let Q of t) Q.alive && D++;
      let C = D > 5 ? ENEMY_TUNING.maxTokensCrowd : ENEMY_TUNING.maxTokens;
      let G = h.t - h.tokenT;
      let j = T.type === "gull" ? "hound" : "gull";
      let N = h.lastType === T.type && h.t - h.wantT[j] < .5 && G < ENEMY_TUNING.tokenGap * 2.2;
      return h.tokens >= C || G < ENEMY_TUNING.tokenGap || N ? (h.wantT[T.type] = h.t, false) : (h.tokens++, h.tokenT = h.t, h.lastType = T.type, T.hasToken = true, true);
    },
    releaseToken(T) {
      T.hasToken && (T.hasToken = false, h.tokens = Math.max(0, h.tokens - 1));
    },
    think(T, D, C) {
      let G = game.player;
      if (T.passive || !G) {
        T.los = false;
        return;
      }
      if (T.senseT -= D, T.senseT <= 0) {
        T.senseT = .11 + e() * .08;
        let j = false;
        if (G.alive !== false) {
          let N = G.eye || G.pos;
          let Q = N.x - T.sensor.x;
          let K = N.y - T.sensor.y;
          let ie = N.z - T.sensor.z;
          let F = Math.hypot(Q, K, ie);
          if (F < ENEMY_TUNING.sightRange) {
            let X = Math.hypot(Q, ie) || 1e-4;
            let ne = (Q * T.fwd.x + ie * T.fwd.z) / X;
            (T.mode === "engage" || ne > BC || F < 3.5) && (j = game.physics.lineOfSight(T.sensor, N));
          }
        }
        T.los = j;
      }
      T.los ? (T.seeT += D, T.noSeeT = 0, T.lastKnown.copy(G.pos), T.exposure = Math.min(1, T.exposure + D * ENEMY_TUNING.exposureUp)) : (T.noSeeT += D, T.seeT = Math.max(0, T.seeT - D * .6), T.exposure = Math.max(0, T.exposure - D * ENEMY_TUNING.exposureDown));
      T.mode === "engage" ? (T.noSeeT > ENEMY_TUNING.loseSight || G.alive === false) && (T.mode = "search", T.modeT = ENEMY_TUNING.searchTime + e() * 3, h.releaseToken(T)) : T.los && T.seeT > (T.mode === "patrol" ? C : C * .45) ? (T.mode = "engage", T.noSeeT = 0, game.events.emit("enemy:alert", {
        enemy: T
      }), h.rally(T.pos, 18, G.pos, T)) : T.mode !== "patrol" && (T.modeT -= D, T.modeT <= 0 && (T.mode = "patrol", T.home.x = T.pos.x, T.home.z = T.pos.z));
    },
    rally(T, D, C, G) {
      for (let j of t) j === G || !j.alive || j.passive || j.mode === "engage" || j.pos.distanceToSquared(T) > D * D || (j.lastKnown.copy(C), j.mode = "investigate", j.modeT = 9 + e() * 4);
    },
    provoke(T) {
      let D = game.player;
      !D || T.passive || !T.alive || (T.mode !== "engage" && (T.lastKnown.copy(D.pos), T.mode = "investigate", T.modeT = 10, T.seeT = 1, T.senseT = 0), h.rally(T.pos, 20, D.pos, T));
    },
    fireBolt(T, D, C) {
      let G = null;
      for (let j = 0; j < g.length; j++) if (!g[j].on) {
        G = g[j];
        break;
      }
      G && (G.on = true, G.life = 1.3, G.pos.copy(T), G.dir.copy(D), G.from.copy(T), G.len = 0);
    },
    addWreck(T) {
      for (n.push(T); n.length > ENEMY_TUNING.maxWrecks;) {
        let D = n.shift();
        D.active && (D.sink = .001);
      }
    },
    retire(T) {
      T._deactivate();
      let D = t.indexOf(T);
      D >= 0 && t.splice(D, 1);
      D = n.indexOf(T);
      D >= 0 && n.splice(D, 1);
    }
  };
  let f = j_();
  let p = Z_();
  let d = [];
  let v = [];
  for (let T = 0; T < ENEMY_TUNING.poolGulls; T++) {
    let D = createGull(h, f, u, T);
    d.push(D);
    s.add(D.rig.group);
  }
  for (let T = 0; T < ENEMY_TUNING.poolHounds; T++) {
    let D = createHound(h, p, u, T);
    v.push(D);
    s.add(D.rig.group);
  }
  const breakers = [createBreaker(game)];
  for (const breaker of breakers) s.add(breaker.rig.group);
  const colossi = [];
  const hunters = [];
  const adaptives = [];
  const titans = [];
  let g = [];
  for (let T = 0; T < ENEMY_TUNING.maxBolts; T++) g.push({
    on: false,
    life: 0,
    len: 0,
    pos: new Vector3(),
    dir: new Vector3(),
    from: new Vector3()
  });
  let x = new CylinderGeometry(.016, .03, 1, 6, 1);
  x.rotateX(Math.PI / 2);
  x.translate(0, 0, -.5);
  let y = game.mats.emissive(16738858, 14);
  let b = y && y.isMeshBasicMaterial ? y : new MeshBasicMaterial({
    color: new Color(16738858).multiplyScalar(14)
  });
  let m = new InstancedMesh(x, b, ENEMY_TUNING.maxBolts);
  m.frustumCulled = false;
  m.castShadow = false;
  m.receiveShadow = false;
  m.count = 0;
  m.instanceMatrix.setUsage(DynamicDrawUsage);
  s.add(m);
  let A = {
    point: new Vector3(),
    normal: new Vector3(),
    dist: 0,
    surface: "concrete",
    enemy: null,
    part: null,
    dir: new Vector3(),
    from: "enemy"
  };
  function _(T) {
    let D = game.player;
    let C = 0;
    for (let G = 0; G < g.length; G++) {
      let j = g[G];
      if (!j.on) continue;
      let N = ENEMY_TUNING.gull.boltSpeed * T;
      j.life -= T;
      let Q = game.physics.raycast(j.pos, j.dir, N);
      let K = Q ? Q.dist : N;
      let ie = false;
      if (D && D.alive !== false && (oM.copy(j.pos).addScaledVector(j.dir, K), cM.set(D.pos.x, D.pos.y + .35, D.pos.z), uM.set(D.pos.x, D.pos.y + (D.crouching ? 1 : 1.5), D.pos.z), HC(j.pos, oM, cM, uM) < .36 * .36 && (ie = true)), ie) {
        D.damage(ENEMY_TUNING.gull.boltDamage, j.from);
        j.on = false;
        continue;
      }
      if (Q) {
        A.point.copy(Q.point);
        A.normal.copy(Q.normal);
        A.dist = Q.dist;
        A.surface = Q.surface;
        A.dir.copy(j.dir);
        game.events.emit("impact", A);
        j.on = false;
        continue;
      }
      if (j.life <= 0) {
        j.on = false;
        continue;
      }
      j.pos.addScaledVector(j.dir, N);
      j.len = Math.min(1.5, j.len + N);
      rM.setFromUnitVectors(OC, j.dir);
      lM.set(1, 1, Math.max(.2, j.len));
      aM.compose(j.pos, rM, lM);
      m.setMatrixAt(C++, aM);
    }
    (C || m.count) && (m.count = C, m.instanceMatrix.needsUpdate = true);
  }
  let M = null;
  let E = false;
  let w = 0;
  let S = new Vector3();
  let z = 0;
  function H(T) {
    if (!E) {
      E = true;
      try {
        M = game.render && game.render.lightPool && game.render.lightPool.acquire ? game.render.lightPool.acquire() : null;
      } catch {
        M = null;
      }
      M && M.light && (M.light.color.setRGB(1, .9, .75), M.light.distance = 9);
    }
    if (!M || !M.light) return;
    let D = null;
    let C = 3600;
    let G = game.camera ? game.camera.position : null;
    for (let N of t) {
      if (N.type !== "gull" || !N.alive) continue;
      let Q = G ? N.pos.distanceToSquared(G) : 0;
      Q < C && (C = Q, D = N);
    }
    let j = 0;
    if (D) {
      if (w -= T, w <= 0) {
        w = .1;
        let N = D.yaw + D.gy;
        let Q = Math.cos(D.gp);
        Qv.set(Math.sin(N) * Q, -Math.sin(D.gp), Math.cos(N) * Q).normalize();
        let K = game.physics.raycast(D.sensor, Qv, 14);
        S.copy(D.sensor).addScaledVector(Qv, (K ? K.dist : 8) - .6);
        z = K ? 1 : .3;
      }
      j = 26 * z;
      M.light.position.lerp(S, 1 - Math.exp(-12 * T));
    }
    M.light.intensity += (j - M.light.intensity) * (1 - Math.exp(-8 * T));
  }
  let O = 1;
  let q = 0;
  let U = {
    list: t,
    TUNE: ENEMY_TUNING,
    spawn(T, D, C = {}) {
      if (T === 'titan' && !titans.length) titans.push(createTitan(game));
      if (T === 'colossus' && !colossi.length) {
        const boss = createBreaker(game, 'colossus');
        colossi.push(boss);
        s.add(boss.rig.group);
      }
      if (T === 'hunter' && !hunters.length) {
        const boss = createBreaker(game, 'hunter');
        hunters.push(boss);
        s.add(boss.rig.group);
      }
      if (T === 'adaptive' && !adaptives.length) {
        const enemy = createBreaker(game, 'adaptive');
        adaptives.push(enemy);
        s.add(enemy.rig.group);
      }
      let G = T === "gull" ? d : T === "hound" ? v : T === "breaker" ? breakers : T === 'colossus' ? colossi : T === 'hunter' ? hunters : T === 'adaptive' ? adaptives : T === 'titan' ? titans : null;
      if (!G) return null;
      let j = null;
      for (let N of G) if (!N.active) {
        j = N;
        break;
      }
      if (!j && T === "hound" && n.length) {
        let N = n[0];
        h.retire(N);
        j = N;
      }
      return j ? (j.id = O++, t.push(j), j._activate(D, C), game.events.emit("enemy:spawn", {
        enemy: j
      }), j) : null;
    },
    raycast(T, D, C = 300) {
      let G = null;
      for (let j = 0; j < t.length; j++) {
        let N = t[j];
        if (!N.alive) continue;
        let Q = N.pos.x - T.x;
        let K = N.pos.y + (N.type === 'titan' ? 3 : N.type === "colossus" ? 1.95 : ["breaker", "hunter", "adaptive"].includes(N.type) ? 1.3 : N.type === "hound" ? .6 : 0) - T.y;
        let ie = N.pos.z - T.z;
        let F = Q * D.x + K * D.y + ie * D.z;
        let radiusSq = N.type === 'titan' ? 18 : N.type === "colossus" ? 13.5 : ["breaker", "hunter", "adaptive"].includes(N.type) ? 6 : 1.7;
        F < -1.5 || F > C + 1.5 || Q * Q + K * K + ie * ie - F * F > radiusSq || (G || (G = {
          dist: 1 / 0,
          point: new Vector3(),
          normal: new Vector3(),
          enemy: null,
          part: "body"
        }), N._raycast(T, D, C, G));
      }
      return G && G.enemy ? G : null;
    },
    aliveCount() {
      let T = 0;
      for (let D of t) D.alive && T++;
      return T;
    },
    clear() {
      for (let T of d) T.active && T._deactivate();
      for (let T of v) T.active && T._deactivate();
      for (let T of breakers) T.active && T._deactivate();
      for (let T of colossi) T.active && T._deactivate();
      for (let T of hunters) T.active && T._deactivate();
      for (let T of adaptives) T.active && T._deactivate();
      for (let T of titans) T.active && T._deactivate();
      t.length = 0;
      n.length = 0;
      h.tokens = 0;
      for (let T of g) T.on = false;
      m.count = 0;
      M && M.light && (M.light.intensity = 0);
    },
    alert(T, D = 40) {
      for (let C of t) !C.alive || C.passive || C.mode === "engage" || C.pos.distanceToSquared(T) > D * D || (C.lastKnown.copy(T), C.lastKnown.y = Math.max(0, T.y - 1.6), C.mode === "patrol" && game.events.emit("enemy:alert", {
        enemy: C,
        noise: true
      }), C.mode = "investigate", C.modeT = 9 + e() * 4);
    },
    update(T) {
      if (T <= 0) return;
      T > .05 && (T = .05);
      h.t += T;
      q -= T;
      let D = game.player;
      if (D) {
        let C = D.vel ? Math.hypot(D.vel.x, D.vel.z) : D.speed || 0;
        h.playerSpeed += (C - h.playerSpeed) * (1 - Math.exp(-6 * T));
      }
      for (let C = t.length - 1; C >= 0; C--) t[C]._update(T);
      _(T);
      H(T);
    },
    debug: {
      ctx: h,
      gulls: d,
      hounds: v,
      wrecks: n,
      bolts: g,
      mats: u,
      tris: {
        gull: f.tris + f.extra.tris,
        hound: p.tris
      }
    }
  };
  game.events.on("weapon:fire", T => {
    if (q > 0) return;
    q = .3;
    let D = T && (T.origin || T.muzzle) || game.player && game.player.pos;
    D && U.alert(D, ENEMY_TUNING.hearRadius);
  });
  game.events.on("explosion", T => {
    T && T.pos && U.alert(T.pos, 30);
  });
  game.events.on("game:state", T => {
    T && T.state === "title" && U.clear();
  });
  return U;
}
var o0 = new Vector3();
var r0 = new Vector3();
var a0 = new Vector3();
function HC(i, e, t, n) {
  o0.copy(e).sub(i);
  r0.copy(n).sub(t);
  a0.copy(i).sub(t);
  let s = o0.dot(o0);
  let o = r0.dot(r0);
  let r = r0.dot(a0);
  let a;
  let l;
  if (s <= 1e-9 && o <= 1e-9) return a0.dot(a0);
  if (s <= 1e-9) {
    a = 0;
    l = Math.min(1, Math.max(0, r / o));
  } else {
    let f = o0.dot(a0);
    if (o <= 1e-9) {
      l = 0;
      a = Math.min(1, Math.max(0, -f / s));
    } else {
      let p = o0.dot(r0);
      let d = s * o - p * p;
      a = d > 1e-9 ? Math.min(1, Math.max(0, (p * r - f * o) / d)) : 0;
      l = (p * a + r) / o;
      l < 0 ? (l = 0, a = Math.min(1, Math.max(0, -f / s))) : l > 1 && (l = 1, a = Math.min(1, Math.max(0, (p - f) / s)));
    }
  }
  let c = a0.x + o0.x * a - r0.x * l;
  let u = a0.y + o0.y * a - r0.y * l;
  let h = a0.z + o0.z * a - r0.z * l;
  return c * c + u * u + h * h;
}
async function showcaseEnemies(i) {
  let e = await createEnemies(i);
  i.enemies = e;
  let t = (l, c, u) => new Vector3(l, c, u);
  let n = i.params.eshow || "both";
  let s = [3, 1.45, 3.9];
  let o = [.5, .95, 0];
  let r = 2.6;
  if (n === "gull") {
    e.spawn("gull", t(0, 1.6, 0), {
      passive: true,
      hover: 1.6,
      patrolRadius: .02,
      yaw: .7
    });
    s = [1.25, 1.95, 1.45];
    o = [0, 1.52, 0];
    r = 1.2;
  } else if (n === "hound") {
    e.spawn("hound", t(0, 0, 0), {
      passive: true,
      yaw: .9,
      patrolLine: [t(1.6, 0, 1.3), t(-1.6, 0, -1.3)]
    });
    s = [2.1, 1, 2.3];
    o = [.5, .62, .4];
    r = 1.25;
  } else if (n === "fight") {
    e.spawn("hound", t(-7, 0, -9), {
      state: "alert"
    });
    e.spawn("hound", t(8, 0, -7), {
      state: "alert"
    });
    e.spawn("hound", t(0, 0, -14), {
      state: "alert"
    });
    e.spawn("gull", t(-5, 6, -13), {
      state: "alert"
    });
    e.spawn("gull", t(9, 6, -11), {
      state: "alert"
    });
    s = [5, 2.6, 10];
    o = [0, 2.2, -5];
    r = 7;
  } else if (n === "dead") {
    let l = e.spawn("hound", t(0, 0, 0), {
      passive: true,
      yaw: .8
    });
    let c = e.spawn("gull", t(-1.6, 3.4, -.5), {
      passive: true,
      hover: 3.4,
      patrolRadius: .02
    });
    e.spawn("hound", t(2.2, 0, -1.6), {
      passive: true,
      yaw: -.6,
      patrolLine: [t(2.2, 0, -1.6), t(3.4, 0, -3)]
    });
    for (let u = 0; u < 30; u++) e.update(1 / 60);
    l.damage(999, l.pos, t(.6, 0, -.8), "body");
    for (let u = 0; u < 110; u++) e.update(1 / 60);
    c.damage(999, c.pos, t(0, 0, 1), "body");
    s = [2.6, 1.3, 3.2];
    o = [0, .5, 0];
    r = .42;
  } else {
    e.spawn("gull", t(-.9, 2.2, -.2), {
      passive: true,
      hover: 2.2,
      patrolRadius: .25,
      yaw: .5
    });
    e.spawn("hound", t(.2, 0, .6), {
      passive: true,
      yaw: 1.2,
      patrolLine: [t(2.6, 0, 1.2), t(-1.8, 0, .2)]
    });
  }
  i.params.epre != null && (r = +i.params.epre);
  for (let l = 0, c = Math.round(r * 60); l < c; l++) e.update(1 / 60);
  let a = !!i.params.efreeze;
  return {
    cam: s,
    target: o,
    update(l) {
      a || e.update(l);
    }
  };
}
export { ENEMY_TUNING, createEnemies, showcaseEnemies };
