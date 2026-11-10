import { TorusGeometry, Vector3 } from '../../../../vendor/three.js';
import { Ef, Ka, Lr, Qa, av, e0 } from './details.js';
var QUAY = {
  X: 30,
  LADDER_Z: 20,
  RAILS: [18.5, 28.5],
  Z0: -30,
  Z1: 28
};
function buildQuay(i) {
  let {
    M: e,
    box: t,
    slab: n,
    cyl: s,
    rod: o,
    tube: r,
    col: a,
    add: l,
    place: c
  } = i;
  let {
    X: u,
    LADDER_Z: h,
    Z0: f,
    Z1: p
  } = QUAY;
  let d = e("concrete");
  let v = e("concrete_dirty");
  let g = e("steel_worn");
  let x = e("steel_dark");
  let y = e("steel_galv");
  let b = e("paint_yellow");
  let m = h - .42;
  let A = h + .42;
  for (let [E, w] of [[f - 1, m], [A, p + 1]]) {
    n(d, u - .65, -.7, E, u, .028, w, {
      bevel: .03
    });
    n(g, u - .07, -.16, E, u + .022, .036, w, {
      bevel: .012
    });
    n(b, u - .66, 0, E, u - .5, .032, w);
    n(v, u - .55, -4.2, E, u - .02, -.7, w);
  }
  n(d, u - .65, -.7, m, u - .38, .028, A);
  n(v, u - .55, -4.2, m, u - .38, -.7, A);
  for (let E of [m, A]) n(g, u - .38, -.16, E - .02, u + .02, .034, E + .02);
  for (let E = f + 4; E < p; E += 6) Math.abs(E - h) < 1 || (n(x, u - .03, -4.2, E - .02, u - .012, -.2, E + .02, {
    cast: false
  }), i.decal("rust_run", .7, u - .015, -1.3, E + 1.4, "x+"));
  a(u - .65, -4.2, f - 1, u, .028, p + 1, "concrete", {
    noNav: true
  });
  a(u + .03, -5, f - 2, u + .7, 8, p + 2, "concrete", {
    playerOnly: true
  });
  {
    let E = u - .12;
    for (let S of [-1, 1]) {
      let z = h + S * .26;
      r(e("paint_yellow"), [[E, -3.9, z], [E, .2, z], [E, .95, z], [E - .12, 1.12, z], [E - .5, 1.12, z], [E - .62, .95, z], [E - .62, .03, z]], .024, {
        radial: 7,
        tension: .2
      });
      t(x, .12, .012, .12, E - .62, .034, z);
    }
    for (let S = -3.7; S < 0; S += .3) o(y, [E, S, h - .26], [E, S, h + .26], .014, {
      seg: 6
    });
    for (let S of [-3, -1.6, -.3]) for (let z of [-1, 1]) o(y, [E, S, h + z * .26], [u - .38, S, h + z * .26], .012);
    let w = [[h - 2.6], [h - .9], [h + .9], [h + 2.6]];
    for (let [S] of w) {
      s(b, .032, 1.05, u - .82, .525, S, {
        seg: 8
      });
      s(x, .09, .02, u - .82, .01, S, {
        seg: 10
      });
      s(x, .045, .03, u - .82, 1.06, S, {
        seg: 8
      });
    }
    for (let [S, z] of [[h - 2.6, h - .9], [h + .9, h + 2.6]]) for (let H of [.98, .55]) r(y, [[u - .82, H, S], [u - .82, H - .1, (S + z) / 2 - .3], [u - .82, H - .12, (S + z) / 2 + .3], [u - .82, H, z]], .012, {
      radial: 5
    });
    i.label("BOAT STN 4", .2, u - 1.3, .006, h - 1.4, "y+", {
      color: "yellow",
      font: "stencil",
      distress: .4
    });
  }
  let _ = new TorusGeometry(.4, .16, 8, 16);
  _.rotateY(Math.PI / 2);
  for (let E = f + 2.5, w = 0; E < p; E += 5, w++) {
    if (Math.abs(E - h) < 2) continue;
    n(e("wood_dark"), u + 0, -3.9, E - .16, u + .2, -.25, E + .16, {
      bevel: .02
    });
    n(x, u - .01, -.5, E - .2, u + .215, -.42, E + .2);
    n(x, u - .01, -2.4, E - .2, u + .215, -2.32, E + .2);
    let S = E + 2.4;
    if (Math.abs(S - h) < 1.6 || S > p - .5) continue;
    let z = -.85 - w % 3 * .18;
    l(_.clone(), e("tire"), {
      p: [u + .17, z, S]
    });
    w % 2 && l(_.clone(), e("tire"), {
      p: [u + .17, z - .86, S + .05]
    });
    for (let H of [-1, 1]) o(y, [u - .02, .02, S + H * .3], [u + .17, z + .36, S + H * .16], .011, {
      seg: 5
    });
    t(x, .1, .03, .8, u - .06, .04, S);
  }
  let M = [-22, -12, -2, 9, 16.4, 25.6];
  for (let E of M) c("bollard_mooring", 29.2, E, 0, {
    seed: Math.round(E + 40)
  });
  {
    let E = [...M.map(S => [S - 1.1, S + 1.1]), [h - 3, h + 3]].sort((S, z) => S[0] - z[0]);
    let w = f + .3;
    for (let [S, z] of [...E, [p - .3, p]]) {
      if (S - w > 1) {
        n(b, u - .4, .12, w, u - .2, .3, S, {
          bevel: .02
        });
        for (let H = w + .3; H < S; H += 1.6) n(x, u - .42, .028, H - .12, u - .18, .12, H + .12);
      }
      w = Math.max(w, z);
    }
  }
  for (let E of QUAY.RAILS) {
    n(x, E - .19, 0, f + .4, E + .19, .007, p - .4, {
      cast: false
    });
    n(e("steel_rust"), E - .075, 0, f + .4, E + .075, .018, p - .4, {
      cast: false
    });
    n(g, E - .037, 0, f + .4, E + .037, .034, p - .4, {
      bevel: .008,
      cast: false
    });
    for (let w = f + .8; w < p - .5; w += .9) for (let S of [-1, 1]) t(x, .07, .022, .1, E + S * .115, .012, w, {
      cast: false
    });
    for (let [w, S] of [[f + .75, 1], [p - .75, -1]]) {
      n(b, E - .28, 0, w - .3, E + .28, .75, w + .3, {
        bevel: .03
      });
      n(e("rubber"), E - .16, .3, w + S * .3, E + .16, .62, w + S * .42, {
        bevel: .03
      });
      n(x, E - .34, 0, w - .38, E + .34, .04, w + .38);
      a(E - .28, 0, w - .36, E + .28, .75, w + .36, "metal");
    }
  }
  av(i, 23.3, -15.4, 2, true, .02);
  av(i, 23.7, 14.4, 2, true, -.025);
  c("jersey_barrier", 20.5, -4.7, Math.PI / 2 + .12, {
    seed: 31
  });
  c("jersey_barrier", 25.3, 3.1, -.2, {
    seed: 32
  });
  Ka(i, 25.7, -3.3, .08, "paint_blue", 2);
  c("sandbags", 20.6, 3, 1.25, {
    seed: 33
  });
  c("barrel", 26.5, -1.7, 0, {
    seed: 34,
    color: "red"
  });
  c("barrel", 26.9, -1.05, .5, {
    seed: 35
  });
  Qa(i, 20.55, 1.35, .12);
  c("traffic_cone", 22, -1.9, 0, {
    seed: 36
  });
  c("traffic_cone", 24.2, 1.7, 0, {
    seed: 37
  });
  i.stack(23.2, -28.6, [[20, "white", {
    reefer: true
  }], [20, "white", {
    reefer: true
  }]]);
  i.stack(23, -25.95, [[20, "grey", {
    reefer: true
  }]]);
  c("generator", 15, -26.6, .06, {
    seed: 41
  });
  c("floodlight_stand", 16.4, -23.6, .3, {
    seed: 42
  });
  Lr(i, [[16.1, -26.6], [18, -27.6], [19.2, -27.2], [19.6, -26.4]], .028);
  Lr(i, [[15.6, -26], [16.2, -24.6], [16.4, -23.9]], .018);
  Ka(i, 27, -18.1, Math.PI / 2 + .05, "paint_orange", 5);
  c("tire_stack", 24.1, -9.5, 0, {
    seed: 43
  });
  c("tire_stack", 25.05, -9.6, .5, {
    seed: 44
  });
  c("cable_reel", 14.3, -12.9, .4, {
    seed: 45
  });
  c("cable_reel", 15.6, -14.3, 1.9, {
    seed: 46
  });
  c("pallet_stack", 20.3, -9.3, .1, {
    seed: 47
  });
  c("crate_wood", 19.9, -22.6, .3, {
    seed: 48
  });
  c("barrel", 12.75, -23.3, 0, {
    seed: 49,
    color: "blue"
  });
  c("barrel", 12.9, -24.1, 0, {
    seed: 50,
    color: "blue"
  });
  c("light_mast", 26.6, -28.7, 0, {
    seed: 51
  });
  c("light_mast", 26.6, 26.7, 0, {
    seed: 52
  });
  Ka(i, 20.6, 22.4, .04, "paint_blue", 7);
  Ka(i, 20.7, 24.2, -.06, "paint_orange", 9);
  Qa(i, 26.6, 5.5, .1);
  Qa(i, 26.7, 6.45, -.15, "paint_blue");
  c("crate_stack", 26.4, 23.6, .2, {
    seed: 53
  });
  c("ibc_tote", 22.6, 26.3, .05, {
    seed: 54
  });
  c("pallet_stack", 24, 26.2, .2, {
    seed: 55
  });
  c("barrel", 22.6, 20.3, 0, {
    seed: 56,
    color: "yellow"
  });
  c("barrel", 23.4, 20.4, 0, {
    seed: 57
  });
  c("tarp_cargo", 20.3, 12.6, Math.PI / 2, {
    seed: 59
  });
  Ef(i, 19.6, 17.5, Math.PI / 2 + .05);
  e0(i, 19.6, 10.4, .4);
  e0(i, 20.5, 16.1, -2.6);
  c("traffic_cone", 28.2, 18.2, 0, {
    seed: 60
  });
  c("traffic_cone", 28.3, 21.8, 0, {
    seed: 61
  });
  Lr(i, [[28.9, 6.2], [28.6, 9.5], [28.95, 13], [28.7, 16.6], [28.3, 17.4], [28.6, 17.9], [28.9, 17.3]], .022);
  return {
    relayPos: new Vector3(23, 0, 0),
    extraction: new Vector3(29, 0, h)
  };
}
export { buildQuay };
