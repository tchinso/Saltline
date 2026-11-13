import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}), args: ['--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  const failures = [];
  page.on('pageerror', error => { if (!error.stack?.includes('.user.js')) failures.push(error.message); });
  for (let episode = 7; episode <= 13; episode++) {
    const id = `m${String(episode).padStart(2, '0')}`;
    await page.goto(`${process.env.GAME_URL || 'http://127.0.0.1:4173/'}?story=${id}&q=test&noaudio=1&autostart=1`);
    await page.waitForFunction(() => window.__ready || window.__fatal, null, { timeout: 180000 });
    const result = await page.evaluate(() => {
      const game = window.__G, mission = game.game, run = mission.run;
      game.renderer.setAnimationLoop(null);
      game.input.down = key => key === 'interact';
      const interact = id => { game.player.pos.copy(game.level.objectives.find(o => o.id === id).pos); mission.update(2.1); };
      const initial = { state: mission.state, patrol: game.enemies.aliveCount(), recon: [...game.hud.root.querySelectorAll('.h-cm b')].filter(n => n.textContent === '경계').length };
      interact('optional_1');
      let boss = false, escapeBeforeClear = false, escortSeen = false, checkpoint = null;
      const results = [];
      for (let i = 1; i <= 4; i++) {
        if (i === 3 && ['m07', 'm13'].includes(game.story.id)) { game.player.health = 81; game.weapon.reserve = 79; }
        interact(`stage_${i}`);
        if (i === 3 && ['m07', 'm13'].includes(game.story.id)) {
          game.player.damage(1000);
          mission.menus.root.querySelector('[data-act="retry"]').click();
          checkpoint = { state: mission.state, cut: run.cut, health: game.player.health, reserve: game.weapon.reserve,
            choice: run.relays.find(item => item.id === 'optional_1').cut };
          interact('stage_3');
        }
        results.push(run.cut);
        boss ||= game.enemies.list.some(e => e.alive && e.type === 'colossus');
        escortSeen ||= !!mission.escort?.active;
        if (game.story.id === 'm10' && i === 3) { escapeBeforeClear = !run.clearing && run.queue.length > 0; continue; }
        for (let tick = 0; run.clearing && tick < 90; tick++) {
          game.enemies.clear();
          if (mission.escort?.active) game.player.pos.copy(mission.escort.root.position);
          mission.update(1);
        }
      }
      game.player.pos.copy(game.level.extraction.pos);
      mission.update(.1);
      return { initial, results, boss, escapeBeforeClear, escortSeen, checkpoint, completed: mission.state, progress: JSON.parse(localStorage.getItem('saltline.campaign.v1')), errors: window.__errors };
    });
    assert.equal(result.initial.state, 'playing', id);
    assert.equal(result.initial.patrol, 3, id);
    assert.deepEqual(result.results, [1, 2, 3, 4], id);
    if ([7, 9, 11, 12].includes(episode)) assert.equal(result.escortSeen, true, id);
    if (episode === 9) assert.ok(result.progress.flags.includes('flag_recon_intel'));
    if (episode === 10) { assert.equal(result.escapeBeforeClear, true, id); assert.equal(result.initial.recon, 3, 'M09 recon reveals M10 sentry locations'); }
    if ([7, 13].includes(episode)) assert.deepEqual(result.checkpoint, { state: 'playing', cut: 2, health: 81, reserve: 79, choice: true }, id);
    if (episode === 13) assert.equal(result.boss, true, id);
    assert.equal(result.completed, 'complete', id);
    assert.ok(result.progress.completed.includes(id), id);
    assert.deepEqual(result.errors, [], id);
    console.log(`${id} passed: objectives, combat, choice, extraction, save`);
  }
  assert.deepEqual(failures, []);
} finally { await browser.close(); }
