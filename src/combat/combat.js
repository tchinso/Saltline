import { Vector3 } from '../../vendor/three.js';
function createCombat(game) {
  let e = {
    shots: 0,
    hits: 0,
    kills: 0
  };
  game.events.on("enemy:killed", () => {
    e.kills++;
  });
  return {
    stats: e,
    reset() {
      e.shots = e.hits = e.kills = 0;
    },
    playerShot(n, s, {
      damage: o = 28,
      range: r = 300,
      impulse: a = 1
    } = {}) {
      e.shots++;
      let l = game.physics.raycast(n, s, r);
      let c = game.enemies.raycast(n, s, l ? l.dist : r);
      if (c) {
        e.hits++;
        let u = c.part === "weak" ? 2.2 : 1;
        let h = c.enemy.damage(o * u, c.point, s, c.part) === true;
        let f = {
          point: c.point,
          normal: c.normal || s.clone().negate(),
          dist: c.dist,
          surface: "enemy",
          enemy: c.enemy,
          part: c.part,
          dir: s,
          from: "player",
          killed: h
        };
        game.events.emit("impact", f);
        game.events.emit("player:hitEnemy", {
          enemy: c.enemy,
          part: c.part,
          killed: h,
          weak: c.part === "weak"
        });
        return f;
      }
      if (l) {
        let u = {
          point: l.point,
          normal: l.normal,
          dist: l.dist,
          surface: l.surface,
          enemy: null,
          dir: s,
          from: "player"
        };
        game.events.emit("impact", u);
        return u;
      }
      return null;
    },
    enemyShot(n, s, {
      damage: o = 6,
      range: r = 200
    } = {}) {
      let a = game.physics.raycast(n, s, r);
      let l = a ? a.dist : r;
      let c = game.player;
      if (c && c.alive) {
        let u = nm.copy(c.pos);
        u.y += 1;
        let h = u.sub(n).dot(s);
        if (h > 0 && h < l) {
          zf.copy(n).addScaledVector(s, h);
          let f = Math.abs(zf.y - (c.pos.y + .95));
          if (Math.hypot(zf.x - c.pos.x, zf.z - c.pos.z) < .38 && f < .95) {
            c.damage(o, n);
            return true;
          }
        }
      }
      a && game.events.emit("impact", {
        point: a.point,
        normal: a.normal,
        dist: a.dist,
        surface: a.surface,
        enemy: null,
        dir: s,
        from: "enemy"
      });
      return false;
    },
    explode(n, s = 5, o = 80, r = "player") {
      for (let l of game.enemies.list) {
        if (!l.alive) continue;
        let c = l.pos.distanceTo(n);
        c < s && game.physics.lineOfSight(n, nm.copy(l.pos).setY(l.pos.y + .5)) && l.damage(o * (1 - c / s), l.pos, zf.copy(l.pos).sub(n).normalize(), "body");
      }
      let a = game.player;
      if (a && a.alive) {
        let l = nm.copy(a.pos).setY(a.pos.y + 1).distanceTo(n);
        l < s && game.physics.lineOfSight(n, nm.copy(a.pos).setY(a.pos.y + 1)) && a.damage(o * .5 * (1 - l / s), n);
      }
    }
  };
}
var nm = new Vector3();
var zf = new Vector3();
export { createCombat };
