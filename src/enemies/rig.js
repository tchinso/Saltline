import { Bone, Box3, BufferAttribute, Group, Skeleton, SkinnedMesh, Sphere, Vector3 } from '../../vendor/three.js';
import { mergeGeometries } from '../geometry/merge.js';
var iu = class {
  constructor() {
    this.bones = [];
    this.index = {};
    this.slots = {};
    this.order = [];
  }
  bone(e, t, n = 0, s = 0, o = 0) {
    let r = t ? this.bones[this.index[t]] : null;
    if (t && !r) throw new Error("rig: unknown parent bone " + t);
    let a = {
      name: e,
      parent: r ? r.i : -1,
      local: [n, s, o],
      world: [n + (r ? r.world[0] : 0), s + (r ? r.world[1] : 0), o + (r ? r.world[2] : 0)],
      i: this.bones.length
    };
    this.index[e] = a.i;
    this.bones.push(a);
    return a;
  }
  add(e, t, n, s = [1, 1, 1], o = true) {
    let r = this.bones[this.index[t]];
    if (!r) throw new Error("rig: unknown bone " + t);
    let a = n;
    a.attributes.normal || a.computeVertexNormals();
    for (let p of Object.keys(a.attributes)) p !== "position" && p !== "normal" && p !== "uv" && a.deleteAttribute(p);
    let l = a.attributes.position.count;
    a.attributes.uv || a.setAttribute("uv", new BufferAttribute(new Float32Array(l * 2), 2));
    a.translate(r.world[0], r.world[1], r.world[2]);
    let c = new Float32Array(l * 3);
    let u = new Uint16Array(l * 4);
    let h = new Float32Array(l * 4);
    let f = a.attributes.normal;
    for (let p = 0; p < l; p++) {
      let d = o ? .74 + .26 * (f.getY(p) * .5 + .5) : 1;
      c[p * 3] = s[0] * d;
      c[p * 3 + 1] = s[1] * d;
      c[p * 3 + 2] = s[2] * d;
      u[p * 4] = r.i;
      h[p * 4] = 1;
    }
    a.setAttribute("color", new BufferAttribute(c, 3));
    a.setAttribute("skinIndex", new BufferAttribute(u, 4));
    a.setAttribute("skinWeight", new BufferAttribute(h, 4));
    this.slots[e] || (this.slots[e] = [], this.order.push(e));
    this.slots[e].push(a);
    return this;
  }
  build(e) {
    let t = (e || this.order).filter(o => this.slots[o] && this.slots[o].length);
    let n = t.map(o => {
      let r = this.slots[o];
      let l = r.some(u => !u.index) ? r.map(u => u.index ? u.toNonIndexed() : u) : r;
      let c = mergeGeometries(l, false);
      return c.index ? c.toNonIndexed() : c;
    });
    let s = mergeGeometries(n, true);
    s.computeBoundingSphere();
    s.computeBoundingBox();
    return {
      geometry: s,
      slots: t,
      bones: this.bones,
      tris: s.attributes.position.count / 3
    };
  }
};
function pm(i, e, {
  castShadow: t = true,
  receiveShadow: n = true,
  radius: s = 1.5,
  center: o = [0, .5, 0],
  extra: r = null
} = {}) {
  let a = i.bones.map(p => {
    let d = new Bone();
    d.name = p.name;
    d.position.set(p.local[0], p.local[1], p.local[2]);
    return d;
  });
  i.bones.forEach((p, d) => {
    p.parent >= 0 && a[p.parent].add(a[d]);
  });
  let l = new Group();
  let c = new SkinnedMesh(i.geometry, i.slots.map(p => e[p]));
  c.castShadow = t;
  c.receiveShadow = n;
  l.add(c);
  i.bones.forEach((p, d) => {
    p.parent < 0 && c.add(a[d]);
  });
  l.updateMatrixWorld(true);
  let u = new Skeleton(a);
  c.bind(u);
  c.boundingSphere = new Sphere(new Vector3(o[0], o[1], o[2]), s);
  c.boundingBox = new Box3(new Vector3(o[0] - s, o[1] - s, o[2] - s), new Vector3(o[0] + s, o[1] + s, o[2] + s));
  let h = {};
  a.forEach(p => {
    h[p.name] = p;
  });
  let f = {
    group: l,
    mesh: c,
    bones: h,
    skeleton: u,
    extraMesh: null
  };
  if (r) {
    let p = new SkinnedMesh(r.def.geometry, r.def.slots.map(d => e[d]));
    p.castShadow = false;
    p.receiveShadow = false;
    p.renderOrder = 5;
    l.add(p);
    p.updateMatrixWorld(true);
    p.bind(u, c.bindMatrix);
    p.boundingSphere = new Sphere(new Vector3(o[0], o[1], o[2]), r.radius || s);
    p.boundingBox = new Box3().setFromCenterAndSize(p.boundingSphere.center, new Vector3(1, 1, 1).multiplyScalar(2 * (r.radius || s)));
    f.extraMesh = p;
  }
  return f;
}
function q_(i, e, t, n, s, o, r, a) {
  let l = e * e + t * t;
  let c = Math.sqrt(Math.max(l - o * o, 1e-6));
  i.abd = Math.atan2(t, e) - Math.atan2(-c, s * o);
  i.abd > Math.PI ? i.abd -= 2 * Math.PI : i.abd < -Math.PI && (i.abd += 2 * Math.PI);
  let u = Math.hypot(c, n);
  let h = (r + a) * .995;
  let f = Math.abs(r - a) + .03;
  i.reach = u / (r + a);
  u > h ? u = h : u < f && (u = f);
  let p = Math.atan2(n, c);
  let d = (r * r + u * u - a * a) / (2 * r * u);
  let v = (r * r + a * a - u * u) / (2 * r * a);
  let g = Math.acos(d < -1 ? -1 : d > 1 ? 1 : d);
  let x = Math.acos(v < -1 ? -1 : v > 1 ? 1 : v);
  i.hip = g - p;
  i.knee = -(Math.PI - x);
  return i;
}
export { iu, pm, q_ };
