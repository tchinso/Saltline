import { createHarborLayout } from './layout.js';
import { Group, Vector3 } from '../../../../vendor/three.js';
import { Ef, Ka, Lr, Qa, Sf, e0, lv } from './details.js';
import { WAREHOUSE, buildWarehouse } from './warehouse.js';
import { atlasLabels, createLevelBuilder } from '../../../world/level-builder.js';
import { buildQuay } from './quay.js';
import { mergeStaticMeshes } from '../../../geometry/primitives.js';
var uR = Math.PI;
var ts = uR / 2;
var R1 = .535;
var mt = (i, e, t) => new Vector3(i, e, t);
function placeHarborProps(i) {
  let e = i.place;
  let t = i.stack;
  t(-19.45, -5.12, [[20, "green"], [20, "grey"], [20, "orange"]]);
  t(-13.3, -5.12, [[20, "white", {
    reefer: true,
    flip: true
  }]]);
  t(3.7, -5.12, [[20, "blue", {
    doors: .8,
    flip: true
  }], [20, "white"]]);
  t(13.53, -5.12, [[20, "teal"], [20, "grey"]]);
  t(-19.45, 2.08, [[20, "blue"]]);
  t(-13.35, 2.08, [[20, "red"]]);
  t(.8, 2.08, [[40, "orange"], [40, "teal"], [20, "blue", {
    dx: 3
  }]]);
  t(12.3, 2.08, [[20, "red"], [20, "yellow"]]);
  t(-21.1, 9.92, [[20, "yellow"]], 0, .3);
  t(-13.6, 9.92, [[20, "green"], [20, "blue"], [20, "orange"]], 0, .3);
  t(-21.6, 12.42, [[20, "red"], [20, "white"], [20, "teal"]], 0, .3);
  t(-15.4, 12.42, [[20, "grey", {
    doors: .6
  }]], 0, .3);
  t(4.43, 12.42, [[20, "blue"]], 0, 0);
  t(13.53, 12.42, [[20, "green"]], 0, 0);
  i.stairs(-.1, 12.42, 0, 0, {
    seed: 9
  });
  i.catwalk(8.98, 12.42, 0, 2.54, {
    seed: 10
  });
  for (let s of [7.6, 10.36]) for (let o of [11.86, 12.98]) i.rod("steel_galv", [s, 0, o], [s, 2.5, o], .035);
  e("sandbags", 15.95, 12.42, ts, {
    seed: 61
  }, 2.59);
  e("crate_wood", 14.3, 11.75, .1, {
    seed: 62
  }, 2.59);
  e("sandbags", 2.3, 11.75, 0, {
    seed: 63
  }, 2.59);
  t(-16.4, 20.12, [[40, "grey"], [40, "green"]]);
  t(-2.25, 20.12, [[20, "red"]]);
  t(3.85, 20.12, [[20, "white"], [20, "blue"]]);
  t(13.53, 20.12, [[20, "orange"], [20, "teal"], [20, "red"]]);
  t(-16.4, 22.62, [["hc", "teal"], [40, "yellow"], [40, "blue"]]);
  t(.8, 22.62, [[40, "green"], ["hc", "orange"]]);
  t(13.53, 22.62, [[20, "grey", {
    doors: .4
  }]]);
  t(-22.6, -19.2, [[40, "red"], [40, "white"]], ts);
  t(-30.2, -18.4, [[20, "yellow", {
    doors: .5
  }]], .35, 0);
  t(-31.2, 24.7, [[40, "teal"], [40, "orange"]]);
  for (let [s, o] of [[-23.4, .5], [-23.4, 21.4], [17, -8.7], [17, 18.6], [-20.6, -11.6]]) e("light_mast", s, o, 0, {
    seed: Math.round(s * 3 + o)
  });
  let n = (s, o, r, a = .018) => {
    let l = [];
    for (let c = 0; c <= 8; c++) {
      let u = c / 8;
      l.push([s[0] + (o[0] - s[0]) * u, s[1] + (o[1] - s[1]) * u - r * 4 * u * (1 - u), s[2] + (o[2] - s[2]) * u]);
    }
    i.tube("rubber", l, a, {
      radial: 5,
      tension: .5
    });
  };
  n([-23.4, 12.4, .5], [-20.6, 12.4, -11.6], 1.3);
  n([-20.6, 11.8, -11.6], [-16.2, 7.25, -11.4], .9);
  n([-23.4, 12, .5], [-27.6, 12.2, -.9], .5);
  n([17, 12.4, -8.7], [12.3, 7.3, -11.3], 1);
  Ef(i, -20.9, 8.3, .02);
  e0(i, -18.6, 3.75, 1.7);
  e0(i, .4, 13.3, .3);
  e("barrel", -19.6, 3.85, 0, {
    seed: 1,
    color: "blue"
  });
  e("barrel", -18.9, 3.95, .7, {
    seed: 2,
    color: "blue"
  });
  e("pallet_stack", -17.4, 4, .08, {
    seed: 3
  });
  e("crate_stack", -14.3, 8.05, .04, {
    seed: 4
  });
  e("ibc_tote", -12.95, 7.95, -.05, {
    seed: 5
  });
  {
    let a = Math.cos(-.22);
    let l = -Math.sin(-.22);
    e("forklift", -8.6, 4.5, -.22, {
      seed: 6,
      forksUp: .3
    });
    let c = -8.6 + a * 1.42;
    let u = 4.5 + l * 1.42;
    e("pallet", c, u, -.22, {
      seed: 7
    }, R1, {
      noCol: true
    });
    e("crate_wood", c, u, -.22 + .05, {
      seed: 8
    }, R1 + .144, {
      noCol: true
    });
    i.col(c - .62, R1 - .1, u - .62, c + .62, R1 + 1.15, u + .62, "wood");
    e0(i, -8.6 - 1, 4.5 + .78, .2);
    e0(i, -11.9, 3.6, 2.4);
  }
  e("jersey_barrier", -2.9, 5.3, .12, {
    seed: 11
  });
  e("jersey_barrier", 5.6, 5, -.1, {
    seed: 12
  });
  e("sandbags", -1.7, 9.7, .5, {
    seed: 13
  });
  e("ibc_tote", 5.9, 8.9, .1, {
    seed: 14
  });
  e("ibc_tote", 5.95, 10.05, -.05, {
    seed: 15
  });
  e("barrel", 4.9, 9.7, 0, {
    seed: 16,
    color: "red"
  });
  e("crate_stack", -3.9, 10.5, .1, {
    seed: 17
  });
  e("crate_wood", -3.8, 9.35, -.2, {
    seed: 18
  });
  e("pallet_stack", -4.4, 11.8, .02, {
    seed: 19
  });
  e("cable_reel", 4.2, 10.5, .3, {
    seed: 20
  });
  e("tarp_cargo", 12.9, 10, .04, {
    seed: 21
  });
  e("jersey_barrier", 11.6, 3.95, .03, {
    seed: 81
  });
  e("ibc_tote", 15.2, 10.2, .1, {
    seed: 82
  });
  for (let [s, o] of [[.2, 6.3], [2.9, 6.4], [2.9, 8.8], [.1, 8.7]]) e("traffic_cone", s, o, 0, {
    seed: Math.round(s * 9 + o * 5)
  });
  Qa(i, -9.55, 9.3, .04);
  Ef(i, -7.6, 11.9, ts + .06);
  Qa(i, 9.9, 12.9, ts, "paint_blue");
  e("sign_post", -4.8, 3.72, ts, {
    seed: 22,
    sign: "hazard_voltage"
  });
  lv(i, .9, 3.62, 0);
  Lr(i, [[.9, 3.9], [1.2, 5.2], [.8, 6.2], [1.5, 7.1]], .03);
  e("tarp_cargo", -13.5, -3.1, .05, {
    seed: 23
  });
  e("pallet_stack", -20.6, -.1, .2, {
    seed: 24
  });
  e("tire_stack", -9.6, .2, 0, {
    seed: 25
  });
  e("barrel", 4.5, .35, 0, {
    seed: 26,
    color: "yellow"
  });
  e("barrel", 5.2, .3, .4, {
    seed: 27
  });
  e("jersey_barrier", 12.2, .4, .03, {
    seed: 28
  });
  e("crate_wood", 11.2, -3.3, .3, {
    seed: 29
  });
  e("cardboard_boxes", -2, .3, .2, {
    seed: 30
  });
  Ka(i, -4.2, -3.2, .03, "paint_orange", 3);
  e("jersey_barrier", -.9, -7.5, .1, {
    seed: 31
  });
  e("sandbags", -6.7, -7.8, -.1, {
    seed: 32
  });
  e("dumpster", -12.3, -7.05, 0, {
    seed: 33
  });
  e("gas_cylinders", 9.6, -10.45, 0, {
    seed: 34
  });
  e("pallet_stack", 1.2, -9.9, .1, {
    seed: 35
  });
  e("barrel", 2.2, -10.3, 0, {
    seed: 36,
    color: "green"
  });
  e("cable_reel", -18.2, -8, .2, {
    seed: 37
  });
  e("traffic_cone", -6.5, -9.9, 0, {
    seed: 38
  });
  e("traffic_cone", -.5, -9.9, 0, {
    seed: 39
  });
  Lr(i, [[4.6, -10.9, .5], [4.7, -10.6, .05], [4.2, -9.2], [1, -8.4], [-2.6, -9.1], [-4.6, -6.4], [-5.9, -5.9]], .024);
  e("pipe_stack", -16, 14.4, 0, {
    seed: 41
  });
  e("crate_stack", -10.95, 18.25, .06, {
    seed: 42
  });
  e("barrel", -3, 18.35, 0, {
    seed: 43,
    color: "blue"
  });
  e("dumpster", 4.2, 14.55, .02, {
    seed: 44
  });
  e("tire_stack", 10.95, 18.3, 0, {
    seed: 45
  });
  e("ibc_tote", 12, 18.25, 0, {
    seed: 46
  });
  e("pallet_stack", -12.3, 18.2, .1, {
    seed: 47
  });
  e("tarp_cargo", -20.5, 18.05, .03, {
    seed: 48
  });
  e("jersey_barrier", .6, 15.5, .12, {
    seed: 49
  });
  e("tire_stack", -8, 26.9, 0, {
    seed: 51
  });
  e("pallet_stack", 8.7, 27, .3, {
    seed: 52
  });
  e("crate_wood", -2, 27, .2, {
    seed: 53
  });
  e("barrel", 11.2, 27.1, 0, {
    seed: 54
  });
  e("cardboard_boxes", -21, 26.9, .4, {
    seed: 55
  });
  Qa(i, 16, 26.9, .1);
  e("pipe_stack", -30.5, -27, .03, {
    seed: 56
  });
  e("pipe_stack", -30.2, -25.4, -.02, {
    seed: 57
  });
  e("dumpster", -17, -14, ts, {
    seed: 58
  });
  e("tarp_cargo", -27.5, -11.6, .3, {
    seed: 59
  });
  e("tarp_cargo", -29.9, -11, -.2, {
    seed: 60
  });
  e("cable_reel", -34.6, -22.5, 1, {
    seed: 64
  });
  e("tire_stack", -25.4, -26.9, 0, {
    seed: 65
  });
  e("gas_cylinders", -16.9, -20.4, ts, {
    seed: 66
  });
  e("crate_stack", -34.8, -13.5, .2, {
    seed: 67
  });
  e("barrel", -33.6, -13, 0, {
    seed: 68
  });
  Ka(i, -36.6, -26, ts, "paint_blue", 4);
  e("generator", -34.2, 14.2, .15, {
    seed: 71
  });
  e("floodlight_stand", -31.4, 12.7, .55, {
    seed: 72
  });
  Lr(i, [[-33.2, 14], [-32.4, 13.2], [-31.6, 12.9]], .02);
  e("tire_stack", -36.6, 17.2, 0, {
    seed: 73
  });
  e("tire_stack", -36.5, 18.3, .6, {
    seed: 74
  });
  e("dumpster", -36.4, 21, ts, {
    seed: 75
  });
  e("pallet_stack", -27.8, 16.6, .4, {
    seed: 76
  });
  e("jerry_can", -33, 15.2, .4, {
    seed: 77
  });
  e("jerry_can", -33.3, 15.35, 1.9, {
    seed: 78
  });
  e("crate_wood", -28.6, 20.6, .1, {
    seed: 79
  });
  e("ibc_tote", -26.6, 21.2, 0, {
    seed: 80
  });
  Sf(i, -22.9, -3.62, "LANE 1", "x-");
  Sf(i, -22.95, 3.62, "LANE 2", "x-");
  Sf(i, -25, 14, "LANE 3", "x-");
  Sf(i, 16.9, 9.5, "LANE 2", "x+");
  i.label("BERTH 4 WORKSHOP", .55, 4.2, 4.3, WAREHOUSE.Z1 + .064, "z+", {
    color: "white",
    font: "stencil",
    distress: .45
  });
  i.decal("berth4", 3.2, -12, 3.4, WAREHOUSE.Z1 + .064, "z+");
  i.decal("rust_run", 1, 9, 3.2, WAREHOUSE.Z1 + .064, "z+");
  i.decal("grime_streak", 1.2, -14, 3.9, WAREHOUSE.Z1 + .064, "z+");
}
function buildHarborBoundary(i) {
  let e = i.place;
  let t = -38;
  let n = 30;
  let s = -30;
  let o = 28;
  let r = 2;
  let a = 8;
  function l(c, u, h, f, p) {
    let d = Math.hypot(h - c, f - u);
    let v = Math.max(1, Math.round(d / 3.35));
    let g = d / (v * 3);
    let x = Math.abs(h - c) > Math.abs(f - u);
    for (let y = 0; y < v; y++) {
      let b = (y + .5) / v;
      let m = e("fence_panel", c + (h - c) * b, u + (f - u) * b, x ? 0 : ts, {
        seed: p + y,
        posts: y === v - 1 ? "both" : "left"
      }, 0, {
        noCol: true
      });
      m.scale.x = g;
    }
    i.col(Math.min(c, h) - .05, 0, Math.min(u, f) - .05, Math.max(c, h) + .05, 2.4, Math.max(u, f) + .05, "metal");
    i.col(Math.min(c, h) - .3, 0, Math.min(u, f) - .3, Math.max(c, h) + .3, 7, Math.max(u, f) + .3, "metal", {
      playerOnly: true
    });
  }
  l(t, s, n, s, 100);
  l(t, o, n, o, 200);
  l(t, s, t, r, 300);
  l(t, a, t, o, 400);
  for (let c of [r - .1, a + .1]) {
    i.box("steel_dark", .22, 3.4, .22, t, 1.7, c, {
      bevel: .02
    });
    i.box("hazard_stripes", .26, 1.2, .26, t, .6, c, {
      bevel: .02
    });
    i.col(t - .13, 0, c - .13, t + .13, 3.4, c + .13, "metal");
  }
  {
    let c = a + 3.3;
    let u = t + .28;
    i.box("chainlink", .012, 2.1, 6, u, 1.25, c);
    for (let h of [c - 3, c, c + 3]) i.box("steel_galv", .06, 2.2, .06, u, 1.25, h);
    for (let h of [.18, 2.32, 1.25]) i.box("steel_galv", .06, .06, 6.06, u, h, c);
    i.rod("steel_galv", [u, .2, c - 3], [u, 2.3, c], .018);
    i.rod("steel_galv", [u, .2, c + 3], [u, 2.3, c], .018);
    i.slab("steel_dark", u - .05, 0, r - .3, u + .05, .03, c + 3.2, {
      cast: false
    });
    for (let h of [c - 2.4, c + 2.4]) i.cyl("rubber", .09, .05, u, .1, h, {
      axis: "x",
      seg: 10
    });
  }
  i.col(t - .4, 0, r, t - .1, 7, a, "metal", {
    playerOnly: true
  });
  e("guard_booth", -35.2, .35, 0, {
    seed: 1
  });
  e("gate_arm", -36.3, 5, ts, {
    seed: 2
  });
  for (let [c, u] of [[-37, 1.75], [-34.4, 2.3], [-37, 8.3], [-35.6, 8.9], [-34.4, 9.9], [-33.5, -1.1]]) e("bollard_post", c, u, 0, {
    seed: Math.round(c * 11 + u * 7)
  });
  e("jersey_barrier", -34.7, 3.75, ts + .08, {
    seed: 3
  });
  e("jersey_barrier", -33.3, 8.3, ts - .06, {
    seed: 4
  });
  e("jersey_barrier", -30.6, 10.4, .03, {
    seed: 5
  });
  e("jersey_barrier", -27.3, 1.45, .05, {
    seed: 6
  });
  e("jersey_barrier", -32.2, 1.45, -.04, {
    seed: 7
  });
  e("sign_post", -33.2, 9.6, ts, {
    seed: 8,
    sign: "no_entry"
  });
  e("sign_post", -25.3, 1.1, ts, {
    seed: 9,
    sign: "berth4"
  });
  e("sign_post", -36.6, -1.6, ts, {
    seed: 10,
    sign: "hazard_general"
  });
  for (let [c, u] of [[-34.6, 5.6], [-28.3, 2], [-33.2, 6.5], [-26.6, 9.8], [-31.8, 9.9]]) e("traffic_cone", c, u, 0, {
    seed: Math.round(c * 5 + u * 3)
  });
  e("light_mast", -27.6, -.9, 0, {
    seed: 11
  });
  e("light_mast", -36.3, 12.4, 0, {
    seed: 12
  });
  e("barrel", -33.9, 2, 0, {
    seed: 13,
    color: "yellow"
  });
  e("pallet_stack", -36.4, 10.3, .2, {
    seed: 14
  });
  i.decal("no_entry", .7, t + .34, 1.5, a + 3.3, "x+");
  i.decal("arrow", 2.2, -30.5, .006, 6, "y+", 0);
}
async function createHarborLevel(game) {
  const {
    playerStart,
    enemySpawns,
    zones,
    cinematicPath,
    coverPoints
  } = createHarborLayout();
  let root = new Group();
  root.name = "level";
  game.scene.add(root);
  let builder = createLevelBuilder(game);
  placeHarborProps(builder);
  buildHarborBoundary(builder);
  let warehouse = buildWarehouse(builder);
  let quay = buildQuay(builder);
  let yardRelay = builder.place("relay_node", 1.5, 7.5, .35, {
    seed: 1
  }, 0);
  let warehouseRelay = builder.place("relay_node", warehouse.relayPos.x, warehouse.relayPos.z, ts * .9, {
    seed: 2
  }, WAREHOUSE.FLOOR);
  let quayRelay = builder.place("relay_node", quay.relayPos.x, quay.relayPos.z, -.2, {
    seed: 3
  }, 0);
  Lr(builder, [[-2, -27.5, 1.2], [-2, -27.55, .08], [-1.4, -25.6], [-2.4, -23], [-1.9, -20.3]], .03, builder.MI("rubber"), WAREHOUSE.FLOOR + .028);
  lv(builder, 20.4, -7.3, .2);
  Lr(builder, [[20.5, -7], [21.4, -4.9], [22.4, -2.6], [22.9, -.7]], .03);
  builder.staticRoot.updateMatrixWorld(true);
  let l = [];
  builder.staticRoot.traverse(z => {
    z.userData && z.userData.noMerge && !(z.parent && hasUnmergedParent(z.parent, builder.staticRoot)) && l.push(z);
  });
  for (let z of l) builder.dynRoot.attach(z);
  let c = new Set();
  builder.staticRoot.traverse(z => {
    z.isMesh && !Array.isArray(z.material) && c.add(z.material);
  });
  let u = new Map();
  for (let z of c) if (!(!z.isMeshStandardMaterial || z.vertexColors || z.transparent || !z.name || !(game.mats.names || []).includes(z.name))) try {
    let H = z.userData && z.userData.interior ? {
      interior: true
    } : {};
    if (game.mats.get(z.name, H) !== z) continue;
    let O = game.mats.get(z.name, {
      ...H,
      vertexColors: true
    });
    O !== z && c.has(O) && u.set(z, O);
  } catch {}
  builder.staticRoot.traverse(z => {
    if (!z.isMesh || Array.isArray(z.material)) return;
    let H = u.get(z.material);
    H && (z.material = H);
    let O = !z.material.transparent && !z.material.isMeshBasicMaterial;
    z.castShadow = O;
    z.receiveShadow = !z.material.isMeshBasicMaterial;
  });
  let h = {
    count: 0,
    update() {}
  };
  try {
    h = atlasLabels(builder.staticRoot);
  } catch (z) {
    console.error("[level] label atlas failed", z);
  }
  let f = mergeStaticMeshes(builder.staticRoot);
  f.name = "level-merged";
  root.add(f);
  root.add(builder.dynRoot);
  for (let z of [yardRelay, warehouseRelay, quayRelay]) {
    for (let H = z.children.length - 1; H >= 0; H--) z.remove(z.children[H]);
    builder.dynRoot.add(z);
  }
  let p = 0;
  f.traverse(z => {
    if (z.isMesh) {
      let H = z.geometry;
      p += (H.index ? H.index.count : H.attributes.position.count) / 3;
    }
  });
  let objectives = [{
    id: "relay_a",
    label: "Relay A \u2014 Yard",
    zone: "yard",
    pos: mt(1.5, 0, 7.5),
    object: yardRelay
  }, {
    id: "relay_b",
    label: "Relay B \u2014 Shed",
    zone: "shed",
    pos: mt(warehouse.relayPos.x, WAREHOUSE.FLOOR, warehouse.relayPos.z),
    object: warehouseRelay
  }, {
    id: "relay_c",
    label: "Relay C \u2014 Quay",
    zone: "quay",
    pos: mt(quay.relayPos.x, 0, quay.relayPos.z),
    object: quayRelay
  }];
  let interiorBoxes = [{
    min: mt(WAREHOUSE.X0, 0, WAREHOUSE.Z0),
    max: mt(WAREHOUSE.X1, WAREHOUSE.RIDGE, WAREHOUSE.Z1)
  }];
  let navigation = game.physics.nav;
  let snapToWalkable = z => {
    if (!(!navigation || !navigation.isWalkable || z.y > .2 || navigation.isWalkable(z.x, z.z))) for (let H of [.5, 1, 1.5, 2]) for (let O = 0; O < 8; O++) {
      let q = z.x + Math.cos(O * .7854) * H;
      let U = z.z + Math.sin(O * .7854) * H;
      if (navigation.isWalkable(q, U)) {
        z.x = q;
        z.z = U;
        return;
      }
    }
  };
  coverPoints.forEach(snapToWalkable);
  enemySpawns.forEach(z => {
    z.type === "ground" && snapToWalkable(z.pos);
  });
  let w = false;
  return {
    root: root,
    playerStart: playerStart,
    objectives: objectives,
    extraction: {
      pos: quay.extraction.clone(),
      radius: 2.5
    },
    enemySpawns: enemySpawns,
    zones: zones,
    interiorBoxes: interiorBoxes,
    cinematicPath: cinematicPath,
    coverPoints: coverPoints,
    skylights: warehouse.skylights,
    shedLights: warehouse.lights,
    vantage: {
      stairsFoot: mt(-2.2, 0, 12.4),
      roof: mt(13.5, 2.59, 12.4)
    },
    stats: {
      labelsAtlased: h.count,
      containers: builder.placed.filter(z => z.name.startsWith("container")).length,
      props: builder.placed.length,
      tris: Math.round(p),
      meshes: f.children.length + countMeshes(builder.dynRoot)
    },
    placed: builder.placed,
    groundSurfaceAt(z, H) {
      return builder.isMetal(z, H) ? "metal" : "concrete";
    },
    update(z) {
      warehouse.update(z);
      h.update(z);
      for (let H = 0; H < builder.updaters.length; H++) try {
        builder.updaters[H](z);
      } catch (O) {
        w || (w = true, console.error("[level] prop update threw", O));
      }
    }
  };
}
function hasUnmergedParent(i, e) {
  for (; i && i !== e;) {
    if (i.userData && i.userData.noMerge) return true;
    i = i.parent;
  }
  return false;
}
function countMeshes(i) {
  let e = 0;
  i.traverse(t => {
    t.isMesh && e++;
  });
  return e;
}
async function showcaseLevel(i) {
  let e = await createHarborLevel(i);
  return {
    cam: [-32, 1.7, 6],
    target: [0, 2.4, 6.4],
    update: t => e.update(t)
  };
}
export { createHarborLevel, showcaseLevel };
