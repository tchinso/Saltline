import { At, Ge, Ja, Kn, M1, Mo, eo, gn, gr, ja, to, tt, us, vn, vr, wf, zi } from './geometry.js';
import { THREE } from '../../../vendor/three.js';
import { boxGeometry, cylinderGeometry, tubeGeometry } from '../../geometry/primitives.js';
var j3 = (i, e, t) => {
  let n = zi((t - i) / (e - i), 0, 1);
  return n * n * (3 - 2 * n);
};
function $3(i, e, t = 0, n = 0) {
  let s = new THREE.PlaneGeometry(i, e);
  let o = s.attributes.uv;
  let r = s.attributes.position;
  for (let a = 0; a < o.count; a++) o.setXY(a, r.getX(a) + t, r.getY(a) + n);
  return s;
}
var w1 = {
  pz: [0, 0, 0],
  nz: [0, At, 0],
  px: [0, tt, 0],
  nx: [0, -tt, 0]
};
function OA(i) {
  let t = [[0, .016], [.262, .016], [.262, .016], [.268, .002], [.288, 0], [.295, .008], [.295, .022], [.284, .034]];
  for (let n of [.305, .595]) t.push([.283, n - .03], [.291, n - .018], [.297, n], [.291, n + .018], [.283, n + .03]);
  t.push([.284, .866], [.295, .878], [.295, .892], [.288, .9], [.268, .898]);
  i ? t.push([.268, .898], [.272, .888], [.272, .03], [.272, .03], [0, .03]) : t.push([.262, .884], [.262, .884], [0, .884]);
  return t;
}
function HA(i, e, t) {
  let n = new Kn(i, "barrel", t);
  let s = n.rng;
  let o = 22;
  let [r, a] = Ja(e.color, "blue");
  e.lying && n.push({
    p: [-.45, .297, 0],
    r: [0, 0, -tt]
  });
  let l = us(OA(!!e.open), o);
  let c = [];
  for (let d = 0; d < 2 + t % 2; d++) c.push([s() * At * 2, s.range(.12, .78), s.range(.07, .13), s.range(.006, .014)]);
  to(l, d => {
    let v = Math.hypot(d.x, d.z);
    if (v < .27) return;
    let g = Math.atan2(d.z, d.x);
    for (let x of c) {
      let y = Math.abs(g - x[0]) % (At * 2);
      y > At && (y = At * 2 - y);
      let b = Math.hypot(y * .285, d.y - x[1]);
      if (b < x[2]) {
        let m = 1 - x[3] * (.5 + .5 * Math.cos(At * b / x[2])) / v;
        d.x *= m;
        d.z *= m;
      }
    }
  });
  l.computeVertexNormals();
  let u = l.attributes.normal;
  let h = l.attributes.position.count / (o + 1);
  for (let d = 0; d < h; d++) {
    let v = d * (o + 1);
    let g = v + o;
    let x = u.getX(v) + u.getX(g);
    let y = u.getY(v) + u.getY(g);
    let b = u.getZ(v) + u.getZ(g);
    let m = Math.hypot(x, y, b) || 1;
    u.setXYZ(v, x / m, y / m, b / m);
    u.setXYZ(g, x / m, y / m, b / m);
  }
  let f = t * 2.37;
  let p = e.color === "rust";
  n.add(r, l, null, (d, v, g) => {
    let x = Math.hypot(d, g);
    let y = Math.atan2(g, d);
    if (x < .27) {
      let w = v > .5 ? .62 + .3 * gn(d * 9 + f, g * 9) : .6;
      return [w, w, w];
    }
    let b = Math.pow(gn(y * 2.6 + f, 3.1), 2.2);
    let m = v > .6 ? (.88 - v) / .28 : v > .31 ? (.6 - v) / .29 : (.31 - v) / .31;
    let A = 1 - .55 * b * (1 - .6 * zi(m, 0, 1));
    let M = (x > .289 ? 1 : 0) * (.35 + .65 * gn(y * 7 + f, v * 20));
    let E = [A * (1 - .25 * M), A * (1 - .42 * M), A * (1 - .55 * M)];
    typeof a != "number" && (E[0] *= a[0], E[1] *= a[1], E[2] *= a[2]);
    return E;
  });
  e.open || (n.add("steel_galv", cylinderGeometry(.036, .038, .016, 8), {
    p: [.17, .891, .02]
  }, .8), n.add("steel_galv", cylinderGeometry(.017, .018, .014, 8), {
    p: [-.16, .89, -.08]
  }, .8));
  !p && t % 3 !== 2 && n.cdecal(i.mats.decal("hazard_flammable"), .2855, .15, {
    p: [0, .455, 0],
    r: [0, .9 + t, 0]
  });
  t % 2 === 0 && n.cdecal(i.mats.label("UN 1202", {
    color: p || e.color === "white" || e.color === "yellow" ? "black" : "white",
    font: "stencil",
    distress: .5
  }), .2855, .2, {
    p: [0, .74, 0],
    r: [0, 2.6 + t, 0]
  });
  return n.finish(e.lying ? {
    size: [.9, .6, .6]
  } : {});
}
function S1(i, e, {
  broken: t = false,
  stamp: n = true,
  bevel: s = false
} = {}) {
  let o = s ? (u, h, f) => Ge(u, h, f, .004) : (u, h, f) => boxGeometry(u, h, f);
  let r = () => {
    let u = e.range(.62, 1);
    let h = e.range(.9, 1);
    return [u, u * (.93 + .07 * h), u * (.82 + .18 * h)];
  };
  let a = (u = .003) => e.range(-u, u);
  for (let [u, h] of [[-.45, .1], [0, .145], [.45, .1]]) i.add("wood_pallet", o(1.2, .022, h), {
    p: [a(), .011, u + a()],
    r: [0, a(.006), 0]
  }, r());
  let l = (u, h, f = .012) => [[-u / 2 + f, -h / 2], [u / 2 - f, -h / 2], [u / 2, -h / 2 + f], [u / 2, h / 2 - f], [u / 2 - f, h / 2], [-u / 2 + f, h / 2], [-u / 2, h / 2 - f], [-u / 2, -h / 2 + f]];
  for (let u of [-.5275, 0, .5275]) for (let h of [-.45, 0, .45]) i.add("wood_pallet", Mo(l(.145, h === 0 ? .145 : .1), .078, {
    caps: false,
    soft: 0
  }), {
    p: [u + a(), .061, h + a()],
    r: [-tt, a(.03), 0]
  }, r().map(f => f * .8));
  for (let u of [-.5275, 0, .5275]) i.add("wood_pallet", o(.145, .022, 1), {
    p: [u + a(), .111, a()],
    r: [0, a(.006), 0]
  }, r());
  if ([[-.4275, .145], [-.215, .1], [0, .145], [.215, .1], [.4275, .145]].forEach(([u, h], f) => {
    t && f === 3 || i.add("wood_pallet", o(1.2, .022, h), {
      p: [a(), .133, u + a(.006)],
      r: [a(.004), a(.008), 0]
    }, r());
  }), n) {
    let u = i.G.mats.label("EUR", {
      color: "black",
      font: "sans",
      distress: .6
    });
    i.decal(u, .085, {
      p: [-.5275, .062, .5015]
    });
    i.decal(u, .085, {
      p: [.5275, .062, -.5015],
      r: [0, At, 0]
    });
  }
}
function VA(i, e, t) {
  let n = new Kn(i, "pallet", t);
  S1(n, n.rng, {
    broken: !!e.broken,
    bevel: true
  });
  return n.finish();
}
function WA(i, e) {
  let t = new Kn(i, "pallet_stack", e.seed || 0);
  let n = t.rng;
  let s = zi(e.count | 0 || 8, 1, 12);
  for (let o = 0; o < s; o++) {
    let r = o === s - 1;
    t.push({
      p: [o ? n.range(-.028, .028) : 0, o * .144, o ? n.range(-.022, .022) : 0],
      r: [0, n.range(-.035, .035) + (n() < .3 ? At : 0) + (r ? n.range(-.06, .06) : 0), 0]
    });
    S1(t, n, {
      broken: !r && n() < .2,
      stamp: o % 3 === 0,
      bevel: r
    });
    t.pop();
  }
  return t.finish({
    size: [1.2, s * .144, 1]
  });
}
function E1(i, e, t, n, {
  detail: s = true,
  label: o = "FRAGILE",
  code: r = "B4-117",
  skids: a = true
} = {}) {
  let l = i.rng;
  let c = i.G;
  let u = .022;
  let h = .07;
  let f = a ? .07 : 0;
  let p = t - f;
  let d = f + p / 2;
  let v = (z = 1) => {
    let H = l.range(.7, 1) * z;
    return [H, H * l.range(.92, 1), H * l.range(.82, .95)];
  };
  let g = s ? (z, H, O) => Ge(z, H, O, .004) : (z, H, O) => boxGeometry(z, H, O);
  if (a) for (let z of [-(e / 2 - .13), 0, e / 2 - .13]) i.add("wood_pallet", Ge(.09, f, n - .02, .006), {
    p: [z, f / 2, 0]
  }, v(.6));
  i.add("wood_dark", boxGeometry(e - 2 * u - .012, p - u - .012, n - 2 * u - .012), {
    p: [0, f + (p - u - .012) / 2 + .002, 0]
  }, .25);
  let x = Math.max(3, Math.round(p / .125));
  let y = p / x;
  for (let z = 0; z < x; z++) {
    let H = f + y * (z + .5);
    for (let [O, q, U] of [["pz", e, n / 2 - u], ["nz", e, n / 2 - u], ["px", n, e / 2 - u], ["nx", n, e / 2 - u]]) {
      let T = U - l.range(0, .004);
      let D = O === "pz" ? [0, H, T] : O === "nz" ? [0, H, -T] : O === "px" ? [T, H, 0] : [-T, H, 0];
      i.add("wood_pallet", $3(q - .03, y - .005, l() * 3, l() * 3), {
        p: D,
        r: w1[O]
      }, v());
    }
  }
  let b = Math.max(3, Math.round(n / .13));
  let m = (n - .02) / b;
  for (let z = 0; z < b; z++) i.add("wood_pallet", $3(e - .03, m - .005, l() * 3, l() * 3), {
    p: [0, t - u - l.range(0, .003), -n / 2 + .01 + m * (z + .5)],
    r: [-tt, 0, 0]
  }, v());
  let A = Math.atan2(p - 2 * h, e - 2 * h);
  let _ = Math.hypot(e - 2 * h, p - 2 * h);
  for (let z of [1, -1]) {
    let H = z * (n / 2 - u / 2);
    i.add("wood_pallet", g(e, h, u), {
      p: [0, f + h / 2, H]
    }, v(.85));
    i.add("wood_pallet", g(e, h, u), {
      p: [0, t - h / 2, H]
    }, v(.85));
    for (let U of [1, -1]) i.add("wood_pallet", g(h, p - 2 * h, u), {
      p: [U * (e / 2 - h / 2), d, H]
    }, v(.85));
    s && i.add("wood_pallet", Ge(_, h * .85, u * .8, .004), {
      p: [0, d, z * (n / 2 - u * .6)],
      r: [0, 0, z * A]
    }, v(.8));
    let O = z * (e / 2 - u / 2);
    let q = n - 2 * u;
    for (let U of [1, -1]) i.add("wood_pallet", g(u, p, h), {
      p: [O, d, U * (q / 2 - h / 2)]
    }, v(.85));
    i.add("wood_pallet", g(u, h, q - 2 * h), {
      p: [O, f + h / 2, 0]
    }, v(.85));
    i.add("wood_pallet", g(u, h, q - 2 * h), {
      p: [O, t - h / 2, 0]
    }, v(.85));
    i.add("wood_pallet", g(e, u, h), {
      p: [0, t - u / 2, z * (n / 2 - h / 2)]
    }, v(.85));
    i.add("wood_pallet", g(h, u, n - 2 * h), {
      p: [z * (e / 2 - h / 2), t - u / 2, 0]
    }, v(.85));
  }
  s && i.add("wood_pallet", Ge(h, u, n - 2 * h, .004), {
    p: [0, t - u / 2, 0]
  }, v(.85));
  let M = .085;
  let E = () => {
    let z = l.range(.55, .9);
    return [z, z * .9, z * .8];
  };
  for (let z of [1, -1]) for (let H of [1, -1]) for (let O of s ? [1, 0] : [1]) {
    let q = O ? t - M / 2 : f + M / 2;
    let U = E();
    i.add("steel_galv", boxGeometry(M, M, .003), {
      p: [z * (e / 2 - M / 2), q, H * (n / 2 + .0015)]
    }, U);
    i.add("steel_galv", boxGeometry(.003, M, M), {
      p: [z * (e / 2 + .0015), q, H * (n / 2 - M / 2)]
    }, U);
    O && i.add("steel_galv", boxGeometry(M, .003, M), {
      p: [z * (e / 2 - M / 2), t + .0015, H * (n / 2 - M / 2)]
    }, U);
  }
  let w = n / 2 - u + .003;
  let S = Math.min(.11, p * .15);
  o && (i.label(o, {
    color: "black",
    font: "stencil",
    distress: .25
  }, e * .4, S, {
    p: [-e * .2, t - h - S * .95, w]
  }), i.label(o, {
    color: "black",
    font: "stencil",
    distress: .25
  }, e * .4, S, {
    p: [e * .2, t - h - S * .95, -w],
    r: [0, At, 0]
  }), i.decal(c.mats.decal("arrow"), Math.min(.14, p * .2), {
    p: [e * .27, f + h + p * .16, w],
    r: [0, 0, tt]
  }));
  r && i.label(r, {
    color: "black",
    font: "stencil",
    distress: .3
  }, n * .5, S * .9, {
    p: [e / 2 - u + .003, d + p * .12, 0],
    r: w1.px
  });
  s && i.decal(c.mats.decal("logo_b"), Math.min(.2, p * .25), {
    p: [-(e / 2 - u + .003), d - p * .05, 0],
    r: w1.nx
  });
}
function GA(i, e) {
  let t = new Kn(i, "crate_wood", e.seed || 0);
  E1(t, 1.1, 1, .9, {
    label: e.label === void 0 ? ["FRAGILE", "THIS SIDE UP", "KEEP DRY", "MACHINE PARTS"][t.seed % 4] : e.label,
    code: e.code || "B4-" + [117, 204, 318][t.seed % 3]
  });
  return t.finish();
}
function qA(i, e) {
  let t = new Kn(i, "crate_stack", e.seed || 0);
  let n = t.rng;
  E1(t, 1.2, .95, 1, {
    label: "HEAVY",
    code: "SLT 04" + t.seed % 2
  });
  let s = {
    x: n.range(-.1, .02),
    z: n.range(-.05, .05),
    th: (n() < .5 ? -1 : 1) * n.range(.1, .16),
    L: .86,
    W: .72
  };
  t.push({
    p: [s.x, .95, s.z],
    r: [0, s.th, 0]
  });
  E1(t, s.L, .6, s.W, {
    detail: false,
    skids: false,
    label: "FRAGILE",
    code: "B4-204"
  });
  t.pop();
  let o = {
    x: s.x + n.range(-.05, .05),
    z: s.z + n.range(-.04, .04),
    th: n.range(-.12, .12)
  };
  t.push({
    p: [o.x, 1.55, o.z],
    r: [0, o.th, 0]
  });
  E1(t, .55, .35, .45, {
    detail: false,
    skids: false,
    label: "",
    code: ""
  });
  t.pop();
  let r = (a, l, c, u, h) => {
    let f = (a - l.x - h * u * Math.sin(c)) / Math.cos(c);
    return l.z - f * Math.sin(c) + h * u * Math.cos(c);
  };
  for (let a of [-.2, .17]) {
    let c = [];
    let u = h => [[a, .09, h * .506], [a, .956, h * .506], [a, 1.556, r(a, s, s.th, s.W / 2, h) + h * .006], [a, 1.906, r(a, o, o.th, .225, h) + h * .006]];
    c.push(...u(1), ...u(-1).reverse());
    t.add("paint_orange", vr(c, [.02, 0, 0]), null, [1, .8, .5]);
    t.add("steel_worn", Ge(.06, .09, .025, .006), {
      p: [a, .62, .5 + .016]
    }, .8);
    t.add("steel_dark", vn([a - .035, .66, .53], [a + .035, .66, .53], .008, 6, true), null, .8);
  }
  return t.finish();
}
function XA(i, e) {
  let t = new Kn(i, "ibc_tote", e.seed || 0);
  let n = t.rng;
  let s = () => n.range(.75, 1);
  for (let y of [-.44, 0, .44]) t.add("steel_galv", boxGeometry(1.2, .028, .1), {
    p: [0, .014, y]
  }, s());
  for (let y of [-.54, 0, .54]) for (let b of [-.44, 0, .44]) t.add("steel_galv", Ge(.12, .074, .1, .008), {
    p: [y, .065, b]
  }, s() * .85);
  for (let y of [-.48, .48]) t.add("steel_galv", Ge(1.2, .03, .04, .006), {
    p: [0, .115, y]
  }, s());
  for (let y of [-.58, .58]) t.add("steel_galv", Ge(.04, .03, .92, .006), {
    p: [y, .115, 0]
  }, s());
  t.add("steel_galv", boxGeometry(1.12, .012, .92), {
    p: [0, .124, 0]
  }, .6);
  let o = 1.1;
  let r = .95;
  let a = .9;
  let l = .13 + r / 2;
  let c = eo(o, r, a, .07, 8, 6, 8);
  to(c, y => {
    let b = y.x / (o / 2);
    let m = y.y / (r / 2);
    let A = y.z / (a / 2);
    let _ = Math.cos(tt * m) * Math.cos(tt * A);
    let M = Math.cos(tt * b) * Math.cos(tt * A);
    let E = Math.cos(tt * b) * Math.cos(tt * m);
    Math.abs(b) > .9 && (y.x += Math.sign(b) * (.016 * _ + .004 * Math.abs(Math.sin(y.y * At / .22)) * _));
    Math.abs(A) > .9 && (y.z += Math.sign(A) * (.016 * E + .004 * Math.abs(Math.sin(y.y * At / .22)) * E));
    m > .9 && (y.y += .012 * M - .01 * Math.max(0, 1 - Math.hypot(y.x, y.z) / .3));
  });
  gr(c);
  let u = .13 + r * n.range(.45, .8);
  let h = t.seed * 1.3;
  let f = t.mat("plastic_grey", {
    color: 14278096
  });
  t.add(f, c, {
    p: [0, l, 0]
  }, (y, b, m) => {
    let A = j3(u - .03, u + .03, b + .02 * gn(y * 3 + h, m * 3));
    let _ = .9 + .1 * gn(y * 6, b * 6 + h, m * 6);
    return [_ * (.52 + .48 * A), _ * (.6 + .4 * A), _ * (.66 + .34 * A)];
  });
  t.add(f, cylinderGeometry(.12, .125, .03, 14), {
    p: [0, .13 + r + .005, 0]
  }, .9);
  t.add("plastic_red", us([[.105, 0], [.105, .042], [.105, .042], [.09, .05], [0, .05]], 14), {
    p: [0, .13 + r + .015, 0]
  }, .9);
  for (let y = 0; y < 8; y++) {
    let b = y * At / 4;
    t.add("plastic_red", boxGeometry(.012, .04, .02), {
      p: [Math.cos(b) * .108, .13 + r + .036, Math.sin(b) * .108],
      r: [0, -b, 0]
    }, .8);
  }
  let p = .575;
  let d = .475;
  let v = .13;
  let g = 1.1;
  let x = .011;
  for (let y of [.2, .42, .64, .86, g]) {
    let b = y === g ? .014 : x;
    for (let m of [1, -1]) {
      t.add("steel_galv", vn([-p, y, m * d], [p, y, m * d], b, 5), null, s());
      t.add("steel_galv", vn([m * p, y, -d], [m * p, y, d], b, 5), null, s());
    }
  }
  for (let y of [1, -1]) {
    for (let b = -.46; b <= .461; b += .184) t.add("steel_galv", vn([b, v, y * (d - .012)], [b, g, y * (d - .012)], x, 5), null, s());
    for (let b = -.36; b <= .361; b += .18) t.add("steel_galv", vn([y * (p - .012), v, b], [y * (p - .012), g, b], x, 5), null, s());
    t.add("steel_galv", vn([y * .28, g + .01, -d], [y * .28, g + .01, d], .013, 5), null, s());
  }
  t.add("aluminium", Ge(.42, .3, .004, .0015), {
    p: [-.1, .72, d + .014]
  }, .85);
  t.label("IBC 1000 L", {
    color: "black",
    font: "sans",
    distress: .2
  }, .36, .06, {
    p: [-.1, .8, d + .0175]
  });
  t.decal(i.mats.decal(["hazard_flammable", "hazard_general"][t.seed % 2]), .15, {
    p: [-.19, .67, d + .0175]
  });
  t.decal(i.mats.decal("numbers_0_9"), .2, {
    p: [0, .66, d + .0175]
  });
  t.decal(i.mats.decal("leak_stain"), .3, {
    p: [p + .004, .3, .02],
    r: w1.px
  });
  t.add("polymer_black", vn([.52, .2, 0], [.575, .2, 0], .05, 10, true), null, 1);
  t.add("plastic_red", vn([.575, .2, 0], [.598, .2, 0], .045, 10, true), null, .9);
  t.add("plastic_red", Ge(.02, .022, .13, .005), {
    p: [.55, .262, .02],
    r: [0, .4, 0]
  }, .9);
  t.add("polymer_black", cylinderGeometry(.012, .012, .03, 6), {
    p: [.55, .245, 0]
  });
  return t.finish();
}
function Z3(i, e, t, n = 0) {
  let s = [];
  let o = 2 * i / e;
  for (let r = 0; r < e; r++) {
    let a = -i + r * o + .003;
    let l = -i + (r + 1) * o - .003;
    let c = [a, (a + l) / 2, l];
    let u = [];
    let h = [];
    let f = [];
    let p = [];
    let d = y => Math.sqrt(Math.max(0, i * i - y * y));
    let v = t() * 2;
    let g = t() * 2;
    for (let y of c) {
      u.push(y, -d(y), 0, y, d(y), 0);
      h.push(0, 0, 1, 0, 0, 1);
      f.push(-d(y) + v, y + g, d(y) + v, y + g);
    }
    p.push(0, 2, 3, 0, 3, 1, 2, 4, 5, 2, 5, 3);
    let x = new THREE.BufferGeometry();
    x.setAttribute("position", new THREE.BufferAttribute(new Float32Array(u), 3));
    x.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(h), 3));
    x.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(f), 2));
    x.setIndex(p);
    s.push(x);
  }
  return s;
}
function YA(i, e) {
  let t = new Kn(i, "cable_reel", e.seed || 0);
  let n = t.rng;
  let s = .65;
  let o = s;
  let r = .4;
  let a = .045;
  let l = (y = 1) => {
    let b = n.range(.7, 1) * y;
    return [b, b * n.range(.93, 1), b * n.range(.85, .97)];
  };
  let c = n.range(-.5, .5);
  t.push({
    p: [0, o, 0],
    r: [0, 0, c]
  });
  for (let y of [1, -1]) {
    for (let b of Z3(s - .004, 9, n)) t.add("wood_dark", b, {
      p: [0, 0, y * (r + n.range(0, .003))],
      r: [0, y > 0 ? 0 : At, 0]
    }, l());
    for (let b of Z3(s - .004, 9, n)) t.add("wood_dark", b, {
      p: [0, 0, y * (r - a)],
      r: [0, y > 0 ? At : 0, tt]
    }, l(.8));
    t.add("wood_dark", cylinderGeometry(s, s, a, 24, true), {
      p: [0, 0, y * (r - a / 2)],
      r: [tt, 0, 0]
    }, l(.75));
    t.add("steel_dark", cylinderGeometry(.105, .105, .008, 12), {
      p: [0, 0, y * (r + .006)],
      r: [tt, 0, 0]
    }, .9);
    t.add("polymer_black", cylinderGeometry(.04, .04, .004, 10), {
      p: [0, 0, y * (r + .0105)],
      r: [tt, 0, 0]
    }, .3);
    for (let b = 0; b < 6; b++) {
      let m = b * At / 3 + .3;
      t.add("steel_galv", cylinderGeometry(.017, .017, .014, 6), {
        p: [Math.cos(m) * .3, Math.sin(m) * .3, y * (r + .006)],
        r: [tt, 0, 0]
      }, n.range(.5, .9));
    }
    t.label(y > 0 ? "NYY-J 4x95 mm2  500 m" : "SALTLINE TERMINAL", {
      color: "white",
      font: "stencil",
      distress: .45
    }, .7, .085, {
      p: [0, .4, y * (r + .006)],
      r: [0, y > 0 ? 0 : At, 0]
    });
    y > 0 && t.decal(i.mats.decal("arrow"), .2, {
      p: [.36, -.2, r + .006],
      r: [0, 0, -1.2]
    });
  }
  let u = 16;
  let h = r - a;
  let f = 2 * h / u;
  let p = .47;
  let d = [];
  for (let y = 0; y <= u; y++) {
    d.push([p - .017, -h + y * f]);
    y < u && d.push([p, -h + (y + .5) * f]);
  }
  let v = t.seed * .7;
  t.add("rubber", us(d, 20), {
    r: [tt, 0, 0]
  }, (y, b, m) => .7 + .5 * gn(Math.atan2(b, y) * 2 + v, m * 30));
  t.pop();
  let g = .2;
  let x = [];
  for (let y = 1.9; y >= -.25; y -= .36) x.push([Math.cos(y) * (p + .012), o + Math.sin(y) * (p + .012), g + (1.9 - y) * .02]);
  x.push([.53, .3, g + .05], [.56, .08, g + .06], [.5, .024, g + .02], [.3, .022, g - .1], [.05, .022, g - .02], [-.2, .022, g + .06], [-.38, .022, g - .05]);
  t.add("rubber", tubeGeometry(x, .02, 6, false, .5), null, .9);
  t.add("brass", vn([-.38, .022, g - .05], [-.41, .022, g - .07], .014, 6, true), null, .9);
  for (let y of [r - a / 2, -(r - a / 2)]) {
    t.add("wood_pallet", Mo([[.14, 0], [.37, 0], [.37, .1]], .1, {
      soft: 0
    }), {
      p: [0, 0, y]
    }, l(.8));
    t.add("wood_pallet", Mo([[-.37, 0], [-.14, 0], [-.37, .1]], .1, {
      soft: 0
    }), {
      p: [0, 0, y]
    }, l(.8));
  }
  return t.finish();
}
function tv(i, e, t, n = 20) {
  let s = i - t;
  let o = Math.min(.011, s * .08);
  let r = [[t, e * .18], [t + s * .45, e * .035], [i - s * .2, e * .02], [i - s * .06, e * .07], [i, e * .17], [i, e * .17], [i, e * .355], [i - o, e * .385], [i, e * .415], [i, e * .585], [i - o, e * .615], [i, e * .645], [i, e * .83], [i, e * .83], [i - s * .06, e * .93], [i - s * .2, e * .98], [t + s * .45, e * .965], [t, e * .82], [t, e * .82], [t, e * .18]];
  let a = us(r, n);
  let l = a.attributes.uv;
  let c = r.length;
  let u = [0];
  for (let v = 1; v < c; v++) u.push(u[v - 1] + Math.hypot(r[v][0] - r[v - 1][0], r[v][1] - r[v - 1][1]));
  let h = (u[8] + u[9]) / 2;
  let f = h - u[4];
  let p = u[4] - u[0];
  let d = Math.max(1, Math.round(2 * At * i / .5)) * .5;
  for (let v = 0; v < c; v++) {
    let g = v >= c - 2 ? -(f + p) : u[v] - h;
    let x = Math.abs(g);
    let y = Math.sign(g) * (x <= f + 1e-6 ? x / f * .126 : .126 + Math.min(1, (x - f) / p) * .022);
    for (let b = 0; b <= n; b++) l.setXY(v * (n + 1) + b, b / n * d, y);
  }
  return a;
}
function $A(i, e) {
  let t = new Kn(i, "tire_stack", e.seed || 0);
  let n = t.rng;
  let s = zi(e.count | 0 || 4, 1, 5);
  for (let o = 0; o < s; o++) {
    let r = tv(.39, .25, .215, s > 4 ? 16 : 20);
    let a = {
      p: [o ? n.range(-.022, .022) : 0, o * .25 - (o ? .004 : 0), o ? n.range(-.022, .022) : 0],
      r: [0, n() * 6, 0]
    };
    let l = n.range(.75, 1);
    let c = o * 3.1;
    t.add("tire", r, a, (u, h, f) => {
      let p = Math.hypot(u - a.p[0], f - a.p[2]);
      return l * (p < .23 ? .5 : .8 + .2 * gn(Math.atan2(f, u) * 3 + c, p * 30));
    });
  }
  return t.finish({
    size: [.8, s * .25, .8]
  });
}
function ZA(i, e, t) {
  let n = new Kn(i, "jerry_can", t);
  let [s, o] = Ja(e.color, "olive");
  let r = eo(.336, .36, .156, .022, 3, 3, 3, "bottom");
  let a = (x, y) => y > .3 && x > .04 ? y - (x - .04) * .5 : y;
  to(r, x => {
    x.y = a(x.x, x.y);
    Math.abs(x.z) > .07 && Math.abs(x.x) < .14 && x.y > .04 && x.y < .3 && (x.z *= 1.02);
  });
  r.computeVertexNormals();
  n.add(s, r, null, o);
  n.add(s, Mo([[-.172, 0], [.172, 0], [.172, .297], [.045, .364], [-.172, .364]], .007, {
    soft: 0
  }), null, typeof o == "number" ? .8 : o.map(x => x * .8));
  let l = .24;
  let c = .2;
  let u = -.025;
  let h = .165;
  let f = Math.hypot(l, c) - .02;
  let p = Math.atan2(c, l);
  for (let x of [1, -1]) {
    let y = x * .079;
    for (let b of [1, -1]) n.add(s, Ge(l, .016, .007, .003), {
      p: [u, h + b * c / 2, y]
    }, o);
    for (let b of [1, -1]) n.add(s, Ge(.016, c, .007, .003), {
      p: [u + b * l / 2, h, y]
    }, o);
    for (let b of [1, -1]) n.add(s, Ge(f, .018, .008, .003), {
      p: [u, h, y],
      r: [0, 0, b * p]
    }, o);
  }
  for (let x of [-.042, 0, .042]) n.add(s, tubeGeometry([[-.135, .35, x], [-.125, .42, x], [-.09, .44, x], [-.02, .44, x], [.01, .42, x], [.02, .35, x]], .0105, 5, false, .5), null, o);
  let d = [.1, .33, 0];
  let v = [.42, .9, 0];
  let g = x => [d[0] + v[0] * x, d[1] + v[1] * x, 0];
  n.add(s, vn(g(-.02), g(.07), .03, 8, true), null, o);
  n.add("steel_dark", vn(g(.07), g(.1), .036, 8, true), null, .9);
  n.add("steel_galv", Ge(.07, .008, .02, .002), {
    p: g(.108),
    r: [0, 0, -.44]
  }, .8);
  n.decal(i.mats.decal("hazard_flammable"), .055, {
    p: [.125, .25, .0795]
  });
  n.decal(i.mats.decal("hazard_flammable"), .055, {
    p: [-.125, .25, -.0795],
    r: [0, At, 0]
  });
  return n.finish();
}
function jA(i, e, t) {
  let n = new Kn(i, "traffic_cone", t);
  let s = n.rng;
  let o = t * 4.1;
  e.lying && (n.push({
    p: [-.34, .18, 0],
    r: [0, s() * 6, 0]
  }), n.push({
    r: [0, 0, -tt + .16]
  }));
  let r = h => .128 + (.031 - .128) * (h - .05) / (.685 - .05);
  n.add("rubber", Ge(.36, .03, .36, .008, "bottom"), null, .9);
  let a = (h, f, p) => {
    let d = gn(Math.atan2(p, h) * 3 + o, f * 14);
    return d > .68 ? .45 : .85 + .15 * d;
  };
  let l = (h, f, p = [], d = []) => us([...p, [r(h), h], [r(f), f], ...d], 16);
  let c = n.mat("plastic_red", {
    color: 12734234
  });
  let u = n.mat("plastic_grey", {
    color: 13224386
  });
  n.add(c, l(.05, .36, [[.165, .03], [.15, .04], [.136, .05]]), null, a);
  n.add(u, l(.36, .5), null, (h, f, p) => .85 * a(h, f, p));
  n.add(c, l(.5, .56), null, a);
  n.add(u, l(.56, .61), null, (h, f, p) => .85 * a(h, f, p));
  n.add(c, l(.61, .685, [], [[.028, .696], [.018, .7], [.018, .7], [0, .7]]), null, a);
  e.lying && (n.pop(), n.pop());
  return n.finish(e.lying ? {
    size: [.72, .36, .36]
  } : {});
}
function JA(i, e) {
  let t = new Kn(i, "gas_cylinders", e.seed || 0);
  let n = t.rng;
  let s = 12;
  let o = () => n.range(.6, .9);
  t.add("diamond_plate", Ge(.9, .016, .5, .004, "bottom"), null, .8);
  for (let u of [-.43, .43]) {
    t.add("steel_dark", Ge(.04, 1.14, .04, .005), {
      p: [u, .585, -.225]
    }, o());
    t.add("steel_dark", Ge(.036, .036, .43, .005), {
      p: [u, 1.06, -.01]
    }, o());
    t.add("steel_dark", Ge(.036, .036, .43, .005), {
      p: [u, .3, -.01]
    }, o());
    t.add("steel_dark", Ge(.036, .32, .036, .005), {
      p: [u, .16, .19]
    }, o());
    t.add("steel_galv", ja(.016, .004, 4, 8), {
      p: [u - Math.sign(u) * 0, 1.06, .215],
      r: [0, tt, 0]
    }, .8);
  }
  for (let u of [.45, 1.06]) t.add("steel_dark", Ge(.9, .04, .036, .005), {
    p: [0, u, -.225]
  }, o());
  t.add("paint_yellow", Ge(.3, .2, .004, .001), {
    p: [0, .76, -.245]
  }, .9);
  t.decal(i.mats.decal("hazard_flammable"), .15, {
    p: [0, .76, -.2475],
    r: [0, At, 0]
  });
  let r = [["paint_red", 1], ["paint_white", 1], ["paint_blue", 1], ["paint_yellow", 1], ["paint_grey", .5]];
  let a = [["paint_grey", .75], ["paint_grey", .55], ["paint_red", [.55, .4, .4]], ["paint_blue", .8]];
  for (let u = 0; u < 3; u++) {
    let h = (u - 1) * .272;
    let f = 1 - n.range(0, .05);
    let p = .115;
    let d = r[(t.seed + u * 2) % r.length];
    let v = a[(t.seed + u) % a.length];
    let g = u * 5.3 + t.seed;
    let x = n() * 6;
    t.push({
      p: [h, .016, .015 + n.range(-.01, .01)],
      r: [0, x, 0],
      s: [1, f, 1]
    });
    t.add(v[0], us([[0, .012], [.095, .012], [.095, .012], [.1, 0], [.111, 0], [p, .008], [p, .4], [p, .8], [p, 1.22]], s), null, (y, b, m) => {
      let A = gn(Math.atan2(m, y) * 3 + g, b * 5);
      let _ = A > .7 ? .55 : 1;
      let M = typeof v[1] == "number" ? [v[1], v[1], v[1]] : v[1];
      return [M[0] * _, M[1] * _ * (A > .7 ? .85 : 1), M[2] * _ * (A > .7 ? .7 : 1)];
    });
    t.add(d[0], us([[p, 1.22], [.111, 1.285], [.098, 1.34], [.075, 1.385], [.052, 1.41], [.04, 1.42]], s), null, d[1]);
    t.add("steel_dark", us([[.04, 1.42], [.057, 1.42], [.057, 1.42], [.057, 1.448], [.057, 1.448], [.05, 1.452], [.053, 1.53], [.046, 1.565], [.026, 1.585], [0, 1.588]], s), null, .8);
    for (let y of [0, At]) t.add("polymer_black", cylinderGeometry(.016, .016, .004, 6), {
      p: [Math.cos(y) * .052, 1.5, Math.sin(y) * .052],
      r: [0, -y, tt]
    }, .2);
    u !== 1 && t.cdecal(i.mats.decal(u ? "hazard_general" : "hazard_flammable"), p + .0015, .1, {
      p: [0, 1.08, 0],
      r: [0, n.range(-.5, .5) - x, 0]
    });
    t.cdecal(i.mats.label(["ACETYLENE", "OXYGEN", "ARGON", "PROPANE"][(t.seed + u) % 4], {
      color: "white",
      font: "stencil",
      distress: .4
    }), p + .0015, .2, {
      p: [0, .86, 0],
      r: [0, n.range(-.4, .4) - x, 0]
    });
    t.pop();
  }
  let l = 19;
  let c = u => {
    let h = .215;
    for (let f = -1; f <= 1; f++) {
      let p = u - f * .272;
      Math.abs(p) < .115 && (h = Math.max(h, .015 + Math.sqrt(.123 * .123 - p * p) + 0));
    }
    return Math.max(h, .1);
  };
  for (let u = 0; u < l; u++) {
    let h = u / (l - 1);
    let f = -.425 + .85 * h;
    let p = Math.max(c(f), c(f - .03), c(f + .03)) + .004;
    let d = 1.05 - .035 * Math.sin(At * (h * 3 % 1)) - .01;
    t.add("steel_galv", ja(.017, .0045, 3, 6), {
      p: [f, d, p],
      r: [u % 2 ? tt : .15, 0, 0],
      s: [1.35, 1, 1]
    }, n.range(.6, .95));
  }
  return t.finish();
}
function KA(i, e) {
  let t = new Kn(i, "pipe_stack", e.seed || 0);
  let n = t.rng;
  let s = .1365;
  let o = .012;
  let r = .08;
  let a = 14;
  let l = (h = 1) => {
    let f = n.range(.6, .95) * h;
    return [f, f * .95, f * .86];
  };
  for (let h of [-2.2, 0, 2.2]) {
    t.add("wood_dark", Ge(.11, r, 1.2, .008), {
      p: [h + n.range(-.1, .1), r / 2, 0],
      r: [0, n.range(-.03, .03), 0]
    }, l());
    for (let f of [1, -1]) t.add("wood_pallet", Mo(f > 0 ? [[0, 0], [.158, 0], [.158, .1]] : [[-.158, 0], [0, 0], [-.158, .1]], .1, {
      soft: 0
    }), {
      p: [h, r, f * .44],
      r: [0, -tt, 0]
    }, l(.9));
  }
  let c = [4, 3, 2];
  let u = 2 * s * Math.sin(At / 3);
  c.forEach((h, f) => {
    for (let p = 0; p < h; p++) {
      let d = (p - (h - 1) / 2) * 2 * s;
      let v = r + s + f * u;
      let g = n.range(5.78, 5.92);
      let x = n.range(-3, 3 - g) * .999 + 0;
      let y = Math.max(-3, Math.min(3 - g, x)) + g / 2;
      let b = n() < .7 ? "steel_rust" : "steel_dark";
      let m = n() * 50;
      let A = n.range(.75, 1);
      let _ = new THREE.CylinderGeometry(s, s, g, a, 4, true);
      {
        let w = _.attributes.uv;
        let S = _.attributes.position;
        for (let z = 0; z < w.count; z++) w.setXY(z, w.getX(z) * 2 * At * s, S.getY(z));
      }
      let M = {
        p: [y, v, d],
        r: [n() * 6, 0, tt]
      };
      t.add(b, _, M, (w, S, z) => A * (.75 + .35 * gn(w * 1.3 + m, z * 9, S * 9)));
      let E = M1(cylinderGeometry(s - o, s - o, g - .002, a, true));
      t.add("steel_rust", E, M, w => .16 + .5 * j3(g / 2 + Math.abs(y) - .9, g / 2 + Math.abs(y) + .2, Math.abs(w - y) + Math.abs(y)));
      for (let w of [1, -1]) t.add(b, us(w > 0 ? [[s, 0], [s - o, 0]] : [[s - o, 0], [s, 0]], a), {
        p: [y + w * g / 2, v, d],
        r: [0, 0, -tt]
      }, A * 1.1);
    }
  });
  for (let h of [-1.35, 1.5]) {
    let p = 2 * s;
    let d = r + s + 2 * u + s + .004;
    let v = [];
    let g = [[-(1.5 * p + s + .004), r + s], [-(.5 * p + s * .5 + .004), r + s + 2 * u + s * .87], [-.5 * p, d], [.5 * p, d], [.5 * p + s * .5 + .004, r + s + 2 * u + s * .87], [1.5 * p + s + .004, r + s], [1.5 * p, r - .004], [-1.5 * p, r - .004], [-(1.5 * p + s + .004), r + s]];
    for (let x of g) v.push([h, x[1], x[0]]);
    t.add("steel_dark", vr(v, [.016, 0, 0]), null, .7);
    t.add("steel_galv", Ge(.04, .012, .05, .003), {
      p: [h, d + .005, .03]
    }, .8);
  }
  t.cdecal(i.mats.label("API 5L X52  273.1 x 12.5  HEAT 40719", {
    color: "white",
    font: "stencil",
    distress: .5
  }), s + .002, .2, {
    p: [.9, r + s + 2 * u, s],
    r: [-tt + .9, 0, tt]
  }, 1.6);
  return t.finish();
}
function J3(i) {
  i("barrel", (e, t = {}) => {
    let n = Math.abs(t.seed | 0) % 4;
    return wf(`barrel|${t.color}|${!!t.lying}|${!!t.open}|${n}`, () => HA(e, t, n));
  });
  i("pallet", (e, t = {}) => {
    let n = Math.abs(t.seed | 0) % 4;
    return wf(`pallet|${!!t.broken}|${n}`, () => VA(e, t, n));
  });
  i("pallet_stack", (e, t = {}) => WA(e, t));
  i("crate_wood", (e, t = {}) => GA(e, t));
  i("crate_stack", (e, t = {}) => qA(e, t));
  i("ibc_tote", (e, t = {}) => XA(e, t));
  i("cable_reel", (e, t = {}) => YA(e, t));
  i("tire_stack", (e, t = {}) => $A(e, t));
  i("jerry_can", (e, t = {}) => {
    let n = Math.abs(t.seed | 0) % 2;
    return wf(`jerry|${t.color}|${n}`, () => ZA(e, t, n));
  });
  i("traffic_cone", (e, t = {}) => {
    let n = Math.abs(t.seed | 0) % 3;
    return wf(`cone|${!!t.lying}|${n}`, () => jA(e, t, n));
  });
  i("gas_cylinders", (e, t = {}) => JA(e, t));
  i("pipe_stack", (e, t = {}) => KA(e, t));
}
export { J3, S1, tv };
