import { ExtrudeGeometry, Group, Shape } from '../../../../vendor/three.js';
import { beveledBoxGeometry, boxGeometry, createMesh, cylinderGeometry } from '../../../geometry/primitives.js';
function Hc(i, e, t, n, s = 0) {
  let o = new Group();
  o.position.set(e, s, t);
  o.rotation.y = n;
  i.staticRoot.add(o);
  return o;
}
function Rn(i, e, t, n, s, o, r, a, l, c = 0, u = null) {
  let h = createMesh(c ? beveledBoxGeometry(n, s, o, c) : boxGeometry(n, s, o), typeof t == "string" ? i.M(t) : t);
  h.position.set(r, a, l);
  u && h.rotation.set(u[0], u[1], u[2]);
  e.add(h);
  return h;
}
function ov(i, e, t, n, s, o, r, a, l = null, c = 8) {
  let u = createMesh(cylinderGeometry(n, n, s, c), typeof t == "string" ? i.M(t) : t);
  u.position.set(o, r, a);
  l && u.rotation.set(l[0], l[1], l[2]);
  e.add(u);
  return u;
}
function rv(i, e, t, n, s, o, r, a = "metal", l = 0) {
  let c = Math.abs(Math.cos(n));
  let u = Math.abs(Math.sin(n));
  let h = Math.abs(Math.sin(2 * n)) > .2 ? .9 : 1;
  let f = (s * c + o * u) / 2 * h;
  let p = (s * u + o * c) / 2 * h;
  i.col(e - f, l, t - p, e + f, l + r, t + p, a);
}
function Ka(i, e, t, n = 0, s = "paint_blue", o = 1) {
  let r = Hc(i, e, t, n);
  let a = 2.2;
  let l = 1.2;
  let c = 1.25;
  let u = i.M(s);
  let h = i.M("steel_dark");
  Rn(i, r, h, a, .05, l, 0, .13, 0);
  for (let d of [-1, 1]) Rn(i, r, u, .1, .1, l, d * (a / 2 - .25), .05, 0);
  for (let d of [-1, 1]) for (let v of [-1, 1]) Rn(i, r, u, .07, c - .1, .07, d * (a / 2 - .035), .1 + (c - .1) / 2, v * (l / 2 - .035), .008);
  for (let d of [-1, 1]) {
    Rn(i, r, u, a, .06, .06, 0, c - .03, d * (l / 2 - .03), .008);
    Rn(i, r, u, a, .05, .05, 0, .62, d * (l / 2 - .03));
    Rn(i, r, i.M("chainlink"), a - .14, c - .25, .012, 0, .15 + (c - .25) / 2, d * (l / 2 - .035));
  }
  for (let d of [-1, 1]) {
    Rn(i, r, u, .06, .06, l, d * (a / 2 - .03), c - .03, 0, .008);
    Rn(i, r, i.M("chainlink"), .012, c - .25, l - .14, d * (a / 2 - .035), .15 + (c - .25) / 2, 0);
  }
  let f = i.M("steel_worn");
  let p = i.M("steel_rust");
  for (let d = 0; d < 14; d++) {
    let v = (d * .618 + o * .37) % 1;
    let g = (d * .414 + o * .11) % 1;
    let x = 1.5 + g * .9;
    ov(i, r, d % 3 ? f : p, .014, x, -a / 2 + .25 + v * (a - .9), .16 + x / 2 * .96, -l / 2 + .2 + g * (l - .4), [.1 * (g - .5), 0, .28 * (v - .3)], 5);
  }
  for (let d = 0; d < 6; d++) {
    let v = (d * .37 + o * .2) % 1;
    ov(i, r, p, .035, .42, a / 2 - .45 + (v - .5) * .3, .22 + d * .05, (v - .5) * .7, [Math.PI / 2 + v, v * 3, .2], 6);
  }
  rv(i, e, t, n, a, l, c, "metal");
  return r;
}
function Qa(i, e, t, n = 0, s = "paint_red") {
  let o = Hc(i, e, t, n);
  let r = 1.1;
  let a = .8;
  let l = .75;
  let c = i.M(s);
  for (let h of [-1, 1]) Rn(i, o, c, .09, .1, a, h * .36, .05, 0);
  Rn(i, o, c, r, .04, a, 0, .12, 0);
  for (let h of [-1, 1]) Rn(i, o, c, r, l - .1, .03, 0, .1 + (l - .1) / 2, h * (a / 2 - .015), .006);
  for (let h of [-1, 1]) Rn(i, o, c, .03, l - .1, a, h * (r / 2 - .015), .1 + (l - .1) / 2, 0, .006);
  for (let h of [-1, 1]) for (let f of [-1, 1]) Rn(i, o, c, .06, l, .06, h * (r / 2 - .02), l / 2, f * (a / 2 - .02), .01);
  Rn(i, o, i.M("steel_dark"), r - .08, .04, a - .08, 0, l - .22, 0);
  let u = i.M("steel_worn");
  for (let h = 0; h < 12; h++) {
    let f = h * .618 % 1;
    let p = h * .37 % 1;
    Rn(i, o, u, .16, .11, .1, (f - .5) * (r - .3), l - .16 + h % 3 * .03, (p - .5) * (a - .25), .012, [p, f * 3, f]);
  }
  rv(i, e, t, n, r, a, l, "metal");
  return o;
}
function Ef(i, e, t, n = 0, s = 9) {
  let o = Hc(i, e, t, n);
  let r = i.M("steel_worn");
  let a = i.M("steel_rust");
  for (let l of [-1.1, 1.1]) Rn(i, o, "wood_dark", .1, .08, .7, l, .04, 0, .008);
  for (let l = 0; l < s; l++) {
    let c = l < 5 ? 0 : 1;
    let u = c ? l - 5 : l;
    ov(i, o, l % 2 ? r : a, .016, 3.4 + l % 3 * .12, (l % 3 - 1) * .06, .1 + c * .03, (u - (c ? 1.5 : 2)) * .045 + c * .02, [0, .01 * (l - 4), Math.PI / 2], 5);
  }
  for (let l = 0; l < s; l += 3) Rn(i, o, a, .07, .05, .03, 1.72, .11, (l - 4) * .02);
  return o;
}
function e0(i, e, t, n = 0) {
  let s = Hc(i, e, t, n);
  let o = new Shape();
  o.moveTo(-.16, 0);
  o.lineTo(.16, 0);
  o.lineTo(.16, .05);
  o.lineTo(-.1, .19);
  o.lineTo(-.16, .19);
  o.closePath();
  let r = new ExtrudeGeometry(o, {
    depth: .2,
    bevelEnabled: false
  });
  r.translate(0, 0, -.1);
  s.add(createMesh(r, i.M("rubber")));
  Rn(i, s, "paint_yellow", .012, .16, .18, -.166, .1, 0);
  return s;
}
function Sf(i, e, t, n, s = "x-", o = 3.2) {
  let r = s[0] === "x";
  i.cyl("steel_galv", .045, o, e, o / 2, t, {
    seg: 8
  });
  i.box("steel_dark", .3, .02, .3, e, .01, t);
  let a = 1.1;
  let l = .62;
  let c = .03;
  i.box("paint_yellow", r ? c : a, l, r ? a : c, e, o - l / 2 - .05, t, {
    bevel: .01
  });
  let u = s[1] === "+" ? 1 : -1;
  let h = r ? e + u * (c / 2 + .003) : e;
  let f = r ? t : t + u * (c / 2 + .003);
  i.label(n, .4, h, o - l / 2 - .05, f, s, {
    color: "black",
    font: "stencil",
    distress: .35
  });
  i.col(e - .06, 0, t - .06, e + .06, o, t + .06, "metal", {
    noNav: true
  });
}
function av(i, e, t, n = 2, s = true, o = .02) {
  let u = ["paint_grey", "paint_teal", "paint_grey", "steel_rust"];
  for (let d = 0; d < n; d++) {
    let v = Hc(i, e + (d ? .12 * Math.sin(d * 2.1) : 0), t + (d ? .18 * Math.cos(d * 1.7) : 0), (s ? Math.PI / 2 : 0) + o * (d % 2 ? -1 : 1.3), 0);
    let g = .1 + d * (.5 + .1);
    for (let y of [-3.6, 0, 3.6]) Rn(i, v, "wood_dark", .14, .1, 4.2 - .2, y, g - .1 / 2, 0, .01);
    let x = i.M(u[d % u.length]);
    Rn(i, v, x, 10.4, .5 - .08, 4.2, 0, g + (.5 - .08) / 2, 0, .03);
    Rn(i, v, x, 10.4 - .5, .08, 4.2 - .5, 0, g + .5 - .04, 0, .02);
    for (let y of [-1.4, -.7, 0, .7, 1.4]) Rn(i, v, x, 10.4 - .9, .05, .09, 0, g + .5 + .02, y, .01);
    for (let y of [-1, 1]) for (let b of [-1, 1]) {
      Rn(i, v, "steel_dark", .32, .12, .32, y * (10.4 / 2 - .35), g + .5 - .02, b * (4.2 / 2 - .35), .02);
      Rn(i, v, "paint_yellow", .5, .5 - .1, .02, y * (10.4 / 2 - .5), g + (.5 - .08) / 2, b * (4.2 / 2 + .006));
    }
    for (let y of [-1, 1]) Rn(i, v, "rubber", .04, .12, 4.2 - .4, y * (10.4 / 2 + .01), g + .1, 0);
  }
  let h = .1 + n * (.5 + .1);
  let f = (s ? 4.2 : 10.4) / 2 + .05;
  let p = (s ? 10.4 : 4.2) / 2 + .05;
  i.col(e - f, 0, t - p, e + f, h, t + p, "metal");
  i.metalRects.push([e - f, t - p, e + f, t + p]);
  return h;
}
function Lr(i, e, t = .025, n = "rubber", s = null) {
  let o = [];
  for (let r = 0; r < e.length; r++) {
    let a = e[r];
    if (o.push([a[0], a.length > 2 ? a[2] : s ?? t * .9, a[1]]), r < e.length - 1) {
      let l = e[r + 1];
      let c = l[0] - a[0];
      let u = l[1] - a[1];
      let h = Math.hypot(c, u);
      if (h > 2.2 && a.length < 3 && l.length < 3) {
        let f = Math.floor(h / 1.6);
        for (let p = 1; p < f; p++) {
          let d = p / f;
          let v = Math.sin((r * 3.1 + p) * 2.3) * Math.min(.28, h * .04);
          o.push([a[0] + c * d - u / h * v, s ?? t * .9, a[1] + u * d + c / h * v]);
        }
      }
    }
  }
  return i.tube(n, o, t, {
    radial: 6,
    cast: false
  });
}
function lv(i, e, t, n = 0) {
  let s = Hc(i, e, t, n);
  Rn(i, s, "concrete", .7, .12, .5, 0, .06, 0, .015);
  Rn(i, s, "paint_grey", .55, .9, .3, 0, .57, 0, .015);
  Rn(i, s, "steel_dark", .5, .03, .34, 0, 1.03, 0);
  Rn(i, s, "hazard_stripes", .3, .12, .01, 0, .8, .156);
  rv(i, e, t, n, .7, .5, 1.05, "metal");
  return s;
}
export { Ef, Ka, Lr, Qa, Sf, av, e0, lv };
