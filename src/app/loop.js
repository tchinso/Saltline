// Owns frame ordering and isolates a failing system so diagnostics remain available.
export function startGameLoop(game, {
  showcase,
  getShot,
  onFrameTime
}) {
  const params = game.params;
  let averageFrameTime = 0;
  let lastFrameTime = performance.now();
  let weaponWetness = 1;
  let updateSystem = (h, f) => {
    let p = game[h];
    if (p && p.update) try {
      p.update(f);
    } catch (d) {
      updateSystem.err[h] || (updateSystem.err[h] = 1, console.error(`[loop] ${h}.update threw: ${d && d.stack || d}`));
    }
  };
  updateSystem.err = {};
  game.renderer.setAnimationLoop(() => {
    let h = performance.now();
    let f = (h - lastFrameTime) / 1e3;
    lastFrameTime = h;
    averageFrameTime = averageFrameTime ? averageFrameTime * .95 + f * .05 : f;
    onFrameTime(averageFrameTime);
    let p = Math.min(f, .05);
    params.dt && (p = +params.dt);
    game.time.dt = p;
    game.time.t += p;
    game.time.real = h / 1e3;
    game.time.frame++;
    updateSystem("input", p);
    let d = false;
    try {
      d = game.game.update(p) !== false && game.game.state !== "title" && game.game.state !== "paused";
    } catch (v) {
      updateSystem.err.game || (updateSystem.err.game = 1, console.error("[loop] game.update threw: " + (v && v.stack || v)));
    }
    if (showcase) {
      if (game.showcaseInfo.update) try {
        game.showcaseInfo.update(p);
      } catch (v) {
        updateSystem.err.sc || (updateSystem.err.sc = 1, console.error("[loop] showcase update threw: " + (v && v.stack || v)));
      }
    } else d && (updateSystem("player", p), updateSystem("medkits", p), updateSystem("ammoBags", p), updateSystem("weapon", p), updateSystem("enemies", p));
    if (game.weapon && game.weapon.setWetness && game.level && game.level.interiorBoxes && game.level.interiorBoxes[0]) {
      let v = game.level.interiorBoxes[0];
      let g = game.camera.position;
      let x = g.x > v.min.x && g.x < v.max.x && g.z > v.min.z && g.z < v.max.z && g.y < v.max.y;
      weaponWetness += ((x ? .3 : 1) - weaponWetness) * Math.min(1, p * (x ? .25 : .6));
      try {
        game.weapon.setWetness(weaponWetness);
      } catch {}
    }
    game.game.state !== "paused" && (updateSystem("fx", p), updateSystem("ground", p), updateSystem("level", p), updateSystem("backdrop", p), updateSystem("mats", p));
    updateSystem("audio", p);
    updateSystem("hud", p);
    const shot = getShot();
    shot && (game.camera.position.copy(shot.pos), game.camera.lookAt(shot.look));
    game.bench && game.bench.frame(f);
    try {
      game.render.frame(p);
    } catch (v) {
      updateSystem.err.render || (updateSystem.err.render = 1, console.error("[loop] render.frame threw: " + (v && v.stack || v)));
    }
    game.input.endFrame && game.input.endFrame();
    window.__frames++;
    window.__frames === 2 && (window.__ready = true);
  });
}
