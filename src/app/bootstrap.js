import { startGameLoop } from './loop.js';
import { createBenchmark } from './benchmark.js';
import { createShowcaseInput, createShowcasePlayer } from './showcase-stubs.js';
import { showcases } from './showcases.js';
import { content } from '../content/index.js';
import { EPISODE_MOODS } from '../content/episode-moods.js';
import { browserCampaignStorage, campaignAccess } from '../story/campaign-access.js';
import { createMaterials } from '../render/materials.js';
import { createEffects } from '../effects/effects.js';
import { createProps } from '../world/props/registry.js';
import { createRenderer } from '../render/renderer.js';
import { PlaneGeometry, THREE, Vector3 } from '../../vendor/three.js';
import { createEventBus } from '../core/events.js';
import { createRandom } from '../core/random.js';
import { selectQuality } from '../core/config.js';
import { fallbacks } from '../core/fallbacks.js';
import { createPhysics } from '../world/physics.js';
import { createInput } from '../player/input.js';
import { createMesh } from '../geometry/primitives.js';
import { createCombat } from '../combat/combat.js';
import { createAudio } from '../audio/audio.js';
import { createPlayer } from '../player/player.js';
import { createMedkits } from '../player/medkits.js';
import { createAmmoBags } from '../player/ammo-bags.js';
import { createWeapon } from '../weapon/weapon.js';
import { createEnemies } from '../enemies/enemies.js';
import { createHud } from '../ui/hud.js';
import '../world/props/industrial.js';
import '../world/props/register.js';
window.__frames = 0;
window.__ready = false;
window.__fatal = null;
window.__errors = [];
var bootElement = document.getElementById("boot");
var bootMessage = document.getElementById("boot-msg");
var bootFill = document.getElementById("boot-fill");
function showFatalError(i) {
  window.__fatal = String(i);
  console.error("[fatal] " + i);
  let e = document.getElementById("fatal");
  e || (e = document.createElement("div"), e.id = "fatal", document.getElementById("app").appendChild(e));
  e.textContent = "렐노르를 시작할 수 없음. 브라우저에서 WebGL과 하드웨어 가속이 켜져 있는지 확인해 줘.";
}
window.addEventListener("error", i => {
  window.__errors.push(String(i.message));
});
{
  let i = console.error.bind(console);
  console.error = (...e) => {
    try {
      window.__errors.push(e.map(t => t && t.stack || String(t)).join(" ").slice(0, 400));
    } catch {}
    i(...e);
  };
}
var yieldToBrowser = () => new Promise(i => setTimeout(i, 0));
async function setBootProgress(i, e) {
  bootMessage && (bootMessage.textContent = i);
  bootFill && (bootFill.style.width = Math.round(e * 100) + "%");
  await yieldToBrowser();
}
async function boot() {
  let params = Object.fromEntries(new URLSearchParams(location.search));
  const access = campaignAccess(params, content.listStories(), browserCampaignStorage());
  params = access.params;
  if (access.changed) {
    // Update the address without a second expensive page load.
    const url = new URL(location.href);
    if (params.story) url.searchParams.set('story', params.story);
    if (!params.map) url.searchParams.delete('map');
    try { history.replaceState(history.state, '', url); } catch { /* The selected content is still restricted. */ }
  }
  let benchmarkMode = !!params.bench || location.hash === "#bench";
  benchmarkMode && (params.noaudio = "1", params.autostart = "1");
  let game = {
    THREE: THREE,
    params: params,
    events: createEventBus(),
    rng: createRandom(+(params.seed || 4207)),
    time: {
      t: 0,
      dt: 0,
      frame: 0,
      real: 0
    },
    quality: selectQuality(params.q || (params.shot ? "test" : ""))
  };
  const selected = content.resolve(params);
  game.map = selected.map;
  game.story = selected.story;
  game.mood = !params.show && !params.shot && !benchmarkMode ? EPISODE_MOODS[selected.story.id] || null : null;
  game.world = selected.map.world;
  window.__G = game;
  let showcase = params.show && showcases[params.show] ? params.show : null;
  game.showcase = showcase;
  let shot = null;
  function setShot(h) {
    if (h.cam) {
      let f = String(h.cam).split(",").map(Number);
      shot = {
        pos: new Vector3(f[0], f[1], f[2]),
        look: new Vector3(f[3] ?? 0, f[4] ?? 1, f[5] ?? 0)
      };
    }
    h.cam === "" && (shot = null);
    h.fov && (game.camera.fov = +h.fov, game.camera.updateProjectionMatrix());
    h.exposure && (game.render.exposure = +h.exposure);
  }
  window.__setShot = setShot;
  async function loadSystem(h, f, p, d = false) {
    let v = performance.now();
    try {
      game[h] = await p();
    } catch (x) {
      console.error(`[boot] module "${h}" failed: ${x && x.stack || x}`);
      if (d || !fallbacks[h]) throw x;
      game[h] = fallbacks[h]();
    }
    let g = performance.now() - v;
    g > 150 && console.log(`[boot] ${h} ${g.toFixed(0)}ms`);
  }
  await setBootProgress("렌더러 준비 중", .04);
  await loadSystem("render", "render", () => createRenderer(game), true);
  game.renderer = game.render.renderer;
  game.scene = game.render.scene;
  game.camera = game.render.camera;
  game.viewCamera = game.render.viewCamera;
  await setBootProgress("페인트와 녹, 빗물 준비 중", .12);
  await loadSystem("mats", "materials", () => createMaterials(game));
  game.physics = createPhysics(game);
  game.props = createProps(game);
  game.input = showcase ? createShowcaseInput() : createInput(game);
  if (showcase) {
    let h = createMesh(new PlaneGeometry(80, 80).rotateX(-Math.PI / 2), game.mats.get("concrete"), {
      cast: false
    });
    game.scene.add(h);
    game.level = {
      stub: true,
      playerStart: {
        pos: new Vector3(0, 0, 4),
        yaw: 0
      },
      objectives: [],
      enemySpawns: [],
      zones: [],
      interiorBoxes: [],
      cinematicPath: [],
      extraction: {
        pos: new Vector3(),
        radius: 2
      },
      groundSurfaceAt: () => "concrete",
      update() {}
    };
    game.backdrop = fallbacks.backdrop();
    game.ground = fallbacks.ground();
    game.physics.build();
    if (showcase === "fx") await loadSystem("fx", "fx", () => createEffects(game));else try {
      game.fx = await createEffects(game);
    } catch {
      game.fx = fallbacks.fx();
    }
    game.audio = fallbacks.audio();
    game.hud = fallbacks.hud();
    game.player = createShowcasePlayer(game);
    game.combat = createCombat(game);
    game.weapon = fallbacks.weapon();
    game.enemies = fallbacks.enemies();
    game.game = {
      state: "showcase",
      update: () => false,
      start() {}
    };
    let f = null;
    try {
      f = await showcases[showcase].showcase(game);
    } catch (p) {
      showFatalError(`showcase "${showcase}" threw: ${p && p.stack || p}`);
    }
    game.showcaseInfo = f || {};
    f && f.cam && setShot({
      cam: [...f.cam, ...(f.target || [0, 1, 0])].join(",")
    });
  } else {
    await setBootProgress("컨테이너 배치 중", .34);
    await loadSystem("level", "level", () => game.map.createLevel(game), true);
    await setBootProgress("크레인 설치 중", .5);
    await loadSystem("backdrop", "backdrop", () => game.map.createBackdrop(game));
    await setBootProgress("항만 지면 준비 중", .58);
    await loadSystem("ground", "ground", () => game.map.createGround(game));
    if (game.ground.stub) {
      let h = createMesh(new PlaneGeometry(400, 400).rotateX(-Math.PI / 2), game.mats.get("asphalt"), {
        cast: false
      });
      game.scene.add(h);
    }
    game.physics.build();
    await setBootProgress("탄흔과 연기 준비 중", .66);
    await loadSystem("fx", "fx", () => createEffects(game));
    await loadSystem("audio", "audio", () => params.noaudio ? fallbacks.audio() : createAudio(game));
    game.player = createPlayer(game);
    game.medkits = createMedkits(game);
    game.combat = createCombat(game);
    await setBootProgress("소총 점검 중", .74);
    await loadSystem("weapon", "weapon", () => createWeapon(game));
    game.ammoBags = createAmmoBags(game);
    await setBootProgress("하버마스터 기동 중", .82);
    await loadSystem("enemies", "enemies", () => createEnemies(game));
    await loadSystem("hud", "hud", () => createHud(game));
    game.game = game.story.createMission(game);
    if (access.redirected) {
      const note = game.game.menus?.root?.querySelector('.m-note');
      if (note) note.textContent = '아직 열리지 않은 화입니다. 현재 접근할 수 있는 마지막 화로 이동했습니다.';
    }
  }
  await setBootProgress("첫 장면 준비 중", .92);
  try {
    await game.render.onLevelReady();
  } catch (h) {
    console.error("[boot] render.onLevelReady failed: " + (h && h.stack || h));
  }
  let averageFrameTime = 0;
  window.__stats = () => ({
    ...(game.render.stats ? game.render.stats() : {}),
    fps: averageFrameTime ? +(1 / averageFrameTime).toFixed(1) : 0,
    state: game.game && game.game.state
  });
  params.cam && setShot(params);
  params.fov && setShot({
    fov: params.fov
  });
  if (!showcase && (params.shot || params.autostart)) try {
    game.game.start({
      skipIntro: true
    });
  } catch (h) {
    console.error("[boot] game.start failed", h);
  }
  params.noweapon && game.weapon.setVisible && game.weapon.setVisible(false);
  benchmarkMode && createBenchmark(game);
  await setBootProgress("준비 완료", 1);
  bootElement.classList.add("done");
  setTimeout(() => {
    bootElement.hidden = true;
  }, 700);
  startGameLoop(game, {
    showcase,
    getShot: () => shot,
    onFrameTime: value => {
      averageFrameTime = value;
    }
  });
  // Let the first playable/title frame appear before generating optional
  // high-detail material textures in small idle-time batches.
  requestAnimationFrame(() => requestAnimationFrame(() => game.mats.startStreaming?.()));
}
export { boot };
export { showFatalError };
