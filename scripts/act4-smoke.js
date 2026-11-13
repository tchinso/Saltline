import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const browser = await chromium.launch({ headless:true, ...(process.env.BROWSER_PATH ? { executablePath:process.env.BROWSER_PATH } : {}), args:['--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage({ viewport:{ width:960, height:640 } });
  await page.addInitScript(() => {
    localStorage.setItem('saltline.developer-mode.v1','enabled');
    if (!localStorage.getItem('saltline.campaign.v1')) localStorage.setItem('saltline.campaign.v1',JSON.stringify({version:1,completed:[],flags:['flag_power_grid_data','flag_extra_supplies']}));
  });
  const failures=[];
  page.on('pageerror', error=>{ if (!error.stack?.includes('.user.js')) failures.push(error.message); });
  const episodes = process.env.EPISODE ? [Number(process.env.EPISODE)] : [22,23,24,25,26];
  for (const episode of episodes) {
    const id=`m${episode}`;
    await page.goto(`${process.env.GAME_URL || 'http://127.0.0.1:4173/'}?story=${id}&q=test&noaudio=1&autostart=1`);
    await page.waitForFunction(()=>window.__ready||window.__fatal,null,{timeout:180000});
    const result=await page.evaluate(()=>{
      const game=window.__G, mission=game.game, run=mission.run;
      game.renderer.setAnimationLoop(null);
      game.input.down=key=>key==='interact';
      const interact=id=>{game.player.pos.copy(game.level.objectives.find(o=>o.id===id).pos);mission.update(2.1);};
      const clear=()=>{ for(let i=0;run.clearing && i<100;i++){ game.enemies.clear(); if(mission.escort?.active) game.player.pos.copy(mission.escort.root.position); mission.update(1); }};
      const start={id:game.story.id,state:mission.state,patrol:game.enemies.aliveCount()};
      let noSupportRate=null,supportRate=null,escortSeen=false,titanSeen=false,holdSeen=false,bonus=null;
      if (game.story.id==='m22') {
        interact('stage_1'); clear(); interact('stage_2'); clear(); interact('stage_3');
        game.enemies.clear(); game.player.pos.copy(mission.escort.root.position); const previous=mission.escort.progress; mission.update(1);
        noSupportRate=mission.escort.progress-previous;
        mission.start({skipIntro:true});
      }
      interact('optional_1');
      const results=[];
      for(let i=1;i<=4;i++){
        const before=game.weapon.reserve;
        interact(`stage_${i}`);
        if(i===2 && ['m24','m25'].includes(game.story.id)) bonus=game.weapon.reserve-before;
        results.push(run.cut);
        if(mission.escort?.active){ escortSeen=true; if(game.story.id==='m22'){ game.enemies.clear();game.player.pos.copy(mission.escort.root.position);const previous=mission.escort.progress;mission.update(1);supportRate=mission.escort.progress-previous; }}
        if(run.holdRemaining>0) holdSeen=true;
        const titan=game.enemies.list.find(e=>e.alive && e.type==='titan');
        if(titan){titanSeen=true;titan.damage(99999,titan.pos,null,'weak');}
        if(run.holdRemaining>0) { for(let t=0;run.holdRemaining>0 && t<50;t++){game.enemies.clear();mission.update(1);} }
        clear();
      }
      const approved=game.story.id==='m26' && game.level.root.getObjectByName('reconstruction-scene')?.getObjectByName('reconstruction-debris')?.position.y;
      if(game.story.id==='m26') game.level.update(5);
      const afterApproval=game.story.id==='m26' && game.level.root.getObjectByName('reconstruction-scene')?.getObjectByName('reconstruction-debris')?.position.y;
      game.player.pos.copy(game.level.extraction.pos);mission.update(.1);
      return {start,results,noSupportRate,supportRate,escortSeen,titanSeen,holdSeen,bonus,approved,afterApproval, alternate:game.level.alternateRouteOpen, state:mission.state,
        title:mission.menus.root.querySelector('[data-s="complete"] .m-h').textContent,
        ending:mission.menus.root.querySelector('.campaign-ending')?.textContent,
        progress:JSON.parse(localStorage.getItem('saltline.campaign.v1')),errors:window.__errors};
    });
    assert.equal(result.start.id,id);assert.equal(result.start.state,'playing');assert.equal(result.start.patrol,3);
    assert.deepEqual(result.results,[1,2,3,4],id);
    assert.equal(result.state,'complete',id); assert.ok(result.progress.completed.includes(id));
    if(episode===22){ assert.equal(result.escortSeen,true); assert.ok(Math.abs(result.noSupportRate-.04)<1e-6); assert.ok(Math.abs(result.supportRate-.05)<1e-6); }
    if(episode===23){assert.equal(result.escortSeen,true);assert.ok(result.progress.flags.includes('flag_industrial_workers'));}
    if(episode===24){assert.equal(result.alternate,true);assert.equal(result.holdSeen,true);assert.equal(result.bonus,60);}
    if(episode===25){assert.equal(result.titanSeen,true);assert.equal(result.bonus,120);}
    if(episode===26){assert.equal(result.title,'캠페인 완료');assert.match(result.ending,/캠페인 완료/);assert.ok(result.afterApproval>result.approved);}
    assert.deepEqual(result.errors,[],id);
    console.log(`${id} passed: objectives, choices, combat, extraction, saved outcome`);
  }
  assert.deepEqual(failures,[]);
} finally { await browser.close(); }
