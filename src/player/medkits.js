import { BoxGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, Vector3 } from '../../vendor/three.js';
import { loadCampaignProgress } from '../story/campaign-progress.js';

// Fixed supply points make recovery a route choice rather than passive regeneration.
const DEFAULT_SITES = [
  [-25, 0, 6], [-8, 0, 6], [8, 0, 16],
  [-8, .03, -20], [6, .03, -20], [24, 0, 7]
];
const ACT1_SITES = [
  [-27, 0, 3], [-15, 0, -1], [-2, 0, 2], [11, 0, -2], [23, 0, 3]
];
const BRIDGE_BONUS_SITES = [[-20, 0, -3], [16, 0, 3]];
const RESPAWN_SECONDS = 60;
const HEAL_AMOUNT = 25;
const PICKUP_RADIUS = 1.15;

export function createMedkits(game, sites) {
  if (!sites) {
    const mapId = game.map?.id || '';
    sites = /^m0[1-6]_/.test(mapId) ? [...ACT1_SITES] : DEFAULT_SITES;
    if (mapId === 'm06_bridge' && loadCampaignProgress().flags.includes('flag_medical_supply')) {
      sites.push(...BRIDGE_BONUS_SITES);
    }
  }
  const root = new Group();
  root.name = 'medkits';
  game.scene.add(root);
  const caseGeometry = new BoxGeometry(.6, .25, .4);
  const stripeGeometry = new BoxGeometry(.31, .012, .075);
  const crossGeometry = new BoxGeometry(.075, .012, .25);
  const caseMaterial = new MeshStandardMaterial({ color: 0xe9e9d8, roughness: .7 });
  const crossMaterial = new MeshBasicMaterial({ color: 0xd42a31 });
  const nav = game.physics && game.physics.nav;
  const points = sites.map(site => {
    const position = new Vector3(...site);
    // Keep supplies reachable if the map's collision layout changes.
    if (nav && nav.isWalkable && !nav.isWalkable(position.x, position.z)) {
      let found = false;
      for (const radius of [.5, 1, 1.5, 2, 3]) {
        for (let angle = 0; angle < 8; angle++) {
          const x = site[0] + Math.cos(angle * Math.PI / 4) * radius;
          const z = site[2] + Math.sin(angle * Math.PI / 4) * radius;
          if (nav.isWalkable(x, z)) {
            position.x = x;
            position.z = z;
            found = true;
            break;
          }
        }
        if (found) break;
      }
    }
    const model = new Group();
    const body = new Mesh(caseGeometry, caseMaterial);
    body.position.y = .125;
    const stripe = new Mesh(stripeGeometry, crossMaterial);
    const cross = new Mesh(crossGeometry, crossMaterial);
    stripe.position.y = cross.position.y = .257;
    model.add(body, stripe, cross);
    model.position.copy(position);
    root.add(model);
    return { position, model, remaining: 0 };
  });
  root.visible = false;
  return {
    points,
    reset() {
      root.visible = true;
      for (const point of points) {
        point.remaining = 0;
        point.model.visible = true;
      }
    },
    update(dt) {
      const player = game.player;
      if (!root.visible || !player || !player.alive) return;
      for (const point of points) {
        if (point.remaining > 0) {
          point.remaining = Math.max(0, point.remaining - dt);
          if (point.remaining === 0) point.model.visible = true;
        }
        if (point.remaining > 0 || player.health >= player.maxHealth ||
            Math.abs(player.pos.y - point.position.y) > 1 ||
            Math.hypot(player.pos.x - point.position.x, player.pos.z - point.position.z) > PICKUP_RADIUS) continue;
        const healed = Math.min(HEAL_AMOUNT, player.maxHealth - player.health);
        player.heal(healed);
        point.remaining = RESPAWN_SECONDS;
        point.model.visible = false;
        game.events.emit('player:heal', { amount: healed, pos: point.position });
        if (game.hud && game.hud.message) game.hud.message(`구급품 +${Math.ceil(healed)}`, 2);
      }
    }
  };
}
