import { BufferAttribute, BufferGeometry, Color, Euler, Group, LatheGeometry, MathUtils, Matrix4, Mesh, PlaneGeometry, Quaternion, SphereGeometry, Vector2, Vector3 } from '../../../vendor/three.js';
import { boxGeometry, colorGeometry, cylinderGeometry, mergeGeometryList, tubeGeometry } from '../../geometry/primitives.js';
import { PROP_SIZES, registerProp } from './registry.js';
function $a(i) {
  let e = (i | 0) * 2654435761 | 0;
  return () => {
    e = e + 1831565813 | 0;
    let t = Math.imul(e ^ e >>> 15, 1 | e);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function h1(i, e) {
  let t = Math.sin(i * 127.1 + e * 311.7) * 43758.5453;
  return t - Math.floor(t);
}
function ri(i, e) {
  let t = Math.floor(i);
  let n = Math.floor(e);
  let s = i - t;
  let o = e - n;
  let r = s * s * (3 - 2 * s);
  let a = o * o * (3 - 2 * o);
  let l = h1(t, n);
  let c = h1(t + 1, n);
  let u = h1(t, n + 1);
  let h = h1(t + 1, n + 1);
  return l + (c - l) * r + (u - l) * a + (l - c - u + h) * r * a;
}
var RA = i => Math.max(0, Math.min(1, i));
var mn = (i, e, t) => {
  let n = RA((t - i) / (e - i));
  return n * n * (3 - 2 * n);
};
var Ir = (i, e, t) => [i[0] + (e[0] - i[0]) * t, i[1] + (e[1] - i[1]) * t, i[2] + (e[2] - i[2]) * t];
function p3(i, e, t, n = .01, s = "center") {
  n = Math.max(5e-4, Math.min(n, i / 2 - 1e-4, e / 2 - 1e-4, t / 2 - 1e-4));
  let o = i / 2;
  let r = e / 2;
  let a = t / 2;
  let l = new Float32Array(72);
  let c = new Float32Array(72);
  let u = new Float32Array(48);
  let h = (x, y, b, m) => ((x > 0 ? 1 : 0) + (y > 0 ? 2 : 0) + (b > 0 ? 4 : 0)) * 3 + m;
  for (let x of [-1, 1]) for (let y of [-1, 1]) for (let b of [-1, 1]) {
    let m = [[x * o, y * (r - n), b * (a - n)], [x * (o - n), y * r, b * (a - n)], [x * (o - n), y * (r - n), b * a]];
    let A = [[x, 0, 0], [0, y, 0], [0, 0, b]];
    for (let _ = 0; _ < 3; _++) {
      let M = h(x, y, b, _);
      l.set(m[_], M * 3);
      c.set(A[_], M * 3);
      _ === 0 ? (u[M * 2] = m[_][2], u[M * 2 + 1] = m[_][1]) : _ === 1 ? (u[M * 2] = m[_][0], u[M * 2 + 1] = m[_][2]) : (u[M * 2] = m[_][0], u[M * 2 + 1] = m[_][1]);
    }
  }
  let f = [];
  let p = (x, y, b) => {
    let m = l[x * 3];
    let A = l[x * 3 + 1];
    let _ = l[x * 3 + 2];
    let M = l[y * 3] - m;
    let E = l[y * 3 + 1] - A;
    let w = l[y * 3 + 2] - _;
    let S = l[b * 3] - m;
    let z = l[b * 3 + 1] - A;
    let H = l[b * 3 + 2] - _;
    let O = E * H - w * z;
    let q = w * S - M * H;
    let U = M * z - E * S;
    let T = m + (M + S) / 3;
    let D = A + (E + z) / 3;
    let C = _ + (w + H) / 3;
    O * T + q * D + U * C >= 0 ? f.push(x, y, b) : f.push(x, b, y);
  };
  let d = (x, y, b, m) => {
    p(x, y, b);
    p(x, b, m);
  };
  let v = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (let x of [-1, 1]) {
    d(...v.map(([y, b]) => h(x, y, b, 0)));
    d(...v.map(([y, b]) => h(y, x, b, 1)));
    d(...v.map(([y, b]) => h(y, b, x, 2)));
  }
  for (let x of [-1, 1]) for (let y of [-1, 1]) {
    d(h(-1, x, y, 1), h(1, x, y, 1), h(1, x, y, 2), h(-1, x, y, 2));
    d(h(x, -1, y, 0), h(x, 1, y, 0), h(x, 1, y, 2), h(x, -1, y, 2));
    d(h(x, y, -1, 0), h(x, y, 1, 0), h(x, y, 1, 1), h(x, y, -1, 1));
  }
  for (let x of [-1, 1]) for (let y of [-1, 1]) for (let b of [-1, 1]) p(h(x, y, b, 0), h(x, y, b, 1), h(x, y, b, 2));
  let g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(l, 3));
  g.setAttribute("normal", new BufferAttribute(c, 3));
  g.setAttribute("uv", new BufferAttribute(u, 2));
  g.setIndex(f);
  s === "bottom" && g.translate(0, e / 2, 0);
  return g;
}
function m3(i, e, t, n, s, o) {
  let r = 0;
  for (let a = t; a < n; a += 9) {
    let l = i[a + 3] - i[a];
    let c = i[a + 4] - i[a + 1];
    let u = i[a + 5] - i[a + 2];
    let h = i[a + 6] - i[a];
    let f = i[a + 7] - i[a + 1];
    let p = i[a + 8] - i[a + 2];
    let d = c * p - u * f;
    let v = u * h - l * p;
    let g = l * f - c * h;
    r += d * ((i[a] + i[a + 3] + i[a + 6]) / 3 - s[0]) + v * ((i[a + 1] + i[a + 4] + i[a + 7]) / 3 - s[1]) + g * ((i[a + 2] + i[a + 5] + i[a + 8]) / 3 - s[2]);
  }
  if (r < 0 != !!o) for (let a = t; a < n; a += 9) {
    for (let c = 0; c < 3; c++) {
      let u = i[a + 3 + c];
      i[a + 3 + c] = i[a + 6 + c];
      i[a + 6 + c] = u;
    }
    let l = a / 3 * 2;
    for (let c = 0; c < 2; c++) {
      let u = e[l + 2 + c];
      e[l + 2 + c] = e[l + 4 + c];
      e[l + 4 + c] = u;
    }
  }
}
function la(i, e, t, {
  closed: n = false,
  center: s = null,
  inward: o = false,
  caps: r = false
} = {}) {
  let a = [];
  let l = [];
  let c = i.length;
  let u = n ? c : c - 1;
  let h = [0];
  for (let g = 0; g < u; g++) {
    let x = i[g];
    let y = i[(g + 1) % c];
    h.push(h[g] + Math.hypot(y[0] - x[0], y[1] - x[1]));
  }
  for (let g = 0; g < e.length - 1; g++) {
    let x = e[g];
    let y = e[g + 1];
    for (let b = 0; b < u; b++) {
      let m = i[b];
      let A = i[(b + 1) % c];
      let _ = t(m[0], m[1], x, g);
      let M = t(A[0], A[1], x, g);
      let E = t(A[0], A[1], y, g + 1);
      let w = t(m[0], m[1], y, g + 1);
      a.push(..._, ...M, ...E, ..._, ...E, ...w);
      l.push(h[b], x, h[b + 1], x, h[b + 1], y, h[b], x, h[b + 1], y, h[b], y);
    }
  }
  let f = a.length;
  let p = null;
  let d = () => {
    if (s) return s;
    if (!p) {
      p = [0, 0, 0];
      for (let x = 0; x < f; x += 3) {
        p[0] += a[x];
        p[1] += a[x + 1];
        p[2] += a[x + 2];
      }
      let g = 3 / f;
      p[0] *= g;
      p[1] *= g;
      p[2] *= g;
    }
    return p;
  };
  if (m3(a, l, 0, f, d(), o), r && n) {
    let g = 0;
    let x = 0;
    for (let y of i) {
      g += y[0];
      x += y[1];
    }
    g /= c;
    x /= c;
    for (let y of [0, e.length - 1]) {
      let b = a.length;
      let m = e[y];
      let A = t(g, x, m, y);
      for (let _ = 0; _ < c; _++) {
        let M = i[_];
        let E = i[(_ + 1) % c];
        a.push(...A, ...t(M[0], M[1], m, y), ...t(E[0], E[1], m, y));
        l.push(g, x, M[0], M[1], E[0], E[1]);
      }
      m3(a, l, b, a.length, d(), o);
    }
  }
  let v = new BufferGeometry();
  v.setAttribute("position", new BufferAttribute(new Float32Array(a), 3));
  v.setAttribute("uv", new BufferAttribute(new Float32Array(l), 2));
  v.computeVertexNormals();
  return v;
}
function CA(i, e, t, n, s) {
  let o = i % e;
  o < 0 && (o += e);
  let r = e - n - 2 * s;
  return o <= n ? 0 : o < n + s ? -t * (o - n) / s : o <= n + s + r ? -t : -t * (1 - (o - n - s - r) / s);
}
function Uc(i, e, t, n, s, o, r = i) {
  let a = t - s - 2 * o;
  let l = [0, s, s + o, s + o + a];
  let c = [i];
  let u = Math.floor((i - r) / t) - 1;
  let h = Math.ceil((e - r) / t) + 1;
  for (let f = u; f <= h; f++) for (let p of l) {
    let d = r + f * t + p;
    d > i + 1e-4 && d < e - 1e-4 && c.push(d);
  }
  c.push(e);
  return c.map(f => [f, CA(f - r, t, n, s, o)]);
}
function pr(i, e, t = 5) {
  let n = [];
  let s = Math.min(i, e) / 2;
  let o = i / 2 - s;
  let r = e / 2 - s;
  for (let u = 0; u < 4; u++) for (let h = 0; h <= t; h++) {
    let f = (u + h / t) * Math.PI / 2;
    n.push([Math.cos(f) * s + (u === 0 || u === 3 ? o : -o), Math.sin(f) * s + (u < 2 ? r : -r)]);
  }
  let a = [];
  let l = [];
  for (let u = 0; u < n.length; u++) {
    let h = n[u];
    let f = n[(u + 1) % n.length];
    a.push(0, 0, 0, h[0], h[1], 0, f[0], f[1], 0);
    l.push(.5, .5, h[0] / i + .5, h[1] / e + .5, f[0] / i + .5, f[1] / e + .5);
  }
  let c = new BufferGeometry();
  c.setAttribute("position", new BufferAttribute(new Float32Array(a), 3));
  c.setAttribute("uv", new BufferAttribute(new Float32Array(l), 2));
  c.computeVertexNormals();
  return c;
}
function cn(i, e) {
  return new PlaneGeometry(i, e);
}
function Nc(i, e) {
  let t = new PlaneGeometry(i, e);
  let n = t.attributes.uv;
  for (let s = 0; s < n.count; s++) n.setXY(s, n.getX(s) * i, n.getY(s) * e);
  return t;
}
function PA(i) {
  let e = i.index ? i.toNonIndexed() : i;
  e.computeVertexNormals();
  return e;
}
function mr(i, e = 10, t = 6, n = Math.PI * 2, s = 0, o = Math.PI) {
  return new SphereGeometry(i, e, t, 0, n, s, o);
}
function g1(i, e = 16) {
  return new LatheGeometry(i.map(t => new Vector2(t[0], t[1])), e);
}
var f1 = new Euler();
var Fc = new Quaternion();
var g3 = new Matrix4();
var d1 = new Vector3();
var p1 = new Vector3(1, 1, 1);
function je(i, e = 0, t = 0, n = 0, s = null) {
  s ? (f1.set(s[0], s[1], s[2]), Fc.setFromEuler(f1)) : Fc.identity();
  d1.set(e, t, n);
  g3.compose(d1, Fc, p1);
  i.applyMatrix4(g3);
  return i;
}
function _o(i = 0, e = 0, t = 0, n = null) {
  n ? (f1.set(n[0], n[1], n[2]), Fc.setFromEuler(f1)) : Fc.identity();
  d1.set(i, e, t);
  return new Matrix4().compose(d1, Fc, p1);
}
var jn = class {
  constructor(e) {
    this.G = e;
    this.buckets = new Map();
    this.stack = [];
    this.m = null;
    this.defCol = new Map();
  }
  M(e, t) {
    return this.G.mats.get(e, t);
  }
  push(e) {
    this.stack.push(this.m);
    this.m = this.m ? this.m.clone().multiply(e) : e.clone();
    return this;
  }
  pop() {
    this.m = this.stack.pop();
    return this;
  }
  add(e, t, n, s) {
    this.m && t.applyMatrix4(this.m);
    let o = n || this.defCol.get(e);
    o && colorGeometry(t, o);
    let r = this.buckets.get(e);
    r || (r = {
      mat: e,
      geos: [],
      cast: !s
    }, this.buckets.set(e, r));
    r.geos.push(t);
    return t;
  }
  box(e, t, n, s, o, r, a, l = {}) {
    return this.add(e, je(l.r === 0 ? boxGeometry(t, n, s) : p3(t, n, s, l.r || Math.min(.012, Math.min(t, n, s) * .25)), o, r, a, l.rot), l.col);
  }
  cyl(e, t, n, s, o, r, a, l = {}) {
    let c = cylinderGeometry(t, n, s, l.seg || 12, !!l.open);
    l.flat && (c = PA(c));
    return this.add(e, je(c, o, r, a, l.rot), l.col);
  }
  tube(e, t, n, s = {}) {
    return this.add(e, tubeGeometry(t, n, s.seg || 6, false, s.tension === void 0 ? .5 : s.tension), s.col);
  }
  bar(e, t, n, s, o = {}) {
    let r = new Vector3(n[0] - t[0], n[1] - t[1], n[2] - t[2]);
    let a = r.length();
    let l = cylinderGeometry(o.r2 === void 0 ? s : o.r2, s, a, o.seg || 6, !o.caps);
    let c = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), r.normalize());
    l.applyMatrix4(new Matrix4().compose(new Vector3((t[0] + n[0]) / 2, (t[1] + n[1]) / 2, (t[2] + n[2]) / 2), c, p1));
    return this.add(e, l, o.col);
  }
  beam(e, t, n, s, o, r = {}) {
    let a = new Vector3(n[0] - t[0], n[1] - t[1], n[2] - t[2]);
    let l = a.length();
    let c = r.r === 0 ? boxGeometry(s, l, o) : p3(s, l, o, r.r || Math.min(s, o) * .2);
    let u = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), a.normalize());
    r.twist && u.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), r.twist));
    c.applyMatrix4(new Matrix4().compose(new Vector3((t[0] + n[0]) / 2, (t[1] + n[1]) / 2, (t[2] + n[2]) / 2), u, p1));
    return this.add(e, c, r.col);
  }
  decal(e, t, n, s, o, r, a) {
    return this.add(e.material, je(cn(a || t * e.aspect, t), n, s, o, r), null, true);
  }
  parts() {
    let e = [];
    for (let t of this.buckets.values()) e.push({
      mat: t.mat,
      geo: mergeGeometryList(t.geos),
      cast: t.cast
    });
    return e;
  }
  group(e) {
    return Zg(this.parts(), e);
  }
};
function Zg(i, e) {
  let t = new Group();
  for (let n of i) {
    let s = new Mesh(n.geo, e && e.get(n.mat) || n.mat);
    s.castShadow = n.cast;
    s.receiveShadow = true;
    t.add(s);
  }
  return t;
}
function qi(i, e, t, n) {
  i.userData.size = t;
  i.userData.colliders = n;
  i.name = e;
  return i;
}
var m1 = new WeakMap();
function Mi(i, e, t) {
  let n = m1.get(i.mats);
  n || (n = new Map(), m1.set(i.mats, n));
  let s = "L|" + e + "|" + JSON.stringify(t || {});
  if (!n.has(s)) {
    let o;
    try {
      o = i.mats.label(e, t || {});
    } catch {
      o = null;
    }
    n.set(s, o && o.material ? o : {
      material: i.mats.get("paint_white"),
      aspect: Math.max(1, e.length * .6)
    });
  }
  return n.get(s);
}
function Jn(i, e) {
  let t = m1.get(i.mats);
  t || (t = new Map(), m1.set(i.mats, t));
  let n = "D|" + e;
  if (!t.has(n)) {
    let s;
    try {
      s = i.mats.decal(e);
    } catch {
      s = null;
    }
    t.set(n, s && s.material ? s : {
      material: i.mats.get("paint_white"),
      aspect: 1
    });
  }
  return t.get(n);
}
var Bc = 2.438;
var _3 = {
  container20: {
    type: "22G1",
    gross: "30,480",
    tare: "2,230",
    net: "28,250",
    cu: "33.2",
    def: "red"
  },
  container40: {
    type: "42G1",
    gross: "32,500",
    tare: "3,750",
    net: "28,750",
    cu: "67.7",
    def: "blue"
  },
  container40hc: {
    type: "45G1",
    gross: "32,500",
    tare: "3,940",
    net: "28,560",
    cu: "76.3",
    def: "green"
  }
};
var v1 = ["SLTU 482915 7", "HBMU 307144 2", "NRDU 665201 9", "OKTU 119873 4", "VSLU 850362 1", "TQLU 274590 6"];
var v3 = ["logo_a", "logo_b", "logo_c", "logo_d"];
var jg = ["red", "blue", "green", "yellow", "orange", "white", "grey", "teal"];
var Jt = {
  body: true
};
var IA = 6;
var x3 = new Map();
var y3 = .178;
var bf = .118;
var b3 = .162;
var Uo = {
  P: .278,
  d: .036,
  fo: .072,
  sl: .068
};
var x1 = {
  P: .209,
  d: .02,
  fo: .09,
  sl: .03
};
var y1 = {
  P: .25,
  d: .042,
  fo: .07,
  sl: .06
};
function zA(i, e, t, n, s) {
  let o = PROP_SIZES[e][0];
  let r = PROP_SIZES[e][1];
  let a = _3[e];
  let l = $a(1e3 + t * 77 + e.length * 13);
  let c = new jn(i);
  let u = c.M("steel_galv");
  let h = c.M("wood_pallet");
  let f = Bc / 2;
  let p = o / 2;
  let d = f - .012;
  let v = -p + .085;
  let g = p - .135;
  let x = .167;
  let y = r - .06;
  let b = [];
  let m = Math.round((1 + l() * 2.4) * (.4 + s));
  let A = [[-p * .75, -p * .05], [p - 2.2, p]];
  for (let $ = 0; $ < m; $++) {
    let ue = l() < .5 ? 1 : -1;
    let me = 0;
    let ee = 0;
    do {
      me = (l() * 2 - 1) * (p - .9);
      ee++;
    } while (ee < 8 && A.some(B => me > B[0] - .4 && me < B[1] + .4 && l() < .9));
    b.push({
      side: ue,
      x: ue * me,
      y: .45 + l() * 1.3,
      r: .22 + l() * .3,
      depth: .025 + l() * .04
    });
  }
  let _ = [];
  let M = Math.round(o / 2.2 * (.5 + s) * (.6 + l()));
  for (let $ = 0; $ < M * 2; $++) _.push({
    side: $ % 2 ? 1 : -1,
    x: (l() * 2 - 1) * (p - .3),
    w: .05 + l() * .12,
    k: .4 + l() * .6
  });
  let E = [.5, .44, .38];
  let w = [.62, .38, .24];
  let S = t * 9.7;
  let z = ($, ue, me) => {
    let ee = 1 + (ri($ * .9 + S, ue * 1.7 + me * .4) - .5) * .16 * (.5 + s);
    ee *= .94 + .06 * ri($ * 6.1 + me * 3.3, ue * 5 + S);
    let B = [ee, ee, ee];
    let P = mn(.62, .02, ue) * (.45 + .5 * s) * (.75 + .5 * ri($ * 2.3 + me, S));
    B = Ir(B, [E[0] * ee, E[1] * ee, E[2] * ee], Math.min(1, P));
    return B;
  };
  c.defCol.set(Jt, z);
  let H = ($, ue, me) => {
    let ee = 0;
    for (let B of b) if (B.side === me) {
      let P = Math.hypot($ - B.x, (ue - B.y) * .9) / B.r;
      if (P < 1) {
        let V = 1 - P * P;
        ee += B.depth * V * V;
      }
    }
    return ee;
  };
  let O = [.035, .035, .04];
  for (let $ of [-1, 1]) for (let ue of [0, 1]) for (let me of [-1, 1]) {
    let ee = $ * (p - y3 / 2);
    let B = ue ? r - bf / 2 : bf / 2;
    let P = me * (f - b3 / 2);
    c.box(Jt, y3, bf, b3, ee, B, P, {
      r: .012
    });
    c.add(Jt, je(pr(.078, .052, 3), ee, B, me * (f + .0012), [0, me > 0 ? 0 : Math.PI, 0]), O);
    c.add(Jt, je(pr(.064, .05, 3), $ * (p + .0012), B, P, [0, $ * Math.PI / 2, 0]), O);
    ue && c.add(Jt, je(pr(.124, .064, 3), ee, r + .0012, P, [-Math.PI / 2, 0, 0]), O);
  }
  for (let $ of [-1, 1]) {
    c.box(Jt, .085, r - 2 * bf + .01, .15, -p + .0465, r / 2, $ * (f - .079), {
      r: .014
    });
    c.box(Jt, .14, r - 2 * bf + .01, .056, p - .074, r / 2, $ * (f - .032), {
      r: .012
    });
    c.box(Jt, o - .2, .062, .062, -.02, r - .031, $ * (f - .035), {
      r: .008
    });
    c.box(Jt, o - .2, .158, .05, -.02, .012 + .079, $ * (f - .029), {
      r: .008
    });
  }
  if (c.box(Jt, .062, .062, Bc - .2, -p + .035, r - .031, 0, {
    r: .008
  }), c.box(Jt, .05, .158, Bc - .2, -p + .029, .091, 0, {
    r: .008
  }), c.box(Jt, .13, .12, Bc - .12, p - .072, r - .06, 0, {
    r: .01
  }), c.box(Jt, .13, .158, Bc - .12, p - .072, .091, 0, {
    r: .01
  }), c.box(Jt, .03, .012, Bc - .4, p - .012, r - .125, 0, {
    r: .003,
    rot: [0, 0, -.5]
  }), e === "container20") for (let $ of [-1, 1]) for (let ue of [-1.025, 1.025]) {
    c.add(Jt, je(cn(.36, .112), ue, .075, $ * (f - .0035), [0, $ > 0 ? 0 : Math.PI, 0]), O);
    c.box(Jt, .46, .018, .012, ue, .142, $ * (f - .002), {
      r: .003
    });
    for (let me of [-1, 1]) c.box(Jt, .018, .13, .01, ue + me * .19, .078, $ * (f - .003), {
      r: .003
    });
  }
  let q = [x, .44, 1.25, r - .5, y];
  let U = Uc(v, g, Uo.P, Uo.d, Uo.fo, Uo.sl, v + .02);
  for (let $ of [-1, 1]) {
    let ue = la(U, q, (B, P, V) => [B, V, $ * (d + P - H(B, V, $))], {
      center: [0, r / 2, 0]
    });
    ue.computeVertexNormals();
    let me = ue.attributes.position;
    let ee = new Float32Array(me.count * 3);
    for (let B = 0; B < me.count; B++) {
      let P = me.getX(B);
      let V = me.getY(B);
      let Y = me.getZ(B);
      let L = z(P, V, Y);
      let Z = d - Math.abs(Y);
      let J = mn(.008, .034, Z);
      L = [L[0] * (1 - .17 * J), L[1] * (1 - .18 * J), L[2] * (1 - .18 * J)];
      let oe = mn(r - .75, y, V);
      if (oe > 0) {
        for (let le of _) if (le.side === $) {
          let R = Math.abs(P - le.x) / le.w;
          R < 1 && (L = Ir(L, [L[0] * w[0], L[1] * w[1], L[2] * w[2]], oe * oe * le.k * (1 - R * R) * (.45 + .55 * s)));
        }
      }
      let fe = H(P, V, $);
      fe > .004 && (L = Ir(L, [L[0] * .66, L[1] * .46, L[2] * .36], Math.min(.8, fe * 22)));
      ee[B * 3] = L[0];
      ee[B * 3 + 1] = L[1];
      ee[B * 3 + 2] = L[2];
    }
    ue.setAttribute("color", new BufferAttribute(ee, 3));
    c.buckets.get(Jt).geos.push(ue);
  }
  for (let $ of [-1, 1]) for (let ue of o > 7 ? [-1, 1] : [1]) {
    let me = $ * ue * (p - .62);
    let ee = r - .165;
    let B = $ * (d - .004);
    c.box(Jt, .24, .1, .03, me, ee, B, {
      r: .008
    });
    for (let P = -1; P <= 1; P++) c.add(Jt, je(cn(.18, .012), me, ee + P * .026, $ * (d + .0116), [0, $ > 0 ? 0 : Math.PI, 0]), O);
  }
  {
    let $ = Uc(-f + .155, f - .155, y1.P, y1.d, y1.fo, y1.sl, -f + .155 + .03);
    let ue = la($, [x, 1.25, y], (ee, B, P) => [-(p - .014 + B), P, ee], {
      center: [0, r / 2, 0]
    });
    let me = -(p - .014);
    c.add(Jt, ue, (ee, B, P) => {
      let V = z(ee, B, P);
      let Y = mn(.008, .038, ee - me);
      return [V[0] * (1 - .17 * Y), V[1] * (1 - .18 * Y), V[2] * (1 - .18 * Y)];
    });
  }
  {
    let $ = Uc(-p + .07, p - .13, x1.P, x1.d, x1.fo, x1.sl, -p + .1);
    let ue = r - .008;
    let me = la($, o > 7 ? [-(f - .066), f - .066] : [-(f - .066), 0, f - .066], (ee, B, P) => [ee, ue + B + (Math.abs(P) < .01 ? .006 : 0), P], {
      center: [0, r / 2, 0]
    });
    c.add(Jt, me, (ee, B, P) => {
      let V = .78 + .3 * ri(ee * .8 + S, P * 1.1);
      let Y = mn(.004, .018, ue - B);
      return [V * (1 - .25 * Y), V * (1 - .3 * Y) * .97, V * (1 - .32 * Y) * .94];
    });
  }
  let T = n > .03;
  let D = .172;
  if (T) {
    let $ = (ee, B, P) => {
      let Y = (.16 + .62 * mn(-p, p, ee) * mn(-p, p, ee)) * (.8 + .2 * mn(.2, 1.4, B));
      return [Y, Y, Y];
    };
    let ue = Uc(v, g, Uo.P, Uo.d, Uo.fo, Uo.sl, v + .02);
    for (let ee of [-1, 1]) c.add(Jt, la(ue, [D, y - .02], (B, P, V) => [B, V, ee * (d + P - .004)], {
      center: [0, r / 2, 0],
      inward: true
    }), $);
    c.add(Jt, je(cn(g - v, 2 * d), (v + g) / 2, y - .03, 0, [Math.PI / 2, 0, 0]), $);
    c.add(Jt, je(cn(2 * d, y - D), v + .03, (D + y) / 2, 0, [0, Math.PI / 2, 0]), $);
    let me = Nc(g - v + .1, 2 * d - .02);
    c.add(h, je(me, (v + g) / 2 + .05, D, 0, [-Math.PI / 2, 0, 0]), ee => {
      let B = .3 + .6 * mn(-p, p, ee) ** 2;
      return [B, B * .97, B * .93];
    });
    c.box(u, .05, .006, 2 * d - .1, p - .11, D + .001, 0, {
      r: .002
    });
  }
  let C = .175;
  let G = r - .124;
  let j = G - C;
  let N = f - .058 - .004;
  let Q = p - .066;
  let K = ($, ue, me) => z($, ue, me);
  let ie = [];
  for (let $ of [1, -1]) {
    let ue = n * ($ > 0 ? 1 : .88) * MathUtils.degToRad($ > 0 ? 112 : 100);
    let me = $ * (f - .058);
    c.push(_o(Q, 0, me, [0, -$ * ue, 0]));
    let ee = k => -$ * k;
    let B = (C + G) / 2;
    c.box(Jt, .034, j, N - .006, 0, B, ee(N / 2), {
      r: .008,
      col: K
    });
    let P = e === "container40hc" ? 7 : 6;
    let V = C + .085;
    let Y = G - .085;
    let L = (Y - V) / P;
    let Z = .019;
    let J = .031;
    let oe = [];
    for (let k = 0; k < P; k++) {
      let ce = V + k * L;
      oe.push([ce, Z], [ce + .022, Z], [ce + .05, J], [ce + L - .05, J], [ce + L - .022, Z]);
    }
    oe.push([Y, Z]);
    c.add(Jt, la(oe, [.075, N - .085], (k, ce, ve) => [ce, k, ee(ve)], {
      center: [-1, B, ee(N / 2)]
    }), (k, ce, ve) => z(k, ce, ve));
    let fe = k => V + (k + .5) * L;
    let le = [.05, .05, .05];
    c.box(Jt, .022, j + .012, .018, .004, B, ee(N + .001), {
      r: 0,
      col: le
    });
    c.box(Jt, .022, .016, N, .004, G + .004, ee(N / 2), {
      r: 0,
      col: le
    });
    c.box(Jt, .022, .016, N, .004, C - .004, ee(N / 2), {
      r: 0,
      col: le
    });
    let R = e === "container40hc" ? 5 : 4;
    for (let k = 0; k < R; k++) {
      let ce = C + .16 + k * (j - .32) / (R - 1);
      c.box(Jt, .012, .062, .15, .021, ce, ee(.085), {
        r: 0
      });
      c.cyl(u, .013, .013, .086, .026, ce, ee(-.002), {
        seg: 6,
        open: true
      });
    }
    for (let k of [.31, .83]) {
      c.cyl(u, .0155, .0155, j + .2, .052, B, ee(k), {
        seg: 7,
        open: true
      });
      for (let Te of [-1, 1]) {
        c.add(u, je(boxGeometry(.03, .045, .085), .052 - .004, B + Te * (j / 2 + .065), ee(k)));
        c.box(Jt, .03, .05, .075, .052 - .012, B + Te * (j / 2 - .035), ee(k), {
          r: 0
        });
      }
      for (let Te of [C + j * .3, C + j * .72]) c.box(Jt, .026, .04, .07, .052 - .012, Te, ee(k), {
        r: 0
      });
      let ve = 1.02 + (k > .5 ? 0 : .13);
      let _e = k > .5 ? -1 : 1;
      c.box(u, .02, .05, .05, .052 + .008, ve, ee(k), {
        r: 0
      });
      c.box(u, .011, .032, .36, .052 + .016, ve, ee(k + _e * .19), {
        r: .004
      });
      c.box(Jt, .03, .07, .05, .052 - .008, ve, ee(k + _e * .33), {
        r: 0
      });
      c.box(u, .012, .085, .012, .052 + .012, ve + .005, ee(k + _e * .33), {
        r: 0
      });
    }
    let I = .031 + .0025;
    let se = [0, Math.PI / 2, 0];
    let ae = (k, ce, ve, _e, Te) => {
      let Pe = ce * k.aspect;
      Te && Pe > Te && (ce *= Te / Pe, Pe = Te);
      c.add(k.material, je(cn(Pe, ce), I, ve, ee(_e), se), null, true);
    };
    if ($ < 0) {
      ae(Mi(i, v1[t % v1.length], {
        color: "white",
        font: "stencil",
        distress: .3
      }), .115, fe(P - 1), N / 2, N - .24);
      ae(Mi(i, a.type, {
        color: "white",
        font: "stencil",
        distress: .3
      }), .1, fe(P - 2), N / 2 + .2, .4);
      let k = {
        color: "white",
        font: "sans",
        distress: .2
      };
      ae(Mi(i, "MAX GROSS " + a.gross + " KG", k), .052, fe(P - 3) + .062, N / 2 - .01, .44);
      ae(Mi(i, "TARE " + a.tare + " KG   NET " + a.net + " KG", k), .045, fe(P - 3), N / 2 - .01, .44);
      ae(Mi(i, "CU.CAP. " + a.cu + " CU.M", k), .045, fe(P - 3) - .062, N / 2 - .01, .44);
    } else {
      ae(Jn(i, v3[t % 4]), .2, fe(P - 1), N / 2, N - .36);
      ae(Jn(i, "csc_plate"), .17, fe(1), N / 2 + .05, .36);
      e === "container40hc" && ae(Jn(i, "caution_stripes"), .1, G - .04, N / 2, N - .1);
    }
    if (c.pop(), T) for (let k = 0; k < 3; k++) {
      let ce = N * k / 3;
      let ve = N * (k + 1) / 3;
      let _e = [Q + Math.sin(ue) * ce, me - $ * Math.cos(ue) * ce];
      let Te = [Q + Math.sin(ue) * ve, me - $ * Math.cos(ue) * ve];
      ie.push({
        min: [Math.min(_e[0], Te[0]) - .03, C, Math.min(_e[1], Te[1]) - .03],
        max: [Math.max(_e[0], Te[0]) + .03, G, Math.max(_e[1], Te[1]) + .03],
        surface: "metal"
      });
    }
  }
  for (let $ of [1, -1]) for (let ue of [.31, .83]) for (let me of [-1, 1]) {
    let ee = $ * (f - .058) - $ * ue;
    c.add(Jt, je(boxGeometry(.035, .05, .11), p - .03, me > 0 ? r - .07 : .115, ee));
  }
  let F = ($, ue, me, ee, B, P) => {
    let V = B * $.aspect;
    P && V > P && (B *= P / V, V = P);
    let Y = me - V / 2;
    let L = me + V / 2;
    let Z = ue > 0 ? Y : -L;
    let J = ue > 0 ? L : -Y;
    let oe = Uc(Math.max(v, Z), Math.min(g, J), Uo.P, Uo.d, Uo.fo, Uo.sl, v + .02);
    let fe = ee - B / 2;
    let le = ee + B / 2;
    let R = la(oe, [fe, le], (ae, k, ce) => [ae, ce, ue * (d + k + .003 - H(ae, ce, ue))], {
      center: [0, r / 2, 0]
    });
    let I = R.attributes.position;
    let se = R.attributes.uv;
    for (let ae = 0; ae < I.count; ae++) {
      let k = (I.getX(ae) - Z) / (J - Z);
      se.setXY(ae, ue > 0 ? k : 1 - k, (I.getY(ae) - fe) / B);
    }
    c.add($.material, R, null, true);
    return V;
  };
  let X = Mi(i, v1[t % v1.length], {
    color: "white",
    font: "stencil",
    distress: .3
  });
  let ne = Mi(i, a.type, {
    color: "white",
    font: "stencil",
    distress: .3
  });
  let re = Jn(i, v3[t % 4]);
  for (let $ of [-1, 1]) {
    let ue = Math.min(r * .4, 1.05);
    let me = Math.min(ue * re.aspect, e === "container20" ? 2.2 : 3.4);
    F(re, $, e === "container20" ? -.75 : -p * .42, r * .52, me / re.aspect, me);
    let ee = Math.min(.14 * X.aspect, 1.9);
    F(X, $, p - .3 - ee / 2, r - .32, .14, 1.9);
    let B = Math.min(.11 * ne.aspect, .6);
    F(ne, $, p - .3 - B / 2, r - .52, .11, .6);
    let P = Math.round((1 + l() * 2) * (.4 + s) * (o > 7 ? 1.6 : 1));
    for (let V = 0; V < P; V++) {
      let Y = Jn(i, l() < .6 ? "rust_run" : "grime_streak");
      let L = .5 + l() * .7;
      let Z = Math.min(.5, Math.max(.16, L * Y.aspect));
      F({
        material: Y.material,
        aspect: Z / L
      }, $, (l() * 2 - 1) * (p - .6), y - L / 2 - .005, L);
    }
  }
  T ? ie.push({
    min: [-p, 0, -f],
    max: [p, D, f],
    surface: "wood"
  }, {
    min: [-p, r - .09, -f],
    max: [p, r, f],
    surface: "metal"
  }, {
    min: [-p, 0, -f],
    max: [p, r, -f + .07],
    surface: "metal"
  }, {
    min: [-p, 0, f - .07],
    max: [p, r, f],
    surface: "metal"
  }, {
    min: [-p, 0, -f],
    max: [-p + .07, r, f],
    surface: "metal"
  }) : ie.push({
    min: [-p, 0, -f],
    max: [p, r, f],
    surface: "metal"
  });
  return {
    parts: c.parts(),
    colliders: ie
  };
}
function M3(i, e, t = {}) {
  let n = _3[e];
  let s = t.seed === void 0 ? 0 : Math.abs(Math.floor(t.seed));
  let o = s % IA;
  let r = Math.round(MathUtils.clamp(t.doors || 0, 0, 1) * 10) / 10;
  let a = Math.round(MathUtils.clamp(t.wear === void 0 ? .5 : t.wear, 0, 1) * 2) / 2;
  let l = e + "|" + o + "|" + r + "|" + a;
  let c = x3.get(i.mats);
  c || (c = new Map(), x3.set(i.mats, c));
  c.has(l) || c.set(l, zA(i, e, o, r, a));
  let u = c.get(l);
  let h = t.color;
  jg.includes(h) || (h = t.seed === void 0 ? n.def : jg[(s * 7 + 3) % jg.length]);
  let f = Zg(u.parts, new Map([[Jt, i.mats.get("paint_" + h, {
    vertexColors: true
  })]]));
  let p = PROP_SIZES[e];
  f.userData.color = h;
  f.userData.doors = r;
  return qi(f, e, [p[0], p[1], p[2]], u.colliders.map(d => ({
    min: d.min.slice(),
    max: d.max.slice(),
    surface: d.surface
  })));
}
var ca = i => PROP_SIZES[i].slice(0, 3);
var hn = Math.PI;
function S3(i, e = {}) {
  let t = new jn(i);
  let n = e.seed | 0;
  let s = $a(n + 11);
  let o = n * 3.7;
  let r = t.M("concrete", {
    vertexColors: true
  });
  let a = [[-.3, 0], [.3, 0], [.3, .076], [.127, .33], [.1, .57], [.077, .79], [.06, .81], [-.06, .81], [-.077, .79], [-.1, .57], [-.127, .33], [-.3, .076]];
  let l = [-1.5, -1.47];
  for (let f = -1.25; f <= 1.26; f += .25) l.push(f);
  l.push(1.47, 1.5);
  let c = [];
  for (let f = 0; f < 7; f++) c.push([(s() * 2 - 1) * 1.5, s() * .8, .08 + s() * .14, s() < .5 ? 1 : -1]);
  let u = la(a, l, (f, p, d) => {
    let v = Math.abs(d) > 1.49 ? 1 : 0;
    return [d, p - v * .022 * (p / .81), f * (1 - v * .09)];
  }, {
    closed: true,
    caps: true
  });
  t.add(r, u, (f, p, d) => {
    let v = .86 + .2 * ri(f * 1.3 + o, p * 3 + d * 2) + .08 * ri(f * 7, p * 9 + o);
    let g = [v, v * .99, v * .97];
    g = Ir(g, [v * .5, v * .48, v * .44], mn(.3, 0, p) * .8);
    let x = mn(.55, .8, ri(f * 4.5 + o, 3.3)) * mn(.25, .8, p);
    g = Ir(g, [v * .62, v * .6, v * .56], x * .6);
    let y = mn(.6, .85, ri(f * 2.1 + o * 2, d * 3)) * mn(.2, .33, p) * mn(.62, .4, p);
    g = Ir(g, [.22, .22, .22], y * .65);
    for (let b of c) if (Math.sign(d || 1) === b[3]) {
      let m = Math.hypot(f - b[0], p - b[1]) / b[2];
      m < 1 && (g = Ir(g, [1.12, 1.1, 1.05], (1 - m) * .7));
    }
    Math.abs(f) > 1.4 && (g = Ir(g, [1.08, 1.06, 1.02], .4 * ri(p * 9, d * 9 + o)));
    return g;
  });
  let h = [.05, .05, .05];
  for (let f of [-1, 1]) for (let p of [-.85, .85]) {
    t.add(r, je(cn(.3, .058), p, .03, f * .3008, [0, f > 0 ? 0 : hn, 0]), h);
    t.box(r, .34, .012, .012, p, .064, f * .3, {
      r: .003,
      col: [.7, .7, .68]
    });
  }
  for (let f of [-.9, .9]) t.tube(t.M("steel_rust"), [[f - .05, .8, 0], [f - .04, .85, 0], [f + .04, .85, 0], [f + .05, .8, 0]], .008, {
    seg: 5
  });
  if (e.stripe) {
    let f = t.M("hazard_stripes");
    t.add(f, je(Nc(2.9, .118), 0, .8125, 0, [-hn / 2, 0, 0]));
    for (let p of [-1, 1]) t.add(f, je(Nc(2.9, .2), 0, .68, p * .0905, [p > 0 ? -.108 : .108, p > 0 ? 0 : hn, 0]));
  }
  return qi(t.group(), "jersey_barrier", ca("jersey_barrier"), [{
    min: [-1.5, 0, -.3],
    max: [1.5, .33, .3],
    surface: "concrete"
  }, {
    min: [-1.5, .33, -.13],
    max: [1.5, .81, .13],
    surface: "concrete"
  }]);
}
function w3(i, e, t, n, s, o, r, a, l) {
  i.push(_o(s, o, r, [0, a, 0]));
  i.push(_o(0, 0, 0, [0, 0, l]));
  i.box(t, .1, .34, .46, .09, 0, 0, {
    r: .014
  });
  i.add(n, je(cn(.4, .28), .1415, 0, 0, [0, hn / 2, 0]), null, true);
  i.box(t, .012, .018, .47, .146, .156, 0, {
    r: 0
  });
  i.box(t, .012, .018, .47, .146, -.156, 0, {
    r: 0
  });
  i.box(t, .012, .33, .018, .146, 0, .222, {
    r: 0
  });
  i.box(t, .012, .33, .018, .146, 0, -.222, {
    r: 0
  });
  i.box(t, .09, .008, .48, .17, .175, 0, {
    r: 0,
    rot: [0, 0, -.12]
  });
  for (let c = -3; c <= 3; c++) i.add(t, je(boxGeometry(.045, .3, .008), .02, 0, c * .062));
  i.pop();
  i.box(e, .03, .05, .56, .02, -.02, 0, {
    r: .004
  });
  for (let c of [-1, 1]) i.box(e, .1, .05, .012, .05, -.02, c * .275, {
    r: 0,
    rot: [0, 0, l * .5]
  });
  i.pop();
}
function T3(i, e = {}) {
  let t = new jn(i);
  let n = t.M("steel_galv");
  let s = t.M("concrete", {
    vertexColors: true
  });
  let o = t.M("steel_dark");
  let r = i.mats.emissive(16769981, e.on === false ? .02 : 8);
  t.box(s, .8, .32, .8, 0, .16, 0, {
    r: .03,
    col: (x, y, b) => {
      let m = .62 + .36 * mn(0, .3, y) + .1 * ri(x * 5, b * 5);
      return [m, m, m * .97];
    }
  });
  t.box(n, .5, .03, .5, 0, .335, 0, {
    r: .006
  });
  for (let x = 0; x < 8; x++) {
    let y = (x + .5) * hn / 4;
    let b = Math.cos(y) * .215;
    let m = Math.sin(y) * .215;
    t.cyl(n, .014, .014, .1, b, .38, m, {
      seg: 6
    });
    t.cyl(n, .027, .027, .024, b, .362, m, {
      seg: 6,
      flat: true
    });
  }
  let a = .35;
  let l = 13.3;
  let c = .168;
  let u = .07;
  let h = x => c + (u - c) * (x - a) / (l - a);
  let f = [[a, 4.75, 0], [4.6, 9.15, .007], [9, l, .014]];
  for (let [x, y, b] of f) t.cyl(n, h(y) + b, h(x) + b, y - x, 0, (x + y) / 2, 0, {
    seg: 8,
    flat: true,
    open: true,
    rot: [0, hn / 8, 0]
  });
  for (let x = 0; x < 4; x++) {
    let y = x * hn / 2;
    t.box(n, .012, .2, .12, Math.cos(y) * .2, .45, -Math.sin(y) * .2, {
      r: 0,
      rot: [0, y + hn / 2, 0]
    });
  }
  t.cyl(n, .2, .2, .02, 0, .36, 0, {
    seg: 8,
    rot: [0, hn / 8, 0]
  });
  t.cyl(n, .09, .09, .03, 0, l, 0, {
    seg: 8,
    rot: [0, hn / 8, 0]
  });
  let p = h(1.05) * .924;
  t.box(n, .13, .52, .012, 0, 1.05, p + .005, {
    r: .004
  });
  t.box(o, .03, .045, .012, .04, 1.05, p + .013, {
    r: .003
  });
  t.decal(Jn(i, "hazard_voltage"), .09, -.01, 1.2, p + .0125, null);
  t.tube(o, [[-.3, .3, .28], [-.3, .52, .28], [-.24, .72, .2], [-.1, .8, .1]], .024, {
    seg: 6
  });
  t.cyl(o, .034, .034, .03, -.3, .335, .28, {
    seg: 8
  });
  t.bar(n, [.1, 3, -.13], [.42, 3, -.13], .012);
  t.bar(n, [.1, 3, .13], [.42, 3, .13], .012);
  t.bar(n, [.42, 3, -.16], [.42, 3, .16], .012, {
    caps: true
  });
  t.bar(n, [.42, 3, -.13], [.42, 3.09, -.13], .012, {
    caps: true
  });
  t.bar(n, [.42, 3, .13], [.42, 3.09, .13], .012, {
    caps: true
  });
  t.cyl(n, h(3) + .012, h(3) + .012, .05, 0, 3, 0, {
    seg: 8,
    rot: [0, hn / 8, 0]
  });
  let d = 0;
  for (let x = 3.45; x < 12.9; x += .38, d++) {
    let y = d % 2 ? 1 : -1;
    t.bar(n, [0, x, y * h(x) * .8], [0, x, y * (h(x) + .15)], .009, {
      seg: 5,
      caps: true
    });
  }
  let v = l + .12;
  t.box(n, .1, .1, 1.9, 0, v, 0, {
    r: .012
  });
  t.box(n, .5, .07, .07, 0, v + .085, .55, {
    r: .01
  });
  t.box(n, .5, .07, .07, 0, v + .085, -.55, {
    r: .01
  });
  t.beam(n, [0, l - .5, .08], [0, v - .03, .7], .04, .04);
  t.beam(n, [0, l - .5, -.08], [0, v - .03, -.7], .04, .04);
  for (let x of [-.55, .55]) {
    w3(t, n, o, r, .22, v - .14, x, 0, -.62);
    w3(t, n, o, r, -.22, v - .14, x, hn, -.62);
  }
  t.box(o, .16, .2, .12, 0, l - .25, -.14, {
    r: .01
  });
  t.bar(n, [0, v, 0], [0, 14, 0], .012, {
    r2: .003,
    seg: 5,
    caps: true
  });
  let g = t.group();
  g.userData.lamps = [];
  for (let x of [-.55, .55]) for (let y of [-1, 1]) g.userData.lamps.push({
    pos: [y * .34, v - .22, x],
    dir: [y * .81, -.58, 0],
    color: 16769981
  });
  return qi(g, "light_mast", ca("light_mast"), [{
    min: [-.4, 0, -.4],
    max: [.4, .32, .4],
    surface: "concrete"
  }, {
    min: [-.17, .32, -.17],
    max: [.17, 14, .17],
    surface: "metal"
  }]);
}
function A3(i, e = {}) {
  let t = new jn(i);
  let n = $a((e.seed | 0) + 5);
  let s = t.M("steel_galv");
  let o = t.M("concrete", {
    vertexColors: true
  });
  let r = t.M("chainlink", {
    doubleSide: true
  });
  let a = e.posts || "both";
  let l = e.lean === 1 ? 1 : -1;
  let c = a === "both" ? [-1.5, 1.5] : a === "left" ? [-1.5] : a === "right" ? [1.5] : [];
  for (let p of c) {
    t.box(o, .32, .09, .32, p, .035, 0, {
      r: .02,
      col: (d, v) => {
        let g = .6 + .4 * mn(0, .08, v);
        return [g, g, g];
      }
    });
    t.cyl(s, .03, .03, 2.02, p, 1.05, 0, {
      seg: 8,
      open: true
    });
    t.cyl(s, .05, .05, .012, p, .086, 0, {
      seg: 8
    });
    t.bar(s, [p, 2.02, 0], [p, 2.4 - .02, l * .36], .019, {
      seg: 6,
      caps: true
    });
    t.cyl(s, .034, .034, .05, p, 2.03, 0, {
      seg: 8
    });
    for (let d of [.2, 1.05, 1.9]) t.cyl(s, .034, .034, .03, p, d, 0, {
      seg: 8,
      open: true
    });
  }
  t.bar(s, [-1.5, 2, .036], [1.5, 2, .036], .021, {
    seg: 7
  });
  for (let p of [.09, 1.02]) t.bar(s, [-1.5, p, .012], [1.5, p, .012], .0035, {
    seg: 4
  });
  t.box(s, .008, 1.9, .02, -1.462, 1.03, .012, {
    r: 0
  });
  t.box(s, .008, 1.9, .02, 1.462, 1.03, .012, {
    r: 0
  });
  let u = new PlaneGeometry(2.92, 1.93, 6, 3);
  let h = u.attributes.position;
  let f = u.attributes.uv;
  for (let p = 0; p < h.count; p++) {
    let d = h.getX(p);
    let v = h.getY(p);
    f.setXY(p, d + 1.5, v + 1);
    h.setZ(p, .012 + .02 * (ri(d * 1.3 + (e.seed | 0), v * 1.5) - .5) * (1 - Math.abs(d) / 1.46));
  }
  u.computeVertexNormals();
  t.add(r, je(u, 0, 1.025, 0));
  for (let p = 0; p < 3; p++) {
    let d = .3 + p * .33;
    let v = 2.02 + d * .36;
    let g = l * d * .36;
    t.bar(s, [-1.5, v, g], [1.5, v, g], .0032, {
      seg: 4
    });
    for (let x = -1.42 + p % 2 * .09; x < 1.45; x += .18) t.add(s, je(boxGeometry(.004, .032, .004), x, v, g, [n() * 3, 0, .8 + n()]));
  }
  for (let p = 0; p < 5; p++) t.add(s, je(boxGeometry(.012, .012, .03), -1.2 + p * .6, 2, .02));
  return qi(t.group(), "fence_panel", ca("fence_panel"), [{
    min: [-1.5, 0, -.04],
    max: [1.5, 2.4, .04],
    surface: "metal"
  }]);
}
function R3(i, e = {}) {
  let t = new jn(i);
  let n = e.seed | 0;
  let s = n * 1.3;
  let o = 2.6;
  let r = 2.2;
  let a = o / 2;
  let l = r / 2;
  let c = t.M("paint_" + (["white", "grey", "teal"].includes(e.color) ? e.color : "white"), {
    vertexColors: true
  });
  let u = t.M("steel_dark");
  let h = t.M("steel_galv");
  let f = t.M("glass", {
    doubleSide: true
  });
  let p = t.M("wood_dark");
  let d = t.M("polymer_black");
  let v = (H, O, q) => {
    let U = (.9 + .14 * ri(H * 2 + s, O * 2 + q)) * (.6 + .4 * mn(.1, .7, O)) * (1 - .25 * mn(2.25, 2.45, O));
    return [U, U * .985, U * .96];
  };
  t.defCol.set(c, v);
  let g = .12;
  let x = 1;
  let y = 2.08;
  let b = 2.42;
  t.box(u, o, .12, r, 0, .06, 0, {
    r: .015
  });
  for (let H of [-.7, .7]) t.box(u, o + .06, .06, .1, 0, .03, H, {
    r: .01
  });
  for (let H of [-1, 1]) for (let O of [-1, 1]) t.box(c, .09, b - g, .09, H * (a - .045), (b + g) / 2, O * (l - .045), {
    r: .012
  });
  let m = .3;
  let A = 1.12;
  let _ = (H, O) => {
    let q = O > 0 ? [[-a + .09, m - .04]] : [[-a + .09, a - .09]];
    for (let [U, T] of q) {
      t.box(c, T - U, x - g, .05, (U + T) / 2, (x + g) / 2, H, {
        r: .006
      });
      t.box(c, T - U, .05, .075, (U + T) / 2, x + .01, H + O * .005, {
        r: .008
      });
      t.box(f, T - U, y - x - .03, .008, (U + T) / 2, (x + y) / 2 + .01, H, {
        r: 0
      });
      let D = T - U > 1.6 ? 2 : 1;
      for (let C = 1; C <= D; C++) t.box(c, .04, y - x, .05, U + (T - U) * C / (D + 1), (x + y) / 2, H, {
        r: .006
      });
      for (let C = 1; C < 3; C++) t.box(c, .006, x - g - .04, .056, U + (T - U) * C / 3, (x + g) / 2, H, {
        r: 0
      });
    }
    t.box(c, o - .18, b - y, .05, 0, (b + y) / 2, H, {
      r: .006
    });
  };
  _(l - .03, 1);
  _(-l + .03, -1);
  for (let H of [-1, 1]) {
    let O = H * (a - .03);
    t.box(c, .05, x - g, r - .18, O, (x + g) / 2, 0, {
      r: .006
    });
    t.box(c, .075, .05, r - .18, O + H * .005, x + .01, 0, {
      r: .008
    });
    t.box(f, .008, y - x - .03, r - .18, O, (x + y) / 2 + .01, 0, {
      r: 0
    });
    t.box(c, .05, y - x, .04, O, (x + y) / 2, 0, {
      r: .006
    });
    t.box(c, .05, b - y, r - .18, O, (b + y) / 2, 0, {
      r: .006
    });
  }
  let M = l - .03;
  t.box(c, .05, y - g, .07, m - .015, (y + g) / 2, M, {
    r: .006
  });
  t.box(c, .05, y - g, .07, A + .015, (y + g) / 2, M, {
    r: .006
  });
  t.box(c, a - .09 - A - .04, y - g, .05, (a - .09 + A + .04) / 2, (y + g) / 2, M, {
    r: .006
  });
  let E = A - m - .02;
  let w = (m + A) / 2;
  t.box(c, E, x - g - .01, .04, w, (x + g) / 2, M + .005, {
    r: .006
  });
  t.box(c, E, .07, .04, w, y - .04, M + .005, {
    r: .006
  });
  for (let H of [-1, 1]) t.box(c, .07, y - x, .04, w + H * (E / 2 - .035), (x + y) / 2, M + .005, {
    r: .006
  });
  t.box(f, E - .12, y - x - .08, .008, w, (x + y) / 2 - .02, M + .005, {
    r: 0
  });
  t.box(h, E - .06, .22, .004, w, g + .14, M + .027, {
    r: 0
  });
  t.box(h, .03, .14, .02, m + .09, 1.05, M + .035, {
    r: .004
  });
  t.bar(h, [m + .09, 1, M + .06], [m + .2, 1, M + .06], .009, {
    caps: true
  });
  for (let H of [.4, 1.75]) t.cyl(h, .012, .012, .1, A + .002, H, M + .03, {
    seg: 6
  });
  t.box(u, .9, .03, .3, w, .105, l + .15, {
    r: .006
  });
  t.box(c, o + .36, .1, r + .4, 0, b + .05, 0, {
    r: .02,
    col: (H, O, q) => {
      let U = .72 + .2 * ri(H * 1.5, q * 1.5 + s);
      return [U, U, U * .97];
    }
  });
  t.box(u, o + .3, .03, r + .34, 0, b + .112, 0, {
    r: .01
  });
  for (let H of [-1, 1]) t.box(h, o + .36, .06, .08, 0, b - .005, H * (l + .2 + .03), {
    r: .012
  });
  t.tube(h, [[-a - .16, b - .03, l + .23], [-a - .1, b - .2, l + .1], [-a - .03, b - .4, l + .03], [-a - .03, .2, l + .03], [-a - .1, .06, l + .1]], .03, {
    seg: 6,
    tension: .2
  });
  let S = -a - .17;
  t.box(c, .3, .52, .78, S, .62, -.25, {
    r: .02
  });
  t.add(c, je(pr(.44, .44, 6), S - .151, .62, -.14, [0, -hn / 2, 0]), [.06, .06, .06]);
  for (let H = -3; H <= 3; H++) t.add(u, je(boxGeometry(.006, .008, Math.sqrt(.22 * .22 - (H * .06) ** 2) * 2), S - .154, .62 + H * .06, -.14));
  t.cyl(u, .05, .05, .012, S - .156, .62, -.14, {
    seg: 8,
    rot: [0, 0, hn / 2]
  });
  for (let H of [-.55, .05]) t.beam(u, [-a, .32, H], [S - .1, .34, H], .03, .03, {
    r: 0
  });
  t.tube(t.M("rubber"), [[S + .05, .86, .14], [S + .06, 1, .2], [-a - .02, 1.25, .24], [-a - .02, 2.2, .24]], .014, {
    seg: 5
  });
  t.add(t.M("floor_epoxy"), je(Nc(o - .1, r - .1), 0, .122, 0, [-hn / 2, 0, 0]));
  t.box(p, .6, .04, r - .3, -a + .4, .76, 0, {
    r: .008
  });
  for (let H of [-.85, .85]) t.box(u, .5, .64, .03, -a + .4, .44, H, {
    r: .005
  });
  t.box(d, .05, .32, .5, -a + .3, 1.02, -.3, {
    r: .01,
    rot: [0, .25, 0]
  });
  t.add(i.mats.emissive(9418984, 1.6), je(cn(.45, .27), -a + .3 + .027, 1.02, -.3 - .007, [0, hn / 2 + .25, 0]), null, true);
  t.box(d, .05, .1, .06, -a + .28, .83, -.3, {
    r: .008
  });
  t.box(d, .18, .015, .22, -a + .28, .787, -.3, {
    r: .004
  });
  t.box(d, .14, .02, .42, -a + .52, .79, -.25, {
    r: .004
  });
  t.box(d, .46, .07, .46, -a + 1, .5, -.2, {
    r: .02,
    rot: [0, .3, 0]
  });
  t.box(d, .07, .55, .42, -a + 1.22, .86, -.13, {
    r: .02,
    rot: [0, .3, -.12]
  });
  t.cyl(u, .025, .025, .36, -a + 1, .3, -.2, {
    seg: 6
  });
  for (let H = 0; H < 5; H++) {
    let O = H * hn * .4;
    t.beam(u, [-a + 1, .16, -.2], [-a + 1 + Math.cos(O) * .26, .14, -.2 + Math.sin(O) * .26], .03, .025, {
      r: 0
    });
  }
  t.box(u, .2, .07, .1, w, y + .19, l + .03, {
    r: .012
  });
  t.add(i.mats.emissive(16767398, e.on === false ? .02 : 5), je(cn(.17, .05), w, y + .152, l + .035, [hn / 2, 0, 0]), null, true);
  t.decal(Mi(i, "GATE CONTROL", {
    color: "black",
    font: "stencil",
    distress: .2
  }), .1, -.45, (b + y) / 2, l - .003, null, .9);
  t.decal(Jn(i, "berth4"), .34, a - .003, .56, .3, [0, hn / 2, 0]);
  t.decal(Jn(i, "no_entry"), .2, w, .72, M + .0265, null);
  t.decal(Jn(i, "grime_streak"), .7, -.6, .55, l - .003, null, .3);
  t.decal(Jn(i, "rust_run"), .6, -a + .003 - 0, .6, .55, [0, -hn / 2, 0], .25);
  let z = t.group();
  z.userData.lamps = [{
    pos: [w, y + .14, l + .04],
    dir: [0, -1, .2],
    color: 16767398
  }];
  return qi(z, "guard_booth", ca("guard_booth"), [{
    min: [-a, 0, -l],
    max: [a, 2.54, l],
    surface: "metal"
  }]);
}
function C3(i, e = {}) {
  let t = new jn(i);
  let n = MathUtils.clamp(e.open || 0, 0, 1);
  let s = t.M("paint_orange", {
    vertexColors: true
  });
  let o = t.M("paint_white");
  let r = t.M("paint_red");
  let a = t.M("steel_dark");
  let l = t.M("steel_galv");
  let c = t.M("paint_yellow");
  let u = -2.5 + .19;
  let h = .92;
  t.box(t.M("concrete"), .5, .06, .46, u, .03, 0, {
    r: .015
  });
  t.box(s, .36, 1, .3, u, .56, 0, {
    r: .02,
    col: (y, b) => {
      let m = .6 + .4 * mn(.05, .5, b);
      return [m, m, m];
    }
  });
  t.box(a, .4, .04, .34, u, 1.075, 0, {
    r: .012
  });
  t.box(s, .3, .6, .012, u, .5, .151, {
    r: .004,
    col: [.9, .9, .9]
  });
  t.cyl(l, .012, .012, .016, u + .1, .5, .16, {
    seg: 6,
    rot: [hn / 2, 0, 0]
  });
  t.decal(Jn(i, "hazard_general"), .14, u, .9, .153, null);
  t.decal(Jn(i, "caution_stripes"), .08, u, .12, .153, null, .34);
  t.cyl(a, .03, .03, .05, u, 1.12, 0, {
    seg: 8
  });
  t.add(i.mats.emissive(16734750, 2.2), je(cylinderGeometry(.026, .026, .045, 8), u, 1.165, 0), null, true);
  t.push(_o(u, h, 0, [0, 0, n * 1.48]));
  t.cyl(a, .075, .075, .36, 0, 0, 0, {
    seg: 10,
    rot: [hn / 2, 0, 0]
  });
  for (let y of [-1, 1]) t.box(a, .62, .11, .012, .05, 0, y * .175, {
    r: .004
  });
  t.box(a, .3, .16, .3, -.33, -.02, 0, {
    r: .02
  });
  let f = 4.62;
  let p = .12;
  let d = 9;
  let v = f / d;
  for (let y = 0; y < d; y++) t.box(y % 2 ? o : r, v + .001, .1 - y * .003, .05, p + v * (y + .5), 0, 0, {
    r: .008
  });
  t.box(a, .03, .11, .06, p + f + .012, 0, 0, {
    r: .008
  });
  t.add(i.mats.emissive(16722450, 1.5), je(boxGeometry(.05, .03, .054), p + f - .5, .058, 0), null, true);
  t.pop();
  let g = 2.5 - .1;
  t.box(t.M("concrete"), .3, .05, .3, g, .025, 0, {
    r: .012
  });
  t.cyl(c, .04, .04, .8, g, .45, 0, {
    seg: 8
  });
  t.box(c, .14, .02, .16, g, .855, 0, {
    r: .005
  });
  for (let y of [-1, 1]) t.box(c, .14, .14, .014, g, .93, y * .073, {
    r: .004
  });
  t.cyl(l, .07, .07, .01, g, .055, 0, {
    seg: 8
  });
  let x = [{
    min: [u - .2, 0, -.17],
    max: [u + .2, 1.1, .17],
    surface: "metal"
  }, {
    min: [g - .07, 0, -.08],
    max: [g + .07, 1, .08],
    surface: "metal"
  }];
  n < .5 && x.push({
    min: [u, h - .07, -.04],
    max: [g, h + .07, .04],
    surface: "metal"
  });
  return qi(t.group(), "gate_arm", ca("gate_arm"), x);
}
function P3(i, e = {}) {
  let t = new jn(i);
  let n = (e.seed | 0) * 2.1;
  let s = t.M("steel_dark", {
    vertexColors: true
  });
  let o = t.M("steel_rust");
  let r = (a, l, c) => {
    let u = mn(.3, .4, l) * mn(.47, .4, l);
    let h = .75 + .4 * ri(a * 6 + n, c * 6 + l * 4) + u * .9;
    return [h, h * .97, h * .93];
  };
  t.defCol.set(s, r);
  t.cyl(s, .34, .35, .045, 0, .0225, 0, {
    seg: 20
  });
  t.cyl(o, .37, .37, .006, 0, .003, 0, {
    seg: 20
  });
  for (let a = 0; a < 6; a++) {
    let l = a * hn / 3 + .3;
    t.cyl(o, .026, .026, .03, Math.cos(l) * .285, .058, Math.sin(l) * .285, {
      seg: 6,
      flat: true
    });
    t.cyl(o, .013, .013, .022, Math.cos(l) * .285, .08, Math.sin(l) * .285, {
      seg: 6
    });
  }
  t.add(s, g1([[.25, .045], [.21, .08], [.165, .16], [.145, .27], [.15, .36], [.17, .43], [.19, .5], [.17, .57], [.1, .6], [0, .602]], 18));
  t.cyl(s, .105, .115, .5, 0, .485, 0, {
    seg: 14,
    open: true,
    rot: [0, 0, hn / 2]
  });
  for (let a of [-1, 1]) {
    let l = mr(.108, 14, 8);
    l.scale(.55, 1, 1);
    t.add(s, je(l, a * .25, .485, 0));
    t.cyl(s, .125, .125, .03, a * .235, .485, 0, {
      seg: 14,
      rot: [0, 0, hn / 2]
    });
  }
  return qi(t.group(), "bollard_mooring", ca("bollard_mooring"), [{
    min: [-.3, 0, -.22],
    max: [.3, .6, .22],
    surface: "metal"
  }]);
}
function I3(i, e = {}) {
  let t = new jn(i);
  let n = (e.seed | 0) * 1.7;
  let s = t.M("paint_yellow", {
    vertexColors: true
  });
  let o = t.M("steel_galv");
  let r = .083;
  let a = u => u > .6 && u < .69 || u > .78 && u < .87;
  let l = [.012, .3, .6, .6001, .69, .6901, .78, .7801, .87, .8701, .955];
  for (let u = 0; u < l.length - 1; u++) {
    let h = l[u];
    let f = l[u + 1];
    if (f - h < .001) continue;
    let p = a((h + f) / 2);
    t.cyl(s, r, r, f - h, 0, (h + f) / 2, 0, {
      seg: 14,
      open: true,
      col: (d, v, g) => {
        if (p) return [.05, .05, .05];
        let x = (.55 + .45 * mn(0, .35, v)) * (.9 + .2 * ri(d * 30 + n, v * 6 + g * 30));
        return [x, x * .97, x * .9];
      }
    });
  }
  let c = mr(r, 14, 5, hn * 2, 0, hn / 2);
  c.scale(1, .55, 1);
  t.add(s, je(c, 0, .955, 0), [.95, .93, .88]);
  t.cyl(o, .085, .085, .012, 0, .006, 0, {
    seg: 4,
    rot: [0, hn / 4, 0]
  });
  t.box(o, .17, .012, .17, 0, .006, 0, {
    r: .004
  });
  for (let u of [-1, 1]) for (let h of [-1, 1]) t.cyl(o, .011, .011, .012, u * .066, .017, h * .066, {
    seg: 6
  });
  t.cyl(s, r + .006, r + .006, .02, 0, .022, 0, {
    seg: 14,
    open: true,
    col: [.5, .48, .42]
  });
  return qi(t.group(), "bollard_post", ca("bollard_post"), [{
    min: [-.085, 0, -.085],
    max: [.085, 1, .085],
    surface: "metal"
  }]);
}
var Jg = ["hazard_general", "no_entry", "hazard_voltage", "berth4", "arrow", "hazard_flammable"];
var E3 = ["AUTHORISED PERSONNEL ONLY", "NO PEDESTRIANS", "HI-VIS AND HELMET", "AUTOMATED VEHICLES", "KEEP CLEAR"];
function z3(i, e = {}) {
  let t = new jn(i);
  let n = e.seed | 0;
  let s = t.M("steel_galv");
  let o = t.M("aluminium");
  let r = t.M("paint_white");
  let a = t.M("paint_yellow");
  let l = Jg.includes(e.sign) ? e.sign : Jg[n % Jg.length];
  t.box(t.M("concrete"), .3, .07, .3, 0, .03, 0, {
    r: .015
  });
  t.box(s, .05, 2.38, .05, 0, 1.2, 0, {
    r: .006
  });
  t.box(s, .058, .012, .058, 0, 2.395, 0, {
    r: .004
  });
  t.box(s, .13, .012, .13, 0, .07, 0, {
    r: .003
  });
  let c = (n % 5 - 2) * .006;
  t.push(_o(0, 0, 0, [0, 0, c]));
  t.box(o, .6, .6, .004, 0, 2.02, .031, {
    r: .0015
  });
  t.box(l.startsWith("hazard") ? a : r, .58, .58, .002, 0, 2.02, .034, {
    r: 8e-4
  });
  t.decal(Jn(i, l), .5, 0, 2.02, .0362, null, .5);
  t.box(o, .6, .22, .004, 0, 1.56, .031, {
    r: .0015
  });
  t.box(r, .58, .2, .002, 0, 1.56, .034, {
    r: 8e-4
  });
  t.decal(Mi(i, e.text || E3[n % E3.length], {
    color: "black",
    font: "sans",
    distress: .15
  }), .07, 0, 1.56, .0362, null, .52);
  for (let u of [1.85, 2.2, 1.56]) {
    t.box(s, .5, .03, .012, 0, u, .024, {
      r: 0
    });
    t.box(s, .09, .04, .07, 0, u, -.002, {
      r: .004
    });
  }
  for (let [u, h] of [[-.26, 2.28], [.26, 2.28], [-.26, 1.76], [.26, 1.76]]) t.cyl(s, .008, .008, .004, u, h, .0365, {
    seg: 6,
    rot: [hn / 2, 0, 0]
  });
  t.pop();
  return qi(t.group(), "sign_post", ca("sign_post"), [{
    min: [-.03, 0, -.03],
    max: [.03, 2.4, .03],
    surface: "metal"
  }, {
    min: [-.3, 1.44, .02],
    max: [.3, 2.33, .04],
    surface: "metal",
    bulletOnly: true
  }]);
}
function D3(i, e = {}) {
  let t = new jn(i);
  let n = e.seed | 0;
  let s = $a(n + 3);
  let o = t.M("paint_yellow");
  let r = t.M("steel_dark");
  let a = t.M("aluminium");
  let l = t.M("rubber");
  let c = i.mats.emissive(16773596, e.on === false ? .02 : 10);
  t.cyl(a, .021, .021, 1.1, 0, .75, 0, {
    seg: 8,
    open: true
  });
  t.cyl(a, .016, .016, .9, 0, 1.6, 0, {
    seg: 8,
    open: true
  });
  t.cyl(r, .03, .03, .06, 0, 1.3, 0, {
    seg: 8
  });
  t.bar(r, [.03, 1.3, 0], [.085, 1.3, 0], .008, {
    caps: true
  });
  t.box(r, .02, .03, .05, .09, 1.3, 0, {
    r: .005
  });
  t.cyl(r, .032, .032, .07, 0, .82, 0, {
    seg: 8
  });
  t.cyl(r, .03, .03, .05, 0, .36, 0, {
    seg: 8
  });
  for (let d = 0; d < 3; d++) {
    let v = d * hn * 2 / 3 + .5;
    let g = Math.cos(v);
    let x = Math.sin(v);
    t.bar(a, [g * .035, .82, x * .035], [g * .5, .025, x * .5], .013, {
      seg: 6
    });
    t.bar(a, [g * .03, .36, x * .03], [g * .3, .37, x * .3], .008, {
      seg: 5
    });
    t.add(l, je(mr(.028, 8, 5), g * .5, .02, x * .5));
  }
  t.box(r, .05, .04, .72, 0, 2.03, 0, {
    r: .008
  });
  for (let d of [-1, 1]) {
    t.push(_o(.03, 2.03, d * .2, [0, d * -.12, 0]));
    t.push(_o(0, 0, 0, [0, 0, -.22]));
    t.box(o, .075, .24, .32, .06, .02, 0, {
      r: .012
    });
    t.add(c, je(cn(.28, .2), .0985, .02, 0, [0, hn / 2, 0]), null, true);
    t.box(r, .012, .25, .012, .1, .02, .157, {
      r: 0
    });
    t.box(r, .012, .25, .012, .1, .02, -.157, {
      r: 0
    });
    t.box(r, .012, .012, .33, .1, .143, 0, {
      r: 0
    });
    t.box(r, .012, .012, .33, .1, -.103, 0, {
      r: 0
    });
    for (let v = -3; v <= 3; v++) t.add(r, je(boxGeometry(.035, .2, .006), .008, .02, v * .043));
    t.tube(o, [[.05, .14, -.1], [.05, .2, -.06], [.05, .2, .06], [.05, .14, .1]], .008, {
      seg: 5
    });
    t.pop();
    t.pop();
  }
  let u = s() * hn * 2;
  let h = Math.cos(u);
  let f = Math.sin(u);
  t.tube(l, [[0, 2, .03], [-.03, 1.7, .04], [.035, 1.25, .02], [-.03, .9, .03], [.05, .5, .06], [.12, .08, .1], [.25, .012, .16], [.3 + h * .3, .012, .2 + f * .3], [.2 + h * .75 - f * .2, .012, .1 + f * .75 + h * .2], [h * 1.2, .012, f * 1.2]], .011, {
    seg: 5
  });
  t.box(o, .09, .05, .06, h * 1.24, .026, f * 1.24, {
    r: .01,
    rot: [0, -u, 0]
  });
  let p = t.group();
  p.userData.lamps = [{
    pos: [.14, 2.03, 0],
    dir: [.976, -.218, 0],
    color: 16773596
  }];
  return qi(p, "floodlight_stand", ca("floodlight_stand"), [{
    min: [-.12, 0, -.12],
    max: [.12, 2.2, .12],
    surface: "metal"
  }]);
}
var b1 = i => PROP_SIZES[i].slice(0, 3);
var wi = Math.PI;
function k3(i, e = {}) {
  let t = new jn(i);
  let n = t.M("diamond_plate");
  let s = t.M("steel_dark");
  let o = t.M("paint_yellow");
  let r = t.M("steel_galv");
  let a = 12;
  let l = .2;
  let c = .2;
  let u = -1.5;
  let h = .5;
  let f = u + a * c;
  let p = [];
  for (let g = 0; g < a; g++) {
    let x = (g + 1) * l;
    let y = u + g * c;
    t.box(n, .25, .03, .9, y + .125, x - .015, 0, {
      r: .005
    });
    t.box(o, .035, .034, .9, y + .016, x - .015, 0, {
      r: .006
    });
    for (let b of [-1, 1]) t.box(s, .2, .05, .01, y + .13, x - .05, b * .452, {
      r: 0
    });
    p.push({
      min: [y, 0, -h],
      max: [y + c, x, h],
      surface: "metal"
    });
  }
  for (let g of [-1, 1]) {
    t.beam(s, [u + .07, .13, g * .465], [f + .04, 2.5, g * .465], .24, .014, {
      r: .004
    });
    t.box(r, .3, .012, .12, u + .06, .006, g * .465, {
      r: 0
    });
    for (let x of [-.08, .1]) t.cyl(r, .012, .012, .02, u + .06 + x, .02, g * .5, {
      seg: 6
    });
  }
  let d = (a + 1) * l;
  t.box(n, .64, .035, .96, f + .3, d - .0175, 0, {
    r: .005
  });
  t.box(o, .035, .038, .96, f + .016, d - .0175, 0, {
    r: .006
  });
  for (let g of [-1, 1]) t.box(s, .66, .16, .06, f + .3, d - .115, g * .47, {
    r: .008
  });
  t.box(s, .06, .16, .96, 1.47, d - .115, 0, {
    r: .008
  });
  t.box(s, .06, .12, .9, f + .02, d - .1, 0, {
    r: .008
  });
  for (let g of [-1, 1]) {
    t.box(s, .08, d - .19, .08, 1.44, (d - .19) / 2, g * .45, {
      r: .008
    });
    t.box(r, .18, .012, .18, 1.44, .006, g * .45, {
      r: 0
    });
    t.beam(s, [1.44, 1.5, g * .45], [f + .1, d - .2, g * .45], .05, .05, {
      r: .006
    });
  }
  t.beam(s, [1.44, .15, -.42], [1.44, 2.2, .42], .045, .008, {
    r: 0
  });
  t.beam(s, [1.44, .15, .42], [1.44, 2.2, -.42], .045, .008, {
    r: 0
  });
  t.box(s, .06, .06, .82, 1.44, 1.2, 0, {
    r: .006
  });
  p.push({
    min: [f, d - .2, -h],
    max: [1.5, d, h],
    surface: "metal"
  });
  for (let g of [-1, 1]) p.push({
    min: [1.4, 0, g * .45 - .04],
    max: [1.48, d - .2, g * .45 + .04],
    surface: "metal"
  });
  let v = g => (g - u) / c * l + l;
  for (let g of [-1, 1]) {
    let x = g * .485;
    let y = [[u + .1, v(u + .1)], [u + .9, v(u + .9) - .1], [u + 1.7, v(u + 1.7) - .1], [f + .03, d], [1.47, d]];
    for (let [b, m] of y) {
      t.bar(o, [b, m - .12, x], [b, m + 1, x], .019, {
        seg: 7
      });
      t.box(s, .07, .1, .012, b, m - .1, x - g * .012, {
        r: 0
      });
    }
    for (let b of [1, .52]) {
      let m = b === 1 ? .021 : .016;
      t.bar(o, [y[0][0], y[0][1] + b, x], [y[3][0], y[3][1] + b, x], m, {
        seg: 7
      });
      t.bar(o, [y[3][0], y[3][1] + b, x], [y[4][0], y[4][1] + b, x], m, {
        seg: 7
      });
      t.add(o, je(mr(m * 1.05, 7, 5), y[3][0], y[3][1] + b, x));
      t.add(o, je(mr(m * 1.05, 7, 5), y[0][0], y[0][1] + b, x));
      t.add(o, je(mr(m * 1.05, 7, 5), y[4][0], y[4][1] + b, x));
    }
    t.box(s, .6, .1, .008, f + .3, d + .05, g * .476, {
      r: 0
    });
    p.push({
      min: [f, d, x - .03],
      max: [1.5, d + 1.02, x + .03],
      surface: "metal"
    });
  }
  return qi(t.group(), "stairs_metal", b1("stairs_metal"), p);
}
function F3(i, e = {}) {
  let t = new jn(i);
  let n = t.M("steel_dark");
  let s = t.M("paint_yellow");
  let o = t.M("steel_galv");
  let r = e.rails || "both";
  let a = r === "both" ? [-1, 1] : r === "left" ? [-1] : r === "right" ? [1] : [];
  let l = .05;
  for (let u = -.51; u <= .511; u += .034) t.add(o, je(boxGeometry(2.98, .03, .004), 0, l - .015, u));
  for (let u = -1.45; u <= 1.451; u += .1) t.add(o, je(boxGeometry(.006, .006, 1.04), u, l - .004, 0));
  for (let u of [-1, 1]) {
    t.add(o, je(boxGeometry(2.99, .032, .005), 0, l - .016, u * .525));
    t.add(o, je(boxGeometry(.005, .032, 1.05), u * 1.493, l - .016, 0));
  }
  for (let u of [-1, 1]) t.box(n, 3, .18, .06, 0, l - .09, u * .565, {
    r: .008
  });
  for (let u of [-1.45, -.5, .5, 1.45]) t.box(n, .05, .1, 1.08, u, l - .085, 0, {
    r: .006
  });
  let c = [{
    min: [-1.5, l - .08, -.6],
    max: [1.5, l, .6],
    surface: "metal"
  }];
  for (let u of a) {
    let h = u * .565;
    t.box(n, 3, .1, .008, 0, l + .05, u * .535, {
      r: 0
    });
    for (let f of [-1.42, 0, 1.42]) {
      t.box(s, .045, 1.07, .045, f, l + .52, h, {
        r: .006
      });
      t.box(n, .09, .012, .09, f, l + .006, h, {
        r: 0
      });
    }
    t.bar(s, [-1.5, l + 1.05, h], [1.5, l + 1.05, h], .021, {
      seg: 7,
      caps: true
    });
    t.bar(s, [-1.5, l + .55, h], [1.5, l + .55, h], .016, {
      seg: 6,
      caps: true
    });
    c.push({
      min: [-1.5, l, h - .035],
      max: [1.5, l + 1.05, h + .035],
      surface: "metal"
    });
  }
  return qi(t.group(), "catwalk", b1("catwalk"), c);
}
function L3(i, e, t, n, s) {
  for (let o = -2; o <= 2; o++) i.add(e, je(boxGeometry(.14 + (o === 0 ? .02 : 0), .022, 1), t + o * .2525, n + .133, s));
  for (let o of [-1, 0, 1]) i.add(e, je(boxGeometry(1.15, .022, .1), t, n + .111, s + o * .45));
  for (let o of [-1, 0, 1]) for (let r of [-1, 0, 1]) i.add(e, je(boxGeometry(.14, .078, .1), t + r * .505, n + .061, s + o * .45));
  for (let o of [-1, 0, 1]) i.add(e, je(boxGeometry(1.15, .022, .1), t, n + .011, s + o * .45));
}
function DA(i, e, t, n, s, o, r) {
  L3(i, e.wood, n, s, o);
  let a = s + .144;
  if (t === "cartons") {
    let l = 2 + Math.floor(r() * 2);
    let c = .36;
    for (let u = 0; u < l; u++) for (let h of [-1, 1]) for (let f of [-1, 1]) u === l - 1 && r() < .25 || (i.box(e.card, .53, c - .006, .46, n + h * .272 + (r() - .5) * .02, a + c * (u + .5), o + f * .237 + (r() - .5) * .02, {
      r: .008,
      rot: [0, (r() - .5) * .05, 0]
    }), i.add(e.tape, je(boxGeometry(.535, .002, .05), n + h * .272, a + c * (u + 1) - .004, o + f * .237)));
    for (let u of [-.3, .3]) {
      i.add(e.poly, je(boxGeometry(.016, l * c + .004, .002), n + u, a + l * c / 2, o + .475));
      i.add(e.poly, je(boxGeometry(.016, l * c + .004, .002), n + u, a + l * c / 2, o - .475));
    }
  } else if (t === "wrapped") {
    let l = .9 + r() * .25;
    i.box(e.card, 1.08, l, .92, n, a + l / 2, o, {
      r: .012
    });
    i.box(e.wrap, 1.1, l + .012, .94, n, a + l / 2 + .002, o, {
      r: .03
    });
    for (let c of [-1, 1]) for (let u of [-1, 1]) i.box(e.card, .05, l * .96, .05, n + c * .535, a + l / 2, o + u * .455, {
      r: .004
    });
    i.decal(Mi(i.G, "LOT " + (1e3 + Math.floor(r() * 8999)), {
      color: "black",
      font: "sans",
      distress: .1
    }), .06, n + .2, a + l * .7, o + .474, null, .3);
  } else if (t === "drums") {
    for (let l of [-1, 1]) for (let c of [-1, 1]) {
      let u = n + l * .285;
      let h = o + c * .24;
      let f = r() < .3 ? e.drum2 : e.drum;
      i.cyl(f, .225, .225, .86, u, a + .43, h, {
        seg: 14,
        open: true
      });
      for (let p of [.29, .58]) i.cyl(f, .233, .233, .022, u, a + p, h, {
        seg: 14,
        open: true
      });
      i.cyl(f, .232, .232, .02, u, a + .85, h, {
        seg: 14,
        open: true
      });
      i.cyl(f, .232, .232, .02, u, a + .01, h, {
        seg: 14,
        open: true
      });
      i.add(e.dark, je(pr(.44, .44, 4), u, a + .845, h, [-wi / 2, 0, 0]));
      i.cyl(e.dark, .03, .03, .02, u + .13, a + .855, h, {
        seg: 6
      });
    }
    i.add(e.poly, je(boxGeometry(1.04, .03, .002), n, a + .6, o + .468));
    i.add(e.poly, je(boxGeometry(1.04, .03, .002), n, a + .6, o - .468));
  } else if (t === "pallets") {
    let l = 2 + Math.floor(r() * 4);
    for (let c = 0; c < l; c++) L3(i, e.wood, n + (r() - .5) * .04, a + c * .146, o + (r() - .5) * .04);
  }
}
function U3(i, e = {}) {
  let t = new jn(i);
  let n = e.seed | 0;
  let s = $a(n + 21);
  let o = t.M("paint_blue", {
    vertexColors: true
  });
  let r = t.M("paint_orange");
  let a = t.M("steel_galv");
  let l = {
    wood: t.M("wood_pallet"),
    card: t.M("cardboard"),
    tape: t.M("polymer_tan"),
    poly: t.M("polymer_black"),
    wrap: t.M("glass_dirty"),
    drum: t.M("plastic_blue"),
    drum2: t.M("paint_red"),
    dark: t.M("steel_dark")
  };
  let c = 4.2;
  let u = 1.305;
  let h = .5;
  let f = [.04, .04, .05];
  for (let v of [-1, 1]) {
    for (let x of [-1, 1]) {
      t.box(o, .09, c, .07, v * u, c / 2, x * h, {
        r: .008,
        col: (y, b) => {
          let m = .7 + .3 * mn(0, .5, b);
          return [m, m, m];
        }
      });
      t.box(a, .14, .01, .12, v * u, .005, x * h, {
        r: 0
      });
      for (let y of [-.05, .05]) t.cyl(a, .01, .01, .02, v * u + y, .016, x * h, {
        seg: 6
      });
      for (let y = .12; y < c - .05; y += .1) for (let b of [-.022, .022]) t.add(o, je(cn(.014, .034), v * u + b, y, x * (h + .0356), [0, x > 0 ? 0 : wi, 0]), f);
    }
    let g = [.2, 1.1, 2, 2.9, 3.8];
    for (let x = 0; x < g.length; x++) {
      t.box(o, .03, .03, 2 * h - .07, v * u, g[x], 0, {
        r: 0
      });
      x < g.length - 1 && t.beam(o, [v * u, g[x], x % 2 ? h - .04 : -h + .04], [v * u, g[x + 1], x % 2 ? -h + .04 : h - .04], .03, .03, {
        r: 0
      });
    }
    t.box(t.M("paint_yellow"), .14, .4, .02, v * u, .2, h + .06, {
      r: .006
    });
  }
  let p = [1.45, 2.86];
  for (let v of p) {
    for (let g of [-1, 1]) {
      t.box(r, 2 * u - .09, .12, .05, 0, v, g * (h + .01), {
        r: .008
      });
      for (let x of [-1, 1]) t.box(r, .012, .2, .065, x * (u - .051), v - .02, g * (h + .005), {
        r: 0
      });
    }
    for (let g of [-.85, 0, .85]) t.add(a, je(boxGeometry(.04, .025, 2 * h), g, v + .045, 0));
    for (let g = -.45; g <= .451; g += .1) t.add(a, je(boxGeometry(2 * u - .1, .005, .005), 0, v + .062, g));
    for (let g = -1.2; g <= 1.201; g += .2) t.add(a, je(boxGeometry(.005, .005, 2 * h + .04), g, v + .066, 0));
  }
  t.decal(Mi(i, "BAY " + String.fromCharCode(65 + n % 6) + "-" + (10 + n % 40), {
    color: "black",
    font: "sans",
    distress: .1
  }), .07, 0, p[0], h + .0365, null, .34);
  t.decal(Mi(i, "MAX 2000 KG / LEVEL", {
    color: "black",
    font: "sans",
    distress: .1
  }), .045, .6, p[1], h + .0365, null, .5);
  let d = ["cartons", "wrapped", "drums", "cartons", "wrapped", "pallets", "none"];
  [0, p[0] + .068, p[1] + .068].forEach((v, g) => {
    for (let x of [-1, 1]) {
      let y = d[Math.floor(s() * d.length)];
      g === 2 && y === "drums" && (y = "wrapped");
      y !== "none" && DA(t, l, y, x * .615 + (s() - .5) * .03, v, (s() - .5) * .05, s);
    }
  });
  return qi(t.group(), "shelf_rack", b1("shelf_rack"), [{
    min: [-1.35, 0, -.55],
    max: [1.35, 4.2, .55],
    surface: "metal"
  }]);
}
function N3(i, e = {}) {
  let t = new jn(i);
  let n = e.seed | 0;
  let s = n * 2.3;
  let o = t.M("paint_white", {
    vertexColors: true
  });
  let r = t.M("steel_dark");
  let a = t.M("steel_galv");
  let l = t.M("paint_grey");
  let c = t.M("brass");
  let u = t.M("rubber");
  let h = t.M("aluminium");
  let f = (g, x, y) => {
    let b = (.86 + .18 * ri(y * 2 + s, x * 2)) * (.62 + .38 * mn(0, .6, x));
    return [b, b * .985, b * .955];
  };
  t.defCol.set(o, f);
  let p = [.05, .05, .055];
  e.flip || t.push(_o(0, 0, 0, [0, wi, 0]));
  let d = .13;
  t.box(o, .38, 2.3, 2.3, -.06, 1.15, 0, {
    r: .012
  });
  for (let g of [-1, 1]) t.box(o, .12, 2.3, .09, .19, 1.15, g * 1.105, {
    r: .012
  });
  t.box(o, .12, .09, 2.12, .19, 2.255, 0, {
    r: .012
  });
  t.box(o, .12, .1, 2.12, .19, .05, 0, {
    r: .012
  });
  t.box(o, .1, .06, 2.12, .18, 1.42, 0, {
    r: .01
  });
  t.box(o, .1, .06, 2.12, .18, .9, 0, {
    r: .01
  });
  for (let g of [.3, .9, 1.5, 2.1]) for (let x of [-1, 1]) t.cyl(a, .014, .014, .012, .255, g, x * 1.105, {
    seg: 6,
    rot: [0, 0, wi / 2]
  });
  for (let g of [-.8, -.3, .3, .8]) for (let x of [.05, 2.255]) t.cyl(a, .014, .014, .012, .255, x, g, {
    seg: 6,
    rot: [0, 0, wi / 2]
  });
  for (let g of [-1, 1]) {
    let x = g * .53;
    let y = 1.83;
    t.add(o, je(pr(.66, .66, 6), d + .004, y, x, [0, wi / 2, 0]), p);
    t.cyl(o, .335, .345, .1, d + .05, y, x, {
      seg: 20,
      open: true,
      rot: [0, 0, wi / 2]
    });
    t.cyl(o, .36, .36, .014, d + .006, y, x, {
      seg: 20,
      open: true,
      rot: [0, 0, wi / 2]
    });
    for (let b = 0; b < 3; b++) t.add(r, je(boxGeometry(.012, .6, .12), d + .04, y, x, [b * wi / 3 + g * .4, .5, 0]));
    t.cyl(r, .07, .07, .06, d + .05, y, x, {
      seg: 10,
      rot: [0, 0, wi / 2]
    });
    for (let b = 0; b < 8; b++) {
      let m = b * wi / 4;
      t.add(a, je(boxGeometry(.005, .66, .005), d + .098, y, x, [m, 0, 0]));
    }
    for (let b of [.12, .22, .32]) t.cyl(a, b, b, .006, d + .1, y, x, {
      seg: 20,
      open: true,
      rot: [0, 0, wi / 2]
    });
  }
  t.decal(Mi(i, "KELVAR  MARINE  REFRIGERATION", {
    color: "black",
    font: "sans",
    distress: .2
  }), .05, .2505, 2.255, 0, [0, wi / 2, 0], 1.2);
  for (let g of [-1, 1]) {
    t.add(o, je(cn(.98, .44), d + .004, 1.16, g * .53, [0, wi / 2, 0]), p);
    for (let x = 0; x < 9; x++) t.box(o, .06, .006, .98, d + .035, .965 + x * .049, g * .53, {
      r: 0,
      rot: [0, 0, -.75]
    });
    t.box(o, .05, .46, .03, d + .03, 1.16, g * .53, {
      r: .005
    });
  }
  t.add(o, je(cn(1, .76), d + .004, .49, -.53, [0, wi / 2, 0]), p);
  t.cyl(r, .15, .15, .46, d + .1, .36, -.58, {
    seg: 14,
    open: true,
    rot: [wi / 2, 0, 0]
  });
  for (let g of [-1, 1]) {
    let x = mr(.15, 14, 6);
    x.scale(1, 1, .45);
    t.add(r, je(x, d + .1, .36, -.58 + g * .23));
  }
  t.box(r, .26, .03, .5, d + .1, .19, -.58, {
    r: .006
  });
  t.cyl(h, .07, .07, .4, d + .07, .5, -.17, {
    seg: 10
  });
  t.tube(c, [[d + .1, .5, -.5], [d + .1, .68, -.5], [d + .08, .78, -.4], [d + .08, .8, -.2], [d + .07, .72, -.17]], .012, {
    seg: 6
  });
  t.tube(c, [[d + .12, .42, -.36], [d + .14, .6, -.33], [d + .1, .84, -.34], [d + .06, .88, -.6], [d + .03, .88, -.9]], .009, {
    seg: 6
  });
  t.tube(c, [[d + .1, .36, -.82], [d + .1, .36, -.93], [d + .06, .6, -.96], [d + .04, .86, -.96]], .012, {
    seg: 6
  });
  t.box(t.M("paint_red"), .04, .05, .05, d + .12, .6, -.33, {
    r: .008
  });
  let v = .55;
  t.box(l, .11, .56, .74, d + .055, .5, v, {
    r: .012
  });
  t.box(l, .012, .5, .68, d + .114, .5, v, {
    r: .004
  });
  t.add(r, je(cn(.26, .11), d + .1215, .66, v - .1, [0, wi / 2, 0]));
  t.add(i.mats.emissive(16757850, 2.4), je(cn(.15, .05), d + .122, .665, v - .06, [0, wi / 2, 0]), null, true);
  t.add(i.mats.emissive(5832570, 3), je(cn(.014, .014), d + .122, .66, v - .2, [0, wi / 2, 0]), null, true);
  for (let g = 0; g < 4; g++) for (let x = 0; x < 2; x++) t.box(r, .008, .03, .03, d + .122, .5 - x * .045, v - .04 - g * .045, {
    r: .003
  });
  t.box(t.M("paint_red"), .03, .09, .03, d + .13, .42, v + .22, {
    r: .006
  });
  t.cyl(a, .012, .012, .1, d + .124, .5, v + .325, {
    seg: 6
  });
  t.decal(Jn(i, "hazard_voltage"), .11, d + .1215, .64, v + .2, [0, wi / 2, 0]);
  t.tube(u, [[d + .06, .78, v + .2], [d + .06, .95, v + .25], [d + .05, 1.4, v + .5], [d + .05, 1.5, v - 0]], .012, {
    seg: 5
  });
  t.tube(u, [[d + .06, .78, v - .2], [d + .06, .92, v - .3], [d + .05, .93, -.1]], .01, {
    seg: 5
  });
  t.cyl(a, .022, .022, .04, d + .06, .2, v + .2, {
    seg: 8
  });
  t.tube(u, [[d + .06, .2, v + .2], [d + .08, .12, v + .1], [d + .1, .16, v - .15], [d + .1, .2, v - .3], [d + .1, .13, v - .36], [d + .09, .12, v - .1], [d + .09, .14, v + .05]], .016, {
    seg: 6
  });
  t.box(t.M("paint_blue"), .07, .07, .12, d + .09, .14, v + .1, {
    r: .015
  });
  t.decal(Jn(i, "grime_streak"), .8, .2512, .5, -1.105, [0, wi / 2, 0], .08);
  e.flip || t.pop();
  return qi(t.group(), "reefer_unit", b1("reefer_unit"), [{
    min: [-.25, 0, -1.15],
    max: [.25, 2.3, 1.15],
    surface: "metal"
  }]);
}
var es = Math.PI;
var Kg = new Color(16752680);
var LA = new Color(16721940);
var kA = new Color(16767392);
function B3(i, e = {}) {
  let t = e.seed | 0;
  let n = t * 1.9;
  let s = e.id || e.label || "ABC"[t % 3];
  let o = new jn(i);
  let r = new jn(i);
  let a = new jn(i);
  let l = new jn(i);
  let c = o.M("paint_grey", {
    vertexColors: true
  });
  let u = o.M("steel_dark");
  let h = o.M("steel_galv");
  let f = o.M("aluminium");
  let p = o.M("rubber");
  let d = o.M("concrete", {
    vertexColors: true
  });
  let v = (le, R, I) => {
    let se = (.88 + .2 * ri(le * 3 + n, R * 3 + I * 2)) * (.6 + .4 * mn(.16, .7, R));
    return [se, se, se * .98];
  };
  o.defCol.set(c, v);
  r.defCol.set(c, (le, R, I) => {
    let se = .9 + .14 * ri(le * 4 + n, R * 3);
    return [se, se, se];
  });
  let g = [.035, .035, .04];
  let x = {
    em: true
  };
  o.box(d, 1.36, .16, .96, 0, .08, 0, {
    r: .025,
    col: (le, R, I) => {
      let se = .6 + .38 * mn(0, .15, R) + .1 * ri(le * 5, I * 5);
      return [se, se, se * .97];
    }
  });
  o.decal(Jn(i, "caution_stripes"), .1, 0, .085, .4815, null, 1.2);
  for (let le of [-1, 1]) for (let R of [-1, 1]) {
    o.cyl(h, .016, .016, .03, le * .44, .185, R * .36, {
      seg: 6
    });
    o.box(h, .1, .012, .1, le * .44, .166, R * .36, {
      r: 0
    });
  }
  let y = -.5;
  let b = .5;
  let m = .18;
  let A = 1.62;
  let _ = -.3;
  let M = .3;
  let E = .025;
  let w = (m + A) / 2;
  let S = A - m;
  o.box(c, 1, S, E, 0, w, _ + E / 2, {
    r: .006
  });
  for (let le of [-1, 1]) o.box(c, E, S, .6, le * (.5 - E / 2), w, 0, {
    r: .006
  });
  o.box(c, 1, E, .6, 0, m + E / 2, 0, {
    r: .006
  });
  o.box(c, 1, E, .6, 0, A - E / 2, 0, {
    r: .006
  });
  o.box(c, E, S, .58, 0, w, 0, {
    r: .004
  });
  o.box(c, 1, .12, E, 0, A - .06, M - E / 2, {
    r: .006
  });
  o.box(c, 1, .07, E, 0, m + .035, M - E / 2, {
    r: .006
  });
  o.box(u, 1.04, .04, .64, 0, m - .01, 0, {
    r: .008
  });
  o.box(c, 1.12, .05, .74, 0, A + .025, .01, {
    r: .012
  });
  for (let le of [-1, 1]) o.tube(h, [[le * .4 - .04, A + .05, .2], [le * .4 - .03, A + .1, .2], [le * .4 + .03, A + .1, .2], [le * .4 + .04, A + .05, .2]], .008, {
    seg: 5
  });
  let z = (le, R, I) => [.16, .16, .17];
  o.add(c, je(cn(.45, S - .06), -.25, w, _ + E + .002), z);
  o.add(c, je(cn(.55, S - .06), y + E + .002, w, 0, [0, es / 2, 0]), z);
  o.add(c, je(cn(.55, S - .06), -E / 2 - .002, w, 0, [0, -es / 2, 0]), z);
  for (let le = 0; le < 5; le++) {
    let R = .42 + le * .22;
    o.box(u, .42, .17, .4, -.25, R, -.05, {
      r: .008
    });
    o.box(f, .4, .02, .012, -.25, R + .06, .152, {
      r: 0
    });
    for (let I = 0; I < 4; I++) a.add(x, je(cn(.012, .012), -.41 + I * .035, R - .04, .1512));
    for (let I = 0; I < 3; I++) o.add(u, je(pr(.03, .022, 2), -.2 + I * .06, R - .03, .1512), g);
  }
  let H = [p, p, p];
  for (let le = 0; le < 4; le++) o.tube(H[le % 3], [[-.2 + le % 3 * .06, .39 + le * .22, .15], [-.14 + le % 3 * .05, .36 + le * .22, .24], [-.07, .55 + le * .22, .22], [-.2 + (le + 1) % 3 * .06, .61 + le * .22, .15]], .007, {
    seg: 5
  });
  let O = .474;
  let q = 1.3;
  let U = .9;
  let T = (le, R, I) => {
    let se = R + O / 2;
    let ae = 0;
    le.box(c, O, q, .024, se, U, ae, {
      r: .006
    });
    le.box(c, O - .07, q - .07, .006, se, U, ae + .013, {
      r: .003
    });
    for (let ve of [U + .36, U - .4]) {
      le.add(c, je(cn(O - .14, .3), se, ve, ae + .0165), g);
      for (let _e = 0; _e < 7; _e++) le.box(c, O - .13, .034, .005, se, ve - .125 + _e * .042, ae + .027, {
        r: 0,
        rot: [.75, 0, 0]
      });
      le.box(c, .02, .31, .02, se - (O - .13) / 2, ve, ae + .022, {
        r: .003
      });
      le.box(c, .02, .31, .02, se + (O - .13) / 2, ve, ae + .022, {
        r: .003
      });
    }
    let k = I ? R + .07 : R + O - .07;
    le.box(u, .045, .2, .02, k, U - .02, ae + .026, {
      r: .006
    });
    le.box(h, .028, .13, .018, k, U + 0, ae + .042, {
      r: .006
    });
    le.cyl(h, .012, .012, .012, k, U - .09, ae + .04, {
      seg: 8,
      rot: [es / 2, 0, 0]
    });
    let ce = I ? R + O : R;
    for (let ve of [U - .5, U, U + .5]) le.cyl(h, .011, .011, .09, ce, ve, ae + .016, {
      seg: 6
    });
  };
  o.push(_o(0, 0, M - .004));
  T(o, .013, true);
  o.decal(Mi(i, "RELAY " + s, {
    color: "yellow",
    font: "stencil",
    distress: .15
  }), .12, .013 + O / 2, U + .02, .018, null, O - .1);
  o.decal(Mi(i, "CONTROL UPLINK", {
    color: "white",
    font: "sans",
    distress: .15
  }), .034, .013 + O / 2, U - .1, .018, null, O - .1);
  o.decal(Jn(i, "hazard_voltage"), .13, .013 + O / 2 + .1, U + .14, .018, null);
  o.pop();
  let D = [-.487, 0, M - .004];
  T(r, 0, false);
  r.decal(Jn(i, "hazard_general"), .13, O / 2, U + .1, .018, null);
  r.box(c, O - .1, .03, .014, O / 2, U + .55, -.018, {
    r: .003
  });
  r.box(c, O - .1, .03, .014, O / 2, U - .55, -.018, {
    r: .003
  });
  r.box(c, .03, 1.1, .014, .07, U, -.018, {
    r: .003
  });
  r.box(c, .03, 1.1, .014, O - .07, U, -.018, {
    r: .003
  });
  r.box(u, .24, .3, .02, O / 2, U - .05, -.02, {
    r: .004
  });
  r.add(Mi(i, "WIRING DIAGRAM  SLT-R4", {
    color: "white",
    font: "sans",
    distress: .1
  }).material, je(cn(.2, .03), O / 2, U + .03, -.0305, [0, es, 0]), null, true);
  for (let le of [U + .36, U - .4]) r.add(c, je(cn(O - .14, .3), O / 2, le, -.0125, [0, es, 0]), g);
  r.decal(Mi(i, "ISOLATE BEFORE SERVICE", {
    color: "white",
    font: "sans",
    distress: .15
  }), .03, O / 2, U - .03, .018, null, O - .1);
  for (let le of [-1, 1]) {
    o.box(f, .012, .98, .5, le * .506, 1.06, 0, {
      r: .003
    });
    for (let R = -6; R <= 6; R++) o.add(f, je(boxGeometry(.06, .94, .007), le * .54, 1.06, R * .038));
    o.box(c, .075, .03, .52, le * .54, 1.56, 0, {
      r: .006
    });
  }
  for (let le = 0; le < 3; le++) {
    let R = -.17 + le * .17;
    let I = .44 - le * .02;
    let se = .86 + le * .07;
    o.tube(p, [[.5, I, R], [.6, I, R], [.72 + le * .04, I - .06, R], [se - .02, .16, R + .02], [se, -.03, R + .02]], .04, {
      seg: 8,
      tension: .4
    });
    o.cyl(h, .055, .055, .05, .515, I, R, {
      seg: 8,
      flat: true,
      rot: [0, 0, es / 2]
    });
    o.cyl(h, .06, .066, .03, se, .015, R + .02, {
      seg: 8
    });
  }
  o.tube(p, [[-.3, .35, _], [-.3, .33, _ - .1], [-.34, .2, _ - .2], [-.5, .165, _ - .3], [-.9, .02, _ - .36], [-1.5, .018, _ - .2]], .022, {
    seg: 6
  });
  o.box(u, .3, .22, .1, .2, .75, _ - .05, {
    r: .012
  });
  o.tube(p, [[.2, .86, _ - .06], [.2, 1.2, _ - .04], [-.1, 1.55, _ - .03], [-.3, 1.66, -.16]], .012, {
    seg: 5
  });
  let C = -.3;
  let G = -.14;
  let j = A + .05;
  let N = 2.5;
  let Q = [0, 1, 2].map(le => [C + Math.cos(le * 2.094 + .52) * .085, G + Math.sin(le * 2.094 + .52) * .085]);
  o.box(h, .24, .012, .24, C, j + .006, G, {
    r: 0
  });
  for (let le = 0; le < 3; le++) {
    let R = Q[le];
    let I = Q[(le + 1) % 3];
    o.bar(h, [R[0], j, R[1]], [R[0], N, R[1]], .011, {
      seg: 6
    });
    let se = 5;
    let ae = (N - j) / se;
    for (let k = 0; k < se; k++) {
      o.bar(h, [R[0], j + k * ae, R[1]], [I[0], j + (k + 1) * ae, I[1]], .005, {
        seg: 4
      });
      o.bar(h, [R[0], j + (k + 1) * ae, R[1]], [I[0], j + (k + 1) * ae, I[1]], .005, {
        seg: 4
      });
    }
  }
  o.cyl(h, .11, .11, .014, C, N + .007, G, {
    seg: 10
  });
  o.cyl(u, .05, .06, .1, C, N + .06, G, {
    seg: 10
  });
  let K = (le, R, I) => {
    o.cyl(u, .016, .02, .07, le, A + .085, R, {
      seg: 8
    });
    o.cyl(h, .011, .011, .06, le, A + .15, R, {
      seg: 6
    });
    o.bar(u, [le, A + .17, R], [le + .02, I, R - .015], .005, {
      r2: .0018,
      seg: 5,
      caps: true
    });
  };
  K(.4, -.24, 3.15);
  K(.26, -.24, 2.72);
  o.cyl(u, .03, .03, .26, .42, A + .18, .18, {
    seg: 8
  });
  o.add(u, je(mr(.03, 8, 4, es * 2, 0, es / 2), .42, A + .31, .18));
  let ie = g1([[0, 0], [.06, .006], [.12, .024], [.18, .054], [.215, .078], [.222, .078], [.185, .05], [.12, .016], [.06, -.003], [0, -.01]], 18);
  ie.computeVertexNormals();
  l.add(f, je(ie, 0, .3, .02, [es / 2 - .12, 0, 0]));
  l.cyl(f, .022, .03, .2, 0, .1, 0, {
    seg: 8
  });
  l.box(f, .07, .1, .06, 0, .26, -.02, {
    r: .01
  });
  for (let le of [.5, 2.6, 4.7]) l.bar(f, [Math.cos(le) * .2, .3 + Math.sin(le) * .2, .09], [0, .325, .25], .0045, {
    seg: 4
  });
  l.cyl(f, .022, .016, .05, 0, .325, .25, {
    seg: 8,
    rot: [es / 2, 0, 0]
  });
  let F = [C, N + .11, G];
  o.box(u, .9, .07, .03, 0, A - .06, M + .012, {
    r: .008
  });
  a.add(x, je(cn(.84, .036), 0, A - .06, M + .0275));
  for (let le = 1; le < 6; le++) o.add(u, je(boxGeometry(.008, .05, .006), -.42 + le * .14, A - .06, M + .028));
  o.box(u, .6, .06, .03, 0, A - .06, _ - .012, {
    r: .008
  });
  a.add(x, je(cn(.54, .03), 0, A - .06, _ - .0275, [0, es, 0]));
  for (let le of [-1, 1]) {
    o.box(u, .03, 1.2, .03, le * .5, .86, M, {
      r: .008,
      rot: [0, es / 4, 0]
    });
    a.add(x, je(cn(.014, 1.14), le * .5, .86, M + .0215, [0, le * es / 4, 0]).translate(le * .0152, 0, 0));
    a.add(x, je(cn(.014, .9), le * .5715, 1.06, .262, [0, le * es / 2, 0]));
  }
  for (let le of [-1, 1]) {
    o.box(u, .03, .06, .46, le * .587, A - .01, 0, {
      r: .008
    });
    a.add(x, je(cn(.4, .032), le * .6025, A - .01, 0, [0, le * es / 2, 0]));
  }
  o.cyl(u, .028, .028, .02, C + .2, A + .06, G, {
    seg: 8
  });
  o.bar(h, [C + .2, A + .06, G], [C + .2, 2.64, G], .009, {
    seg: 6
  });
  a.add(x, je(cylinderGeometry(.045, .045, .1, 10), C + .2, 2.69, G));
  o.cyl(u, .05, .05, .014, C + .2, 2.747, G, {
    seg: 10
  });
  o.cyl(u, .05, .05, .014, C + .2, 2.633, G, {
    seg: 10
  });
  o.decal(Jn(i, "rust_run"), .5, .5135, .3, .2, [0, es / 2, 0], .14);
  o.decal(Jn(i, "grime_streak"), .6, -.2, 1.2, _ - .001, [0, es, 0], .2);
  let X = o.group();
  let ne = new Group();
  ne.userData.noMerge = true;
  ne.name = "relay_dynamic";
  X.add(ne);
  let re = i.mats.emissive(16752680, 4);
  re = re.clone();
  let $ = new Mesh(mergeGeometryList(a.buckets.get(x).geos), re);
  $.userData.noMerge = true;
  ne.add($);
  let ue = r.group().children.slice();
  for (let le of ue) {
    le.position.set(D[0], D[1], D[2]);
    le.userData.noMerge = true;
    ne.add(le);
  }
  let me = l.group().children.slice();
  for (let le of me) {
    le.position.set(F[0], F[1], F[2]);
    le.userData.noMerge = true;
    ne.add(le);
  }
  let ee = new Color();
  let B = (le, R) => {
    if (re.userData && typeof re.userData.setEmissive == "function") {
      re.userData.setEmissive(le, R);
      return;
    }
    re.emissive && re.emissive.isColor && re.isMeshStandardMaterial ? (re.emissive.copy(le), re.emissiveIntensity = R) : re.uniforms && re.uniforms.color && re.uniforms.color.value && re.uniforms.color.value.isColor ? (re.uniforms.color.value.copy(le).multiplyScalar(R), re.uniforms.intensity && (re.uniforms.intensity.value = 1)) : re.color && re.color.isColor && re.color.copy(le).multiplyScalar(R);
  };
  let P = "live";
  let V = t % 7 * .9;
  let Y = 0;
  let L = .7;
  let Z = 0;
  let J = 0;
  let oe = 0;
  let fe = X.userData;
  if (fe.state = P, fe.beacon = [C + .2, 2.68, G], fe.interact = [0, 1, .75], fe.emissiveMaterial = re, fe.level = 0, fe.setState = le => {
    le !== "live" && le !== "cutting" && le !== "cut" || le !== P && (P = le, fe.state = le, le === "cut" && (Y = 0, oe = 1.32, J = 2.5), le === "live" && (oe = 0));
  }, fe.update = le => {
    le = Math.min(le || 0, .1);
    V += le;
    let R = 0;
    let I = Kg;
    let se = .7;
    if (P === "live") R = 5.5 + 3 * Math.sin(V * 2.2);else if (P === "cutting") {
      let ae = Math.sin(V * 2 * es * 5.5) > 0;
      R = ae ? 9 : .5;
      I = ae ? kA : Kg;
      se = 2.6 + Math.sin(V * 9) * 1.5;
    } else if (Y += le, I = LA, se = 0, Y < .3) R = 9;else if (Y < 2.6) {
      let ae = 1 - (Y - .3) / 2.3;
      R = 7 * ae * ae * (Math.sin(Y * 37) * Math.sin(Y * 13.3) > -.2 ? 1 : .08);
    } else R = 0;
    if (fe.level = R, B(ee.copy(I), R), L += (se - L) * Math.min(1, le * (P === "cut" ? 1.6 : 3)), Math.abs(L) > .001) for (let ae of me) ae.rotateY(L * le);
    if (Math.abs(oe - Z) > 1e-4 || Math.abs(J) > .001) {
      J += (-(Z - oe) * 30 - J * 3.2) * le;
      let ae = Z + J * le;
      ae < 0 && (ae = 0, J = Math.abs(J) * .3);
      ae > 1.9 && (ae = 1.9, J = -Math.abs(J) * .4);
      let k = ae - Z;
      Z = ae;
      for (let ce of ue) ce.rotateY(-k);
    }
  }, e.state === "cut") {
    fe.setState("cut");
    for (let le = 0; le < 80; le++) fe.update(.05);
  } else {
    e.state === "cutting" && fe.setState("cutting");
    fe.update(0);
    P === "live" && B(ee.copy(Kg), 6);
  }
  return qi(X, "relay_node", PROP_SIZES.relay_node.slice(0, 3), [{
    min: [-.68, 0, -.48],
    max: [.68, .16, .48],
    surface: "concrete"
  }, {
    min: [-.57, .16, -.32],
    max: [.57, 1.67, .33],
    surface: "metal"
  }, {
    min: [-.42, 1.67, -.26],
    max: [-.18, 2.5, -.02],
    surface: "metal",
    bulletOnly: true
  }]);
}
for (let i of ["container20", "container40", "container40hc"]) registerProp(i, (e, t) => M3(e, i, t));
registerProp("jersey_barrier", S3);
registerProp("light_mast", T3);
registerProp("fence_panel", A3);
registerProp("guard_booth", R3);
registerProp("gate_arm", C3);
registerProp("bollard_mooring", P3);
registerProp("bollard_post", I3);
registerProp("sign_post", z3);
registerProp("floodlight_stand", D3);
registerProp("stairs_metal", k3);
registerProp("catwalk", F3);
registerProp("shelf_rack", U3);
registerProp("reefer_unit", N3);
registerProp("relay_node", B3);
