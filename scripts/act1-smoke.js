import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}),
  args: ['--enable-unsafe-swiftshader']
});

try {
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  await page.addInitScript(() => localStorage.setItem('saltline.developer-mode.v1', 'enabled'));
  const failures = [];
  page.on('pageerror', error => {
    if (!error.stack?.includes('.user.js')) failures.push(error.message);
  });
  const episodes = process.env.EPISODES ? process.env.EPISODES.split(',').map(Number) : [1, 2, 3, 4, 5, 6];
  for (const episode of episodes) {
    const id = `m0${episode}`;
    await page.goto(`${process.env.GAME_URL || 'http://127.0.0.1:4173/'}?story=${id}&q=test&noaudio=1&autostart=1`);
    await page.waitForFunction(() => window.__ready || window.__fatal, null, { timeout: 180000 });
    if (episode === 1 || episode === 6) {
      await page.waitForFunction(() => document.getElementById('boot').hidden, null, { timeout: 30000 });
      await mkdir('test-results', { recursive: true });
      await page.screenshot({ path: `test-results/act1-${id}.png` });
    }
    const result = await page.evaluate(() => {
      const game = window.__G;
      game.renderer.setAnimationLoop(null);
      const mission = game.game;
      const run = mission.run;
      game.input.down = key => key === 'interact';
      function interact(id) {
        const objective = game.level.objectives.find(item => item.id === id);
        game.player.pos.copy(objective.pos);
        mission.update(2.1);
      }
      const initial = { state: mission.state, patrol: game.enemies.aliveCount() };
      interact('optional_1');
      const stageResults = [];
      let breakerSeen = false;
      let escortFailure = null;
      let finishedEscortRetry = null;
      let supply = null;
      for (let i = 1; i <= 4; i++) {
        if (i === 3 && mission.escort) {
          game.player.health = 61;
          game.weapon.reserve = 78;
        }
        const reserveBefore = game.weapon.reserve;
        interact(`stage_${i}`);
        if (i === 2 && game.story.id === 'm06') supply = game.weapon.reserve - reserveBefore;
        if (i === 3 && mission.escort) {
          breakerSeen ||= game.enemies.list.some(enemy => enemy.alive && enemy.type === 'breaker');
          const displayed = !game.hud.root.querySelector('.escort-status').hidden;
          run.queue.length = 0;
          game.enemies.list.push({ alive: true, pos: mission.escort.root.position.clone() });
          mission.update(51);
          const failed = mission.state;
          mission.menus.root.querySelector('[data-act="retry"]').click();
          escortFailure = { displayed, failed, state: mission.state, cut: run.cut,
            health: game.player.health, reserve: game.weapon.reserve,
            optional: run.relays.find(item => item.id === 'optional_1').cut };
          interact('stage_3');
        }
        const completed = run.cut;
        const clearing = run.clearing;
        if (clearing && i < 4) interact(`stage_${i + 1}`);
        const blocked = run.cut === completed;
        let spawned = 0;
        for (let tick = 0; run.clearing && tick < 60; tick++) {
          breakerSeen ||= game.enemies.list.some(enemy => enemy.alive && enemy.type === 'breaker');
          spawned += game.enemies.aliveCount();
          game.enemies.clear();
          if (mission.escort?.active) game.player.pos.copy(mission.escort.root.position);
          mission.update(1);
        }
        stageResults.push({ completed, clearing, blocked, spawned, remaining: run.clearing || run.queue.length > 0 });
      }
      if (mission.escort) {
        game.player.damage(1000, null);
        mission.menus.root.querySelector('[data-act="retry"]').click();
        finishedEscortRetry = { cut: run.cut, finished: mission.escort.finished,
          visible: mission.escort.root.visible, state: mission.state };
        interact('stage_4');
      }
      const reserve = game.weapon.reserve;
      game.player.pos.copy(game.level.extraction.pos);
      mission.update(.1);
      const completed = mission.state;
      const choices = [...mission.menus.root.querySelectorAll('[aria-label="선택 목표 결과"] dd')].map(node => node.textContent);
      const progress = JSON.parse(localStorage.getItem('saltline.campaign.v1'));
      mission.start({ skipIntro: true });
      return { initial, stageResults, reserve, supply, escortFailure, finishedEscortRetry, breakerSeen, completed, choices, progress,
        restarted: { state: mission.state, cut: run.cut, choices: run.relays.filter(item => item.def.optional && item.cut).length }, errors: window.__errors };
    });
    assert.equal(result.initial.state, 'playing', id);
    assert.equal(result.initial.patrol, 3, id);
    for (let i = 0; i < result.stageResults.length; i++) {
      const stage = result.stageResults[i];
      assert.equal(stage.completed, i + 1, `${id} stage ${i + 1}`);
      assert.equal(stage.blocked, true, `${id} advances during combat`);
      assert.equal(stage.remaining, false, `${id} combat did not end`);
      if (i < 3) assert.ok(stage.clearing && stage.spawned > 0, `${id} missing wave`);
    }
    assert.equal(result.completed, 'complete', id);
    assert.deepEqual(result.choices, episode === 1 ? ['완료', '미완료'] : ['완료'], id);
    assert.ok(result.progress.completed.includes(id), id);
    if (episode === 5) assert.ok(result.progress.flags.includes('flag_medical_supply'));
    if ([2, 3, 5, 6].includes(episode)) assert.deepEqual(result.escortFailure,
      { displayed: true, failed: 'dead', state: 'playing', cut: 2, health: 61, reserve: 78, optional: true }, id);
    if ([2, 3, 5, 6].includes(episode)) assert.deepEqual(result.finishedEscortRetry,
      { cut: 3, finished: true, visible: true, state: 'playing' }, id);
    if (episode === 6) {
      assert.ok(result.breakerSeen, 'M06 breaker did not spawn');
      assert.equal(result.supply, 60, 'M06 ammunition supply');
    }
    assert.deepEqual(result.restarted, { state: 'playing', cut: 0, choices: 0 }, id);
    assert.deepEqual(result.errors, [], id);
    console.log(`${id} passed: interaction, waves, optional results, extraction, save, restart`);
  }
  assert.deepEqual(failures, []);
} finally {
  await browser.close();
}
