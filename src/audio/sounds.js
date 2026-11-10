import { Jc, Q1, Qn, Rv, Se, St, Us, Vo, Wo, Xt, Zc, ao, at, co, di, dn, ei, jc, lo, ml, tn, vt } from './synthesis.js';
function KR(i, e, t) {
  let n = [1, .955, 1.045, .985][t & 3];
  let s = [1, 1.12, .9, 1.05][t & 3];
  let o = St(i, .32);
  Se(o, at(i, e, .012, .0011, {
    hp: 2600 * s
  }), 0, 2.6, i);
  Se(o, at(i, e, .02, .003, {
    hp: 1200,
    lp: 8e3
  }), 2e-4, 1.2, i);
  Se(o, ei(i, .11, 160 * n, 45 * n, .024, .03, .003), 0, .62, i);
  Se(o, at(i, e, .22, .03, {
    hp: 300 * n,
    lp: 2500 * n * s,
    att: .0012
  }), 0, 1.5, i);
  Se(o, at(i, e, .09, .016, {
    bp: 760 * n,
    q: 2.2,
    att: .001
  }), 0, .9, i);
  Se(o, at(i, e, .16, .04, {
    hp: 4800
  }), .001, .34, i);
  let r = .035 + (t - 1.5) * .0015;
  Se(o, dn(i, .05, [[2150 * n, .007, 1], [3420 * n, .006, .7], [5230, .004, .5], [880 * n, .012, .5]], e), r, .26, i);
  Se(o, at(i, e, .012, .002, {
    bp: 3100,
    q: 1.2
  }), r, .3, i);
  Se(o, dn(i, .05, [[1780 * n, .008, 1], [2890 * n, .006, .6], [640 * n, .02, .5]], e), r + .027, .17, i);
  Se(o, at(i, e, .01, .002, {
    bp: 2400,
    q: 1.2
  }), r + .027, .16, i);
  Se(o, dn(i, .2, [[712 * n, .05, 1], [1466 * n, .03, .4]], e), r + .03, .035, i);
  return Wo(ml(o, .46), 1.5);
}
function QR(i, e, t) {
  let n = o => {
    let r = ao(o);
    let a = St(i, 1.55);
    let l = t ? [[.058, .5, 4200], [.097, .4, 3300], [.139, .28, 2500], [.176, .2, 1900], [.262, .1, 1300]] : [[.066, .52, 4600], [.088, .34, 3600], [.124, .3, 2700], [.169, .22, 2e3], [.231, .12, 1400]];
    for (let [h, f, p] of l) Se(a, at(i, r, .09, .016, {
      hp: 420,
      lp: p
    }), h + Xt(r, -.004, .004), f * Xt(r, .8, 1.1), i);
    let c = Qn(i, 1.5, r);
    di(c, "lp", Vo(3400, 380, .6), .6, i);
    tn(c, "hp", 130, .7, i);
    Se(a, lo(c, i, co(.3, .05)), .03, .55, i);
    let u = Qn(i, 1.2, r);
    tn(u, "lp", 150, .7, i);
    Se(a, lo(u, i, co(.26, .03)), .02, .9, i);
    return a;
  };
  let s = Math.floor(e() * 1e9);
  return [n(s), n(s + 77)];
}
function* e8(i, e, t) {
  let n = function* (o) {
    let r = ao(o);
    let a = St(i, 2.3);
    let l = Qn(i, 2.25, r);
    di(l, "lp", Vo(2400, 260, .5), .7, i);
    Se(a, lo(l, i, co(.42, .012)), .008, .6, i);
    for (let [u, h] of [[54, 1], [81, .8], [117, .6], [163, .45], [228, .3]]) {
      let f = Qn(i, 2.2, r);
      tn(f, "bp", u * (t ? 1.06 : 1), 9, i);
      Se(a, lo(f, i, co(.5, .02)), .01, h * 2.4, i);
      yield;
    }
    let c = t ? .051 : .044;
    for (let u = 1; u < 9; u++) Se(a, at(i, r, .05, .009, {
      hp: 500,
      lp: 3800 / (1 + u * .35)
    }), c * u + Xt(r, -.003, .003), .42 * Math.pow(.74, u), i);
    return a;
  };
  let s = Math.floor(e() * 1e9);
  return [yield* n(s), yield* n(s + 131)];
}
function t8(i, e) {
  let t = St(i, .13);
  Se(t, dn(i, .05, [[2840, .004, 1], [4130, .004, .7], [6320, .003, .5], [1210, .008, .4]], e), 0, .7, i);
  Se(t, at(i, e, .006, .0012, {
    hp: 2e3
  }), 0, .6, i);
  Se(t, dn(i, .08, [[930, .018, 1], [1870, .012, .5]], e), .016, .16, i);
  Se(t, at(i, e, .004, .001, {
    hp: 3e3
  }), .018, .2, i);
  return t;
}
function e_(i, e, t, n, s, o) {
  let r = Qn(i, t, e);
  di(r, "bp", Vo(n, s), 1.6, i);
  let a = .5;
  let l = .5;
  for (let c = 0; c < r.length; c++) {
    c % Math.round(i / o) === 0 && (l = .25 + e() * .75);
    a += (l - a) * .02;
    let u = c / r.length;
    r[c] *= a * Math.sin(Math.PI * Math.pow(u, .7));
  }
  return r;
}
function n8(i, e) {
  let t = St(i, .46);
  Se(t, dn(i, .03, [[3300, .004, 1], [5100, .003, .6]], e), .004, .45, i);
  Se(t, at(i, e, .005, .001, {
    hp: 2500
  }), .004, .35, i);
  Se(t, e_(i, e, .17, 1700, 3400, 190), .03, .5, i);
  Se(t, at(i, e, .06, .012, {
    lp: 950
  }), .2, .8, i);
  Se(t, dn(i, .12, [[415, .03, 1], [1140, .018, .6], [2290, .01, .4], [3470, .006, .25]], e), .2, .42, i);
  Se(t, at(i, e, .08, .02, {
    bp: 2600,
    q: .8
  }), .215, .14, i);
  return t;
}
function i8(i, e) {
  let t = St(i, .5);
  Se(t, e_(i, e, .14, 1250, 2900, 240), 0, .55, i);
  Se(t, dn(i, .03, [[2600, .004, 1], [4300, .003, .5]], e), .05, .2, i);
  Se(t, ei(i, .07, 190, 88, .02, .022), .15, .8, i);
  Se(t, at(i, e, .05, .008, {
    lp: 1600
  }), .15, .8, i);
  Se(t, dn(i, .1, [[655, .024, 1], [1710, .014, .6], [3120, .008, .4]], e), .15, .4, i);
  Se(t, dn(i, .04, [[3650, .005, 1], [5600, .004, .6], [2100, .007, .5]], e), .187, .42, i);
  Se(t, at(i, e, .005, .001, {
    hp: 3e3
  }), .187, .36, i);
  return t;
}
function s8(i, e) {
  let t = St(i, .38);
  Se(t, dn(i, .03, [[2900, .005, 1], [4600, .004, .6]], e), 0, .3, i);
  Se(t, at(i, e, .03, .01, {
    bp: 2200,
    q: .8
  }), .004, .25, i);
  let n = .03;
  Se(t, at(i, e, .02, .004, {
    hp: 1200
  }), n, 1, i);
  Se(t, ei(i, .06, 230, 105, .012, .018), n, .8, i);
  Se(t, dn(i, .15, [[1310, .03, 1], [2460, .024, .8], [3920, .016, .6], [5640, .01, .45], [7900, .006, .3]], e), n, .36, i);
  Se(t, dn(i, .3, [[722, .075, 1], [1451, .05, .35]], e), n + .002, .1, i);
  return Wo(t, 1.3);
}
function o8(i, e, t) {
  let n = St(i, .55);
  let s = [1, 1.09, .93][t % 3];
  let o = 0;
  let r = 1;
  let a = 2 + (t !== 1 ? 1 : 0);
  for (let l = 0; l < a; l++) {
    let c = s * Xt(e, .96, 1.05);
    Se(n, dn(i, .22, [[4180 * c, Xt(e, .03, .055), 1], [6830 * c, .03, .7], [9760 * c, .02, .5], [11900 * c, .012, .3], [2470 * c, .012, .3]], e), o, r * .5, i);
    Se(n, at(i, e, .004, 8e-4, {
      hp: 3500
    }), o, r * .5, i);
    o += Xt(e, .085, .15) * (l ? .75 : 1);
    r *= Xt(e, .45, .62);
  }
  return n;
}
function r8(i, e, t) {
  let n = St(i, .3);
  let s = [1, 1.07, .94, 1.03][t & 3];
  Se(n, ei(i, .06, 112 * s, 58 * s, .018, .02, .002), 0, .75, i);
  Se(n, at(i, e, .06, .016, {
    lp: 720 * s
  }), 0, .9, i);
  Se(n, at(i, e, .1, .028, {
    bp: 2500 * s,
    q: .7,
    att: .004
  }), .012, .22, i);
  let o = at(i, e, .2, .05, {
    hp: 3800,
    att: .01
  });
  let r = 1;
  for (let a = 0; a < o.length; a++) {
    a % 70 === 0 && (r = .3 + e() * .7);
    o[a] *= r;
  }
  Se(n, o, .02, .16, i);
  return n;
}
function t_(i, e, t, n) {
  let s = St(i, t);
  let o = Qn(i, t * .9, e);
  di(o, "bp", Vo(1500, 520), .8, i);
  Se(s, lo(o, i, co(.085 * n, .007)), 0, .9, i);
  Se(s, at(i, e, t * .8, .07 * n, {
    hp: 3e3,
    att: .012
  }), .01, .25, i);
  let r = Math.round(5 * n);
  for (let a = 0; a < r; a++) {
    let l = Xt(e, 500, 1700);
    Se(s, jc(i, Xt(e, .008, .02), l, l * Xt(e, 1.3, 1.9)), Xt(e, .03, t * .6), Xt(e, .1, .3), i);
  }
  return s;
}
function a8(i, e, t) {
  let n = t_(i, e, .46, 1 + t * .08);
  Se(n, ei(i, .06, 100, 55, .02, .02, .002), 0, .5, i);
  return n;
}
function l8(i, e, t) {
  let n = St(i, .38);
  let s = [1, 1.08, .92][t % 3];
  Se(n, ei(i, .06, 120, 62, .018, .02, .002), 0, .6, i);
  Se(n, at(i, e, .04, .008, {
    lp: 2400
  }), 0, .6, i);
  Se(n, dn(i, .36, [[178 * s, .09, 1], [412 * s, .075, .8], [733 * s, .06, .55], [1214 * s, .045, .4], [1958 * s, .03, .3], [3130 * s, .016, .18]], e), .001, .3, i);
  Se(n, at(i, e, .08, .02, {
    bp: 3e3,
    q: .8,
    att: .003
  }), .01, .1, i);
  return n;
}
function c8(i, e) {
  let t = St(i, .45);
  Se(t, ei(i, .14, 124, 44, .03, .045, .002), 0, 1, i);
  Se(t, at(i, e, .14, .035, {
    lp: 520
  }), 0, 1, i);
  Se(t, at(i, e, .2, .06, {
    bp: 1500,
    q: .7,
    att: .01
  }), .01, .16, i);
  for (let n of [.022, .05, .088]) Se(t, at(i, e, .012, .003, {
    bp: Xt(e, 2200, 4200),
    q: 2
  }), n, Xt(e, .1, .22), i);
  Se(t, at(i, e, .2, .05, {
    hp: 3500,
    att: .01
  }), .015, .1, i);
  return Wo(t, 1.2);
}
function u8(i, e) {
  let t = St(i, .26);
  Se(t, at(i, e, .2, .05, {
    bp: 900,
    q: .7,
    att: .02
  }), 0, .6, i);
  Se(t, at(i, e, .1, .025, {
    bp: 2600,
    q: .8,
    att: .004
  }), .005, .35, i);
  Se(t, ei(i, .05, 95, 60, .02, .018, .003), 0, .4, i);
  return t;
}
function h8(i, e) {
  let t = St(i, .5);
  Se(t, ei(i, .25, 92, 38, .04, .06, .0015), 0, 1.1, i);
  Se(t, at(i, e, .2, .04, {
    lp: 320
  }), 0, 1.2, i);
  Se(t, at(i, e, .06, .01, {
    bp: 820,
    q: 1
  }), 0, .55, i);
  Se(t, at(i, e, .03, .004, {
    hp: 1800,
    lp: 5e3
  }), 0, .2, i);
  return Wo(t, 1.6);
}
function f8(i) {
  let e = St(i, 2.4);
  for (let t = 0; t < e.length; t++) {
    let n = t / i;
    e[t] = (Math.sin(vt * 3150 * n) + .7 * Math.sin(vt * 4013 * n + 1) + .35 * Math.sin(vt * 5310 * n + 2)) * (1 - Math.exp(-n / .12)) * Math.exp(-n / .55);
  }
  return e;
}
function d8(i, e, t) {
  let n = St(i, .5);
  let s = [640, 880, 745][t % 3] * Xt(e, .97, 1.03);
  Se(n, at(i, e, .015, .003, {
    hp: 1500
  }), 0, 1, i);
  Se(n, at(i, e, .04, .008, {
    lp: 1800
  }), 0, .6, i);
  Se(n, dn(i, .48, [1, 1.58, 2.24, 2.92, 3.71, 4.93, 6.31, 8.1].map((r, a) => [s * r, .13 / (1 + a * .55), 1 / (1 + a * .5)]), e), 5e-4, .42, i);
  return n;
}
function p8(i, e, t) {
  let n = St(i, .36);
  let s = [1, 1.1, .9][t % 3];
  Se(n, at(i, e, .06, .013, {
    lp: 950 * s
  }), 0, 1.1, i);
  Se(n, ei(i, .05, 150 * s, 70, .012, .016), 0, .6, i);
  Se(n, at(i, e, .012, .002, {
    hp: 2e3
  }), 0, .6, i);
  Se(n, at(i, e, .12, .024, {
    bp: 3500 * s,
    q: .7
  }), .003, .3, i);
  Se(n, Jc(i, e, .34, 16, {
    from: .03,
    fall: 1.8,
    hp: 1800,
    ampFall: .1
  }), 0, .35, i);
  return n;
}
function m8(i, e, t) {
  let n = St(i, .26);
  let s = t ? 1.14 : 1;
  Se(n, dn(i, .2, [[238 * s, .03, 1], [512 * s, .022, .8], [893 * s, .016, .6], [1410 * s, .01, .4]], e), 0, .6, i);
  Se(n, at(i, e, .03, .006, {
    lp: 2100
  }), 0, .8, i);
  Se(n, at(i, e, .01, .002, {
    hp: 3e3
  }), 0, .5, i);
  Se(n, Jc(i, e, .2, 6, {
    from: .01,
    fall: 2,
    bp: 2600,
    q: 1.5
  }), 0, .3, i);
  return n;
}
function g8(i, e, t) {
  let n = t_(i, e, .5, .8 + t * .2);
  Se(n, jc(i, .035, 420, 1150), 0, .5, i);
  return n;
}
function v8(i, e, t) {
  let n = St(i, .3);
  let s = [1, 1.12, .9][t % 3];
  Se(n, at(i, e, .03, .007, {
    hp: 4e3
  }), 0, .9, i);
  Se(n, dn(i, .12, [[2920 * s, .022, 1], [4730 * s, .018, .8], [7310 * s, .012, .6], [1180 * s, .03, .5]], e), 0, .4, i);
  Se(n, at(i, e, .05, .012, {
    bp: 320 * s,
    q: 1.5
  }), 0, .9, i);
  let o = Qn(i, .06, e);
  tn(o, "bp", 2400, 1, i);
  for (let r = 0; r < o.length; r++) {
    let a = r / i;
    o[r] *= (Math.sin(vt * 118 * a) > .2 ? 1 : .1) * Math.exp(-a / .02);
  }
  Se(n, o, .004, .5, i);
  Se(n, Jc(i, e, .28, 10, {
    from: .02,
    fall: 1.6,
    hp: 5e3,
    ampFall: .08
  }), 0, .3, i);
  return n;
}
function x8(i, e) {
  let t = St(i, .45);
  Se(t, at(i, e, .01, .002, {
    hp: 2500
  }), 0, 1, i);
  for (let n = 0; n < 9; n++) {
    let s = Xt(e, 3200, 9500);
    Se(t, dn(i, .1, [[s, Xt(e, .01, .03), 1], [s * 1.47, .01, .5]], e), Math.pow(e(), 2) * .3, Xt(e, .1, .35), i);
  }
  return t;
}
function y8(i, e, t) {
  let n = St(i, .75);
  let s = [3300, 2700, 3900][t % 3];
  let o = [820, 1100, 700][t % 3];
  let r = 0;
  let a = Qn(i, .75, e);
  for (let l = 0; l < n.length; l++) {
    let c = l / i;
    let u = o + (s - o) * Math.exp(-c / .16);
    let h = 1 + .035 * Math.sin(vt * (18 + 30 * c) * c);
    r += vt * u * h / i;
    n[l] = (Math.sin(r) + .3 * Math.sin(2 * r)) * (1 - Math.exp(-c / .004)) * Math.exp(-c / .19);
  }
  di(a, "bp", l => o + (s - o) * Math.exp(-l * .75 / .16), 6, i);
  Se(n, lo(a, i, co(.15, .003)), 0, 1.6, i);
  Se(n, at(i, e, .01, .002, {
    hp: 2500
  }), 0, .7, i);
  return n;
}
function b8(i, e, t) {
  let n = St(i, .3);
  let s = Qn(i, .28, e);
  let o = [5200, 4300, 6100][t % 3];
  let r = [1300, 1e3, 1700][t % 3];
  di(s, "bp", Vo(o, r, .8), 3.5, i);
  for (let l = 0; l < s.length; l++) {
    let c = (l / i - .05) / (l / i < .05 ? .018 : .05);
    s[l] *= Math.exp(-c * c);
  }
  Se(n, s, 0, 1, i);
  Se(n, at(i, e, .006, 8e-4, {
    hp: 3e3
  }), .048, .25, i);
  let a = jc(i, .2, o * .5, r * .6);
  Se(n, a, 0, .03, i);
  return n;
}
var Tv = (i, e) => Math.round(i * e) / e;
function* _8(i, e) {
  let n = i * 2;
  let s = new Float32Array(n);
  let o = [[184, 2.5], [207.5, 3.5], [233, 2], [258.5, 4.5]];
  for (let [l, c] of o) {
    let u = Tv(l, 2);
    let h = Tv(c, 2);
    let f = e() * vt;
    let p = e() * vt;
    for (let d = 0; d < n; d++) {
      let v = d / i;
      let g = vt * u * v + f;
      s[d] += (Math.sin(g) + .5 * Math.sin(2 * g + 1) + .3 * Math.sin(3 * g + 2) + .16 * Math.sin(4 * g) + .08 * Math.sin(6 * g)) * (.72 + .28 * Math.sin(vt * h * v + p)) * .25;
    }
    yield;
  }
  let r = Zc(i, 2, e, l => {
    tn(l, "hp", 1100, .7, i);
    tn(l, "lp", 5200, .7, i);
  }, .25);
  let a = Tv(46, 2);
  for (let l = 0; l < n; l++) s[l] += r[l] * (.55 + .45 * Math.sin(vt * a * l / i)) * .5;
  return s;
}
function M8(i, e) {
  let n = i * 2;
  let s = new Float32Array(n);
  for (let r = 0; r < n; r++) {
    let a = r / i;
    let l = 1.1 * Math.sin(vt * .5 * a) + .5 * Math.sin(vt * 1.5 * a + 1);
    let c = vt * 310 * a + l;
    let u = .7 + .3 * Math.sin(vt * 1.5 * a);
    let h = (Math.sin(c) + .45 * Math.sin(2 * c + l) + .2 * Math.sin(4 * c + .5)) * .3 * u;
    let f = vt * 62 * a;
    h += (Math.sin(f) + .5 * Math.sin(2 * f) + .33 * Math.sin(3 * f) + .2 * Math.sin(5 * f)) * .28;
    s[r] = h;
  }
  let o = Zc(i, 2, e, r => {
    tn(r, "hp", 2800, .7, i);
    tn(r, "lp", 7e3, .7, i);
  }, .25);
  for (let r = 0; r < n; r++) s[r] += o[r] * .12 * (.6 + .4 * Math.sin(vt * 1.5 * r / i + 2));
  return s;
}
function w8(i, e) {
  let n = i * 2;
  let s = new Float32Array(n);
  for (let r = 0; r < n; r++) {
    let a = r / i;
    let l = vt * 50 * a;
    s[r] = (Math.sin(l) * .5 + Math.sin(2 * l + .4) + .5 * Math.sin(3 * l + 1) + .3 * Math.sin(4 * l) + .22 * Math.sin(6 * l + 2) + .12 * Math.sin(10 * l)) * .3 * (.9 + .1 * Math.sin(vt * .5 * a)) + Math.sin(vt * 4100 * a) * .012 * (.6 + .4 * Math.sin(vt * 1 * a)) + Math.sin(vt * 1250 * a + .6 * Math.sin(vt * 2 * a)) * .02;
  }
  let o = Zc(i, 2, e, r => tn(r, "bp", 2100, 1.2, i), .25);
  for (let r = 0; r < n; r++) s[r] += o[r] * .16 * Math.pow(.5 + .5 * Math.sin(vt * 100 * r / i), 3);
  return s;
}
function E8(i, e, t) {
  let n = St(i, .3);
  let s = t ? 1.07 : 1;
  let o = 0;
  Se(n, at(i, e, .008, .0012, {
    hp: 3200
  }), 0, 1.1, i);
  let r = St(i, .12);
  for (let a = 0; a < r.length; a++) {
    let l = a / i;
    let c = (380 + 620 * Math.exp(-l / .018)) * s;
    o += c / i;
    let u = 2 * (o - Math.floor(o)) - 1;
    r[a] = (u + .5 * Math.sign(Math.sin(vt * o * 2.02))) * Math.exp(-l / .024);
  }
  tn(r, "bp", 1500 * s, .9, i);
  Se(n, r, 0, 1.5, i);
  Se(n, at(i, e, .08, .014, {
    bp: 2400 * s,
    q: 1.4
  }), 0, .7, i);
  Se(n, ei(i, .05, 240, 120, .012, .014), 0, .5, i);
  Se(n, dn(i, .05, [[3400 * s, .006, 1], [5200, .005, .6], [1900, .008, .5]], e), .021, .2, i);
  Se(n, at(i, e, .15, .04, {
    hp: 6e3
  }), .002, .1, i);
  return Wo(ml(n, .6), 1.6);
}
function S8(i, e, t) {
  let n = St(i, .48);
  let s = t ? .94 : 1;
  Se(n, at(i, e, .012, .002, {
    hp: 1500,
    lp: 6e3
  }), 0, .7, i);
  Se(n, ei(i, .3, 112 * s, 37 * s, .035, .07), 0, 1.4, i);
  Se(n, at(i, e, .3, .045, {
    hp: 90,
    lp: 900 * s
  }), 0, 1.2, i);
  Se(n, at(i, e, .12, .024, {
    bp: 420 * s,
    q: 1.6
  }), 0, 1.2, i);
  Se(n, dn(i, .12, [[310 * s, .03, 1], [642 * s, .022, .7], [985 * s, .016, .5], [2200, .006, .3]], e), .055, .3, i);
  Se(n, at(i, e, .02, .004, {
    bp: 1800,
    q: 1
  }), .055, .25, i);
  return Wo(ml(n, .42), 1.8);
}
function T8(i, e, t) {
  let n = St(i, .42);
  let s = [1, 1.07, .93][t % 3];
  Se(n, jc(i, .035, 920 * s, 610 * s), 0, .06, i);
  let o = .03;
  Se(n, ei(i, .2, 84 * s, 41, .03, .05, .002), o, 1.1, i);
  Se(n, at(i, e, .12, .03, {
    lp: 360
  }), o, 1.1, i);
  Se(n, at(i, e, .03, .006, {
    lp: 2600,
    hp: 500
  }), o, .4, i);
  Se(n, dn(i, .12, [[522 * s, .026, 1], [1133 * s, .02, .7], [1871 * s, .014, .5], [3040 * s, .008, .3]], e), o, .2, i);
  Se(n, at(i, e, .14, .04, {
    hp: 3e3,
    att: .006
  }), o + .01, .06, i);
  return Wo(n, 1.5);
}
function A8(i, e) {
  let t = St(i, 1.5);
  let n = [0, 0, 0, 0];
  Se(t, at(i, e, .02, .004, {
    hp: 2500
  }), 0, .9, i);
  let s = [184, 207, 233, 258];
  for (let a = 0; a < Math.round(1.1 * i); a++) {
    let l = a / i;
    let c = Math.pow(.16, l / 1) * (1 + .06 * Math.sin(vt * (9 - 5 * l) * l));
    let u = 0;
    for (let f = 0; f < 4; f++) {
      n[f] += vt * s[f] * c / i;
      u += Math.sin(n[f]) + .5 * Math.sin(2 * n[f]) + .3 * Math.sin(3 * n[f]);
    }
    let h = .6 + .4 * Math.sign(Math.sin(vt * (26 - 16 * l) * l));
    t[a] += u * .16 * h * Math.exp(-l / .55) * (1 - Math.exp(-l / .01));
  }
  let o = Qn(i, 1, e);
  di(o, "bp", Vo(3200, 500), 1, i);
  Se(t, lo(o, i, co(.35, .01)), 0, .3, i);
  let r = .72;
  Se(t, at(i, e, .2, .035, {
    lp: 3e3
  }), r, 1, i);
  Se(t, ei(i, .12, 130, 55, .02, .035), r, .8, i);
  Se(t, dn(i, .4, [[705, .07, 1], [1490, .05, .7], [2610, .035, .5], [4020, .02, .3]], e), r, .28, i);
  Se(t, Jc(i, e, .7, 26, {
    from: .02,
    fall: 1.7,
    hp: 1500,
    ampFall: .2,
    maxLen: .008
  }), r, .5, i);
  Se(t, dn(i, .2, [[1900, .03, 1], [3350, .02, .6]], e), r + .19, .14, i);
  return Wo(t, 1.4);
}
function R8(i, e) {
  let t = St(i, 1.9);
  let n = 0;
  let s = 0;
  let o = St(i, 1.3);
  for (let r = 0; r < o.length; r++) {
    let a = r / i;
    let l = 30 + 112 * Math.pow(1 - a / 1.3, 1.6);
    n += l / i;
    s += (180 + 1050 * Math.exp(-a / .3)) / i;
    o[r] = (2 * (n - Math.floor(n)) - 1) * (1 - Math.exp(-a / .02)) * Math.pow(1 - a / 1.3, .7) + Math.sin(vt * s) * .25 * Math.exp(-a / .4);
  }
  di(o, "lp", Vo(1100, 160), 2.5, i);
  Se(t, o, 0, .55, i);
  Se(t, at(i, e, .03, .006, {
    hp: 2e3
  }), 0, .5, i);
  for (let [r, a, l] of [[.62, 1, 1], [.84, .75, 1.22], [.98, .5, .86], [1.17, .42, 1.4], [1.33, .22, 1.1]]) {
    Se(t, ei(i, .1, 105 * l, 48, .02, .035), r, a * .9, i);
    Se(t, at(i, e, .08, .016, {
      lp: 2400
    }), r, a * .8, i);
    Se(t, dn(i, .3, [[388 * l, .07, 1], [861 * l, .05, .7], [1540 * l, .035, .5], [2750 * l, .02, .35]], e), r, a * .3, i);
  }
  Se(t, Jc(i, e, 1, 22, {
    from: 0,
    fall: 1.2,
    hp: 1800,
    ampFall: .4,
    maxLen: .007
  }), .62, .3, i);
  return Wo(ml(t, .55), 1.5);
}
function C8(i, e, t) {
  let n = St(i, .52);
  let s = t ? 622 : 1320;
  let o = s * 1.4142;
  let r = 0;
  let a = (l, c, u, h) => {
    let f = Math.round(c * i);
    let p = Math.round(l * i);
    for (let d = 0; d < f; d++) {
      let v = d / f;
      let g = d / i;
      r += vt * u * (1 + h * v) / i;
      let x = Math.sin(r + 1.6 * Math.sin(r * .25) + .4 * Math.sin(vt * 71 * g));
      n[p + d] += Math.tanh(x * 2.2) * Math.min(1, d / (.004 * i), (f - d) / (.012 * i));
    }
  };
  a(0, .09, s, 0);
  a(.12, .17, o, -.05);
  t && a(.3, .2, s * .5, .5);
  tn(n, "bp", t ? 1100 : 2100, .6, i);
  Se(n, at(i, e, .4, .2, {
    hp: 4e3,
    att: .02
  }), 0, .03, i);
  return n;
}
function P8(i, e, t) {
  let n = St(i, .6);
  let s = n.length;
  let o = .55;
  let r = 0;
  let a = 0;
  for (let c = 0; c < s; c++) {
    let u = c / i;
    let h = Math.min(1, u / o);
    let f = Math.pow(h, 1.4) * (u < o ? 1 : Math.exp(-(u - o) / .008));
    if (t) {
      r += (170 + 380 * h * h) / i;
      a += (680 + 900 * h) / i;
      let p = 2 * (r - Math.floor(r)) - 1;
      n[c] = (p * (.7 + .3 * Math.sin(vt * 38 * u)) + .35 * Math.sin(vt * a)) * f;
    } else {
      r += (620 + 1900 * h * h * h) / i;
      a += (1240 + 3800 * h * h * h) * 1.003 / i;
      n[c] = (Math.sin(vt * r) + .4 * Math.sin(vt * a) + .25 * Math.sign(Math.sin(vt * r * .5))) * f * (.8 + .2 * Math.sin(vt * (20 + 60 * h) * u));
    }
  }
  tn(n, "lp", t ? 2600 : 7e3, .7, i);
  tn(n, "hp", t ? 120 : 400, .7, i);
  let l = t ? 7 : 5;
  for (let c = 0; c < l; c++) {
    let u = o * Math.sqrt(c / l);
    Se(n, dn(i, .03, [[t ? 1500 : 3800, .004, 1], [t ? 2600 : 6100, .003, .6]], e), u, .12 + .2 * c / l, i);
  }
  return n;
}
function I8(i, e, t) {
  let n = St(i, 3);
  let s = t ? .9 : 1;
  Se(n, at(i, e, .03, .006, {
    hp: 1500
  }), 0, 1.8, i);
  Se(n, ei(i, 1.6, 96 * s, 27, .16, .36, .001), 0, .85, i);
  let o = Qn(i, 1.6, e);
  di(o, "lp", Vo(2800, 260, .5), .7, i);
  Se(n, lo(o, i, co(.26, .002)), 0, 3.2, i);
  let r = Qn(i, 2.6, e);
  tn(r, "lp", 120, .7, i);
  Se(n, lo(r, i, co(.7, .03)), 0, 2.2, i);
  Se(n, at(i, e, .5, .09, {
    bp: 520 * s,
    q: 1.2
  }), 0, 1.3, i);
  Se(n, Jc(i, e, 2.5, 120, {
    from: .25,
    fall: 1.5,
    hp: 1500,
    lp: 9e3,
    ampFall: .8,
    maxLen: .01
  }), 0, .5, i);
  for (let a = 0; a < 7; a++) {
    let l = Xt(e, 900, 3600);
    Se(n, dn(i, .2, [[l, Xt(e, .02, .06), 1], [l * 1.61, .02, .5]], e), Xt(e, .4, 1.9), Xt(e, .03, .09), i);
  }
  return Wo(ml(n, .36), 1.7);
}
function z8(i, e) {
  let t = St(i, 1.7);
  Se(t, at(i, e, .01, .002, {
    hp: 2500
  }), 0, 1, i);
  let n = Qn(i, .5, e);
  tn(n, "bp", 3e3, .8, i);
  let s = 1;
  for (let l = 0; l < n.length; l++) {
    let c = l / i;
    l % 220 === 0 && (s = e() < .55 + .4 * (1 - c / .5) ? 1 : 0);
    n[l] = (n[l] * (Math.sin(vt * 100 * c) > -.2 ? 1 : .15) + .35 * Math.sign(Math.sin(vt * 100 * c)) * (e() - .3)) * s * Math.exp(-c / .3);
  }
  Se(t, n, .005, .8, i);
  let o = St(i, 1.25);
  let r = 0;
  let a = 0;
  for (let l = 0; l < o.length; l++) {
    let c = l / i;
    let u = Math.pow(.22, c / 1.2);
    r += vt * 100 * u / i;
    a += vt * (150 + 1900 * Math.pow(1 - c / 1.25, 2.2)) / i;
    o[l] = ((Math.sin(r) + .6 * Math.sin(2 * r) + .4 * Math.sin(3 * r) + .25 * Math.sin(5 * r)) * .5 + Math.sin(a) * .22) * Math.pow(1 - c / 1.25, 1.2) * (1 - Math.exp(-c / .03));
  }
  Se(t, o, .4, .8, i);
  Se(t, ei(i, .12, 140, 60, .03, .04), .4, .5, i);
  return Wo(t, 1.3);
}
function* D8(i, e, t) {
  let n = St(i, 6.5);
  let s = Qn(i, 6.4, e);
  yield;
  di(s, "lp", Vo(t ? 520 : 380, 70, .6), .7, i);
  yield;
  let o = [];
  for (let a = 0; a < 9; a++) o.push([Xt(e, .05, 3.6), Xt(e, .12, .5), Xt(e, .4, 1)]);
  for (let a = 0; a < s.length; a++) {
    let l = a / i;
    let c = 0;
    for (let [u, h, f] of o) {
      let p = (l - u) / h;
      c += f * Math.exp(-p * p);
    }
    s[a] *= (.25 + c) * Math.exp(-l / 1.9) * (1 - Math.exp(-l / .05));
  }
  Se(n, s, 0, 1, i);
  yield;
  let r = Qn(i, 6, e);
  tn(r, "bp", 48, 1.2, i);
  Se(n, lo(r, i, co(2, .2)), .05, 3, i);
  t && Se(n, at(i, e, .3, .06, {
    hp: 300,
    lp: 2500
  }), .02, .25, i);
  return n;
}
var jb = [0, 1, .435, .268, .19, .145, .116, .097];
function L8(i, e) {
  let t = St(i, 5);
  let n = t.length;
  for (let s = 0; s < n; s++) {
    let o = s / i;
    let r = .0025 * Math.sin(vt * 4.3 * o);
    let a = Math.min(1, o / .45) * Math.min(1, (5 - o) / 1.5) * (o < 3.2 ? 1 : Math.exp(-(o - 3.2) / .7));
    let l = 0;
    for (let c = 1; c <= 7; c++) l += Math.sin(vt * 92.5 * c * o * (1 + r) + c) * jb[c];
    for (let c = 1; c <= 4; c++) l += .45 * Math.sin(vt * 138.6 * c * o + c * 2) * jb[c];
    t[s] = l * a;
  }
  tn(t, "lp", 520, .7, i);
  return t;
}
function k8(i, e, t) {
  let n = St(i, 1.4);
  let s = t ? 3 : 4;
  let o = .02;
  for (let r = 0; r < s; r++) {
    let a = Xt(e, .17, .26) * (t ? 1.4 : 1);
    let l = Math.round(a * i);
    let c = Math.round(o * i);
    let u = (t ? 1250 : 1550) * (1 - r * .04);
    let h = 0;
    for (let f = 0; f < l && c + f < n.length; f++) {
      let p = f / l;
      let d = u * (1 + .55 * Math.sin(Math.PI * Math.pow(p, .6)) - .25 * p);
      h += vt * d / i;
      let v = 1 + .3 * Math.sin(vt * 63 * f / i);
      n[c + f] += (Math.sin(h) + .6 * Math.sin(2 * h + .5) + .35 * Math.sin(3 * h) + .15 * Math.sin(4 * h)) * v * Math.pow(Math.sin(Math.PI * p), .7) * (1 - r * .14);
    }
    o += a + Xt(e, .05, .12);
  }
  tn(n, "lp", 4200, .7, i);
  return n;
}
function F8(i, e, t) {
  let n = St(i, 1.1);
  let s = t ? 1.19 : 1;
  let o = .01;
  let r = t ? 3 : 4;
  for (let a = 0; a < r; a++) {
    Se(n, dn(i, .5, [[2310 * s, Xt(e, .06, .13), 1], [3740 * s, .07, .7], [5910 * s, .04, .5], [8130 * s, .025, .3], [1012 * s, .03, .3]], e), o, Xt(e, .35, 1), i);
    Se(n, at(i, e, .004, .001, {
      hp: 3e3
    }), o, .3, i);
    o += Xt(e, .09, .26);
  }
  return n;
}
function U8(i, e) {
  let t = St(i, 2.8);
  let n = St(i, 2.2);
  Se(n, dn(i, 2.2, [[47, .7, 1], [77, .55, .9], [121, .4, .7], [163, .3, .5], [214, .22, .4], [330, .12, .25]], e), 0, .5, i);
  Se(n, at(i, e, .5, .11, {
    lp: 420
  }), 0, 1, i);
  Se(t, n, 0, 1, i);
  Se(t, n, .36, .3, i);
  Se(t, n, .61, .12, i);
  return t;
}
function N8(i, e) {
  let t = St(i, .09);
  Se(t, dn(i, .08, [[1820, .009, 1], [2730, .007, .6], [640, .012, .5]], e), 0, 1, i);
  Se(t, at(i, e, .004, .001, {
    hp: 2500
  }), 0, .5, i);
  return t;
}
function B8(i, e) {
  let t = St(i, .06);
  Se(t, dn(i, .05, [[3200, .008, 1], [4800, .005, .3]], e), 0, 1, i);
  return t;
}
function* O8(i, e) {
  let n = function* (s) {
    let o = Zc(i, 6, s, u => {
      tn(u, "hp", 900, .6, i);
      tn(u, "lp", 8500, .6, i);
    });
    yield;
    let r = Zc(i, 6, s, u => {
      tn(u, "bp", 420, .5, i);
    });
    let a = o.length;
    let l = Q1(a, [o, .5], [r, .75]);
    let c = new Float32Array(a);
    for (let u = 0; u < 1020; u++) {
      let h = Math.floor(s() * a);
      let f = Math.round(Xt(s, 6e-4, .003) * i);
      let p = Math.pow(s(), 3) * 1.6 + .15;
      for (let d = 0; d < f; d++) {
        c[h] += (s() * 2 - 1) * p * Math.exp(-5 * d / f);
        ++h >= a && (h = 0);
      }
    }
    yield;
    di(c, "hp", () => 2200, .7, i, 2);
    yield;
    for (let u = 0; u < 30; u++) {
      let h = Xt(s, 700, 2100);
      Us(c, jc(i, Xt(s, .008, .02), h, h * 1.7), s() * 6, Xt(s, .08, .3), i);
    }
    for (let u = 0; u < a; u++) l[u] += c[u] * .55;
    return l;
  };
  return [yield* n(ao(Math.floor(e() * 1e9))), yield* n(ao(Math.floor(e() * 1e9)))];
}
function* H8(i, e) {
  let n = function* (s) {
    let o = Zc(i, 6, s, c => {
      tn(c, "lp", 1300, .6, i);
      tn(c, "hp", 110, .7, i);
    });
    let r = o.length;
    let a = new Float32Array(r);
    for (let c = 0; c < 1560; c++) a[Math.floor(s() * r)] += (s() * 2 - 1) * (.2 + Math.pow(s(), 4) * 3);
    let l = Q1(r, [o, .8]);
    for (let [c, u, h] of [[1820, 14, 1], [2740, 16, .8], [4150, 18, .6], [6200, 14, .35], [940, 8, .7]]) {
      let f = Float32Array.from(a);
      di(f, "bp", () => c, u, i, 2);
      for (let p = 0; p < r; p++) l[p] += f[p] * h * 5;
      yield;
    }
    for (let c = 0; c < 4; c++) {
      let u = Xt(s, 900, 1600);
      Us(l, jc(i, .014, u, u * 1.8), s() * 6, .25, i);
    }
    return l;
  };
  return [yield* n(ao(Math.floor(e() * 1e9))), yield* n(ao(Math.floor(e() * 1e9)))];
}
function V8(i, e) {
  let s = Qn(i, 8.5, e);
  let o = Float32Array.from(s);
  di(s, "bp", r => {
    let a = r * 8.5;
    return 380 + 190 * Math.sin(vt * a / 8) + 90 * Math.sin(vt * a / 2.667 + 1);
  }, 1.3, i);
  di(o, "bp", r => {
    let a = r * 8.5;
    return 1350 + 260 * Math.sin(vt * a / 4 + 2);
  }, 9, i);
  for (let r = 0; r < s.length; r++) {
    let a = r / i;
    s[r] = s[r] * (.7 + .3 * Math.sin(vt * a / 8 + .5)) + o[r] * .22 * Math.pow(.5 + .5 * Math.sin(vt * a / 4 + 1), 2);
  }
  return Rv(s, i * 8, true);
}
function* W8(i, e) {
  let s = Qn(i, 8.5, e);
  let o = Qn(i, 8 + .5, e);
  let r = Qn(i, 8 + .5, e);
  yield;
  tn(s, "lp", 1100, .6, i);
  tn(s, "hp", 70, .7, i);
  tn(o, "hp", 2400, .7, i);
  tn(r, "bp", 520, 1.2, i);
  yield;
  for (let a = 0; a < s.length; a++) {
    let l = a / i;
    let c = l % 4 / 4;
    let u = Math.pow(.5 - .5 * Math.cos(vt * c), 1.5);
    let h = Math.exp(-Math.pow((c - .5) / .05, 2));
    let f = Math.exp(-Math.pow((c - .68) / .16, 2));
    let p = .5 - .5 * Math.cos(vt * ((l + 1.3) % 2.667) / 2.667);
    s[a] = s[a] * (.3 + .7 * u + .25 * p) + r[a] * h * 1.8 + o[a] * f * .35;
  }
  return Rv(s, i * 8, true);
}
export { A8, B8, C8, D8, E8, F8, H8, I8, KR, L8, M8, N8, O8, P8, QR, R8, S8, T8, U8, V8, W8, _8, a8, b8, c8, d8, e8, f8, g8, h8, i8, k8, l8, m8, n8, o8, p8, r8, s8, t8, u8, v8, w8, x8, y8, z8 };
