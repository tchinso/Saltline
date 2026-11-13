// Episode tints are deliberately bounded so every mission remains readable.
// A null profile keeps the original renderer completely unchanged.
const DEFAULTS = {
  sunColor: [1, .72, .42], zenith: [.055, .085, .13],
  horizon: [.95, .55, .28], horizonAway: [.16, .22, .3], fog: [.42, .47, .52]
};
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export function resolveVisualMood(profile, params = {}) {
  if (!profile || params.show || params.shot || params.bench) return null;
  const result = {};
  for (const [key, fallback] of Object.entries(DEFAULTS)) {
    const value = profile[key];
    result[key] = Array.isArray(value) && value.length === 3 && value.every(Number.isFinite)
      ? value.map(component => clamp(component, .02, 1)) : [...fallback];
  }
  const number = (value, fallback, min, max) => Number.isFinite(value) ? clamp(value, min, max) : fallback;
  result.sunIntensity = number(profile.sunIntensity, 9, 5, 12);
  result.exposure = number(profile.exposure, 1, .75, 1.2);
  result.saturation = number(profile.saturation, 1, .7, 1.15);
  return result;
}
