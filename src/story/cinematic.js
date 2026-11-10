import { Vector3 } from '../../vendor/three.js';
import { clamp, smoothstep } from '../core/math.js';
export function createCinematic(game, level, post, MISSION_TUNING) {
  const scratchPosition = new Vector3(),
    scratchTarget = new Vector3();
  let cinematic = {
    pos: [],
    look: [],
    len: 1,
    t: 0
  };
  function initCinematic() {
    let P = level && level.cinematicPath || [];
    if (cinematic.pos = P.map(Y => new Vector3(...Y.pos)), cinematic.look = P.map(Y => new Vector3(...Y.look)), cinematic.pos.length < 2) {
      let Y = level && level.playerStart && level.playerStart.pos || new Vector3();
      cinematic.pos = [new Vector3(Y.x, 2.2, Y.z), new Vector3(Y.x + 8, 2, Y.z)];
      cinematic.look = [new Vector3(Y.x + 30, 2.5, Y.z - 2), new Vector3(Y.x + 40, 3, Y.z - 2)];
    }
    let V = 0;
    for (let Y = 1; Y < cinematic.pos.length; Y++) V += cinematic.pos[Y].distanceTo(cinematic.pos[Y - 1]);
    cinematic.len = Math.max(V, 4);
  }
  function samplePath(P, V, Y) {
    let L = P.length - 1;
    let Z = clamp(V, 0, 1) * L;
    let J = Math.min(L - 1, Math.floor(Z));
    let oe = Z - J;
    let fe = P[Math.max(0, J - 1)];
    let le = P[J];
    let R = P[J + 1];
    let I = P[Math.min(L, J + 2)];
    let se = oe * oe;
    let ae = se * oe;
    let k = (ce, ve, _e, Te) => .5 * (2 * ve + (-ce + _e) * oe + (2 * ce - 5 * ve + 4 * _e - Te) * se + (-ce + 3 * ve - 3 * _e + Te) * ae);
    return Y.set(k(fe.x, le.x, R.x, I.x), k(fe.y, le.y, R.y, I.y), k(fe.z, le.z, R.z, I.z));
  }
  function updateTitle(P) {
    let V = Math.max(26, cinematic.len / MISSION_TUNING.titleSpeed);
    cinematic.t += P;
    cinematic.t >= V && (cinematic.t = 0);
    let Y = cinematic.t / V;
    let L = Y * Y * (3 - 2 * Y) * .25 + Y * .75;
    let Z = game.camera;
    let J = game.time.t;
    samplePath(cinematic.pos, L, scratchPosition);
    samplePath(cinematic.look, L, scratchTarget);
    scratchPosition.x += Math.sin(J * .31) * .05;
    scratchPosition.y += Math.sin(J * .43 + 1.7) * .035;
    scratchPosition.z += Math.sin(J * .27 + .6) * .05;
    scratchTarget.y += Math.sin(J * .19) * .12;
    scratchTarget.x += Math.sin(J * .13 + 2) * .2;
    Z.position.copy(scratchPosition);
    Z.lookAt(scratchTarget);
    Z.rotation.z += Math.sin(J * .21) * .006;
    !game.params.fov && Math.abs(Z.fov - MISSION_TUNING.titleFov) > .01 && (Z.fov = MISSION_TUNING.titleFov, Z.updateProjectionMatrix());
    post.fade = Math.max(1 - smoothstep(0, 1.8, cinematic.t), smoothstep(V - 1.6, V, cinematic.t));
  }
  return {
    initCinematic,
    updateTitle
  };
}
