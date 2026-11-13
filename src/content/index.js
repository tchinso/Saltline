import { createContentRegistry } from './registry.js';
import { harbor } from './maps/harbor/index.js';
import { harbormaster } from './stories/harbormaster.js';
import { act1Maps } from './maps/act1/index.js';
import { act1Stories } from './stories/act1.js';

// Register new content here without changing the bootstrap or simulation.
export const content = createContentRegistry({
  maps: [harbor, ...act1Maps],
  stories: [harbormaster, ...act1Stories],
  defaultStoryId: 'harbormaster'
});
