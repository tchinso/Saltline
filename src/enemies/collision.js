import { Vector3 } from '../../vendor/three.js';
function sM(i, e, t, n, s, o) {
  let r = i.x - t.x;
  let a = i.y - t.y;
  let l = i.z - t.z;
  let c = r * e.x + a * e.y + l * e.z;
  let u = r * r + a * a + l * l - n * n;
  let h = c * c - u;
  if (h < 0) return false;
  let f = -c - Math.sqrt(h);
  return f < 0 || f > s || f >= o.dist ? false : (o.dist = f, o.point.copy(i).addScaledVector(e, f), o.normal.copy(o.point).sub(t).normalize(), true);
}
var au = new Vector3();
var Jv = new Vector3();
var tM = new Vector3();
function nM(i, e, t, n, s, o, r) {
  au.copy(n).sub(t);
  Jv.copy(i).sub(t);
  let a = au.dot(au);
  let l = au.dot(e);
  let c = au.dot(Jv);
  let u = e.dot(Jv);
  let h = a - l * l;
  let f = h > 1e-8 ? (c - l * u) / h : 0;
  f = f < 0 ? 0 : f > 1 ? 1 : f;
  tM.copy(t).addScaledVector(au, f);
  return sM(i, e, tM, s, o, r);
}
export { nM, sM };
