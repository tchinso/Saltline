import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}), args: ['--enable-unsafe-swiftshader'] });
const base = process.env.GAME_URL || 'http://127.0.0.1:4173/';
const url = `${base}?q=test&noaudio=1`;
const failures = [];
async function boot(page) {
  page.on('pageerror', error => { if (!error.stack?.includes('.user.js')) failures.push(error.message); });
  await page.goto(url);
  await page.waitForFunction(() => window.__ready || window.__fatal, null, { timeout: 180000 });
  assert.equal(await page.evaluate(() => window.__fatal), null);
}
async function openSettings(page, screen = 'title') {
  await page.locator(`.m-screen[data-s="${screen}"] [data-act="settings"]`).click();
  assert.equal(await page.locator('.panel').isVisible(), true);
}
async function toggle(page, count, touch = false) {
  const button = page.locator('[data-act="invert"]');
  for (let i = 0; i < count; i++) touch ? await button.tap() : await button.click();
}
async function prompt(page, touch = false) {
  await toggle(page, 5, touch);
  assert.equal(await page.locator('#developer-code').isVisible(), false, 'five toggles are insufficient');
  await toggle(page, 1, touch);
  assert.equal(await page.locator('#developer-code').isVisible(), true);
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'developer-code');
}
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await boot(page);
  assert.equal(await page.evaluate(() => window.__G.story.id), 'm01');
  await page.locator('.campaign-picker summary').click();
  const last = page.locator('.campaign-episodes button').last();
  assert.equal(await last.isDisabled(), true);
  assert.match(await last.textContent(), /잠긴 에피소드/);
  assert.deepEqual(await page.locator('.campaign-act').allTextContents(), ['ACT 1 · 반란의 시작', 'ACT 2', 'ACT 3', 'ACT 4']);
  const hiddenText = await page.locator('.campaign-picker').innerText();
  assert.doesNotMatch(hiddenText, /괴물의 설계자|다시 인간의 세계로|마지막 반격/);
  assert.equal(await last.getAttribute('title'), null);
  assert.equal(await last.getAttribute('aria-label'), null);
  assert.equal(await page.getByRole('button', { name: /다시 인간의 세계로/ }).count(), 0);
  const progressBefore = await page.evaluate(() => localStorage.getItem('saltline.campaign.v1'));
  await page.keyboard.press('c'); await page.keyboard.press('c'); await page.keyboard.press('c');
  const input = page.locator('#developer-code');
  assert.equal(await input.isVisible(), false, 'the old keyboard shortcut is removed');
  await openSettings(page);
  const invert = page.locator('[data-act="invert"]');
  const initial = await invert.getAttribute('aria-pressed');
  await prompt(page);
  assert.equal(await invert.getAttribute('aria-pressed'), initial, 'six toggles preserve the initial setting');
  await input.fill('wrong'); await input.press('Enter');
  assert.equal(await page.locator('.developer-error').textContent(), '코드가 올바르지 않습니다.');
  assert.equal(await last.isDisabled(), true);
  assert.equal(await page.evaluate(() => window.__G.game.state), 'title');
  await input.press('Escape');
  assert.equal(await input.isVisible(), false);
  assert.equal(await page.locator('.panel').isVisible(), true);
  assert.equal(await page.evaluate(() => document.activeElement === document.querySelector('[data-act="invert"]')), true);
  // Closing settings resets a partially entered toggle sequence.
  await toggle(page, 3);
  await page.locator('[data-act="close-panel"]').click();
  await openSettings(page);
  await toggle(page, 3);
  assert.equal(await input.isVisible(), false);
  await toggle(page, 3);
  assert.equal(await input.isVisible(), true);
  await input.fill('vivalaze'); await input.press('Enter');
  assert.equal(await input.isVisible(), false);
  assert.equal(await page.locator('.panel').isVisible(), true);
  assert.equal(await page.evaluate(() => document.activeElement === document.querySelector('[data-act="invert"]')), true);
  assert.match(await page.locator('.developer-status').textContent(), /켜져/);
  assert.equal(await page.evaluate(() => localStorage.getItem('saltline.campaign.v1')), progressBefore);
  await page.locator('[data-act="close-panel"]').click();
  assert.equal(await last.isEnabled(), true);
  assert.match(await last.textContent(), /다시 인간의 세계로/);
  assert.equal(await page.getByRole('button', { name: /다시 인간의 세계로/ }).count(), 1);
  assert.match((await page.locator('.campaign-act').allTextContents())[3], /마지막 반격/);
  for (const index of [6, 7, 8]) {
    const episode = page.locator('.campaign-episodes button').nth(index);
    await episode.scrollIntoViewIfNeeded();
    await episode.hover();
    assert.equal(await episode.evaluate(element => {
      const rect = element.getBoundingClientRect();
      return document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2) === element;
    }), true);
  }
  await last.click();
  await page.waitForFunction(() => window.__ready && window.__G?.story.id === 'm26', null, { timeout: 180000 });
  await page.locator('.campaign-picker summary').click();
  assert.equal(await page.locator('.campaign-episodes button').last().isEnabled(), true);
  await page.reload();
  await page.waitForFunction(() => window.__ready && window.__G?.story.id === 'm26', null, { timeout: 180000 });
  await page.locator('.campaign-picker summary').click();
  await page.locator('.developer-disable').click();
  await page.waitForFunction(() => window.__ready && window.__G?.story.id === 'm01', null, { timeout: 180000 });
  await page.locator('.campaign-picker summary').click();
  assert.equal(await page.locator('.campaign-episodes button').last().isDisabled(), true);
  assert.match(await page.locator('.campaign-episodes button').last().textContent(), /잠긴 에피소드/);
  assert.equal(await page.evaluate(() => localStorage.getItem('saltline.campaign.v1')), progressBefore);
  await page.evaluate(() => { window.__G.game.start({ skipIntro: true }); window.__G.game.pause(); });
  await openSettings(page, 'paused');
  await prompt(page);
  await input.fill('vivalaze'); await input.press('Enter');
  assert.equal(await page.evaluate(() => window.__G.game.state), 'paused');
  assert.equal(await page.locator('.panel').isVisible(), true);
  assert.equal(await page.evaluate(() => document.activeElement === document.querySelector('[data-act="invert"]')), true);
  assert.match(await page.locator('.developer-status').textContent(), /켜져/);
  await page.close();

  // Touch activation works with the setting initially on and never changes it overall.
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await mobile.addInitScript(() => {
    localStorage.setItem('saltline.settings.v1', JSON.stringify({ invertY: true }));
    localStorage.setItem('saltline.campaign.v1', JSON.stringify({ version: 1, completed: ['m06', 'm20'], flags: [] }));
  });
  const touchPage = await mobile.newPage();
  await boot(touchPage);
  await touchPage.locator('.campaign-picker summary').tap();
  const headings = await touchPage.locator('.campaign-act').allTextContents();
  assert.match(headings[1], /인류의 반격/);
  assert.match(headings[2], /기계의 역습/);
  assert.equal(headings[3], 'ACT 4');
  assert.match(await touchPage.locator('.campaign-episodes button').nth(6).textContent(), /괴물의 설계자/);
  assert.match(await touchPage.locator('.campaign-episodes button').nth(7).textContent(), /잠긴 에피소드/);
  await openSettings(touchPage);
  const touchInvert = touchPage.locator('[data-act="invert"]');
  assert.equal(await touchInvert.getAttribute('aria-pressed'), 'true');
  await prompt(touchPage, true);
  assert.equal(await touchInvert.getAttribute('aria-pressed'), 'true');
  assert.equal(await touchPage.evaluate(() => JSON.parse(localStorage.getItem('saltline.settings.v1')).invertY), true);
  await touchPage.locator('#developer-code').fill('vivalaze');
  await touchPage.locator('.developer-dialog [type="submit"]').tap();
  assert.equal(await touchPage.locator('.panel').isVisible(), true);
  assert.match(await touchPage.locator('.developer-status').textContent(), /켜져/);
  assert.equal(await touchPage.evaluate(() => window.__G.input.invertY), true);
  await mobile.close();
  assert.deepEqual(failures, []);
  console.log('Developer mode passed: hidden titles, six setting toggles, reset, focus, pause, touch, saved progress and gameplay isolation.');
} finally { await browser.close(); }
