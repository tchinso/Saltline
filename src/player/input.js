var h_ = {
  KeyW: "forward",
  KeyS: "back",
  KeyA: "left",
  KeyD: "right",
  Space: "jump",
  ShiftLeft: "sprint",
  ShiftRight: "sprint",
  KeyC: "crouch",
  ControlLeft: "crouch",
  ControlRight: "crouch",
  KeyR: "reload",
  KeyE: "interact",
  KeyF: "melee",
  KeyV: "melee",
  Escape: "pause",
  KeyP: "pause",
  KeyQ: "alt",
  Enter: "fire",
  NumpadEnter: "fire",
  ArrowLeft: "turnL",
  ArrowRight: "turnR",
  ArrowUp: "turnU",
  ArrowDown: "turnD",
  KeyJ: "turnL",
  KeyL: "turnR",
  KeyI: "turnU",
  KeyK: "turnD"
};
var f_ = .0021;
var d_ = .0052;
var p_ = 2.1;
var m_ = 3;
var If = 58;
var g_ = {
  pause: 1
};
function createInput(game) {
  let e = game.renderer && game.renderer.domElement || document.getElementById("view");
  let t = document.getElementById("ui");
  let n = new Set();
  let s = new Set();
  let o = {
    key: new Set(),
    mouse: new Set(),
    touch: new Set(),
    pad: new Set()
  };
  let r = false;
  let a = false;
  let l = 0;
  let c = 0;
  let u = 0;
  let h = [];
  let f = {
    move: {
      x: 0,
      y: 0
    },
    look: {
      dx: 0,
      dy: 0
    },
    fire: false,
    ads: false,
    sprint: false,
    crouch: false,
    locked: false,
    touch: false,
    gamepad: false,
    sensitivity: 1,
    invertY: false,
    mode: "lock",
    down(P) {
      return n.has(P) && (r || g_[P] === 1);
    },
    pressed(P) {
      return s.has(P) && (r || g_[P] === 1);
    },
    update: ee,
    endFrame: B,
    requestLock: A,
    exitLock: _,
    setGameplay(P) {
      P = !!P;
      P !== r && (r = P, P || v(), M && M.root.classList.toggle("on", P && f.touch));
    },
    setPrompt(P) {
      M && M.btn.interact.classList.toggle("on", !!P);
    },
    onModeChange(P) {
      h.push(P);
    },
    describeMode() {
      return f.mode === "touch" ? "터치 조작 사용 중" : f.mode === "drag" ? "마우스 캡처를 사용할 수 없음 — 마우스를 움직여 시점을 조작하고 화면 가장자리에 두면 계속 회전함 · 클릭으로 사격 · 방향키 또는 IJKL로도 회전 가능" : f.locked ? "마우스 캡처 중 — Esc로 해제" : "화면을 클릭해 마우스 캡처";
    }
  };
  function p(P) {
    if (f.mode !== P) {
      f.mode = P;
      for (let V of h) try {
        V(P);
      } catch (Y) {
        console.error(Y);
      }
    }
  }
  function d(P, V, Y) {
    if (!V) return;
    let L = o[P];
    if (Y) {
      if (L.has(V)) return;
      L.add(V);
      n.has(V) || (n.add(V), s.add(V));
    } else {
      if (!L.delete(V)) return;
      !o.key.has(V) && !o.mouse.has(V) && !o.touch.has(V) && !o.pad.has(V) && n.delete(V);
    }
  }
  function v() {
    for (let P in o) o[P].clear();
    n.clear();
    u = 0;
    j = false;
    M && (M.btn.ads.classList.remove("active"), ie(), q = -1, D = -1);
  }
  addEventListener("keydown", P => {
    let V = h_[P.code];
    if (!V) return;
    let Y = P.target;
    Y && (Y.tagName === "INPUT" || Y.tagName === "SELECT" || Y.tagName === "TEXTAREA") || Y && Y.tagName === "BUTTON" && (P.code === "Space" || P.code === "Enter" || P.code === "NumpadEnter") || (r && (P.code === "Space" || P.code.startsWith("Arrow") || P.code === "ControlLeft") && P.preventDefault(), !P.repeat && d("key", V, true));
  });
  addEventListener("keyup", P => {
    d("key", h_[P.code], false);
  });
  addEventListener("blur", () => {
    v();
  });
  let g = P => P === 0 ? "fire" : P === 2 ? "ads" : P === 1 ? "melee" : null;
  e.addEventListener("mousedown", P => {
    if (!(f.touch && performance.now() - E < 800) && r) {
      if (!f.locked && f.mode === "lock") {
        A();
        P.preventDefault();
        return;
      }
      u |= 1 << P.button;
      d("mouse", g(P.button), true);
      P.preventDefault();
    }
  });
  addEventListener("mouseup", P => {
    u &= ~(1 << P.button);
    d("mouse", g(P.button), false);
  });
  addEventListener("contextmenu", P => {
    (P.target === e || r) && P.preventDefault();
  });
  addEventListener("mousemove", P => {
    if (r && (f.mode === "drag" && (x = P.clientX / Math.max(1, innerWidth), y = P.clientY / Math.max(1, innerHeight), b = true), f.locked || f.mode === "drag")) {
      let V = P.movementX || 0;
      let Y = P.movementY || 0;
      if (Math.abs(V) > 400 || Math.abs(Y) > 400) return;
      f.look.dx += V * f_ * f.sensitivity;
      f.look.dy += Y * f_ * f.sensitivity * (f.invertY ? -1 : 1);
    }
  });
  document.addEventListener("pointerlockchange", () => {
    if (f.locked = document.pointerLockElement === e, f.locked) {
      a = true;
      l = 0;
      c = 0;
      f.touch || p("lock");
    } else {
      o.mouse.clear();
      n.delete("fire");
      n.delete("ads");
      for (let P of o.key) n.add(P);
      u = 0;
    }
    game.events.emit("input:lock", {
      locked: f.locked
    });
  });
  document.addEventListener("pointerlockerror", () => m());
  let x = .5;
  let y = .5;
  let b = false;
  document.addEventListener("mouseleave", () => {
    b = false;
  });
  function m() {
    l = 0;
    !(f.locked || f.touch) && (c++, a || p("drag"));
  }
  function A() {
    if (!(f.touch || f.locked)) {
      if (!e.requestPointerLock) {
        m();
        return;
      }
      try {
        l = performance.now();
        let P = e.requestPointerLock();
        P && P.catch && P.catch(() => m());
      } catch {
        m();
      }
      try {
        e.focus({
          preventScroll: true
        });
      } catch {}
    }
  }
  function _() {
    try {
      document.pointerLockElement && document.exitPointerLock();
    } catch {}
  }
  let M = null;
  let E = 0;
  let w = -1;
  let S = 0;
  let z = 0;
  let H = 0;
  let O = 0;
  let q = -1;
  let U = 0;
  let T = 0;
  let D = -1;
  let C = 0;
  let G = 0;
  let j = false;
  function N() {
    let P = document.createElement("div");
    P.className = "touch";
    P.innerHTML = '<div class="t-stick"><i class="t-ring"></i><i class="t-nub"></i></div><button class="t-btn t-fire" data-a="fire" aria-label="사격"><span>사격</span></button><button class="t-btn t-ads" data-a="ads" aria-label="조준"><span>조준</span></button><button class="t-btn t-reload" data-a="reload" aria-label="재장전"><span>재장전</span></button><button class="t-btn t-jump" data-a="jump" aria-label="점프"><span>점프</span></button><button class="t-btn t-interact" data-a="interact" aria-label="상호작용"><span>사용</span></button><button class="t-btn t-pause" data-a="pause" aria-label="일시정지"><span>II</span></button>';
    t.appendChild(P);
    let V = L => P.querySelector(L);
    let Y = {
      root: P,
      stick: V(".t-stick"),
      nub: V(".t-nub"),
      btn: {
        fire: V(".t-fire"),
        ads: V(".t-ads"),
        reload: V(".t-reload"),
        jump: V(".t-jump"),
        interact: V(".t-interact"),
        pause: V(".t-pause")
      }
    };
    for (let L in Y.btn) {
      let Z = Y.btn[L];
      Z.addEventListener("touchstart", oe => {
        oe.preventDefault();
        oe.stopPropagation();
        E = performance.now();
        let fe = oe.changedTouches[0];
        if (L === "ads") {
          j = !j;
          Z.classList.toggle("active", j);
          return;
        }
        L === "fire" && (D = fe.identifier, C = fe.clientX, G = fe.clientY);
        Z.classList.add("active");
        d("touch", L, true);
      }, {
        passive: false
      });
      let J = oe => {
        if (oe.preventDefault(), oe.stopPropagation(), L !== "ads") {
          if (L === "fire") {
            let fe = false;
            for (let le of oe.changedTouches) le.identifier === D && (fe = true);
            if (!fe) return;
            D = -1;
          }
          Z.classList.remove("active");
          d("touch", L, false);
        }
      };
      Z.addEventListener("touchend", J, {
        passive: false
      });
      Z.addEventListener("touchcancel", J, {
        passive: false
      });
      Z.addEventListener("touchmove", oe => {
        if (oe.preventDefault(), L === "fire") for (let fe of oe.changedTouches) fe.identifier === D && (Q(fe.clientX - C, fe.clientY - G), C = fe.clientX, G = fe.clientY);
      }, {
        passive: false
      });
      Z.addEventListener("contextmenu", oe => oe.preventDefault());
    }
    return Y;
  }
  function Q(P, V) {
    f.look.dx += P * d_ * f.sensitivity;
    f.look.dy += V * d_ * f.sensitivity * (f.invertY ? -1 : 1);
  }
  function K() {
    f.touch || (f.touch = true, _(), M || (M = N()), M.root.classList.toggle("on", r), document.documentElement.classList.add("is-touch"), p("touch"));
  }
  function ie() {
    w = -1;
    H = O = 0;
    M && M.stick.classList.remove("on");
  }
  addEventListener("touchstart", () => {
    E = performance.now();
    K();
  }, {
    passive: true,
    capture: true
  });
  e.addEventListener("touchstart", P => {
    if (P.preventDefault(), !!r) for (let V of P.changedTouches) V.clientX < innerWidth * .45 && w < 0 ? (w = V.identifier, S = V.clientX, z = V.clientY, H = O = 0, M && (M.stick.style.transform = `translate3d(${S}px,${z}px,0)`, M.nub.style.transform = "translate3d(0,0,0)", M.stick.classList.add("on"))) : q < 0 && (q = V.identifier, U = V.clientX, T = V.clientY);
  }, {
    passive: false
  });
  e.addEventListener("touchmove", P => {
    if (P.preventDefault(), !!r) for (let V of P.changedTouches) if (V.identifier === w) {
      let Y = V.clientX - S;
      let L = V.clientY - z;
      let Z = Math.hypot(Y, L);
      Z > If && (Y *= If / Z, L *= If / Z);
      H = Y / If;
      O = -L / If;
      M && (M.nub.style.transform = `translate3d(${Y.toFixed(1)}px,${L.toFixed(1)}px,0)`);
    } else V.identifier === q && (Q(V.clientX - U, V.clientY - T), U = V.clientX, T = V.clientY);
  }, {
    passive: false
  });
  let F = P => {
    for (let V of P.changedTouches) V.identifier === w ? ie() : V.identifier === q && (q = -1);
  };
  e.addEventListener("touchend", F, {
    passive: false
  });
  e.addEventListener("touchcancel", F, {
    passive: false
  });
  let X = {
    0: "jump",
    1: "crouch",
    2: "reload",
    3: "interact",
    5: "melee",
    6: "ads",
    7: "fire",
    9: "pause",
    10: "sprint",
    11: "melee"
  };
  let ne = typeof navigator < "u" && !!navigator.getGamepads;
  let re = 0;
  let $ = 0;
  let ue = P => {
    let V = Math.abs(P);
    return V < .16 ? 0 : Math.sign(P) * (V - .16) / .84;
  };
  function me(P) {
    if (re = $ = 0, !ne) return;
    let V;
    try {
      V = navigator.getGamepads();
    } catch {
      ne = false;
      return;
    }
    let Y = null;
    for (let J = 0; V && J < V.length; J++) if (V[J] && V[J].connected && V[J].mapping === "standard") {
      Y = V[J];
      break;
    }
    if (!Y) {
      f.gamepad && (f.gamepad = false, o.pad.clear());
      return;
    }
    f.gamepad = true;
    re = ue(Y.axes[0] || 0);
    $ = -ue(Y.axes[1] || 0);
    let L = ue(Y.axes[2] || 0);
    let Z = ue(Y.axes[3] || 0);
    r && (f.look.dx += L * Math.abs(L) * m_ * P * f.sensitivity, f.look.dy += Z * Math.abs(Z) * m_ * .7 * P * f.sensitivity * (f.invertY ? -1 : 1));
    for (let J in X) {
      let oe = Y.buttons[J];
      d("pad", X[J], !!oe && (oe.pressed || oe.value > .4));
    }
  }
  function ee(P) {
    if (me(P), l && performance.now() - l > 1200 && !f.locked && m(), f.mode === "drag" && r && b && !f.locked) {
      let Z = x < .12 ? -(.12 - x) / .12 : x > .88 ? (x - .88) / .12 : 0;
      let J = y < .1 ? -(.1 - y) / .1 : y > .9 ? (y - .9) / .1 : 0;
      f.look.dx += Z * 2.4 * P * f.sensitivity;
      f.look.dy += J * 1.2 * P * f.sensitivity * (f.invertY ? -1 : 1);
    }
    let V = 0;
    let Y = 0;
    let L = false;
    if (r) {
      V = (n.has("right") ? 1 : 0) - (n.has("left") ? 1 : 0);
      Y = (n.has("forward") ? 1 : 0) - (n.has("back") ? 1 : 0);
      L = n.has("sprint");
      w >= 0 && (V += H, Y += O, Math.hypot(H, O) > .93 && O > .8 && (L = true));
      V += re;
      Y += $;
      let Z = Math.hypot(V, Y);
      Z > 1 && (V /= Z, Y /= Z);
      let J = (n.has("turnR") ? 1 : 0) - (n.has("turnL") ? 1 : 0);
      let oe = (n.has("turnD") ? 1 : 0) - (n.has("turnU") ? 1 : 0);
      J && (f.look.dx += J * p_ * P);
      oe && (f.look.dy += oe * p_ * .6 * P);
    }
    f.move.x = V;
    f.move.y = Y;
    f.fire = r && n.has("fire");
    f.ads = r && (n.has("ads") || j);
    f.sprint = r && L;
    f.crouch = r && n.has("crouch");
  }
  function B() {
    s.clear();
    f.look.dx = 0;
    f.look.dy = 0;
  }
  return f;
}
export { createInput };
