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
  await page.goto(`${process.env.GAME_URL || 'http://127.0.0.1:4173/'}?story=m01&q=test`);
  await page.waitForFunction(() => window.__ready || window.__fatal, null, { timeout: 180000 });
  assert.equal(await page.evaluate(() => window.__fatal), null);
  await page.locator('[data-s="title"] [data-act="deploy"]').click();
  await page.waitForFunction(() => window.__G?.audio?.debug?.().episodeScore?.scheduled > 0, null, { timeout: 30000 });
  const inGame = await page.evaluate(() => ({ score: window.__G.audio.debug().episodeScore, errors: window.__errors }));
  assert.equal(inGame.score.bpm, 96, 'selected episode music profile reaches the mixer');
  assert.equal(inGame.score.mode, 'major');
  assert.deepEqual(inGame.errors, []);
  console.log('Episode score passed: selected profile is running in the game audio mixer.');
} finally {
  await browser.close();
}
