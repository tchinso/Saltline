import { createCinematic } from './cinematic.js';
import { createEncounters } from './encounters.js';
import { createMenus } from '../ui/menus.js';
import { recordMissionComplete } from './campaign-progress.js';
import { createEscort } from './escort.js';
import { captureAct1Checkpoint, restoreAct1Checkpoint } from './act1-checkpoint.js';
import { Vector3 } from '../../vendor/three.js';
import { clamp, damp, saturate, smoothstep } from '../core/math.js';
function createAct1Mission(game) {
  const {
    tuning: MISSION_TUNING,
    dialogue: DIALOGUE
  } = game.story;
  let post = game.render && game.render.post || {};
  let baseSaturation = typeof post.saturation == "number" ? post.saturation : 1;
  let player = game.player;
  let level = game.level;
  let hud = game.hud;
  let input = game.input;
  let callOptional = (P, V, ...Y) => {
    try {
      if (P && typeof P[V] == "function") return P[V](...Y);
    } catch (L) {
      console.error(`[game] ${V} threw`, L);
    }
  };
  let menus = createMenus(game, {
    deploy() {
      callOptional(game.audio, "resume");
      input.requestLock();
      startRun({});
    },
    resume() {
      resume(true);
    },
    restart() {
      callOptional(game.audio, "resume");
      input.requestLock();
      run.retries++;
      startRun({
        quick: true,
        keepRetries: true
      });
    },
    retry() {
      callOptional(game.audio, "resume");
      input.requestLock();
      run.retries++;
      startRun({
        quick: true,
        keepRetries: true,
        restoreCheckpoint: true
      });
    },
    redeploy() {
      callOptional(game.audio, "resume");
      input.requestLock();
      startRun({
        quick: true
      });
    }
  });
  menus.applySettings();
  const progressLabel = hud.root?.querySelector('.h-relays span');
  if (progressLabel) progressLabel.textContent = '목표';
  const debriefHeading = menus.root.querySelector('[data-s="complete"] .m-h');
  if (debriefHeading) debriefHeading.textContent = '작전 완료';
  const choiceResults = document.createElement('dl');
  choiceResults.className = 'm-stats';
  choiceResults.setAttribute('aria-label', '선택 목표 결과');
  const actions = menus.root.querySelector('[data-s="complete"] .m-actions');
  actions?.before(choiceResults);
  const deadLabel = menus.root.querySelector('[data-f="dead-relays"]')?.previousElementSibling;
  if (deadLabel) deadLabel.textContent = '완료한 목표';
  const definitions = game.story.objectives;
  if (!Array.isArray(definitions) || !definitions.some(o => !o.optional)) throw new Error('Campaign mission requires objectives');
  for (const definition of definitions) {
    if (!level.objectives.some(o => o.id === definition.id)) throw new Error('Missing objective ' + definition.id);
  }
  const mainDefinitions = definitions.filter(o => !o.optional);
  const escortLabels = { m02: '대피 차량', m03: '피난민 차량', m05: '환자 수송차', m06: '대피 수송대' };
  const escort = escortLabels[game.story.id] ? createEscort(game,
    level.objectives.find(o => o.id === 'stage_3').pos,
    level.objectives.find(o => o.id === 'stage_4').pos, escortLabels[game.story.id]) : null;
  let run = {
    time: 0,
    retries: 0,
    relays: [],
    cut: 0,
    allCut: false,
    queue: [],
    waveHot: 0,
    alertT: 0,
    pursuitT: 0,
    pursuitLeft: 0,
    contactSaid: false,
    lowSaid: false,
    extractHint: 0,
    intensity: .15,
    used: new Map()
  };
  let stateTime = 0;
  let introDuration = MISSION_TUNING.introSeconds;
  let locationShown = false;
  let introSpoken = false;
  let pauseCooldown = 0;
  let hadPointerLock = false;
  let lastInputMode = "";
  let inputHintTimer = .8;
  let checkpoint = null;
  let getObjectives = () => level && level.objectives || [];
  let mission = {
    state: "title",
    flow: MISSION_TUNING,
    run: run,
    escort,
    menus: menus,
    start(P = {}) {
      startRun({
        skipIntro: !!P.skipIntro,
        quick: !!P.quick
      });
    },
    pause() {
      pause();
    },
    resume() {
      resume(false);
    },
    update: update,
    debugCut() {
      let P = run.relays.find(V => !V.cut && !V.def.optional);
      P && completeRelay(P);
    }
  };
  const {
    initCinematic,
    updateTitle
  } = createCinematic(game, level, post, MISSION_TUNING);
  const {
    spawnPatrol,
    queueWave,
    updateWaves,
    aliveCount,
    hasNearbyEnemy
  } = createEncounters(game, level, player, hud, run, MISSION_TUNING);
  function transitionTo(P) {
    let V = mission.state;
    P !== V && (mission.state = P, stateTime = 0, game.events.emit("game:state", {
      state: P,
      prev: V
    }));
  }
  function resetRun() {
    callOptional(game.enemies, "clear");
    callOptional(game.fx, "clear");
    callOptional(game.combat, "reset");
    callOptional(game.weapon, "reset");
    run.time = 0;
    run.cut = 0;
    run.allCut = false;
    run.queue.length = 0;
    run.waveHot = 0;
    run.alertT = 0;
    run.pursuitT = 0;
    run.pursuitLeft = 0;
    run.contactSaid = false;
    run.lowSaid = false;
    run.extractHint = 0;
    run.used.clear();
    run.relays = definitions.map(def => {
      const objective = getObjectives().find(o => o.id === def.id);
      setRelayVisual(objective, "live");
      return { o: objective, def, id: def.id, short: def.optional ? "선택" : String(mainDefinitions.indexOf(def) + 1), t: 0, cut: false, cutting: false };
    });
    run.clearing = false;
    escort?.reset();
    player.reset(level.playerStart);
    hud.reset && hud.reset();
    post.saturation = baseSaturation;
    post.flash = 0;
    updateMarkers();
    hud.setRelays && hud.setRelays(0, mainDefinitions.length);
    spawnPatrol();
  }
  function setRelayVisual(P, V) {
    try {
      let Y = P && P.object && P.object.userData;
      Y && typeof Y.setState == "function" && Y.setState(V);
    } catch (Y) {
      console.error("[game] relay setState threw", Y);
    }
  }
  function activeObjective(item) {
    return !item.cut && (item.def.optional || !run.clearing && mainDefinitions[run.cut] === item.def);
  }
  function updateMarkers() {
    if (!hud.setMarkers) return;
    const markers = run.relays.filter(activeObjective).map(item => ({
      id: item.id, short: item.short, label: item.def.label,
      pos: item.o.pos, kind: "relay"
    }));
    if (escort?.active) markers.push({
      id: 'escort', short: '호위', label: escortLabels[game.story.id], pos: escort.root.position, kind: 'extract'
    });
    if (run.allCut && !run.clearing && level.extraction) markers.push({
      id: "extract", short: "탈출", label: "합류 지점", pos: level.extraction.pos, kind: "extract"
    });
    hud.setMarkers(markers);
  }
  function startRun({
    skipIntro: P = false,
    quick: V = false,
    keepRetries: Y = false,
    restoreCheckpoint: restore = false
  } = {}) {
    Y || (run.retries = 0);
    menus.show("none");
    menus.locationCard(false);
    callOptional(game.audio, "setPaused", false);
    resetRun();
    if (restore && checkpoint) {
      restoreAct1Checkpoint(game, run, checkpoint);
      if (escort && run.cut >= 3) escort.restoreFinished();
      updateMarkers();
      hud.setRelays && hud.setRelays(run.cut, mainDefinitions.length);
    } else {
      checkpoint = captureAct1Checkpoint(game, run);
    }
    callOptional(game.weapon, "setVisible", true);
    hadPointerLock = false;
    if (P || restore) {
      post.fade = 0;
      beginPlaying();
      return;
    }
    introDuration = V ? MISSION_TUNING.retryIntroSeconds : MISSION_TUNING.introSeconds;
    locationShown = V;
    introSpoken = V;
    player.enabled = false;
    input.setGameplay && input.setGameplay(false);
    hud.show(false);
    post.fade = 1;
    callOptional(game.audio, "setIntensity", .15);
    transitionTo("intro");
  }
  function beginPlaying() {
    player.enabled = true;
    hud.show(true);
    input.setGameplay && input.setGameplay(true);
    hud.setObjective(objectiveText());
    transitionTo("playing");
    updateInputHint(true);
  }
  function objectiveText() {
    return run.clearing ? (escort?.active ? "수송대를 호위하고 접근하는 적을 제압하라" : "접근하는 적을 제압하라") : run.allCut ? (game.story.extractionText || "합류 지점으로 이동하라") : mainDefinitions[run.cut].label;
  }
  function updateInputHint(P) {
    let V = input.describeMode ? input.describeMode() : "";
    menus.setLookMode(V);
    !(!P && V === lastInputMode) && (lastInputMode = V, mission.state === "playing" && (input.mode === "drag" || input.mode === "lock" && !input.locked && !game.params.shot && !game.params.autostart) ? hud.message(V, input.mode === "drag" ? 7 : 4) : mission.state === "playing" && input.locked && hud.message("", 0));
  }
  input.onModeChange && input.onModeChange(() => updateInputHint(false));
  game.events.on("input:lock", P => {
    if (P.locked) {
      hadPointerLock = true;
      updateInputHint(false);
      return;
    }
    mission.state === "playing" && hadPointerLock && pause();
    hadPointerLock = false;
  });
  document.addEventListener("visibilitychange", () => {
    document.hidden && mission.state === "playing" && pause();
  });
  addEventListener("keydown", P => {
    mission.state !== "title" || menus.panelOpen || P.code !== "Enter" && P.code !== "NumpadEnter" || P.target && P.target.tagName === "BUTTON" || (callOptional(game.audio, "resume"), input.requestLock(), startRun({}));
  });
  function pause() {
    mission.state === "playing" && (input.setGameplay && input.setGameplay(false), input.exitLock(), callOptional(game.audio, "setPaused", true), menus.setLookMode(input.mode === "drag" ? input.describeMode() : input.touch ? "" : "계속하기를 누르면 마우스를 다시 캡처함."), hud.show(false), menus.show("paused"), pauseCooldown = .35, transitionTo("paused"));
  }
  function resume(P) {
    mission.state === "paused" && (menus.show("none"), callOptional(game.audio, "setPaused", false), hud.show(true), input.setGameplay && input.setGameplay(true), hadPointerLock = false, input.requestLock(), transitionTo("playing"), setTimeout(() => updateInputHint(true), 700));
  }
  game.events.on("enemy:alert", () => {
    run.alertT = 10;
    mission.state === "playing" && !run.contactSaid && (run.contactSaid = true, hud.radio && hud.radio(DIALOGUE.contact, 3.2));
  });
  game.events.on("player:hit", () => {
    run.alertT = Math.max(run.alertT, 8);
  });
  game.events.on("player:rescued", () => {
    mission.state === "playing" && hud.message("물에서 구조됨", 2.5);
  });
  function nearestRelay() {
    let P = null;
    let V = MISSION_TUNING.interactRange;
    for (let Y of run.relays) {
      if (!activeObjective(Y)) continue;
      let L = Y.o.pos.x - player.pos.x;
      let Z = Y.o.pos.z - player.pos.z;
      let J = Math.hypot(L, Z);
      J > V || Math.abs((Y.o.pos.y || 0) - player.pos.y) > 2.5 || J > .9 && (L * player.forward.x + Z * player.forward.z) / (J * Math.max(.2, Math.hypot(player.forward.x, player.forward.z))) < MISSION_TUNING.interactFacing || (P = Y, V = J);
    }
    return P;
  }
  function updateInteraction(P) {
    let V = player.alive ? nearestRelay() : null;
    for (let L of run.relays) !activeObjective(L) || (L === V && input.down("interact") ? (L.cutting || (L.cutting = true, setRelayVisual(L.o, "cutting")), L.t += P / (L.def.duration || MISSION_TUNING.cutSeconds), game.events.emit("objective:progress", {
      id: L.id,
      t: Math.min(1, L.t)
    }), L.t >= 1 && completeRelay(L)) : L.t > 0 && (L.t = Math.max(0, L.t - P * 1.6), L.cutting && (L.cutting = false, setRelayVisual(L.o, "live"), game.events.emit("objective:progress", {
      id: L.id,
      t: 0
    }))));
    V && !V.cut ? hud.setPrompt && hud.setPrompt(V.def.prompt || V.def.label, saturate(V.t)) : hud.setPrompt && hud.setPrompt(null);
    let Y = level.extraction;
    if (Y && Y.pos) {
      let L = Math.hypot(Y.pos.x - player.pos.x, Y.pos.z - player.pos.z);
      let Z = L < (Y.radius || 2.5) && Math.abs(Y.pos.y - player.pos.y) < 3.5;
      Z && run.allCut && !run.clearing && player.alive ? completeMission() : Z && !run.allCut && run.extractHint <= 0 && (run.extractHint = 8, hud.message("먼저 현재 임무를 완료하라", 3.5));
      run.extractHint = Math.max(0, run.extractHint - P);
    }
  }
  function completeRelay(item) {
    if (item.cut || !activeObjective(item)) return;
    if (!item.def.optional) checkpoint = captureAct1Checkpoint(game, run);
    item.cut = true;
    item.cutting = false;
    item.t = 1;
    setRelayVisual(item.o, "cut");
    if (!item.def.optional) run.cut++;
    game.events.emit("objective:done", { id: item.id, index: run.cut, total: mainDefinitions.length, optional: !!item.def.optional });
    hud.setRelays && hud.setRelays(run.cut, mainDefinitions.length);
    hud.setPrompt && hud.setPrompt(null);
    player.addShake(.1);
    if (game.story.id === 'm06' && item.id === 'stage_2') {
      game.weapon.addAmmo(60);
      hud.message('보급 확보 — 예비탄 60발', 5);
    }
    if (Number.isInteger(item.def.wave)) {
      queueWave(item.def.wave);
      run.clearing = true;
    }
    if (escort && item.id === 'stage_3') {
      escort.start();
      run.clearing = true;
      hud.message('수송대를 호위하라 — 적이 접근하면 피해를 입는다', 5);
    }
    if (game.story.breaker?.objectiveId === item.id) {
      const boss = game.enemies.spawn('breaker', new Vector3(...game.story.breaker.position), { state: 'alert', target: player.pos });
      if (!boss) throw new Error('Failed to spawn breaker');
      run.clearing = true;
    }
    if (!item.def.optional && run.cut >= mainDefinitions.length) {
      run.allCut = true;
      run.pursuitLeft = MISSION_TUNING.pursuitExtra;
      run.pursuitT = 12;
      game.events.emit("objective:all", {});
    }
    if (item.def.dialogue && hud.radio) hud.radio(item.def.dialogue, 4);
    hud.setObjective(objectiveText());
    updateMarkers();
  }
  function failMission(reason) {
    mission.state !== "playing" && mission.state !== "paused" || (input.setGameplay && input.setGameplay(false), input.exitLock(), hud.setPrompt && hud.setPrompt(null), hud.show(false), hud.clearRadio && hud.clearRadio(), menus.setDead({
      time: run.time,
      relays: run.cut,
      total: mainDefinitions.length
    }), transitionTo("dead"));
    const heading = menus.root.querySelector('[data-s="dead"] .m-h');
    const subtitle = menus.root.querySelector('[data-s="dead"] .m-k');
    if (heading) heading.textContent = reason ? '호위 실패' : '신호 끊김';
    if (subtitle) subtitle.textContent = reason || '돌입 대원 전투 불능';
  }
  game.events.on("player:dead", () => failMission());
  function completeMission() {
    player.invulnerable = true;
    player.enabled = false;
    input.setGameplay && input.setGameplay(false);
    input.exitLock();
    hud.setPrompt && hud.setPrompt(null);
    hud.show(false);
    game.events.emit("extraction:reached", {});
    recordMissionComplete(game.story.id, run.relays.filter(item => item.def.optional && item.cut && item.def.flag).map(item => item.def.flag));
    choiceResults.replaceChildren(...run.relays.filter(item => item.def.optional).map(item => {
      const row = document.createElement('div');
      const label = document.createElement('dt');
      const result = document.createElement('dd');
      label.textContent = item.def.label;
      result.textContent = item.cut ? '완료' : '미완료';
      row.append(label, result);
      return row;
    }));
    hud.clearRadio && hud.clearRadio();
    hud.radio && hud.radio(DIALOGUE.done, 2.2);
    let P = game.combat && game.combat.stats || {
      shots: 0,
      hits: 0,
      kills: 0
    };
    let V = P.shots > 0 ? clamp(P.hits / P.shots, 0, 1) : null;
    let Y = (run.time < 270 ? 2 : run.time < 400 ? 1 : 0) + (V >= .5 ? 2 : V >= .3 ? 1 : 0) + (run.retries === 0 ? 1 : 0);
    let L = ["엉망", "소란", "안정적", "깔끔", "정확", "완벽"][Y];
    menus.setDebrief({
      time: run.time,
      accuracy: V,
      kills: P.kills || 0,
      retries: run.retries,
      rating: L
    });
    transitionTo("complete");
  }
  function update(P) {
    switch (stateTime += P, mission.state) {
      case "title":
        updateTitle(P);
        return false;
      case "intro":
        post.fade = 1 - smoothstep(.25, Math.min(introDuration, 2.6), stateTime);
        !locationShown && stateTime > .5 && (locationShown = true, menus.locationCard(true));
        !introSpoken && stateTime > 1.3 && (introSpoken = true, hud.radio && hud.radio(DIALOGUE.intro, 4.2));
        stateTime > introDuration - .6 && !hud.root?.classList.contains("on") && (hud.show(true), hud.setObjective(objectiveText()));
        stateTime >= introDuration && (menus.locationCard(false), post.fade = 0, beginPlaying());
        return true;
      case "playing":
        {
          if (run.time += P, post.fade = damp(post.fade || 0, 0, 6, P), pauseCooldown > 0 && (pauseCooldown -= P), input.pressed("pause")) {
            pause();
            return false;
          }
          if (updateInteraction(P), mission.state !== "playing") return true;
          updateWaves(P);
          if (escort?.active) {
            escort.update(P);
            if (escort.failed) {
              failMission('수송대가 파괴됐다');
              return true;
            }
            if (escort.finished) hud.radio && hud.radio('수송대가 지정 지점에 도착했다.', 3);
          }
          if (run.clearing && !escort?.active && !run.queue.length && aliveCount() === 0) {
            run.clearing = false;
            hud.setObjective(objectiveText());
            updateMarkers();
          }
          run.alertT = Math.max(0, run.alertT - P);
          run.waveHot = Math.max(0, run.waveHot - P);
          let V = aliveCount();
          run.waveHot > 0 && V === 0 && !run.queue.length && run.waveHot < 24 && (run.waveHot = 0);
          let Y = run.allCut || run.queue.length || run.waveHot > 0 && V > 0 ? 1 : run.alertT > 0 || V > 0 && hasNearbyEnemy(26) ? .6 : .15;
          Y !== run.intensity && (run.intensity = Y, callOptional(game.audio, "setIntensity", Y));
          input.mode === "lock" && !input.locked && !input.touch && !game.params.shot && !game.params.autostart ? (inputHintTimer -= P, inputHintTimer <= 0 && (inputHintTimer = 2, hud.message(input.describeMode(), 2.6))) : inputHintTimer = .8;
          !run.lowSaid && player.alive && player.health < 30 && (run.lowSaid = true, hud.radio && hud.radio(DIALOGUE.low, 3));
          return true;
        }
      case "paused":
        pauseCooldown > 0 ? pauseCooldown -= P : input.pressed("pause") && (menus.closePanel() || resume(false));
        return false;
      case "dead":
        post.saturation = damp(post.saturation ?? 1, .12, 2.2, P);
        post.fade = damp(post.fade || 0, .55, 1.4, P);
        stateTime > 1.5 && menus.screen !== "dead" && (menus.show("dead"), callOptional(game.audio, "setIntensity", .15));
        return true;
      case "complete":
        post.fade = damp(post.fade || 0, .72, .9, P);
        post.saturation = damp(post.saturation ?? 1, baseSaturation * .7, 1, P);
        stateTime > 3.3 && menus.screen !== "complete" && (menus.show("complete"), callOptional(game.audio, "setIntensity", .15));
        return true;
    }
    return false;
  }
  initCinematic();
  player.enabled = false;
  hud.show(false);
  callOptional(game.weapon, "setVisible", false);
  input.setGameplay && input.setGameplay(false);
  callOptional(game.audio, "setIntensity", .15);
  game.params.shot || game.params.autostart || menus.show("title");
  return mission;
}
export { createAct1Mission };
