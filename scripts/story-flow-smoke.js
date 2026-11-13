import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}), args: ['--enable-unsafe-swiftshader'] });
const base = process.env.GAME_URL || 'http://127.0.0.1:4173/';
try {
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  await page.addInitScript(() => {
    window.__testPad = { connected: true, mapping: 'standard', axes: [1, 1, 0, 0], buttons: Array.from({ length: 16 }, () => ({ pressed: false, value: 0 })) };
    Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [window.__testPad] });
  });
  const errors = [];
  page.on('pageerror', error => { if (!error.stack?.includes('.user.js')) errors.push(error.message); });
  await page.goto(`${base}?story=m01&q=test&noaudio=1`);
  await page.waitForFunction(() => window.__ready || window.__fatal, null, { timeout: 180000 });
  assert.equal(await page.evaluate(() => window.__fatal), null);
  await page.evaluate(() => {
    window.__G.renderer.setAnimationLoop(null);
    window.__lockRequests = 0;
    window.__G.input.requestLock = () => { window.__lockRequests++; };
  });
  await page.locator('[data-s="title"] [data-act="deploy"]').click();
  assert.equal(await page.evaluate(() => window.__G.game.state), 'briefing');
  assert.equal(await page.evaluate(() => window.__lockRequests), 0, 'mouse capture waits until the player starts');
  const pages = await page.evaluate(() => window.__G.story.narrative.briefing);
  const pad = async (index, pressed) => page.evaluate(({ index, pressed }) => {
    const button = window.__testPad.buttons[index]; button.pressed = pressed; button.value = pressed ? 1 : 0;
    const game = window.__G; game.input.update(.016); game.game.update(.016); game.input.endFrame();
    return { fire: game.input.fire, move: { ...game.input.move }, ammo: game.weapon.ammo };
  }, { index, pressed });
  assert.equal(await page.locator('[data-f="briefing-text"]').textContent(), pages[0]);
  assert.deepEqual(await pad(0, true), { fire: false, move: { x: 0, y: 0 }, ammo: 30 });
  assert.equal(await page.locator('[data-f="briefing-text"]').textContent(), pages[1], 'A advances');
  await pad(0, true);
  assert.equal(await page.locator('[data-f="briefing-text"]').textContent(), pages[1], 'holding A does not skip pages');
  await pad(0, false); await pad(1, true);
  assert.equal(await page.locator('[data-f="briefing-text"]').textContent(), pages[0], 'B returns to the previous page');
  await pad(1, false);
  for (let index = 0; index < pages.length; index++) {
    assert.equal(await page.locator('[data-f="briefing-text"]').textContent(), pages[index]);
    await pad(0, true);
    await pad(0, false);
  }
  assert.equal(await page.evaluate(() => window.__lockRequests), 0, 'gamepad starts without requesting mouse capture');
  assert.equal(await page.evaluate(() => window.__G.game.state), 'intro');
  await page.evaluate(() => { window.__G.game.update(2); window.__G.hud.update(.05); });
  const radio = await page.locator('.comms').textContent();
  assert.match(radio, /연우/);
  assert.equal(await page.locator('.comms-who').textContent(), '연우');
  await page.evaluate(() => { window.__G.game.update(2); window.__G.game.pause(); });
  assert.equal(await page.evaluate(() => window.__G.game.state), 'paused');
  const before = await page.locator('.comms-t').textContent();
  await page.evaluate(() => window.__G.hud.update(5));
  assert.equal(await page.locator('.comms-t').textContent(), before, 'radio does not advance while paused');
  await page.locator('.story-log summary').click();
  const log = await page.locator('.story-log-body').innerText();
  for (const text of pages) assert.ok(log.includes(text), 'shown briefing remains in the log');
  const unseen = await page.evaluate(() => window.__G.story.narrative.stageCues.stage_4[0]);
  assert.ok(!log.includes(unseen), 'future story does not appear in the log');
  await page.evaluate(() => {
    const game = window.__G;
    game.game.resume();
    game.input.down = key => key === 'interact';
    const optional = game.game.run.relays.find(item => item.id === 'optional_1');
    game.player.pos.copy(optional.o.pos);
    game.game.update(3);
    if (!optional.cut) throw new Error('optional objective did not complete');
    game.events.emit('radio:line', { text: '기술병: 임시 구조 기록' });
    game.input.down = () => false;
    game.player.damage(1000);
    game.game.update(2);
  });
  await page.locator('[data-s="dead"] [data-act="retry"]').click();
  assert.equal(await page.evaluate(() => window.__G.game.state), 'playing', 'retry skips the briefing');
  assert.equal(await page.evaluate(() => window.__G.game.run.relays.find(item => item.id === 'optional_1').cut), false);
  await page.evaluate(() => window.__G.game.pause());
  await page.locator('.story-log summary').click();
  const restoredLog = await page.locator('.story-log-body').innerText();
  assert.ok(!restoredLog.includes('기술병: 임시 구조 기록'), 'retry discards story after the restored checkpoint');
  for (const text of pages) assert.ok(restoredLog.includes(text), 'checkpoint keeps already shown briefing');
  await page.evaluate(() => {
    const game = window.__G;
    game.game.resume();
    for (let i = 0; i < 4; i++) {
      game.game.debugCut();
      game.game.run.queue.length = 0;
      game.enemies.clear();
      game.game.update(.1);
    }
    game.player.pos.copy(game.level.extraction.pos);
    game.game.update(.1);
    game.game.update(4);
  });
  assert.equal(await page.evaluate(() => window.__G.game.state), 'complete');
  const recap = await page.locator('.story-recap').innerText();
  const expected = await page.evaluate(() => window.__G.story.narrative);
  for (const line of expected.debrief) assert.ok(recap.includes(line));
  assert.ok(recap.includes(expected.choiceRecaps.flag_m01_technician.missed));
  assert.ok(!recap.includes(expected.choiceRecaps.flag_m01_technician.completed));
  await page.locator('.story-recap summary').click();
  assert.ok((await page.locator('.story-recap').innerText()).includes(expected.stageCues.stage_4[0]), 'completed dialogue remains readable even if its radio was queued');
  const beforeReplay = await page.evaluate(() => window.__lockRequests);
  await page.locator('[data-s="complete"] [data-act="redeploy"]').click();
  assert.equal(await page.evaluate(() => window.__G.game.state), 'briefing', 'replay reopens the briefing');
  assert.equal(await page.evaluate(() => window.__lockRequests), beforeReplay, 'replay waits for the final confirmation before capturing the mouse');
  await page.locator('[data-act="briefing-skip"]').click();
  assert.equal(await page.evaluate(() => window.__G.game.state), 'intro');
  assert.equal(await page.evaluate(() => window.__lockRequests), beforeReplay + 1);
  assert.deepEqual(await page.evaluate(() => window.__errors), []);
  assert.deepEqual(errors, []);
  console.log('Story flow passed: briefing, lock timing, speaker, pause, log visibility and choice-aware debrief.');
} finally { await browser.close(); }
