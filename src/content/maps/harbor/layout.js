import { Vector3 } from '../../../../vendor/three.js';
const mt = (x, y, z) => new Vector3(x, y, z);
const ts = Math.PI / 2;
// Fresh vectors per run: navigation may adjust spawn and cover positions.
export function createHarborLayout() {
  const playerStart = {
    pos: mt(-32, 0, 6),
    yaw: -ts
  };
  const groundSpawn = (z, H, O) => ({
    pos: mt(z, 0, H),
    zone: O,
    type: "ground"
  });
  const airSpawn = (z, H, O, q) => ({
    pos: mt(z, H, O),
    zone: q,
    type: "air"
  });
  const enemySpawns = [groundSpawn(-19, -1.4, "yard"), groundSpawn(3.5, -1.6, "yard"), groundSpawn(14.2, 16.4, "yard"), groundSpawn(-3.2, 16.6, "yard"), groundSpawn(-16, 26, "yard"), groundSpawn(6, 26, "yard"), groundSpawn(4.2, -5.12, "yard"), groundSpawn(-7.8, 21.4, "yard"), groundSpawn(-11.3, 12.5, "yard"), groundSpawn(17.5, 22.2, "yard"), airSpawn(10, 11, 23.5, "yard"), airSpawn(2, 11, 21.5, "yard"), airSpawn(13, 9, 11, "yard"), airSpawn(-4, 12.5, -4.5, "yard"), airSpawn(9, 10, 1.5, "yard"), airSpawn(-10, 12, 24.5, "yard"), groundSpawn(-12.4, -24.8, "shed"), groundSpawn(9.6, -25.3, "shed"), groundSpawn(-13.4, -19.6, "shed"), groundSpawn(4.6, -13.8, "shed"), groundSpawn(-21, -27.2, "shed"), groundSpawn(-18.6, -22, "shed"), groundSpawn(13.6, -24, "shed"), groundSpawn(-26.6, -15, "shed"), airSpawn(-8, 5.4, -20.5, "shed"), airSpawn(5, 5.2, -18, "shed"), airSpawn(-20, 10.5, -20, "shed"), airSpawn(14.5, 10, -22, "shed"), airSpawn(-2, 12.5, -8.5, "shed"), groundSpawn(27.7, -24.2, "quay"), groundSpawn(18.3, -25.4, "quay"), groundSpawn(27.2, -12.6, "quay"), groundSpawn(20.2, 14, "quay"), groundSpawn(23.4, 23.2, "quay"), groundSpawn(18, 24.4, "quay"), groundSpawn(27.4, 11.6, "quay"), airSpawn(36, 9, 4, "quay"), airSpawn(38, 11, -6, "quay"), airSpawn(35, 8.5, 16, "quay"), airSpawn(24, 12.5, 10.5, "quay"), airSpawn(33.5, 10, 24.5, "quay"), airSpawn(22, 13, -14, "quay")];
  const zones = [{
    name: "gate",
    min: [-40, -30],
    max: [-24, 30]
  }, {
    name: "yard",
    min: [-24, -10],
    max: [16, 30]
  }, {
    name: "shed",
    min: [-24, -30],
    max: [16, -10]
  }, {
    name: "quay",
    min: [16, -30],
    max: [40, 30]
  }];
  const cinematicPath = [{
    pos: [-34, 1.6, 6.2],
    look: [-12, 2.6, 6.6]
  }, {
    pos: [-20, 1.3, 5.6],
    look: [0, 2.2, 7]
  }, {
    pos: [-6.2, 2.1, 7.9],
    look: [2, 1.6, 7.6]
  }, {
    pos: [-6.6, 2.5, .4],
    look: [-4, 2.6, -12]
  }, {
    pos: [-4.4, 1.9, -8.6],
    look: [-2.4, 2.8, -19.5]
  }, {
    pos: [-3.2, 2.2, -15],
    look: [-2, 2.2, -20.5]
  }, {
    pos: [4.2, 2.6, -19.6],
    look: [12, 3.2, -19.5]
  }, {
    pos: [15, 2, -19.5],
    look: [24, 3.5, -6]
  }, {
    pos: [20.2, 1.7, -9],
    look: [23, 1.6, 0]
  }, {
    pos: [25.9, 1.8, 1.5],
    look: [27.5, 1.2, 12]
  }, {
    pos: [27.3, 1.8, 12],
    look: [29.6, .4, 20]
  }, {
    pos: [28.4, 1.9, 17.2],
    look: [31.5, -.8, 21]
  }];
  const coverPoints = [mt(-33.9, 0, 3.8), mt(-27.3, 0, 2.3), mt(-19.2, 0, 4.7), mt(-17.4, 0, 4.9), mt(-12.5, 0, 7.2), mt(-9.3, 0, 6.4), mt(-6.3, 0, 7.3), mt(-2.9, 0, 6.1), mt(-2.9, 0, 4.5), mt(5.6, 0, 5.8), mt(5.6, 0, 4.2), mt(-2.2, 0, 10.4), mt(5, 0, 8.9), mt(-4.8, 0, 10.6), mt(7.5, 0, 7.7), mt(9.2, 0, 4.4), mt(-1, 0, 13.6), mt(-13.5, 0, -1.5), mt(-9.6, 0, -.7), mt(7.8, 0, -1.5), mt(-4.2, 0, -2.2), mt(-.9, 0, -6.7), mt(-6.7, 0, -7), mt(1.2, 0, -8.9), mt(-8.1, 0, 15.4), mt(.6, 0, 16.9), mt(4.2, 0, 15.7), mt(-16, 0, 15.6), mt(12, 0, 17.2), mt(2.9, 0, -17), mt(4.2, 0, -15.3), mt(6.9, 0, -20.6), mt(-7.6, 0, -17.4), mt(-8.3, 0, -14.3), mt(9.6, 0, -21.9), mt(-13.2, 0, -14.4), mt(-11.6, 0, -18.6), mt(0, 0, -25.8), mt(-12.4, 0, -25.8), mt(21.4, 0, -4.7), mt(25.3, 0, 3.9), mt(25.7, 0, -4.4), mt(20.2, 0, -15.4), mt(26.4, 0, -15.4), mt(20.6, 0, 14.4), mt(26.8, 0, 14.4), mt(20.6, 0, 21.2), mt(27.4, 0, 22.4), mt(19.6, 0, -21.4), mt(27, 0, -16.2), mt(25.6, 0, 6), mt(13.5, 2.59, 12.4), mt(4.4, 2.59, 12.4), mt(12.9, 0, 8.8), mt(11.6, 0, 4.9)];
  return {
    playerStart,
    enemySpawns,
    zones,
    cinematicPath,
    coverPoints
  };
}
