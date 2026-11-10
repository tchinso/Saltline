import { beveledBoxGeometry, cylinderGeometry, transformGeometry, tubeGeometry } from '../geometry/primitives.js';
import { ConeGeometry, LatheGeometry, Matrix4, Quaternion, RingGeometry, SphereGeometry, TorusGeometry, Vector2, Vector3 } from '../../vendor/three.js';
import { iu } from './rig.js';
var Ss = [1.15, 1.15, 1.15];
var vm = [.95, .96, .97];
var Ts = [1, .34, .08];
var s0 = [.1, .11, .12];
var ga = [.035, .035, .038];
var Of = [1, .7, .07];
var As = [1, 1, 1];
var Yn = [2.4, 2.5, 2.6];
var an = [.45, .46, .48];
var IC = [9, 9, 9.6];
var zC = [5.5, 4, 1.6];
var va = Math.PI / 2;
var ft = (i, e, t, n = .008) => beveledBoxGeometry(i, e, t, n);
var Ce = (i, e, t, n, s = 0, o = 0, r = 0, a = 1) => transformGeometry(i, {
  p: [e, t, n],
  r: [s, o, r],
  s: a
});
var ds = (i, e, t, n = 12) => cylinderGeometry(i, e, t, n);
var Ro = (i, e, t, n = 12) => transformGeometry(cylinderGeometry(i, e, t, n), {
  r: [0, 0, -va]
});
var Si = (i, e, t, n = 12) => transformGeometry(cylinderGeometry(i, e, t, n), {
  r: [va, 0, 0]
});
var mm = new Vector3();
var gm = new Vector3();
var X_ = new Quaternion();
var DC = new Vector3(0, 1, 0);
var Y_ = new Matrix4();
var LC = new Vector3(1, 1, 1);
function su(i, e, t, n = t, s = 8) {
  mm.set(i[0], i[1], i[2]);
  gm.set(e[0], e[1], e[2]);
  let o = mm.distanceTo(gm);
  let r = cylinderGeometry(n, t, o, s);
  X_.setFromUnitVectors(DC, gm.clone().sub(mm).normalize());
  Y_.compose(mm.clone().add(gm).multiplyScalar(.5), X_, LC);
  r.applyMatrix4(Y_);
  return r;
}
var Ur = (i, e = 14, t = 10, n = 1, s = 1, o = 1) => {
  let r = new SphereGeometry(i, e, t);
  r.scale(n, s, o);
  return r;
};
var $_ = (i, e, t) => Ce(Ro(.0075, .0075, .006, 6), i, e, t);
var Yv = (i, e, t) => Ce(ds(.0075, .0075, .006, 6), i, e, t);
var kC = (i, e, t) => Ce(Si(.0075, .0075, .006, 6), i, e, t);
var $v = {
  stand: .72,
  L1: .4,
  L2: .42,
  l0: .075,
  hipX: .165,
  hipY: -.01,
  hipZ: .4,
  footX: .275,
  footZ: [.37, .37, -.42, -.42],
  legs: ["FL", "FR", "RL", "RR"],
  side: [1, -1, 1, -1],
  fore: [1, 1, -1, -1],
  muzzle: [0, 0, .43],
  eye: [0, 0, .14],
  footR: .046
};
function Z_() {
  let i = $v;
  let e = new iu();
  e.bone("root", null, 0, 0, 0);
  e.bone("body", "root", 0, i.stand, 0);
  e.bone("neck", "body", 0, .06, .49);
  e.bone("head", "neck", 0, .13, .12);
  e.bone("turret", "body", 0, .152, -.03);
  e.bone("gun", "turret", 0, .095, .02);
  e.bone("antenna", "body", -.105, .15, -.46);
  e.bone("beacon", "body", .105, .2, -.455);
  for (let n = 0; n < 4; n++) {
    let s = i.legs[n];
    let o = i.side[n];
    e.bone("abd" + s, "body", o * i.hipX, i.hipY, i.fore[n] * i.hipZ);
    e.bone("thigh" + s, "abd" + s, o * i.l0, 0, 0);
    e.bone("shin" + s, "thigh" + s, 0, -i.L1, 0);
  }
  let t = (n, s, o, r, a) => e.add(n, s, o, r, a);
  t("metal", "body", Ce(ft(.27, .2, .98, .02), 0, -.01, 0), an);
  t("shell", "body", Ce(ft(.35, .05, .3, .014), 0, .125, .33), Ss);
  t("shell", "body", Ce(ft(.35, .05, .36, .014), 0, .125, -.012), Ss);
  t("shell", "body", Ce(ft(.1, .052, .36, .01), 0, .126, -.012 + 0), vm);
  for (let n of [-.15, .15]) for (let s of [.21, .45, -.17, .145]) t("metal", "body", Yv(n, .152, s), Yn);
  t("metal", "body", Ce(ft(.31, .03, .25, .006), 0, .112, -.335), As);
  for (let n = 0; n < 10; n++) t("metal", "body", Ce(ft(.007, .062, .225, .002), -.126 + n * .028, .155, -.335), Yn);
  t("metal", "body", Ce(ft(.3, .012, .02, .003), 0, .186, -.24), an);
  t("metal", "body", Ce(ft(.3, .012, .02, .003), 0, .186, -.43), an);
  for (let n of [1, -1]) {
    t("shell", "body", Ce(ft(.032, .15, .31, .012), n * .15, .022, -.075), Ss);
    t("shell", "body", Ce(ft(.032, .15, .135, .012), n * .15, .022, .1625), vm);
    t("metal", "body", tubeGeometry([[n * .168, .06, .125], [n * .182, .06, .135], [n * .182, .06, .19], [n * .168, .06, .2]], .005, 5), Yn);
    t("shell", "body", Ce(ft(.034, .016, .135, .004), n * .151, -.035, .1625), Of);
    t("shell", "body", Ce(ft(.034, .042, .46, .008), n * .151, -.078, 0), Ts);
    t("shell", "body", Ce(ft(.028, .1, .11, .008), n * .146, .01, .305), s0);
    for (let s = 0; s < 4; s++) t("metal", "body", Ce(ft(.004, .012, .085, .001), n * .161, -.02 + s * .022, .305), an);
    for (let s of [-.035, .08]) for (let o of [-.21, .06, .115, .21]) t("metal", "body", $_(n * .167, s, o), Yn);
    t("metal", "body", tubeGeometry([[n * .135, .148, -.19], [n * .135, .205, -.16], [n * .135, .212, 0], [n * .135, .205, .43], [n * .135, .148, .465]], .0105, 6), Yn);
    for (let s of [0, .26]) t("metal", "body", Ce(ds(.008, .008, .06, 6), n * .135, .178, s), Yn);
    t("shell", "body", tubeGeometry([[n * .118, -.105, -.36], [n * .132, -.118, -.2], [n * .13, -.112, .1], [n * .118, -.1, .36]], .009, 5), ga);
    t("metal", "body", Ce(new TorusGeometry(.02, .005, 5, 10), n * .17, .085, -.335, 0, va, 0), Yn);
  }
  t("shell", "body", Ce(ft(.3, .15, .075, .018), 0, -.005, .505), Ts);
  t("shell", "body", Ce(ft(.2, .07, .02, .006), 0, .012, .545), s0);
  for (let n = 0; n < 6; n++) t("shell", "body", Ce(ft(.05, .034, .014, .003), -.125 + n * .05, -.098, .538, 0, 0, 0), n % 2 ? s0 : Of);
  for (let n of [-.115, .115]) {
    t("metal", "body", Ce(Si(.021, .021, .014, 10), n, .012, .547), an);
    t("glow", "body", Ce(Si(.015, .015, .004, 10), n, .012, .556), [6.5, 4.6, 2.2], false);
  }
  t("metal", "body", Ce(ft(.24, .095, .56, .02), 0, -.145, 0), As);
  t("shell", "body", Ce(ft(.246, .03, .09, .006), 0, -.14, .12), Ts);
  t("shell", "body", Ce(ft(.246, .03, .09, .006), 0, -.14, -.12), Ts);
  t("shell", "body", Ce(ft(.29, .15, .05, .014), 0, 0, -.495), Ss);
  t("shell", "body", Ce(ft(.17, .05, .012, .004), 0, .03, -.523), s0);
  t("glow", "body", Ce(ft(.13, .012, .004, .001), 0, .03, -.531), [5, .3, .1], false);
  t("metal", "body", Ce(Si(.022, .022, .02, 10), .085, -.035, -.525), Yn);
  t("metal", "body", Ce(new TorusGeometry(.024, .006, 5, 10), -.07, -.05, -.528, va, 0, 0), Yn);
  for (let n of [-.125, .125]) for (let s of [-.055, .055]) t("metal", "body", kC(n, s, -.523), Yn);
  t("shell", "body", tubeGeometry([[.09, .15, -.2], [.13, .2, -.16], [.12, .2, -.08], [.09, .165, -.05]], .009, 5), ga);
  t("metal", "neck", su([0, -.02, -.02], [0, .11, .1], .045, .036, 10), an);
  for (let n = 0; n < 3; n++) {
    let s = .2 + n * .28;
    t("shell", "neck", su([0, -.02 + .13 * s - .008, -.02 + .12 * s - .0075], [0, -.02 + .13 * s + .008, -.02 + .12 * s + .0075], .052, .052, 10), ga);
  }
  t("shell", "neck", Ce(ft(.13, .05, .1, .012), 0, -.01, -.03), Ss);
  t("shell", "neck", tubeGeometry([[.05, -.02, -.04], [.07, .05, .02], [.06, .11, .07], [.045, .12, .1]], .007, 5), ga);
  t("shell", "head", Ce(ft(.19, .118, .25, .03), 0, 0, 0), Ss);
  t("shell", "head", Ce(ft(.168, .074, .03, .012), 0, -.004, .118), s0);
  t("lens", "head", Ce(ft(.128, .024, .006, .002), 0, .006, .1345), [1, 1, 1], false);
  for (let n of [-.056, .056]) {
    t("metal", "head", Ce(Si(.015, .015, .012, 10), n, -.022, .132), an);
    t("metal", "head", Ce(Si(.009, .009, .004, 8), n, -.022, .139), [.1, .12, .2]);
  }
  t("shell", "head", Ce(ft(.062, .008, .2, .003), 0, .06, -.005), Ts);
  t("metal", "head", Ce(Ro(.032, .032, .214, 12), 0, 0, -.055), an);
  for (let n of [1, -1]) t("shell", "head", Ce(Ro(.022, .022, .006, 10), n * .108, 0, -.055), Ts);
  t("metal", "head", Ce(ds(.036, .036, .026, 14), 0, .072, -.05), an);
  t("metal", "head", Ce(ds(.037, .037, .006, 14), 0, .074, -.05), [.2, .3, .5]);
  t("metal", "head", Ce(ft(.12, .03, .13, .008), 0, -.068, .02), As);
  for (let n of [-.08, .08]) for (let s of [-.09, .07]) t("metal", "head", Yv(n, .061, s), Yn);
  t("metal", "turret", Ce(ds(.105, .118, .034, 18), 0, 0, 0), an);
  t("metal", "turret", Ce(ft(.18, .02, .16, .005), 0, .026, 0), As);
  for (let n of [1, -1]) {
    t("shell", "turret", Ce(ft(.028, .115, .15, .012), n * .078, .085, .005), Ss);
    t("metal", "turret", Ce(Ro(.022, .022, .008, 10), n * .094, .095, .02), Yn);
  }
  t("shell", "gun", Ce(ft(.108, .086, .21, .016), 0, 0, -.012), Ss);
  t("shell", "gun", Ce(ft(.11, .02, .212, .006), 0, -.022, -.012), Ts);
  t("metal", "gun", Ce(Si(.035, .035, .11, 12), 0, 0, .145), an);
  for (let n = 0; n < 4; n++) t("metal", "gun", Ce(Si(.039, .039, .008, 12), 0, 0, .105 + n * .026), As);
  t("metal", "gun", Ce(Si(.022, .024, .3, 12), 0, 0, .25), As);
  t("metal", "gun", Ce(Si(.036, .036, .06, 10), 0, 0, .395), an);
  t("metal", "gun", Ce(ft(.08, .012, .025, .003), 0, 0, .395), [.15, .15, .15]);
  t("metal", "gun", Ce(Ro(.056, .056, .06, 14), .084, -.004, -.045), an);
  t("metal", "gun", Ce(Ro(.02, .02, .066, 8), .084, -.004, -.045), zC);
  t("metal", "gun", Ce(ft(.036, .036, .095, .008), -.03, .06, 0), an);
  t("glow", "gun", Ce(Si(.011, .011, .003, 8), -.03, .06, .049), [1.6, .12, .05], false);
  t("shell", "gun", tubeGeometry([[.05, -.03, -.11], [.06, -.07, -.13], [.04, -.09, -.1]], .008, 5), ga);
  t("metal", "body", Ce(ds(.022, .026, .05, 10), .105, .175, -.455), an);
  t("glow", "beacon", Ce(Ur(.02, 10, 6, 1, 1.25, 1), 0, .012, 0), [14, 5.5, .5], false);
  t("metal", "antenna", Ce(ds(.011, .014, .05, 8), 0, .025, 0), an);
  t("metal", "antenna", Ce(ds(.0028, .005, .62, 5), 0, .36, 0), an);
  t("shell", "antenna", Ce(Ur(.009, 6, 4), 0, .67, 0), Ts);
  for (let n = 0; n < 4; n++) {
    let s = i.legs[n];
    let o = i.side[n];
    let r = "abd" + s;
    let a = "thigh" + s;
    let l = "shin" + s;
    t("metal", r, Ce(Si(.06, .06, .17, 14), -o * .02, 0, 0), an);
    t("shell", r, Ce(ft(.11, .05, .155, .014), o * 0, .058, 0), Ss);
    t("metal", r, Ce(Si(.03, .03, .18, 8), -o * .02, 0, 0), Yn);
    t("shell", a, Ce(Ro(.078, .078, .07, 18), 0, 0, 0), Ss);
    t("shell", a, Ce(Ro(.081, .081, .016, 18), o * .012, 0, 0), Ts);
    t("metal", a, Ce(Ro(.048, .048, .082, 12), 0, 0, 0), an);
    for (let c = 0; c < 5; c++) {
      let u = c * 1.2566;
      t("metal", a, $_(o * .039, Math.cos(u) * .062, Math.sin(u) * .062), Yn);
    }
    t("shell", a, Ce(ft(.062, i.L1 - .07, .1, .022), 0, -i.L1 * .5 - .005, .004), Ss);
    t("metal", a, Ce(ft(.044, i.L1 - .04, .06, .012), 0, -i.L1 * .5, -.035), an);
    t("shell", a, Ce(ft(.065, .045, .103, .01), 0, -.145, .004), Ts);
    t("shell", a, Ce(ft(.064, .012, .102, .004), 0, -.26, .004), s0);
    t("metal", a, su([0, -.06, -.082], [0, -i.L1 * .62, -.078], .021, .021, 10), Yn);
    t("metal", a, su([0, -i.L1 * .62, -.078], [0, -i.L1 + .025, -.058], .009, .009, 6), IC);
    t("metal", a, Ce(ft(.05, .03, .035, .006), 0, -.055, -.07), As);
    t("shell", a, tubeGeometry([[o * .036, -.02, .05], [o * .044, -.13, .062], [o * .042, -.28, .058], [o * .034, -i.L1 + .03, .035]], .0065, 5), ga);
    t("metal", a, Ce(Ro(.05, .05, .086, 14), 0, -i.L1, 0), an);
    t("shell", a, Ce(Ro(.036, .036, .092, 12), 0, -i.L1, 0), vm);
    t("metal", l, Ce(ds(.03, .021, i.L2 - .08, 10), 0, -(i.L2 - .08) / 2 - .01, 0), an);
    t("shell", l, Ce(ft(.052, .21, .04, .014), 0, -.14, .02), Ss);
    t("shell", l, Ce(ft(.054, .02, .042, .006), 0, -.215, .02), Ts);
    t("metal", l, Ce(ft(.03, .06, .05, .008), 0, -.02, -.03), As);
    t("metal", l, Ce(ds(.024, .03, .03, 10), 0, -i.L2 + .085, 0), Yn);
    t("shell", l, Ce(Ur(i.footR + .002, 12, 8, 1, .86, 1.08), 0, -i.L2 + i.footR * .86, .004), ga);
  }
  return e.build(["shell", "metal", "glow", "lens"]);
}
var xm = {
  rotors: [[.33, .035, .3], [-.33, .035, .3], [.33, .035, -.3], [-.33, .035, -.3]],
  gimbal: [0, -.095, .275],
  ball: [0, -.072, 0],
  gun: [0, -.085, -.1],
  muzzle: [0, -.032, .27],
  lamp: [0, -.066, .025]
};
function FC() {
  let i = [[.176, -.036], [.196, -.032], [.206, 0], [.202, .03], [.19, .04], [.178, .032], [.173, 0], [.176, -.036]].map(e => new Vector2(e[0], e[1]));
  return new LatheGeometry(i, 28);
}
function j_() {
  let i = xm;
  let e = new iu();
  let t = new iu();
  let n = (l, c, u, h, f) => {
    e.bone(l, c, u, h, f);
    t.bone(l, c, u, h, f);
  };
  n("root", null, 0, 0, 0);
  n("body", "root", 0, 0, 0);
  for (let l = 0; l < 4; l++) n("rotor" + l, "body", i.rotors[l][0], i.rotors[l][1], i.rotors[l][2]);
  n("gimbalYaw", "body", i.gimbal[0], i.gimbal[1], i.gimbal[2]);
  n("ball", "gimbalYaw", i.ball[0], i.ball[1], i.ball[2]);
  n("lamp", "ball", i.lamp[0], i.lamp[1], i.lamp[2]);
  n("gun", "body", i.gun[0], i.gun[1], i.gun[2]);
  n("strobeG", "body", 0, 0, 0);
  n("strobeR", "body", 0, 0, 0);
  n("strobeW", "body", 0, 0, 0);
  let s = (l, c, u, h, f) => e.add(l, c, u, h, f);
  s("shell", "body", Ce(Ur(1, 20, 12, .118, .074, .27), 0, .02, 0), Ss);
  s("shell", "body", Ce(cylinderGeometry(1, .9, 1, 20), 0, .02, .165, va, 0, 0, [.094, .05, .06]), Ts);
  s("shell", "body", Ce(cylinderGeometry(1, 1, 1, 20), 0, .02, -.02, va, 0, 0, [.121, .012, .0765]), s0);
  s("shell", "body", Ce(ft(.118, .014, .2, .005), 0, .089, -.03), vm);
  s("shell", "body", Ce(ft(.03, .006, .2, .002), 0, .0975, -.03), Ts);
  for (let l of [-.05, .05]) for (let c of [-.12, .06]) s("metal", "body", Yv(l, .097, c), Yn);
  s("metal", "body", Ce(ft(.175, .06, .37, .016), 0, -.035, -.005), an);
  s("metal", "body", Ce(ft(.12, .075, .11, .014), 0, .005, -.265), As);
  s("shell", "body", Ce(ft(.124, .02, .03, .005), 0, .03, -.3), Ts);
  s("glow", "body", Ce(ft(.05, .006, .003, .001), 0, 0, -.321), [.3, 1.6, .4], false);
  for (let l of [1, -1]) {
    for (let c = 0; c < 4; c++) s("metal", "body", Ce(ft(.004, .01, .06, .001), l * .0885, -.045 + c * .016, -.06), [.2, .2, .2]);
    s("metal", "body", tubeGeometry([[l * .075, -.055, .13], [l * .135, -.175, .16], [l * .135, -.192, .11], [l * .135, -.192, -.14], [l * .135, -.175, -.19], [l * .075, -.055, -.15]], .0085, 6, false, .5), Yn);
    for (let c of [.07, -.1]) s("shell", "body", Ce(Si(.0135, .0135, .07, 8), l * .135, -.192, c), ga);
    s("metal", "body", su([l * .04, .07, -.17], [l * .085, .37, -.27], .004, .002, 5), an);
    s("metal", "body", Ce(ds(.008, .01, .025, 6), l * .04, .078, -.17), Yn);
  }
  s("metal", "body", Ce(ds(.007, .007, .04, 6), 0, .105, .1), Yn);
  s("shell", "body", Ce(ds(.034, .036, .018, 14), 0, .132, .1), Ss);
  s("metal", "body", Ce(ft(.07, .03, .09, .008), 0, -.075, .235), As);
  let o = FC();
  for (let l = 0; l < 4; l++) {
    let [c, u, h] = i.rotors[l];
    let f = Math.sign(c);
    let p = Math.sign(h);
    s("metal", "body", su([f * .07, 0, p * .09], [c, u - .05, h], .017, .015, 8), an);
    s("shell", "body", Ce(ft(.07, .045, .07, .014), f * .085, 0, p * .1, 0, f * p * .74, 0), Ss);
    s("shell", "body", tubeGeometry([[f * .09, .02, p * .12], [f * .18, .012, p * .19], [c - f * .05, u - .03, h - p * .04]], .005, 5), ga);
    s("metal", "body", Ce(ds(.04, .03, .075, 12), c, u - .05, h), an);
    s("metal", "body", Ce(ds(.042, .042, .012, 12), c, u - .02, h), Yn);
    s("shell", "body", Ce(o.clone(), c, u, h), Ss);
    s("shell", "body", Ce(new TorusGeometry(.196, .0085, 6, 28), c, u + .036, h, va, 0, 0), Ts);
    for (let v = 0; v < 3; v++) {
      let g = v * 2.094 + .5 + l;
      s("metal", "body", Ce(ft(.145, .007, .016, .002), c + Math.cos(g) * .105, u - .022, h - Math.sin(g) * .105, 0, g, 0), an);
    }
    for (let v = -1; v <= 1; v++) {
      let g = Math.atan2(p, f) + v * .2;
      s("shell", "body", Ce(ft(.012, .05, .036, .003), c + Math.cos(g) * .205, u, h + Math.sin(g) * .205, 0, -g, 0), v === 0 ? s0 : Of);
    }
    s("metal", "rotor" + l, Ce(ds(.017, .02, .03, 8), 0, -.002, 0), Yn);
    s("metal", "rotor" + l, Ce(ft(.158, .0035, .03, .001), .088, .008, 0, .22, 0, 0), an);
    s("metal", "rotor" + l, Ce(ft(.158, .0035, .03, .001), -.088, .008, 0, -.22, 0, 0), an);
    s("shell", "rotor" + l, Ce(ft(.02, .004, .031, .001), .158, .008, 0, .22, 0, 0), Of);
    s("shell", "rotor" + l, Ce(ft(.02, .004, .031, .001), -.158, .008, 0, -.22, 0, 0), Of);
    let d = new RingGeometry(.03, .168, 24, 1);
    d.rotateX(-va);
    t.add("disc", "body", Ce(d, c, u + .008, h), [1, 1, 1], false);
  }
  s("glow", "strobeR", Ce(Ur(.012, 8, 6), .33 + .215, .035, .3), [10, .4, .2], false);
  s("glow", "strobeR", Ce(Ur(.012, 8, 6), .33 + .215, .035, -.3), [10, .4, .2], false);
  s("glow", "strobeG", Ce(Ur(.012, 8, 6), -.33 - .215, .035, .3), [.3, 9, 1], false);
  s("glow", "strobeG", Ce(Ur(.012, 8, 6), -.33 - .215, .035, -.3), [.3, 9, 1], false);
  s("glow", "strobeW", Ce(Ur(.011, 8, 6), 0, .05, -.325), [9, 9, 9], false);
  s("metal", "gimbalYaw", Ce(ds(.036, .036, .014, 12), 0, -.004, 0), an);
  s("metal", "gimbalYaw", Ce(ft(.156, .01, .03, .003), 0, -.014, 0), As);
  for (let l of [1, -1]) s("metal", "gimbalYaw", Ce(ft(.009, .075, .03, .003), l * .0735, -.05, 0), As);
  s("metal", "ball", Ce(Ur(.06, 18, 12), 0, 0, 0), an);
  s("metal", "ball", Ce(Ro(.013, .013, .142, 8), 0, 0, 0), Yn);
  s("metal", "ball", Ce(Si(.031, .036, .03, 14), 0, .004, .048), As);
  s("lens", "ball", Ce(Si(.025, .025, .004, 14), 0, .004, .0645), [1, 1, 1], false);
  s("metal", "ball", Ce(Si(.012, .012, .01, 8), .03, .036, .04), [.1, .12, .2]);
  s("metal", "ball", Ce(Si(.019, .023, .045, 10), i.lamp[0], i.lamp[1], i.lamp[2] - .022), an);
  s("glow", "lamp", Ce(Si(.016, .016, .003, 10), 0, 0, .001), [11, 9.8, 7.6], false);
  {
    let u = new ConeGeometry(1.25, 9, 20, 6, true);
    u.translate(0, -9 / 2, 0);
    u.rotateX(-va);
    t.add("cone", "lamp", u, [1, 1, 1], false);
  }
  s("metal", "gun", Ce(ft(.05, .03, .05, .006), 0, .012, 0), As);
  s("metal", "gun", Ce(Ro(.012, .012, .07, 8), 0, -.005, 0), Yn);
  s("metal", "gun", Ce(ft(.052, .046, .13, .008), 0, -.032, 0), As);
  s("shell", "gun", Ce(ft(.054, .012, .05, .003), 0, -.02, -.03), Ts);
  for (let l of [-.014, .014]) {
    s("metal", "gun", Ce(Si(.0085, .0085, .2, 8), l, -.032, .16), an);
    s("metal", "gun", Ce(Si(.012, .012, .03, 8), l, -.032, .255), As);
  }
  s("metal", "gun", Ce(ft(.045, .012, .012, .002), 0, -.032, .2), Yn);
  s("metal", "gun", Ce(ft(.03, .05, .05, .006), .04, -.035, -.02), an);
  let r = e.build(["shell", "metal", "glow", "lens"]);
  let a = t.build(["disc", "cone"]);
  r.extra = a;
  return r;
}
export { $v, Z_, j_, xm };
