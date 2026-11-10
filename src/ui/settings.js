import { PLAYER } from '../core/config.js';
var SETTINGS_KEY = "saltline.settings.v1";
var DEFAULT_SETTINGS = {
  quality: "auto",
  sens: 1,
  invertY: false,
  volume: .8,
  fov: PLAYER.fov
};
var QUALITY_NAMES = ["low", "medium", "high", "ultra"];
function loadSettings() {
  let i = {
    ...DEFAULT_SETTINGS
  };
  try {
    let e = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
    e && typeof e == "object" && ((e.quality === "auto" || QUALITY_NAMES.includes(e.quality)) && (i.quality = e.quality), Number.isFinite(e.sens) && (i.sens = Math.min(3, Math.max(.2, e.sens))), i.invertY = !!e.invertY, Number.isFinite(e.volume) && (i.volume = Math.min(1, Math.max(0, e.volume))), Number.isFinite(e.fov) && (i.fov = Math.min(95, Math.max(60, e.fov))));
  } catch {}
  return i;
}
function saveSettings(i) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(i));
  } catch {}
}
export { QUALITY_NAMES, loadSettings, saveSettings };
