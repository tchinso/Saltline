import { menuTemplate } from './menu-template.js';
import { QUALITY_NAMES, loadSettings, saveSettings } from './settings.js';
import { QUALITY_PRESETS } from '../core/config.js';
function createMenus(game, actions) {
  const presentation = game.story.presentation;
  let t = document.getElementById("ui");
  let n = loadSettings();
  let s = document.createElement("div");
  s.className = "menu";
  s.dataset.screen = "none";
  s.innerHTML = menuTemplate;
  s.querySelector('[data-story-title]').textContent = game.story.title;
  s.querySelectorAll('[data-story]').forEach(node => {
    node.textContent = presentation[node.dataset.story] || '';
  });
  t.appendChild(s);
  let o = U => s.querySelector(U);
  let r = U => [...s.querySelectorAll(U)];
  let a = o(".panel");
  let l = o(".loc-card");
  let c = U => s.querySelector(`[data-f="${U}"]`);
  let u = o("#s-sens");
  let h = o("#s-vol");
  let f = o("#s-fov");
  let p = "none";
  let d = null;
  function v(U) {
    if ((!U || U === "sens") && (game.input.sensitivity = n.sens), (!U || U === "invertY") && (game.input.invertY = n.invertY), !U || U === "volume") try {
      game.audio && game.audio.setVolume && game.audio.setVolume(n.volume);
    } catch (T) {
      console.error(T);
    }
    if ((!U || U === "fov") && game.player && game.player.setFov && game.player.setFov(n.fov), U === "quality" || !U && n.quality !== "auto" && !game.params.shot && !game.params.q && n.quality !== (game.quality && game.quality.name)) {
      let T = QUALITY_PRESETS[n.quality];
      if (T) try {
        game.render && game.render.setQuality ? game.render.setQuality({
          ...T
        }) : game.quality = {
          ...T
        };
      } catch (D) {
        console.error("[game] setQuality failed", D);
      }
    }
  }
  function g() {
    let U = n.quality === "auto" ? game.quality && game.quality.name : n.quality;
    for (let D of r(".seg button")) D.setAttribute("aria-pressed", String(D.dataset.q === U));
    u.value = n.sens;
    h.value = Math.round(n.volume * 100);
    f.value = n.fov;
    o('[data-o="sens"]').textContent = n.sens.toFixed(2) + "\xD7";
    o('[data-o="vol"]').textContent = Math.round(n.volume * 100) + "%";
    o('[data-o="fov"]').textContent = Math.round(n.fov) + "\xB0";
    let T = o('[data-act="invert"]');
    T.setAttribute("aria-pressed", String(n.invertY));
    T.querySelector("span").textContent = n.invertY ? "켜짐" : "꺼짐";
    c("qnote").textContent = n.quality === "auto" ? `기기에 맞춰 품질을 선택함 (${{
      low: "낮음",
      medium: "보통",
      high: "높음",
      ultra: "최고"
    }[U] || "기본값"}). 화면이 끊기면 품질을 낮춰라.` : "품질 변경은 즉시 적용되며, 그림자와 반사를 다시 만드는 데 잠시 걸릴 수 있음.";
  }
  u.addEventListener("input", () => {
    n.sens = +u.value;
    v("sens");
    g();
    saveSettings(n);
  });
  h.addEventListener("input", () => {
    n.volume = +h.value / 100;
    v("volume");
    g();
    saveSettings(n);
  });
  f.addEventListener("input", () => {
    n.fov = +f.value;
    v("fov");
    g();
    saveSettings(n);
  });
  let x = o('[data-row="fs"]');
  let y = o("#fs-t");
  let b = () => document.fullscreenElement || document.webkitFullscreenElement || null;
  let m = document.getElementById("app") || document.documentElement;
  m && (m.requestFullscreen || m.webkitRequestFullscreen) && document.fullscreenEnabled !== false && document.webkitFullscreenEnabled !== false || (x.hidden = true);
  function _() {
    y.textContent = "이 환경에서는 전체 화면을 사용할 수 없음";
  }
  function M() {
    try {
      if (b()) {
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        return;
      }
      let U = (m.requestFullscreen || m.webkitRequestFullscreen).call(m);
      U && U.catch && U.catch(_);
    } catch {
      _();
    }
  }
  let E = () => {
    y.textContent = b() ? "전체 화면 종료" : "전체 화면으로 전환";
  };
  document.addEventListener("fullscreenchange", E);
  document.addEventListener("webkitfullscreenchange", E);
  function w(U) {
    d = document.activeElement;
    a.hidden = false;
    s.classList.add("panel-open");
    z(U || "settings");
    try {
      a.focus({
        preventScroll: true
      });
    } catch {}
  }
  function S() {
    return a.hidden ? false : (a.hidden = true, s.classList.remove("panel-open"), d && d.focus && s.contains(d) ? d.focus() : H(), true);
  }
  function z(U) {
    for (let T of r(".tab")) T.setAttribute("aria-selected", String(T.dataset.tab === U));
    for (let T of r(".panel-b")) T.hidden = T.dataset.pane !== U;
  }
  function H() {
    let U = s.querySelector(`.m-screen[data-s="${p}"] .btn.primary`);
    if (U) try {
      U.focus({
        preventScroll: true
      });
    } catch {}
  }
  s.addEventListener("click", U => {
    let T = U.target.closest("button");
    if (!T || !s.contains(T)) return;
    if (game.events.emit("ui:click", {}), T.dataset.q) {
      n.quality = T.dataset.q;
      v("quality");
      g();
      saveSettings(n);
      return;
    }
    if (T.dataset.tab) {
      z(T.dataset.tab);
      return;
    }
    let D = T.dataset.act;
    D === "settings" ? w("settings") : D === "controls" ? w("controls") : D === "close-panel" ? S() : D === "invert" ? (n.invertY = !n.invertY, v("invertY"), g(), saveSettings(n)) : D === "fullscreen" ? M() : D && actions[D] && actions[D](U);
  });
  s.addEventListener("mouseover", U => {
    let T = U.target.closest("button");
    T && U.relatedTarget && !T.contains(U.relatedTarget) && game.events.emit("ui:hover", {});
  });
  s.addEventListener("keydown", U => {
    if (U.code === "Escape" && !a.hidden && (S(), U.stopPropagation(), U.preventDefault()), U.code === "Tab" && !a.hidden) {
      let T = [...a.querySelectorAll("button, input")].filter(G => G.offsetParent !== null);
      if (!T.length) return;
      let D = T[0];
      let C = T[T.length - 1];
      U.shiftKey && document.activeElement === D ? (C.focus(), U.preventDefault()) : !U.shiftKey && document.activeElement === C && (D.focus(), U.preventDefault());
    }
  });
  let O = U => (U = Math.max(0, Math.floor(U)), String(Math.floor(U / 60)).padStart(2, "0") + ":" + String(U % 60).padStart(2, "0"));
  let q = {
    root: s,
    settings: n,
    fmtTime: O,
    get screen() {
      return p;
    },
    get panelOpen() {
      return !a.hidden;
    },
    closePanel: S,
    show(U) {
      U !== p && (p = U, s.dataset.screen = U, S(), s.classList.toggle("open", U !== "none"), U !== "none" ? (g(), setTimeout(H, 30)) : document.activeElement && s.contains(document.activeElement) && document.activeElement.blur());
    },
    locationCard(U) {
      l.classList.toggle("on", !!U);
    },
    setLookMode(U) {
      c("lookmode").textContent = U || "";
    },
    setDead({
      time: U,
      relays: T,
      total: D
    }) {
      c("dead-time").textContent = O(U);
      c("dead-relays").textContent = `${T}/${D}`;
    },
    setDebrief({
      time: U,
      accuracy: T,
      kills: D,
      retries: C,
      rating: G
    }) {
      c("time").textContent = O(U);
      c("acc").textContent = T == null ? "\u2014" : Math.round(T * 100) + "%";
      c("kills").textContent = String(D);
      c("retries").textContent = String(C);
      c("rating").textContent = G;
    },
    applySettings: v
  };
  g();
  return q;
}
export { createMenus };
