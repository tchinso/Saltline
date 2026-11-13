import { Go, a_, i_, r_ } from './catalog.js';
import { createEpisodeScore } from './episode-score.js';
var pi = (i, e, t) => Math.min(t, Math.max(e, i));
var Pv = (i, e, t) => {
  let n = pi((t - i) / (e - i), 0, 1);
  return n * n * (3 - 2 * n);
};
var l_ = {
  metal: "impact_metal",
  concrete: "impact_concrete",
  wood: "impact_wood",
  water: "impact_water",
  glass: "impact_glass",
  dirt: "impact_concrete",
  rubber: "impact_wood"
};
var Iv = {
  metal: "step_metal",
  water: "step_water",
  concrete: "step_concrete",
  wood: "step_concrete",
  dirt: "step_concrete",
  glass: "step_concrete",
  rubber: "step_concrete"
};
var tC = new Set(["thunder", "foghorn", "objective", "objective_all", "complete", "death", "explosion", "rifle_tail_in", "gull_die", "hound_die", "relay_cut", "container_bang", "ear_ring"]);
var nC = ["ir_outdoor", "ir_shed", "rain", "whiz", "reload_magout", "reload_magin", "reload_bolt", "shell_bounce", "impact_concrete", "impact_metal", "land", "jump", "hurt", "music_drone", "wind", "music_motif", "impact_enemy", "impact_wood", "impact_water", "impact_glass", "ricochet", "gull_rotor", "hound_servo", "alert", "telegraph", "gull_fire", "hound_fire", "hound_step", "ui_click", "ui_hover", "sea", "rain_interior", "relay_hum", "gull_die", "hound_die", "explosion", "ear_ring", "death", "music_ost", "music_perc", "music_brass", "relay_cut", "objective", "thunder", "objective_all", "complete", "gull_cry", "halyard", "foghorn", "container_bang"];
var tm = ["music_drone", "music_ost", "music_perc", "music_brass", "music_motif"];
function createSilentAudio() {
  let i = () => {};
  let e = {
    setPos: i,
    setGain: i,
    setPitch: i,
    stop: i
  };
  return {
    silent: true,
    update: i,
    resume: i,
    play: i,
    loop: () => e,
    setIntensity: i,
    setInterior: i,
    setVolume: i,
    setPaused: i,
    debug: () => ({
      state: "none"
    }),
    names: Object.keys(Go),
    ready: Promise.resolve()
  };
}
async function createAudio(game) {
  let e = typeof window < "u" && (window.AudioContext || window.webkitAudioContext);
  let t = null;
  try {
    e && (t = new e({
      latencyHint: "interactive"
    }));
  } catch {
    t = null;
  }
  return t ? createAudioMixer(game, t, null) : (console.warn("[audio] WebAudio unavailable \u2014 running silent"), createSilentAudio());
}
function createAudioMixer(i, e, t) {
  let n = i.events;
  const campaignMusic = !t && i.mood?.music || null;
  // The old harbor weather is not a soundscape for every campaign location.
  const campaignAmbience = !i.showcase && /^m(?:0[1-9]|1[0-9]|2[0-6])$/.test(i.story?.id || '');
  let s = Math.random;
  let o = () => t ? true : e.state === "running";
  let r = t ? t.bufs : new Map();
  let a = new Map();
  let l = 0;
  let c = 0;
  let u = 0;
  function h(te, he) {
    let pe = e.createBuffer(he.ch.length, he.ch[0].length, he.sr);
    for (let ye = 0; ye < he.ch.length; ye++) pe.getChannelData(ye).set(he.ch[ye]);
    r.set(te, pe);
    c++;
    let ge = a.get(te);
    if (ge) {
      a.delete(te);
      for (let ye of ge) try {
        ye(pe);
      } catch (Le) {
        console.error("[audio] ready callback", Le);
      }
    }
    return pe;
  }
  let f = te => Go[te].ir ? e.sampleRate : void 0;
  function p(te, he) {
    let pe = performance.now();
    let ge = h(te + "#" + he, r_(te, he, f(te)));
    l += performance.now() - pe;
    return ge;
  }
  let d = [];
  let v = new Set();
  for (let te of [...nC, ...Object.keys(Go)]) {
    let he = Go[te];
    if (!(!he || v.has(te) || campaignMusic && he.music)) {
      v.add(te);
      for (let pe = 0; pe < he.n; pe++) r.has(te + "#" + pe) || (he.boot ? p(te, pe) : d.push({
        name: te,
        v: pe,
        k: te + "#" + pe,
        steps: null
      }));
    }
  }
  u = l;
  let g;
  let x = new Promise(te => {
    g = te;
  });
  function y() {
    let te = performance.now();
    for (; d.length;) {
      let he = d[0];
      if (r.has(he.k)) {
        d.shift();
        continue;
      }
      he.steps || (he.steps = a_(he.name, he.v, f(he.name)));
      let pe = null;
      try {
        pe = he.steps.step();
      } catch (ge) {
        console.error("[audio] synthesis failed for " + he.k, ge);
        d.shift();
        continue;
      }
      if (pe && (h(he.k, pe), d.shift(), be(he.name)), performance.now() - te > 6) break;
    }
    l += performance.now() - te;
    d.length ? setTimeout(y, 12) : g();
  }
  t ? g() : setTimeout(y, 120);
  function b(te, he, pe) {
    let ge = te + "#" + he;
    let ye = r.get(ge);
    if (ye) {
      pe(ye);
      return;
    }
    a.has(ge) || a.set(ge, []);
    a.get(ge).push(pe);
    let Le = d.findIndex(ke => ke.k === ge);
    if (Le > 0 && !d[Le].steps) {
      let [ke] = d.splice(Le, 1);
      d.splice(d[0] && d[0].steps ? 1 : 0, 0, ke);
    }
  }
  let m = te => {
    let he = e.createGain();
    he.gain.value = te;
    return he;
  };
  let A = m(1);
  let _ = e.createDynamicsCompressor();
  let M = m(.45);
  let E = e.createWaveShaper();
  let w = m(.9);
  _.threshold.value = -10;
  _.knee.value = 6;
  _.ratio.value = 6;
  _.attack.value = .002;
  _.release.value = .14;
  {
    let he = new Float32Array(2049);
    for (let pe = 0; pe < 2049; pe++) {
      let ge = (pe / 2048 * 2 - 1) * 2;
      let ye = Math.abs(ge);
      he[pe] = Math.sign(ge) * (ye <= .6 ? ye : .6 + .4 * Math.tanh((ye - .6) / .4));
    }
    E.curve = he;
    try {
      E.oversample = "2x";
    } catch {}
  }
  A.connect(_);
  _.connect(M);
  M.connect(E);
  E.connect(w);
  w.connect(e.destination);
  let S = e.createBiquadFilter();
  S.type = "lowpass";
  S.frequency.value = 2e4;
  S.Q.value = .5;
  let z = m(1);
  S.connect(z);
  z.connect(A);
  let H = {
    world: m(1),
    near: m(.95),
    amb: m(.55),
    dry: m(1),
    music: m(.62)
  };
  H.world.connect(S);
  H.near.connect(S);
  H.amb.connect(S);
  H.dry.connect(A);
  let O = m(1);
  H.music.connect(O);
  O.connect(A);
  const episodeScore = campaignMusic ? createEpisodeScore(e, H.music, campaignMusic) : null;
  let q = m(1);
  let U = m(1);
  let T = m(0);
  let D = e.createConvolver();
  let C = e.createConvolver();
  let G = m(.75);
  let j = m(.95);
  let N = m(.9);
  let Q = m(.32);
  let K = m(.2);
  H.world.connect(N);
  N.connect(q);
  H.near.connect(Q);
  Q.connect(q);
  q.connect(U);
  q.connect(T);
  U.connect(D);
  T.connect(C);
  D.connect(G);
  C.connect(j);
  G.connect(S);
  j.connect(S);
  H.music.connect(K);
  K.connect(C);
  b("ir_outdoor", 0, te => {
    D.buffer = te;
  });
  b("ir_shed", 0, te => {
    C.buffer = te;
  });
  function ie(te, he, pe, ge) {
    te.positionX ? (te.positionX.value = he, te.positionY.value = pe, te.positionZ.value = ge) : te.setPosition(he, pe, ge);
  }
  function F(te) {
    let he = e.createPanner();
    he.panningModel = te ? "HRTF" : "equalpower";
    he.distanceModel = "inverse";
    he.refDistance = 3;
    he.rolloffFactor = .6;
    he.maxDistance = 400;
    he.coneInnerAngle = 360;
    return he;
  }
  let X = {
    world: [],
    near: [],
    dry: [],
    music: []
  };
  function ne(te, he) {
    let pe = {
      g: m(0),
      pan: null,
      src: null,
      end: 0,
      start: 0,
      name: "",
      pri: 0
    };
    he ? (pe.pan = F(false), pe.g.connect(pe.pan), pe.pan.connect(H[te])) : pe.g.connect(H[te]);
    X[te].push(pe);
  }
  for (let te = 0; te < 22; te++) ne("world", true);
  for (let te = 0; te < 12; te++) ne("near", false);
  for (let te = 0; te < 8; te++) ne("dry", false);
  for (let te = 0; te < 3; te++) ne("music", false);
  let re = {
    x: 0,
    y: 1.7,
    z: 0
  };
  let $ = false;
  let ue = false;
  let me = .9;
  let ee = i.game && i.game.state || "title";
  let B = 0;
  let P = 0;
  let V = 0;
  let Y = 0;
  let L = 0;
  let Z = 0;
  let J = 1;
  let oe = 1;
  let fe = 0;
  let le = -9;
  let R = -9;
  let I = 0;
  let se = -9;
  let ae = -9;
  let k = -9;
  let ce = -9;
  let ve = -9;
  let _e = -9;
  let Te = -9;
  let Pe = {};
  let Re = {
    autoIntensity: true
  };
  function Fe(te, he, pe, ge) {
    let ye = null;
    let Le = 0;
    let ke = null;
    let Ue = null;
    for (let ct = 0; ct < te.length; ct++) {
      let De = te[ct];
      if (De.end <= ge) {
        ye || (ye = De);
        continue;
      }
      De.name === he && (Le++, (!ke || De.start < ke.start) && (ke = De));
      (!Ue || De.pri < Ue.pri || De.pri === Ue.pri && De.start < Ue.start) && (Ue = De);
    }
    return Le >= (pe.max || 4) ? ke : ye || (Ue && Ue.pri <= pe.pri ? Ue : null);
  }
  function ze(te, he) {
    he = he || {};
    te = i_[te] || te;
    he.surface && (te === "impact_concrete" ? te = l_[he.surface] || te : te === "step_concrete" && (te = Iv[he.surface] || te));
    let pe = Go[te];
    if (!pe || pe.loop || pe.ir || !o()) return false;
    let ge = he.variant;
    ge == null ? ge = Pe[te] = ((Pe[te] || 0) + 1 + (pe.n > 2 && s() < .3 ? 1 : 0)) % pe.n : ge %= pe.n;
    let ye = r.get(te + "#" + ge);
    if (!ye) {
      if (tC.has(te)) {
        let Ht = e.currentTime;
        b(te, ge, () => {
          e.currentTime - Ht < 2.5 && ze(te, Object.assign({}, he, {
            variant: ge
          }));
        });
        return false;
      }
      ye = p(te, ge);
    }
    let Le = e.currentTime;
    let ke = he.pos;
    let Ue = !!ke && pe.bus === "world";
    let ct = Ue ? X.world : X[pe.bus === "world" ? "near" : pe.bus];
    let De = Fe(ct, te, pe, Le);
    if (!De) return false;
    let it = Le + (he.delay || 0);
    let gt = De.g.gain;
    if (gt.cancelScheduledValues(Le), De.end > Le && De.src) {
      gt.setTargetAtTime(0, Le, .004);
      try {
        De.src.stop(Le + .025);
      } catch {}
      it = Math.max(it, Le + .025);
    }
    let Ot = he.jitter != null ? he.jitter : .035;
    let xn = pi((he.pitch || 1) * (1 + (s() * 2 - 1) * Ot), .25, 4);
    if (gt.setValueAtTime((he.gain != null ? he.gain : 1) * (1 - s() * .08), it), Ue) {
      let Ht = Array.isArray(ke) ? {
        x: ke[0],
        y: ke[1],
        z: ke[2]
      } : ke;
      ie(De.pan, Ht.x || 0, Ht.y || 0, Ht.z || 0);
      De.pan.refDistance = he.ref || pe.ref || 3;
      De.pan.rolloffFactor = he.roll != null ? he.roll : pe.roll != null ? pe.roll : .6;
    }
    let $t = e.createBufferSource();
    $t.buffer = ye;
    $t.playbackRate.value = xn;
    $t.connect(De.g);
    $t.onended = () => {
      try {
        $t.disconnect();
      } catch {}
    };
    $t.start(it);
    De.src = $t;
    De.start = it;
    De.end = it + ye.duration / xn + .03;
    De.name = te;
    De.pri = pe.pri || 0;
    return true;
  }
  let We = new Set();
  let Ne = new Set();
  let dt = () => {};
  let xe = false;
  let Ie = {
    setPos: dt,
    setGain: dt,
    setPitch: dt,
    stop: dt,
    alive: false
  };
  function Be(te, he) {
    he = he || {};
    let pe = Go[te];
    if (!pe || !pe.loop) return Ie;
    let ge = (te === "gull_rotor" || te === "hound_servo") && !he._auto;
    ge && !he.hrtf && (he = Object.assign({
      hrtf: true
    }, he));
    let ye = {
      name: te,
      alive: true,
      vT: 1,
      vC: 1,
      px: 0,
      py: 0,
      pz: 0,
      gT: he.gain != null ? he.gain : 1,
      gC: 0,
      pT: he.pitch || 1,
      pC: he.pitch || 1,
      src: null,
      g: m(0),
      pan: null,
      rate: he.fade || 6
    };
    let Le = ye.g;
    if (he.pos && (ye.pan = F(!!he.hrtf), ye.pan.refDistance = he.ref || pe.ref || 3, ye.pan.rolloffFactor = he.roll != null ? he.roll : pe.roll != null ? pe.roll : .6, ye.g.connect(ye.pan), Le = ye.pan), Le.connect(H[he.bus || (he.pos ? "world" : pe.music ? "music" : "amb")]), ye.setPos = ke => {
      ye.pan && ke && (Array.isArray(ke) ? (ye.px = ke[0], ye.py = ke[1], ye.pz = ke[2]) : (ye.px = ke.x || 0, ye.py = ke.y || 0, ye.pz = ke.z || 0), Number.isFinite(ye.px + ye.py + ye.pz) && ie(ye.pan, ye.px, ye.py, ye.pz));
    }, ye.setGain = ke => {
      ye.gT = Math.max(0, +ke || 0);
    }, ye.setPitch = ke => {
      ye.pT = pi(+ke || 1, .25, 4);
    }, ye.stop = ke => {
      if (!ye.alive) return;
      ye.alive = false;
      We.delete(ye);
      Ne.delete(ye);
      let Ue = ke ?? .18;
      let ct = e.currentTime;
      try {
        ye.g.gain.setValueAtTime(ye.gC, ct);
        ye.g.gain.linearRampToValueAtTime(0, ct + Ue);
        ye.src && ye.src.stop(ct + Ue + .03);
      } catch {}
      setTimeout(() => {
        try {
          ye.src && ye.src.disconnect();
          ye.g.disconnect();
          ye.pan && ye.pan.disconnect();
        } catch {}
      }, (Ue + .3) * 1e3);
    }, he.pos && ye.setPos(he.pos), b(te, 0, ke => {
      if (!ye.alive) return;
      let Ue = e.createBufferSource();
      Ue.buffer = ke;
      Ue.loop = true;
      Ue.playbackRate.value = ye.pC;
      Ue.connect(ye.g);
      Ue.start(0, he.offset != null ? he.offset : s() * ke.duration);
      ye.src = Ue;
    }), We.add(ye), ge && (Ne.add(ye), !xe)) {
      xe = true;
      for (let ke of [...pn.keys()]) Rs(ke);
    }
    return ye;
  }
  let Xe = {
    on: false,
    layers: {}
  };
  function Me() {
    if (episodeScore || Xe.on || !o()) return;
    for (let he of tm) if (!r.has(he + "#0")) return;
    let te = e.currentTime + .08;
    for (let he of tm) {
      let pe = m(0);
      let ge = e.createBufferSource();
      ge.buffer = r.get(he + "#0");
      ge.loop = true;
      ge.connect(pe);
      pe.connect(H.music);
      ge.start(te);
      Xe.layers[he] = {
        g: pe,
        s: ge,
        c: 0
      };
    }
    Xe.on = true;
    Xe.t0 = te;
  }
  function we(te) {
    return ee === "title" ? [.85, 0, 0, 0, .9] : ee === "intro" ? [.8, 0, 0, 0, .6] : ee === "dead" ? [.75, 0, 0, 0, 0] : ee === "complete" ? [.6, 0, 0, 0, .7] : [.6 + .3 * te, Pv(.05, .5, te) * .85, Pv(.4, .8, te) * .95, Pv(.62, 1, te) * .8, 0];
  }
  function be(te) {
    Go[te].music && Me();
  }
  let Oe = {
    rain: campaignAmbience ? Ie : Be("rain", {
      gain: 0,
      fade: 2
    }),
    rainIn: campaignAmbience ? Ie : Be("rain_interior", {
      gain: 0,
      fade: 2
    }),
    wind: Be("wind", {
      gain: 0,
      fade: 2
    }),
    sea: campaignAmbience ? Ie : Be("sea", {
      gain: 0,
      pos: [33, -1, 0],
      fade: 2,
      bus: "amb"
    })
  };
  let pt = .4;
  let ut = .4;
  let nn = 2;
  let bt = {
    fog: 14 + s() * 14,
    gull: 5 + s() * 8,
    hal: 4 + s() * 6,
    bang: 20 + s() * 25
  };
  function Os(te, he) {
    let pe = 1 - .7 * P;
    if ((bt.fog -= te) <= 0) {
      bt.fog = 40 + s() * 30;
      let ge = re.z + (s() * 2 - 1) * 250;
      ze("foghorn", {
        pos: [re.x + 320, 8, ge],
        ref: 400,
        gain: .34 * he * pe,
        pitch: s() < .3 ? .89 : 1,
        jitter: .01
      });
    }
    if ((bt.gull -= te) <= 0) {
      bt.gull = 9 + s() * 16;
      let ge = s() * 6.283;
      let ye = 35 + s() * 50;
      ze("gull_cry", {
        pos: [re.x + Math.cos(ge) * ye, 14 + s() * 18, re.z + Math.sin(ge) * ye],
        ref: ye,
        roll: 1,
        gain: (.16 + s() * .16) * he * pe,
        jitter: .1
      });
    }
    if ((bt.hal -= te) <= 0 && (bt.hal = 6 + s() * 11, ze("halyard", {
      pos: [29 + s() * 8, 3 + s() * 6, -8 + s() * 32],
      ref: 16,
      roll: .5,
      gain: (.3 + s() * .3) * he * pe,
      jitter: .08
    })), (bt.bang -= te) <= 0) {
      bt.bang = 28 + s() * 34;
      let ge = 1.6 + s() * 3.2;
      ze("container_bang", {
        pos: [re.x + Math.cos(ge) * 150, 4, re.z + Math.sin(ge) * 150],
        ref: 150,
        gain: (.2 + s() * .16) * he * pe,
        jitter: .12
      });
    }
  }
  let pn = new Map();
  let Ti = 0;
  function ho(te) {
    !te || xe || pn.has(te) || te.alive === false || pn.set(te, {
      h: null,
      type: te.type === "hound" ? "hound" : "gull",
      lx: te.pos ? te.pos.x : 0,
      ly: te.pos ? te.pos.y : 0,
      lz: te.pos ? te.pos.z : 0,
      sp: 0,
      d: 1e9,
      tune: .96 + s() * .1
    });
  }
  function Rs(te) {
    let he = pn.get(te);
    he && (he.h && he.h.stop(.12), pn.delete(te));
  }
  let Un = [];
  function zo(te) {
    if (Ti -= te, Ti <= 0 && xe) {
      Ti = .25;
      Un.length = 0;
      for (let he of Ne) {
        he.d = Math.hypot(he.px - re.x, he.py - re.y, he.pz - re.z);
        Un.push(he);
      }
      Un.sort((he, pe) => he.d - pe.d);
      for (let he = 0; he < Un.length; he++) Un[he].vT = he < 6 && Un[he].d < 90 ? 1 : 0;
    }
    if (Ti <= 0) {
      Ti = .25;
      let he = i.enemies && i.enemies.list;
      if (Array.isArray(he)) for (let pe = 0; pe < he.length; pe++) {
        let ge = he[pe];
        ge && ge.alive !== false && !pn.has(ge) && ho(ge);
      }
      Un.length = 0;
      for (let [pe, ge] of pn) {
        if (pe.alive === false || Array.isArray(he) && he.indexOf(pe) < 0) {
          Rs(pe);
          continue;
        }
        let ye = pe.pos;
        ye && (ge.d = Math.hypot(ye.x - re.x, ye.y - re.y, ye.z - re.z), Un.push(ge));
      }
      Un.sort((pe, ge) => pe.d - ge.d);
      for (let pe = 0; pe < Un.length; pe++) {
        let ge = Un[pe];
        let ye = pe < 6 && ge.d < 90;
        ye && !ge.h ? ge.h = Be(ge.type === "gull" ? "gull_rotor" : "hound_servo", {
          pos: [ge.lx, ge.ly, ge.lz],
          gain: 0,
          hrtf: true,
          fade: 5,
          _auto: true
        }) : !ye && ge.h && (ge.h.stop(.25), ge.h = null);
      }
    }
    for (let [he, pe] of pn) {
      let ge = he.pos;
      if (ge) {
        if (te > 0) {
          let ye = Math.hypot(ge.x - pe.lx, ge.y - pe.ly, ge.z - pe.lz) / te;
          pe.sp += (Math.min(ye, 30) - pe.sp) * Math.min(1, te * 5);
        }
        if (pe.lx = ge.x, pe.ly = ge.y, pe.lz = ge.z, !!pe.h) if (pe.h.setPos(ge), pe.type === "gull") {
          pe.h.setGain(1);
          pe.h.setPitch(pe.tune * (.94 + .3 * pi(pe.sp / 10, 0, 1)));
        } else {
          let ye = pi(pe.sp / 3, 0, 1);
          pe.h.setGain(.3 + .5 * ye);
          pe.h.setPitch(pe.tune * (.88 + .3 * ye));
        }
      }
    }
  }
  let $i = [];
  function ya() {
    for (let he of $i) he.h.stop(.2);
    $i = [];
    let te = i.level && i.level.objectives;
    Array.isArray(te) && te.forEach((he, pe) => {
      he && he.pos && $i.push({
        id: he.id,
        index: pe,
        pos: {
          x: he.pos.x,
          y: (he.pos.y || 0) + 1.2,
          z: he.pos.z
        },
        h: Be("relay_hum", {
          pos: [he.pos.x, (he.pos.y || 0) + 1.2, he.pos.z],
          gain: .9
        })
      });
    });
  }
  function ba(te) {
    te = te || {};
    let he = $i.findIndex(pe => te.id != null && pe.id === te.id);
    if (he < 0 && te.index != null && (he = $i.findIndex(pe => pe.index === te.index)), he >= 0) {
      let pe = $i[he];
      pe.h.stop(.08);
      $i.splice(he, 1);
      ze("relay_cut", {
        pos: pe.pos,
        gain: 1
      });
    } else ze("relay_cut", {
      gain: .8
    });
  }
  let Hn = te => te && typeof te.x == "number" ? te : null;
  function fo(te) {
    let he = P;
    he < .95 && ze("rifle_tail_out", {
      gain: te * (1 - he),
      jitter: .03
    });
    he > .05 && ze("rifle_tail_in", {
      gain: te * he,
      jitter: .03
    });
    R = e.currentTime;
  }
  let ln = (te, he) => {
    n && n.on && n.on(te, pe => {
      try {
        he(pe || {});
      } catch (ge) {
        console.error("[audio] " + te, ge);
      }
    });
  };
  ln("weapon:fire", () => {
    I = I + 1 & 3;
    ze("rifle_shot", {
      variant: I,
      gain: 1,
      jitter: .012
    });
    let te = e.currentTime;
    le = te;
    te - R > .28 && fo(1);
    J = Math.min(J, .55);
    Y > .3 && (Y = Math.min(1, Y + .015));
  });
  ln("weapon:dry", () => ze("rifle_dry", {
    gain: .9
  }));
  ln("weapon:reload", te => {
    te.phase === "magout" ? ze("reload_magout") : te.phase === "magin" ? ze("reload_magin") : te.phase === "bolt" ? ze("reload_bolt") : te.phase === "start" && ze("jump", {
      gain: .5,
      pitch: 1.3
    });
  });
  ln("weapon:melee", () => ze("jump", {
    gain: .9,
    pitch: 1.2
  }));
  ln("shell:bounce", te => {
    let he = e.currentTime;
    he - ce < .04 || (ce = he, te.surface === "water" ? ze("impact_water", {
      pos: Hn(te.pos),
      gain: .25,
      pitch: 1.7
    }) : ze("shell_bounce", {
      pos: Hn(te.pos),
      gain: te.surface === "metal" ? 1 : .8,
      pitch: te.surface === "metal" ? 1.12 : 1
    }));
  });
  ln("impact", te => {
    let he = e.currentTime;
    if (he - se < .022) return;
    se = he;
    let pe = Hn(te.point);
    let ge = te.surface;
    if (te.enemy) {
      ze("impact_enemy", {
        pos: pe,
        gain: te.part === "weak" ? 1 : .85,
        pitch: te.part === "weak" ? 1.25 : 1
      });
      return;
    }
    if (te.from === "enemy" && pe && te.dir && typeof te.dir.x == "number" && he - Te > .09) {
      let ye = te.dir;
      let Le = ye.x * ye.x + ye.y * ye.y + ye.z * ye.z || 1;
      let ke = ((re.x - pe.x) * ye.x + (re.y - pe.y) * ye.y + (re.z - pe.z) * ye.z) / Le;
      if (ke < -1.5) {
        let Ue = pe.x + ye.x * ke;
        let ct = pe.y + ye.y * ke;
        let De = pe.z + ye.z * ke;
        let it = Math.hypot(re.x - Ue, re.y - ct, re.z - De);
        it < 3.2 && (Te = he, ze("whiz", {
          pos: {
            x: Ue,
            y: ct,
            z: De
          },
          gain: pi(1.15 - it / 3.5, .3, 1),
          jitter: .1
        }));
      }
    }
    ze(l_[ge] || "impact_concrete", {
      pos: pe,
      gain: te.from === "enemy" ? .8 : .9,
      pitch: ge === "dirt" ? .8 : ge === "rubber" ? .7 : 1,
      jitter: .07
    });
    he - ae > .22 && (ge === "metal" && s() < .24 || ge === "concrete" && s() < .07) && (ae = he, ze("ricochet", {
      pos: pe,
      gain: .75,
      delay: .012,
      jitter: .12
    }));
  });
  ln("player:step", te => {
    let he = te.surface || "concrete";
    try {
      te.pos && i.ground && i.ground.isPuddle && i.ground.isPuddle(te.pos.x, te.pos.z) && (he = "water");
    } catch {}
    ze(Iv[he] || "step_concrete", {
      gain: (te.sprint ? .8 : .55) * (he === "water" ? .9 : 1),
      pitch: (te.sprint ? 1.05 : 1) * (he === "wood" ? 1.18 : 1),
      jitter: .06
    });
  });
  ln("player:jump", () => ze("jump", {
    gain: .8
  }));
  ln("player:land", te => {
    let he = pi(.35 + (Math.abs(te.speed) || 4) / 10, .35, 1);
    ze("land", {
      gain: he
    });
    (te.surface === "water" || te.surface === "metal") && ze(Iv[te.surface], {
      gain: he * .8,
      pitch: .9
    });
  });
  ln("player:hit", te => {
    let he = +te.amount || 10;
    let pe = e.currentTime;
    ze("hurt", {
      gain: pi(.5 + he / 40, .5, 1),
      jitter: .08
    });
    he >= 6 && pe - k > 1.8 && (k = pe, ze("ear_ring", {
      gain: pi(he / 28, .3, 1),
      jitter: .02
    }));
    Z = Math.max(Z, pi(he / 40, .2, .7));
    Y = Math.min(1, Math.max(Y, .6) + .15);
  });
  ln("player:dead", () => {
    e.currentTime - _e > 1 && (_e = e.currentTime, ze("death", {
      gain: 1,
      jitter: 0
    }));
    Z = 1;
  });
  ln("enemy:spawn", te => ho(te.enemy));
  ln("enemy:alert", te => {
    Y = Math.max(Y, .6);
    let he = e.currentTime;
    if (he - ve < .12) return;
    ve = he;
    let pe = te.enemy || {};
    ze("alert", {
      pos: Hn(pe.pos) || Hn(te.pos),
      variant: pe.type === "hound" ? 1 : 0,
      gain: .9
    });
  });
  ln("enemy:fire", te => {
    let he = te.type || te.enemy && te.enemy.type;
    let pe = Hn(te.pos) || te.enemy && Hn(te.enemy.pos);
    ze(he === "hound" ? "hound_fire" : "gull_fire", {
      pos: pe,
      gain: 1,
      jitter: .04
    });
    Y = Math.min(1, Math.max(Y, .6) + .05);
  });
  ln("enemy:step", te => {
    if (te.crash) {
      ze("hound_step", {
        pos: Hn(te.pos),
        gain: 1,
        pitch: .72
      });
      ze("impact_metal", {
        pos: Hn(te.pos),
        gain: .8,
        pitch: .55
      });
      return;
    }
    te.type !== "gull" && ze("hound_step", {
      pos: Hn(te.pos),
      gain: pi(.6 + (+te.speed || 2) * .1, .6, 1),
      jitter: .06
    });
  });
  ln("enemy:telegraph", te => {
    let he = te.enemy || {};
    let pe = te.type || he.type;
    let ge = pi(+te.time || .55, .15, 1.5);
    ze("telegraph", {
      pos: Hn(te.pos) || Hn(he.pos),
      variant: pe === "hound" ? 1 : 0,
      pitch: .55 / ge,
      gain: te.melee ? .7 : 1,
      jitter: 0
    });
    Y = Math.max(Y, .6);
  });
  ln("enemy:melee", te => {
    let he = Hn(te.pos) || te.enemy && Hn(te.enemy.pos);
    ze("hound_step", {
      pos: he,
      gain: 1,
      pitch: .8
    });
    ze("impact_metal", {
      pos: he,
      gain: .9,
      pitch: .7
    });
    ze("hurt", {
      gain: .6
    });
  });
  ln("enemy:killed", te => {
    let he = te.enemy;
    let pe = te.type || he && he.type;
    let ge = Hn(te.pos) || he && Hn(he.pos);
    he && Rs(he);
    ze(pe === "hound" ? "hound_die" : "gull_die", {
      pos: ge,
      gain: 1,
      jitter: .05
    });
  });
  ln("explosion", te => {
    let he = pi(+te.size || 1, .3, 3);
    let pe = Hn(te.pos);
    if (ze("explosion", {
      pos: pe,
      gain: pi(.6 + .25 * he, .5, 1.1),
      pitch: pi(1.12 - .1 * he, .8, 1.15),
      jitter: .04
    }), pe) {
      let ge = Math.hypot(pe.x - re.x, pe.y - re.y, pe.z - re.z);
      Z = Math.max(Z, pi(1 - (ge - 5) / 10, 0, .8));
    }
    Y = Math.max(Y, .6);
    J = Math.min(J, .4);
  });
  ln("objective:done", te => {
    ba(te);
    ze("objective", {
      delay: .35,
      gain: 1,
      jitter: 0
    });
  });
  ln("objective:all", () => ze("objective_all", {
    delay: 2.2,
    gain: 1,
    jitter: 0
  }));
  let Zo = () => {
    let te = e.currentTime;
    te - _e > 6 && (_e = te, ze("complete", {
      gain: 1,
      jitter: 0
    }));
  };
  ln("extraction:reached", Zo);
  ln("thunder", te => {
    let he = pi(te.intensity != null ? +te.intensity : .6, .1, 1);
    ze("thunder", {
      variant: he > .6 ? 1 : 0,
      delay: .5 + (1 - he) * 2 + s() * .6,
      gain: .35 + .65 * he,
      jitter: .1
    });
  });
  ln("ui:click", () => ze("ui_click"));
  ln("ui:hover", () => ze("ui_hover"));
  ln("game:state", te => {
    let he = ee;
    if (ee = te.state || ee, ee === "playing" && he !== "paused") {
      Y = 0;
      Z = 0;
      ya();
      for (let pe of [...pn.keys()]) pe.alive === false && Rs(pe);
    }
    ee === "complete" && Zo();
    ee === "paused" ? ue = true : he === "paused" && (ue = false);
  });
  function yr() {
    if ($ = true, e.state !== "running" && e.state !== "closed") try {
      let te = e.resume();
      te && te.catch && te.catch(() => {});
    } catch {}
  }
  if (typeof window < "u" && !t) {
    let te = () => {
      if (yr(), o()) for (let he of ["pointerdown", "keydown", "touchend", "mousedown"]) window.removeEventListener(he, te, true);
    };
    for (let he of ["pointerdown", "keydown", "touchend", "mousedown"]) window.addEventListener(he, te, {
      capture: true,
      passive: true
    });
    document.addEventListener("visibilitychange", () => {
      try {
        document.hidden ? e.suspend() : $ && e.resume();
      } catch {}
    });
  }
  function lu(te) {
    te = Math.min(Math.max(+te || 0, 0), .25);
    let he = i.camera;
    let pe = e.listener;
    if (he && he.matrixWorld) {
      let De = he.matrixWorld.elements;
      re.x = De[12];
      re.y = De[13];
      re.z = De[14];
      Number.isFinite(re.x + re.y + re.z + De[8] + De[4]) && (pe.positionX ? (pe.positionX.value = re.x, pe.positionY.value = re.y, pe.positionZ.value = re.z, pe.forwardX.value = -De[8], pe.forwardY.value = -De[9], pe.forwardZ.value = -De[10], pe.upX.value = De[4], pe.upY.value = De[5], pe.upZ.value = De[6]) : (pe.setPosition(re.x, re.y, re.z), pe.setOrientation(-De[8], -De[9], -De[10], De[4], De[5], De[6])));
    }
    let ge = i.level && i.level.interiorBoxes;
    if (Array.isArray(ge) && ge.length) {
      let De = 0;
      for (let it = 0; it < ge.length; it++) {
        let gt = ge[it];
        if (gt && gt.min && gt.max && re.x > gt.min.x && re.x < gt.max.x && re.y > gt.min.y - .5 && re.y < gt.max.y && re.z > gt.min.z && re.z < gt.max.z) {
          De = 1;
          break;
        }
      }
      B = De;
    }
    let ye = De => 1 - Math.exp(-te * De);
    if (P += (B - P) * ye(3), U.gain.value = 1 - .9 * P, T.gain.value = P, !o()) return;
    Me();
    let Le = e.currentTime;
    le > R + .02 && Le - le > .1 && fo(.9);
    let ke = ee === "playing" || ee === "intro";
    fe += ((ue ? 0 : ee === "title" ? .6 : ee === "dead" ? .7 : 1) - fe) * ye(1.2);
    oe += ((ue ? 0 : 1) - oe) * ye(12);
    z.gain.value = oe;
    Z += ((ee === "dead" ? .85 : 0) - Z) * ye(ee === "dead" ? 3 : .9);
    S.frequency.value = 2e4 * Math.pow(.03, pi(Z, 0, 1));
    w.gain.value = me;
    (nn -= te) <= 0 && (nn = 3 + s() * 6, ut = .12 + s() * .88);
    pt += (ut - pt) * ye(.5);
    Oe.rain.setGain(fe * (1 - .93 * P) * .95);
    Oe.rainIn.setGain(fe * P * .95);
    Oe.wind.setGain(fe * (.3 + .7 * pt) * (1 - .65 * P) * (campaignAmbience ? .03 : .75));
    Oe.wind.setPitch(.9 + .25 * pt);
    Oe.sea.setGain(fe * (1 - .5 * P) * 1);
    Oe.sea.setPos([33, -1, pi(re.z, -28, 26)]);
    !campaignAmbience && !ue && (ke || ee === "title" || ee === "complete") && Os(te, ee === "title" ? .7 : 1);
    ue || zo(te);
    Y = Math.max(0, Y - te * (pn.size ? .045 : .14));
    let ct = ke || ue ? Math.max(V, Re.autoIntensity ? Math.max(.15, Y) : 0) : 0;
    if (L += (ct - L) * ye(2), J += (1 - J) * ye(3.5), O.gain.value = J * (ue ? .45 : 1), Xe.on) {
      let De = we(L);
      let it = ye(1 / .5);
      for (let gt = 0; gt < tm.length; gt++) {
        let Ot = Xe.layers[tm[gt]];
        Ot.c += (De[gt] - Ot.c) * it;
        Ot.g.gain.value = Ot.c;
      }
    }
    episodeScore?.update({ intensity: L, paused: ue, state: ee });
    for (let De of We) {
      De.vC += (De.vT - De.vC) * ye(4);
      De.gC += (De.gT * De.vC - De.gC) * ye(De.rate);
      De.g.gain.value = De.gC;
      De.src && Math.abs(De.pT - De.pC) > 1e-4 && (De.pC += (De.pT - De.pC) * ye(8), De.src.playbackRate.value = De.pC);
    }
  }
  async function de(te) {
    te = te || {};
    await x;
    let he = e.sampleRate;
    let pe = te.seconds || 10;
    let ge = new OfflineAudioContext(2, he * pe, he);
    let ye = new Map();
    let Le = {
      on(Tt, Ai) {
        ye.has(Tt) || ye.set(Tt, []);
        ye.get(Tt).push(Ai);
      },
      emit(Tt, Ai) {
        for (let sn of ye.get(Tt) || []) sn(Ai);
      }
    };
    let ke = new Float32Array(16);
    ke[0] = ke[5] = ke[10] = ke[15] = 1;
    ke[13] = 1.7;
    let Ue = [{
      type: "gull",
      alive: true,
      pos: {
        x: 6,
        y: 4,
        z: -9
      }
    }, {
      type: "hound",
      alive: true,
      pos: {
        x: -8,
        y: 0,
        z: -14
      }
    }, {
      type: "gull",
      alive: true,
      pos: {
        x: 0,
        y: 5,
        z: -30
      }
    }];
    let ct = {
      min: {
        x: -99,
        y: -9,
        z: -99
      },
      max: {
        x: 99,
        y: 99,
        z: 99
      }
    };
    let De = {
      events: Le,
      params: {},
      camera: {
        matrixWorld: {
          elements: ke
        }
      },
      enemies: {
        list: []
      },
      level: {
        interiorBoxes: te.interior ? [ct] : [{
          min: {
            x: 500,
            y: 0,
            z: 500
          },
          max: {
            x: 501,
            y: 1,
            z: 501
          }
        }],
        objectives: [{
          id: "A",
          pos: {
            x: 4,
            y: 0,
            z: 3
          }
        }]
      }
    };
    let it = createAudioMixer(De, ge, {
      bufs: r
    });
    let gt = .02;
    let Ot = 0;
    let xn = Tt => {
      let Ai = Tt * gt;
      if (Tt === 0 && Le.emit("game:state", {
        state: "playing"
      }), Ai < 3 && Tt % 23 === 0 && Le.emit("player:step", {
        surface: "concrete",
        sprint: false
      }), Tt === 150) {
        for (let sn of Ue) {
          De.enemies.list.push(sn);
          Le.emit("enemy:spawn", {
            enemy: sn
          });
        }
        Le.emit("enemy:alert", {
          enemy: Ue[0]
        });
        it.setIntensity(1);
      }
      Ai >= 3 && Ai < 6 && (Tt % 4 === 0 && (Ai < 4.2 || Ai > 4.8) && (Le.emit("weapon:fire", {}), Le.emit("impact", {
        point: {
          x: 4,
          y: 1,
          z: -12
        },
        surface: Tt % 8 ? "metal" : "concrete",
        from: "player"
      }), Le.emit("shell:bounce", {
        pos: {
          x: .6,
          y: 0,
          z: .2
        },
        surface: "concrete"
      })), Tt % 13 === 0 && Le.emit("enemy:fire", {
        enemy: Ue[0],
        pos: Ue[0].pos,
        type: "gull"
      }), Tt % 17 === 0 && Le.emit("enemy:fire", {
        enemy: Ue[1],
        pos: Ue[1].pos,
        type: "hound"
      }), Tt % 25 === 0 && Le.emit("enemy:step", {
        pos: Ue[1].pos,
        type: "hound"
      }));
      Tt === 300 && Le.emit("explosion", {
        pos: {
          x: 3,
          y: 0,
          z: -5
        },
        size: 1.5
      });
      Tt === 350 && Le.emit("player:hit", {
        amount: 20
      });
      Tt === 360 && (Ue[0].alive = false, Le.emit("enemy:killed", {
        enemy: Ue[0],
        pos: Ue[0].pos,
        type: "gull"
      }));
      Tt === 400 && (Le.emit("objective:done", {
        id: "A",
        index: 0,
        total: 3
      }), it.setIntensity(.15));
    };
    for (let Tt = 1; Tt * gt < pe - .01; Tt++) ge.suspend(Tt * gt).then(() => {
      xn(Tt);
      it.update(gt);
      Ot++;
      ge.resume();
    });
    xn(0);
    it.update(gt);
    let $t = performance.now();
    let Ht = await ge.startRendering();
    let Je = performance.now() - $t;
    let Pt = {
      interior: !!te.interior,
      renderMs: Math.round(Je),
      steps: Ot,
      peak: 0,
      over: 0,
      nan: 0,
      rmsDb: [],
      inst: it.debug()
    };
    let Vt = Ht.getChannelData(0);
    let ss = Ht.getChannelData(1);
    let Hs = Math.round(he / 2);
    for (let Tt = 0; Tt * Hs < Vt.length; Tt++) {
      let Ai = 0;
      for (let sn = Tt * Hs; sn < (Tt + 1) * Hs && sn < Vt.length; sn++) {
        let os = Vt[sn];
        let rs = ss[sn];
        (!(Math.abs(os) < 1e9) || !(Math.abs(rs) < 1e9)) && Pt.nan++;
        let Ni = Math.max(Math.abs(os), Math.abs(rs));
        Ni > Pt.peak && (Pt.peak = Ni);
        Ni >= .999 && Pt.over++;
        Ai += os * os + rs * rs;
      }
      Pt.rmsDb.push(+(10 * Math.log10(Ai / (2 * Hs) + 1e-12)).toFixed(1));
    }
    Pt.peak = +Pt.peak.toFixed(3);
    return Pt;
  }
  Object.assign(Re, {
    ctx: e,
    resume: yr,
    play: ze,
    loop: Be,
    update: lu,
    ready: x,
    selfTest: de,
    setIntensity(te) {
      V = pi(+te || 0, 0, 1);
    },
    setInterior(te) {
      B = pi(+te || 0, 0, 1);
    },
    setVolume(te) {
      me = pi(+te, 0, 1);
      Number.isFinite(me) || (me = .9);
      w.gain.value = me;
    },
    setPaused(te) {
      ue = !!te;
    },
    names: Object.keys(Go).filter(te => !Go[te].ir),
    get intensity() {
      return L;
    },
    get interior() {
      return P;
    },
    debug() {
      let te = 0;
      let he = e.currentTime;
      for (let pe in X) for (let ge of X[pe]) ge.end > he && te++;
      return {
        state: e.state,
        sampleRate: e.sampleRate,
        buffers: c,
        queued: d.length,
        genMs: Math.round(l),
        bootMs: Math.round(u),
        voices: te,
        loops: We.size,
        tracked: pn.size,
        music: episodeScore ? episodeScore.debug().active : Xe.on,
        episodeScore: episodeScore?.debug() || null,
        ambience: {
          rain: Oe.rain.gT || 0,
          rainInterior: Oe.rainIn.gT || 0,
          wind: Oe.wind.gT || 0,
          sea: Oe.sea.gT || 0,
          harborEvents: !campaignAmbience
        },
        intensity: +L.toFixed(2),
        interior: +P.toFixed(2),
        gameState: ee,
        reverb: [!!D.buffer, !!C.buffer]
      };
    }
  });
  return Re;
}
export { createAudio };
