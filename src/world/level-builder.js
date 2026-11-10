import { Box3, CanvasTexture, Group, LinearMipmapLinearFilter, MathUtils, Mesh, PlaneGeometry, THREE, Vector3 } from '../../vendor/three.js';
import { beveledBoxGeometry, boxGeometry, createMesh, cylinderGeometry, tubeGeometry } from '../geometry/primitives.js';
var cR = new Set(["traffic_cone", "jerry_can"]);
function createLevelBuilder(game) {
  let e = new Group();
  e.name = "level-static";
  let t = new Group();
  t.name = "level-dynamic";
  let n = [];
  let s = [];
  let o = [];
  let r = game.rng && game.rng.fork ? game.rng.fork() : Math.random;
  let a = (T, D) => T + (D - T) * r();
  let l = (T, D) => game.mats.get(T, D);
  let c = (T, D) => game.mats.get(T, {
    interior: true,
    ...(D || {})
  });
  let u = T => typeof T == "string" ? l(T) : T;
  function h(T, D, C = {}) {
    let G = createMesh(T, u(D), {
      cast: C.cast !== false,
      recv: C.recv !== false
    });
    C.p && G.position.set(C.p[0], C.p[1], C.p[2]);
    C.r && G.rotation.set(C.r[0] || 0, C.r[1] || 0, C.r[2] || 0);
    (C.parent || e).add(G);
    return G;
  }
  function f(T, D, C, G, j, N, Q, K = {}) {
    let ie = K.bevel ? beveledBoxGeometry(D, C, G, K.bevel) : boxGeometry(D, C, G);
    return h(ie, T, {
      ...K,
      p: [j, N, Q]
    });
  }
  function p(T, D, C, G, j, N, Q, K = {}) {
    return f(T, Math.abs(j - D), Math.abs(N - C), Math.abs(Q - G), (D + j) / 2, (C + N) / 2, (G + Q) / 2, K);
  }
  function d(T, D, C, G, j, N, Q = {}) {
    let K = cylinderGeometry(Q.rTop ?? D, D, C, Q.seg || 12, !!Q.open);
    let ie = Q.axis === "x" ? [0, 0, Math.PI / 2] : Q.axis === "z" ? [Math.PI / 2, 0, 0] : Q.r || [0, 0, 0];
    return h(K, T, {
      ...Q,
      p: [G, j, N],
      r: ie
    });
  }
  function v(T, D, C = .03, G = {}) {
    return h(tubeGeometry(D, C, G.radial || 6, false, G.tension ?? .5), T, G);
  }
  function g(T, D, C, G = .015, j = {}) {
    let N = new Vector3(...D);
    let Q = new Vector3(...C);
    let K = N.distanceTo(Q);
    let ie = cylinderGeometry(G, G, K, j.seg || 6);
    let F = h(ie, T, j);
    F.position.copy(N).add(Q).multiplyScalar(.5);
    F.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), Q.sub(N).normalize());
    return F;
  }
  function x(T, D, C, G, j, N, {
    depth: Q = .4,
    width: K = .2,
    tf: ie = .02,
    tw: F = .012,
    depthAxis: X = null,
    r: ne = null
  } = {}) {
    let re = new Group();
    re.position.set(G, j, N);
    ne && re.rotation.set(ne[0] || 0, ne[1] || 0, ne[2] || 0);
    let $ = X || (D === "y" ? "z" : "y");
    let ue = ["x", "y", "z"].find(P => P !== D && P !== $);
    let me = (P, V, Y) => {
      let L = {};
      L[D] = P;
      L[$] = V;
      L[ue] = Y;
      return [L.x, L.y, L.z];
    };
    let ee = P => {
      let V = {
        x: 0,
        y: 0,
        z: 0
      };
      V[$] = P;
      return [V.x, V.y, V.z];
    };
    let B = u(T);
    for (let P of [-1, 1]) h(boxGeometry(...me(C, ie, K)), B, {
      parent: re,
      p: ee(P * (Q / 2 - ie / 2))
    });
    h(boxGeometry(...me(C, Q - 2 * ie, F)), B, {
      parent: re
    });
    e.add(re);
    return re;
  }
  function y(T, D, C, G, j, N, Q = "z+", K = 0) {
    let ie = new PlaneGeometry(D, C);
    let F = new Mesh(ie, T);
    F.castShadow = false;
    F.receiveShadow = true;
    F.position.set(G, j, N);
    Q === "z-" ? F.rotation.y = Math.PI : Q === "x+" ? F.rotation.y = Math.PI / 2 : Q === "x-" ? F.rotation.y = -Math.PI / 2 : Q === "y+" && (F.rotation.x = -Math.PI / 2, F.rotation.z = K);
    e.add(F);
    return F;
  }
  function b(T, D, C, G, j, N, Q) {
    try {
      let K = game.mats.decal(T);
      return !K || !K.material ? null : y(K.material, D, D / (K.aspect || 1), C, G, j, N, Q);
    } catch {
      return null;
    }
  }
  function m(T, D, C, G, j, N, Q) {
    try {
      let K = game.mats.label(T, Q || {});
      return !K || !K.material ? null : y(K.material, D * (K.aspect || 4), D, C, G, j, N);
    } catch {
      return null;
    }
  }
  function A(T, D, C, G, j, N, Q = "concrete", K = {}) {
    return game.physics.addBox([T, D, C], [G, j, N], {
      surface: Q,
      ...K
    });
  }
  let _ = new Box3();
  function M(T, D, C = {}) {
    let G = T.userData.colliders || [];
    let j = Math.abs(Math.sin(2 * D)) > .2;
    for (let N of G) {
      let Q = [N];
      if (j) {
        let K = N.max[0] - N.min[0];
        let ie = N.max[2] - N.min[2];
        let F = K >= ie ? 0 : 2;
        let X = Math.max(K, ie);
        let ne = Math.max(.25, Math.min(K, ie));
        let re = Math.min(10, Math.max(1, Math.round(X / ne)));
        if (re > 1) {
          Q = [];
          for (let $ = 0; $ < re; $++) {
            let ue = N.min.slice();
            let me = N.max.slice();
            ue[F] = N.min[F] + X * $ / re;
            me[F] = N.min[F] + X * ($ + 1) / re;
            Q.push({
              min: ue,
              max: me,
              surface: N.surface
            });
          }
        }
      }
      for (let K of Q) if (_.min.set(K.min[0], K.min[1], K.min[2]), _.max.set(K.max[0], K.max[1], K.max[2]), _.applyMatrix4(T.matrixWorld), !(_.max.y - _.min.y < .2 && _.max.y < .3)) {
        if (j) {
          let ie = (_.max.x - _.min.x) * .07;
          let F = (_.max.z - _.min.z) * .07;
          _.min.x += ie;
          _.max.x -= ie;
          _.min.z += F;
          _.max.z -= F;
        }
        game.physics.addBox(_.min, _.max, {
          surface: K.surface || N.surface || "metal",
          ...(C.colOpts || {})
        });
      }
    }
  }
  function E(T, D, C, G = 0, j = {}, N = 0, Q = {}) {
    let K = game.props.build(T, j);
    K.position.set(D, N, C);
    K.rotation.y = G;
    (Q.dynamic ? t : e).add(K);
    K.updateMatrixWorld(true);
    !Q.noCol && !cR.has(T) && M(K, G, Q);
    typeof K.userData.update == "function" && s.push(ie => K.userData.update(ie));
    o.push({
      name: T,
      x: D,
      y: N,
      z: C,
      yaw: G
    });
    return K;
  }
  function w(T, D, C = 0, G = 0, j = {}) {
    let N = E("stairs_metal", T, D, C, j, G);
    let Q = Math.abs(Math.cos(C)) > .5;
    n.push(Q ? [T - 1.5, D - .5, T + 1.5, D + .5] : [T - .5, D - 1.5, T + .5, D + 1.5]);
    return N;
  }
  function S(T, D, C = 0, G = 0, j = {}, N = [true, true]) {
    let Q = N[0] && N[1] ? "both" : N[0] ? "left" : N[1] ? "right" : "none";
    let K = E("catwalk", T, D, C, {
      ...j,
      rails: Q
    }, G);
    let ie = Math.abs(Math.cos(C)) > .5;
    let F = ie ? 1.5 : .6;
    let X = ie ? .6 : 1.5;
    n.push([T - F, D - X, T + F, D + X]);
    return K;
  }
  let z = {
    20: "container20",
    40: "container40",
    hc: "container40hc"
  };
  let H = {
    container20: 2.59,
    container40: 2.59,
    container40hc: 2.9
  };
  let O = {
    container20: 6.06,
    container40: 12.19,
    container40hc: 12.19
  };
  function q(T, D, C, G = 0, j = 1) {
    let N = 0;
    let Q = [];
    for (let K = 0; K < C.length; K++) {
      let [ie, F, X = {}] = C[K];
      let ne = z[ie];
      let re = (X.dx || 0) + (K ? a(-.05, .05) * j : 0);
      let $ = (X.dz || 0) + (K ? a(-.04, .04) * j : 0);
      let ue = G + a(-1, 1) * .022 * j * (K ? .6 : 1) + (X.flip ? Math.PI : 0);
      let me = E(ne, T + re, D + $, ue, {
        color: F,
        seed: Math.floor(a(1, 99999)),
        wear: X.wear ?? a(.2, .85),
        doors: X.doors || 0
      }, N);
      let ee = O[ne];
      let B = H[ne];
      let P = Math.abs(Math.cos(G)) > .5;
      let V = (P ? ee : 2.44) / 2;
      let Y = (P ? 2.44 : ee) / 2;
      if (n.push([T + re - V, D + $ - Y, T + re + V, D + $ + Y]), X.reefer) {
        let L = -(ee / 2 + .2);
        let Z = Math.cos(ue);
        let J = Math.sin(ue);
        E("reefer_unit", T + re + L * Z, D + $ - L * J, ue, {
          seed: K + 3
        }, N + .14);
      }
      Q.push(me);
      N += B;
    }
    return {
      top: N,
      objs: Q
    };
  }
  function U(T, D) {
    for (let C of n) if (T >= C[0] && T <= C[2] && D >= C[1] && D <= C[3]) return true;
    return false;
  }
  return {
    G: game,
    THREE: THREE,
    staticRoot: e,
    dynRoot: t,
    metalRects: n,
    updaters: s,
    placed: o,
    rng: r,
    rnd: a,
    M: l,
    MI: c,
    add: h,
    box: f,
    slab: p,
    cyl: d,
    tube: v,
    rod: g,
    ibeam: x,
    quad: y,
    decal: b,
    label: m,
    col: A,
    place: E,
    stairs: w,
    catwalk: S,
    stack: q,
    isMetal: U
  };
}
var Dr = 4;
function atlasLabels(i, {
  scale: e = .5,
  maxW: t = 2048
} = {}) {
  let n = {
    count: 0,
    material: null,
    update() {}
  };
  if (typeof document > "u") return n;
  let s = new Map();
  if (i.traverse(b => {
    if (!b.isMesh || Array.isArray(b.material)) return;
    let m = b.material;
    if (!m || m.name !== "label" || !m.map || !m.map.image || !m.map.image.width) return;
    let A = b;
    let _ = false;
    for (; A;) {
      if (A.userData && A.userData.noMerge) {
        _ = true;
        break;
      }
      A = A.parent;
    }
    _ || (s.has(m) || s.set(m, []), s.get(m).push(b));
  }), s.size < 2) return n;
  let o = [...s.keys()].map(b => {
    let m = b.map.image;
    return {
      m: b,
      img: m,
      w: Math.max(4, Math.ceil(m.width * e)),
      h: Math.max(4, Math.ceil(m.height * e))
    };
  });
  o.sort((b, m) => m.h - b.h || m.w - b.w);
  let r = 0;
  let a = 0;
  let l = 0;
  for (let b of o) {
    let m = Math.min(b.w, t - 2 * Dr);
    m < b.w && (b.h = Math.max(4, Math.round(b.h * m / b.w)), b.w = m);
    r + b.w + 2 * Dr > t && (r = 0, a += l, l = 0);
    b.x = r + Dr;
    b.y = a + Dr;
    r += b.w + 2 * Dr;
    l = Math.max(l, b.h + 2 * Dr);
  }
  let c = t;
  let u = MathUtils.ceilPowerOfTwo(Math.max(16, a + l));
  if (u > 4096) return n;
  let h = document.createElement("canvas");
  h.width = c;
  h.height = u;
  let f = h.getContext("2d");
  let p = () => {
    f.setTransform(1, 0, 0, 1, 0, 0);
    f.globalAlpha = 1;
    f.globalCompositeOperation = "source-over";
    f.clearRect(0, 0, c, u);
    for (let b of o) {
      f.drawImage(b.img, b.x - Dr, b.y - Dr, b.w + 2 * Dr, b.h + 2 * Dr);
      f.clearRect(b.x, b.y, b.w, b.h);
      f.drawImage(b.img, b.x, b.y, b.w, b.h);
      b.version = b.m.map.version;
    }
  };
  p();
  let d = o[0].m;
  let v = new CanvasTexture(h);
  v.colorSpace = d.map.colorSpace;
  v.anisotropy = d.map.anisotropy;
  v.generateMipmaps = true;
  v.minFilter = LinearMipmapLinearFilter;
  let g = d.clone();
  g.map = v;
  g.name = "label_atlas";
  let x = new Map();
  for (let b of o) {
    let m = b.x / c;
    let A = (b.x + b.w) / c;
    let _ = 1 - b.y / u;
    let M = 1 - (b.y + b.h) / u;
    for (let E of s.get(b.m)) {
      let w = E.geometry.uuid + "|" + b.m.uuid;
      let S = x.get(w);
      if (!S) {
        S = E.geometry.clone();
        let z = S.attributes.uv;
        if (z) {
          for (let H = 0; H < z.count; H++) z.setXY(H, m + MathUtils.clamp(z.getX(H), 0, 1) * (A - m), M + MathUtils.clamp(z.getY(H), 0, 1) * (_ - M));
          z.needsUpdate = true;
        }
        x.set(w, S);
      }
      E.geometry = S;
      E.material = g;
    }
  }
  let y = 0;
  return {
    count: o.length,
    material: g,
    size: [c, u],
    update(b) {
      if (!(y > 8)) {
        y += b;
        for (let m of o) if (m.m.map.version !== m.version) {
          p();
          v.needsUpdate = true;
          break;
        }
      }
    }
  };
}
export { atlasLabels, createLevelBuilder };
