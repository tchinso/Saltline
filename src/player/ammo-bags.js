import { BoxGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, Vector3 } from '../../vendor/three.js';

const HARBOR_SITES = [
  [-31, 0, 4], [-24, 0, -5], [-16, 0, 4], [-8, 0, -5],
  [0, 0, 5], [8, 0, -5], [16, 0, 5], [24, 0, -5],
  [-12, .03, -20], [4, .03, -20]
];
const CAMPAIGN_SITES = [
  [-29, 0, -4], [-21, 0, 4], [-13, 0, -4], [-5, 0, 4],
  [3, 0, -4], [11, 0, 4], [19, 0, -4], [27, 0, 4]
];
const RESPAWN_SECONDS = 60;
const PICKUP_RADIUS = 1.15;

// Ammo bags restore both the magazine and the regular reserve capacity.
export function createAmmoBags(game, sites) {
  const mapId = game.map?.id || '';
  sites ||= game.level?.ammoSites || (/^m(?:0[1-9]|1[0-9]|2[0-6])_/.test(mapId) ? CAMPAIGN_SITES : HARBOR_SITES);
  const root = new Group();
  root.name = 'ammo-bags';
  game.scene.add(root);
  const bodyGeometry = new BoxGeometry(.68, .3, .44);
  const endGeometry = new BoxGeometry(.12, .25, .42);
  const bandGeometry = new BoxGeometry(.075, .015, .43);
  const markingGeometry = new BoxGeometry(.2, .015, .08);
  const handleGeometry = new BoxGeometry(.3, .05, .07);
  const handlePostGeometry = new BoxGeometry(.05, .14, .07);
  const fabric = new MeshStandardMaterial({ color: 0x59694a, roughness: .96 });
  const dark = new MeshStandardMaterial({ color: 0x333c2a, roughness: .9 });
  const marking = new MeshBasicMaterial({ color: 0xe7c75d });
  const nav = game.physics?.nav;
  const points = sites.map(site => {
    const position = new Vector3(...site);
    if (nav?.isWalkable && !nav.isWalkable(position.x, position.z)) {
      let found = false;
      for (const radius of [.5, 1, 1.5, 2, 3, 4, 5]) {
        for (let angle = 0; angle < 16; angle++) {
          const x = site[0] + Math.cos(angle * Math.PI / 8) * radius;
          const z = site[2] + Math.sin(angle * Math.PI / 8) * radius;
          if (nav.isWalkable(x, z)) { position.x = x; position.z = z; found = true; break; }
        }
        if (found) break;
      }
    }
    const model = new Group();
    const body = new Mesh(bodyGeometry, fabric); body.position.y = .17;
    model.add(body);
    for (const x of [-.3, .3]) { const end = new Mesh(endGeometry, dark); end.position.set(x, .15, 0); model.add(end); }
    for (const x of [-.2, .2]) { const band = new Mesh(bandGeometry, dark); band.position.set(x, .328, 0); model.add(band); }
    const badge = new Mesh(markingGeometry, marking); badge.position.set(0, .33, 0); model.add(badge);
    for (const x of [-.125, .125]) { const post = new Mesh(handlePostGeometry, dark); post.position.set(x, .39, -.12); model.add(post); }
    const handle = new Mesh(handleGeometry, dark); handle.position.set(0, .46, -.12); model.add(handle);
    model.position.copy(position);
    root.add(model);
    return { position, model, remaining: 0 };
  });
  root.visible = false;
  return {
    points,
    reset() {
      root.visible = true;
      for (const point of points) { point.remaining = 0; point.model.visible = true; }
    },
    update(dt) {
      const player = game.player;
      const weapon = game.weapon;
      if (!root.visible || !player?.alive || !weapon?.refillAmmo) return;
      for (const point of points) {
        if (point.remaining > 0) {
          point.remaining = Math.max(0, point.remaining - dt);
          if (point.remaining === 0) point.model.visible = true;
        }
        if (point.remaining > 0 || (weapon.ammo >= weapon.magSize && weapon.reserve >= weapon.maxReserve) ||
            Math.abs(player.pos.y - point.position.y) > 1 ||
            Math.hypot(player.pos.x - point.position.x, player.pos.z - point.position.z) > PICKUP_RADIUS) continue;
        const amount = weapon.refillAmmo();
        point.remaining = RESPAWN_SECONDS;
        point.model.visible = false;
        game.events.emit('weapon:ammoPickup', { amount, pos: point.position });
        game.hud?.message?.(`탄약 보충 +${amount}`, 2);
      }
    }
  };
}
