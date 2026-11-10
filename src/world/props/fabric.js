import { At, Ge, Kn, M1, eo, ev, gn, gr, to, tt, vr, zi } from './geometry.js';
import { THREE } from '../../../vendor/three.js';
import { S1 } from './cargo.js';
import { boxGeometry, tubeGeometry } from '../../geometry/primitives.js';
var Q3 = (i, e, t) => {
  let n = zi((t - i) / (e - i), 0, 1);
  return n * n * (3 - 2 * n);
};
function nv(i, e, t = 0, n = 0) {
  let s = new THREE.PlaneGeometry(i, e);
  let o = s.attributes.uv;
  let r = s.attributes.position;
  for (let a = 0; a < o.count; a++) o.setXY(a, r.getX(a) + t, r.getY(a) + n);
  return s;
}
function QA(i, e) {
  let t = new Kn(i, "tarp_cargo", e.seed || 0);
  let n = t.rng;
  let s = t.seed * 1.7;
  let o = .144;
  let r = [[-1.06, -.12, -.58, .58, n.range(.98, 1.12)], [-.06, 1.06, -.58, .12, n.range(1.32, 1.42)], [.02, .62, .16, .58, n.range(.72, .86)], [.66, 1.06, .18, .56, n.range(.5, .62)]];
  for (let N of [-.6, .6]) {
    t.push({
      p: [N, 0, 0],
      r: [0, 0, 0]
    });
    S1(t, n, {
      stamp: false
    });
    t.pop();
  }
  for (let N of r) {
    let Q = N[1] - N[0];
    let K = N[3] - N[2];
    let ie = N[4] - o;
    let F = (N[0] + N[1]) / 2;
    let X = (N[2] + N[3]) / 2;
    let ne = n.range(.7, .95);
    t.add("wood_pallet", Ge(Q, ie, K, .006), {
      p: [F, o + ie / 2, X]
    }, [ne, ne * .95, ne * .88]);
    t.add("wood_pallet", boxGeometry(Q + .012, .07, K + .012), {
      p: [F, o + .04, X]
    }, ne * .75);
  }
  let a = 1.9;
  let l = 22;
  let c = 14;
  let u = -1.125;
  let h = 1.125;
  let f = -.645;
  let p = .645;
  let d = 5;
  let v = (N, Q) => {
    let K = .3;
    for (let ie of r) {
      let F = Math.max(ie[0] - N, 0, N - ie[1]);
      let X = Math.max(ie[2] - Q, 0, Q - ie[3]);
      let ne = Math.hypot(F, X);
      K = Math.max(K, ie[4] - .95 * ne - .9 * ne * ne);
    }
    return K + .016 + .022 * gn(N * 5 + s, Q * 5) + .008 * Math.sin(N * 23 + Q * 7 + s) + .006 * Math.sin(Q * 31 - N * 5);
  };
  let g = [];
  let x = [];
  let y = [];
  let b = (N, Q) => Q * (l + 1) + N;
  for (let N = 0; N <= c; N++) for (let Q = 0; Q <= l; Q++) {
    let K = u + (h - u) * Q / l;
    let ie = f + (p - f) * N / c;
    g.push(K, v(K, ie), ie);
    x.push(K * a, ie * a);
  }
  for (let N = 0; N < c; N++) for (let Q = 0; Q < l; Q++) {
    let K = b(Q, N);
    let ie = b(Q + 1, N);
    let F = b(Q + 1, N + 1);
    let X = b(Q, N + 1);
    y.push(K, X, ie, ie, X, F);
  }
  let m = [];
  for (let N = 0; N < l; N++) m.push([N, 0, 0, -1]);
  for (let N = 0; N < c; N++) m.push([l, N, 1, 0]);
  for (let N = l; N > 0; N--) m.push([N, c, 0, 1]);
  for (let N = c; N > 0; N--) m.push([0, N, -1, 0]);
  let A = m.length;
  let _ = (l + 1) * (c + 1);
  let M = new Map();
  let E = n() * A;
  m.forEach((N, Q) => {
    M.set(N[0] + "," + N[1], Q);
    let K = (N[0] === 0 || N[0] === l) && (N[1] === 0 || N[1] === c);
    let ie = N[2];
    let F = N[3];
    K && (ie = N[0] === 0 ? -.707 : .707, F = N[1] === 0 ? -.707 : .707);
    let X = b(N[0], N[1]);
    let ne = g[X * 3];
    let re = g[X * 3 + 1];
    let $ = g[X * 3 + 2];
    let ue = Math.abs(Q - E);
    ue = Math.min(ue, A - ue);
    let me = .17 + .07 * Math.sin(Q * .55 + s) + .07 * gn(Q * .31 + s, 2.2) + .3 * Math.exp(-ue * ue / 14);
    let ee = n() * 6;
    for (let B = 1; B <= d; B++) {
      let P = B / d;
      let V = re + (me - re) * (.25 * P + .75 * P * P) - (B === 1 ? .02 : 0);
      let Y = (N[0] === 5 || N[0] === 16) && N[2] === 0 ? .035 * Math.sin(Math.PI * P) : 0;
      let L = P * (.04 * Math.sin(Q * 1.7 + ee * .2) + .028 * Math.sin(Q * .83 + 1.3 + s)) + .02 * P * gn(Q * .8, B * .9 + s) - Y;
      let Z = (B === 1 ? .028 : .04 + .03 * P) + L + (K ? .012 * P : 0);
      let J = zi(ne + ie * Z, -1.2, 1.2);
      let oe = zi($ + F * Z, -.7, .7);
      let fe = re - V;
      g.push(J, V, oe);
      x.push((ne + ie * (Z + fe)) * a, ($ + F * (Z + fe)) * a);
    }
  });
  let w = (N, Q) => Q === 0 ? b(m[N][0], m[N][1]) : _ + N * d + (Q - 1);
  for (let N = 0; N < A; N++) for (let Q = 0; Q < d; Q++) {
    let K = (N + 1) % A;
    let ie = w(N, Q);
    let F = w(K, Q);
    let X = w(K, Q + 1);
    let ne = w(N, Q + 1);
    y.push(ie, F, ne, F, X, ne);
  }
  let S = new THREE.BufferGeometry();
  S.setAttribute("position", new THREE.BufferAttribute(new Float32Array(g), 3));
  S.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(x), 2));
  S.setIndex(y);
  S.computeVertexNormals();
  let z = S.attributes.normal;
  let H = S.attributes.position;
  let O = (N, Q) => [H.getX(N) + z.getX(N) * Q, H.getY(N) + z.getY(N) * Q, H.getZ(N) + z.getZ(N) * Q];
  let q = [];
  for (let N of [5, 16]) {
    let Q = [];
    let K = M.get(N + ",0");
    let ie = M.get(N + "," + c);
    Q.push([H.getX(w(K, d)), .11, -.52]);
    for (let F = d; F >= 1; F--) Q.push(O(w(K, F), .007));
    for (let F = 0; F <= c; F++) Q.push(O(b(N, F), .007));
    for (let F = 1; F <= d; F++) Q.push(O(w(ie, F), .007));
    Q.push([H.getX(w(ie, d)), .11, .52]);
    q.push(Q);
  }
  let U = 6;
  let T = [];
  let D = M.get("0," + U);
  let C = M.get(l + "," + U);
  T.push([-1.1, .1, H.getZ(w(D, d))]);
  for (let N = d; N >= 1; N -= 2) T.push(O(w(D, N), .012));
  for (let N = 0; N <= l; N += 2) T.push(O(b(N, U), .012));
  for (let N = 1; N <= d; N += 2) T.push(O(w(C, N), .012));
  T.push([1.1, .1, H.getZ(w(C, d))]);
  t.add(t.mat("tarp", {
    doubleSide: true
  }), S, null, (N, Q, K) => {
    let ie = gn(N * 2.3 + s, Q * 2.3, K * 2.3);
    let F = gn(N * 11, Q * 11, K * 11 + s);
    return (.72 + .28 * ie) * (.9 + .1 * F) * (.8 + .2 * Q3(.15, .6, Q));
  });
  for (let N of q) {
    t.add("paint_orange", vr(N, [.024, 0, 0]), null, [1, .82, .5]);
    let Q = N[N.length - 4];
    t.add("steel_worn", Ge(.065, .1, .03, .006), {
      p: [Q[0], Q[1], Q[2] + .014],
      r: [.25, 0, 0]
    }, .8);
    t.add("steel_dark", Ge(.02, .09, .012, .003), {
      p: [Q[0] + .03, Q[1] + .06, Q[2] + .04],
      r: [.9, 0, 0]
    }, .8);
  }
  t.add("rope", tubeGeometry(T, .009, 4, false, .5), null, .85);
  let G = [2.4, 1.5, 1.4];
  let j = Math.max(...r.map(N => N[4])) + .04;
  return t.finish({
    size: G,
    colliders: [{
      min: [-1.2, 0, -.7],
      max: [1.2, j, .7],
      surface: "dirt"
    }]
  });
}
function eR(i, e, t, n) {
  let s = ev(eo(i, e, t, Math.min(e * .46, .075), 3, 3, 3), 3);
  let o = n() * 9;
  let r = n.range(-.05, .05);
  let a = n.range(.4, 1);
  to(s, l => {
    let c = l.x / (i / 2);
    let u = l.z / (t / 2);
    let h = l.y / (e / 2);
    let f = 1 - .22 * Math.pow(Math.abs(c), 2.5);
    l.z *= f * (h < 0 ? 1.05 : 1);
    l.y = (l.y + e / 2) * (1 - .3 * Math.pow(Math.abs(c), 3)) - e / 2;
    h > 0 && (l.y += .016 * Math.cos(tt * c) * Math.cos(tt * u));
    l.y -= a * .018 * Math.abs(c) * Math.abs(c) * (h > -.9 ? 1 : 0) + r * l.x * .3;
    let p = gn(l.x * 9 + o, l.y * 9, l.z * 9 + o) - .5;
    l.x += p * .014;
    l.z += p * .016;
    h > -.9 && (l.y += p * .014);
  });
  return gr(s);
}
function tR(i, e) {
  let t = new Kn(i, "sandbags", e.seed || 0);
  let n = t.rng;
  let s = .18;
  let o = zi(e.courses | 0 || 5, 1, 7);
  let r = t.mat(K3[0], K3[1]);
  let a = (l, c, u, h) => {
    let f = s * n.range(1.02, 1.12);
    let p = n() < .3 ? n.range(.55, .75) : n.range(.82, 1);
    let d = n() * 30;
    let v = {
      p: [u[0] + n.range(-.012, .012), u[1] + f / 2 - .004, u[2] + n.range(-.012, .012)],
      r: [n.range(-.03, .03), h + n.range(-.06, .06), 0]
    };
    t.add(r, eR(l, f, c, n), v, (g, x, y) => {
      let b = gn(g * 7 + d, x * 7, y * 7);
      return [p * (.85 + .15 * b), p * (.84 + .15 * b), p * (.8 + .16 * b)];
    });
    for (let g of [1, -1]) t.add(r, vr([[g * (l / 2 - .004), n.range(-.008, .008), -c * .27], [g * (l / 2 - .002), n.range(-.008, .008), c * .27]], [g * .009, .001, 0]), v, p * .9);
  };
  for (let l = 0; l < o; l++) {
    let c = l * s;
    let u = l === o - 1;
    if (l % 2 === 0) for (let h = 0; h < 3; h++) for (let f of [1, -1]) u && h === 2 && f === 1 && o > 2 || a(.655, .3, [(h - 1) * .655, c, f * .148], 0);else for (let h = 0; h < 5; h++) u && h === 0 && o > 2 || a(.585, .385, [(h - 2) * .392, c, 0], tt);
  }
  return t.finish({
    size: [2, o * s, .6],
    surface: "dirt"
  });
}
var K3 = ["glove_fabric", {
  color: 9207134
}];
function Oc(i, e, t, n, s, {
  crush: o = 0,
  damp: r = .3,
  open: a = false,
  tape: l = true,
  label: c = "",
  arrow: u = false,
  tint: h = 1
} = {}) {
  let f = i.rng;
  let p = i.G;
  let d = f() * 40;
  i.push(s);
  let v = _ => {
    if (!o) return;
    let M = zi(_.y / t, 0, 1);
    let E = M * M;
    _.y -= o * t * .32 * E * (.55 + .45 * Math.cos(At * _.x / e * .9 + .5)) * (.8 + .2 * Math.cos(At * _.z / n));
    _.z *= 1 + .1 * o * Math.sin(At * M);
    _.x += .12 * o * t * M + .02 * o * Math.sin(At * M) * Math.sign(_.x);
  };
  let g = eo(e, t, n, .007, 4, 5, 4, "bottom");
  a && ev(g, 2);
  o && (to(g, v), gr(g));
  let x = r * t;
  let y = (_, M, E) => {
    let w = gn(_ * 6 + d, M * 3, E * 6 + d);
    let S = Q3(x - .03, x + .04, M + .08 * (w - .5));
    let z = (.86 + .14 * gn(_ * 13, M * 13 + d, E * 13)) * h;
    return [z * (.5 + .5 * S), z * (.47 + .53 * S), z * (.42 + .58 * S)];
  };
  {
    let _ = g.attributes.position;
    let M = new Float32Array(_.count * 3);
    for (let E = 0; E < _.count; E++) {
      let w = y(_.getX(E), _.getY(E), _.getZ(E));
      M[E * 3] = w[0];
      M[E * 3 + 1] = w[1];
      M[E * 3 + 2] = w[2];
    }
    g.setAttribute("color", new THREE.BufferAttribute(M, 3));
  }
  i.add("cardboard", g);
  let b = .0025;
  if (a) {
    let _ = Math.min(.16, t * .6);
    i.add("cardboard", nv(e - .012, n - .012), {
      p: [0, t - _, 0],
      r: [-tt, 0, 0]
    }, .45 * h);
    for (let [E, w, S] of [[0, e, n / 2], [At, e, n / 2], [tt, n, e / 2], [-tt, n, e / 2]]) i.add("cardboard", M1(nv(w - .012, _)), {
      p: [Math.sin(E) * (S - .006), t - _ / 2, Math.cos(E) * (S - .006)],
      r: [0, E, 0]
    }, .55 * h);
    let M = (E, w, S) => {
      let z = Math.sin(S);
      let H = Math.cos(S);
      return [E, w, z, H];
    };
    for (let E of [1, -1]) {
      let w = f.range(.3, 1.9);
      let S = n / 2 - .01;
      i.add("cardboard", vr([[0, t, E * n / 2], [0, t + Math.sin(w) * S * .5, E * (n / 2 + Math.cos(w) * S * .5)], [0, t + Math.sin(w) * S, E * (n / 2 + Math.cos(w) * S + .01)]], [e / 2 - .004, 0, 0]), null, .9 * h);
    }
    for (let E of [1, -1]) {
      let w = f.range(.9, 2.3);
      let S = n / 2 - .02;
      i.add("cardboard", vr([[E * e / 2, t, 0], [E * (e / 2 + Math.cos(w) * S), t + Math.sin(w) * S, 0]], [0, 0, n / 2 - .004]), null, .82 * h);
    }
  } else if (l) {
    let M = [];
    M.push([-e / 2 - b, t - .075, 0]);
    for (let w = 0; w <= 8; w++) M.push([(-.5 + w / 8) * (e + 2 * b), t + b, 0]);
    M.push([e / 2 + b, t - .075, 0]);
    let E = new THREE.Vector3();
    for (let w of M) {
      E.set(w[0], w[1], w[2]);
      v(E);
      w[0] = E.x;
      w[1] = E.y + (o ? .004 : 0);
      w[2] = E.z;
    }
    i.add("polymer_tan", vr(M, [0, 0, .025], false), null, .9);
  }
  let m = n / 2 + b;
  let A = Math.min(.055, t * .2);
  if (c && !o && (i.label(c, {
    color: "black",
    font: "sans",
    distress: .3
  }, e * .6, A, {
    p: [-e * .1, t * .62, m]
  }), i.add("paint_white", nv(.11, .075), {
    p: [e * .26, t * .3, m - .001]
  }, .9, {
    cast: false
  }), i.decal(p.mats.decal("numbers_0_9"), .095, {
    p: [e * .26, t * .3, m + 6e-4]
  })), u && !o) for (let _ of [1, -1]) i.decal(p.mats.decal("arrow"), Math.min(.09, t * .3), {
    p: [_ * (e / 2 + b), t * .55, _ * n * .2],
    r: [0, _ * tt, tt]
  });
  i.pop();
}
function nR(i, e) {
  let t = new Kn(i, "cardboard_boxes", e.seed || 0);
  let n = t.rng;
  let s = () => n.range(-.015, .015);
  let o = () => n.range(.82, 1);
  Oc(t, .5, .38, .44, {
    p: [-.23 + s(), 0, -.16 + s()],
    r: [0, n.range(-.05, .05), 0]
  }, {
    damp: .45,
    label: "FRAGILE",
    arrow: true,
    tint: o()
  });
  Oc(t, .42, .33, .4, {
    p: [.26 + s(), 0, -.17 + s()],
    r: [0, n.range(-.08, .08), 0]
  }, {
    damp: .5,
    label: "KEEP DRY",
    tint: o()
  });
  Oc(t, .46, .28, .4, {
    p: [-.24 + s(), .38, -.15 + s()],
    r: [0, n.range(-.2, .2), 0]
  }, {
    crush: 1,
    damp: .75,
    tint: o() * .92
  });
  Oc(t, .33, .26, .32, {
    p: [.27 + s(), .33, -.18 + s()],
    r: [0, n.range(-.3, .3), 0]
  }, {
    open: true,
    damp: .1,
    label: "",
    arrow: true,
    tint: o()
  });
  Oc(t, .3, .16, .24, {
    p: [-.26 + s(), .565, -.16 + s()],
    r: [.03, n.range(-.5, .5), -.09]
  }, {
    damp: .2,
    label: "HX-2291",
    tint: o()
  });
  Oc(t, .36, .26, .3, {
    p: [.06 + s(), .105, .2],
    r: [.62, n.range(-.25, .25), 0]
  }, {
    damp: .9,
    crush: .25,
    tint: o() * .85
  });
  return t.finish();
}
function eb(i) {
  i("tarp_cargo", (e, t = {}) => QA(e, t));
  i("sandbags", (e, t = {}) => tR(e, t));
  i("cardboard_boxes", (e, t = {}) => nR(e, t));
}
export { eb };
