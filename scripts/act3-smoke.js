import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}), args: ['--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  const failures = [];
  page.on('pageerror', error => { if (!error.stack?.includes('.user.js')) failures.push(error.message); });
  for (let episode = 14; episode <= 21; episode++) {
    const id = `m${episode}`;
    await page.goto(`${process.env.GAME_URL || 'http://127.0.0.1:4173/'}?story=${id}&q=test&noaudio=1&autostart=1`);
    await page.waitForFunction(() => window.__ready || window.__fatal, null, { timeout: 180000 });
    const result = await page.evaluate(() => {
      const game = window.__G, mission = game.game, run = mission.run;
      game.renderer.setAnimationLoop(null);
      if (game.story.id === 'm14') localStorage.setItem('saltline.campaign.v1', JSON.stringify({ version: 1, completed: [], flags: ['flag_rail_engineers'] }));
      let adaptiveHint = false;
      if (game.story.id === 'm18') {
        const radio = game.hud.radio;
        game.hud.radio = text => { if (text.includes('회수한 부품')) adaptiveHint = true; };
        mission.start({ skipIntro: true });
        game.hud.radio = radio;
      }
      game.input.down = key => key === 'interact';
      const interact = id => { game.player.pos.copy(game.level.objectives.find(o => o.id === id).pos); mission.update(2.1); };
      const initial = { state: mission.state, patrol: game.enemies.aliveCount() };
      interact('optional_1');
      let hunter = false, adaptive = false, held = false, hunterAliveAfterHold = false, escortSeen = false, bonus = null, timerBlocked = false;
      const results = [];
      for (let i = 1; i <= 4; i++) {
        const before = game.weapon.reserve;
        interact(`stage_${i}`);
        if (i === 2 && ['m15', 'm19', 'm20'].includes(game.story.id)) bonus = game.weapon.reserve - before;
        results.push(run.cut);
        hunter ||= game.enemies.list.some(e => e.alive && e.type === 'hunter');
        adaptive ||= game.enemies.list.some(e => e.alive && e.type === 'adaptive');
        escortSeen ||= !!mission.escort?.active;
        if (run.holdRemaining > 0) {
          held = true;
          const count = run.cut;
          interact(`stage_${i + 1}`);
          timerBlocked = run.cut === count && run.clearing;
          for (let tick = 0; run.holdRemaining > 0 && tick < 45; tick++) {
            for (const enemy of game.enemies.list) if (enemy.alive && enemy.type !== 'hunter') enemy.damage(10000, enemy.pos, null, 'body');
            mission.update(1);
          }
          hunterAliveAfterHold = game.enemies.list.some(e => e.alive && e.type === 'hunter');
          continue;
        }
        for (let tick = 0; run.clearing && tick < 90; tick++) {
          game.enemies.clear();
          if (mission.escort?.active) game.player.pos.copy(mission.escort.root.position);
          mission.update(1);
        }
      }
      game.player.pos.copy(game.level.extraction.pos);
      mission.update(.1);
      return { initial, results, hunter, adaptive, held, timerBlocked, hunterAliveAfterHold, escortSeen, bonus, adaptiveHint, completed: mission.state, progress: JSON.parse(localStorage.getItem('saltline.campaign.v1')), errors: window.__errors };
    });
    assert.equal(result.initial.state, 'playing', id);
    assert.equal(result.initial.patrol, 3, id);
    assert.deepEqual(result.results, [1, 2, 3, 4], id);
    if ([15,16,19,20].includes(episode)) assert.equal(result.escortSeen, true, id);
    if ([15,19,20].includes(episode)) assert.equal(result.bonus, 60, `${id} previous choice bonus`);
    if (episode === 14) assert.equal(result.adaptive, true, id);
    if ([18,20].includes(episode)) { assert.equal(result.held, true, id); assert.equal(result.timerBlocked, true, id); }
    if (episode === 18) { assert.equal(result.hunter, true); assert.equal(result.hunterAliveAfterHold, true, 'hunter survives required delay'); assert.equal(result.adaptiveHint, true, 'M14 parts provide hunter analysis'); }
    assert.equal(result.completed, 'complete', id);
    assert.ok(result.progress.completed.includes(id), id);
    assert.deepEqual(result.errors, [], id);
    console.log(`${id} passed: objectives, finite combat, choice, extraction, save`);
  }
  assert.deepEqual(failures, []);
} finally { await browser.close(); }
