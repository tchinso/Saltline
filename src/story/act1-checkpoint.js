import { Vector3 } from '../../vendor/three.js';

// Checkpoints are captured before a main interaction while no wave or escort is
// running. On retry the interaction can be repeated, rebuilding that encounter.
export function captureAct1Checkpoint(game, run) {
  if (run.clearing || run.queue.length) throw new Error('Checkpoint requires a settled encounter');
  const player = game.player;
  return {
    player: { pos: player.pos.toArray(), yaw: player.yaw, pitch: player.pitch, health: player.health },
    weapon: { ammo: game.weapon.ammo, reserve: game.weapon.reserve },
    medkits: (game.medkits?.points || []).map(point => point.remaining),
    enemies: (game.enemies.list || []).filter(enemy => enemy.alive).map(enemy => ({
      type: enemy.type, pos: enemy.pos.toArray(), hp: enemy.hp,
      state: enemy.mode === 'patrol' ? 'patrol' : 'alert'
    })),
    objectives: run.relays.map(item => ({ id: item.id, cut: item.cut })),
    run: {
      time: run.time, cut: run.cut, allCut: run.allCut, alertT: run.alertT,
      pursuitT: run.pursuitT, pursuitLeft: run.pursuitLeft,
      contactSaid: run.contactSaid, lowSaid: run.lowSaid
    },
    combat: { ...game.combat.stats }
  };
}

export function restoreAct1Checkpoint(game, run, checkpoint) {
  const saved = checkpoint;
  game.enemies.clear();
  game.fx.clear?.();
  game.player.reset({ pos: new Vector3(...saved.player.pos), yaw: saved.player.yaw });
  game.player.pitch = saved.player.pitch;
  game.player.health = saved.player.health;
  game.weapon.reset();
  game.weapon.ammo = saved.weapon.ammo;
  game.weapon.reserve = saved.weapon.reserve;
  for (const [index, point] of (game.medkits?.points || []).entries()) {
    point.remaining = saved.medkits[index] ?? 0;
    point.model.visible = point.remaining <= 0;
  }
  Object.assign(run, saved.run);
  run.clearing = false;
  run.waveHot = 0;
  run.queue.length = 0;
  run.used.clear();
  const objectiveStates = new Map(saved.objectives.map(item => [item.id, item.cut]));
  for (const item of run.relays) {
    item.cut = objectiveStates.get(item.id) === true;
    item.t = item.cut ? 1 : 0;
    item.cutting = false;
    item.o.object?.userData?.setState?.(item.cut ? 'cut' : 'live');
  }
  if (game.combat.stats) Object.assign(game.combat.stats, saved.combat);
  for (const item of saved.enemies) {
    const enemy = game.enemies.spawn(item.type, new Vector3(...item.pos), { state: item.state, target: game.player.pos });
    if (!enemy) throw new Error(`Cannot restore checkpoint enemy: ${item.type}`);
    enemy.hp = item.hp;
  }
}
