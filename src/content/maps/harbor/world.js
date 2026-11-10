import { Vector3 } from '../../../../vendor/three.js';
export const harborWorld = {
  min: new Vector3(-40, 0, -30),
  max: new Vector3(40, 30, 30),
  groundY: 0,
  seaY: -1.6,
  quayX: 30,
  navigation: {
    minX: -40,
    maxX: 31,
    minZ: -32,
    maxZ: 30,
    cellSize: 0.5
  }
};
