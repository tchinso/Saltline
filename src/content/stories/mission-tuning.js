// Shared campaign combat pacing, retained from the original mission balance.
export const missionTuning = {
  introSeconds: 3.5,
  retryIntroSeconds: 1.3,
  interactRange: 2.2,
  interactFacing: .45,
  cutSeconds: 2.4,
  patrol: { gull: 2, hound: 1 },
  waves: [
    { gull: 3, hound: 1 },
    { gull: 3, hound: 2 },
    { gull: 4, hound: 3 }
  ],
  maxAlive: 9,
  spawnStagger: .85,
  spawnFar: 18,
  pursuitEvery: 7,
  pursuitMinAlive: 4,
  pursuitExtra: 5,
  titleSpeed: 1.15,
  titleFov: 50
};
