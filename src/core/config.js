import { Color, Vector3 } from '../../vendor/three.js';
var SUN = {
  dir: new Vector3(.916, .225, .331).normalize(),
  color: new Color(1, .72, .42),
  intensity: 9
};
var ENVIRONMENT = {
  zenith: new Color(.055, .085, .13),
  horizon: new Color(.95, .55, .28),
  horizonAway: new Color(.16, .22, .3),
  fog: new Color(.42, .47, .52)
};
var PLAYER = {
  eye: 1.68,
  crouchEye: 1.05,
  radius: .32,
  height: 1.8,
  fov: 74,
  viewFov: 54
};
var WORLD_LAYER = 0;
var VIEWMODEL_LAYER = 1;
var QUALITY_PRESETS = {
  test: {
    name: "test",
    scale: 1,
    msaa: 0,
    shadow: 1024,
    tex: 256,
    volSteps: 10,
    ao: true,
    planar: .5,
    bloom: true,
    motionBlur: false,
    rain: .4
  },
  low: {
    name: "low",
    scale: .7,
    msaa: 0,
    shadow: 2048,
    tex: 512,
    volSteps: 12,
    ao: false,
    planar: 0,
    bloom: true,
    motionBlur: false,
    rain: .5
  },
  medium: {
    name: "medium",
    scale: .85,
    msaa: 2,
    shadow: 2048,
    tex: 1024,
    volSteps: 16,
    ao: true,
    planar: .5,
    bloom: true,
    motionBlur: false,
    rain: .8
  },
  high: {
    name: "high",
    scale: 1,
    msaa: 4,
    shadow: 4096,
    tex: 1024,
    volSteps: 24,
    ao: true,
    planar: .5,
    bloom: true,
    motionBlur: true,
    rain: 1
  },
  ultra: {
    name: "ultra",
    scale: 1,
    msaa: 4,
    shadow: 4096,
    tex: 2048,
    volSteps: 40,
    ao: true,
    planar: 1,
    bloom: true,
    motionBlur: true,
    rain: 1
  }
};
function selectQuality(i) {
  if (i && QUALITY_PRESETS[i]) return {
    ...QUALITY_PRESETS[i]
  };
  if (/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) || navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 900) return {
    ...QUALITY_PRESETS.low
  };
  let t = "";
  try {
    let s = document.createElement("canvas");
    let o = s.getContext("webgl2") || s.getContext("webgl");
    if (o) {
      let r = o.getExtension("WEBGL_debug_renderer_info");
      t = String(r ? o.getParameter(r.UNMASKED_RENDERER_WEBGL) : o.getParameter(o.RENDERER));
      let a = o.getExtension("WEBGL_lose_context");
      a && a.loseContext();
    }
  } catch {}
  return {
    ...(/SwiftShader|llvmpipe|Software|Mali|Adreno|PowerVR/i.test(t) || /Intel/i.test(t) && !/Arc/i.test(t) ? QUALITY_PRESETS.medium : QUALITY_PRESETS.high)
  };
}
export { VIEWMODEL_LAYER, ENVIRONMENT, PLAYER, QUALITY_PRESETS, SUN, WORLD_LAYER, selectQuality };
