import { harborWorld } from './world.js';
import { createHarborLevel } from './level.js';
import { createHarborBackdrop } from './backdrop.js';
import { createHarborGround } from './ground.js';
export const harbor = {
  id: 'harbor',
  title: '솔트라인 터미널 · 4번 선석',
  world: harborWorld,
  createLevel: createHarborLevel,
  createBackdrop: createHarborBackdrop,
  createGround: createHarborGround
};
