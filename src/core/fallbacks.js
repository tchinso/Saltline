import { Color, MeshBasicMaterial, MeshStandardMaterial } from '../../vendor/three.js';
var noop = () => {};
var fallbacks = {
  ground: () => ({
    stub: true,
    update: noop,
    wetnessAt: () => .5,
    isPuddle: () => false
  }),
  backdrop: () => ({
    stub: true,
    update: noop
  }),
  fx: () => ({
    stub: true,
    update: noop,
    muzzleFlash: noop,
    tracer: noop,
    impact: noop,
    sparks: noop,
    smoke: noop,
    explosion: noop,
    debris: noop,
    shell: noop,
    decal: noop,
    dust: noop,
    clear: noop,
    splash: noop,
    addEmitter: () => ({
      stop: noop,
      setPos: noop
    })
  }),
  audio: () => {
    let i = {
      setPos: noop,
      setGain: noop,
      setPitch: noop,
      stop: noop
    };
    return {
      stub: true,
      update: noop,
      resume: noop,
      play: noop,
      loop: () => i,
      setIntensity: noop,
      setInterior: noop,
      setVolume: noop,
      setPaused: noop
    };
  },
  weapon: () => ({
    stub: true,
    update: noop,
    reset: noop,
    setVisible: noop,
    ammo: 30,
    magSize: 30,
    reserve: 120,
    state: "idle",
    name: "KR-7",
    ads: 0,
    spread: .01
  }),
  enemies: () => ({
    stub: true,
    list: [],
    update: noop,
    spawn: () => null,
    raycast: () => null,
    aliveCount: () => 0,
    clear: noop,
    alert: noop
  }),
  hud: () => ({
    stub: true,
    update: noop,
    show: noop,
    setObjective: noop,
    message: noop,
    hitmarker: noop
  }),
  mats: () => {
    let i = new Map();
    return {
      stub: true,
      get: t => (i.has(t) || i.set(t, new MeshStandardMaterial({
        color: 7829367,
        roughness: .7
      })), i.get(t)),
      emissive: (t = 16777215, n = 4) => new MeshBasicMaterial({
        color: new Color(t).multiplyScalar(n)
      }),
      names: [],
      decal: () => ({
        material: new MeshBasicMaterial({
          transparent: true,
          opacity: 0
        }),
        aspect: 1
      }),
      label: () => ({
        material: new MeshBasicMaterial({
          transparent: true,
          opacity: 0
        }),
        aspect: 4
      }),
      uniforms: {
        wet: {
          value: 1
        }
      },
      update: noop
    };
  }
};
export { fallbacks };
