import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}), args: ['--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  const failures = [];
  page.on('pageerror', error => { if (!error.stack?.includes('.user.js')) failures.push(error.message); });
  await page.goto(`${process.env.GAME_URL || 'http://127.0.0.1:4173/'}?story=m01&q=test&noaudio=1&autostart=1`);
  await page.waitForFunction(() => window.__ready || window.__fatal, null, { timeout: 180000 });
  assert.equal(await page.evaluate(() => window.__fatal), null);
  const result = await page.evaluate(() => {
    const g = window.__G;
    g.renderer.setAnimationLoop(null);
    const bag = g.ammoBags.points[0];
    g.player.pos.copy(bag.position);
    g.weapon.ammo = 0; g.weapon.reserve = 10;
    const reloading = g.weapon.reloadNow();
    g.ammoBags.update(.016);
    const pickup = [g.weapon.ammo, g.weapon.reserve, bag.model.visible];
    for (let i = 0; i < 240; i++) g.weapon.update(1 / 60);
    const afterReload = [g.weapon.ammo, g.weapon.reserve];
    g.input.fire = true; g.weapon.update(.016); g.input.fire = false;
    const fired = g.weapon.ammo < 30;
    g.player.pos.x += 8;
    g.ammoBags.update(60);
    const respawned = bag.model.visible;
    g.player.pos.copy(bag.position);
    g.weapon.ammo = 2; g.weapon.reserve = 210;
    g.ammoBags.update(.016);
    const bonus = [g.weapon.ammo, g.weapon.reserve];
    return { reloading, pickup, afterReload, fired, respawned, bonus, errors: window.__errors };
  });
  assert.deepEqual(result, { reloading: true, pickup: [30, 150, false], afterReload: [30, 150], fired: true, respawned: true, bonus: [30, 210], errors: [] });
  assert.deepEqual(failures, []);
  console.log('Ammo bags passed: empty reload, immediate full refill, firing, respawn and bonus preservation.');
} finally { await browser.close(); }
