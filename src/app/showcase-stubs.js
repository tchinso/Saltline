import { Vector3 } from '../../vendor/three.js';
import { PLAYER } from '../core/config.js';
function createShowcaseInput() {
  let i = () => {};
  return {
    move: {
      x: 0,
      y: 0
    },
    look: {
      dx: 0,
      dy: 0
    },
    fire: false,
    ads: false,
    sprint: false,
    crouch: false,
    locked: false,
    touch: false,
    sensitivity: 1,
    down: () => false,
    pressed: () => false,
    update: i,
    endFrame: i,
    requestLock: i,
    exitLock: i
  };
}
function createShowcasePlayer(i) {
  return {
    pos: new Vector3(0, 0, 4),
    vel: new Vector3(),
    yaw: 0,
    pitch: 0,
    health: 100,
    maxHealth: 100,
    alive: true,
    onGround: true,
    sprinting: false,
    crouching: false,
    ads: 0,
    speed: 0,
    eye: new Vector3(0, PLAYER.eye, 4),
    forward: new Vector3(0, 0, -1),
    enabled: false,
    reset() {},
    damage() {},
    heal() {},
    addRecoil() {},
    addShake() {},
    update() {}
  };
}
export { createShowcaseInput, createShowcasePlayer };
