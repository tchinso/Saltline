import { createContentRegistry } from './registry.js';
import { harbor } from './maps/harbor/index.js';
import { harbormaster } from './stories/harbormaster.js';

// Register new content here without changing the bootstrap or simulation.
export const content = createContentRegistry({
  maps: [harbor],
  stories: [harbormaster],
  defaultStoryId: 'harbormaster'
});
