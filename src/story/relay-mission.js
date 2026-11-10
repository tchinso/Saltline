import { createCinematic } from './cinematic.js';
import { createEncounters } from './encounters.js';
import { createMenus } from '../ui/menus.js';
import { Vector3 } from '../../vendor/three.js';
import { clamp, damp, saturate, smoothstep } from '../core/math.js';
function createRelayMission(game) {
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
        keepRetries: true
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
  let getObjectives = () => level && level.objectives || [];
  let mission = {
    state: "title",
    flow: MISSION_TUNING,
    run: run,
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
      let P = run.relays.find(V => !V.cut);
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
    run.relays = getObjectives().map((P, V) => {
      let Y = (/([a-z0-9])$/i.exec(String(P.id || "")) || [0, String.fromCharCode(65 + V)])[1].toUpperCase();
      setRelayVisual(P, "live");
      return {
        o: P,
        id: P.id || "relay_" + V,
        short: Y,
        t: 0,
        cut: false,
        cutting: false
      };
    });
    player.reset(level.playerStart);
    hud.reset && hud.reset();
    post.saturation = baseSaturation;
    post.flash = 0;
    updateMarkers();
    hud.setRelays && hud.setRelays(0, run.relays.length);
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
  function updateMarkers() {
    if (!hud.setMarkers) return;
    let P = run.relays.filter(V => !V.cut).map(V => ({
      id: V.id,
      short: V.short,
      label: V.o.label || "중계기 " + V.short,
      pos: V.o.pos,
      kind: "relay"
    }));
    run.allCut && level.extraction && P.push({
      id: "extract",
      short: "탈출",
      label: "보트",
      pos: level.extraction.pos,
      kind: "extract"
    });
    hud.setMarkers(P);
  }
  function startRun({
    skipIntro: P = false,
    quick: V = false,
    keepRetries: Y = false
  } = {}) {
    if (Y || (run.retries = 0), menus.show("none"), menus.locationCard(false), callOptional(game.audio, "setPaused", false), resetRun(), callOptional(game.weapon, "setVisible", true), hadPointerLock = false, P) {
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
    return game.story.objectiveText(run.relays.length - run.cut, run.relays.length);
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
      if (Y.cut) continue;
      let L = Y.o.pos.x - player.pos.x;
      let Z = Y.o.pos.z - player.pos.z;
      let J = Math.hypot(L, Z);
      J > V || Math.abs((Y.o.pos.y || 0) - player.pos.y) > 2.5 || J > .9 && (L * player.forward.x + Z * player.forward.z) / (J * Math.max(.2, Math.hypot(player.forward.x, player.forward.z))) < MISSION_TUNING.interactFacing || (P = Y, V = J);
    }
    return P;
  }
  function updateInteraction(P) {
    let V = player.alive ? nearestRelay() : null;
    for (let L of run.relays) L.cut || (L === V && input.down("interact") ? (L.cutting || (L.cutting = true, setRelayVisual(L.o, "cutting")), L.t += P / MISSION_TUNING.cutSeconds, game.events.emit("objective:progress", {
      id: L.id,
      t: Math.min(1, L.t)
    }), L.t >= 1 && completeRelay(L)) : L.t > 0 && (L.t = Math.max(0, L.t - P * 1.6), L.cutting && (L.cutting = false, setRelayVisual(L.o, "live"), game.events.emit("objective:progress", {
      id: L.id,
      t: 0
    }))));
    V && !V.cut ? hud.setPrompt && hud.setPrompt("중계기 " + V.short + " 차단", saturate(V.t)) : hud.setPrompt && hud.setPrompt(null);
    let Y = level.extraction;
    if (Y && Y.pos) {
      let L = Math.hypot(Y.pos.x - player.pos.x, Y.pos.z - player.pos.z);
      let Z = L < (Y.radius || 2.5) && Math.abs(Y.pos.y - player.pos.y) < 3.5;
      Z && run.allCut && player.alive ? completeMission() : Z && !run.allCut && run.extractHint <= 0 && (run.extractHint = 8, hud.message("중계기가 아직 가동 중이다 — 보트가 포화 속에서 기다릴 수 없다", 3.5));
      run.extractHint = Math.max(0, run.extractHint - P);
    }
  }
  function completeRelay(P) {
    P.cut = true;
    P.cutting = false;
    P.t = 1;
    run.cut++;
    setRelayVisual(P.o, "cut");
    let V = run.relays.length;
    game.events.emit("objective:done", {
      id: P.id,
      index: run.cut,
      total: V
    });
    hud.setRelays && hud.setRelays(run.cut, V);
    hud.setPrompt && hud.setPrompt(null);
    player.addShake(.18);
    queueWave(run.cut - 1);
    run.cut >= V ? (run.allCut = true, run.pursuitLeft = MISSION_TUNING.pursuitExtra, run.pursuitT = 12, game.events.emit("objective:all", {}), hud.radio && hud.radio(DIALOGUE.all, 4.5)) : hud.radio && hud.radio(DIALOGUE.cut[Math.min(run.cut - 1, DIALOGUE.cut.length - 1)], 3.6);
    hud.setObjective(objectiveText());
    updateMarkers();
  }
  game.events.on("player:dead", () => {
    mission.state !== "playing" && mission.state !== "paused" || (input.setGameplay && input.setGameplay(false), input.exitLock(), hud.setPrompt && hud.setPrompt(null), hud.show(false), hud.clearRadio && hud.clearRadio(), menus.setDead({
      time: run.time,
      relays: run.cut,
      total: run.relays.length
    }), transitionTo("dead"));
  });
  function completeMission() {
    player.invulnerable = true;
    player.enabled = false;
    input.setGameplay && input.setGameplay(false);
    input.exitLock();
    hud.setPrompt && hud.setPrompt(null);
    hud.show(false);
    game.events.emit("extraction:reached", {});
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
export { createRelayMission };
