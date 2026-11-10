import { BoxGeometry, BufferAttribute, BufferGeometry, CatmullRomCurve3, CylinderGeometry, Euler, Group, Matrix4, Mesh, Quaternion, TubeGeometry, Vector3 } from '../../vendor/three.js';
import { mergeGeometries } from './merge.js';
var oa = new Vector3();
function boxGeometry(i, e, t, n = "center") {
  let s = new BoxGeometry(i, e, t);
  let o = s.attributes.uv;
  let r = s.attributes.position;
  let a = s.attributes.normal;
  for (let l = 0; l < o.count; l++) {
    let c = Math.abs(a.getX(l));
    let u = Math.abs(a.getY(l));
    let h = r.getX(l);
    let f = r.getY(l);
    let p = r.getZ(l);
    c > .5 ? o.setXY(l, p, f) : u > .5 ? o.setXY(l, h, p) : o.setXY(l, h, f);
  }
  n === "bottom" && s.translate(0, e / 2, 0);
  return s;
}
function beveledBoxGeometry(i, e, t, n = .02, s = "center") {
  n = Math.min(n, i / 2 - 1e-4, e / 2 - 1e-4, t / 2 - 1e-4);
  let o = new BoxGeometry(i, e, t, 3, 3, 3);
  let r = o.attributes.position;
  let a = o.attributes.normal;
  let l = o.attributes.uv;
  let c = i / 2;
  let u = e / 2;
  let h = t / 2;
  let f = (p, d) => {
    let v = Math.abs(p);
    let g = Math.sign(p);
    return v > d - 1e-5 ? g * d : g * (d - n);
  };
  for (let p = 0; p < r.count; p++) {
    let d = f(r.getX(p), c);
    let v = f(r.getY(p), u);
    let g = f(r.getZ(p), h);
    let x = Math.max(-(c - n), Math.min(c - n, d));
    let y = Math.max(-(u - n), Math.min(u - n, v));
    let b = Math.max(-(h - n), Math.min(h - n, g));
    if (oa.set(d - x, v - y, g - b), oa.lengthSq() > 1e-10) {
      oa.normalize();
      let M = a.getX(p);
      let E = a.getY(p);
      let w = a.getZ(p);
      (Math.abs(d) > c - 1e-5 ? 1 : 0) + (Math.abs(v) > u - 1e-5 ? 1 : 0) + (Math.abs(g) > h - 1e-5 ? 1 : 0) >= 2 ? (d = x + oa.x * n, v = y + oa.y * n, g = b + oa.z * n, a.setXYZ(p, oa.x, oa.y, oa.z)) : a.setXYZ(p, M, E, w);
    }
    r.setXYZ(p, d, v, g);
    let m = Math.abs(a.getX(p));
    let A = Math.abs(a.getY(p));
    let _ = Math.abs(a.getZ(p));
    m >= A && m >= _ ? l.setXY(p, g, v) : A >= m && A >= _ ? l.setXY(p, d, g) : l.setXY(p, d, v);
  }
  s === "bottom" && o.translate(0, e / 2, 0);
  return o;
}
function cylinderGeometry(i, e, t, n = 16, s = false, o = "center") {
  let r = new CylinderGeometry(i, e, t, n, 1, s);
  let a = r.attributes.uv;
  let l = r.attributes.position;
  let c = r.attributes.normal;
  let u = Math.PI * (i + e);
  for (let h = 0; h < a.count; h++) Math.abs(c.getY(h)) > .9 ? a.setXY(h, l.getX(h), l.getZ(h)) : a.setXY(h, a.getX(h) * u, l.getY(h));
  o === "bottom" && r.translate(0, t / 2, 0);
  return r;
}
function tubeGeometry(i, e = .03, t = 8, n = false, s = 0) {
  let o = i.map(h => h.isVector3 ? h : new Vector3(h[0], h[1], h[2]));
  let r = new CatmullRomCurve3(o, n, "catmullrom", s);
  let a = r.getLength();
  let l = Math.max(2, Math.ceil(a / Math.max(.08, e * 3)));
  let c = new TubeGeometry(r, Math.min(l, 400), e, t, n);
  let u = c.attributes.uv;
  for (let h = 0; h < u.count; h++) u.setXY(h, u.getX(h) * a, u.getY(h) * Math.PI * 2 * e);
  return c;
}
var ky = new Matrix4();
var Fy = new Quaternion();
var Uy = new Euler();
var Ny = new Vector3();
var Fg = new Vector3();
function transformGeometry(i, {
  p: e = [0, 0, 0],
  r: t = [0, 0, 0],
  s: n = 1
} = {}) {
  Uy.set(t[0], t[1], t[2]);
  Fy.setFromEuler(Uy);
  Ny.set(e[0], e[1], e[2]);
  typeof n == "number" ? Fg.set(n, n, n) : Fg.set(n[0], n[1], n[2]);
  ky.compose(Ny, Fy, Fg);
  i.applyMatrix4(ky);
  return i;
}
function colorGeometry(i, e) {
  let t = i.attributes.position;
  let n = t.count;
  let s = new Float32Array(n * 3);
  for (let o = 0; o < n; o++) {
    let r = typeof e == "function" ? e(t.getX(o), t.getY(o), t.getZ(o)) : e;
    s[o * 3] = r[0];
    s[o * 3 + 1] = r[1];
    s[o * 3 + 2] = r[2];
  }
  i.setAttribute("color", new BufferAttribute(s, 3));
  return i;
}
function mergeGeometryList(i) {
  let e = i.filter(Boolean).map(l => (l.attributes.uv || l.setAttribute("uv", new BufferAttribute(new Float32Array(l.attributes.position.count * 2), 2)), l.attributes.normal || l.computeVertexNormals(), l));
  if (!e.length) return new BufferGeometry();
  let t = e.some(l => l.attributes.color);
  let n = e.map(l => {
    let c = (l.index, l);
    if (t && !c.attributes.color) {
      let u = new Float32Array(c.attributes.position.count * 3).fill(1);
      c.setAttribute("color", new BufferAttribute(u, 3));
    }
    for (let u of Object.keys(c.attributes)) ["position", "normal", "uv", "color"].includes(u) || c.deleteAttribute(u);
    return c;
  });
  let s = n.every(l => l.index);
  let o = n.every(l => !l.index);
  let r = s || o ? n : n.map(l => l.index ? l.toNonIndexed() : l);
  return mergeGeometries(r, false) || new BufferGeometry();
}
function mergeStaticMeshes(i, {
  castShadow: e = true,
  receiveShadow: t = true
} = {}) {
  i.updateMatrixWorld(true);
  let n = new Map();
  let s = [];
  i.traverse(r => {
    if (!r.isMesh) return;
    let a = r;
    let l = false;
    for (; a;) {
      if (a.userData && a.userData.noMerge) {
        l = true;
        break;
      }
      a = a.parent;
    }
    if (l || r.isSkinnedMesh || r.isInstancedMesh || Array.isArray(r.material)) {
      s.push(r);
      return;
    }
    let c = r.material.uuid + (r.castShadow ? "c" : "n") + (r.receiveShadow ? "r" : "n") + ":" + r.layers.mask;
    n.has(c) || n.set(c, {
      mat: r.material,
      geos: [],
      cast: r.castShadow,
      recv: r.receiveShadow,
      layers: r.layers.mask
    });
    let u = r.geometry.clone();
    u.applyMatrix4(r.matrixWorld);
    n.get(c).geos.push(u);
  });
  let o = new Group();
  for (let r of n.values()) {
    let a = new Mesh(mergeGeometryList(r.geos), r.mat);
    a.castShadow = r.cast && e;
    a.receiveShadow = r.recv && t;
    a.layers.mask = r.layers;
    o.add(a);
  }
  for (let r of s) {
    r.updateMatrixWorld(true);
    let a = r.matrixWorld.clone();
    o.add(r);
    r.matrix.copy(a);
    r.matrix.decompose(r.position, r.quaternion, r.scale);
  }
  return o;
}
function createMesh(i, e, {
  cast: t = true,
  recv: n = true
} = {}) {
  let s = new Mesh(i, e);
  s.castShadow = t;
  s.receiveShadow = n;
  return s;
}
export { beveledBoxGeometry, boxGeometry, colorGeometry, createMesh, cylinderGeometry, mergeGeometryList, mergeStaticMeshes, transformGeometry, tubeGeometry };
