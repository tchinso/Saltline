import { BufferAttribute, BufferGeometry, Float32BufferAttribute, Matrix4, Quaternion, Vector3 } from '../../vendor/three.js';
import { mergeGeometryList } from '../geometry/primitives.js';
var ti = Vector3;
var vl = Quaternion;
var rm = Matrix4;
var Bv = [31, 21.5, 12.5];
var Fv = [5.6, 5.3, 5];
var Lv = [3.2, 3.1, 3];
var am = [12.5, 10, 7.6];
var lm = [16, 11, 6.6];
var dC = [3, 2.6, 2.2];
var kf = [36, 27, 16];
var gl = [20, 14, 8.4];
var Df = [4.8, 4.5, 4.2];
var pC = [30, 9.5, 2.2];
var E_ = [5, 6.9, 9];
var mC = [30, 9.5, 2.2];
var gC = [26, 26, 25];
var um = i => i < 0 ? 0 : i > 1 ? 1 : i;
var xl = (i, e, t) => (t = um((t - i) / (e - i)), t * t * (3 - 2 * t));
var Ff = (i, e) => Math.sign(i) * Math.pow(Math.abs(i), e);
var vC = i => {
  let e = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return e - Math.floor(e);
};
var Xo = new ti();
var S_ = new ti(0, 0, -1);
var yl = class {
  constructor(e) {
    this.N = e;
    this.P = [];
    this.C = [];
    this.weld = [];
  }
  v(e, t, n = 1) {
    this.P.push(e.x, e.y, e.z);
    this.C.push(t[0] * n, t[1] * n, t[2] * n);
  }
  rings() {
    return this.P.length / 3 / this.N;
  }
  collapse() {
    this.weld.push(this.rings() - 1);
  }
  geo(e = false) {
    let t = this.N;
    let n = this.rings();
    let s = [];
    for (let a = 0; a < n - 1; a++) for (let l = 0; l < t; l++) {
      let c = a * t + l;
      let u = a * t + (l + 1) % t;
      let h = c + t;
      let f = u + t;
      e ? s.push(c, u, h, u, f, h) : s.push(c, h, u, u, h, f);
    }
    let o = new BufferGeometry();
    o.setAttribute("position", new Float32BufferAttribute(this.P, 3));
    o.setAttribute("color", new Float32BufferAttribute(this.C, 3));
    o.setAttribute("uv", new Float32BufferAttribute(new Float32Array(this.P.length / 3 * 2), 2));
    o.setIndex(s);
    o.computeVertexNormals();
    let r = o.attributes.normal;
    for (let a of this.weld) {
      let l = 0;
      let c = 0;
      let u = 0;
      for (let f = 0; f < t; f++) {
        l += r.getX(a * t + f);
        c += r.getY(a * t + f);
        u += r.getZ(a * t + f);
      }
      let h = Math.hypot(l, c, u) || 1;
      for (let f = 0; f < t; f++) r.setXYZ(a * t + f, l / h, c / h, u / h);
    }
    return o;
  }
};
function I_(i, e, t) {
  let n = [];
  let s = [];
  let o = [];
  let r = i.length;
  let a = e.length;
  for (let c = 0; c < a; c++) for (let u = 0; u < r; u++) {
    let h = t(i[u], e[c], Xo);
    n.push(Xo.x, Xo.y, Xo.z);
    s.push(h[0], h[1], h[2]);
  }
  for (let c = 0; c < a - 1; c++) for (let u = 0; u < r - 1; u++) {
    let h = c * r + u;
    let f = h + 1;
    let p = h + r;
    let d = p + 1;
    o.push(h, f, p, f, d, p);
  }
  let l = new BufferGeometry();
  l.setAttribute("position", new Float32BufferAttribute(n, 3));
  l.setAttribute("color", new Float32BufferAttribute(s, 3));
  l.setAttribute("uv", new Float32BufferAttribute(new Float32Array(n.length / 3 * 2), 2));
  l.setIndex(o);
  l.computeVertexNormals();
  return l;
}
var Uv = [-1, -.9, -.5, 0, .5, .9, 1];
var cm = i => Math.abs(i) > .95 ? -1 : Math.abs(i) > .8 ? .82 : 1;
function Lf(i, e, t, n, s, o, r, a = null, l = false, c = Uv, u = Uv) {
  return I_(c, u, (h, f, p) => {
    let d = i + h * t;
    let v = e + (l ? f : -f) * n;
    let g = Math.min(cm(h), cm(f));
    let x = r(d, v) + (g < 0 ? -.0022 : s * g);
    p.set(d, l ? -x : x, v);
    a && a(p);
    let y = typeof o == "function" ? o(h, f) : o;
    let b = g < 0 ? .5 : g < 1 ? .8 : 1;
    return [y[0] * b, y[1] * b, y[2] * b];
  });
}
var om = [{
  base: [-.031, 0, -.094],
  len: [.044, .026, .022],
  rad: [.0096, .009, .0083, .0076]
}, {
  base: [-.0105, .001, -.099],
  len: [.049, .03, .023],
  rad: [.0097, .0091, .0084, .0077]
}, {
  base: [.0105, 0, -.095],
  len: [.045, .028, .022],
  rad: [.0094, .0088, .0081, .0074]
}, {
  base: [.03, -.002, -.086],
  len: [.035, .021, .02],
  rad: [.0084, .0078, .0072, .0066]
}];
var Nv = [12, 34, 44, 68, 90, 112, 136, 146, 168, 192, 220, 245, 270, 295, 320, 348].map(i => i * Math.PI / 180);
var T_ = Nv.length;
var A_ = .0012;
var R_ = [.14, .22, .27, .73, .78, .88];
var xC = [.1, .17, .1];
function z_(i) {
  let e = new yl(T_);
  let {
    base: t,
    qs: n,
    len: s,
    rad: o
  } = i;
  let r = i.pads || [1, 1, 0];
  let a = i.patchJ ?? 1;
  let l = i.bump || xC;
  let c = i.tipW || 1;
  let u = i.tipH || 1;
  let h = [];
  let f = [];
  let p = t.clone();
  for (let M = 0; M < 3; M++) {
    h.push(p.clone());
    f.push(S_.clone().applyQuaternion(n[M + 1]));
    p.addScaledVector(f[M], s[M]);
  }
  let d = S_.clone().applyQuaternion(n[0]);
  let v = M => M ? f[M - 1] : d;
  let g = [0, 1, 2].map(M => new ti().addVectors(v(M), f[M]).normalize());
  let x = (M, E) => (M.x - h[E].x) * g[E].x + (M.y - h[E].y) * g[E].y + (M.z - h[E].z) * g[E].z;
  let y = (M, E) => {
    let w = x(M, E);
    w > 0 && M.addScaledVector(v(E), -w / v(E).dot(g[E]));
  };
  let b = (M, E) => {
    let w = x(M, E);
    w < 0 && M.addScaledVector(f[E], -w / f[E].dot(g[E]));
  };
  let m = new ti();
  let A = new vl();
  let _ = (M, E, w, S) => {
    let z = S.kD || 1;
    let H = S.kP || 1;
    let O = S.ao || 1;
    for (let q = 0; q < T_; q++) {
      let U = Math.cos(Nv[q]);
      let T = Math.sin(Nv[q]);
      let D = q >= 1 && q <= 7;
      let C = q >= 2 && q <= 6;
      let G = w * U;
      let j = T > 0 ? w * .96 * T * (C ? z : 1 + (z - 1) * .4) : w * .98 * T * H;
      S.pad && C && (G += U * A_, j += T * A_);
      G *= S.wx || 1;
      j *= S.wy || 1;
      m.set(G, j, 0).applyQuaternion(M).add(E);
      S.a >= 0 && y(m, S.a);
      S.b >= 0 && b(m, S.b);
      let N = D ? Bv : q >= 10 && q <= 14 ? am : lm;
      let Q = O;
      S.pad && C ? N = Fv : S.patch && C && (N = lm, Q *= .9);
      (S.pad && D && !C || S.edge && D) && (N = dC);
      S.saddle && q >= 8 && (N = am, Q *= .9);
      S.stitch && D && (N = kf, Q *= .8);
      (q === 0 || q === 8 || q === 9 || q === 15) && (Q *= .72);
      q >= 9 && (Q *= S.aoP || 1);
      e.v(m, N, Q);
    }
  };
  _(n[0], Xo.copy(h[0]).addScaledVector(d, -(i.rootBack || .012) - .002), 1e-5, {
    a: 0,
    b: -1,
    ao: i.rootAo || .5
  });
  e.collapse();
  _(n[0], Xo.copy(h[0]).addScaledVector(d, -(i.rootBack || .012)), o[0] * (i.rootK || 1), {
    a: 0,
    b: -1,
    ao: i.rootAo || .5,
    saddle: i.saddle
  });
  for (let M = 0; M < 3; M++) {
    for (let E = 0; E < 4; E++) {
      let w = E / 3;
      A.slerpQuaternions(n[M], n[M + 1], w);
      _(A, Xo.copy(h[M]).addScaledVector(E < 2 ? v(M) : f[M], (E - 1.5) * 4e-4), o[M], {
        a: w < .5 ? M : -1,
        b: w < .5 ? -1 : M,
        kD: 1 + l[M] * (E === 0 || E === 3 ? .55 : 1),
        patch: M === a,
        saddle: i.saddle && M < 2,
        wx: M === 2 ? 1 + (c - 1) * .5 : 1,
        wy: M === 2 ? 1 + (u - 1) * .5 : 1,
        ao: M === 0 && !i.rootAo ? .62 + .1 * E : 1,
        aoP: E === 1 || E === 2 ? .55 : .8
      });
    }
    if (M < 2) for (let E = 0; E < R_.length; E++) {
      let w = R_[E];
      let S = (o[M] + (o[M + 1] - o[M]) * w) * (1 - .06 * Math.sin(Math.PI * w));
      _(n[M + 1], Xo.copy(h[M]).addScaledVector(f[M], s[M] * w), S, {
        a: M + 1,
        b: M,
        pad: r[M] && (E === 2 || E === 3),
        edge: r[M] && (E === 1 || E === 4),
        saddle: i.saddle && M === 0,
        ao: M === 0 && !i.rootAo ? .86 + .14 * xl(0, .5, w) : 1
      });
    } else {
      let E = o[3];
      let w = s[2] - E;
      _(n[3], Xo.copy(h[2]).addScaledVector(f[2], s[2] * .2), o[2] * .97, {
        a: -1,
        b: 2,
        stitch: 1,
        wx: c,
        wy: u
      });
      _(n[3], Xo.copy(h[2]).addScaledVector(f[2], s[2] * .42), (o[2] + E) * .5, {
        a: -1,
        b: 2,
        kP: 1.08,
        wx: c,
        wy: u
      });
      for (let S of [0, .6, 1.05, 1.36]) _(n[3], Xo.copy(h[2]).addScaledVector(f[2], w + E * 1.08 * Math.sin(S)), E * Math.cos(S), {
        a: -1,
        b: -1,
        kP: 1.06,
        wx: c,
        wy: u
      });
      _(n[3], Xo.copy(h[2]).addScaledVector(f[2], w + E * 1.08), 1e-5, {
        a: -1,
        b: -1
      });
      e.collapse();
    }
  }
  return e.geo();
}
var yC = i => new vl().setFromAxisAngle(new ti(0, 1, 0), i);
var bC = i => new vl().setFromAxisAngle(new ti(1, 0, 0), i);
function C_(i, e) {
  let t = [yC(e[3] || 0)];
  for (let n = 0; n < 3; n++) t.push(t[n].clone().multiply(bC(-e[n])));
  return z_({
    base: new ti(i.base[0], i.base[1], i.base[2]),
    qs: t,
    len: i.len,
    rad: i.rad
  });
}
function _C(i, e) {
  let t = i.clone().negate();
  let n = new ti().crossVectors(e, t);
  n.lengthSq() < 1e-6 && n.set(1, 0, 0);
  n.normalize();
  let s = new ti().crossVectors(t, n);
  return new vl().setFromRotationMatrix(new rm().makeBasis(n, s, t));
}
function MC(i) {
  let e = i.map(o => new ti(o[0], o[1], o[2]).normalize());
  let t = new ti(-.72, .69, 0);
  let n = [];
  let s = e[2].clone().sub(e[0]);
  s.length() > .12 && t.multiplyScalar(.25).addScaledVector(s.normalize(), -1);
  for (let o = 0; o < 3; o++) n.push(_C(e[o], t));
  n.unshift(n[0].clone());
  return z_({
    base: new ti(-.028, -.007, -.014),
    qs: n,
    len: [.044, .031, .026],
    rad: [.0165, .0118, .011, .01],
    pads: [0, 1, 0],
    patchJ: 2,
    bump: [0, .2, .2],
    tipW: 1.12,
    tipH: .86,
    saddle: 1,
    rootBack: .01,
    rootK: .72,
    rootAo: .9
  });
}
var Qc = .006;
var D_ = i => -.0975 + .0125 * Math.pow((i + .008) / .04, 2);
var Ov = i => D_(i) + .006;
var Hv = i => .029 + .014 * xl(.05, .85, i);
var L_ = i => .0185 - .0065 * xl(.1, 1, i);
var k_ = i => .0185 + .003 * Math.sin(Math.PI * um(i * 1.6)) - .0055 * xl(.3, 1, i);
function kv(i, e) {
  let t = um((Qc - e) / (Qc - Ov(i)));
  let n = Math.min(.999, Math.abs(i / Hv(t)));
  return L_(t) * Math.pow(1 - Math.pow(n, 2.5), .4);
}
function wC(i, e) {
  let t = um((Qc - e) / (Qc - Ov(i)));
  let n = Hv(t);
  let s = Math.min(.999, Math.abs(i / n));
  return k_(t) * Math.pow(1 - Math.pow(s, 2.5), .4) * (1 + .14 * Math.max(0, i / n) * Math.sin(Math.PI * t));
}
function EC() {
  let e = new yl(24);
  let t = new ti();
  let n = [[0, 0, 1, 1], [.1, 0, 1, 1], [.22, 0, 1, 1], [.36, 0, 1, 1], [.5, 0, 1, 1], [.64, 0, 1, 1], [.77, 0, 1, 1], [.89, 0, 1, 1], [1, 0, 1, 1], [1, -.005, .8, 1], [1, -.009, .45, .985], [1, -.0105, .04, .97]];
  for (let [s, o, r, a] of n) {
    let l = Hv(s) * a;
    let c = L_(s) * r;
    let u = k_(s) * r;
    for (let h = 0; h < 24; h++) {
      let f = (h + .5) / 24 * Math.PI * 2;
      let p = Math.cos(f);
      let d = Math.sin(f);
      let v = l * Ff(p, .8);
      let g = d >= 0 ? c * Ff(d, .8) : u * Ff(d, .8) * (1 + .14 * Math.max(0, v / l) * Math.sin(Math.PI * s));
      t.set(v, g, Qc + (Ov(v) - Qc) * s + o);
      let x = d > .3 ? Bv : d < -.3 ? am : lm;
      let y = 1;
      s === .1 && d > .3 && (x = kf, y = .75);
      o < 0 && (x = lm, y = .7 + o * 30);
      d < -.3 && (y *= .82 + .18 * Math.abs(p));
      e.v(t, x, y);
    }
  }
  return e.geo();
}
function SC(i) {
  let t = new yl(12);
  let n = new ti();
  let s = new ti();
  let o = new ti();
  let r = new ti();
  let a = new ti();
  let l = new ti(i.x, i.y, i.z - 1).normalize();
  let c = [-.12, 0, .2, .4, .6, .78, .9];
  for (let d = 0; d < c.length; d++) {
    let v = c[d];
    let g = d === 0 || d === c.length - 1;
    s.set(-.028, -.007, -.014).addScaledVector(i, .044 * v);
    o.set(-.03, -.003, -.022 - .06 * v);
    r.subVectors(s, o);
    let x = r.length() * .5 + .005;
    r.normalize();
    a.crossVectors(r, l).normalize();
    let y = g ? 1e-5 : .0085 * (1 - .55 * v);
    let b = g ? 1e-5 : x * (1 - .3 * v * v);
    for (let m = 0; m < 12; m++) {
      let A = (m + .5) / 12 * Math.PI * 2;
      let _ = Math.cos(A);
      let M = Math.sin(A);
      n.copy(s).add(o).multiplyScalar(.5).addScaledVector(r, _ * b).addScaledVector(a, M * y);
      let E = a.y * M < 0;
      t.v(n, E ? am : Bv, E ? .85 : .92);
    }
    g && t.collapse();
  }
  let u = t.geo();
  let h = u.attributes.position;
  let f = u.index.array;
  let p = 0;
  for (let d = 0; d < f.length; d += 3) {
    s.fromBufferAttribute(h, f[d]);
    o.fromBufferAttribute(h, f[d + 1]);
    n.fromBufferAttribute(h, f[d + 2]);
    p += s.dot(o.cross(n));
  }
  if (p < 0) {
    for (let d = 0; d < f.length; d += 3) {
      let v = f[d + 1];
      f[d + 1] = f[d + 2];
      f[d + 2] = v;
    }
    u.computeVertexNormals();
  }
  return u;
}
function P_(i) {
  if (i.scale(-1, 1, 1), !i.index) {
    let t = i.attributes.position.count;
    let n = new Uint32Array(t);
    for (let s = 0; s < t; s++) n[s] = s;
    i.setIndex(new BufferAttribute(n, 1));
  }
  let e = i.index.array;
  for (let t = 0; t < e.length; t += 3) {
    let n = e[t + 1];
    e[t + 1] = e[t + 2];
    e[t + 2] = n;
  }
  return i;
}
function Vv(i) {
  let e = [];
  let t = i.debugParts || null;
  let n = (d, v) => (e.push(v), t && t.push([d, v]), v);
  n("palm", EC());
  {
    let d = [];
    for (let v = 0; v <= 30; v++) d.push(-1 + v / 15);
    n("guard", I_(d, [-1, -.9, -.5, 0, .5, .9, 1], (v, g, x) => {
      let y = -5e-4 + v * .0405;
      let b = D_(y) + .0045 - g * .011;
      let m = Math.min(cm(v), cm(g));
      let A = 0;
      for (let M = 0; M < 4; M++) {
        let E = (y - om[M].base[0]) / .0058;
        A += (M === 3 ? .8 : 1) * Math.exp(-E * E);
      }
      A = Math.min(1, A) * (1 - .55 * g * g);
      x.set(y, kv(y, b) + (m < 0 ? g > .95 ? -.008 : -.003 : (.0016 + .006 * A) * m), b);
      let _ = m < 0 ? .6 : .85 + 1.3 * A;
      return [Lv[0] * _, Lv[1] * _, Lv[2] * _];
    }));
  }
  for (let d = 0; d < 3; d++) n("bar", Lf(.001, -.034 - d * .015, .023 + d * .0025, .0052, .0019, Fv, kv));
  n("seam", Lf(0, -.0225, .027, .0013, 9e-4, kf.map(d => d * .8), kv, null, false, Uv, [-1, 0, 1].map(d => d * .9)));
  n("heelPad", Lf(.013, -.03, .0135, .017, .0017, Fv, wC, null, true));
  let s = [];
  for (let d = 0; d < 4; d++) {
    if (d === 0 && i.indexPoses) {
      for (let v of i.indexPoses) s.push(C_(om[0], v));
      continue;
    }
    n("finger" + d, C_(om[d], i.fingers[d]));
  }
  n("thumb", MC(i.thumb));
  n("web", SC(new ti(i.thumb[0][0], i.thumb[0][1], i.thumb[0][2]).normalize()));
  let o = new ti(i.forearm[0], i.forearm[1], i.forearm[2]).normalize();
  let r = i.sleeve || .36;
  let a = .022;
  let l = new vl().setFromUnitVectors(new ti(0, 0, 1), o);
  let c = new vl();
  let u = new vl();
  let h = d => (u.slerpQuaternions(c, l, xl(.002, .042, d.z)), d.z -= a, d.applyQuaternion(u), d.z += a, d);
  {
    let v = new yl(24);
    let g = new ti();
    let x = [[-.0085, -.0015, Df, .6], [-.009, .0022, Df, 1.3], [-.006, .0026, Df, 1.3], [-.0052, .002, gl, .75], [.004, .0014, gl, 1], [.011, .0016, gl, .7], [.0122, .003, Df, 1.2], [.0305, .0032, Df, 1.2], [.0317, .0018, gl, .7], [.04, .002, gl, 1], [.054, .0024, gl, 1], [.058, .0026, kf, .7], [.058, -.004, gl, .4]];
    for (let [y, b, m, A] of x) for (let _ = 0; _ < 24; _++) {
      let M = (_ + .5) / 24 * Math.PI * 2;
      let E = Math.sin(M);
      v.v(h(g.set((.0296 + b) * Ff(Math.cos(M), .8), (E >= 0 ? .0185 + b : .0204 + b) * Ff(E, .8), y)), m, A);
    }
    n("cuff", v.geo(true));
  }
  n("strapTab", Lf(.009, .0215, .0135, .0076, .0017, d => d > .55 ? kf.map(v => v * .75) : [9, 9, 9.6], d => .0217 * Math.pow(1 - Math.pow(Math.min(.999, Math.abs(d / .0328)), 2.5), .4), h));
  n("pullTab", Lf(.003, .004, .0065, .0115, .0022, pC, () => .022, h, true));
  {
    let d = [];
    for (let z = 0; z < 24; z++) {
      d.push(z * 15);
      (z === 4 || z === 16) && d.push(z * 15 + 11.5);
      (z === 5 || z === 17) && d.push(z * 15 + 3.5);
    }
    d.sort((z, H) => z - H);
    let v = d.length;
    let g = d.indexOf(75);
    let x = d.indexOf(255);
    let y = new yl(v);
    let b = new ti();
    let m = .04 + r;
    let A = [[.0415, 0], [.04, 1], [.044, 2], [.049, 3], [.055, 3], [.061, 3], [.0655, 4], [.0685, 5]];
    let _ = [.1415, .143, .157, .1582, .1662, .1674, .181, .1825];
    let M = _.slice();
    let E = Math.ceil((m - .074) / .0052);
    for (let z = 0; z <= E; z++) {
      let H = .074 + (m - .074) * z / E;
      _.some(O => Math.abs(O - H) < .0016) || M.push(H);
    }
    M.sort((z, H) => z - H);
    for (let z of M) A.push([z, 6]);
    let w = 0;
    for (let [z, H] of A) for (let O = 0; O < v; O++) {
      let q = d[O] * Math.PI / 180;
      let U;
      let T = 1;
      let D = E_;
      if (H === 0) {
        U = .0292;
        T = .4;
      } else if (H === 1) {
        U = .0372;
        T = 1.15;
      } else if (H === 2) {
        U = .0377;
        T = 1.1;
      } else if (H === 3) {
        let C = Math.cos(q * 12);
        U = .0368 + .0012 * C;
        T = .62 + .26 * C;
      } else if (H === 4) {
        U = .0356;
        T = .55;
      } else if (H === 5) {
        U = .038;
        T = .9;
      } else {
        let C = (z - .0685) / (m - .0685);
        let G = .0048 * Math.exp(-Math.pow((C - .13) / .11, 2));
        let j = .0048 * xl(.62, .85, C);
        let N = Math.pow(Math.abs(Math.sin(Math.PI * z / .027 + 1.7 * Math.sin(q + .5) + .8 * Math.sin(2 * q + 1.3))), .6) * 2 - 1.25;
        let Q = Math.pow(Math.abs(Math.sin(Math.PI * z / .034 + 1.9 * Math.sin(q - .8) + .7 * Math.sin(2 * q))), .6) * 2 - 1.25;
        let K = Math.sin(z * 40 + 2 * Math.sin(q * 2 + 1)) + .6 * Math.sin(3 * q + z * 25);
        U = .0405 + .012 * Math.pow(C, .85) + .0025 * Math.exp(-Math.pow((z - .082) / .012, 2)) + G * N + j * Q + .0016 * K;
        T = .78 + .26 * xl(-1.1, .5, (G * N + j * Q) / (G + j + 8e-4)) + .04 * K;
        let ie = vC(w);
        z > .1575 && z < .167 ? (D = gC, T *= .85 + .25 * ie) : z > .1425 && z < .1815 && (D = mC, T *= .78 + .3 * ie);
      }
      H > 0 && (O === g || O === x ? (U += .0019, T *= 1.3) : (Math.abs(O - g) === 1 || Math.abs(O - x) === 1) && (T *= .52));
      b.set(Math.cos(q) * U, Math.sin(q) * U * .84, z);
      y.v(b, D, T);
      w++;
    }
    for (let z = 0; z < v; z++) y.v(b.set(0, 0, m + .006), E_, .3);
    y.collapse();
    let S = y.geo(true);
    S.applyMatrix4(new rm().makeTranslation(0, 0, a).multiply(new rm().makeRotationFromQuaternion(l)).multiply(new rm().makeTranslation(0, 0, -a)));
    n("sleeve", S);
  }
  let p = {
    fabric: mergeGeometryList(e),
    rubber: null,
    index: s.length ? s : null,
    knuckle: om[0].base.slice()
  };
  i.mirror && (P_(p.fabric), p.index && p.index.forEach(P_), p.knuckle[0] *= -1);
  return p;
}
export { Vv };
