
import { showcaseRenderer } from '../render/renderer.js';
import { showcaseLevel } from '../content/maps/harbor/level.js';
import { showcaseBackdrop } from '../content/maps/harbor/backdrop.js';
import { showcaseGround } from '../content/maps/harbor/ground.js';
import { showcaseEffects } from '../effects/effects.js';
import { showcaseWeapon } from '../weapon/weapon.js';
import { showcaseEnemies } from '../enemies/enemies.js';
import { showcaseProps } from '../world/props/registry.js';
import { wA as showcaseMaterials } from '../render/materials.js';

export const showcases = {
 mats: { showcase: showcaseMaterials }, level: { showcase: showcaseLevel },
 backdrop: { showcase: showcaseBackdrop }, ground: { showcase: showcaseGround },
 fx: { showcase: showcaseEffects }, weapon: { showcase: showcaseWeapon },
 enemies: { showcase: showcaseEnemies }, props: { showcase: showcaseProps },
 render: { showcase: showcaseRenderer }
};
