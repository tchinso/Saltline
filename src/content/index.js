import { createContentRegistry } from './registry.js';
import { act1Maps } from './maps/act1/index.js';
import { act1Stories } from './stories/act1.js';
import { act2Maps } from './maps/act2/index.js';
import { act2Stories } from './stories/act2.js';
import { act3Maps } from './maps/act3/index.js';
import { act3Stories } from './stories/act3.js';
import { act4Maps } from './maps/act4/index.js';
import { act4Stories } from './stories/act4.js';

// Register new content here without changing the bootstrap or simulation.
export const content = createContentRegistry({
  maps: [...act1Maps, ...act2Maps, ...act3Maps, ...act4Maps],
  stories: [...act1Stories, ...act2Stories, ...act3Stories, ...act4Stories],
  defaultStoryId: 'm01'
});
