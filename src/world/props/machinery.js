import { THREE } from '../../../vendor/three.js';
import { boxGeometry, cylinderGeometry, tubeGeometry } from '../../geometry/primitives.js';
import { At, Ge, Ja, Kn, Mo, Y3, _f, eo, gn, gr, ja, to, tt, us, vn, vr, zi } from './geometry.js';
import { tv } from './cargo.js';
var tb = new THREE.Quaternion();
var iR = new THREE.Vector3(0, 1, 0);
var T1 = new THREE.Vector3();
var nb = new THREE.Matrix4();
function zr(i, e, t, n, s = .006, o = false) {
  T1.set(e[0] - i[0], e[1] - i[1], e[2] - i[2]);
  let r = T1.length();
  T1.normalize();
  let a = o ? boxGeometry(t, r, n) : Ge(t, r, n, s);
  tb.setFromUnitVectors(iR, T1);
  nb.compose(new THREE.Vector3((i[0] + e[0]) / 2, (i[1] + e[1]) / 2, (i[2] + e[2]) / 2), tb, new THREE.Vector3(1, 1, 1));
  a.applyMatrix4(nb);
  return a;
}
var sR = i => {
  let e = 0;
  for (let t = 0; t < i.length; t++) {
    let n = i[t];
    let s = i[(t + 1) % i.length];
    e += n[0] * s[1] - s[0] * n[1];
  }
  return e < 0 ? i.slice().reverse() : i;
};
function ib(i, e, t, n, s, o, r, a, l, c) {
  let u = tv(t, n, r, a);
  i.push({
    p: [e, t, o > 0 ? s - n / 2 : -(s - n / 2)],
    r: [o > 0 ? tt : -tt, 0, 0]
  });
  i.push({
    r: [0, c() * 6, 0]
  });
  let h = c() * 20;
  i.add("tire", u, null, (p, d, v) => {
    let g = Math.hypot(p, v);
    return g < r + .01 ? .45 : .78 + .22 * gn(Math.atan2(v, p) * 3 + h, g * 30);
  });
  let f = n * .8;
  i.add("paint_yellow", us([[r + .006, f + .012], [r - .012, f + .016], [r - .03, f - .02], [r * .62, f - .05], [r * .5, f - .02], [r * .42, f - .012], [0, f - .012]], 14), null, (p, d, v) => Math.hypot(p, v) > r * .7 ? [.55, .5, .42] : [.8, .78, .7]);
  i.add("steel_dark", us([[0, n * .2], [r + .004, n * .2]], 10), null, .4);
  i.add("steel_dark", cylinderGeometry(r * .2, r * .24, .035, 8), {
    p: [0, f, 0]
  }, .7);
  for (let p = 0; p < 6; p++) {
    let d = p * At / 3;
    i.add("steel_galv", cylinderGeometry(.011, .012, .016, 6), {
      p: [Math.cos(d) * r * .33, f - .006, Math.sin(d) * r * .33]
    }, c.range(.5, .8));
  }
  i.pop();
  i.pop();
}
function oR(i, e) {
  let t = new Kn(i, "forklift", e.seed || 0);
  let n = t.rng;
  let s = zi(+e.forksUp || 0, 0, 1);
  let o = s * 1.5;
  let r = o / 2;
  let [a, l] = Ja(e.color, "yellow");
  let c = (K = 1) => typeof l == "number" ? l * K : l.map(ie => ie * K);
  let u = "steel_dark";
  let h = () => n.range(.68, .95);
  let f = e.number || ["04", "07", "12", "22"][t.seed % 4];
  let p = .33;
  let d = .23;
  let v = .22;
  let g = .47;
  let x = .27;
  let y = .18;
  let b = -1.1;
  let m = .46;
  for (let K of [1, -1]) {
    ib(t, v, p, d, g, K, .195, 24, 0, n);
    ib(t, b, x, y, m, K, .155, 20, 0, n);
  }
  t.add(u, vn([v, p, -.4], [v, p, .4], .07, 8), null, .5);
  t.add(u, Ge(.12, .1, .78, .01), {
    p: [b, x, 0]
  }, .5);
  t.add(u, Ge(1.95, .34, .68, .02), {
    p: [-.425, .37, 0]
  }, .55);
  for (let K of [1, -1]) {
    t.add(a, Ge(.6, .3, .17, .02), {
      p: [-.47, .4, K * .42]
    }, c(.92));
    t.add("diamond_plate", Ge(.3, .012, .16, .003), {
      p: [-.32, .556, K * .42]
    }, .7);
    t.add(u, cylinderGeometry(.03, .03, .02, 8), {
      p: [-.62, .56, K * .42]
    }, .6);
    let ie = [];
    let F = p + .035;
    let X = p + .06;
    for (let ne = 0; ne <= 7; ne++) {
      let re = .12 + (At - .5) * ne / 7;
      ie.push([v + Math.cos(re) * X, p + Math.sin(re) * X]);
    }
    for (let ne = 7; ne >= 0; ne--) {
      let re = .12 + (At - .5) * ne / 7;
      ie.push([v + Math.cos(re) * F, p + Math.sin(re) * F]);
    }
    t.add(a, Mo(ie, .27, {
      soft: .7
    }), {
      p: [0, 0, K * .475]
    }, c(.95));
  }
  t.add("diamond_plate", boxGeometry(.66, .016, .68), {
    p: [.2, .548, 0]
  }, .6);
  for (let K of [-.12, .1]) t.add("rubber", Ge(.1, .02, .07, .006), {
    p: [.33, .6, K],
    r: [0, 0, .5]
  }, .8);
  let A = eo(.62, .63, 1.12, .12, 3, 3, 3);
  to(A, K => {
    if (K.y > .1) {
      let ie = (K.y - .1) / .215;
      K.x += .03 * ie * (K.x < 0 ? 1 : 0);
    }
  });
  t.add(a, gr(A), {
    p: [-1.39, .915, 0]
  }, c(.97));
  t.add(a, Ge(.56, .37, .64, .05), {
    p: [-1.4, .43, 0]
  }, c(.85));
  t.add("hazard_stripes", Ge(.014, .085, .84, .004), {
    p: [-1.702, .77, 0]
  }, .95);
  t.label(f, {
    color: "black",
    font: "stencil",
    distress: .35
  }, .4, .2, {
    p: [-1.703, .96, 0],
    r: [0, -tt, 0]
  });
  for (let K of [1, -1]) {
    t.add(i.mats.emissive(16722450, .16), Ge(.012, .05, .11, .004), {
      p: [-1.69, 1.1, K * .37]
    }, 1, {
      raw: true
    });
    t.add(u, Ge(.016, .066, .126, .004), {
      p: [-1.684, 1.1, K * .37]
    }, .4);
    t.label("SALTLINE", {
      color: "black",
      font: "sans",
      distress: .3
    }, .42, .085, {
      p: [-1.39, .99, K * .5625],
      r: [0, K > 0 ? 0 : At, 0]
    });
    t.add(u, Ge(.06, .05, .02, .004), {
      p: [-1.67, .44, K * .05]
    }, .5);
  }
  t.add("steel_worn", cylinderGeometry(.02, .02, .13, 8), {
    p: [-1.68, .44, 0]
  }, .7);
  t.add(a, Ge(.98, .46, .94, .04), {
    p: [-.59, .79, 0]
  }, c());
  for (let K of [1, -1]) {
    t.label(f, {
      color: "black",
      font: "stencil",
      distress: .35
    }, .3, .19, {
      p: [-.84, .8, K * .4715],
      r: [0, K > 0 ? 0 : At, 0]
    });
    t.add(u, boxGeometry(.34, .2, .004), {
      p: [-.36, .8, K * .47]
    }, .2);
    for (let ie = 0; ie < 5; ie++) t.add(a, boxGeometry(.34, .03, .006), {
      p: [-.36, .72 + ie * .04, K * .474],
      r: [K * .5, 0, 0]
    }, c(.85));
  }
  t.add(u, Ge(.4, .05, .4, .01), {
    p: [-.54, 1.045, 0]
  }, .5);
  let _ = eo(.46, .1, .46, .04, 3, 3, 3);
  to(_, K => {
    K.y > 0 && (K.y -= .018 * Math.cos(K.x * 5) * Math.cos(K.z * 5));
  });
  t.add("rubber", gr(_), {
    p: [-.53, 1.115, 0]
  }, 1);
  let M = eo(.1, .5, .44, .04, 3, 4, 3);
  to(M, K => {
    K.x > 0 && (K.x -= .02 * Math.cos(K.z * 5.5));
  });
  t.add("rubber", gr(M), {
    p: [-.8, 1.39, 0],
    r: [0, 0, .16]
  }, 1);
  for (let K of [1, -1]) t.add(u, zr([-.78, 1.08, K * .24], [-.82, 1.3, K * .24], .03, .012, .004), null, .5);
  t.add(a, Mo([[.2, .55], [.54, .55], [.54, 1], [.46, 1.12], [.3, 1.14], [.21, 1.02]], .7, {
    soft: .5
  }), null, c());
  let E = Math.atan2(.12, .09);
  t.push({
    p: [.253, 1.082, 0],
    r: [0, 0, E]
  });
  t.add(u, Ge(.012, .13, .44, .004), {
    p: [-.006, 0, 0]
  }, .45);
  t.add(i.mats.emissive(9429168, .3), _f(.09, .05), {
    p: [-.0135, .01, .1],
    r: [0, -tt, 0]
  }, 1, {
    raw: true,
    cast: false
  });
  t.decal(i.mats.decal("csc_plate"), .09, {
    p: [-.0135, 0, -.12],
    r: [0, -tt, 0]
  });
  t.add("plastic_red", cylinderGeometry(.016, .016, .02, 8), {
    p: [-.02, 0, .19],
    r: [0, 0, tt]
  }, .9);
  t.add("steel_bare", cylinderGeometry(.009, .009, .02, 6), {
    p: [-.018, -.03, -.01],
    r: [0, 0, tt]
  }, .9);
  t.pop();
  let w = [.3, 1.1, .04];
  let S = [.1, 1.31, .04];
  t.add(u, vn(w, S, .024, 8), null, .5);
  t.push({
    p: S,
    r: [0, 0, Math.atan2(S[1] - w[1], S[0] - w[0])]
  });
  t.add("rubber", ja(.165, .014, 6, 18), {
    r: [0, tt, 0]
  }, 1);
  for (let K = 0; K < 3; K++) {
    let ie = K * At * 2 / 3 + .5;
    t.add(u, vn([-.01, 0, 0], [0, Math.cos(ie) * .16, Math.sin(ie) * .16], .009, 5), null, .5);
  }
  t.add(u, cylinderGeometry(.035, .04, .03, 10), {
    p: [-.005, 0, 0],
    r: [0, 0, tt]
  }, .5);
  t.add("rubber", cylinderGeometry(.016, .014, .045, 8), {
    p: [.03, .16, .02],
    r: [0, 0, tt]
  }, 1);
  t.pop();
  for (let K = 0; K < 3; K++) {
    let ie = -.2 - K * .055;
    let F = [.33, 1.12, ie];
    let X = [.25 - K * .012, 1.3 - K * .01, ie - .01];
    t.add("steel_bare", vn(F, X, .007, 5), null, .8);
    t.add("rubber", Y3(.02, 7, 5), {
      p: X
    }, 1);
  }
  {
    let K = [.3, 1.1, .27];
    let ie = [.2, 1.24, .29];
    t.add("steel_bare", vn(K, ie, .008, 5), null, .8);
    t.add("plastic_red", cylinderGeometry(.016, .016, .07, 7), {
      p: ie,
      r: [0, 0, .6]
    }, .9);
  }
  let z = 2.045;
  let H = [];
  for (let K of [1, -1]) {
    let ie = [.47, 1.08, K * .4];
    let F = [.27, z, K * .46];
    let X = [-1, 1, K * .44];
    let ne = [-.95, z, K * .46];
    t.add(u, zr(ie, F, .06, .05, .01), null, h());
    t.add(u, zr(X, ne, .06, .05, .01), null, h());
    t.add(u, zr([.3, z, K * .46], [-.98, z, K * .46], .05, .06, .01), null, h());
    t.add(u, Ge(.09, .012, .08, .003), {
      p: [.47, 1.085, K * .4]
    }, .5);
    t.add(u, Ge(.09, .012, .08, .003), {
      p: [-1, 1.024, K * .44]
    }, .5);
    let re = .36;
    let $ = 1.66;
    t.add(u, eo(.085, .1, .13, .02, 3, 3, 3), {
      p: [re + .045, $, K * .47]
    }, .45);
    t.add(i.mats.emissive(16773330, .7), Ge(.006, .075, .105, .002), {
      p: [re + .089, $, K * .47]
    }, 1, {
      raw: true
    });
    t.add(u, vn([.385, 1.5, K * .42], [.42, 1.52, K * .57], .008, 5), null, .5);
    t.add(u, Ge(.022, .17, .1, .006), {
      p: [.42, 1.52, K * .573],
      r: [0, K * .25, 0]
    }, .5);
    t.add("steel_bare", boxGeometry(.002, .15, .084), {
      p: [.408, 1.52, K * .57],
      r: [0, K * .25, 0]
    }, 1);
    H.push({
      min: [-1.03, 1, K > 0 ? .41 : -.5],
      max: [-.92, z, K > 0 ? .5 : -.41],
      surface: "metal"
    }, {
      min: [.24, 1.08, K > 0 ? .37 : -.5],
      max: [.5, z, K > 0 ? .5 : -.37],
      surface: "metal"
    });
  }
  for (let K of [.28, -.96]) t.add(u, Ge(.05, .06, .92, .01), {
    p: [K, z, 0]
  }, h());
  for (let K = 0; K < 8; K++) t.add(u, Ge(.03, .028, .9, .006), {
    p: [-.83 + K * .139, z + .012, 0]
  }, h());
  t.add(u, tubeGeometry([[.44, 1.2, .44], [.47, 1.25, .49], [.41, 1.55, .5], [.36, 1.6, .455]], .011, 5, false, .5), null, .5);
  t.add(u, cylinderGeometry(.045, .05, .03, 10), {
    p: [-.86, z + .045, .3]
  }, .5);
  t.add(i.mats.emissive(16747026, .9), us([[.04, 0], [.04, .06], [.03, .082], [0, .09]], 10), {
    p: [-.86, z + .06, .3]
  }, 1, {
    raw: true
  });
  let O = -1.4;
  let q = 1.23 + .05 + .155;
  for (let K of [-.2, .2]) {
    t.add(u, Ge(.3, .07, .04, .008), {
      p: [O, 1.262, K]
    }, .5);
    t.add(u, cylinderGeometry(.159, .159, .035, 16, true), {
      p: [O, q, K],
      r: [tt, 0, 0]
    }, .35);
  }
  t.add("steel_galv", us([[0, -.37], [.08, -.36], [.132, -.33], [.155, -.27], [.155, .27], [.132, .33], [.08, .36], [0, .37]], 16), {
    p: [O, q, 0],
    r: [tt, 0, 0]
  }, (K, ie, F) => .8 + .2 * gn(K * 8, ie * 8, F * 8));
  t.add("steel_galv", cylinderGeometry(.09, .09, .07, 12, true), {
    p: [O, q, .39],
    r: [tt, 0, 0]
  }, .7);
  t.add("steel_galv", cylinderGeometry(.02, .02, .05, 8), {
    p: [O, q, .39],
    r: [tt, 0, 0]
  }, .9);
  t.add("rubber", tubeGeometry([[O, q, .41], [O + .05, q - .02, .46], [O + .2, q - .15, .44], [-1.07, 1.1, .38], [-1, .98, .36]], .012, 5, false, .5), null, 1);
  t.push({
    p: [O, q, 0],
    r: [0, 0, .7]
  });
  t.cdecal(i.mats.decal("hazard_flammable"), .157, .12, {
    p: [0, 0, -.05],
    r: [-tt, 0, 0]
  });
  t.cdecal(i.mats.label("LPG", {
    color: "red",
    font: "stencil",
    distress: .3
  }), .157, .16, {
    p: [0, 0, .14],
    r: [-tt, 0, 0]
  });
  t.pop();
  let U = .6;
  let T = .73;
  let D = .375;
  let C = .08;
  let G = 2.02;
  for (let K of [1, -1]) {
    let ie = K * D;
    let F = [[U, ie], [T, ie], [T, ie - K * .065], [T - .014, ie - K * .065], [T - .014, ie - K * .014], [U + .014, ie - K * .014], [U + .014, ie - K * .065], [U, ie - K * .065]];
    t.add(u, Mo(sR(F.map(P => [P[0], -P[1]])), G - C, {
      soft: 0
    }), {
      p: [0, (C + G) / 2, 0],
      r: [-tt, 0, 0]
    }, h());
    t.add(u, Ge(.085, 1.86, .036, .006), {
      p: [.665, .13 + r + .93, K * .335]
    }, h() * 1.25);
    t.decal(i.mats.decal("hazard_general"), .1, {
      p: [.665, 1.3, K * (D + .002)],
      r: [0, K > 0 ? 0 : At, 0]
    });
    let X = [.36, .66, K * .3];
    let ne = [.6, .86, K * .33];
    let re = [.5, .777, K * .317];
    t.add(u, vn(X, re, .034, 8, true), null, .55);
    t.add("steel_bare", vn(re, ne, .018, 6), null, 1);
    let $ = K * .13;
    let ue = 1.9 + r;
    let me = .055;
    let ee = [[.725, .5 + o, $], [.725, ue, $]];
    for (let P = .5; P < At; P += .55) ee.push([.67 + Math.cos(P) * me, ue + Math.sin(P) * me, $]);
    ee.push([.615, ue, $], [.615, 1, $]);
    let B = 0;
    for (let P = 0; P < ee.length - 1; P++) {
      let V = ee[P];
      let Y = ee[P + 1];
      let L = Math.hypot(Y[0] - V[0], Y[1] - V[1]);
      let Z = Math.max(1, Math.round(L / .058));
      for (let J = 0; J < Z; J++, B++) {
        let oe = J / Z;
        let fe = (J + .86) / Z;
        let le = R => [V[0] + (Y[0] - V[0]) * R, V[1] + (Y[1] - V[1]) * R, $];
        t.add("steel_worn", zr(le(oe), le(fe), .011, B % 2 ? .034 : .022, 0, true), null, B % 2 ? .55 : .75);
      }
    }
    t.add(u, cylinderGeometry(me - .006, me - .006, .04, 12), {
      p: [.67, ue, $],
      r: [tt, 0, 0]
    }, .7);
  }
  t.add(u, Ge(.04, .09, .78, .008), {
    p: [U - .012, 1.96, 0]
  }, h());
  t.add(u, Ge(.04, .12, .78, .008), {
    p: [U - .012, .42, 0]
  }, h());
  t.add(u, Ge(.07, .09, .66, .008), {
    p: [.665, 1.99 + r, 0]
  }, h());
  t.add(u, cylinderGeometry(.048, .048, 1.15, 10), {
    p: [.645, .72, 0]
  }, .6);
  t.add(u, cylinderGeometry(.055, .055, .05, 10), {
    p: [.645, 1.3, 0]
  }, .5);
  t.add("steel_bare", cylinderGeometry(.027, .027, .64 + r, 8, true), {
    p: [.645, 1.31 + (.64 + r) / 2, 0]
  }, 1);
  t.label("MAX 2500 kg", {
    color: "yellow",
    font: "stencil",
    distress: .3
  }, .5, .05, {
    p: [U - .033, .42, 0],
    r: [0, -tt, 0]
  });
  for (let K of [.21, .245]) t.add("rubber", tubeGeometry([[.6, 1.25, K], [.59, 1.65 + r * .6, K], [.655, 1.86 + r, K + .005], [.735, 1.6 + r * 1.2, K], [.74, .56 + o, K]], .011, 5, false, .5), null, 1);
  t.push({
    p: [0, o, 0]
  });
  let j = .06;
  for (let K of [j + .12, j + .5]) t.add(u, Ge(.04, .1, 1.02, .008), {
    p: [.755, K, 0]
  }, h());
  t.add("hazard_stripes", boxGeometry(.003, .06, .4), {
    p: [.7765, j + .5, 0]
  }, .9);
  for (let K of [1, -1]) {
    t.add(u, Ge(.03, .5, .06, .006), {
      p: [.745, j + .31, K * .3]
    }, h());
    t.add(u, Ge(.11, .36, .022, .005), {
      p: [.685, j + .31, K * .305]
    }, h());
    t.add(u, Ge(.03, .78, .04, .006), {
      p: [.755, j + .94, K * .5]
    }, h());
    t.add("steel_worn", cylinderGeometry(.04, .04, .03, 10), {
      p: [.67, j + .2, K * .325],
      r: [tt, 0, 0]
    }, .7);
  }
  t.add(u, Ge(.03, .04, 1.04, .006), {
    p: [.755, j + 1.33, 0]
  }, h());
  t.add(u, Ge(.02, .03, 1, .004), {
    p: [.755, j + .94, 0]
  }, h());
  for (let K = -2; K <= 2; K++) t.add(u, Ge(.02, .76, .02, .004), {
    p: [.755, j + .94, K * .165]
  }, h());
  let N = .035;
  for (let K of [1, -1]) {
    let ie = Mo([[.777, N], [1.45, N], [1.7, N + .006], [1.7, N + .016], [.87, N + .046], [.826, N + .075], [.822, N + .62], [.777, N + .62]], .1, {
      soft: .45
    });
    t.add("steel_worn", ie, {
      p: [0, 0, K * .26]
    }, (F, X, ne) => {
      let re = zi((F - .8) / .9, 0, 1);
      let $ = gn(F * 14, ne * 30 + K);
      return (.5 + .5 * re) * (.8 + .2 * $);
    });
    t.add(u, Ge(.075, .05, .112, .006), {
      p: [.772, j + .575, K * .26]
    }, .55);
    t.add(u, Ge(.03, .04, .112, .006), {
      p: [.79, j + .07, K * .26]
    }, .55);
  }
  t.pop();
  let Q = Math.max(2.2, .06 + o + 1.36, 2.04 + r);
  return t.finish({
    size: [3.4, Q, 1.25],
    colliders: [{
      min: [-1.7, 0, -.6],
      max: [.58, 1.24, .6],
      surface: "metal"
    }, {
      min: [-1.56, 1.24, -.4],
      max: [-1.22, 1.6, .4],
      surface: "metal"
    }, {
      min: [-.88, 1.24, -.24],
      max: [-.7, 1.66, .24],
      surface: "rubber"
    }, {
      min: [.56, 0, -.42],
      max: [.78, 2.04 + r, .42],
      surface: "metal"
    }, {
      min: [.72, o, -.53],
      max: [.8, o + 1.42, .53],
      surface: "metal"
    }, {
      min: [.8, o, -.33],
      max: [1.7, o + .1, .33],
      surface: "metal"
    }, {
      min: [-1.02, 2, -.5],
      max: [.32, 2.1, .5],
      surface: "metal"
    }, ...H]
  });
}
function rR(i, e) {
  let t = new Kn(i, "generator", e.seed || 0);
  let n = t.rng;
  let [s, o] = Ja(e.color, "yellow");
  let r = (m = 1) => typeof o == "number" ? o * m : o.map(A => A * m);
  let a = "steel_dark";
  let l = .46;
  let c = 1.03;
  let u = .3;
  let h = 1.16;
  let f = (u + h) / 2;
  for (let m of [1, -1]) {
    t.add(a, Ge(2.2, .14, .1, .012), {
      p: [0, .07, m * .4]
    }, .6);
    for (let A of [-.45, .45]) t.add(a, boxGeometry(.22, .075, .004), {
      p: [A, .075, m * .451]
    }, .12);
  }
  for (let m of [-.85, 0, .85]) t.add(a, boxGeometry(.1, .1, .72), {
    p: [m, .07, 0]
  }, .55);
  t.add(a, Ge(2.1, .17, .94, .012), {
    p: [0, .215, 0]
  }, .8);
  t.add(s, Ge(2.06, h - u, l * 2, .025), {
    p: [0, f, 0]
  }, r());
  t.add(s, Ge(2.13, .045, .99, .014), {
    p: [0, h + .02, 0]
  }, r(.9));
  for (let m of [-.52, .52]) t.add(s, boxGeometry(.04, .012, .95), {
    p: [m, h + .046, 0]
  }, r(.85));
  for (let m of [1, -1]) {
    let A = m > 0 ? 0 : At;
    [-.66, 0, .66].forEach((_, M) => {
      t.add(s, Ge(.62, .72, .012, .006), {
        p: [_, f + .01, m * (l + .004)]
      }, r(n.range(.9, 1)));
      t.add(a, boxGeometry(.03, .11, .016), {
        p: [_ + .27, f, m * (l + .012)]
      }, .6);
      t.add("steel_galv", boxGeometry(.012, .03, .006), {
        p: [_ + .27, f + .03, m * (l + .022)]
      }, .8);
      for (let E of [-.25, .25]) t.add("steel_galv", cylinderGeometry(.009, .009, .06, 5, true), {
        p: [_ - .305, f + E, m * (l + .012)]
      }, .7);
      if (M > 0) {
        let E = M === 2 ? 8 : 5;
        let w = .42;
        let S = M === 2 ? f + .14 : f - .16;
        t.add(a, boxGeometry(w, E * .05, .004), {
          p: [_ - .03, S, m * (l + .0105)]
        }, .12);
        for (let z = 0; z < E; z++) t.add(s, boxGeometry(w, .04, .005), {
          p: [_ - .03, S + (z - (E - 1) / 2) * .05, m * (l + .018)],
          r: [m * .6, 0, 0]
        }, r(.82));
        M === 2 && t.decal(i.mats.decal("rust_run"), .3, {
          p: [_ - .03, S - .36, m * (l + .011)],
          r: [0, A, 0]
        });
      }
    });
    t.label(e.label || "GEN-0" + (1 + t.seed % 2), {
      color: "black",
      font: "stencil",
      distress: .35
    }, .5, .13, {
      p: [-.66 * m, f + .17, m * (l + .0108)],
      r: [0, A, 0]
    });
    t.decal(i.mats.decal("hazard_voltage"), .15, {
      p: [-.66 * m - m * .18, f - .17, m * (l + .0108)],
      r: [0, A, 0]
    });
  }
  t.add(a, boxGeometry(.004, .66, .74), {
    p: [c + .001, f, 0]
  }, .1);
  for (let m = 0; m < 11; m++) t.add(s, boxGeometry(.006, .046, .74), {
    p: [c + .012, f - .3 + m * .06, 0],
    r: [0, 0, -.6]
  }, r(.8));
  for (let m of [1, -1]) {
    t.add(s, boxGeometry(.03, .72, .03), {
      p: [c + .012, f, m * .385]
    }, r(.9));
    t.add(s, boxGeometry(.03, .03, .8), {
      p: [c + .012, f + m * .345, 0]
    }, r(.9));
  }
  let p = -c - .004;
  let d = .14;
  t.add(a, Ge(.01, .44, .52, .004), {
    p: [p, .87, d]
  }, .45);
  t.add(s, Ge(.075, .014, .56, .004), {
    p: [p - .03, 1.1, d],
    r: [0, 0, .12]
  }, r(.9));
  for (let m of [1, -1]) t.add(s, boxGeometry(.06, .44, .012), {
    p: [p - .025, .87, d + m * .268]
  }, r(.9));
  let v = p - .0055;
  let g = [0, -tt, 0];
  t.add(i.mats.emissive(8840104, .32), _f(.13, .07), {
    p: [v - .001, .99, d - .12],
    r: g
  }, 1, {
    raw: true,
    cast: false
  });
  t.add(a, Ge(.008, .09, .15, .003), {
    p: [v + .003, .99, d - .12]
  }, .3);
  t.add("steel_galv", cylinderGeometry(.02, .02, .012, 10), {
    p: [v - .004, 1, d + .19],
    r: [0, 0, tt]
  }, .7);
  t.add(i.mats.emissive(4063082, 3.2), cylinderGeometry(.013, .013, .014, 10), {
    p: [v - .009, 1, d + .19],
    r: [0, 0, tt]
  }, 1, {
    raw: true
  });
  t.add(s, cylinderGeometry(.042, .042, .006, 12), {
    p: [v - .003, .8, d + .17],
    r: [0, 0, tt]
  }, 1);
  t.add("plastic_red", us([[0, 0], [.018, 0], [.018, .018], [.03, .02], [.03, .034], [.02, .042], [0, .044]], 10), {
    p: [v - .004, .8, d + .17],
    r: [0, 0, tt]
  }, .95);
  for (let m = 0; m < 3; m++) {
    let A = d - .2 + m * .105;
    t.add("aluminium", cylinderGeometry(.04, .042, .012, 10), {
      p: [v - .004, .86, A],
      r: [0, 0, tt]
    }, .8);
    t.add("aluminium", cylinderGeometry(.034, .034, .002, 10), {
      p: [v - .0105, .86, A],
      r: [0, 0, tt]
    }, 1);
    t.add(a, boxGeometry(.002, .028, .004), {
      p: [v - .0125, .868, A + .005],
      r: [n.range(-1, 1), 0, 0]
    }, .3);
  }
  for (let m = 0; m < 5; m++) t.add(m === 0 ? "plastic_red" : a, boxGeometry(.014, .04, .022), {
    p: [v - .006, .74, d - .2 + m * .03],
    r: [0, 0, n() < .5 ? .25 : -.25]
  }, .8);
  t.decal(i.mats.decal("hazard_voltage"), .13, {
    p: [-c - .002, .95, -.28],
    r: g
  });
  t.label("DANGER", {
    color: "red",
    font: "stencil",
    distress: .3
  }, .22, .05, {
    p: [-c - .002, .82, -.28],
    r: g
  });
  let x = [["plastic_red", .02], ["plastic_blue", .2], ["plastic_blue", -.25]];
  for (let [m, A] of x) {
    t.add(a, Ge(.02, .12, .1, .006), {
      p: [-c - .008, .5, A]
    }, .4);
    t.add(m, vn([-c - .01, .5, A], [-c - .06, .47, A], .036, 10, true), null, .9);
  }
  t.add("plastic_blue", vn([-c - .06, .47, .2], [-c - .068, .39, .2], .03, 8, true, .02), null, .85);
  t.add("rubber", tubeGeometry([[-c - .066, .4, .2], [-c - .064, .25, .21], [-c - .05, .06, .26], [-c + .05, .016, .4], [-c + .3, .016, .478], [-.35, .016, .486]], .014, 5, false, .5), null, 1);
  let y = h + .0425;
  t.add(a, Ge(.2, .012, .14, .004), {
    p: [0, y + .004, 0]
  }, .6);
  t.add("steel_galv", ja(.045, .014, 5, 10), {
    p: [0, y + .058, 0]
  }, .7);
  let b = [.72, y, .24];
  t.add("steel_rust", cylinderGeometry(.062, .066, .025, 12), {
    p: [b[0], y + .012, b[2]]
  }, .6);
  t.add("steel_rust", cylinderGeometry(.04, .04, .17, 12, true), {
    p: [b[0], y + .085, b[2]]
  }, (m, A) => .45 + .55 * zi((y + .17 - A) / .17, 0, 1));
  t.add("steel_rust", cylinderGeometry(.034, .034, .002, 10), {
    p: [b[0], y + .15, b[2]]
  }, .08);
  t.add("steel_rust", cylinderGeometry(.046, .046, .005, 12), {
    p: [b[0] - .012, y + .186, b[2]],
    r: [0, 0, .5]
  }, .6);
  t.decal(i.mats.decal("scorch"), .3, {
    p: [b[0], y + .001, b[2]],
    r: [-tt, 0, 0]
  });
  t.add(a, vn([-.72, .25, .46], [-.72, .32, .5], .03, 8, true), null, .6);
  t.add("plastic_red", vn([-.72, .32, .5], [-.72, .338, .51], .037, 10, true), null, .9);
  t.decal(i.mats.decal("hazard_flammable"), .11, {
    p: [-.52, .215, .4712]
  });
  t.label("DIESEL", {
    color: "white",
    font: "stencil",
    distress: .4
  }, .2, .05, {
    p: [-.34, .215, .4712]
  });
  return t.finish({
    colliders: [{
      min: [-1.1, 0, -.5],
      max: [1.1, 1.21, .5],
      surface: "metal"
    }]
  });
}
function aR(i, e) {
  let t = new Kn(i, "dumpster", e.seed || 0);
  let n = t.rng;
  let [s, o] = Ja(e.color, "green");
  let r = (M = 1) => typeof o == "number" ? o * M : o.map(E => E * M);
  let a = .89;
  let l = .2;
  let c = 1.12;
  let u = .3;
  let h = .5;
  let f = -.44;
  let p = -.5;
  let d = .022;
  let v = [[-h, c], [-u, l], [-f, l], [-p, c], [-p - d, c], [-f - d * .8, l + d], [-u + d * .8, l + d], [-h + d, c]];
  let g = t.seed * 2.3;
  t.add(s, Mo(v, a * 2, {
    soft: 0
  }), {
    r: [0, tt, 0]
  }, (M, E, w) => {
    let S = Math.abs(w) < .4 && E > l + .01 && E < c - .01 && Math.abs(M) < a - .01;
    return r(.9 + .1 * gn(M * 3 + g, E * 3));
  });
  for (let M of [1, -1]) {
    t.add(s, Mo([[-h, c], [-u, l], [-f, l], [-p, c]], d, {
      soft: 0
    }), {
      p: [M * (a - d / 2), 0, 0],
      r: [0, tt, 0]
    }, r(.95));
    t.add(s, Ge(.05, .045, h - p + .04, .008), {
      p: [M * a, c, 0]
    }, r(.9));
    for (let E of [-.22, .14]) t.add(s, Ge(.03, .84, .05, .006), {
      p: [M * (a + .012), .66, E]
    }, r(.9));
    t.add(s, Ge(.035, .1, .84, .008), {
      p: [M * (a + .014), .93, 0]
    }, r(.85));
    t.add("steel_worn", vn([M * (a + .01), .93, .3], [M * (a + .065), .93, .3], .03, 10, true), null, .7);
    t.add("steel_worn", cylinderGeometry(.042, .042, .008, 10), {
      p: [M * (a + .064), .93, .3],
      r: [0, 0, tt]
    }, .6);
  }
  t.add(s, Ge(a * 2 + .04, .045, .05, .008), {
    p: [0, c, h]
  }, r(.9));
  t.add(s, Ge(a * 2 + .04, .045, .05, .008), {
    p: [0, c, p]
  }, r(.9));
  let x = Math.atan2(h - u, c - l);
  let y = Math.atan2(p - f, c - l);
  for (let M of [-.6, -.2, .2, .6]) {
    t.add(s, zr([M, l + .03, u + .022], [M, c - .04, h + .012], .055, .03, .006), null, r(.9));
    t.add(s, zr([M, l + .03, f - .016], [M, c - .04, p - .012], .055, .03, .006), null, r(.9));
  }
  t.add(s, zr([-a, l + .5, u + .022 + .5 * (h - u) / (c - l)], [a, l + .5, u + .022 + .5 * (h - u) / (c - l)], .03, .06, .006), {
    r: [0, 0, 0]
  }, r(.88));
  let b = M => u + (M - l) * (h - u) / (c - l) + .003;
  t.label(e.label || "B4 WASTE " + (11 + t.seed % 2), {
    color: "white",
    font: "stencil",
    distress: .5
  }, .36, .09, {
    p: [-.4, .93, b(.93)],
    r: [-x, 0, 0]
  });
  t.decal(i.mats.decal("grime_streak"), .36, {
    p: [.4, .82, b(.82)],
    r: [-x, 0, 0]
  });
  t.decal(i.mats.decal("rust_run"), .3, {
    p: [0, .5, b(.5)],
    r: [-x, 0, 0]
  });
  t.decal(i.mats.decal("logo_c"), .26, {
    p: [.4, .42, b(.42)],
    r: [-x, 0, 0]
  });
  t.decal(i.mats.decal("leak_stain"), .34, {
    p: [-.4, .45, b(.45)],
    r: [-x, 0, 0]
  });
  let m = c + .045;
  let A = p - .02;
  t.add("steel_galv", vn([-a - .02, m, A], [a + .02, m, A], .013, 6, true), null, .7);
  let _ = (M, E) => {
    t.push({
      p: [M, m, A],
      r: [E, 0, 0]
    });
    let w = 1.07;
    let S = eo(.885, .04, w, .016, 3, 3, 4);
    to(S, H => {
      H.y > 0 && (H.y += .018 * Math.cos(H.z / w * At) * Math.cos(H.x / .885 * At));
    });
    S.computeVertexNormals();
    let z = n.range(.75, .95);
    t.add("plastic_grey", S, {
      p: [0, .005, w / 2]
    }, z);
    for (let H of [-.26, .26]) t.add("plastic_grey", Ge(.07, .016, w - .16, .006), {
      p: [H, .036, w / 2]
    }, z * .9);
    t.add("plastic_grey", Ge(.3, .035, .05, .01), {
      p: [0, .02, w + .01]
    }, z * .8);
    for (let H of [-.3, .3]) t.add("plastic_grey", Ge(.08, .03, .09, .008), {
      p: [H, .005, .03]
    }, z * .8);
    t.pop();
  };
  _(-.45, 0);
  _(.45, tt + .07 + n.range(0, .05));
  for (let [M, E, w, S] of [[.45, .93, .05, 1], [.66, .9, -.24, .8], [.22, .86, -.2, .85]]) {
    let z = eo(.46 * S, .4 * S, .42 * S, .17 * S, 3, 3, 3);
    let H = n() * 20;
    to(z, O => {
      let q = gn(O.x * 9 + H, O.y * 9, O.z * 9) - .5;
      O.x += q * .06;
      O.z += q * .06;
      O.y += q * .04;
    });
    t.add("polymer_black", gr(z), {
      p: [M, E, w],
      r: [n() * .5, n() * 6, 0]
    }, .8);
  }
  t.add("cardboard", vr([[.2, .9, .2], [.24, 1.14, .26], [.3, 1.2, .33]], [.16, 0, -.05]), null, .7);
  for (let M of [-.7, .7]) for (let E of [-.3, .17]) {
    t.push({
      p: [M, 0, E],
      r: [0, n() * 6, 0]
    });
    t.add("steel_galv", Ge(.13, .012, .11, .003), {
      p: [0, .194, 0]
    }, .7);
    for (let w of [1, -1]) t.add("steel_galv", zr([0, .19, w * .034], [.035, .08, w * .034], .05, .006, 0, true), null, .65);
    t.add("rubber", cylinderGeometry(.08, .08, .045, 14), {
      p: [.035, .08, 0],
      r: [tt, 0, 0]
    }, .9);
    t.add("steel_galv", cylinderGeometry(.035, .035, .05, 8), {
      p: [.035, .08, 0],
      r: [tt, 0, 0]
    }, .6);
    t.pop();
  }
  return t.finish({
    colliders: [{
      min: [-.95, .05, -.56],
      max: [.95, 1.2, .55],
      surface: "metal"
    }]
  });
}
function lR(i, e) {
  let t = new Kn(i, "toolbox_cart", e.seed || 0);
  let n = t.rng;
  let [s, o] = Ja(e.color, "red");
  let r = (y = 1) => typeof o == "number" ? o * y : o.map(b => b * y);
  let a = .04;
  let l = .74;
  let c = .125;
  let u = .785;
  let h = .23;
  t.add(s, Ge(l, u - c, h * 2, .012), {
    p: [a, (c + u) / 2, 0]
  }, r());
  t.add("steel_dark", Ge(l + .01, .02, h * 2 + .01, .006), {
    p: [a, c + .004, 0]
  }, .5);
  let f = [.075, .075, .1, .13, .19];
  let p = 1 + t.seed % 3;
  let d = u - .03;
  f.forEach((y, b) => {
    let m = b === p ? .05 : n() < .3 ? .004 : 0;
    let A = d - y / 2;
    if (t.add(s, Ge(l - .05, y - .01, .014, .004), {
      p: [a, A, h + .005 + m]
    }, r(n.range(.9, 1))), t.add("aluminium", Ge(l - .09, .016, .016, .004), {
      p: [a, A + y / 2 - .02, h + .019 + m]
    }, .85), m > .01) {
      t.add("steel_dark", boxGeometry(l - .07, y - .02, m), {
        p: [a, A, h + m / 2]
      }, .4);
      t.add("polymer_black", boxGeometry(l - .08, .004, m), {
        p: [a, A + y / 2 - .012, h + m / 2]
      }, .3);
      for (let _ = 0; _ < 4; _++) t.add("steel_bare", vn([a - .25 + _ * .15, A + y / 2 - .016, h + .008], [a - .23 + _ * .15, A + y / 2 - .014, h + m - .012], .007, 5, true), null, .8);
    }
    d -= y;
  });
  t.add("steel_bare", cylinderGeometry(.011, .011, .008, 8), {
    p: [a + l / 2 - .06, u - .016, h + .004],
    r: [tt, 0, 0]
  }, .8);
  t.add("rubber", boxGeometry(l - .04, .006, h * 2 - .04), {
    p: [a, u + .003, 0]
  }, .9);
  t.add(s, Ge(l, .03, .014, .004), {
    p: [a, u + .013, -h + .007]
  }, r(.95));
  for (let y of [1, -1]) t.add(s, Ge(.014, .03, h * 2, .004), {
    p: [a + y * (l / 2 - .007), u + .013, 0]
  }, r(.95));
  t.add("aluminium", tubeGeometry([[a - l / 2, .56, -.17], [-.41, .6, -.17], [-.435, .73, -.17], [-.435, .73, .17], [-.41, .6, .17], [a - l / 2, .56, .17]], .012, 6, false, .2), null, .85);
  for (let y of [1, -1]) for (let b of [1, -1]) {
    t.push({
      p: [a + y * (l / 2 - .07), 0, b * (h - .06)],
      r: [0, y > 0 ? n() * 6 : 0, 0]
    });
    t.add("steel_galv", Ge(.08, .008, .07, .002), {
      p: [0, .119, 0]
    }, .7);
    for (let m of [1, -1]) t.add("steel_galv", zr([0, .117, m * .022], [.02, .05, m * .022], .035, .004, 0, true), null, .65);
    t.add("rubber", cylinderGeometry(.05, .05, .03, 12), {
      p: [.02, .05, 0],
      r: [tt, 0, 0]
    }, .9);
    t.add("steel_galv", cylinderGeometry(.02, .02, .034, 6), {
      p: [.02, .05, 0],
      r: [tt, 0, 0]
    }, .6);
    t.pop();
  }
  t.label(e.label || "MAINT " + (1 + t.seed % 2), {
    color: "white",
    font: "stencil",
    distress: .4
  }, .3, .07, {
    p: [a + l / 2 + .002, .6, 0],
    r: [0, tt, 0]
  });
  t.decal(i.mats.decal("logo_d"), .2, {
    p: [a + l / 2 + .002, .42, 0],
    r: [0, tt, 0]
  });
  t.decal(i.mats.decal("grime_streak"), .3, {
    p: [a, .45, -h - .002],
    r: [0, At, 0]
  });
  let v = u + .006;
  t.push({
    p: [a - .18, v, .08],
    r: [0, .5, 0]
  });
  t.add("steel_bare", Ge(.2, .006, .02, .002), {
    p: [0, .004, 0]
  }, .9);
  t.add("steel_bare", ja(.016, .006, 4, 10), {
    p: [.11, .005, 0],
    r: [tt, 0, 0]
  }, .9);
  t.add("steel_bare", ja(.017, .006, 4, 7, At * 1.4), {
    p: [-.112, .005, 0],
    r: [tt, 0, 2.2]
  }, .9);
  t.pop();
  t.push({
    p: [a + .02, v, -.1],
    r: [0, -.3, 0]
  });
  t.add("wood_pallet", vn([-.14, .014, 0], [.12, .016, 0], .012, 6, true, .01), null, .9);
  t.add("steel_dark", Ge(.032, .03, .1, .006), {
    p: [.125, .017, .005]
  }, .8);
  t.pop();
  t.push({
    p: [a + .2, v, .1],
    r: [0, .12, 0]
  });
  t.add("polymer_black", Ge(.22, .014, .05, .004), {
    p: [0, .007, 0]
  }, .6);
  for (let y = 0; y < 6; y++) t.add("steel_bare", cylinderGeometry(.008 + y * .0014, .008 + y * .0014, .03, 8), {
    p: [-.085 + y * .034, .029, 0]
  }, .9);
  t.pop();
  t.add("plastic_blue", cylinderGeometry(.032, .032, .13, 12), {
    p: [a + .28, v + .065, -.12]
  }, .9);
  t.add("steel_bare", us([[.032, 0], [.028, .012], [.014, .018], [.014, .018], [.014, .03], [0, .03]], 10), {
    p: [a + .28, v + .13, -.12]
  }, .9);
  t.add("plastic_red", cylinderGeometry(.012, .012, .014, 8), {
    p: [a + .28, v + .165, -.12]
  }, .95);
  t.add("paint_yellow", vn([a - .3, v + .012, -.13], [a - .2, v + .012, -.16], .014, 7, true), null, .9);
  t.add("steel_bare", vn([a - .2, v + .012, -.16], [a - .08, v + .01, -.196], .004, 5, true), null, .9);
  let g = eo(.2, .02, .15, .009, 4, 3, 4);
  let x = n() * 9;
  to(g, y => {
    y.y += .012 * gn(y.x * 30 + x, y.z * 30) * (y.y > 0 ? 1 : 0);
    y.x += .012 * (gn(y.z * 20, x) - .5);
  });
  t.add(t.mat("glove_fabric", {
    color: 8203044
  }), gr(g), {
    p: [a - .26, v + .01, .12],
    r: [0, .8, 0]
  }, .9);
  return t.finish();
}
function sb(i) {
  i("forklift", (e, t = {}) => oR(e, t));
  i("generator", (e, t = {}) => rR(e, t));
  i("dumpster", (e, t = {}) => aR(e, t));
  i("toolbox_cart", (e, t = {}) => lR(e, t));
}
export { sb };
