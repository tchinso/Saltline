import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const base = process.env.GAME_URL || 'http://127.0.0.1:4173/';
for (const mode of process.env.MODE ? [process.env.MODE] : ['baseline', 'profile']) {
  const browser = await chromium.launch({ headless:true, ...(process.env.BROWSER_PATH ? {executablePath:process.env.BROWSER_PATH} : {}), args:['--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({viewport:{width:800,height:600}});
    await page.addInitScript(() => localStorage.setItem('saltline.developer-mode.v1', 'enabled'));
    const stages=[];
    page.on('console', message => { if (message.text().startsWith('[boottrace]')) stages.push(message.text()); });
    page.on('pageerror', error => { if (!error.stack?.includes('.user.js')) stages.push('ERROR: '+error.message); });
    if (mode === 'baseline') await page.route('**/src/content/episode-moods.js', route => route.fulfill({status:200,contentType:'application/javascript',body:'export const EPISODE_MOODS = {};'}));
    await page.route('**/src/app/bootstrap.js', async route => {
      const response = await route.fetch();
      const source = await response.text();
      await route.fulfill({ response, body: source.replace('async function setBootProgress(i, e) {', "async function setBootProgress(i, e) { console.log('[boottrace]', i);") });
    });
    const start=Date.now();
    const episode = process.env.EPISODE || 'm01';
    await page.goto(`${base}?story=${episode}&q=test&noaudio=1${process.env.VISUAL_QUERY || ''}`,{waitUntil:'domcontentloaded'});
    const result = await Promise.race([
      page.waitForFunction(() => window.__ready || window.__fatal, null, {timeout:45000}).then(()=> 'ready').catch(error => `wait: ${error.message.slice(0,120)}`),
      new Promise(resolve => setTimeout(()=>resolve('timeout'),45000))
    ]);
    console.log(`${mode}: ${result}, ${(Date.now()-start)/1000}s, last=${stages.at(-1) || 'none'}`);
    if(result==='ready') {
      const actual = await page.evaluate(() => {
        const game = window.__G, sky = game.render.sky.material.uniforms;
        game.renderer.setAnimationLoop(null);
        return { story:game.story.id, fatal:window.__fatal, frames:window.__frames, pending:game.mats.stats().pendingSets, mood:game.visualMood, sun:game.render.sun.color.toArray(),
          zenith:sky.uZen.value.toArray(), horizon:sky.uHor.value.toArray(), exposure:game.render.exposure, saturation:game.render.post.saturation, errors:window.__errors };
      });
      console.log(`${mode} state: ${JSON.stringify(actual)}`);
      if(actual.fatal || actual.errors.length || actual.story !== episode) throw new Error(`${mode} runtime error or wrong episode`);
      await page.waitForTimeout(900);
      await page.evaluate(() => { const game=window.__G; game.game.update(3); game.render.post.fade=0; game.render.frame(.016); });
      await page.screenshot({path:`test-results/mood-${episode}-${mode}-title.png`,timeout:20000});
      await page.evaluate(() => {
        const game=window.__G;game.game.start({skipIntro:true});
        for (let i=0;i<3;i++) { game.input.update(.016);game.player.update(.016);game.weapon.update(.016);game.hud.update(.016);game.render.frame(.016);game.input.endFrame(); }
      });
      await page.waitForTimeout(900);
      await page.screenshot({path:`test-results/mood-${episode}-${mode}-play.png`,timeout:20000});
    }
  } finally { await browser.close(); }
}
