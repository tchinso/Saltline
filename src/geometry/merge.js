import { BufferAttribute, BufferGeometry } from '../../vendor/three.js';
function mergeGeometries(i, e = false) {
  let t = i[0].index !== null;
  let n = new Set(Object.keys(i[0].attributes));
  let s = new Set(Object.keys(i[0].morphAttributes));
  let o = {};
  let r = {};
  let a = i[0].morphTargetsRelative;
  let l = new BufferGeometry();
  let c = 0;
  for (let u = 0; u < i.length; ++u) {
    let h = i[u];
    let f = 0;
    if (t !== (h.index !== null)) {
      console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + u + ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.");
      return null;
    }
    for (let p in h.attributes) {
      if (!n.has(p)) {
        console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + u + '. All geometries must have compatible attributes; make sure "' + p + '" attribute exists among all geometries, or in none of them.');
        return null;
      }
      o[p] === void 0 && (o[p] = []);
      o[p].push(h.attributes[p]);
      f++;
    }
    if (f !== n.size) {
      console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + u + ". Make sure all geometries have the same number of attributes.");
      return null;
    }
    if (a !== h.morphTargetsRelative) {
      console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + u + ". .morphTargetsRelative must be consistent throughout all geometries.");
      return null;
    }
    for (let p in h.morphAttributes) {
      if (!s.has(p)) {
        console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + u + ".  .morphAttributes must be consistent throughout all geometries.");
        return null;
      }
      r[p] === void 0 && (r[p] = []);
      r[p].push(h.morphAttributes[p]);
    }
    if (e) {
      let p;
      if (t) p = h.index.count;else if (h.attributes.position !== void 0) p = h.attributes.position.count;else {
        console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + u + ". The geometry must have either an index or a position attribute");
        return null;
      }
      l.addGroup(c, p, u);
      c += p;
    }
  }
  if (t) {
    let u = 0;
    let h = [];
    for (let f = 0; f < i.length; ++f) {
      let p = i[f].index;
      for (let d = 0; d < p.count; ++d) h.push(p.getX(d) + u);
      u += i[f].attributes.position.count;
    }
    l.setIndex(h);
  }
  for (let u in o) {
    let h = mergeAttributes(o[u]);
    if (!h) {
      console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + u + " attribute.");
      return null;
    }
    l.setAttribute(u, h);
  }
  for (let u in r) {
    let h = r[u][0].length;
    if (h === 0) break;
    l.morphAttributes = l.morphAttributes || {};
    l.morphAttributes[u] = [];
    for (let f = 0; f < h; ++f) {
      let p = [];
      for (let v = 0; v < r[u].length; ++v) p.push(r[u][v][f]);
      let d = mergeAttributes(p);
      if (!d) {
        console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + u + " morphAttribute.");
        return null;
      }
      l.morphAttributes[u].push(d);
    }
  }
  return l;
}
function mergeAttributes(i) {
  let e;
  let t;
  let n;
  let s = -1;
  let o = 0;
  for (let c = 0; c < i.length; ++c) {
    let u = i[c];
    if (e === void 0 && (e = u.array.constructor), e !== u.array.constructor) {
      console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.");
      return null;
    }
    if (t === void 0 && (t = u.itemSize), t !== u.itemSize) {
      console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.");
      return null;
    }
    if (n === void 0 && (n = u.normalized), n !== u.normalized) {
      console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.");
      return null;
    }
    if (s === -1 && (s = u.gpuType), s !== u.gpuType) {
      console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.");
      return null;
    }
    o += u.count * t;
  }
  let r = new e(o);
  let a = new BufferAttribute(r, t, n);
  let l = 0;
  for (let c = 0; c < i.length; ++c) {
    let u = i[c];
    if (u.isInterleavedBufferAttribute) {
      let h = l / t;
      for (let f = 0, p = u.count; f < p; f++) for (let d = 0; d < t; d++) {
        let v = u.getComponent(f, d);
        a.setComponent(f + h, d, v);
      }
    } else r.set(u.array, l);
    l += u.count * t;
  }
  s !== void 0 && (a.gpuType = s);
  return a;
}
export { mergeGeometries };
