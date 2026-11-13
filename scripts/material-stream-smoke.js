import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

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
  page.on('pageerror', error => { if (!error.stack?.includes('.user.js')) failures.push(error.message); });
  await page.goto(`${process.env.GAME_URL || 'http://127.0.0.1:4173/'}?story=m01&q=test&noaudio=1&autostart=1`);
  await page.waitForFunction(() => window.__ready || window.__fatal, null, { timeout: 180000 });
  assert.equal(await page.evaluate(() => window.__fatal), null);
  const initial = await page.evaluate(() => {
    const material = window.__G.mats.get('concrete');
    window.__streamTest = { material, map: material.map };
    return { state: window.__G.game.state, placeholder: material.map.image?.width === 1, ...window.__G.mats.stats() };
  });
  assert.equal(initial.state, 'playing');
  await page.waitForFunction(() => window.__G.mats.stats().pendingSets === 0, null, { timeout: 180000 });
  const final = await page.evaluate(() => ({
    state: window.__G.game.state,
    sameMaterial: window.__G.mats.get('concrete') === window.__streamTest.material,
    updatedMap: window.__streamTest.material.map !== window.__streamTest.map,
    stats: window.__G.mats.stats(), errors: window.__errors
  }));
  assert.equal(final.state, 'playing');
  assert.equal(final.sameMaterial, true);
  if (initial.placeholder) assert.equal(final.updatedMap, true);
  assert.ok(final.stats.sets > 0);
  assert.deepEqual(final.errors, []);
  assert.deepEqual(failures, []);
  console.log(`Material streaming passed: ${initial.pendingSets} sets queued at playable startup; ${final.stats.sets} generated.`);
} finally {
  await browser.close();
}
