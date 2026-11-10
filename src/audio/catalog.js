import { A8, B8, C8, D8, E8, F8, H8, I8, KR, L8, M8, N8, O8, P8, QR, R8, S8, T8, U8, V8, W8, _8, a8, b8, c8, d8, e8, f8, g8, h8, i8, k8, l8, m8, n8, o8, p8, r8, s8, t8, u8, v8, w8, x8, y8, z8 } from './sounds.js';
import { $8, Fr, G8, J8, K8, Q8, X8, Y8, Z8, eC, j8, q8 } from './music.js';
import { Kb, Qb, ao, em, ml } from './synthesis.js';
var ki = 44100;
var Xn = 32e3;
var pl = 22050;
var Go = {
  rifle_shot: {
    gen: KR,
    n: 4,
    sr: ki,
    peak: .97,
    bus: "near",
    max: 5,
    pri: 9,
    boot: 1
  },
  rifle_tail_out: {
    gen: QR,
    n: 2,
    sr: Xn,
    peak: .5,
    bus: "dry",
    max: 3,
    pri: 8,
    boot: 1
  },
  rifle_tail_in: {
    gen: e8,
    n: 2,
    sr: Xn,
    peak: .62,
    bus: "dry",
    max: 3,
    pri: 8,
    boot: 1
  },
  rifle_dry: {
    gen: t8,
    n: 1,
    sr: ki,
    peak: .5,
    bus: "near",
    max: 2,
    pri: 6,
    boot: 1
  },
  reload_magout: {
    gen: n8,
    n: 1,
    sr: ki,
    peak: .6,
    bus: "near",
    max: 2,
    pri: 6
  },
  reload_magin: {
    gen: i8,
    n: 1,
    sr: ki,
    peak: .65,
    bus: "near",
    max: 2,
    pri: 6
  },
  reload_bolt: {
    gen: s8,
    n: 1,
    sr: ki,
    peak: .8,
    bus: "near",
    max: 2,
    pri: 6
  },
  shell_bounce: {
    gen: o8,
    n: 3,
    sr: ki,
    peak: .3,
    bus: "world",
    max: 4,
    pri: 1,
    ref: 2,
    roll: 1
  },
  step_concrete: {
    gen: r8,
    n: 4,
    sr: Xn,
    peak: .45,
    bus: "near",
    max: 3,
    pri: 3,
    boot: 1
  },
  step_water: {
    gen: a8,
    n: 3,
    sr: Xn,
    peak: .5,
    bus: "near",
    max: 3,
    pri: 3,
    boot: 1
  },
  step_metal: {
    gen: l8,
    n: 3,
    sr: Xn,
    peak: .5,
    bus: "near",
    max: 3,
    pri: 3,
    boot: 1
  },
  land: {
    gen: c8,
    n: 1,
    sr: Xn,
    peak: .7,
    bus: "near",
    max: 2,
    pri: 4
  },
  jump: {
    gen: u8,
    n: 1,
    sr: Xn,
    peak: .35,
    bus: "near",
    max: 2,
    pri: 3
  },
  hurt: {
    gen: h8,
    n: 1,
    sr: Xn,
    peak: .85,
    bus: "dry",
    max: 2,
    pri: 8
  },
  ear_ring: {
    gen: f8,
    n: 1,
    sr: pl,
    peak: .2,
    bus: "dry",
    max: 1,
    pri: 5
  },
  impact_metal: {
    gen: d8,
    n: 3,
    sr: ki,
    peak: .7,
    bus: "world",
    max: 4,
    pri: 4,
    ref: 4,
    roll: .7
  },
  impact_concrete: {
    gen: p8,
    n: 3,
    sr: ki,
    peak: .7,
    bus: "world",
    max: 4,
    pri: 4,
    ref: 4,
    roll: .7
  },
  impact_wood: {
    gen: m8,
    n: 2,
    sr: ki,
    peak: .7,
    bus: "world",
    max: 3,
    pri: 4,
    ref: 4,
    roll: .7
  },
  impact_water: {
    gen: g8,
    n: 2,
    sr: Xn,
    peak: .6,
    bus: "world",
    max: 3,
    pri: 4,
    ref: 4,
    roll: .7
  },
  impact_enemy: {
    gen: v8,
    n: 3,
    sr: ki,
    peak: .75,
    bus: "world",
    max: 4,
    pri: 5,
    ref: 5,
    roll: .6
  },
  impact_glass: {
    gen: x8,
    n: 1,
    sr: ki,
    peak: .6,
    bus: "world",
    max: 2,
    pri: 4,
    ref: 4,
    roll: .7
  },
  whiz: {
    gen: b8,
    n: 3,
    sr: ki,
    peak: .5,
    bus: "world",
    max: 3,
    pri: 5,
    ref: 2.5,
    roll: .6
  },
  ricochet: {
    gen: y8,
    n: 3,
    sr: ki,
    peak: .4,
    bus: "world",
    max: 2,
    pri: 3,
    ref: 5,
    roll: .6
  },
  gull_fire: {
    gen: E8,
    n: 2,
    sr: ki,
    peak: .85,
    bus: "world",
    max: 5,
    pri: 7,
    ref: 7,
    roll: .55
  },
  hound_fire: {
    gen: S8,
    n: 2,
    sr: ki,
    peak: .95,
    bus: "world",
    max: 5,
    pri: 7,
    ref: 8,
    roll: .5
  },
  hound_step: {
    gen: T8,
    n: 3,
    sr: Xn,
    peak: .7,
    bus: "world",
    max: 4,
    pri: 3,
    ref: 5,
    roll: .8
  },
  gull_die: {
    gen: A8,
    n: 1,
    sr: Xn,
    peak: .85,
    bus: "world",
    max: 3,
    pri: 7,
    ref: 7,
    roll: .5
  },
  hound_die: {
    gen: R8,
    n: 1,
    sr: Xn,
    peak: .9,
    bus: "world",
    max: 3,
    pri: 7,
    ref: 7,
    roll: .5
  },
  telegraph: {
    gen: P8,
    n: 2,
    sr: Xn,
    peak: .42,
    bus: "world",
    max: 4,
    pri: 6,
    ref: 6,
    roll: .6
  },
  alert: {
    gen: C8,
    n: 2,
    sr: Xn,
    peak: .5,
    bus: "world",
    max: 3,
    pri: 6,
    ref: 8,
    roll: .5
  },
  explosion: {
    gen: I8,
    n: 2,
    sr: ki,
    peak: .97,
    bus: "world",
    max: 3,
    pri: 10,
    ref: 12,
    roll: .5
  },
  relay_cut: {
    gen: z8,
    n: 1,
    sr: Xn,
    peak: .75,
    bus: "world",
    max: 2,
    pri: 8,
    ref: 6,
    roll: .5
  },
  thunder: {
    gen: D8,
    n: 2,
    sr: pl,
    peak: .8,
    bus: "dry",
    max: 2,
    pri: 6
  },
  foghorn: {
    gen: L8,
    n: 1,
    sr: pl,
    peak: .5,
    bus: "world",
    max: 1,
    pri: 2
  },
  gull_cry: {
    gen: k8,
    n: 2,
    sr: pl,
    peak: .4,
    bus: "world",
    max: 2,
    pri: 1
  },
  halyard: {
    gen: F8,
    n: 2,
    sr: Xn,
    peak: .3,
    bus: "world",
    max: 2,
    pri: 1
  },
  container_bang: {
    gen: U8,
    n: 1,
    sr: pl,
    peak: .6,
    bus: "world",
    max: 1,
    pri: 2
  },
  ui_click: {
    gen: N8,
    n: 1,
    sr: ki,
    peak: .3,
    bus: "dry",
    max: 2,
    pri: 9
  },
  ui_hover: {
    gen: B8,
    n: 1,
    sr: ki,
    peak: .12,
    bus: "dry",
    max: 2,
    pri: 9
  },
  objective: {
    gen: Z8,
    n: 1,
    sr: Xn,
    peak: .6,
    bus: "music",
    max: 1,
    pri: 9
  },
  objective_all: {
    gen: j8,
    n: 1,
    sr: Xn,
    peak: .65,
    bus: "music",
    max: 1,
    pri: 9
  },
  complete: {
    gen: J8,
    n: 1,
    sr: Xn,
    peak: .7,
    bus: "music",
    max: 1,
    pri: 9
  },
  death: {
    gen: K8,
    n: 1,
    sr: Xn,
    peak: .75,
    bus: "music",
    max: 1,
    pri: 9
  },
  gull_rotor: {
    gen: _8,
    n: 1,
    sr: Xn,
    peak: .6,
    loop: 1,
    ref: 5,
    roll: .9
  },
  hound_servo: {
    gen: M8,
    n: 1,
    sr: Xn,
    peak: .42,
    loop: 1,
    ref: 4,
    roll: 1
  },
  relay_hum: {
    gen: w8,
    n: 1,
    sr: Xn,
    peak: .4,
    loop: 1,
    ref: 2.5,
    roll: 1.4
  },
  rain: {
    gen: O8,
    n: 1,
    sr: Xn,
    peak: .5,
    loop: 1
  },
  rain_interior: {
    gen: H8,
    n: 1,
    sr: Xn,
    peak: .7,
    loop: 1
  },
  wind: {
    gen: V8,
    n: 1,
    sr: pl,
    peak: .5,
    loop: 1
  },
  sea: {
    gen: W8,
    n: 1,
    sr: pl,
    peak: .5,
    loop: 1,
    ref: 10,
    roll: .6
  },
  music_drone: {
    gen: G8,
    n: 1,
    sr: Fr.sr,
    peak: .5,
    loop: 1,
    music: 1
  },
  music_ost: {
    gen: q8,
    n: 1,
    sr: Fr.sr,
    peak: .45,
    loop: 1,
    music: 1
  },
  music_perc: {
    gen: X8,
    n: 1,
    sr: Fr.sr,
    peak: .7,
    loop: 1,
    music: 1
  },
  music_brass: {
    gen: Y8,
    n: 1,
    sr: Fr.sr,
    peak: .45,
    loop: 1,
    music: 1
  },
  music_motif: {
    gen: $8,
    n: 1,
    sr: Fr.sr,
    peak: .45,
    loop: 1,
    music: 1
  },
  ir_outdoor: {
    gen: Q8,
    n: 1,
    sr: ki,
    peak: .9,
    ir: 1
  },
  ir_shed: {
    gen: eC,
    n: 1,
    sr: ki,
    peak: .9,
    ir: 1
  }
};
var i_ = {
  step: "step_concrete",
  impact: "impact_concrete",
  hurt: "hurt",
  objective_done: "objective",
  extraction: "complete",
  enemy_alert: "alert"
};
var s_ = i => i && typeof i.next == "function";
function o_(i, e, t) {
  let n = Array.isArray(e) ? e : [e];
  if (!i.loop) for (let r of n) em(r, t, i.ir ? 0 : 3e-4, i.ir ? .05 : .012);
  let s = 0;
  for (let r of n) s = Math.max(s, Qb(r));
  let o = s > 0 ? i.peak / s : 1;
  for (let r of n) ml(r, o);
  return {
    sr: t,
    ch: n,
    loop: !!i.loop
  };
}
function r_(i, e = 0, t) {
  let n = Go[i];
  if (!n) return null;
  let s = t || n.sr;
  let o = e % n.n;
  let r = n.gen(s, ao(Kb(i) + o * 7919), o);
  if (s_(r)) {
    let a;
    do a = r.next(); while (!a.done);
    r = a.value;
  }
  return o_(n, r, s);
}
function a_(i, e = 0, t) {
  let n = Go[i];
  if (!n) return null;
  let s = t || n.sr;
  let o = e % n.n;
  let r = n.gen(s, ao(Kb(i) + o * 7919), o);
  let a = null;
  return {
    step() {
      if (a) return a;
      if (s_(r)) {
        let l = r.next();
        if (!l.done) return null;
        r = l.value;
      }
      return a = o_(n, r, s);
    }
  };
}
export { Go, a_, i_, r_ };
