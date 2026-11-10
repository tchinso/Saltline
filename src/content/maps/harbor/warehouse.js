import { ExtrudeGeometry, Group, Mesh, Path, PointLight, Shape, TorusGeometry, Vector3 } from '../../../../vendor/three.js';
import { boxGeometry, cylinderGeometry } from '../../../geometry/primitives.js';
var WAREHOUSE = {
  X0: -16,
  X1: 12,
  Z0: -28,
  Z1: -11,
  EAVE: 7,
  RIDGE: 9.5,
  ZR: -19.5,
  FLOOR: .03
};
var No = [-16, -11.1, -6.2, -.8, 5.6, 12];
var yt = {
  x0: -6,
  x1: -1,
  h: 5
};
var Yt = {
  z0: -22,
  z1: -17,
  h: 4.5
};
var iv = [["S", 1, 4], ["S", 2, 5], ["S", 1, 11], ["S", 2, 15], ["S", 3, 8], ["N", 2, 7], ["N", 1, 13], ["N", 3, 17]];
var A1 = [-.04, .25, .5, .75, 1];
var sv = 20;
function buildWarehouse(i) {
  let {
    M: e,
    MI: t,
    box: n,
    slab: s,
    cyl: o,
    rod: r,
    ibeam: a,
    col: l,
    add: c,
    G: u
  } = i;
  let {
    X0: h,
    X1: f,
    Z0: p,
    Z1: d,
    EAVE: v,
    RIDGE: g,
    ZR: x,
    FLOOR: y
  } = WAREHOUSE;
  let b = (d - p) / 2;
  let m = g - v;
  let A = Math.atan2(m, b);
  let _ = Math.hypot(b, m);
  let M = L => v + m * (1 - Math.abs(L - x) / b);
  let E = e("corrugated_roof");
  let w = t("corrugated_roof");
  let S = e("concrete");
  let z = t("concrete_painted");
  let H = t("paint_grey");
  let O = t("steel_galv");
  let q = e("steel_galv");
  let U = t("steel_dark");
  let T = .25;
  s(t("floor_epoxy"), h, -.25, p, f, y, d, {
    cast: false
  });
  l(h, -.5, p, f, y, d, "concrete");
  s(S, yt.x0 - .4, -.2, d, yt.x1 + .4, .02, d + 1.4, {
    cast: false
  });
  s(S, f, -.2, Yt.z0 - .4, f + 1.4, .02, Yt.z1 + .4, {
    cast: false
  });
  function D(L, Z, J, oe, fe, le) {
    if (oe - J < .02 || le - fe < .02) return;
    let R = L;
    let I = L - Z * T;
    if (fe < 1.2) {
      let ae = L - Z * T * .5;
      s(S, J, y - .2, Math.min(R, ae), oe, Math.min(1.2, le), Math.max(R, ae), {
        bevel: .015
      });
      s(z, J, y - .2, Math.min(ae, I), oe, Math.min(1.2, le), Math.max(ae, I), {
        bevel: .015
      });
    }
    let se = Math.max(fe, 1.2);
    le <= se || (s(E, J, se - .03, Math.min(R + Z * .02, R + Z * .06), oe, le, Math.max(R + Z * .02, R + Z * .06)), s(w, J, se, Math.min(R - Z * .1, R - Z * .13), oe, le, Math.max(R - Z * .1, R - Z * .13)));
  }
  function C(L, Z, J, oe, fe, le) {
    if (oe - J < .02 || le - fe < .02) return;
    let R = L;
    let I = L - Z * T;
    if (fe < 1.2) {
      let ae = L - Z * T * .5;
      s(S, Math.min(R, ae), y - .2, J, Math.max(R, ae), Math.min(1.2, le), oe, {
        bevel: .015
      });
      s(z, Math.min(ae, I), y - .2, J, Math.max(ae, I), Math.min(1.2, le), oe, {
        bevel: .015
      });
    }
    let se = Math.max(fe, 1.2);
    le <= se || (s(E, Math.min(R + Z * .02, R + Z * .06), se - .03, J, Math.max(R + Z * .02, R + Z * .06), le, oe), s(w, Math.min(R - Z * .1, R - Z * .13), se, J, Math.max(R - Z * .1, R - Z * .13), le, oe));
  }
  function G(L, Z, J, oe, fe, le, R = .25, I = .45, se = .26) {
    let ae = Math.max(1, Math.floor((le - fe - .1) / I));
    for (let k = 0; k <= ae; k++) {
      let ce = fe + .08 + (le - fe - .16) * k / ae;
      n(q, oe - J, .018, se, (J + oe) / 2, ce, L - Z * .06, {
        r: [Z * R, 0, 0]
      });
    }
    for (let k of [J + .03, oe - .03, (J + oe) / 2]) s(q, k - .03, fe, L - Z * .2, k + .03, le, L + Z * .06);
    s(q, J, fe - .05, L - Z * .2, oe, fe, L + Z * .07);
    s(q, J, le, L - Z * .2, oe, le + .05, L + Z * .07);
  }
  function j(L, Z, J, oe, fe, le, R = .5, I = .45, se = .26) {
    let ae = Math.max(1, Math.floor((le - fe - .1) / I));
    for (let k = 0; k <= ae; k++) {
      let ce = fe + .08 + (le - fe - .16) * k / ae;
      n(q, se, .018, oe - J, L - Z * .06, ce, (J + oe) / 2, {
        r: [0, 0, -Z * R]
      });
    }
    for (let k of [J + .03, oe - .03, (J + oe) / 2]) s(q, L - Z * .2, fe, k - .03, L + Z * .06, le, k + .03);
    s(q, L - Z * .2, fe - .05, J, L + Z * .07, fe, oe);
    s(q, L - Z * .2, le, J, L + Z * .07, le + .05, oe);
  }
  let N = 5.45;
  let Q = 6.8;
  for (let L = 0; L < No.length - 1; L++) {
    let Z = No[L];
    let J = No[L + 1];
    L === 2 ? (D(d, 1, Z, yt.x0, 0, v), D(d, 1, yt.x1, J, 0, v), D(d, 1, yt.x0, yt.x1, yt.h, v)) : (D(d, 1, Z, J, 0, N - .05), D(d, 1, Z, J, Q + .05, v), G(d, 1, Z + .15, J - .15, N, Q));
  }
  D(p, -1, h, f, 0, v);
  s(t("paint_grey"), 6.2, y, p + T, 7.2, 2.1, p + T + .04);
  s(e("paint_grey"), 6.2, 0, p - .09, 7.2, 2.1, p - .05);
  C(h, -1, p, d, 0, v);
  C(f, 1, p, Yt.z0, 0, N - .05);
  let K = {
    z0: -15.55,
    z1: -13.35,
    y0: 3.3
  };
  C(f, 1, Yt.z1, K.z0, 0, N - .05);
  C(f, 1, K.z1, d, 0, N - .05);
  C(f, 1, K.z0, K.z1, 0, K.y0);
  n(E, .03, 1.5, 1.05, f + .2, K.y0 - .55, K.z0 + .5, {
    r: [.25, .1, -.22]
  });
  n(E, 1, .03, 2, f + 1.3, .05, K.z0 + 1.6, {
    r: [.02, .5, .03]
  });
  for (let L of [K.z0, K.z1]) s(O, f - .16, K.y0, L - .03, f - .1, N - .05, L + .03);
  C(f, 1, Yt.z0, Yt.z1, Yt.h, N - .05);
  C(f, 1, p, d, Q + .05, v);
  for (let [L, Z] of [[p + .3, -22.45], [-22.15, -16.85], [-16.55, d - .3]]) j(f, 1, L, Z, N, Q);
  let ie = {
    y: 8.02,
    r: .56
  };
  function F(L, Z, J) {
    let oe = (fe, le, R) => {
      let I = new Shape();
      if (I.moveTo(-(d + .05), v - .02), I.lineTo(-x, g), I.lineTo(-(p - .05), v - .02), I.closePath(), J) {
        let ae = new Path();
        ae.absarc(-x, ie.y, ie.r, 0, Math.PI * 2, true);
        I.holes.push(ae);
      }
      let se = new ExtrudeGeometry(I, {
        depth: fe,
        bevelEnabled: false,
        curveSegments: 20
      });
      se.rotateY(Math.PI / 2);
      se.translate(L + R, 0, 0);
      c(se, le);
    };
    oe(.04, E, Z > 0 ? .02 : -.06);
    oe(.03, w, Z > 0 ? -.13 : .1);
  }
  F(f, 1, true);
  F(h, -1, false);
  l(h, 0, d - T, yt.x0, v, d + .06, "metal");
  l(yt.x1, 0, d - T, f, v, d + .06, "metal");
  l(yt.x0, yt.h - .5, d - .6, yt.x1, v, d + .06, "metal");
  l(h, 0, p - .06, f, v, p + T, "metal");
  l(h - .06, 0, p, h + T, g, d, "metal");
  l(f - T, 0, p, f + .06, g, Yt.z0, "metal");
  l(f - T, 0, Yt.z1, f + .06, g, -15.55, "metal");
  l(f - T, 0, -13.35, f + .06, g, d, "metal");
  l(f - T, 0, -15.55, f + .06, 3.3, -13.35, "metal");
  l(f - T, 5.4, -15.55, f + .06, g, -13.35, "metal");
  l(f - T, Yt.h, Yt.z0, f + .06, g, Yt.z1, "metal");
  let X = [];
  let ne = (f - h + .6) / sv;
  let re = h - .3;
  for (let L of ["S", "N"]) {
    let Z = L === "S" ? 1 : -1;
    let J = [Z * A, 0, 0];
    let oe = Math.cos(A);
    let fe = Z * Math.sin(A);
    for (let R = 0; R < 4; R++) {
      let I = A1[R];
      let se = A1[R + 1];
      let ae = (I + se) / 2;
      let k = (se - I) * _;
      let ce = x + Z * b * (1 - ae);
      let ve = v + m * ae;
      let _e = 0;
      for (; _e < sv;) {
        if (iv.some(Ne => Ne[0] === L && Ne[1] === R && Ne[2] === _e)) {
          _e++;
          continue;
        }
        let Te = _e;
        for (; Te + 1 < sv && !iv.some(Ne => Ne[0] === L && Ne[1] === R && Ne[2] === Te + 1);) Te++;
        let Pe = re + _e * ne;
        let Re = re + (Te + 1) * ne;
        let Fe = (Pe + Re) / 2;
        n(E, Re - Pe, .04, k + .02, Fe, ve + oe * .03, ce + fe * .03, {
          r: J
        });
        n(w, Re - Pe, .02, k + .02, Fe, ve - oe * .02, ce - fe * .02, {
          r: J
        });
        let ze = x + Z * b * (1 - I);
        let We = x + Z * b * (1 - se);
        l(Math.max(Pe, h - .3), v + m * Math.max(0, I) - .05, Math.min(ze, We), Re, v + m * se + .08, Math.max(ze, We), "metal", {
          noNav: true
        });
        _e = Te + 1;
      }
    }
    for (let R of iv) if (R[0] === L) {
      let I = A1[R[1]];
      let se = A1[R[1] + 1];
      let ae = re + R[2] * ne;
      let k = (I + se) / 2;
      let ce = x + Z * b * (1 - k);
      let ve = v + m * k;
      X.push({
        x: ae + ne / 2,
        y: ve,
        z: ce,
        w: ne,
        d: (se - I) * b
      });
      i.decal("leak_stain", 1.9, ae + ne / 2 + .2, y + .004, ce, "y+", R[2] * 1.7);
      n(O, .05, .05, (se - I) * _, ae + .02, ve - oe * .06, ce - fe * .06, {
        r: J
      });
      n(O, .05, .05, (se - I) * _, ae + ne - .02, ve - oe * .06, ce - fe * .06, {
        r: J
      });
    }
    for (let R of [.03, .2, .37, .54, .71, .88, .985]) {
      let I = x + Z * b * (1 - R);
      let se = v + m * R;
      n(O, f - h - .3, .17, .06, (h + f) / 2, se - oe * .13, I - fe * .13, {
        r: J
      });
    }
    let le = x + Z * (b + .38);
    s(q, h - .3, v - .22, Math.min(le, le + Z * .16), f + .3, v - .08, Math.max(le, le + Z * .16));
    s(q, h - .3, v - .22, Math.min(le - Z * .05, le + Z * .21), f + .3, v - .19, Math.max(le - Z * .05, le + Z * .21));
    for (let R = 0; R < No.length; R++) {
      if (L === "S" && (R === 2 || R === 3)) continue;
      let I = Math.min(f - .5, Math.max(h + .5, No[R])) + .42;
      let se = x + Z * (b + .13);
      o(q, .055, v - .4, I, (v - .4) / 2 + .2, se, {
        seg: 8
      });
      r(q, [I, v - .2, se], [I, v - .12, le + Z * .08], .05);
      for (let ae of [1.6, 3.6, 5.6]) n(q, .16, .04, .14, I, ae, se - Z * .02);
      r(q, [I, .2, se], [I + .02, .06, se + Z * .22], .055);
    }
  }
  for (let L of [-1, 1]) n(q, f - h + .7, .03, .34, (h + f) / 2, g + .03, x + L * .15, {
    r: [L * A, 0, 0]
  });
  for (let L of [h - .31, f + .31]) for (let Z of [-1, 1]) n(q, .04, .22, _ + .4, L, (v + g) / 2 - .05, x + Z * (b / 2 + .1), {
    r: [Z * A, 0, 0]
  });
  let $ = [d - T - .24, p + T + .24];
  for (let L = 0; L < No.length; L++) {
    let Z = L === 0 ? h + T + .12 : L === No.length - 1 ? f - T - .12 : No[L];
    for (let J of $) {
      a(H, "y", v - .35, Z, y + (v - .35) / 2, J, {
        depth: .46,
        width: .22,
        depthAxis: "z"
      });
      n(U, .36, .03, .62, Z, y + .015, J);
      l(Z - .12, 0, J - .24, Z + .12, v, J + .24, "metal");
    }
    for (let J of [1, -1]) {
      let oe = x + J * b / 2 - J * .14;
      let fe = v + m / 2 - .42;
      a(H, "z", _ - .5, Z, fe, oe, {
        depth: .4,
        width: .2,
        depthAxis: "y",
        r: [J * A, 0, 0]
      });
      n(H, .014, .5, 1.5, Z, v - .55, x + J * (b - T - .9), {
        r: [J * (A + .22), 0, 0]
      });
      n(H, .2, .02, 1.55, Z, v - .82, x + J * (b - T - .95), {
        r: [J * (A + .42), 0, 0]
      });
    }
    n(H, .22, .5, .03, Z, g - .55, x);
  }
  for (let L of [h + T + .12, f - T - .12]) for (let Z of [-22.3, -16.7]) {
    let J = M(Z) - .55;
    a(H, "y", J, L, y + J / 2, Z, {
      depth: .3,
      width: .18,
      depthAxis: "x"
    });
    l(L - .16, 0, Z - .1, L + .16, J, Z + .1, "metal");
  }
  for (let L of $) {
    let Z = L > x ? 1 : -1;
    for (let J of [2.3, 3.7, 5.15]) Z > 0 ? (s(O, h + .3, J - .08, d - .2, yt.x0 - .2, J + .08, d - .14), s(O, yt.x1 + .2, J - .08, d - .2, f - .3, J + .08, d - .14)) : s(O, h + .3, J - .08, p + .14, f - .3, J + .08, p + .2);
    n(H, f - h - .6, .14, .14, (h + f) / 2, v - .25, L);
  }
  for (let L of [h + .17, f - .17]) for (let Z of [2.3, 3.7, 5.15]) L > 0 ? (s(O, L - .03, Z - .08, p + .3, L + .03, Z + .08, Yt.z0 - .2), s(O, L - .03, Z - .08, Yt.z1 + .2, L + .03, Z + .08, d - .3)) : s(O, L - .03, Z - .08, p + .3, L + .03, Z + .08, d - .3);
  for (let [L, Z] of [[No[0] + .4, No[1]], [No[4], No[5] - .4]]) {
    for (let J of $) {
      r(O, [L, 1.35, J], [Z, 5.3, J], .016);
      r(O, [Z, 1.35, J + .04], [L, 5.3, J + .04], .016);
    }
    for (let J of [1, -1]) {
      let oe = x + J * (b - .6);
      let fe = -.3;
      r(O, [L, v + fe + .1, oe], [Z, g + fe - .1, x + J * .3], .014);
      r(O, [Z, v + fe + .1, oe], [L, g + fe - .1, x + J * .3], .014);
    }
  }
  {
    let L = d - T;
    for (let Z of [yt.x0 - .07, yt.x1 + .07]) {
      s(U, Z - .07, y, L - .16, Z + .07, yt.h + .75, d + .07);
      s(e("hazard_stripes"), Z - .11, y, L - .2, Z + .11, 1.3, d + .1, {
        bevel: .01
      });
    }
    s(U, yt.x0 - .2, yt.h, L - .1, yt.x1 + .2, yt.h + .14, d + .08);
    s(O, yt.x0 - .25, yt.h + .78, L - .72, yt.x1 + .25, yt.h + .81, L);
    s(O, yt.x0 - .25, yt.h + .3, L - .72, yt.x1 + .25, yt.h + .81, L - .69);
    for (let Z of [yt.x0 - .24, yt.x1 + .24]) s(O, Z - .012, yt.h + .05, L - .72, Z + .012, yt.h + .81, L);
    o(w, .3, yt.x1 - yt.x0 + .3, (yt.x0 + yt.x1) / 2, yt.h + .44, L - .36, {
      axis: "x",
      seg: 18
    });
    o(U, .05, yt.x1 - yt.x0 + .46, (yt.x0 + yt.x1) / 2, yt.h + .44, L - .36, {
      axis: "x",
      seg: 8
    });
    s(w, yt.x0 + .02, yt.h - .42, L - .09, yt.x1 - .02, yt.h + .42, L - .06);
    s(e("hazard_stripes"), yt.x0 + .02, yt.h - .52, L - .12, yt.x1 - .02, yt.h - .42, L - .03);
    s(U, yt.x1 + .28, yt.h + .2, L - .6, yt.x1 + .7, yt.h + .7, L - .15, {
      bevel: .02
    });
    r(U, [yt.x1 + .5, yt.h + .2, L - .3], [yt.x1 + .5, 1.2, L - .3], .008);
    for (let Z of [yt.x0 - .45, yt.x1 + .45]) i.place("bollard_post", Z, d + .55, 0, {
      seed: 5
    });
  }
  {
    let L = f + .12;
    let Z = Yt.z0 - .25;
    let J = Z - 5.1;
    s(E, L, .12, J, L + .05, Yt.h + .1, Z);
    for (let oe of [J, Z, (J + Z) / 2]) s(q, L - .02, .1, oe - .05, L + .09, Yt.h + .12, oe + .05);
    for (let oe of [.14, Yt.h + .08, Yt.h * .5]) s(q, L - .02, oe - .05, J, L + .09, oe + .05, Z);
    r(q, [L + .02, .2, J + .1], [L + .02, Yt.h, (J + Z) / 2], .02);
    r(q, [L + .02, .2, Z - .1], [L + .02, Yt.h, (J + Z) / 2], .02);
    s(U, L - .04, Yt.h + .16, J - .2, L + .12, Yt.h + .3, Yt.z1 + .3);
    s(U, f - T - .02, y, Yt.z0 - .12, f + .08, Yt.h + .1, Yt.z0);
    s(U, f - T - .02, y, Yt.z1, f + .08, Yt.h + .1, Yt.z1 + .12);
    s(U, f - T - .02, Yt.h, Yt.z0 - .12, f + .08, Yt.h + .12, Yt.z1 + .12);
    for (let oe of [Yt.z0 - .06, Yt.z1 + .06]) s(e("hazard_stripes"), f - T - .05, y, oe - .1, f + .1, 1.3, oe + .1, {
      bevel: .01
    });
    l(L - .05, 0, J, L + .12, Yt.h + .3, Z, "metal");
    i.place("bollard_post", f + .6, Yt.z0 - .4, 0, {
      seed: 6
    });
  }
  let ue = new Group();
  ue.position.set(f - .05, ie.y, x);
  ue.userData.noMerge = true;
  {
    let L = new TorusGeometry(ie.r + .02, .05, 8, 28);
    L.rotateY(Math.PI / 2);
    c(L, q, {
      p: [f + .04, ie.y, x]
    });
    let Z = new TorusGeometry(ie.r + .02, .035, 6, 28);
    Z.rotateY(Math.PI / 2);
    c(Z, O, {
      p: [f - .16, ie.y, x]
    });
    for (let fe of [.4, .4 + Math.PI / 2]) r(q, [f + .1, ie.y - Math.sin(fe) * ie.r, x - Math.cos(fe) * ie.r], [f + .1, ie.y + Math.sin(fe) * ie.r, x + Math.cos(fe) * ie.r], .012);
    for (let fe of [0, Math.PI * 2 / 3, Math.PI * 4 / 3]) r(O, [f - .18, ie.y + Math.sin(fe) * ie.r, x + Math.cos(fe) * ie.r], [f - .18, ie.y, x], .014);
    o(U, .13, .26, f - .22, ie.y, x, {
      axis: "x",
      seg: 12
    });
    let J = t("steel_worn");
    for (let fe = 0; fe < 5; fe++) {
      let le = boxGeometry(.012, .42, .2);
      le.rotateY(.5);
      le.translate(0, .3, 0);
      le.rotateX(fe / 5 * Math.PI * 2);
      let R = new Mesh(le, J);
      R.castShadow = true;
      R.receiveShadow = true;
      ue.add(R);
    }
    let oe = new Mesh(cylinderGeometry(.1, .1, .1, 12).rotateZ(Math.PI / 2), U);
    oe.castShadow = true;
    ue.add(oe);
    i.dynRoot.add(ue);
  }
  let me = u.mats.emissive(16757864, 7);
  let ee = t("aluminium");
  let B = [];
  for (let L of [-15.4, -23.6]) for (let Z of [-13.6, -8.5, -3.5, 2.6, 8.6]) L < -20 && Z < -10 || B.push([Z, L]);
  for (let [L, Z] of B) {
    let J = M(Z) - .3;
    let oe = 6.05;
    r(U, [L, J, Z], [L, oe + .3, Z], .012, {
      cast: false
    });
    o(ee, .33, .3, L, oe + .15, Z, {
      rTop: .09,
      seg: 14
    });
    o(U, .09, .14, L, oe + .37, Z, {
      seg: 10
    });
    o(me, .24, .02, L, oe + .02, Z, {
      seg: 14,
      cast: false,
      recv: false
    });
  }
  let P = [];
  for (let [L, Z] of [[-8.5, -15.4], [2.6, -15.4], [-3.5, -23.6], [8.6, -23.6]]) {
    let J = new PointLight(16761994, 34, 13, 2);
    J.position.set(L, 5.75, Z);
    J.castShadow = false;
    i.dynRoot.add(J);
    P.push(J);
  }
  {
    let Z = h + T + .02;
    let J = -10.25;
    let oe = p + T + .02;
    let fe = -23.75;
    s(t("diamond_plate"), Z, 2.6 - .1, oe, J, 2.6, fe);
    for (let Te of [Z + .1, -13, J - .08]) s(H, Te - .07, 2.6 - .3, oe, Te + .07, 2.6 - .1, fe);
    for (let [Te, Pe] of [[J - .08, fe - .08], [J - .08, oe + .3], [-13, fe - .08]]) {
      n(H, .14, 2.6 - .1, .14, Te, (2.6 - .1) / 2, Pe, {
        bevel: .01
      });
      l(Te - .08, 0, Pe - .08, Te + .08, 2.6, Pe + .08, "metal", {
        noNav: true
      });
    }
    let le = t("paint_white");
    let R = e("glass_dirty");
    let I = Z + .05;
    let se = J - .05;
    let ae = oe + .05;
    let k = fe - .05;
    let ce = 5;
    let ve = (Te, Pe, Re, Fe = .07) => {
      s(Re, I, Te, k - Fe, se, Pe, k);
      s(Re, se - Fe, Te, ae, se, Pe, k - Fe);
    };
    ve(2.6, 3.5, le);
    ve(4.45, ce, le);
    ve(3.5, 4.45, R, .02);
    for (let Te of [I + .04, -14.2, -12.9, -11.75, se - .04]) s(le, Te - .04, 3.5, k - .07, Te + .04, 4.45, k);
    for (let Te of [ae + .04, -26.3, -25, k - .04]) s(le, se - .07, 3.5, Te - .04, se, 4.45, Te + .04);
    s(t("paint_grey"), -11.65, 2.6, k - .01, -10.75, 4.6, k + .03);
    s(le, I, ce, ae, se + .1, ce + .08, k + .1);
    s(t("wood_dark"), I + .2, 3.3, ae + .3, se - .3, 3.36, ae + 1);
    s(U, -13.4, 3.36, ae + .5, -12.7, 3.8, ae + .56);
    n(u.mats.emissive(13624063, 2.4), 1.2, .04, .14, -13, ce - .05, -25.8, {
      cast: false,
      recv: false
    });
    n(u.mats.emissive(10473727, 1.6), .6, .36, .01, -13.05, 3.6, ae + .59, {
      cast: false,
      recv: false
    });
    l(I, 2.6 - .12, ae, se, ce + .08, k, "metal", {
      noNav: true
    });
    l(Z, 2.6 - .12, oe, J, 2.6, fe, "metal", {
      noNav: true
    });
    let _e = fe + .6;
    i.catwalk(-14.25, _e, 0, 2.6 - .05, {
      seed: 2
    }, [false, true]);
    i.catwalk(-11.25, _e, 0, 2.6 - .05, {
      seed: 3
    }, [false, true]);
    for (let Te of [-15.6, -12.75, -9.85]) n(H, .1, 2.6 - .12, .1, Te, (2.6 - .12) / 2, _e + .5, {
      bevel: .01
    });
    s(H, -15.75, 2.6 - .26, _e + .44, -9.75, 2.6 - .12, _e + .56);
    i.stairs(-8.25, _e, Math.PI, 0, {
      seed: 4
    });
    i.metalRects.push([Z, oe, -6.7, _e + .6]);
  }
  {
    let J = d - T - .05;
    let oe = J - .75;
    s(t("wood_dark"), 1.6, .88, oe, 5, .94, J, {
      bevel: .012
    });
    for (let fe of [1.6 + .06, 5 - .06, (1.6 + 5) / 2]) for (let le of [oe + .06, J - .06]) n(U, .05, .86, .05, fe, y + .43, le);
    s(U, 1.6 + .04, .2, oe + .06, 5 - .04, .23, J - .04);
    s(t("paint_grey"), 1.6 + .1, .55, oe + .04, 1.6 + 1.3, .86, J - .05, {
      bevel: .01
    });
    s(t("wood_pallet"), 1.6, 1.25, J - .02, 5, 2.3, J + .01);
    for (let fe = 0; fe < 7; fe++) r(O, [1.6 + .3 + fe * .42, 1.5 + fe % 3 * .12, J - .04], [1.6 + .3 + fe * .42, 2.05 + fe % 2 * .1, J - .04], .012 + fe % 2 * .006, {
      cast: false
    });
    n(U, .16, .14, .3, 5 - .5, 1.01, oe + .2, {
      bevel: .015
    });
    n(O, .03, .03, .34, 5 - .5, 1.1, oe + .12);
    n(t("paint_red"), .45, .22, .24, 1.6 + 1.9, 1.05, oe + .35, {
      bevel: .02,
      r: [0, .3, 0]
    });
    s(U, 1.6, 2.5, J - .3, 5, 2.53, J);
    n(u.mats.emissive(16773328, 3), 5 - 1.6 - .4, .03, .1, (1.6 + 5) / 2, 2.48, J - .18, {
      cast: false,
      recv: false
    });
    l(1.6, 0, oe, 5, .94, J, "wood");
  }
  {
    for (let fe of [-1, 1]) {
      let le = -11.6 + fe * 2.6 / 2;
      r(t("paint_yellow"), [le, y, -17.6 - .9], [le, 3.3, -17.6], .045);
      r(t("paint_yellow"), [le, y, -17.6 + .9], [le, 3.3, -17.6], .045);
      r(t("paint_yellow"), [le, 1, -17.6 - .62], [le, 1, -17.6 + .62], .03);
      for (let R of [-17.6 - .9, -17.6 + .9]) o(U, .07, .1, le, y + .05, R, {
        axis: "x",
        seg: 8
      });
    }
    a(t("paint_yellow"), "x", 2.6 + .5, -11.6, 3.3 + .1, -17.6, {
      depth: .22,
      width: .14
    });
    n(U, .3, .26, .24, -11.6 + .2, 3.3 - .14, -17.6, {
      bevel: .02
    });
    r(O, [-11.6 + .2, 3.3 - .26, -17.6], [-11.6 + .2, 1.75, -17.6], .012);
    r(O, [-11.6 + .32, 3.3 - .26, -17.6], [-11.6 + .34, 2.2, -17.6 + .02], .008);
    n(U, .85, .5, .55, -11.6 + .2, 1.42, -17.6, {
      bevel: .03,
      r: [0, .2, .05]
    });
    n(t("steel_worn"), .7, .16, .42, -11.6 + .2, 1.74, -17.6, {
      bevel: .02,
      r: [0, .2, .05]
    });
    o(t("steel_bare"), .16, .12, -11.6 - .28, 1.4, -17.6 - .08, {
      axis: "x",
      seg: 12
    });
    l(-11.6 - 2.6 / 2 - .1, 0, -17.6 - .35, -11.6 + 2.6 / 2 + .1, 1.9, -17.6 + .35, "metal");
  }
  let V = Math.PI / 2;
  let Y = (L, Z, J, oe, fe, le = y, R) => i.place(L, Z, J, oe, fe, le, R);
  for (let L of [-8.4, -5.6, -2.8, 2.8, 5.6, 8.4]) Y("shelf_rack", L, p + T + .62, 0, {
    seed: Math.round(L * 7 + 90)
  });
  for (let L of [2.8, 5.6, 8.4]) Y("shelf_rack", L, -23.45, 0, {
    seed: Math.round(L * 5 + 40)
  });
  Y("pallet_stack", 0, -26.9, .1, {
    seed: 3
  });
  Y("cardboard_boxes", -.05, -26.9, .5, {
    seed: 4
  }, y + 1.15, {
    noCol: true
  });
  Y("crate_stack", 2.9, -15.9, .12, {
    seed: 11
  });
  Y("crate_wood", 4.15, -16.3, -.25, {
    seed: 12
  });
  Y("pallet_stack", 2, -17.3, 1.45, {
    seed: 13
  });
  Y("ibc_tote", 6.9, -19.6, .1, {
    seed: 14
  });
  Y("barrel", 7.9, -18.5, 0, {
    seed: 15,
    color: "blue"
  });
  Y("barrel", 6, -18.4, .6, {
    seed: 16,
    color: "red"
  });
  Y("ibc_tote", -7.6, -16.4, -.08, {
    seed: 17
  });
  Y("barrel", -8.6, -15.3, 0, {
    seed: 18
  });
  Y("barrel", -7.9, -15, .9, {
    seed: 19,
    color: "yellow"
  });
  Y("sandbags", 10.2, -16.4, V + .05, {
    seed: 20
  });
  Y("forklift", 8.3, -13.9, 2.75, {
    seed: 21
  });
  Y("toolbox_cart", 6, -12.2, .15, {
    seed: 22
  });
  Y("gas_cylinders", 10.9, -11.9, 0, {
    seed: 23
  });
  Y("tarp_cargo", -13.2, -13.2, .12, {
    seed: 24
  });
  Y("tire_stack", -15, -15.6, 0, {
    seed: 25
  });
  Y("tire_stack", -14.9, -16.6, .4, {
    seed: 26
  });
  Y("cardboard_boxes", -14.6, -26.6, .2, {
    seed: 27
  });
  Y("crate_wood", -12.4, -26.9, -.1, {
    seed: 28
  });
  Y("barrel", -10.9, -27, 0, {
    seed: 29,
    color: "green"
  });
  Y("crate_wood", -14.7, -24.6, .3, {
    seed: 30
  });
  Y("jerry_can", -9.3, -12, .4, {
    seed: 31
  });
  Y("jerry_can", -9.7, -12.1, 1.2, {
    seed: 32
  });
  Y("pallet", 10.6, -13.6, .2, {
    seed: 33
  });
  Y("cardboard_boxes", 10.6, -13.6, .3, {
    seed: 34
  }, .17);
  Y("traffic_cone", -6.6, -12.2, 0, {
    seed: 35
  });
  Y("traffic_cone", -.4, -12.3, 0, {
    seed: 36
  });
  i.tube(t("rubber"), [[1.7, .9, -11.9], [1.4, .4, -12.3], [1.2, .06, -13.2], [2.4, .055, -14], [1, .055, -14.9], [-.8, .055, -14.4], [-1.6, .055, -15.6]], .018, {
    cast: false
  });
  s(U, 7.2, y, -14.6, 8.4, y + .04, -13.6);
  i.decal("oil_stain", 2.2, 7.6, y + .004, -15.2, "y+", .6);
  i.decal("oil_stain", 1.6, -3.8, y + .004, -13.6, "y+", 2.1);
  i.decal("hazard_voltage", .5, -1.25, 1.9, d - T - .142, "z-");
  i.decal("caution_stripes", 2.4, -3.5, y + .004, -11.9, "y+", 0);
  return {
    fan: ue,
    lights: P,
    skylights: X,
    relayPos: new Vector3(-2, y, -19.5),
    update(L) {
      ue.rotation.x += L * 1.7;
    }
  };
}
export { WAREHOUSE, buildWarehouse };
