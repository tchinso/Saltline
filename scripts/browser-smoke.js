import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';

// npm install supplies Playwright; CI may point at a preinstalled copy instead.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}),
  args: ['--enable-unsafe-swiftshader']
});
try {
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  const failures = [];
  page.on('pageerror', error => {
    // Report application failures, excluding machine-installed browser userscripts.
    if (!error.stack?.includes('.user.js')) failures.push(error.message);
  });
  await page.goto(`${process.env.GAME_URL || 'http://127.0.0.1:4173/'}?q=test&dt=0.016`);
  await page.waitForFunction(() => window.__ready || window.__fatal, {}, { timeout: 180000 });
  assert.equal(await page.evaluate(() => window.__fatal), null);
  assert.equal(await page.evaluate(() => window.__ready), true);
  assert.equal(await page.locator('.m-brand').textContent(), '렐노르');
  assert.match(await page.locator('.m-word').textContent(), /평범한 하루/);
  const flow = await page.evaluate(() => {
    const game = window.__G;
    // Stop automatic frames while exercising state transitions deterministically.
    game.renderer.setAnimationLoop(null);
    game.game.start({ skipIntro: true });
    const start = game.game.state;
    const patrol = game.enemies.aliveCount();
    game.player.update(.016);
    game.input.fire = true;
    game.weapon.update(.016);
    game.input.fire = false;
    const fired = game.weapon.ammo < game.weapon.magSize;
    game.weapon.reloadNow();
    for (let frame = 0; frame < 240; frame++) game.weapon.update(1 / 60);
    const reloaded = game.weapon.ammo === game.weapon.magSize;
    game.game.pause();
    const paused = game.game.state;
    game.game.resume();
    const resumed = game.game.state;
    for (let i = 0; i < 4; i++) {
      game.game.debugCut();
      game.game.run.queue.length = 0;
      game.enemies.clear();
      game.game.update(.016);
    }
    const cut = game.game.run.cut;
    game.player.pos.copy(game.level.extraction.pos);
    game.game.update(.016);
    const complete = game.game.state;
    game.game.start({ skipIntro: true });
    const reset = game.game.run.cut;
    game.player.damage(1000, null);
    const dead = game.game.state;
    game.game.start({ skipIntro: true });
    return { start, patrol, fired, reloaded, paused, resumed, cut, complete, reset, dead };
  });
  assert.deepEqual(flow, {
    start: 'playing', patrol: 3, fired: true, reloaded: true, paused: 'paused', resumed: 'playing', cut: 4,
    complete: 'complete', reset: 0, dead: 'dead'
  });
  // Check responsive CSS without rebuilding the expensive scene.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(async () => {
    const game = window.__G;
    game.render.resize();
    for (let frame = 0; frame < 8; frame++) {
      game.player.update(.016);
      game.weapon.update(.016);
      game.hud.update(.016);
      game.render.frame(.016);
      await new Promise(requestAnimationFrame);
    }
  });
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/mobile.png' });
  const errors = await page.evaluate(() => window.__errors);
  assert.deepEqual(errors, []);
  assert.deepEqual(failures, []);
  console.log('Browser smoke passed: rendering, audio boot, firing/reload, patrol, pause/resume, objectives, extraction, retry, death, mobile layout.');
} finally {
  await browser.close();
}
