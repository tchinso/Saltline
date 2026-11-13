import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}), args: ['--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  const failures = [];
  page.on('pageerror', error => { if (!error.stack?.includes('.user.js')) failures.push(error.message); });
  const base = process.env.GAME_URL || 'http://127.0.0.1:4173/';
  async function visit(query, expected) {
    await page.goto(`${base}?${query}&q=test&noaudio=1`, { timeout: 180000 });
    await page.waitForFunction(() => window.__ready || window.__fatal, null, { timeout: 180000 });
    const actual = await page.evaluate(() => ({ story: window.__G?.story.id, map: window.__G?.map.id, fatal: window.__fatal,
      url: location.search, note: document.querySelector('.m-note')?.textContent }));
    assert.equal(actual.fatal, null, query);
    assert.equal(actual.story, expected, query);
    return actual;
  }
  let result = await visit('story=21', 'm01');
  assert.match(result.url, /story=m01/);
  assert.match(result.note, /열리지 않은 화/);
  await page.evaluate(() => localStorage.setItem('saltline.campaign.v1', JSON.stringify({ version: 1, completed: ['m01', 'm02', 'm03'], flags: [] })));
  result = await visit('story=m21', 'm04');
  assert.match(result.url, /story=m04/);
  result = await visit('map=m21_underground', 'm04');
  assert.ok(!result.url.includes('map='));
  result = await visit('story=m01&map=m21_underground', 'm04');
  assert.ok(!result.url.includes('map='));
  result = await visit('story=03', 'm03');
  assert.match(result.url, /story=m03/);
  await page.evaluate(() => localStorage.setItem('saltline.campaign.v1', JSON.stringify({ version: 1, completed: ['m01', 'm02', 'm03', 'm14'], flags: [] })));
  await visit('story=m14', 'm14');
  await visit('story=m15', 'm15');
  await visit('story=m13', 'm15');
  await visit('story=99', 'm15');
  await page.evaluate(() => localStorage.setItem('saltline.developer-mode.v1', 'enabled'));
  await visit('story=21', 'm21');
  await visit('map=m21_underground', 'm21');
  for (const query of ['story=harbormaster', 'map=harbor']) {
    result = await visit(query, 'm15');
    assert.match(result.url, /story=m15/);
    assert.ok(!result.url.includes('map='));
  }
  await page.evaluate(() => localStorage.removeItem('saltline.developer-mode.v1'));
  for (const query of ['story=harbormaster', 'map=harbor']) {
    result = await visit(query, 'm15');
    assert.match(result.url, /story=m15/);
    assert.ok(!result.url.includes('map='));
  }
  assert.deepEqual(failures, []);
  console.log('Campaign access passed: numeric and map URLs, fallback, replay, skipped episodes, developer mode and retired harbor links.');
} finally { await browser.close(); }
