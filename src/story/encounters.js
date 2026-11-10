import { Vector3 } from '../../vendor/three.js';
import { clamp } from '../core/math.js';
const COMPASS_DIRECTIONS = ['북쪽', '북동쪽', '동쪽', '남동쪽', '남쪽', '남서쪽', '서쪽', '북서쪽'];
export function createEncounters(game, level, player, hud, run, MISSION_TUNING) {
  const scratchPosition = new Vector3();
  function spawnPointsFor(P) {
    let V = P === "gull" ? "air" : "ground";
    let Y = level && level.enemySpawns || [];
    let L = Y.filter(Z => Z.type === V);
    return L.length ? L : Y;
  }
  function chooseSpawn(P, {
    minDist: V = MISSION_TUNING.spawnFar,
    from: Y = player.pos,
    preferHidden: L = true
  } = {}) {
    let Z = spawnPointsFor(P);
    let J = null;
    let oe = -1e9;
    for (let le of Z) {
      let R = Math.hypot(le.pos.x - Y.x, le.pos.z - Y.z);
      let I = game.rng() * 1.5;
      if (I += R >= V ? 2 + Math.min(1, (R - V) / 30) * .5 : -(V - R) / 4, L) {
        scratchPosition.copy(le.pos);
        scratchPosition.y += P === "gull" ? 0 : 1;
        let ae = true;
        try {
          ae = game.physics.lineOfSight(scratchPosition, player.eye);
        } catch {}
        ae || (I += 2.5);
      }
      let se = run.used.get(le);
      se !== void 0 && run.time - se < 6 && (I -= 3);
      I > oe && (oe = I, J = le);
    }
    let fe = new Vector3();
    if (J) {
      run.used.set(J, run.time);
      fe.copy(J.pos);
      let le = (game.rng() - .5) * 2.4;
      let R = (game.rng() - .5) * 2.4;
      let I = P === "gull";
      try {
        I || (I = game.physics.nav.isWalkable(fe.x + le, fe.z + R));
      } catch {
        I = false;
      }
      I && (fe.x += le, fe.z += R);
    } else {
      let le = game.rng() * Math.PI * 2;
      fe.set(clamp(Y.x + Math.cos(le) * 26, -34, 26), 0, clamp(Y.z + Math.sin(le) * 26, -26, 24));
    }
    P === "gull" && fe.y < 2.5 && (fe.y = 6 + game.rng() * 3);
    return fe;
  }
  function spawnEnemy(P, V, Y) {
    let L = null;
    try {
      L = game.enemies.spawn(P, V, Y);
    } catch (Z) {
      console.error("[game] enemies.spawn threw", Z);
    }
    return L;
  }
  function spawnPatrol() {
    let P = level.playerStart && level.playerStart.pos || player.pos;
    for (let V of ["gull", "hound"]) for (let Y = 0; Y < MISSION_TUNING.patrol[V]; Y++) spawnEnemy(V, chooseSpawn(V, {
      minDist: 32,
      from: P,
      preferHidden: true
    }), {
      state: "patrol"
    });
  }
  function queueWave(P) {
    let V = MISSION_TUNING.waves[Math.min(P, MISSION_TUNING.waves.length - 1)];
    let Y = [];
    for (let oe = 0; oe < V.gull; oe++) Y.push("gull");
    for (let oe = 0; oe < V.hound; oe++) Y.splice(Math.min(Y.length, 1 + oe * 2), 0, "hound");
    let L = 0;
    let Z = 0;
    Y.forEach((oe, fe) => {
      let le = chooseSpawn(oe);
      L += le.x - player.pos.x;
      Z += le.z - player.pos.z;
      run.queue.push({
        type: oe,
        pos: le,
        at: run.time + 1.6 + fe * MISSION_TUNING.spawnStagger
      });
    });
    run.waveHot = 30;
    let J = (Math.atan2(L, -Z) * 180 / Math.PI + 360) % 360;
    hud.warn && hud.warn("적 접근 — " + COMPASS_DIRECTIONS[Math.round(J / 45) % 8], 3.4);
  }
  function updateWaves(P) {
    let V = aliveCount();
    for (let Y = 0; Y < run.queue.length; Y++) {
      let L = run.queue[Y];
      if (run.time < L.at) continue;
      if (V >= MISSION_TUNING.maxAlive) {
        L.at = run.time + 1;
        continue;
      }
      if (!spawnEnemy(L.type, L.pos, {
        state: "alert",
        target: player.pos
      }) && !game.enemies.stub && (L.tries = (L.tries || 0) + 1) < 6) {
        L.at = run.time + 1.5;
        continue;
      }
      run.queue.splice(Y, 1);
      callOptional(game.enemies, "alert", player.pos, 60);
      break;
    }
    if (run.allCut) {
      if (run.pursuitT -= P, run.pursuitT <= 0 && run.pursuitLeft > 0 && !run.queue.length && V < MISSION_TUNING.pursuitMinAlive) {
        run.pursuitT = MISSION_TUNING.pursuitEvery;
        run.pursuitLeft--;
        let Y = game.rng() < .6 ? "gull" : "hound";
        run.queue.push({
          type: Y,
          pos: chooseSpawn(Y),
          at: run.time + .5
        });
      }
      run.pursuitT <= 0 && (run.pursuitT = 4, callOptional(game.enemies, "alert", player.pos, 90));
    }
  }
  function aliveCount() {
    try {
      return game.enemies.aliveCount ? game.enemies.aliveCount() : game.enemies.list.filter(P => P.alive).length;
    } catch {
      return 0;
    }
  }
  function hasNearbyEnemy(P) {
    let V = game.enemies && game.enemies.list || [];
    for (let Y = 0; Y < V.length; Y++) {
      let L = V[Y];
      if (L && L.alive && L.pos && Math.hypot(L.pos.x - player.pos.x, L.pos.z - player.pos.z) < P) return true;
    }
    return false;
  }
  return {
    spawnPatrol,
    queueWave,
    updateWaves,
    aliveCount,
    hasNearbyEnemy
  };
}
