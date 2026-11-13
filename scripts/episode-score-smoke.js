import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}),
  args: ['--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader']
});
try {
  const page = await browser.newPage();
  // Keep the real game bootstrap out of this isolated WebAudio rendering test.
  await page.route('**/game.js', route => route.abort());
  await page.goto(process.env.GAME_URL || 'http://127.0.0.1:4173/');
  const result = await page.evaluate(async () => {
    const { createEpisodeScore } = await import('/src/audio/episode-score.js');
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    analyser.connect(context.destination);
    const score = createEpisodeScore(context, analyser, {
      bpm: 108, root: 48, mode: 'minor', motif: [0, 2, 4, 3, 2, 5, 4, 1], rhythm: [1, 0, 1, 1, 0, 1, 0, 1]
    });
    await context.resume();
    const data = new Float32Array(analyser.fftSize);
    let peak = 0, energy = 0, count = 0;
    for (let i = 0; i < 45; i++) {
      score.update({ intensity: .8, state: 'playing' });
      await new Promise(resolve => setTimeout(resolve, 45));
      analyser.getFloatTimeDomainData(data);
      for (const sample of data) { peak = Math.max(peak, Math.abs(sample)); energy += sample * sample; count++; }
    }
    score.update({ paused: true, state: 'paused' });
    const paused = score.debug().scheduled;
    await new Promise(resolve => setTimeout(resolve, 200));
    score.update({ paused: true, state: 'paused' });
    const whilePaused = score.debug().scheduled;
    await context.suspend();
    await new Promise(resolve => setTimeout(resolve, 150));
    await context.resume();
    score.update({ intensity: .8, state: 'playing' });
    const afterResume = score.debug().scheduled;
    await context.close();
    return { peak, rms: Math.sqrt(energy / count), paused, whilePaused, afterResume };
  });
  assert.ok(result.rms > .001, `score must be audible: ${result.rms}`);
  assert.ok(result.peak < .8, `score must avoid clipping: ${result.peak}`);
  assert.equal(result.whilePaused, result.paused, 'no notes scheduled while paused');
  assert.ok(result.afterResume - result.paused <= 6, 'resume does not emit a backlog');
  console.log(`Episode score passed: audible RMS ${result.rms.toFixed(4)}, peak ${result.peak.toFixed(4)}, bounded pause/resume.`);

  await page.unroute('**/game.js');
  await page.addInitScript(() => localStorage.setItem('saltline.developer-mode.v1', 'enabled'));
  for (const [id, bpm, mode] of [['m01', 96, 'major'], ['m07', 88, 'dorian']]) {
    await page.goto(`${process.env.GAME_URL || 'http://127.0.0.1:4173/'}?story=${id}&q=test`);
    await page.waitForFunction(() => window.__ready || window.__fatal, null, { timeout: 180000 });
    assert.equal(await page.evaluate(() => window.__fatal), null, id);
    await page.locator('[data-s="title"] [data-act="deploy"]').click();
    await page.evaluate(() => window.__G.game.start({ skipIntro: true }));
    await page.waitForFunction(() => window.__G?.game?.state === 'playing' &&
      window.__G?.audio?.debug?.().episodeScore?.scheduled > 0, null, { timeout: 30000 });
    const inGame = await page.evaluate(() => ({ id: window.__G.story.id, audio: window.__G.audio.debug(), errors: window.__errors }));
    assert.equal(inGame.id, id);
    assert.equal(inGame.audio.state, 'running', `${id} WebAudio is running`);
    assert.equal(inGame.audio.episodeScore.active, true, `${id} episode score is playing`);
    assert.equal(inGame.audio.episodeScore.bpm, bpm, `${id} music profile reaches the mixer`);
    assert.equal(inGame.audio.episodeScore.mode, mode);
    const ambience = inGame.audio.ambience;
    assert.ok(ambience, `${id} exposes ambience mix levels`);
    assert.equal(ambience.rain, 0, `${id} rain loop is muted`);
    assert.equal(ambience.rainInterior, 0, `${id} indoor rain loop is muted`);
    assert.equal(ambience.sea, 0, `${id} harbor sea loop is muted`);
    assert.ok(Number.isFinite(ambience.wind) && ambience.wind >= 0 && ambience.wind <= .03, `${id} wind remains subtle`);
    assert.equal(ambience.harborEvents, false, `${id} harbor events are disabled`);
    assert.deepEqual(inGame.errors, []);
    console.log(`${id} passed: episode score is active and the background mix is restrained.`);
  }
} finally {
  await browser.close();
}
