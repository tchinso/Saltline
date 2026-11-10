import { Group } from '../../../vendor/three.js';
import { boxGeometry, createMesh } from '../../geometry/primitives.js';
var PROP_SIZES = {
  container20: [6.06, 2.59, 2.44, "paint_red", "metal"],
  container40: [12.19, 2.59, 2.44, "paint_blue", "metal"],
  container40hc: [12.19, 2.9, 2.44, "paint_green", "metal"],
  jersey_barrier: [3, .81, .6, "concrete", "concrete"],
  light_mast: [.5, 14, .5, "steel_galv", "metal"],
  fence_panel: [3, 2.4, .08, "chainlink", "metal"],
  guard_booth: [2.6, 2.7, 2.2, "paint_white", "metal"],
  gate_arm: [5, 1.1, .3, "hazard_stripes", "metal"],
  bollard_mooring: [.7, .6, .7, "steel_dark", "metal"],
  bollard_post: [.17, 1, .17, "paint_yellow", "metal"],
  relay_node: [1.2, 2.4, .8, "paint_grey", "metal"],
  shelf_rack: [2.7, 4.2, 1.1, "paint_orange", "metal"],
  stairs_metal: [3, 2.6, 1, "diamond_plate", "metal"],
  catwalk: [3, 1.1, 1.2, "diamond_plate", "metal"],
  reefer_unit: [.5, 2.3, 2.3, "paint_white", "metal"],
  barrel: [.6, .9, .6, "paint_blue", "metal"],
  pallet: [1.2, .144, 1, "wood_pallet", "wood"],
  pallet_stack: [1.2, 1.15, 1, "wood_pallet", "wood"],
  crate_wood: [1.1, 1, .9, "wood_pallet", "wood"],
  crate_stack: [1.2, 1.9, 1, "wood_pallet", "wood"],
  ibc_tote: [1.2, 1.16, 1, "plastic_grey", "metal"],
  forklift: [3.4, 2.2, 1.25, "paint_yellow", "metal"],
  cable_reel: [1.3, 1.3, .8, "wood_dark", "wood"],
  tire_stack: [.8, 1, .8, "tire", "rubber"],
  dumpster: [1.9, 1.35, 1.1, "paint_green", "metal"],
  generator: [2.2, 1.4, 1, "paint_yellow", "metal"],
  jerry_can: [.35, .47, .17, "paint_green", "metal"],
  traffic_cone: [.36, .7, .36, "plastic_red", "rubber"],
  gas_cylinders: [.9, 1.6, .5, "steel_dark", "metal"],
  tarp_cargo: [2.4, 1.5, 1.4, "tarp", "dirt"],
  sandbags: [2, .9, .6, "tarp", "dirt"],
  toolbox_cart: [.9, .95, .5, "plastic_red", "metal"],
  floodlight_stand: [1, 2.2, 1, "paint_yellow", "metal"],
  cardboard_boxes: [1, .8, .8, "cardboard", "wood"],
  pipe_stack: [6, .9, 1.2, "steel_rust", "metal"],
  sign_post: [.6, 2.4, .08, "paint_white", "metal"]
};
var propBuilders = {};
function registerProp(i, e) {
  propBuilders[i] = e;
}
function createProps(i) {
  return {
    names: () => Object.keys(PROP_SIZES),
    has: e => !!PROP_SIZES[e],
    build(e, t = {}) {
      if (propBuilders[e]) try {
        let o = propBuilders[e](i, t);
        if (o) {
          o.userData.prop = e;
          return o;
        }
      } catch (o) {
        console.error(`[props] builder "${e}" threw`, o);
      }
      let n = PROP_SIZES[e] || [1, 1, 1, "concrete", "concrete"];
      PROP_SIZES[e] || console.warn(`[props] unknown prop "${e}"`);
      let s = new Group();
      s.add(createMesh(boxGeometry(n[0], n[1], n[2], "bottom"), i.mats.get(n[3])));
      s.userData.colliders = [{
        min: [-n[0] / 2, 0, -n[2] / 2],
        max: [n[0] / 2, n[1], n[2] / 2],
        surface: n[4]
      }];
      s.userData.size = [n[0], n[1], n[2]];
      s.userData.prop = e;
      return s;
    }
  };
}
function showcaseProps(i) {
  let e = i.params.names ? i.params.names.split(",") : Object.keys(PROP_SIZES);
  let t = 0;
  let n = 0;
  let s = 0;
  let o = 0;
  for (let a of e) {
    let l = i.props.build(a, {
      seed: 7,
      doors: a.startsWith("container") ? .6 : 0
    });
    let c = l.userData.size || PROP_SIZES[a] || [1, 1, 1];
    t + c[0] > 26 && (t = 0, n += s + 1.5, s = 0);
    l.position.set(t + c[0] / 2, 0, n);
    i.scene.add(l);
    t += c[0] + 1;
    s = Math.max(s, c[2]);
    o = Math.max(o, t);
  }
  let r = Math.min(o, 26) / 2;
  return {
    cam: [r - 4, 2.2, n + s + 6],
    target: [r, 1, n / 2]
  };
}
export { PROP_SIZES, createProps, registerProp };
export { showcaseProps };
