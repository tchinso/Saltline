import { Color, Euler, Group, Matrix4, Mesh, MeshStandardMaterial, Quaternion, Vector3 } from '../../vendor/three.js';
import { Kc, mi, w_ } from './geometry.js';
import { clamp, damp, lerp, saturate } from '../core/math.js';
import { Bf, Wv } from './materials.js';
import { F_, N_, U_ } from './decals.js';
import { Vv } from './hands.js';
import { VIEWMODEL_LAYER, WORLD_LAYER } from '../core/config.js';
var gi = Vector3;
var fm = Quaternion;
var Gv = 30;
var B_ = 150;
var O_ = 720;
var H_ = 26;
var V_ = 300;
var eu = {
  p: [.118, -.122, -.275],
  r: [.034, .085, -.03]
};
var qv = {
  p: [0, -mi.sightY, -.135],
  r: [0, 0, 0]
};
var tu = {
  p: [-.035, .004, .03],
  r: [-.04, .62, .26]
};
var nu = {
  p: [-.03, .1, -.02],
  r: [.46, .22, -.8]
};
var W_ = 2.1;
var G_ = 2.72;
var Yo = i => (i = saturate(i), i * i * i * (i * (6 * i - 15) + 10));
var pa = (i, e) => ({
  x: 0,
  v: 0,
  k: i,
  c: e
});
function ma(i, e, t) {
  let n = t > .012 ? Math.ceil(t / .008) : 1;
  let s = t / n;
  for (let o = 0; o < n; o++) {
    i.v += ((e - i.x) * i.k - i.v * i.c) * s;
    i.x += i.v * s;
  }
  return i.x;
}
var i0 = (i, e, t, n = "XYZ") => new fm().setFromEuler(new Euler(i, e, t, n));
async function createWeapon(game) {
  let e = new Group();
  e.name = "viewmodel-pac9";
  let t = w_();
  let n = {
    anodized_black: 2,
    gunmetal: 2,
    brass: 4,
    glove_fabric: 3,
    rubber: 4
  };
  let s = Me => game.mats.get(Me, {
    triplanar: true,
    vertexColors: true,
    scale: n[Me] || 1
  });
  let o = (Me, we) => {
    let be = new Mesh(Me, we);
    be.castShadow = false;
    be.receiveShadow = true;
    be.frustumCulled = false;
    return be;
  };
  let r = new MeshStandardMaterial({
    color: new Color(.0085, .009, .0105),
    roughness: .4,
    metalness: .45,
    vertexColors: true
  });
  r.name = "pac9_anodised";
  Bf(r, 0);
  let a = new MeshStandardMaterial({
    color: 16777215,
    roughness: .92,
    metalness: 0,
    vertexColors: true
  });
  a.name = "pac9_matte";
  let l = new MeshStandardMaterial({
    color: new Color(.016, .016, .0165),
    roughness: .5,
    metalness: .7,
    vertexColors: true
  });
  l.name = "pac9_phosphate";
  Bf(l, 1);
  let c = new MeshStandardMaterial({
    color: new Color(.0125, .0128, .0135),
    roughness: .62,
    metalness: 0,
    vertexColors: true
  });
  c.name = "pac9_polymer";
  Bf(c, 2);
  let u = new MeshStandardMaterial({
    color: new Color(.105, .08, .05),
    roughness: .62,
    metalness: 0,
    vertexColors: true
  });
  u.name = "pac9_polymer_tan";
  Bf(u, 2);
  e.add(o(t.ano, r), o(t.gun, l), o(t.poly, c), o(t.plain, a));
  let h = o(t.bolt, l);
  e.add(h);
  let f = new Group();
  let p = new gi().fromArray(mi.magPos);
  f.position.copy(p);
  let d = o(t.round, s("brass"));
  f.add(o(t.mag, u), d);
  e.add(f);
  let v = null;
  let g = null;
  let x = null;
  try {
    v = F_([["model", -.0168, -.0315, .064, .0095, "L"], ["maker", -.0168, -.042, .064, .003, "L"], ["cal", -.0168, -.0465, .064, .0028, "L"], ["prop", -.0168, -.071, .066, .0026, "L"], ["auto", -.0168, -.027, -.0335, .0036, "L"], ["semi", -.0168, -.0262, -.049, .0036, "L"], ["safe", -.0168, -.0362, -.062, .0036, "L"], ["rack", -.0168, -.004, -.205, .02, "L"], ["warn", -.0181, -.01, .03, .0062, "L"], ["optic", -.0195, .0735, .021, .0024, "L"], ["model", .0168, -.0315, .068, .0095, "R"], ["warn", .0168, -.066, .066, .0075, "R"], ["rack", .0168, -.004, -.205, .02, "R"], ["auto", .0168, -.027, -.0335, .0036, "R"], ["safe", .0168, -.0362, -.062, .0036, "R"], ["optic", .0195, .0735, .021, .0024, "R"], ["cal", .0181, .0245, -.055, .0026, "R"], ["r2", 0, .04365, -.0816, .003, "T"], ["r4", 0, .04365, -.0616, .003, "T"], ["r6", 0, .04365, .0584, .003, "T"], ["r8", 0, .04365, .0784, .003, "T"], ["r10", 0, .04365, .0984, .003, "T"], ["r12", 0, .04365, .1184, .003, "T"]]);
    v.castShadow = false;
    v.receiveShadow = true;
    v.frustumCulled = false;
    e.add(v);
  } catch (Me) {
    console.warn("[weapon] markings skipped: " + Me);
  }
  g = U_(mi.window.map(Me => [Me[0] * 1.01, (Me[1] - mi.sightY) * 1.01 + mi.sightY]), mi.lensF + .0025);
  g.frustumCulled = false;
  e.add(g);
  x = N_();
  x.position.fromArray(mi.muzzle);
  x.visible = false;
  e.add(x);
  let y = (Me, we, be) => {
    let Oe = new gi(we[0], we[1], we[2]).normalize().applyQuaternion(Me.clone().invert());
    be && (Oe.x *= -1);
    return [Oe.x, Oe.y, Oe.z];
  };
  let b = i0(-.24, 0, 0).multiply(i0(0, 0, -Math.PI / 2));
  let m = Vv({
    mirror: false,
    fingers: [null, [.62, 1.72, .8, 0], [.68, 1.7, .8, -.03], [.74, 1.66, .8, -.09]],
    indexPoses: [[.1, .16, .1, .05], [.46, 1.15, .5, 0]],
    thumb: [y(b, [-.85, .05, -.5]), y(b, [-.6, -.05, -.8]), y(b, [-.05, -.2, -.97])],
    forearm: y(b, [.27, -.44, .86]),
    sleeve: .34
  });
  let A = new Group();
  A.quaternion.copy(b);
  A.position.fromArray(mi.grip).sub(new gi(.006, -.031, -.085).applyQuaternion(b));
  let _ = s("glove_fabric");
  A.add(o(m.fabric, _));
  let M = o(m.index[0].clone(), _);
  A.add(M);
  e.add(A);
  let E = m.index[0].attributes;
  let w = m.index[1].attributes;
  let S = -1;
  function z(Me) {
    if (Math.abs(Me - S) < .004) return;
    S = Me;
    let we = M.geometry.attributes.position;
    let be = M.geometry.attributes.normal;
    let Oe = E.position.array;
    let pt = w.position.array;
    let ut = E.normal.array;
    let nn = w.normal.array;
    for (let bt = 0; bt < Oe.length; bt++) {
      we.array[bt] = Oe[bt] + (pt[bt] - Oe[bt]) * Me;
      be.array[bt] = ut[bt] + (nn[bt] - ut[bt]) * Me;
    }
    we.needsUpdate = true;
    be.needsUpdate = true;
  }
  let H = i0(0, 0, Math.PI / 2).multiply(i0(.06, 0, 0));
  let O = Vv({
    mirror: true,
    fingers: [[1.27, 1.42, .75, .02], [1.3, 1.45, .75, 0], [1.3, 1.45, .75, -.02], [1.33, 1.45, .75, -.05]],
    thumb: [y(H, [0, .25, -.97], true), y(H, [.05, .1, -.99], true), y(H, [0, 0, -1], true)],
    forearm: y(H, [-.5, -.35, .79], true),
    sleeve: .34
  });
  let q = new Group();
  q.add(o(O.fabric, _));
  e.add(q);
  let U = new gi(0, -.015, -.055);
  let T = (Me, we, be = U) => ({
    q: Me.clone(),
    p: new gi(we[0], we[1], we[2]).sub(be.clone().applyQuaternion(Me))
  });
  let D = (Me, we, be, Oe, pt = null) => ({
    q: pt ? pt.clone() : Me.q.clone(),
    p: Me.p.clone().add(new gi(we, be, Oe))
  });
  let C = i0(0, 0, Math.PI / 2).multiply(i0(.12, 0, 0));
  let G = T(H, [-.015, -.062, -.236]);
  let j = T(C, [-.0135, -.15, -.0745]);
  let N = D(j, -.035, -.02, .01);
  let Q = D(j, -.06, -.3, .13, C.clone().multiply(i0(-.5, 0, .25)));
  let K = D(j, 0, -.035, .004);
  let ie = D(j, -.004, -.06, 0);
  let F = D(j, 0, -.012, 0);
  let X = i0(-.6, 0, 0).multiply(new fm().setFromRotationMatrix(new Matrix4().makeBasis(new gi(0, 0, 1), new gi(-1, 0, 0), new gi(0, -1, 0))));
  let ne = T(X, [mi.handlePos[0] - .004, mi.handlePos[1], mi.handlePos[2]], new gi(0, -.024, -.118));
  let re = D(ne, 0, 0, mi.boltTravel);
  let $ = [[0, G], [.1, G], [.36, N], [.44, j], [.5, j], [.8, Q], [.98, Q], [1.28, K], [1.35, j], [1.45, ie], [1.52, F], [1.62, j], [1.7, N], [2.02, G], [9, G]];
  let ue = [...$.slice(0, 12), [1.7, N], [1.96, ne], [2.02, ne], [2.14, re], [2.19, re], [2.26, ne], [2.36, ne], [2.66, G], [9, G]];
  let me = .47;
  let ee = 1.345;
  let B = 2.02;
  let P = 2.14;
  let V = 2.19;
  let Y = new gi();
  let L = new fm();
  let Z = new fm();
  let J = new gi();
  let oe = new gi();
  let fe = new gi();
  function le(Me, we) {
    let be = 0;
    for (; be < Me.length - 2 && we > Me[be + 1][0];) be++;
    let Oe = Me[be];
    let pt = Me[be + 1];
    let ut = Yo((we - Oe[0]) / Math.max(1e-4, pt[0] - Oe[0]));
    Y.copy(Oe[1].p).lerp(pt[1].p, ut);
    L.copy(Oe[1].q).slerp(pt[1].q, ut);
  }
  q.position.copy(G.p);
  q.quaternion.copy(G.q);
  let R = C.clone().invert();
  e.traverse(Me => {
    Me.layers.set(VIEWMODEL_LAYER);
  });
  game.camera.add(e);
  let I = Object.values(t).reduce((Me, we) => Me + Kc(we), 0) + Kc(m.fabric) + Kc(m.index[0]) + Kc(O.fabric) + (v ? Kc(v.geometry) : 0) + 2;
  let se = 0;
  e.traverse(Me => {
    Me.isMesh && se++;
  });
  console.log(`[weapon] ${mi.name}: ${Math.round(I)} tris, ${se} meshes (flash only while firing)`);
  let ae = game.rng && game.rng.fork ? game.rng.fork() : Math.random;
  let k = {
    t: 0,
    cooldown: 0,
    prevFire: false,
    dryDone: false,
    autoReload: -1,
    reload: null,
    burst: 0,
    lastShot: -9,
    bloom: 0,
    heat: 0,
    smoke: 0,
    smokeTick: 0,
    adsLin: 0,
    adsE: 0,
    sprintT: 0,
    reloadW: 0,
    rackW: 0,
    bobPhase: 0,
    bobAmt: 0,
    finger: 0,
    boltT: 9,
    boltLocked: false,
    flashT: 0,
    flashDur: .05,
    recPhase: 0,
    wasGround: true,
    lastVy: 0,
    spreadS: .0125,
    idleT: 0,
    inspect: -1,
    kZ: pa(520, 30),
    kP: pa(380, 26),
    kY: pa(300, 22),
    kR: pa(300, 20),
    swY: pa(110, 15),
    swP: pa(110, 15),
    jY: pa(140, 13),
    jP: pa(140, 13),
    bump: pa(600, 30)
  };
  let ce = {
    freeze: false,
    reloadT: null,
    empty: false,
    flash: false,
    noFire: false
  };
  let ve = {
    name: mi.name,
    ammo: Gv,
    magSize: Gv,
    reserve: B_,
    state: "idle",
    ads: 0,
    spread: .0125,
    damage: H_,
    rpm: O_,
    root: e,
    debug: ce,
    info: {
      tris: Math.round(I),
      meshes: se
    },
    update: Xe,
    reset: _e,
    setVisible(Me) {
      e.visible = !!Me;
    },
    muzzleWorld: Re,
    reloadNow: Fe,
    addAmmo(Me) {
      ve.reserve += Me;
    },
    setWetness(Me) {
      Wv.value = Math.max(0, Math.min(1, +Me || 0));
    },
    snap() {
      k.adsLin = game.input.ads ? 1 : 0;
      for (let Me of ["kZ", "kP", "kY", "kR", "swY", "swP", "jY", "jP", "bump"]) {
        k[Me].x = 0;
        k[Me].v = 0;
      }
      k.sprintT = game.player.sprinting ? 1 : 0;
    }
  };
  function _e() {
    ve.ammo = Gv;
    ve.reserve = B_;
    ve.state = "idle";
    ve.ads = 0;
    Object.assign(k, {
      cooldown: 0,
      prevFire: false,
      dryDone: false,
      autoReload: -1,
      reload: null,
      burst: 0,
      lastShot: -9,
      bloom: 0,
      heat: 0,
      smoke: 0,
      adsLin: 0,
      adsE: 0,
      sprintT: 0,
      reloadW: 0,
      boltT: 9,
      boltLocked: false,
      flashT: 0,
      idleT: 0,
      inspect: -1
    });
    for (let Me of ["kZ", "kP", "kY", "kR", "swY", "swP", "jY", "jP", "bump"]) {
      k[Me].x = 0;
      k[Me].v = 0;
    }
    d.visible = true;
    f.visible = true;
    f.position.copy(p);
    f.quaternion.identity();
    q.position.copy(G.p);
    q.quaternion.copy(G.q);
  }
  let Te = new Matrix4();
  function Pe(Me, we) {
    e.updateMatrix();
    we.fromArray(Me).applyMatrix4(e.matrix);
    let be = game.camera;
    let Oe = Math.tan(be.fov * Math.PI / 360) / Math.tan(game.viewCamera.fov * Math.PI / 360);
    we.x *= Oe;
    we.y *= Oe;
    return we.applyQuaternion(be.quaternion).add(be.position);
  }
  function Re(Me = new gi()) {
    return Pe(mi.muzzle, Me);
  }
  function Fe() {
    if (k.reload || ve.ammo >= ve.magSize || ve.reserve <= 0) return false;
    let Me = ve.ammo <= 0;
    k.reload = {
      t: 0,
      T: Me ? G_ : W_,
      empty: Me,
      f: {}
    };
    k.autoReload = -1;
    game.events.emit("weapon:reload", {
      phase: "start",
      empty: Me
    });
    return true;
  }
  let ze = new gi();
  let We = new gi();
  let Ne = new gi();
  let dt = new gi();
  let xe = new gi();
  let Ie = new gi();
  function Be() {
    let Me = game.player;
    let we = game.camera;
    ve.ammo--;
    k.burst++;
    k.lastShot = k.t;
    k.heat = Math.min(1.3, k.heat + .05);
    let be = ve.spread;
    let Oe = ae() * Math.PI * 2;
    let pt = Math.tan(be) * Math.sqrt(ae());
    ze.set(Math.cos(Oe) * pt, Math.sin(Oe) * pt, -1).normalize().applyQuaternion(we.quaternion);
    Ie.copy(Me.eye || we.position);
    let ut = null;
    try {
      ut = game.combat.playerShot(Ie, ze, {
        damage: H_,
        range: V_
      });
    } catch {}
    ut && ut.point ? Ne.copy(ut.point) : Ne.copy(Ie).addScaledVector(ze, V_);
    Re(We);
    let nn = game.fx;
    nn && (nn.tracer && nn.tracer(We, Ne), nn.shell && (Pe(mi.eject, dt), xe.set(2 + ae() * 1.2, 1.2 + ae() * .8, .5 - ae() * .6).applyQuaternion(we.quaternion), Me.vel && xe.add(Me.vel), nn.shell(dt, xe)));
    game.render && game.render.lightPool && game.render.lightPool.flash(We, 16756832, 45, 9, .05);
    game.events.emit("weapon:fire", {
      origin: Ie,
      dir: ze,
      muzzle: We,
      ads: k.adsE
    });
    let bt = lerp(1, .55, k.adsE) * (Me.crouching ? .85 : 1);
    let Os = k.burst;
    let pn = Os <= 9 ? 1 : .38;
    let Ti = (Os < 4 ? (ae() - .5) * .0022 : Math.sin(Os * .57 + k.recPhase) * .0042 + (ae() - .5) * .002) * bt;
    Me.addRecoil && Me.addRecoil(.0068 * pn * bt * (.85 + ae() * .3), Ti);
    Me.addShake && Me.addShake(.12 * bt);
    k.kZ.v += 1.5 * lerp(1, .6, k.adsE);
    k.kP.v += 1.5 * bt;
    k.kY.v += (ae() - .5) * 1 * bt;
    k.kR.v += (ae() - .5) * 1.8 * bt;
    k.bloom = Math.min(1, k.bloom + .17);
    k.flashT = k.flashDur = .036 + ae() * .02;
    let ho = x.material.uniforms;
    ho.uSeed.value = ae() * 100;
    ho.uJet.value = .6 + ae() * .6;
    x.rotation.z = (ae() - .5) * .4;
    let Rs = (.8 + ae() * .5) * lerp(1, .62, k.adsE);
    x.scale.set(Rs, Rs, Rs * (.8 + ae() * .5));
    k.boltT = 0;
    ve.ammo <= 0 && (k.boltLocked = true, d.visible = false);
  }
  function Xe(Me) {
    let we = game.player;
    let be = game.input;
    if (!we || !be || !we.alive) {
      k.prevFire = false;
      x && (x.visible = false);
      return;
    }
    k.t += Me;
    let Oe = !!be.fire && e.visible && !ce.noFire;
    let pt = Oe && !k.prevFire;
    k.prevFire = Oe;
    Oe || (k.dryDone = false);
    let ut = !!we.sprinting && !Oe && !be.ads && !k.reload;
    k.sprintT = damp(k.sprintT, ut ? 1 : 0, 9, Me);
    be.pressed && be.pressed("reload") && Fe();
    k.autoReload >= 0 && (k.autoReload -= Me, k.autoReload < 0 && Fe());
    let nn = 0;
    if (ce.reloadT != null && !k.reload && (k.reload = {
      t: 0,
      T: ce.empty ? G_ : W_,
      empty: ce.empty,
      f: {}
    }), k.reload) {
      let Je = k.reload;
      ce.reloadT != null ? Je.t = ce.reloadT : Je.t += Me;
      let Pt = Je.t;
      let Vt = (Tt, Ai) => Pt >= Ai && !Je.f[Tt] ? (Je.f[Tt] = 1, game.events.emit("weapon:reload", {
        phase: Tt,
        empty: Je.empty
      }), true) : false;
      if (Vt("magout", me) && (k.bump.v -= .25), Pt > .86 && !Je.f.fresh && (Je.f.fresh = 1, d.visible = true), Vt("magin", ee)) {
        k.bump.v += .55;
        let Tt = Math.min(ve.magSize - ve.ammo, ve.reserve);
        ve.ammo += Tt;
        ve.reserve -= Tt;
        Je.empty || (k.boltLocked = false);
      }
      Pt >= 1.5 && !Je.f.tap && (Je.f.tap = 1, k.bump.v += .4);
      Je.empty && (Pt >= B && (nn = Pt < P ? Yo((Pt - B) / (P - B)) : Pt < V ? 1 : Math.max(0, 1 - (Pt - V) / .035)), Vt("bolt", V) && (k.boltLocked = false, k.bump.v += .3, k.kZ.v -= .5));
      le(Je.empty ? ue : $, Pt);
      q.position.copy(Y);
      q.quaternion.copy(L);
      Pt >= me && Pt < ee ? (Z.copy(L).multiply(R), f.quaternion.copy(Z), f.position.copy(p).sub(j.p).applyQuaternion(Z).add(Y)) : (f.quaternion.identity(), f.position.copy(p));
      let ss = Yo(Pt / .3);
      let Hs = 1 - Yo((Pt - (Je.T - .46)) / .4);
      k.reloadW = Math.min(ss, Hs);
      k.rackW = Je.empty ? Yo((Pt - 1.62) / .3) * Hs : 0;
      Pt >= Je.T && ce.reloadT == null && (k.reload = null, k.reloadW = 0, k.rackW = 0, game.events.emit("weapon:reload", {
        phase: "done"
      }), q.position.copy(G.p), q.quaternion.copy(G.q));
    }
    k.cooldown -= Me;
    let bt = !k.reload && k.sprintT < .45;
    if (Oe && bt) if (ve.ammo > 0) {
      let Je = 0;
      for (; k.cooldown <= 0 && ve.ammo > 0 && Je < 3;) {
        Be();
        k.cooldown += 60 / O_;
        Je++;
      }
    } else k.dryDone || (k.dryDone = true, game.events.emit("weapon:dry", {}), k.bump.v -= .08, ve.reserve > 0 && (k.autoReload = .32));
    k.cooldown < 0 && (k.cooldown = Math.max(k.cooldown, -.001));
    k.t - k.lastShot > .24 && (k.burst > 0 && (k.recPhase = ae() * 6.28), k.burst = 0);
    k.bloom = Math.max(0, k.bloom - Me * 1.5);
    k.t - k.lastShot > .11 && k.t - k.lastShot < .11 + Me * 1.5 && k.heat > .4 && (k.smoke = Math.min(1.6, k.heat * 1.3));
    k.smoke > 0 && (k.smoke -= Me, k.smokeTick -= Me, k.smokeTick <= 0 && game.fx && game.fx.smoke && (k.smokeTick = .085, Re(We), game.fx.smoke(We, {
      size: .1 + k.smoke * .06,
      life: 1.3,
      rise: .5,
      count: 1,
      alpha: .22
    })));
    k.heat = Math.max(0, k.heat - Me * .2);
    let Os = !!be.ads && !k.reload && k.sprintT < .35;
    k.adsLin = clamp(k.adsLin + (Os ? Me : -Me) / .18, 0, 1);
    k.adsE = Yo(k.adsLin);
    ve.ads = k.adsE;
    let pn = we.speed || 0;
    let Ti = saturate(pn / 6);
    let ho = lerp(.0125, .0012, k.adsE) + Ti * lerp(.013, .004, k.adsE) + k.bloom * lerp(.0065, .0022, k.adsE) + (we.onGround === false ? .022 : 0) - (we.crouching ? .002 * (1 - k.adsE) : 0);
    k.spreadS = damp(k.spreadS, ho, 18, Me);
    ve.spread = k.spreadS;
    Oe || !!be.ads || !!k.reload || pn > .2 || be.look && Math.abs(be.look.dx) + Math.abs(be.look.dy) > .002 || k.sprintT > .1 ? (k.idleT = 0, k.inspect >= 0 && (k.inspect = Math.max(k.inspect, 2.9))) : k.idleT += Me;
    k.inspect < 0 && k.idleT > 24 && (k.inspect = 0);
    let Un = 0;
    let zo = 0;
    let $i = 0;
    if (k.inspect >= 0) {
      let Je = k.inspect += Me;
      Un = Yo(Je / .5) * (1 - Yo((Je - 1.4) / .5));
      zo = Yo((Je - 1.5) / .5) * (1 - Yo((Je - 2.8) / .5));
      $i = Yo(Je / .5) * (1 - Yo((Je - 2.9) / .5));
      Je > 3.5 && (k.inspect = -1, k.idleT = 0);
    }
    ve.state = k.reload ? "reloading" : k.inspect >= 0 ? "inspect" : k.sprintT > .5 ? "sprinting" : k.t - k.lastShot < .14 ? "firing" : "idle";
    k.boltT += Me;
    let ya = .072;
    let ba = k.boltT < ya ? Math.sin(Math.PI * k.boltT / ya) : 0;
    k.boltLocked && k.boltT > ya * .5 && (ba = Math.max(ba, .86));
    h.position.z = mi.boltTravel * Math.max(ba * .95, nn);
    k.finger = damp(k.finger, Oe && bt || ce.flash ? 1 : 0, 30, Me);
    z(k.finger);
    let Hn = x.material.uniforms;
    if (ce.flash && (k.flashT = k.flashDur = .05, Hn.uSeed.value = 3.7), k.flashT -= Me, Hn.uInt.value = k.flashT > 0 ? 9.5 * Math.sqrt(Math.max(0, k.flashT / k.flashDur)) : 0, Hn.uHeat.value = saturate((k.heat - .45) / .8) * 2.2, x.visible = Hn.uInt.value > 0 || Hn.uHeat.value > .02, ce.freeze) return;
    let fo = we.onGround !== false;
    let ln = we.vel ? we.vel.y : 0;
    k.bobAmt = damp(k.bobAmt, fo ? saturate(pn / 3.6) : 0, 8, Me);
    k.bobPhase += Me * (pn > .3 && fo ? 5.2 + pn * 1.55 : 0);
    let Zo = k.bobPhase;
    let yr = k.bobAmt * lerp(1, .12, k.adsE) * (1 + k.sprintT * 1.4);
    let lu = Math.sin(Zo) * .006 * yr;
    let de = (Math.sin(2 * Zo) * .0042 - Math.pow(.5 + .5 * Math.cos(2 * Zo + .6), 4) * .0048) * yr;
    let te = lerp(1, .3, k.adsE);
    let he = k.t;
    let pe = lerp(1, .4, k.adsE);
    if (k.swY.v += clamp(be.look ? be.look.dx : 0, -.2, .2) * 3.2 * pe, k.swP.v += clamp(be.look ? be.look.dy : 0, -.2, .2) * 2.6 * pe, ma(k.swY, 0, Me), ma(k.swP, 0, Me), k.swY.x = clamp(k.swY.x, -.09, .09), k.swP.x = clamp(k.swP.x, -.07, .07), k.wasGround && !fo && ln > 1 && (k.jY.v -= .22, k.jP.v += .7), !k.wasGround && fo) {
      let Je = clamp(-k.lastVy * .06, 0, .6);
      k.jY.v -= Je;
      k.jP.v -= Je * 3.2;
      k.kR.v += (ae() - .5) * Je * 2;
    }
    k.wasGround = fo;
    fo || (k.lastVy = ln);
    ma(k.jY, fo ? 0 : clamp(-ln * .0045, -.02, .024), Me);
    ma(k.jP, fo ? 0 : clamp(ln * .012, -.06, .06), Me);
    ma(k.kZ, 0, Me);
    ma(k.kP, 0, Me);
    ma(k.kY, 0, Me);
    ma(k.kR, 0, Me);
    ma(k.bump, 0, Me);
    let ge = be.move ? be.move.x : 0;
    let ye = be.move ? be.move.y : 0;
    let Le = 1 - k.adsE;
    let ke = k.adsE;
    let Ue = k.sprintT;
    let ct = k.reloadW;
    let De = k.rackW;
    let it = lerp(eu.p[0], qv.p[0], ke) + tu.p[0] * Ue + nu.p[0] * ct + lu + Math.sin(he * .85 + 1) * .0012 * te - k.swY.x * .06 - ge * .004 * Le - .035 * $i;
    let gt = lerp(eu.p[1], qv.p[1], ke) + tu.p[1] * Ue + nu.p[1] * ct + de + Math.sin(he * 1.7) * .0016 * te + k.swP.x * .05 + k.jY.x + k.bump.x * .6 + .045 * $i;
    let Ot = lerp(eu.p[2], qv.p[2], ke) + tu.p[2] * Ue + nu.p[2] * ct + k.kZ.x * .55 + ye * .004 * Le * (1 - Ue);
    let xn = eu.r[0] * Le + tu.r[0] * Ue + nu.r[0] * ct - .16 * De + Math.sin(he * 1.7 + .8) * .0035 * te + Math.sin(2 * Zo + .5) * .008 * yr + k.swP.x + k.jP.x + k.kP.x + k.bump.x * 1.5 + .3 * $i;
    let $t = eu.r[1] * Le + tu.r[1] * Ue + nu.r[1] * ct + Math.sin(he * .6) * .002 * te + Math.sin(Zo) * .01 * yr + k.swY.x + k.kY.x + .18 * $i + .25 * zo;
    let Ht = eu.r[2] * Le + tu.r[2] * Ue + nu.r[2] * ct + .62 * De + Math.sin(Zo) * .014 * yr + k.swY.x * .7 - ge * .035 * Le + k.kR.x - .75 * Un + .55 * zo + Math.sin(he * .5) * .004 * te;
    e.position.set(it, gt, Ot);
    e.rotation.set(xn, $t, Ht, "YXZ");
  }
  _e();
  return ve;
}
async function showcaseWeapon(i) {
  let e = await createWeapon(i);
  i.weapon = e;
  let t = e.root;
  let n = new gi(0, 1.68, 4);
  let s = {
    south: [.28, -.01, 1],
    east: [1, 0, .25],
    north: [-.2, -.01, -1],
    west: [-1, 0, .1],
    nw: [-.75, -.01, -.65]
  };
  let o = {
    side: [Math.PI, [1.12, 1.3, .11], [0, 1.235, .11], 30],
    right: [0, [1.12, 1.3, -.11], [0, 1.235, -.11], 30],
    top: [Math.PI * .86, [.62, 1.8, -.42], [0, 1.24, .12], 32],
    hands: [Math.PI, [.4, 1.4, .02], [.02, 1.215, .25], 30],
    rhand: [0, [.36, 1.22, .27], [.03, 1.16, .09], 30],
    muzzle: [Math.PI, [.26, 1.37, .98], [0, 1.262, .44], 30],
    optic: [Math.PI, [.2, 1.4, -.26], [0, 1.31, .02], 30],
    lower: [Math.PI, [.34, 1.26, .04], [0, 1.2, .03], 30]
  };
  let r = window.__setShot;
  let a = null;
  function l(u, h = {}) {
    a = u;
    let f = o[u];
    let p = i.input;
    let d = i.player;
    p.ads = false;
    p.fire = false;
    d.sprinting = false;
    d.speed = 0;
    e.debug.reloadT = null;
    e.debug.flash = false;
    e.debug.empty = false;
    e.debug.freeze = !!f;
    e.reset();
    let v;
    let g;
    let x;
    if (f) {
      i.scene.add(t);
      t.position.set(0, 1.25, 0);
      t.rotation.set(0, f[0], 0, "YXZ");
      t.traverse(y => y.layers.set(WORLD_LAYER));
      v = f[1];
      g = f[2];
      x = f[3];
      h.wt != null && (e.debug.reloadT = +h.wt, e.debug.empty = !!h.wempty);
    } else {
      i.camera.add(t);
      t.traverse(b => b.layers.set(VIEWMODEL_LAYER));
      let y = s[h.wlook] || s.south;
      v = [n.x, n.y, n.z];
      g = [n.x + y[0] * 50, n.y + y[1] * 50, n.z + y[2] * 50];
      x = 74;
      u === "ads" && (p.ads = true, x = 52);
      u === "sprint" && (d.sprinting = true, d.speed = 6);
      u === "fire" && (e.debug.flash = true, h.wads && (p.ads = true, x = 52));
      (u === "reload" || u === "empty") && (e.debug.reloadT = h.wt != null ? +h.wt : .62, e.debug.empty = u === "empty");
      u === "empty" && (e.ammo = 0);
    }
    e.snap();
    e.update(.016);
    e.snap();
    r && r({
      cam: h.cam || [...v, ...g].join(","),
      fov: h.fov || x,
      exposure: h.exposure
    });
    return {
      cam: v,
      target: g
    };
  }
  window.__setShot = u => {
    u && u.wpose ? l(u.wpose, u) : r && r(u);
  };
  let c = l(i.params.wpose || "hip", i.params);
  return {
    cam: c.cam,
    target: c.target,
    update(u) {
      e.update(u);
      a === "fire" && (e.debug.flash = true);
    }
  };
}
export { createWeapon, showcaseWeapon };
