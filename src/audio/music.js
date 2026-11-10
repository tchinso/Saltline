import { Av, Ns, Q1, Qn, Se, St, Us, Vo, Wo, Xt, ao, at, co, di, dn, ei, em, lo, tn, vt } from './synthesis.js';
var Fr = {
  bpm: 100,
  bar: 2.4,
  loopBars: 8,
  sr: 32e3
};
var Cv = [{
  root: 38,
  tones: [0, 3, 7, 12, 10],
  base: 50
}, {
  root: 34,
  tones: [0, 4, 7, 12, 11],
  base: 46
}, {
  root: 31,
  tones: [0, 3, 7, 12, 10],
  base: 43
}, {
  root: 33,
  tones: [0, 5, 7, 12, 10],
  base: 45
}];
function Jb(i, e, t, n, s, o, r) {
  let a = Math.round((t + s) * i);
  let l = new Float32Array(a);
  let c = [r(), r(), r()];
  let u = [1 - o, 1, 1 + o * 1.1];
  for (let h = 0; h < a; h++) {
    let f = h / i;
    let p = 0;
    for (let v = 0; v < 3; v++) {
      c[v] += e * u[v] / i;
      c[v] -= Math.floor(c[v]);
      p += 2 * c[v] - 1;
    }
    let d = f < t ? 1 - Math.exp(-f / n) : (1 - Math.exp(-t / n)) * Math.exp(-(f - t) / (s * .3));
    l[h] = p * d * .33;
  }
  em(l, i, 0, .1);
  return l;
}
function* G8(i, e) {
  let t = Fr.bar * 8;
  let n = Math.round(t * i);
  let s = function* (o) {
    let r = new Float32Array(n);
    for (let a = 0; a < 4; a++) {
      let l = Cv[a];
      let c = a * 4.8;
      for (let [u, h] of [[0, 1], [7, .6], [12, .5], [l.tones[1] + 12, .28]]) {
        Us(r, Jb(i, Ns(l.root + u), 4.6, 1.3, 1.8, .0035, o), c - .5, h * .3, i);
        yield;
      }
    }
    Us(r, Jb(i, Ns(26), t - .2, 2.5, .2, .002, o), .1, .16, i);
    yield;
    di(r, "lp", a => 560 + 300 * Math.sin(vt * a * 2) + 120 * Math.sin(vt * a * 5 + 1), .9, i, 2);
    yield;
    return r;
  };
  return [yield* s(ao(Math.floor(e() * 1e9))), yield* s(ao(Math.floor(e() * 1e9)))];
}
function n_(i, e, t) {
  let n = Math.round(.42 * i);
  let s = new Float32Array(n);
  let o = 0;
  let r = 0;
  let a = 0;
  let l = 0;
  let c = 0;
  for (let u = 0; u < n; u++) {
    let h = u / i;
    o += e / i;
    o -= Math.floor(o);
    r += e * .5 / i;
    r -= Math.floor(r);
    let f = 2 * o - 1 + .4 * (r < .5 ? 1 : -1);
    (u & 15) === 0 && (c = 1 - Math.exp(-vt * (300 + 2600 * t * Math.exp(-h / .06)) / i));
    a += (f - a) * c;
    l += (a - l) * c;
    s[u] = l * Math.exp(-h / .1) * Math.min(1, u / 40);
  }
  return em(s, i, 0, .03);
}
function* q8(i) {
  let e = Fr.bar * 8;
  let t = new Float32Array(Math.round(e * i));
  let n = [0, 0, 2, 0, 1, 0, 2, 0, 3, 0, 2, 0, 1, 0, 4, 2];
  let s = [1, .45, .7, .45, .85, .45, .7, .5, 1, .45, .7, .45, .85, .5, .8, .6];
  for (let o = 0; o < 128; o++) {
    let r = Cv[o >> 5 & 3];
    let a = o & 15;
    let l = n_(i, Ns(r.base + r.tones[n[a]]), s[a]);
    Us(t, l, o * .15, .5 * (.5 + .5 * s[a]), i);
    Us(t, l, o * .15 + .45, .14, i);
    (o & 7) === 7 && (yield);
  }
  return t;
}
function* X8(i, e) {
  let t = Fr.bar * 4;
  let n = new Float32Array(Math.round(t * i));
  let s = () => Q1(Math.round(.9 * i), [ei(i, .9, 74, 34, .07, .24, .002), 1], [at(i, e, .4, .07, {
    lp: 240
  }), 1.2], [at(i, e, .05, .008, {
    bp: 1400,
    q: .8
  }), .25]);
  let o = a => Q1(Math.round(.5 * i), [ei(i, .5, a, a * .55, .05, .12, .002), 1], [at(i, e, .1, .02, {
    lp: 600
  }), .5]);
  let r = a => at(i, e, .06, .008 + a * .01, {
    hp: 6500
  });
  for (let a = 0; a < 4; a++) {
    let l = a * 2.4;
    Us(n, s(), l, 1, i);
    Us(n, o(104), l + 1.5, .55, i);
    a % 2 === 1 && Us(n, s(), l + 2.1, .6, i);
    for (let c = 0; c < 16; c++) Us(n, r(c % 4 === 2 ? 1 : 0), l + c * .15, c % 4 === 2 ? .34 : c % 2 ? .11 : .2, i);
    yield;
  }
  for (let [a, l] of [[12, 120], [13, 104], [14, 88], [15, 74]]) Us(n, o(l), 7.2 + a * .15, .6, i);
  return Wo(n, 1.3);
}
function $c(i, e, t) {
  let n = Math.round(t * i);
  let s = new Float32Array(n);
  let o = 0;
  let r = 0;
  let a = 0;
  let l = 0;
  let c = null;
  for (let u = 0; u < n; u++) {
    let h = u / i;
    let f = u / n;
    let p = Math.pow(Math.sin(Math.PI * Math.pow(f, .8)), 1.5);
    let d = 1 + .004 * Math.sin(vt * 5.1 * h) * Math.min(1, h);
    o += e * d / i;
    o -= Math.floor(o);
    r += e * 1.004 * d / i;
    r -= Math.floor(r);
    (u & 31) === 0 && (c = Av("lp", 240 + 1700 * p * p, 1.1, i));
    let v = 2 * o - 1 + (2 * r - 1);
    let g = c[0] * v + a;
    a = c[1] * v - c[3] * g + l;
    l = c[2] * v - c[4] * g;
    s[u] = g * p * .5;
  }
  return s;
}
function* Y8(i) {
  let e = Fr.bar * 8;
  let t = new Float32Array(Math.round(e * i));
  for (let n = 0; n < 4; n++) {
    let s = Cv[n];
    for (let [o, r] of [[12, 1], [19, .7], [24 + s.tones[1], .5], [24, .4]]) {
      Us(t, $c(i, Ns(s.root + o), 4.7), n * 4.8 + .05, r * .3, i);
      yield;
    }
  }
  return t;
}
function Pf(i, e, t) {
  let n = dn(i, t, [[e, t * .3, 1], [e * 2.003, t * .18, .4], [e * 3.01, t * .1, .18], [e * 4.2, t * .05, .1], [e * .5, t * .3, .25]]);
  let s = Math.round(.006 * i);
  for (let o = 0; o < s; o++) n[o] *= o / s;
  return em(n, i, 0, .2);
}
function* $8(i) {
  let e = Fr.bar * 8;
  let t = new Float32Array(Math.round(e * i));
  let n = (s, o, r) => {
    let a = Pf(i, Ns(o), 3.2);
    Us(t, a, s, r, i);
    Us(t, a, s + .45, r * .28, i);
    Us(t, a, s + .9, r * .1, i);
  };
  for (let [s, o] of [[0, 62], [.9, 69], [1.8, 70], [3, 65]]) {
    n(s, o, .5);
    yield;
  }
  for (let [s, o] of [[0, 62], [.9, 69], [1.8, 72], [3, 67]]) {
    n(9.6 + s, o, .42);
    yield;
  }
  return t;
}
function* Z8(i) {
  let e = St(i, 2.8);
  [57, 62, 65, 69].forEach((t, n) => {
    Se(e, Pf(i, Ns(t), 1.6), n * .15, .45 + n * .08, i);
    Se(e, n_(i, Ns(t), 1), n * .15, .3, i);
  });
  Se(e, ei(i, .8, 73.4, 36.7, .1, .25, .002), .45, .7, i);
  for (let t of [50, 57, 62, 64]) {
    Se(e, $c(i, Ns(t), 2.2), .45, .14, i);
    yield;
  }
  return e;
}
function* j8(i) {
  let e = St(i, 4.2);
  Se(e, ei(i, 1, 73.4, 36.7, .1, .3, .002), 0, .9, i);
  Se(e, ei(i, 1, 73.4, 36.7, .1, .3, .002), .6, .7, i);
  for (let t of [50, 57, 62, 65]) {
    Se(e, $c(i, Ns(t), 1.5), 0, .16, i);
    yield;
  }
  for (let t of [48, 55, 60, 64]) {
    Se(e, $c(i, Ns(t), 1.4), .6, .16, i);
    yield;
  }
  for (let t of [50, 57, 62, 65, 69]) {
    Se(e, $c(i, Ns(t), 2.9), 1.2, .17, i);
    yield;
  }
  [62, 65, 69, 74].forEach((t, n) => Se(e, Pf(i, Ns(t), 2), 1.2 + n * .15, .4, i));
  return e;
}
function* J8(i) {
  let e = St(i, 6);
  Se(e, ei(i, 1.4, 73.4, 36.7, .15, .4, .003), 0, .9, i);
  for (let [t, n] of [[38, 1], [50, .8], [57, .7], [62, .7], [66, .7], [69, .5]]) {
    Se(e, $c(i, Ns(t), 5.6), 0, .14 * n, i);
    yield;
  }
  [62, 66, 69, 74, 78, 81].forEach((t, n) => {
    Se(e, Pf(i, Ns(t), 3), .3 + n * .3, .42, i);
    Se(e, Pf(i, Ns(t), 3), .75 + n * .3, .12, i);
  });
  return e;
}
function K8(i, e) {
  let t = St(i, 3.8);
  let n = t.length;
  let s = [0, 0, 0];
  for (let o = 0; o < n; o++) {
    let r = o / i;
    let a = Math.pow(2, -1.1 * Math.pow(r / 3.8, .7));
    let l = 0;
    [73.42, 110, 146.83].forEach((c, u) => {
      s[u] += c * a * (1 + u * .002) / i;
      s[u] -= Math.floor(s[u]);
      l += (2 * s[u] - 1) * (u === 1 ? .6 : 1);
    });
    t[o] = l * .3 * Math.pow(1 - r / 3.8, 1.3) * (1 - Math.exp(-r / .01));
  }
  di(t, "lp", Vo(1500, 110, .7), 1.2, i);
  Se(t, ei(i, 1.2, 82, 30, .12, .35, .002), 0, 1, i);
  Se(t, at(i, e, .3, .06, {
    lp: 300
  }), 0, .8, i);
  return t;
}
function Q8(i, e) {
  let t = (n, s) => {
    let o = St(i, 1.4);
    let r = [[.062, .55], [.089, .42], [.118, .36], [.151, .26], [.178, .2], [.243, .1]];
    for (let [l, c] of r) Se(o, at(i, n, .01, .0018, {
      hp: 700,
      lp: 5500
    }), l * (s ? 1.07 : .96) + Xt(n, 0, .006), c * Xt(n, .6, 1.15), i);
    let a = Qn(i, 1.3, n);
    tn(a, "hp", 300, .7, i);
    di(a, "lp", Vo(6e3, 900, .6), .7, i);
    Se(o, lo(a, i, co(.27, .04)), .04, .045, i);
    return o;
  };
  return [t(ao(Math.floor(e() * 1e9)), 0), t(ao(Math.floor(e() * 1e9)), 1)];
}
function eC(i, e) {
  let t = (n, s) => {
    let o = St(i, 2.2);
    let r = Qn(i, 2.18, n);
    di(r, "lp", Vo(5200, 650, .5), .7, i);
    Se(o, lo(r, i, co(.33, .006)), .012, .3, i);
    let a = Qn(i, 2.1, n);
    tn(a, "lp", 260, .7, i);
    Se(o, lo(a, i, co(.4, .01)), .012, .5, i);
    for (let [l, c] of [[.018, .7], [.031, .55], [.047, .45], [.093, .3], [.139, .2]]) Se(o, at(i, n, .008, .0015, {
      lp: 4500
    }), l * (s ? 1.09 : .95), c, i);
    return o;
  };
  return [t(ao(Math.floor(e() * 1e9)), 0), t(ao(Math.floor(e() * 1e9)), 1)];
}
export { $8, Fr, G8, J8, K8, Q8, X8, Y8, Z8, eC, j8, q8 };
