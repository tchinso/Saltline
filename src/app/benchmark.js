import { Vector2, Vector3 } from '../../vendor/three.js';
function createBenchmark(i) {
  let e = document.createElement("pre");
  e.id = "bench";
  e.style.cssText = 'position:absolute;left:12px;top:12px;z-index:90;margin:0;padding:10px 12px;font:12px/1.45 "IBM Plex Mono",ui-monospace,monospace;color:#d8f0d0;background:rgba(0,0,0,.72);white-space:pre-wrap;max-width:min(560px,90vw);pointer-events:none';
  document.getElementById("app").appendChild(e);
  let t = "unknown";
  try {
    let f = i.renderer.getContext();
    let p = f.getExtension("WEBGL_debug_renderer_info");
    t = p ? f.getParameter(p.UNMASKED_RENDERER_WEBGL) : f.getParameter(f.RENDERER);
  } catch {}
  let n = i.level.cinematicPath && i.level.cinematicPath.length >= 2 ? i.level.cinematicPath : [{
    pos: [-32, 1.7, 6],
    look: [0, 2, 5]
  }, {
    pos: [10, 1.7, 6],
    look: [30, 6, 0]
  }];
  let s = [];
  let o = 0;
  let r = 0;
  let a = 30;
  let l = new Vector3();
  let c = new Vector3();
  let u = new Vector3();
  let h = new Vector3();
  i.player && (i.player.enabled = false);
  i.bench = {
    frame(f) {
      o += f;
      let p = o / a % 1 * (n.length - 1);
      let d = Math.min(n.length - 2, Math.floor(p));
      let v = p - d;
      let g = v * v * (3 - 2 * v);
      if (l.fromArray(n[d].pos), c.fromArray(n[d + 1].pos), u.fromArray(n[d].look), h.fromArray(n[d + 1].look), i.camera.position.lerpVectors(l, c, g), i.camera.lookAt(u.lerp(h, g)), o > 2 && s.push(f * 1e3), s.length > 3e3 && s.shift(), o - r > 1 && s.length > 10) {
        r = o;
        let x = s.slice().sort((M, E) => M - E);
        let y = x.reduce((M, E) => M + E, 0) / x.length;
        let b = x[Math.floor(x.length * .99)];
        let m = x[x.length >> 1];
        let A = i.render.stats ? i.render.stats() : {};
        let _ = i.renderer.getDrawingBufferSize(new Vector2());
        e.textContent = `렐노르 성능 측정  시간=${o.toFixed(0)}s
GPU: ${t}
화면 버퍼 ${_.x}x${_.y}  품질 ${{
          low: "낮음",
          medium: "보통",
          high: "높음",
          ultra: "최고",
          test: "테스트"
        }[i.quality.name] || i.quality.name}  dpr ${window.devicePixelRatio}
프레임 평균 ${y.toFixed(1)}ms  중앙값 ${m.toFixed(1)}ms  p99 ${b.toFixed(1)}  => ${(1e3 / y).toFixed(0)} fps
통계 ${JSON.stringify(A)}
오류 ${window.__errors.length}${window.__errors.length ? `
 - ` + window.__errors.slice(0, 6).join(`
 - `) : ""}`;
      }
    }
  };
}
export { createBenchmark };
