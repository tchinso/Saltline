import { AdditiveBlending, BufferGeometry, CanvasTexture, DoubleSide, Float32BufferAttribute, LinearMipmapLinearFilter, Mesh, MeshStandardMaterial, SRGBColorSpace, ShaderMaterial, Shape, ShapeGeometry } from '../../vendor/three.js';
import { ENVIRONMENT, SUN } from '../core/config.js';
var hm = {
  model: [8, 8, 330, 84],
  maker: [8, 100, 560, 40],
  cal: [8, 146, 560, 40],
  prop: [8, 192, 700, 40],
  safe: [8, 240, 90, 34],
  semi: [110, 240, 90, 34],
  auto: [212, 240, 90, 34],
  rack: [8, 290, 300, 110],
  warn: [330, 290, 420, 110],
  optic: [580, 8, 300, 60],
  light: [580, 76, 300, 60],
  dots: [320, 240, 60, 34],
  r2: [8, 420, 56, 40],
  r4: [72, 420, 56, 40],
  r6: [136, 420, 56, 40],
  r8: [200, 420, 56, 40],
  r10: [264, 420, 56, 40],
  r12: [328, 420, 56, 40]
};
var Uf = 1024;
var Nf = 512;
function TC() {
  let i = document.createElement("canvas");
  i.width = Uf;
  i.height = Nf;
  let e = i.getContext("2d");
  e.clearRect(0, 0, Uf, Nf);
  e.textBaseline = "middle";
  let t = (u, h, f, p, d = "left") => {
    let [v, g, x, y] = hm[u];
    e.font = f;
    e.fillStyle = p;
    e.textAlign = d;
    e.fillText(h, d === "left" ? v + 2 : v + x / 2, g + y / 2 + 1, x - 4);
  };
  let n = '"Barlow Condensed", "Arial Narrow", Arial, sans-serif';
  let s = '"IBM Plex Mono", "Courier New", monospace';
  let o = '"Big Shoulders Display", "Barlow Condensed", Impact, sans-serif';
  let r = "rgba(196,198,194,0.92)";
  t("model", "PAC-9", `700 78px ${o}`, r);
  t("maker", "LONGSHORE ARMS WORKS  \xB7  RELNOR", `600 30px ${n}`, r);
  t("cal", "CAL 5.8\xD740   SN PA-004217", `500 27px ${s}`, r);
  t("prop", "PROPERTY OF PORT AUTHORITY \u2014 BERTH 4 ARMOURY", `600 28px ${n}`, r);
  t("safe", "S", `700 30px ${n}`, r, "center");
  t("semi", "1", `700 30px ${n}`, r, "center");
  t("auto", "A", `700 30px ${n}`, "rgba(205,60,40,0.95)", "center");
  t("rack", "B4-07", `800 104px ${o}`, "rgba(214,206,170,0.9)", "center");
  for (let u of [2, 4, 6, 8, 10, 12]) t("r" + u, "T" + u, `600 30px ${s}`, "rgba(190,192,188,0.85)", "center");
  t("optic", "HX-2 REFLEX", `700 44px ${n}`, r, "center");
  t("light", "900 LM  IPX8", `600 40px ${n}`, r, "center");
  {
    let [u, h] = hm.warn;
    e.fillStyle = r;
    e.textAlign = "left";
    e.font = `600 24px ${n}`;
    ["WARNING \u2014 CLEAR CHAMBER BEFORE", "STOWAGE. AUTHORISED BREACH", "PERSONNEL ONLY. PA-REG 44/7"].forEach((f, p) => e.fillText(f, u + 2, h + 20 + p * 34));
  }
  {
    let [u, h, f, p] = hm.dots;
    e.fillStyle = r;
    e.beginPath();
    e.arc(u + 12, h + p / 2, 7, 0, 7);
    e.fill();
    e.fillStyle = "rgba(205,60,40,0.95)";
    e.beginPath();
    e.arc(u + 40, h + p / 2, 7, 0, 7);
    e.fill();
  }
  e.globalCompositeOperation = "destination-out";
  let a = 7;
  let l = () => (a = a * 16807 % 2147483647, a / 2147483647);
  for (let u = 0; u < 2600; u++) {
    e.fillStyle = `rgba(0,0,0,${.25 + l() * .6})`;
    let h = l() < .9 ? 1 + l() * 1.5 : 2 + l() * 5;
    e.fillRect(l() * Uf, l() * Nf, h, h * (.4 + l()));
  }
  let c = new CanvasTexture(i);
  c.colorSpace = SRGBColorSpace;
  c.anisotropy = 8;
  c.generateMipmaps = true;
  c.minFilter = LinearMipmapLinearFilter;
  return c;
}
function F_(i) {
  let e = [];
  let t = [];
  let n = [];
  let s = [];
  for (let [l, c, u, h, f, p, d = 0] of i) {
    let [v, g, x, y] = hm[l];
    let b = f * x / y;
    let m = v / Uf;
    let A = (v + x) / Uf;
    let _ = 1 - g / Nf;
    let M = 1 - (g + y) / Nf;
    let E = e.length / 3;
    let w;
    if (p === "L" ? w = [[c, u - f / 2, -(h + b / 2)], [c, u - f / 2, -(h - b / 2)], [c, u + f / 2, -(h - b / 2)], [c, u + f / 2, -(h + b / 2)]] : p === "R" ? w = [[c, u - f / 2, -(h - b / 2)], [c, u - f / 2, -(h + b / 2)], [c, u + f / 2, -(h + b / 2)], [c, u + f / 2, -(h - b / 2)]] : w = [[c - b / 2, u, -(h - f / 2)], [c + b / 2, u, -(h - f / 2)], [c + b / 2, u, -(h + f / 2)], [c - b / 2, u, -(h + f / 2)]], d) {
      let z = Math.cos(d);
      let H = Math.sin(d);
      let O = u;
      let q = -h;
      for (let U of w) {
        let T = U[1] - O;
        let D = U[2] - q;
        U[1] = O + T * z - D * H;
        U[2] = q + T * H + D * z;
      }
    }
    for (let z of w) e.push(z[0], z[1], z[2]);
    t.push(m, M, A, M, A, _, m, _);
    let S = p === "L" ? [-1, 0, 0] : p === "R" ? [1, 0, 0] : [0, 1, 0];
    for (let z = 0; z < 4; z++) n.push(S[0], S[1], S[2]);
    s.push(E, E + 1, E + 2, E, E + 2, E + 3);
  }
  let o = new BufferGeometry();
  o.setAttribute("position", new Float32BufferAttribute(e, 3));
  o.setAttribute("uv", new Float32BufferAttribute(t, 2));
  o.setAttribute("normal", new Float32BufferAttribute(n, 3));
  o.setIndex(s);
  let r = new MeshStandardMaterial({
    map: TC(),
    transparent: true,
    roughness: .62,
    metalness: 0,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
    side: DoubleSide
  });
  let a = new Mesh(o, r);
  a.renderOrder = 2;
  return a;
}
function U_(i, e) {
  let t = new Shape();
  i.forEach((r, a) => a ? t.lineTo(r[0], r[1]) : t.moveTo(r[0], r[1]));
  t.closePath();
  let n = new ShapeGeometry(t);
  n.translate(0, 0, -e);
  {
    let r = 1e9;
    let a = -1e9;
    let l = 1e9;
    let c = -1e9;
    for (let f of i) {
      r = Math.min(r, f[0]);
      a = Math.max(a, f[0]);
      l = Math.min(l, f[1]);
      c = Math.max(c, f[1]);
    }
    let u = n.attributes.position;
    let h = n.attributes.uv;
    for (let f = 0; f < u.count; f++) h.setXY(f, (u.getX(f) - r) / (a - r), (u.getY(f) - l) / (c - l));
  }
  let s = new ShaderMaterial({
    transparent: true,
    premultipliedAlpha: true,
    depthWrite: false,
    side: DoubleSide,
    uniforms: {
      uBright: {
        value: 7
      },
      uSun: {
        value: SUN.dir.clone()
      },
      uSunCol: {
        value: SUN.color.clone()
      },
      uZen: {
        value: ENVIRONMENT.zenith.clone()
      },
      uHor: {
        value: ENVIRONMENT.horizonAway.clone()
      },
      uTilt: {
        value: .1
      }
    },
    vertexShader: `
      varying vec3 vView, vFwd, vRight, vUp, vWPos, vWN; varying vec2 vUv;
      uniform float uTilt;
      void main(){
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0); vView = mv.xyz;
        vFwd = (modelViewMatrix * vec4(0.0, 0.0, -1.0, 0.0)).xyz; vRight = (modelViewMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz; vUp = (modelViewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz;
        vWPos = (modelMatrix * vec4(position, 1.0)).xyz;
        vWN = normalize(mat3(modelMatrix) * normalize(vec3(0.0, -uTilt, 1.0)));   // real sights tilt the glass a few degrees
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying vec3 vView, vFwd, vRight, vUp, vWPos, vWN; varying vec2 vUv;
      uniform float uBright; uniform vec3 uSun, uSunCol, uZen, uHor;
      void main(){
        vec3 d = normalize(vView), fw = normalize(vFwd);
        float k = max(dot(d, fw), 1e-3);
        vec2 a = vec2(dot(d, normalize(vRight)), dot(d, normalize(vUp))) / k;      // tangent of the angle off the bore axis
        float r = length(a), px = max(fwidth(r), 1e-5);
        float dotR = max(0.0011, px * 0.9), ringW = max(0.00045, px * 0.6);
        float dotI = 1.0 - smoothstep(dotR - px, dotR + px, r);
        float ring = 1.0 - smoothstep(ringW - px * 0.5, ringW + px, abs(r - 0.0128));
        float ang = atan(a.y, a.x);
        float tick = (1.0 - smoothstep(0.0, px * 1.2 + 0.0004, min(abs(a.x), abs(a.y)))) * step(0.0128, r) * (1.0 - smoothstep(0.0165, 0.0175, r));
        float ret = clamp(dotI + ring * 0.8 + tick * 0.8, 0.0, 1.0);
        // faint halo so the bloom has something to hold on to
        ret += 0.05 * exp(-r * r / 0.00002);
        vec3 retCol = vec3(1.0, 0.11, 0.045) * ret * uBright;
        // coated glass: sky/sun reflection through a ruby-teal dichroic coating, stronger at grazing angles
        vec3 wv = normalize(vWPos - cameraPosition); vec3 n = normalize(vWN); if (dot(n, wv) > 0.0) n = -n;
        vec3 rf = reflect(wv, n);
        float fres = pow(1.0 - abs(dot(wv, n)), 3.0);
        vec3 sky = mix(uHor, uZen, clamp(rf.y * 1.4 + 0.2, 0.0, 1.0));
        float sd = max(dot(rf, uSun), 0.0);
        sky += uSunCol * (pow(sd, 6.0) * 0.6 + pow(sd, 90.0) * 6.0);
        // blue -> amber dichroic coating across the glass, a soft diagonal sheen band, and a thin dark edge
        float band = smoothstep(0.25, 0.5, vUv.x * 0.6 + vUv.y) * (1.0 - smoothstep(0.62, 0.95, vUv.x * 0.6 + vUv.y));
        vec3 coat = mix(vec3(0.30, 0.50, 0.95), vec3(1.0, 0.62, 0.28), clamp(fres * 2.2 + vUv.y * 0.75 - 0.15, 0.0, 1.0));
        vec2 e = abs(vUv - 0.5) * 2.0; float edge = smoothstep(0.90, 1.0, max(e.x, e.y));
        float refl = 0.12 + 0.60 * fres + 0.07 * band;
        // faint emitter glow that stays visible off-axis (what you see of a powered sight from the hip)
        vec2 eg = (vUv - vec2(0.5, 0.16)) * vec2(1.0, 1.6); retCol += vec3(1.0, 0.10, 0.04) * 0.20 * exp(-dot(eg, eg) * 60.0) * (1.0 - smoothstep(0.985, 0.9995, k));
        vec3 col = (sky * 1.5 + vec3(0.03, 0.035, 0.045)) * coat * refl * (1.0 - edge) + retCol;
        float alpha = clamp(0.20 + 0.32 * fres + 0.05 * band + 0.6 * edge, 0.0, 0.94);
        gl_FragColor = vec4(col, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  let o = new Mesh(n, s);
  o.renderOrder = 5;
  return o;
}
function N_() {
  let i = [];
  let e = [];
  let t = [];
  let n = [];
  let s = (d, v, g, x, y) => {
    let b = i.length / 3;
    for (let m of [d, v, g, x]) i.push(m[0], m[1], m[2]);
    e.push(0, 0, 1, 0, 1, 1, 0, 1);
    for (let m = 0; m < 4; m++) t.push(y);
    n.push(b, b + 1, b + 2, b, b + 2, b + 3);
  };
  s([-.13, -.13, -.03], [.13, -.13, -.03], [.13, .13, -.03], [-.13, .13, -.03], 0);
  s([-.13 * .7, -.13 * .7, -.09], [.13 * .7, -.13 * .7, -.09], [.13 * .7, .13 * .7, -.09], [-.13 * .7, .13 * .7, -.09], 0);
  let r = .065;
  let a = .34;
  s([-r, 0, .01], [r, 0, .01], [r, 0, -a], [-r, 0, -a], 1);
  s([0, -r, .01], [0, r, .01], [0, r, -a], [0, -r, -a], 1);
  let l = .17;
  let c = .05;
  let u = .035;
  s([-l, -c, u], [l, -c, u], [l, c, u], [-l, c, u], 2);
  s([-l, 0, u + c], [l, 0, u + c], [l, 0, u - c], [-l, 0, u - c], 2);
  s([-.05, -.05, -.01], [.05, -.05, -.01], [.05, .05, -.01], [-.05, .05, -.01], 3);
  s([-.03, -.03, .02], [.03, -.03, .02], [.03, .03, .02], [-.03, .03, .02], 4);
  let h = new BufferGeometry();
  h.setAttribute("position", new Float32BufferAttribute(i, 3));
  h.setAttribute("uv", new Float32BufferAttribute(e, 2));
  h.setAttribute("aType", new Float32BufferAttribute(t, 1));
  h.setIndex(n);
  let f = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    uniforms: {
      uSeed: {
        value: 0
      },
      uInt: {
        value: 0
      },
      uHeat: {
        value: 0
      },
      uJet: {
        value: 1
      }
    },
    vertexShader: `attribute float aType; varying vec2 vUv; varying float vType;
      void main(){ vUv = uv; vType = aType; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `varying vec2 vUv; varying float vType; uniform float uSeed, uInt, uHeat, uJet;
      float h1(float n){ return fract(sin(n * 127.1 + uSeed * 311.7) * 43758.5453); }
      void main(){
        vec2 p = vUv * 2.0 - 1.0; float r = length(p), a = atan(p.y, p.x); float I = 0.0; vec3 tintc = vec3(1.0, 0.50, 0.16);
        if (vType < 0.5) {
          float n1 = 3.0 + floor(h1(1.0) * 3.0), n2 = 5.0 + floor(h1(2.0) * 4.0);
          float pet = pow(abs(cos(a * n1 * 0.5 + h1(3.0) * 6.283)), 5.0) * (0.55 + 0.45 * h1(4.0));
          pet += pow(abs(cos(a * n2 * 0.5 + h1(5.0) * 6.283)), 14.0) * 0.55;
          float reach = 0.35 + 0.65 * pet;
          I = (0.25 + pet) * smoothstep(reach, reach * 0.15, r) * (0.75 + 0.25 * sin(r * 26.0 + h1(6.0) * 20.0));
        } else if (vType < 1.5) {
          float y = vUv.y, x = p.x * (1.0 + 0.5 * sin(y * 17.0 + h1(7.0) * 30.0) * y);
          float wdt = mix(0.20, 0.75, smoothstep(0.0, 0.35, y)) * (1.0 - y * 0.75);
          I = exp(-x * x / (wdt * wdt * 0.35)) * pow(1.0 - y, 1.4) * (0.7 + 0.3 * sin(y * 31.0 + h1(8.0) * 9.0)) * 0.9;
        } else if (vType < 2.5) {
          float u = abs(p.x), len = 0.55 + 0.45 * h1(9.0 + step(0.0, p.x));
          float wv = p.y * (1.0 + u * 3.0) + 0.12 * sin(u * 14.0 + h1(10.0) * 20.0) * u;
          I = exp(-wv * wv * 22.0) * smoothstep(len, 0.06, u) * smoothstep(0.02, 0.10, u) * 0.85 * uJet;
        } else if (vType < 3.5) {
          I = exp(-r * r * 5.0) * 2.4 * smoothstep(1.0, 0.6, r); tintc = vec3(1.0, 0.82, 0.58);
        } else {
          gl_FragColor = vec4(vec3(1.0, 0.28, 0.06) * exp(-r * r * 4.0) * smoothstep(1.0, 0.5, r) * uHeat, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          return;
        }
        vec3 col = mix(tintc, vec3(1.0, 0.90, 0.70), clamp(I * I * 0.7, 0.0, 1.0)) * I * uInt;
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  let p = new Mesh(h, f);
  p.renderOrder = 10;
  p.frustumCulled = false;
  return p;
}
export { F_, N_, U_ };
