// Six consecutive toggles form three on/off cycles regardless of the initial setting.
export function createDeveloperGesture() {
  let count = 0;
  return {
    toggle() {
      if (++count < 6) return false;
      count = 0;
      return true;
    },
    reset() { count = 0; }
  };
}
