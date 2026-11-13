import { ACESFilmicToneMapping, AlwaysDepth, BackSide, BoxGeometry, BufferAttribute, BufferGeometry, CubeCamera, DataTexture, DataUtils, DepthTexture, DirectionalLight, FloatType, Group, HalfFloatType, LinearFilter, Matrix4, Mesh, MeshStandardMaterial, NearestFilter, NoBlending, NoColorSpace, NoToneMapping, OrthographicCamera, PCFShadowMap, PCFSoftShadowMap, PMREMGenerator, PerspectiveCamera, PointLight, RGBAFormat, RedFormat, RepeatWrapping, SRGBColorSpace, Scene, ShaderChunk, ShaderMaterial, SphereGeometry, UnsignedByteType, UnsignedIntType, Vector2, Vector3, WebGLCubeRenderTarget, WebGLRenderTarget, WebGLRenderer } from '../../vendor/three.js';
import { VIEWMODEL_LAYER, ENVIRONMENT, PLAYER, QUALITY_PRESETS, SUN, WORLD_LAYER } from '../core/config.js';
import { beveledBoxGeometry, boxGeometry, createMesh } from '../geometry/primitives.js';
import { resolveVisualMood } from './visual-mood.js';
var Ug = `
uniform sampler2D tNoise;
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return texture2D(tNoise, (i + f + 0.5) / 256.0).r; }
float fbm5(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++){ s += a * n2(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 17.3; a *= 0.5; } return s / 0.96875; }
float fbm3(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 3; i++){ s += a * n2(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 17.3; a *= 0.5; } return s / 0.875; }
`;
var Ng = `
uniform vec3 uSunDir, uZen, uHor, uHorAway, uSunCol;
float skyToSun(vec3 d){ return clamp(dot(normalize(d.xz + vec2(1e-5)), normalize(uSunDir.xz)) * 0.5 + 0.5, 0.0, 1.0); }
vec3 horizonColor(vec3 d){
  float ts = skyToSun(d);
  vec3 c = mix(uHorAway, uHorAway * 1.25 + vec3(0.05, 0.03, 0.02), smoothstep(0.2, 0.75, ts));
  c = mix(c, uHor * vec3(1.9, 1.55, 1.2), pow(ts, 6.0));
  c = mix(c, vec3(1.0, 0.60, 0.24) * 3.4, pow(ts, 34.0));
  return c;
}
`;
function Oy() {
  let e = new Uint8Array(262144);
  let t = 2654435769;
  let n = () => (t ^= t << 13, t >>>= 0, t ^= t >>> 17, t ^= t << 5, t >>>= 0, t / 4294967296);
  for (let o = 0; o < 256 * 256; o++) {
    e[o * 4] = n() * 256;
    e[o * 4 + 1] = n() * 256;
    e[o * 4 + 2] = n() * 256;
    e[o * 4 + 3] = 255;
  }
  let s = new DataTexture(e, 256, 256, RGBAFormat, UnsignedByteType);
  s.wrapS = s.wrapT = RepeatWrapping;
  s.magFilter = s.minFilter = LinearFilter;
  s.generateMipmaps = false;
  s.colorSpace = NoColorSpace;
  s.needsUpdate = true;
  return s;
}
var H6 = `
// SALTLINE_SKY
precision highp float;
varying vec3 vDir;
uniform float uTime, uEnv, uFlash;
uniform vec3 uFlashDir;
${Ug}
${Ng}

void main(){
  vec3 d = normalize(vDir);
  float h = max(d.y, 0.0);
  float mu = dot(d, uSunDir);
  float s = max(mu, 0.0);
  float ts = skyToSun(d);

  // ---- clear sky behind / below the deck ----
  vec3 hc = horizonColor(d);
  vec3 midC = mix(vec3(0.15, 0.24, 0.36), vec3(0.72, 0.50, 0.34), pow(ts, 3.0));   // pale band above the fire
  vec3 clearC = mix(hc, midC, smoothstep(0.0, 0.17, h));
  clearC = mix(clearC, vec3(0.085, 0.145, 0.24) + (uZen - vec3(0.055, 0.085, 0.13)), smoothstep(0.10, 0.5, h));
  // aureole (mie glow round the sun)
  clearC += uSunCol * vec3(1.0, 0.86, 0.68) * (pow(s, 8.0) * 0.14 + pow(s, 64.0) * 0.55 + pow(s, 600.0) * 2.2 + pow(s, 6000.0) * 14.0);

  // ---- cloud deck ----
  vec2 cuv = d.xz / (h + 0.10) * vec2(0.62, 0.95);          // rolls of cloud run roughly east-west
  vec2 wind = vec2(-0.012, 0.004) * uTime;
  vec2 q = cuv + wind;
  float warp = fbm3(q * 0.45 + 7.1);
  vec2 qq = q + (warp - 0.5) * 1.3;
  float dens = fbm5(qq);
  // rippled underside (ridged detail), fading with distance so the horizon does not alias
  float ridg = 1.0 - abs(2.0 * fbm3(qq * 3.1 + 5.0) - 1.0);
  dens = dens * 0.86 + (ridg - 0.6) * 0.16 * smoothstep(0.03, 0.25, h);
  float big = n2(q * 0.19 + 3.7);
  float body = dens * 0.74 + big * 0.36;
  float cov = smoothstep(0.31, 0.50, body);
  // the deck ends above the eastern horizon: clear, burning gap toward the sun; almost down to the sea elsewhere
  float edge = mix(0.030, 0.285, pow(ts, 1.7));
  float rag = (n2(q * 0.9 + 11.0) - 0.5) * 0.16 + (dens - 0.5) * 0.10;
  float deck = smoothstep(edge - 0.035, edge + 0.11, h + rag * (0.35 + ts));
  cov *= deck;
  // the sun always burns through a ragged hole in the gap, never sits behind solid cloud
  float hole = smoothstep(0.972, 0.9985, mu + (dens - 0.5) * 0.012);
  cov *= 1.0 - 0.93 * hole;
  // thin scud drifting in the gap (veils the sun a little, catches fire)
  float scud = smoothstep(0.55, 0.85, fbm3(q * vec2(0.55, 1.9) + 31.0)) * (1.0 - deck) * smoothstep(0.02, 0.10, h) * 0.55 * (1.0 - 0.8 * hole);

  // lighting: density gradient toward the sun = self shadowing of the underside relief
  vec2 sd = normalize(uSunDir.xz);
  float densS = fbm5(qq + sd * 0.22);
  float relief = clamp((dens - densS) * 4.5 + 0.5, 0.0, 1.0);
  float thick = smoothstep(0.40, 0.72, body);
  vec3 cool = mix(vec3(0.155, 0.195, 0.255), vec3(0.030, 0.042, 0.064), thick);       // slate, darker where the deck is thick
  cool *= 0.55 + 0.9 * relief * relief;
  cool += vec3(0.07, 0.10, 0.15) * pow(1.0 - thick, 3.0);                             // thin spots let cold light through
  // warm light raking the underside from the gap: strongest near the sun and near the deck edge
  float nearSun = pow(ts, 5.0) * exp(-max(h - edge, 0.0) * 4.5) * 0.9 + pow(s, 7.0) * 0.9;
  vec3 warm = (uHor * vec3(1.30, 0.66, 0.40)) * nearSun * (0.05 + 2.2 * relief * relief * relief) * 1.15;
  // burning rim where cloud thins at the edge of the gap
  float rim = cov * (1.0 - cov) * 4.0;
  warm += uSunCol * rim * pow(ts, 4.0) * (0.5 + 1.6 * pow(s, 6.0)) * (1.0 - 0.85 * hole);
  vec3 cloudC = cool + warm;
  // sheet lightning inside the deck
  float fl = uFlash * pow(max(dot(d, uFlashDir), 0.0), 5.0);
  cloudC += vec3(0.55, 0.68, 1.0) * fl * (0.4 + 2.2 * dens * dens);
  // aerial perspective: far cloud melts into the horizon colour
  cloudC = mix(cloudC, hc * 0.55 + cloudC * 0.45, exp(-h * 11.0));

  vec3 col = mix(clearC, cloudC, cov * 0.985);
  vec3 scudC = mix(vec3(0.10, 0.11, 0.14), uHor * 1.5, pow(ts, 3.0)) + uSunCol * pow(s, 24.0) * 2.0;
  col = mix(col, scudC, scud);

  // sun disk (not in the environment capture: the directional light is the sun there)
  float veil = (1.0 - cov * 0.92) * (1.0 - scud * 0.7);
  float disk = smoothstep(0.999905, 0.999955, mu);
  col += vec3(1.0, 0.80, 0.52) * disk * 110.0 * veil * (1.0 - uEnv);

  // below the horizon: sea haze / ground bounce (mostly hidden by geometry)
  if (d.y < 0.0) {
    float t = clamp(-d.y * 5.0, 0.0, 1.0);
    vec3 low = mix(uHorAway * 0.42, vec3(0.060, 0.064, 0.070), uEnv);
    low += uHor * 0.55 * pow(ts, 6.0) * exp(d.y * 7.0);
    col = mix(hc + uSunCol * pow(s, 48.0) * 1.5, low, smoothstep(0.0, 1.0, t));
  }
  // keep the PMREM free of fireflies
  col = mix(col, min(col, vec3(6.0)), uEnv);
  gl_FragColor = vec4(max(col, vec3(0.0)), 1.0);
}`;
var V6 = `
varying vec3 vDir;
void main(){ vDir = position; vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position, 1.0); gl_Position = p.xyww; }`;
function W6(i) {
  return {
    tNoise: {
      value: i
    },
    uTime: {
      value: 0
    },
    uEnv: {
      value: 0
    },
    uFlash: {
      value: 0
    },
    uFlashDir: {
      value: new Vector3(-.5, .5, -.7).normalize()
    },
    uSunDir: {
      value: SUN.dir.clone()
    },
    uZen: {
      value: ENVIRONMENT.zenith.clone()
    },
    uHor: {
      value: ENVIRONMENT.horizon.clone()
    },
    uHorAway: {
      value: ENVIRONMENT.horizonAway.clone()
    },
    uSunCol: {
      value: SUN.color.clone()
    }
  };
}
function Hy(i) {
  let e = new ShaderMaterial({
    name: "saltline-sky",
    side: BackSide,
    depthWrite: false,
    depthTest: true,
    fog: false,
    toneMapped: false,
    uniforms: W6(i),
    vertexShader: V6,
    fragmentShader: H6
  });
  let t = new BoxGeometry(2, 2, 2);
  let n = new Mesh(t, e);
  n.name = "sky";
  n.frustumCulled = false;
  n.renderOrder = -1e3;
  n.castShadow = false;
  n.receiveShadow = false;
  n.matrixAutoUpdate = false;
  return {
    mesh: n,
    material: e,
    geometry: t
  };
}
function Vy(i, e) {
  let t = new PMREMGenerator(i);
  let n = e.material.clone();
  n.uniforms.tNoise.value = e.material.uniforms.tNoise.value;
  n.uniforms.uEnv.value = 1;
  let s = new Scene();
  let o = new Mesh(e.geometry, n);
  o.frustumCulled = false;
  s.add(o);
  let r = t.fromScene(s, 0, .1, 100);
  n.dispose();
  t.dispose();
  return r;
}
var Wy = "// SALTLINE_SHADOW";
var xf = null;
function Gy(i, e, t, n, s) {
  let o = SUN.dir.clone().normalize();
  let r = e.clone().add(t).multiplyScalar(.5);
  i.target.position.copy(r);
  i.position.copy(r).addScaledVector(o, 200);
  i.updateMatrixWorld(true);
  i.target.updateMatrixWorld(true);
  let a = new Matrix4().lookAt(i.position, r, new Vector3(0, 1, 0));
  a.setPosition(i.position);
  a.invert();
  let l = new Vector3();
  let c = 1 / 0;
  let u = -1 / 0;
  let h = 1 / 0;
  let f = -1 / 0;
  let p = 1 / 0;
  let d = -1 / 0;
  let v = (y, b, m) => {
    for (let A = 0; A < 8; A++) {
      l.set(A & 1 ? b.x : y.x, A & 2 ? b.y : y.y, A & 4 ? b.z : y.z).applyMatrix4(a);
      m(l);
    }
  };
  v(e, t, y => {
    c = Math.min(c, y.x);
    u = Math.max(u, y.x);
    h = Math.min(h, y.y);
    f = Math.max(f, y.y);
    p = Math.min(p, -y.z);
    d = Math.max(d, -y.z);
  });
  v(n, s, y => {
    p = Math.min(p, -y.z);
  });
  let g = i.shadow.camera;
  let x = 1;
  g.left = c - x;
  g.right = u + x;
  g.bottom = h - x;
  g.top = f + x;
  g.near = Math.max(1, p - 4);
  g.far = d + 4;
  g.updateProjectionMatrix();
  return {
    width: g.right - g.left,
    height: g.top - g.bottom,
    depth: g.far - g.near
  };
}
function qy(i, {
  taps: e = 16,
  searchTaps: t = 8
} = {}) {
  let n = ShaderChunk.shadowmap_pars_fragment;
  xf === null && (xf = n);
  let s = xf;
  let o = s.indexOf("float getShadow(");
  let r = s.indexOf("vec2 cubeToUV");
  let a = s.lastIndexOf("// cubeToUV()", r);
  if (a < o && (a = r), o < 0 || r < 0 || r < o) {
    console.warn("[render] soft shadows: unexpected Three shader chunk layout, keeping stock PCF");
    return false;
  }
  let l = `
	${Wy}
	const vec2 SL_FRUSTUM = vec2( ${i.width.toFixed(3)}, ${i.height.toFixed(3)} );   // metres across the shadow map
	const float SL_DEPTH = ${i.depth.toFixed(3)};                                       // metres across the depth range
	float slIGN( vec2 p ) { return fract( 52.9829189 * fract( dot( p, vec2( 0.06711056, 0.00583715 ) ) ) ); }
	vec2 slVogel( int i, int n, float phi ) {
		float r = sqrt( ( float( i ) + 0.5 ) / float( n ) );
		float th = float( i ) * 2.39996323 + phi;
		return r * vec2( cos( th ), sin( th ) );
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		shadowCoord.xyz /= shadowCoord.w;
		vec3 sc = shadowCoord.xyz;
		vec3 dx = dFdx( sc ), dy = dFdy( sc );
		bool inFrustum = sc.x >= 0.0 && sc.x <= 1.0 && sc.y >= 0.0 && sc.y <= 1.0;
		if ( ! ( inFrustum && sc.z <= 1.0 ) ) return 1.0;
		// receiver plane depth bias: depth gradient of the receiver in shadow-map uv space
		float det = dx.x * dy.y - dx.y * dy.x;
		vec2 dz = vec2( 0.0 );
		if ( abs( det ) > 1e-12 ) dz = vec2( dy.y * dx.z - dx.y * dy.z, dx.x * dy.z - dy.x * dx.z ) / det;
		vec2 texel = 1.0 / shadowMapSize;
		float maxSlope = 0.0030 / max( texel.x, texel.y );      // never bias more than ~0.6 m per kernel
		dz = clamp( dz, vec2( - maxSlope ), vec2( maxSlope ) );
		float zr = sc.z + shadowBias - ( abs( dz.x ) * texel.x + abs( dz.y ) * texel.y ) * 0.35;
		float phi = slIGN( gl_FragCoord.xy ) * 6.2831853;
		// --- blocker search ---
		vec2 searchR = ( 0.55 * shadowRadius ) / SL_FRUSTUM;     // metres -> uv
		float blk = 0.0, nb = 0.0;
		for ( int i = 0; i < ${t}; i ++ ) {
			vec2 o = slVogel( i, ${t}, phi ) * searchR;
			float d = unpackRGBAToDepth( texture2D( shadowMap, sc.xy + o ) );
			float z = zr + dot( o, dz );
			if ( d < z ) { blk += d; nb += 1.0; }
		}
		if ( nb < 0.5 ) return 1.0;
		float avg = blk / nb;
		// --- penumbra: grows with blocker distance (sun half-angle scaled up for look) ---
		float distM = max( zr - avg, 0.0 ) * SL_DEPTH;
		float penM = clamp( distM * 0.022 * shadowRadius, 0.012 * shadowRadius, 0.60 * shadowRadius );
		vec2 filtR = max( vec2( penM ) / SL_FRUSTUM, texel * 1.25 );
		float lit = 0.0;
		for ( int i = 0; i < ${e}; i ++ ) {
			vec2 o = slVogel( i, ${e}, phi + 1.7 ) * filtR;
			float d = unpackRGBAToDepth( texture2D( shadowMap, sc.xy + o ) );
			lit += step( zr + dot( o, dz ), d );
		}
		lit /= float( ${e} );
		// fade to lit at the very edge of the map so the frustum border never shows
		vec2 e = min( sc.xy, 1.0 - sc.xy );
		lit = mix( 1.0, lit, smoothstep( 0.0, 0.02, min( e.x, e.y ) ) );
		return mix( 1.0, lit, shadowIntensity );
	}

	`;
  ShaderChunk.shadowmap_pars_fragment = s.slice(0, o) + l + s.slice(a);
  return true;
}
function Xy() {
  xf !== null && (ShaderChunk.shadowmap_pars_fragment = xf);
}
var Yy = Wy;
var Bg = "// SALTLINE_POST";
var n1 = "0.05";
var Zy = "0.05";
var G6 = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
var Js = `
varying vec2 vUv;
float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
`;
var Og = `
uniform sampler2D tAdapt; uniform float uExposure, uKey, uMinE, uMaxE, uAuto;
float slExposure(){ float a = texture2D(tAdapt, vec2(0.5)).r; return uExposure * mix(1.0, clamp(pow(uKey / max(a, 1e-4), 0.85), uMinE, uMaxE), uAuto); }
`;
var q6 = `${Js}
uniform sampler2D tDepth;
void main(){ gl_FragDepth = texture2D(tDepth, vUv).r; gl_FragColor = vec4(0.0); }`;
var X6 = `${Js}
uniform sampler2D tDepth; uniform float uNear, uFar;
void main(){
  // exact texel fetch: sampling at a texel corner would pick rows unpredictably and band the AO on grazing floors
  ivec2 p = min(ivec2(gl_FragCoord.xy) * 2, textureSize(tDepth, 0) - 1);
  float d = texelFetch(tDepth, p, 0).r;
  float z = d < ${n1} ? 0.01 : (uNear * uFar) / (uFar - d * (uFar - uNear));
  gl_FragColor = vec4(z, 0.0, 0.0, 1.0);
}`;
var Y6 = `${Js}
uniform sampler2D tDepthHalf; uniform vec2 uTanHalf, uTexel; uniform float uRadius, uIntensity, uAspect;
vec3 vpos(vec2 uv, float z){ return vec3((uv * 2.0 - 1.0) * uTanHalf * z, -z); }
void main(){
  float z0 = texture2D(tDepthHalf, vUv).r;
  if (z0 < ${Zy} || z0 > 140.0) { gl_FragColor = vec4(1.0); return; }
  vec3 P = vpos(vUv, z0);
  vec2 ox = vec2(uTexel.x, 0.0), oy = vec2(0.0, uTexel.y);
  float zl = texture2D(tDepthHalf, vUv - ox).r, zr = texture2D(tDepthHalf, vUv + ox).r;
  float zd = texture2D(tDepthHalf, vUv - oy).r, zu = texture2D(tDepthHalf, vUv + oy).r;
  vec3 dx = abs(zl - z0) < abs(zr - z0) ? P - vpos(vUv - ox, zl) : vpos(vUv + ox, zr) - P;
  vec3 dy = abs(zd - z0) < abs(zu - z0) ? P - vpos(vUv - oy, zd) : vpos(vUv + oy, zu) - P;
  vec3 n = normalize(cross(dx, dy));
  float R = uRadius * (0.6 + 0.4 * clamp(z0 / 12.0, 0.0, 1.0));
  float rUv = clamp(R / (2.0 * z0 * uTanHalf.y), 3.0 * uTexel.y, 0.14);
  float R2 = R * R;
  float rot = ign(gl_FragCoord.xy) * 6.2831853;
  float sum = 0.0;
  for (int i = 0; i < AO_TAPS; i++) {
    float a = (float(i) + 0.5) / float(AO_TAPS);
    float th = a * 6.2831853 * 3.0 + rot;
    vec2 o = vec2(cos(th), sin(th)) * a * rUv; o.x /= uAspect;
    vec2 uv2 = vUv + o;
    float z2 = texture2D(tDepthHalf, uv2).r;
    vec3 v = vpos(uv2, z2) - P;
    float vv = dot(v, v), vn = dot(v, n);
    float f = max(R2 - vv, 0.0);
    sum += f * f * f * max((vn - (0.015 + 0.004 * z0)) / (vv + 0.004), 0.0);
  }
  float ao = max(0.0, 1.0 - uIntensity * sum * 5.0 / (R2 * R2 * R2 * float(AO_TAPS)));
  ao = mix(ao, 1.0, smoothstep(70.0, 140.0, z0));
  gl_FragColor = vec4(ao, ao, ao, 1.0);
}`;
var $6 = `${Js}
uniform sampler2D tDepthHalf, tShadow;
uniform mat4 uShadowMatrix, uCamWorld;
uniform vec3 uCamPos, uSunRad, uAmb;
uniform vec2 uTanHalf;
uniform float uHasShadow, uMaxDist, uSigma, uFarZ, uFarHaze, uFlicker, uBoxDust;
uniform vec3 uBoxMin, uBoxMax;
${Ng}
float shape(float h){ return 0.30 + 0.70 * exp(-max(h, 0.0) / 5.5); }
float hg(float mu, float g){ float g2 = g * g; return (1.0 - g2) / (12.566371 * pow(max(1.0 + g2 - 2.0 * g * mu, 1e-4), 1.5)); }
float sunVis(vec3 p){
  vec4 sc = uShadowMatrix * vec4(p, 1.0);
  if (sc.x < 0.0 || sc.x > 1.0 || sc.y < 0.0 || sc.y > 1.0 || sc.z > 1.0 || sc.z < 0.0) return 1.0;
  float d = dot(texture2D(tShadow, sc.xy), vec4(0.99609375, 0.99609375 / 256.0, 0.99609375 / 65536.0, 1.0 / 16777216.0));
  return step(sc.z - 0.0006, d);
}
void main(){
  float z = texture2D(tDepthHalf, vUv).r;
  if (z < ${Zy}) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
  vec3 vd = vec3((vUv * 2.0 - 1.0) * uTanHalf, -1.0);
  float rl = length(vd);
  vec3 rd = normalize(mat3(uCamWorld) * vd);
  float dist = z * rl;
  bool isSky = z > uFarZ * 0.97;
  float maxD = min(dist, isSky ? uMaxDist * 0.55 : uMaxDist);
  float mu = dot(rd, uSunDir);
  // two-lobe phase: tight forward lobe for the gold glow toward the sun + a broad lobe so side-lit shafts stay visible
  float ph = min(hg(mu, 0.78) * 0.55 + hg(mu, 0.25) * 0.45, 1.15);
  float j = ign(gl_FragCoord.xy);
  vec3 acc = vec3(0.0); float T = 1.0; float tPrev = 0.0;
  for (int i = 0; i < VOL_STEPS; i++) {
    float f = (float(i) + 1.0) / float(VOL_STEPS);
    float t1 = maxD * f * (0.35 + 0.65 * f);              // denser sampling near the eye
    float ds = t1 - tPrev;
    vec3 p = uCamPos + rd * (tPrev + ds * j);
    float sh = uHasShadow > 0.5 ? sunVis(p) : 1.0;
    // dusty interior (the shed): thicker air so sun shafts through doors, louvres and roof holes read; less sky ambient
    vec3 bq = step(uBoxMin, p) * step(p, uBoxMax); float inb = bq.x * bq.y * bq.z;
    float ext = uSigma * shape(p.y) * (1.0 + uBoxDust * inb);
    float Ti = exp(-ext * ds);
    // art direction: beams near the eye read strongly (shafts between stacks), the far field stays a restrained veil
    float nearW = mix(2.3, 0.55, smoothstep(4.0, 85.0, tPrev + ds * j));
    vec3 src = uSunRad * (ph * sh * mix(nearW, 1.6, inb)) + uAmb * (0.40 + 0.60 * sh) * mix(1.0, 0.22, inb);
    acc += T * src * (1.0 - Ti);
    T *= Ti; tPrev = t1;
  }
  // analytic continuation for far geometry (ship, cranes, skyline): fades into the horizon colour of that direction
  if (!isSky && dist > uMaxDist) {
    float h1 = uCamPos.y + rd.y * uMaxDist, h2 = uCamPos.y + rd.y * dist;
    float tau = uSigma * uFarHaze * (dist - uMaxDist) * 0.5 * (shape(h1) + shape(h2));
    float Tf = exp(-tau);
    vec3 hc = horizonColor(rd) * 0.50 + uAmb * 0.6;
    acc += T * hc * (1.0 - Tf);
    T *= Tf;
  }
  gl_FragColor = vec4(acc, T);
}`;
var $y = `${Js}
uniform sampler2D tSrc, tDepthHalf; uniform vec2 uDir;
void main(){
  float z0 = texture2D(tDepthHalf, vUv).r;
  float zc = min(z0, 300.0);
  vec4 acc = vec4(0.0); float ws = 0.0;
  for (int i = -3; i <= 3; i++) {
    vec2 uv = vUv + uDir * float(i);
    float z = min(texture2D(tDepthHalf, uv).r, 300.0);
    float w = (1.0 - abs(float(i)) * 0.22) * max(0.0, 1.0 - abs(z - zc) / (BLUR_TOL * zc + 0.02));
    acc += texture2D(tSrc, uv) * w; ws += w;
  }
  gl_FragColor = ws > 1e-4 ? acc / ws : texture2D(tSrc, vUv);
}`;
var Z6 = `${Js}
uniform sampler2D tColor, tDepth, tDepthHalf, tAO, tVol;
uniform vec2 uHalfRes; uniform float uNear, uFar, uAoOn, uVolOn, uAoStrength;
${Og}
void main(){
  vec3 col = max(texture2D(tColor, vUv).rgb, vec3(0.0));
  float d = texture2D(tDepth, vUv).r;
  if (d >= ${n1}) {
    float z = (uNear * uFar) / (uFar - d * (uFar - uNear));
    // joint bilateral upsample of the half-res buffers
    vec2 hp = vUv * uHalfRes - 0.5; vec2 f = fract(hp); vec2 base = (floor(hp) + 0.5) / uHalfRes; vec2 tx = 1.0 / uHalfRes;
    float ao = 0.0; vec4 vol = vec4(0.0); float ws = 0.0;
    float zc = min(z, 300.0);
    for (int k = 0; k < 4; k++) {
      vec2 o = vec2(float(k & 1), float(k >> 1));
      vec2 uv = base + o * tx;
      float zh = min(texture2D(tDepthHalf, uv).r, 300.0);
      float w = (o.x > 0.5 ? f.x : 1.0 - f.x) * (o.y > 0.5 ? f.y : 1.0 - f.y);
      w *= 1.0 / (0.015 + abs(zh - zc) / zc) ;
      w = max(w, 1e-5);
      ao += texture2D(tAO, uv).r * w; vol += texture2D(tVol, uv) * w; ws += w;
    }
    ao /= ws; vol /= ws;
    if (uAoOn > 0.5 && d < 0.99999) {
      // occlusion belongs to ambient light: fade it out on brightly lit pixels so sunlit surfaces never get dirty halos
      float lit = smoothstep(0.16, 0.85, luma(col) * slExposure());
      float a = mix(1.0, ao, uAoStrength * (1.0 - 0.8 * lit));
      col *= mix(vec3(a), vec3(1.0), vec3(0.0, 0.03, 0.07));      // faintly cool occlusion
    }
    if (uVolOn > 0.5) col = col * vol.a + vol.rgb;
  }
  gl_FragColor = vec4(col, 1.0);
}`;
var j6 = `${Js}
uniform sampler2D tColor, tDepth; uniform mat4 uInvViewProj, uPrevViewProj; uniform float uShutter; uniform vec2 uRes;
void main(){
  vec4 c0 = texture2D(tColor, vUv);
  float d = texture2D(tDepth, vUv).r;
  if (d < ${n1}) { gl_FragColor = c0; return; }
  vec4 wp = uInvViewProj * vec4(vUv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0); wp /= wp.w;
  vec4 pc = uPrevViewProj * wp;
  vec2 puv = pc.xy / max(pc.w, 1e-4) * 0.5 + 0.5;
  vec2 vel = (vUv - puv) * uShutter;
  float len = length(vel);
  if (pc.w <= 0.0 || len * uRes.y < 0.75) { gl_FragColor = c0; return; }
  vel *= min(1.0, 0.018 / len);
  float j = ign(gl_FragCoord.xy) - 0.5;
  vec3 acc = c0.rgb; float ws = 1.0;
  for (int i = 0; i < 9; i++) {
    vec2 uv = vUv + vel * ((float(i) + 0.5 + j) / 9.0 - 0.5);
    float w = texture2D(tDepth, uv).r < ${n1} ? 0.0 : 1.0;
    acc += texture2D(tColor, uv).rgb * w; ws += w;
  }
  gl_FragColor = vec4(acc / ws, 1.0);
}`;
var J6 = `${Js}
uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uFirst;
vec3 s(vec2 o){ return min(max(texture2D(tSrc, vUv + o * uTexel).rgb, vec3(0.0)), vec3(400.0)); }
float kw(vec3 c){ return 1.0 / (1.0 + luma(c) * 0.08); }
void main(){
  vec3 a = s(vec2(-2.0, 2.0)), b = s(vec2(0.0, 2.0)), c = s(vec2(2.0, 2.0));
  vec3 d = s(vec2(-2.0, 0.0)), e = s(vec2(0.0, 0.0)), f = s(vec2(2.0, 0.0));
  vec3 g = s(vec2(-2.0, -2.0)), h = s(vec2(0.0, -2.0)), i = s(vec2(2.0, -2.0));
  vec3 j = s(vec2(-1.0, 1.0)), k = s(vec2(1.0, 1.0)), l = s(vec2(-1.0, -1.0)), m = s(vec2(1.0, -1.0));
  vec3 col;
  if (uFirst > 0.5) {
    // partial Karis average on the first downsample: tames fireflies without killing the sun
    vec3 g0 = (a + b + d + e) * 0.25, g1 = (b + c + e + f) * 0.25, g2 = (d + e + g + h) * 0.25, g3 = (e + f + h + i) * 0.25, g4 = (j + k + l + m) * 0.25;
    float w0 = kw(g0) * 0.125, w1 = kw(g1) * 0.125, w2 = kw(g2) * 0.125, w3 = kw(g3) * 0.125, w4 = kw(g4) * 0.5;
    col = (g0 * w0 + g1 * w1 + g2 * w2 + g3 * w3 + g4 * w4) / (w0 + w1 + w2 + w3 + w4);
  } else {
    col = e * 0.125 + (a + c + g + i) * 0.03125 + (b + d + f + h) * 0.0625 + (j + k + l + m) * 0.125;
  }
  gl_FragColor = vec4(col, 1.0);
}`;
var K6 = `${Js}
uniform sampler2D tLow, tHigh; uniform vec2 uTexel; uniform float uMix;
void main(){
  vec2 o = uTexel;
  vec3 t = texture2D(tLow, vUv).rgb * 4.0;
  t += (texture2D(tLow, vUv + vec2(o.x, 0.0)).rgb + texture2D(tLow, vUv - vec2(o.x, 0.0)).rgb + texture2D(tLow, vUv + vec2(0.0, o.y)).rgb + texture2D(tLow, vUv - vec2(0.0, o.y)).rgb) * 2.0;
  t += texture2D(tLow, vUv + o).rgb + texture2D(tLow, vUv - o).rgb + texture2D(tLow, vUv + vec2(o.x, -o.y)).rgb + texture2D(tLow, vUv + vec2(-o.x, o.y)).rgb;
  t *= 1.0 / 16.0;
  gl_FragColor = vec4(mix(texture2D(tHigh, vUv).rgb, t, uMix), 1.0);
}`;
var Q6 = `${Js}
uniform sampler2D tSrc; uniform vec2 uDir; uniform float uThreshold;
${Og}
void main(){
  float thr = uThreshold / max(slExposure(), 0.2);
  vec3 acc = vec3(0.0); float ws = 0.0;
  for (int i = -7; i <= 7; i++) {
    float x = float(i); float w = exp(-x * x / 18.0);
    vec3 c = texture2D(tSrc, vUv + uDir * x).rgb;
    c = max(c - vec3(thr), vec3(0.0));
    acc += c * w; ws += w;
  }
  gl_FragColor = vec4(acc / ws, 1.0);
}`;
var eA = `${Js}
uniform sampler2D tPrev, tLum, tDepth; uniform vec2 uSunUv; uniform float uSunOn, uRate, uVisRate, uAspect;
void main(){
  float ls = 0.0, ws = 0.0;
  for (int y = 0; y < 5; y++) for (int x = 0; x < 7; x++) {
    vec2 uv = (vec2(float(x), float(y)) + 0.5) / vec2(7.0, 5.0);
    vec2 c = uv - 0.5;
    float w = 1.0 - 0.75 * smoothstep(0.1, 0.55, length(c));       // centre-weighted metering
    float l = luma(texture2D(tLum, uv).rgb);
    ls += log(max(l, 1e-4)) * w; ws += w;
  }
  float avg = clamp(exp(ls / ws), 0.002, 40.0);
  float vis = 0.0;
  for (int i = 0; i < 12; i++) {
    float r = sqrt((float(i) + 0.5) / 12.0) * 0.011; float th = float(i) * 2.39996323;
    vec2 uv = uSunUv + vec2(cos(th) / uAspect, sin(th)) * r;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) vis += 1.0;
    else vis += step(0.99999, texture2D(tDepth, uv).r);
  }
  vis = vis / 12.0 * uSunOn;
  vec4 prev = texture2D(tPrev, vec2(0.5));
  float a = mix(prev.r, avg, uRate);
  if (!(a > 0.0) || a > 1e4) a = avg;                                 // NaN / first-frame guard
  float v = mix(prev.g, vis, uVisRate);
  if (!(v >= 0.0)) v = vis;
  gl_FragColor = vec4(a, v, 0.0, 1.0);
}`;
var tA = `${Js}
${Ug}
uniform float uAspect;
void main(){
  vec2 p = vUv * vec2(uAspect, 1.0);
  float acc = 0.0;
  for (int i = 0; i < 70; i++) {
    float fi = float(i);
    vec2 c = vec2(hash12(vec2(fi, 1.7)), hash12(vec2(fi, 9.2))) * vec2(uAspect, 1.0);
    float sz = mix(0.012, 0.085, pow(hash12(vec2(fi, 4.4)), 3.0));
    float r = length(p - c) / sz;
    float disc = smoothstep(1.0, 0.86, r) * (0.35 + 0.65 * smoothstep(0.35, 0.98, r));
    acc += disc * mix(0.15, 0.7, hash12(vec2(fi, 6.1)));
  }
  float smudge = fbm5(vUv * vec2(5.0, 9.0) + 3.0) * fbm3(vUv * 2.3 + 9.0);
  float streaks = pow(n2(vec2(vUv.x * 90.0, vUv.y * 2.0)), 4.0) * 0.25;
  float v = acc * 0.55 + smudge * 0.9 + streaks;
  v *= 0.45 + 0.9 * smoothstep(0.15, 0.75, length(vUv - 0.5));
  gl_FragColor = vec4(vec3(v) * vec3(1.0, 0.96, 0.9), 1.0);
}`;
var nA = `${Js}
uniform sampler2D tScene, tBloom, tBlur, tStreak, tDirt;
${Og}
uniform vec3 uSunCol;
uniform vec2 uSunUv;
uniform float uTime, uAspect, uBloom, uDirt, uStreak, uFlare, uCA, uVignette;
uniform float uDamage, uLowHealth, uAds, uFlash, uFade, uSaturation, uSunOn, uThunder, uAgxMix;

// ---- AgX (Filament/Blender fit, as in three.js) ----
const mat3 SL_REC2020_TO_SRGB = mat3(vec3(1.6605, -0.1246, -0.0182), vec3(-0.5876, 1.1329, -0.1006), vec3(-0.0728, -0.0083, 1.1187));
const mat3 SL_SRGB_TO_REC2020 = mat3(vec3(0.6274, 0.0691, 0.0164), vec3(0.3293, 0.9195, 0.0880), vec3(0.0433, 0.0113, 0.8956));
vec3 slAgxContrast(vec3 x){ vec3 x2 = x * x; vec3 x4 = x2 * x2; return 15.5 * x4 * x2 - 40.14 * x4 * x + 31.96 * x4 - 6.868 * x2 * x + 0.4298 * x2 + 0.1191 * x - 0.00232; }
vec3 slAgx(vec3 color){
  const mat3 inset = mat3(vec3(0.856627153315983, 0.137318972929847, 0.11189821299995), vec3(0.0951212405381588, 0.761241990602591, 0.0767994186031903), vec3(0.0482516061458583, 0.101439036467562, 0.811302368396859));
  const mat3 outset = mat3(vec3(1.1271005818144368, -0.1413297634984383, -0.14132976349843826), vec3(-0.11060664309660323, 1.157823702216272, -0.11060664309660294), vec3(-0.016493938717834573, -0.016493938717834257, 1.2519364065950405));
  const float minEv = -12.47393, maxEv = 4.026069;
  color = inset * (SL_SRGB_TO_REC2020 * color);
  color = clamp((log2(max(color, 1e-10)) - minEv) / (maxEv - minEv), 0.0, 1.0);
  color = slAgxContrast(color);
  // "punchy"-style look: a little more contrast and chroma than the base AgX rendering
  float l = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = pow(max(color, vec3(0.0)), vec3(LOOK_POWER));
  color = l + (color - l) * LOOK_SAT;
  color = outset * color;
  color = pow(max(color, vec3(0.0)), vec3(2.2));
  return clamp(SL_REC2020_TO_SRGB * color, 0.0, 1.0);
}
vec3 slRRTODT(vec3 v){ vec3 a = v * (v + 0.0245786) - 0.000090537; vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081; return a / b; }
vec3 slAces(vec3 c){
  const mat3 inM = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777));
  const mat3 outM = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602));
  return clamp(outM * slRRTODT(inM * (c * 1.3)), 0.0, 1.0);
}
vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c)); }

vec3 flare(vec2 uv, vec2 sun, float vis){
  vec2 asp = vec2(uAspect, 1.0);
  vec2 p = (uv - 0.5) * asp, s = (sun - 0.5) * asp;
  vec2 dv = p - s; float r = length(dv);
  vec3 c = vec3(0.0);
  // veiling glare + a few soft diffraction spikes
  float ang = atan(dv.y, dv.x);
  float spikes = pow(abs(cos(ang * 3.0 + 0.4)), 24.0) + 0.6 * pow(abs(cos(ang * 4.0 - 1.1)), 40.0);
  c += uSunCol * (0.020 / (r * r * 9.0 + 0.010) + 0.10 * exp(-r * 3.2));
  c += uSunCol * spikes * 0.30 * exp(-r * 5.5);
  // ghosts along the sun -> centre axis
  vec3 g = vec3(0.0);
  float k0 = length(p + s * 0.38);  g += vec3(0.30, 0.75, 0.55) * smoothstep(0.085, 0.06, k0) * 0.050;
  float k1 = length(p + s * 0.82);  g += vec3(0.85, 0.45, 0.25) * smoothstep(0.045, 0.030, k1) * 0.075;
  float k2 = length(p + s * 1.35);  g += vec3(0.35, 0.50, 0.95) * smoothstep(0.17, 0.12, k2) * (0.4 + 0.6 * smoothstep(0.05, 0.16, k2)) * 0.040;
  float k3 = length(p - s * 0.45);  g += vec3(0.80, 0.70, 0.35) * smoothstep(0.030, 0.018, k3) * 0.060;
  // halo ring opposite the sun
  float hr = length(p + s * 0.15);
  g += vec3(0.45, 0.55, 0.85) * exp(-pow((hr - 0.52) * 16.0, 2.0)) * 0.035 * smoothstep(0.1, 0.5, length(s));
  c += g * uSunCol * 2.4;
  return c * vis;
}

void main(){
  vec2 c = vUv - 0.5;
  float r2 = dot(c * vec2(uAspect, 1.0), c * vec2(uAspect, 1.0)) / (0.25 * (uAspect * uAspect + 1.0));   // 0 centre .. 1 corner
  vec4 ad = texture2D(tAdapt, vec2(0.5));
  // radial chromatic aberration (tiny; grows a little when hurt)
  vec2 off = c * r2 * (uCA + uDamage * 0.006);
  vec3 col = vec3(texture2D(tScene, vUv + off).r, texture2D(tScene, vUv).g, texture2D(tScene, vUv - off).b);
  // ADS: soften the periphery
  vec3 soft = texture2D(tBlur, vUv).rgb;
  col = mix(col, soft, uAds * 0.75 * smoothstep(0.22, 0.85, r2));
  // bloom (energy conserving mix), lens dirt, anamorphic streak
  vec3 bloom = texture2D(tBloom, vUv).rgb;
  vec3 dirt = texture2D(tDirt, vUv).rgb;
  col = mix(col, bloom, uBloom);
  col += bloom * dirt * uDirt;
  col += texture2D(tStreak, vUv).rgb * vec3(0.45, 0.62, 1.0) * uStreak;
  // sun glare + flare (occlusion-tested)
  float vis = ad.g * uSunOn;
  if (vis > 0.002) { vec3 fl = flare(vUv, uSunUv, vis) * uFlare; col += fl * (1.0 + dirt * 1.5); }
  // exposure: manual * eye adaptation
  col *= slExposure();
  col += vec3(1.0, 0.97, 0.9) * uFlash * 2.5;
  // filmic curve: ACES (Hill fit) for punch and burning oranges, pulled toward AgX so highlights roll off to white
  col = mix(slAces(col), slAgx(col), uAgxMix);

  // ---- grade (display-linear) ----
  float l = luma(col);
  // split tone: teal shadows, warm highlights
  vec3 sh = vec3(0.80, 1.01, 1.13), hi = vec3(1.07, 1.0, 0.90);
  col *= mix(sh, hi, smoothstep(0.03, 0.55, l));
  // gentle S-curve
  col = mix(col, col * col * (3.0 - 2.0 * col), 0.22);
  // lifted, slightly teal blacks
  col = col * 0.988 + vec3(0.006, 0.0085, 0.011);
  // saturation (gameplay driven)
  float sat = uSaturation * (1.0 - 0.65 * uLowHealth) * (1.0 - 0.5 * uDamage);
  l = luma(col);
  col = mix(vec3(l), col, sat);
  // vignette: base + low health + ADS tightening
  float vig = uVignette + uLowHealth * 0.55 + uAds * 0.22;
  float vr = smoothstep(0.15 - uAds * 0.08, 1.05, r2);
  col *= 1.0 - vig * vr * vr * (3.0 - 2.0 * vr) ;
  // damage: red-edged pulse
  float edge = smoothstep(0.18, 1.0, r2);
  col = mix(col, vec3(0.55, 0.02, 0.01) * (0.35 + l), clamp(uDamage * edge * 0.85 + uLowHealth * edge * edge * 0.25 * (0.75 + 0.25 * sin(uTime * 5.0)), 0.0, 1.0));
  col *= 1.0 - uFade;
  col = toSRGB(clamp(col, 0.0, 1.0));
  gl_FragColor = vec4(col, dot(col, vec3(0.299, 0.587, 0.114)));
}`;
var iA = `${Js}
uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uTime, uGrain, uSharpen, uFxaa;
void main(){
  vec4 M = texture2D(tSrc, vUv);
  vec3 col = M.rgb;
  vec4 NW = texture2D(tSrc, vUv + vec2(-1.0, -1.0) * uTexel), NE = texture2D(tSrc, vUv + vec2(1.0, -1.0) * uTexel);
  vec4 SW = texture2D(tSrc, vUv + vec2(-1.0, 1.0) * uTexel), SE = texture2D(tSrc, vUv + vec2(1.0, 1.0) * uTexel);
  float lMin = min(M.a, min(min(NW.a, NE.a), min(SW.a, SE.a)));
  float lMax = max(M.a, max(max(NW.a, NE.a), max(SW.a, SE.a)));
  float contrast = lMax - lMin;
  if (uFxaa > 0.5 && contrast > max(0.0312, lMax * 0.10)) {
    vec2 dir = vec2(-((NW.a + NE.a) - (SW.a + SE.a)), (NW.a + SW.a) - (NE.a + SE.a));
    float dirReduce = max((NW.a + NE.a + SW.a + SE.a) * 0.03125, 0.0078125);
    float rcp = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = clamp(dir * rcp, vec2(-8.0), vec2(8.0)) * uTexel;
    vec4 A = 0.5 * (texture2D(tSrc, vUv + dir * (1.0 / 3.0 - 0.5)) + texture2D(tSrc, vUv + dir * (2.0 / 3.0 - 0.5)));
    vec4 B = A * 0.5 + 0.25 * (texture2D(tSrc, vUv - dir * 0.5) + texture2D(tSrc, vUv + dir * 0.5));
    col = (B.a < lMin || B.a > lMax) ? A.rgb : B.rgb;
  }
  // light unsharp mask, backed off on strong edges (those belong to FXAA)
  vec3 blur = (NW.rgb + NE.rgb + SW.rgb + SE.rgb) * 0.25;
  col += (M.rgb - blur) * uSharpen * (1.0 - smoothstep(0.04, 0.22, contrast));
  // animated, luminance-weighted film grain
  vec2 seed = gl_FragCoord.xy + fract(uTime * vec2(7.31, 3.17)) * vec2(311.7, 173.3);
  float g = hash12(seed) + hash12(seed + 57.3) - 1.0;
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col += g * uGrain * mix(1.0, 0.30, smoothstep(0.25, 0.9, l)) * (0.35 + 0.65 * smoothstep(0.0, 0.08, l));
  // dither against banding in the sky gradients
  col += (hash12(gl_FragCoord.xy * 1.37 + 11.0) + hash12(gl_FragCoord.xy * 0.71 + 3.0) - 1.0) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}`;
function jy(i, e, {
  noiseTex: t
}) {
  let n = new BufferGeometry();
  n.setAttribute("position", new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
  n.setAttribute("uv", new BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2));
  let s = new Mesh(n, null);
  s.frustumCulled = false;
  let o = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  let r = [];
  let a = (oe, fe, le, R = {}) => {
    let I = new ShaderMaterial({
      name: "post-" + oe,
      vertexShader: G6,
      fragmentShader: `${Bg} ${oe}
${fe}`,
      uniforms: le,
      depthTest: false,
      depthWrite: false,
      blending: NoBlending,
      toneMapped: false,
      ...R
    });
    r.push(I);
    return I;
  };
  function l(oe, fe) {
    s.material = oe;
    i.setRenderTarget(fe);
    i.render(s, o);
  }
  let c = HalfFloatType;
  let u = UnsignedByteType;
  let h = LinearFilter;
  let f = NearestFilter;
  let p = (oe = c, fe = h, le = {}) => {
    let R = new WebGLRenderTarget(4, 4, {
      type: oe,
      format: RGBAFormat,
      minFilter: fe,
      magFilter: fe,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false,
      ...le
    });
    R.texture.generateMipmaps = false;
    return R;
  };
  let d = () => e.quality;
  let v = () => ({
    uSunDir: {
      value: SUN.dir.clone()
    },
    uZen: {
      value: e.visualMood ? ENVIRONMENT.zenith.clone().setRGB(...e.visualMood.zenith) : ENVIRONMENT.zenith.clone()
    },
    uHor: {
      value: e.visualMood ? ENVIRONMENT.horizon.clone().setRGB(...e.visualMood.horizon) : ENVIRONMENT.horizon.clone()
    },
    uHorAway: {
      value: e.visualMood ? ENVIRONMENT.horizonAway.clone().setRGB(...e.visualMood.horizonAway) : ENVIRONMENT.horizonAway.clone()
    },
    uSunCol: {
      value: e.visualMood ? SUN.color.clone().setRGB(...e.visualMood.sunColor) : SUN.color.clone()
    }
  });
  let g = {
    volSunScale: .85,
    volAmbient: .2,
    volSigma: .0034,
    volMaxDist: 170,
    volFarHaze: .42,
    volInteriorDust: 6,
    aoRadius: .9,
    aoIntensity: 1.6,
    aoStrength: .95,
    bloom: .065,
    bloomMix: .62,
    dirt: .1,
    streak: .03,
    streakThreshold: 2.2,
    flare: .16,
    key: .12,
    minExposure: .6,
    maxExposure: 2,
    adaptTau: 1.5,
    agxMix: .25,
    ca: .0013,
    vignette: .3,
    grain: .02,
    sharpen: .3,
    lookPower: 1.18,
    lookSat: 1.22
  };
  let x = false;
  try {
    x = !!i.extensions.has("EXT_color_buffer_float");
  } catch {
    x = false;
  }
  let y = {
    scene: p(c, h),
    motion: p(c, h),
    ldr: p(u, h),
    depthHalf: x ? p(FloatType, f, {
      format: RedFormat
    }) : p(c, f),
    aoA: p(u, f),
    aoB: p(u, f),
    volA: p(c, f),
    volB: p(c, f),
    down: [],
    up: [],
    streakA: p(c, h),
    streakB: p(c, h),
    adapt: [p(c, f), p(c, f)],
    dirt: p(u, h),
    depthCopy: null
  };
  let b = 6;
  for (let oe = 0; oe < b; oe++) y.down.push(p(c, h));
  for (let oe = 0; oe < b - 1; oe++) y.up.push(p(c, h));
  y.adapt[0].setSize(1, 1);
  y.adapt[1].setSize(1, 1);
  y.dirt.setSize(512, 288);
  let m = 0;
  let A = 0;
  let _ = false;
  let M = {
    w: 4,
    h: 4,
    hw: 2,
    hh: 2
  };
  let E = {
    tAdapt: {
      value: null
    },
    uExposure: {
      value: 1
    },
    uKey: {
      value: g.key
    },
    uMinE: {
      value: g.minExposure
    },
    uMaxE: {
      value: g.maxExposure
    },
    uAuto: {
      value: 1
    }
  };
  let w = a("depthcopy", q6, {
    tDepth: {
      value: null
    }
  }, {
    depthTest: true,
    depthWrite: true,
    depthFunc: AlwaysDepth,
    colorWrite: false
  });
  let S = a("depthhalf", X6, {
    tDepth: {
      value: null
    },
    uNear: {
      value: .08
    },
    uFar: {
      value: 900
    }
  });
  let z = a("ao", Y6, {
    tDepthHalf: {
      value: y.depthHalf.texture
    },
    uTanHalf: {
      value: new Vector2()
    },
    uTexel: {
      value: new Vector2()
    },
    uRadius: {
      value: g.aoRadius
    },
    uIntensity: {
      value: g.aoIntensity
    },
    uAspect: {
      value: 1
    }
  }, {
    defines: {
      AO_TAPS: 12
    }
  });
  let H = a("vol", $6, {
    tDepthHalf: {
      value: y.depthHalf.texture
    },
    tShadow: {
      value: null
    },
    uShadowMatrix: {
      value: new Matrix4()
    },
    uCamWorld: {
      value: new Matrix4()
    },
    uCamPos: {
      value: new Vector3()
    },
    uSunRad: {
      value: new Vector3()
    },
    uAmb: {
      value: new Vector3()
    },
    uTanHalf: {
      value: new Vector2()
    },
    uHasShadow: {
      value: 0
    },
    uMaxDist: {
      value: g.volMaxDist
    },
    uSigma: {
      value: g.volSigma
    },
    uFarZ: {
      value: 900
    },
    uFarHaze: {
      value: g.volFarHaze
    },
    uFlicker: {
      value: 0
    },
    uBoxDust: {
      value: 0
    },
    uBoxMin: {
      value: new Vector3(1e6, 1e6, 1e6)
    },
    uBoxMax: {
      value: new Vector3(-1e6, -1e6, -1e6)
    },
    ...v()
  }, {
    defines: {
      VOL_STEPS: 16
    }
  });
  let O = a("blur-ao", $y, {
    tSrc: {
      value: null
    },
    tDepthHalf: {
      value: y.depthHalf.texture
    },
    uDir: {
      value: new Vector2()
    }
  }, {
    defines: {
      BLUR_TOL: "0.04"
    }
  });
  let q = a("blur-vol", $y, {
    tSrc: {
      value: null
    },
    tDepthHalf: {
      value: y.depthHalf.texture
    },
    uDir: {
      value: new Vector2()
    }
  }, {
    defines: {
      BLUR_TOL: "0.30"
    }
  });
  let U = a("composite", Z6, {
    tColor: {
      value: null
    },
    tDepth: {
      value: null
    },
    tDepthHalf: {
      value: y.depthHalf.texture
    },
    tAO: {
      value: y.aoA.texture
    },
    tVol: {
      value: y.volA.texture
    },
    uHalfRes: {
      value: new Vector2()
    },
    uNear: {
      value: .08
    },
    uFar: {
      value: 900
    },
    uAoOn: {
      value: 1
    },
    uVolOn: {
      value: 1
    },
    uAoStrength: {
      value: g.aoStrength
    },
    ...E
  });
  let T = a("motion", j6, {
    tColor: {
      value: y.scene.texture
    },
    tDepth: {
      value: null
    },
    uInvViewProj: {
      value: new Matrix4()
    },
    uPrevViewProj: {
      value: new Matrix4()
    },
    uShutter: {
      value: .5
    },
    uRes: {
      value: new Vector2()
    }
  });
  let D = a("down", J6, {
    tSrc: {
      value: null
    },
    uTexel: {
      value: new Vector2()
    },
    uFirst: {
      value: 0
    }
  });
  let C = a("up", K6, {
    tLow: {
      value: null
    },
    tHigh: {
      value: null
    },
    uTexel: {
      value: new Vector2()
    },
    uMix: {
      value: g.bloomMix
    }
  });
  let G = a("streak", Q6, {
    tSrc: {
      value: null
    },
    uDir: {
      value: new Vector2()
    },
    uThreshold: {
      value: 0
    },
    ...E
  });
  let j = a("adapt", eA, {
    tPrev: {
      value: null
    },
    tLum: {
      value: null
    },
    tDepth: {
      value: null
    },
    uSunUv: {
      value: new Vector2(.5, .5)
    },
    uSunOn: {
      value: 0
    },
    uRate: {
      value: 1
    },
    uVisRate: {
      value: 1
    },
    uAspect: {
      value: 1
    }
  });
  let N = a("dirt", tA, {
    tNoise: {
      value: t
    },
    uAspect: {
      value: 16 / 9
    }
  });
  let Q = a("grade", nA, {
    tScene: {
      value: null
    },
    tBloom: {
      value: y.up[0].texture
    },
    tBlur: {
      value: y.down[1].texture
    },
    tStreak: {
      value: y.streakB.texture
    },
    tDirt: {
      value: y.dirt.texture
    },
    ...E,
    uSunCol: {
      value: SUN.color.clone()
    },
    uSunUv: {
      value: new Vector2(.5, .5)
    },
    uTime: {
      value: 0
    },
    uAspect: {
      value: 1
    },
    uBloom: {
      value: g.bloom
    },
    uDirt: {
      value: g.dirt
    },
    uStreak: {
      value: g.streak
    },
    uFlare: {
      value: g.flare
    },
    uCA: {
      value: g.ca
    },
    uVignette: {
      value: g.vignette
    },
    uDamage: {
      value: 0
    },
    uLowHealth: {
      value: 0
    },
    uAds: {
      value: 0
    },
    uFlash: {
      value: 0
    },
    uFade: {
      value: 0
    },
    uSaturation: {
      value: 1
    },
    uSunOn: {
      value: 0
    },
    uThunder: {
      value: 0
    },
    uAgxMix: {
      value: g.agxMix
    }
  }, {
    defines: {
      LOOK_POWER: g.lookPower.toFixed(3),
      LOOK_SAT: g.lookSat.toFixed(3)
    }
  });
  let K = a("final", iA, {
    tSrc: {
      value: y.ldr.texture
    },
    uTexel: {
      value: new Vector2()
    },
    uTime: {
      value: 0
    },
    uGrain: {
      value: g.grain
    },
    uSharpen: {
      value: g.sharpen
    },
    uFxaa: {
      value: 1
    }
  });
  let ie = new Matrix4();
  let F = new Matrix4();
  let X = new Matrix4();
  let ne = new Vector3();
  let re = new Vector3();
  let $ = false;
  function ue() {
    let oe = Math.max(6, d().volSteps | 0);
    let fe = d().name === "test" || d().name === "low" ? 8 : d().name === "ultra" ? 16 : 12;
    H.defines.VOL_STEPS !== oe && (H.defines.VOL_STEPS = oe, H.needsUpdate = true);
    z.defines.AO_TAPS !== fe && (z.defines.AO_TAPS = fe, z.needsUpdate = true);
  }
  function me(oe, fe) {
    if (oe = Math.max(8, oe | 0), fe = Math.max(8, fe | 0), M.w = oe, M.h = fe, M.hw = Math.max(4, Math.ceil(oe / 2)), M.hh = Math.max(4, Math.ceil(fe / 2)), y.scene.setSize(oe, fe), y.motion.setSize(oe, fe), y.ldr.setSize(oe, fe), y.depthCopy) {
      y.depthCopy.setSize(oe, fe);
      let I = y.depthCopy.depthTexture.image;
      (I.width !== oe || I.height !== fe) && (I.width = oe, I.height = fe, y.depthCopy.depthTexture.needsUpdate = true);
    }
    for (let I of [y.depthHalf, y.aoA, y.aoB, y.volA, y.volB]) I.setSize(M.hw, M.hh);
    let le = M.hw;
    let R = M.hh;
    for (let I = 0; I < b; I++) {
      y.down[I].setSize(le, R);
      I < b - 1 && y.up[I].setSize(le, R);
      le = Math.max(2, le >> 1);
      R = Math.max(2, R >> 1);
    }
    y.streakA.setSize(y.down[2].width, y.down[2].height);
    y.streakB.setSize(y.down[2].width, y.down[2].height);
    $ = false;
    ue();
  }
  function ee() {
    if (!y.depthCopy) {
      let oe = new DepthTexture(M.w, M.h);
      oe.type = UnsignedIntType;
      oe.minFilter = oe.magFilter = f;
      y.depthCopy = new WebGLRenderTarget(M.w, M.h, {
        type: u,
        format: RGBAFormat,
        minFilter: f,
        magFilter: f,
        depthBuffer: true,
        stencilBuffer: false,
        depthTexture: oe,
        generateMipmaps: false
      });
      i.setRenderTarget(y.depthCopy);
      i.setClearColor(0, 1);
      i.clear(true, true, false);
      i.setRenderTarget(null);
    }
    return y.depthCopy.depthTexture;
  }
  function B(oe) {
    y.depthCopy && (w.uniforms.tDepth.value = oe, l(w, y.depthCopy));
  }
  function P({
    hdr: oe,
    camera: fe,
    sun: le,
    dt: R,
    post: I,
    exposure: se,
    time: ae,
    fast: k,
    thunder: ce
  }) {
    let ve = d();
    let _e = fe.projectionMatrix.elements;
    let Te = 1 / _e[0];
    let Pe = 1 / _e[5];
    let Re = Te / Pe;
    let Fe = oe.depthTexture;
    E.tAdapt.value = y.adapt[m].texture;
    E.uExposure.value = se;
    E.uAuto.value = J.autoExposure ? 1 : 0;
    E.uKey.value = g.key;
    E.uMinE.value = g.minExposure;
    E.uMaxE.value = g.maxExposure;
    _ || (N.uniforms.uAspect.value = 16 / 9, l(N, y.dirt), _ = true);
    S.uniforms.tDepth.value = Fe;
    S.uniforms.uNear.value = fe.near;
    S.uniforms.uFar.value = fe.far;
    l(S, y.depthHalf);
    let ze = 1 / M.hw;
    let We = 1 / M.hh;
    let Ne = !!ve.ao;
    Ne && (z.uniforms.uTanHalf.value.set(Te, Pe), z.uniforms.uTexel.value.set(ze, We), z.uniforms.uAspect.value = Re, l(z, y.aoA), O.uniforms.tSrc.value = y.aoA.texture, O.uniforms.uDir.value.set(ze, 0), l(O, y.aoB), O.uniforms.tSrc.value = y.aoB.texture, O.uniforms.uDir.value.set(0, We), l(O, y.aoA));
    let dt = (ve.volSteps | 0) > 0;
    if (dt) {
      let be = H.uniforms;
      let Oe = e.level && e.level.interiorBoxes && e.level.interiorBoxes[0];
      Oe ? (be.uBoxMin.value.copy(Oe.min), be.uBoxMax.value.copy(Oe.max), be.uBoxDust.value = g.volInteriorDust) : be.uBoxDust.value = 0;
      let pt = le.shadow && le.shadow.map ? le.shadow.map.texture : null;
      be.tShadow.value = pt;
      be.uHasShadow.value = pt ? 1 : 0;
      pt && be.uShadowMatrix.value.copy(le.shadow.matrix);
      be.uCamWorld.value.copy(fe.matrixWorld);
      be.uCamPos.value.setFromMatrixPosition(fe.matrixWorld);
      be.uTanHalf.value.set(Te, Pe);
      be.uFarZ.value = fe.far;
      let ut = le.intensity * g.volSunScale;
      be.uSunRad.value.set(le.color.r * ut, le.color.g * ut, le.color.b * ut);
      let nn = g.volAmbient * (1 + ce * 1.5);
      const fog = e.visualMood?.fog || [ENVIRONMENT.fog.r, ENVIRONMENT.fog.g, ENVIRONMENT.fog.b];
      be.uAmb.value.set(fog[0] * nn, fog[1] * nn, fog[2] * nn);
      l(H, y.volA);
      q.uniforms.tSrc.value = y.volA.texture;
      q.uniforms.uDir.value.set(ze, 0);
      l(q, y.volB);
      q.uniforms.tSrc.value = y.volB.texture;
      q.uniforms.uDir.value.set(0, We);
      l(q, y.volA);
    }
    {
      let be = U.uniforms;
      be.tColor.value = oe.texture;
      be.tDepth.value = Fe;
      be.uHalfRes.value.set(M.hw, M.hh);
      be.uNear.value = fe.near;
      be.uFar.value = fe.far;
      be.uAoOn.value = Ne ? 1 : 0;
      be.uVolOn.value = dt ? 1 : 0;
      l(U, y.scene);
    }
    let xe = y.scene.texture;
    if (ie.multiplyMatrices(fe.projectionMatrix, fe.matrixWorldInverse), ve.motionBlur && $ && R > 0) {
      let be = T.uniforms;
      be.tDepth.value = Fe;
      be.uInvViewProj.value.copy(X.copy(ie).invert());
      be.uPrevViewProj.value.copy(F);
      be.uShutter.value = Math.min(.5, 1 / 190 / Math.max(R, .001));
      be.uRes.value.set(M.w, M.h);
      l(T, y.motion);
      xe = y.motion.texture;
    }
    if (F.copy(ie), $ = true, ve.bloom) {
      let be = xe;
      let Oe = M.w;
      let pt = M.h;
      for (let bt = 0; bt < b; bt++) {
        D.uniforms.tSrc.value = be;
        D.uniforms.uTexel.value.set(1 / Oe, 1 / pt);
        D.uniforms.uFirst.value = bt === 0 ? 1 : 0;
        l(D, y.down[bt]);
        be = y.down[bt].texture;
        Oe = y.down[bt].width;
        pt = y.down[bt].height;
      }
      let ut = y.down[b - 1];
      for (let bt = b - 2; bt >= 0; bt--) {
        C.uniforms.tLow.value = ut.texture;
        C.uniforms.tHigh.value = y.down[bt].texture;
        C.uniforms.uTexel.value.set(1 / ut.width, 1 / ut.height);
        l(C, y.up[bt]);
        ut = y.up[bt];
      }
      let nn = 1 / y.streakA.width;
      G.uniforms.tSrc.value = y.down[2].texture;
      G.uniforms.uDir.value.set(nn * 1.5, 0);
      G.uniforms.uThreshold.value = g.streakThreshold;
      l(G, y.streakA);
      G.uniforms.tSrc.value = y.streakA.texture;
      G.uniforms.uDir.value.set(nn * 5, 0);
      G.uniforms.uThreshold.value = 0;
      l(G, y.streakB);
    }
    ne.copy(SUN.dir).multiplyScalar(500).add(re.setFromMatrixPosition(fe.matrixWorld)).project(fe);
    fe.getWorldDirection(re);
    let Ie = re.dot(SUN.dir) > .05;
    let Be = Math.max(Math.abs(ne.x), Math.abs(ne.y));
    let Xe = Ie ? 1 - Math.min(1, Math.max(0, (Be - 1) / .3)) : 0;
    let Me = ne.x * .5 + .5;
    let we = ne.y * .5 + .5;
    {
      let be = j.uniforms;
      let Oe = y.adapt[m];
      let pt = y.adapt[1 - m];
      be.tPrev.value = Oe.texture;
      be.tLum.value = ve.bloom ? y.down[b - 1].texture : xe;
      be.tDepth.value = Fe;
      be.uSunUv.value.set(Me, we);
      be.uSunOn.value = Xe;
      be.uAspect.value = Re;
      let ut = A < 2 || k;
      be.uRate.value = ut ? A < 2 ? 1 : .6 : 1 - Math.exp(-R / g.adaptTau);
      be.uVisRate.value = ut ? 1 : 1 - Math.exp(-R / .12);
      l(j, pt);
      m = 1 - m;
      A++;
    }
    {
      let be = Q.uniforms;
      be.tScene.value = xe;
      E.tAdapt.value = y.adapt[m].texture;
      be.uSunUv.value.set(Me, we);
      be.uSunOn.value = Xe;
      be.uAspect.value = Re;
      be.uTime.value = ae;
      be.uBloom.value = ve.bloom ? g.bloom : 0;
      be.uDirt.value = ve.bloom ? g.dirt : 0;
      be.uStreak.value = ve.bloom ? g.streak : 0;
      be.uFlare.value = g.flare;
      be.uAgxMix.value = g.agxMix;
      be.uCA.value = g.ca;
      be.uVignette.value = g.vignette;
      be.uDamage.value = V(I.damage);
      be.uLowHealth.value = V(I.lowHealth);
      be.uAds.value = V(I.ads);
      be.uFlash.value = V(I.flash);
      be.uFade.value = V(I.fade);
      be.uSaturation.value = Number.isFinite(I.saturation) ? I.saturation : 1;
      l(Q, y.ldr);
    }
    {
      let be = K.uniforms;
      be.uTexel.value.set(1 / M.w, 1 / M.h);
      be.uTime.value = ae;
      be.uGrain.value = g.grain;
      be.uSharpen.value = g.sharpen;
      l(K, null);
    }
  }
  let V = oe => oe > 0 ? oe < 1 ? oe : 1 : 0;
  function Y() {
    for (let fe of r) fe.dispose();
    let oe = [y.scene, y.motion, y.ldr, y.depthHalf, y.aoA, y.aoB, y.volA, y.volB, y.streakA, y.streakB, y.dirt, ...y.down, ...y.up, ...y.adapt];
    y.depthCopy && oe.push(y.depthCopy);
    for (let fe of oe) fe.dispose();
  }
  let L = new Uint16Array(4);
  function Z() {
    try {
      i.readRenderTargetPixels(y.adapt[m], 0, 0, 1, 1, L);
      let oe = DataUtils.fromHalfFloat(L[0]);
      let fe = Math.min(g.maxExposure, Math.max(g.minExposure, Math.pow(g.key / Math.max(oe, 1e-4), .85)));
      return {
        lum: +oe.toFixed(4),
        auto: +fe.toFixed(3),
        sunVis: +DataUtils.fromHalfFloat(L[1]).toFixed(2)
      };
    } catch {
      return null;
    }
  }
  let J = {
    readAdapt: Z,
    run: P,
    resize: me,
    copyDepth: B,
    ensureDepthCopy: ee,
    applyQuality: ue,
    dispose: Y,
    materials: r,
    rt: y,
    size: M,
    TUNE: g,
    autoExposure: true,
    pass: l,
    quad: s,
    fsCam: o
  };
  return J;
}
var Jy = 2;
var Ky = 1;
async function createRenderer(i) {
  let e = i.params || {};
  const mood = resolveVisualMood(i.mood?.visual, { ...e, bench: e.bench || globalThis.location?.hash === '#bench' });
  i.visualMood = mood;
  let t = document.getElementById("view");
  let n = new WebGLRenderer({
    canvas: t,
    antialias: false,
    powerPreference: "high-performance",
    alpha: false,
    depth: true,
    stencil: false
  });
  n.outputColorSpace = SRGBColorSpace;
  n.toneMapping = NoToneMapping;
  n.toneMappingExposure = 1;
  n.shadowMap.enabled = true;
  n.shadowMap.type = PCFShadowMap;
  n.shadowMap.autoUpdate = false;
  n.autoClear = false;
  n.info.autoReset = false;
  n.setClearColor(0, 1);
  let s = n.getContext();
  let o = {
    post: false,
    shadow: false,
    sky: false,
    other: 0
  };
  n.debug.onShaderError = (ie, F, X, ne) => {
    let re = "";
    let $ = "";
    try {
      re = ie.getShaderSource(ne) || "";
      $ = (ie.getShaderInfoLog(ne) || "") + " " + (ie.getShaderInfoLog(X) || "") + " " + (ie.getProgramInfoLog(F) || "");
    } catch {}
    let ue = "material";
    re.includes(Bg) ? (o.post = true, ue = "post pass " + (re.match(/SALTLINE_POST (\S+)/) || [])[1]) : re.includes("SALTLINE_SKY") ? (o.sky = true, ue = "sky") : re.includes(Yy) ? (o.shadow = true, ue = "material (soft shadow chunk active)") : o.other++;
    console.error(`[render] shader error in ${ue}: ${$.trim().slice(0, 700)}`);
  };
  let r = new Scene();
  let a = new PerspectiveCamera(PLAYER.fov, 16 / 9, .08, 900);
  a.layers.set(WORLD_LAYER);
  a.rotation.order = "YXZ";
  r.add(a);
  let l = new PerspectiveCamera(PLAYER.viewFov, 16 / 9, .01, 10);
  l.layers.set(VIEWMODEL_LAYER);
  let c = Oy();
  let u = Hy(c);
  if (mood) {
    u.material.uniforms.uZen.value.setRGB(...mood.zenith);
    u.material.uniforms.uHor.value.setRGB(...mood.horizon);
    u.material.uniforms.uHorAway.value.setRGB(...mood.horizonAway);
    u.material.uniforms.uSunCol.value.setRGB(...mood.sunColor);
  }
  r.add(u.mesh);
  let h = new DirectionalLight(SUN.color, SUN.intensity);
  if (mood) { h.color.setRGB(...mood.sunColor); h.intensity = mood.sunIntensity; }
  h.name = "sun";
  h.castShadow = true;
  let f = Gy(h, new Vector3(-41, -.2, -33), new Vector3(37, 32, 31), new Vector3(-41, -3, -64), new Vector3(72, 36, 34));
  let p = () => Math.min(i.quality.shadow || 2048, n.capabilities.maxTextureSize);
  h.shadow.mapSize.set(p(), p());
  h.shadow.bias = -12e-5;
  h.shadow.normalBias = .02;
  h.shadow.radius = 1;
  h.shadow.autoUpdate = true;
  r.add(h, h.target);
  let d = false;
  try {
    d = qy(f, {
      taps: i.quality.name === "low" ? 10 : 16,
      searchTaps: 8
    });
  } catch (ie) {
    console.warn("[render] soft shadows unavailable: " + ie);
  }
  let v = 6;
  let g = [];
  for (let ie = 0; ie < v; ie++) {
    let F = new PointLight(16777215, 0, 12, 2);
    F.userData = {
      busy: false,
      ttl: 0,
      dur: 0,
      peak: 0,
      persistent: false
    };
    r.add(F);
    g.push(F);
  }
  let x = {
    flash(ie, F = 16763008, X = 30, ne = 10, re = .06) {
      let $ = g.find(ue => !ue.userData.busy) || g.filter(ue => !ue.userData.persistent).sort((ue, me) => ue.userData.ttl - me.userData.ttl)[0];
      $ && ($.position.copy(ie), $.color.set(F), $.distance = ne, $.intensity = X, Object.assign($.userData, {
        busy: true,
        ttl: re,
        dur: re,
        peak: X,
        persistent: false
      }));
    },
    acquire() {
      let ie = g.find(F => !F.userData.busy);
      return ie ? (ie.userData.busy = true, ie.userData.persistent = true, ie.intensity = 0, {
        light: ie,
        release() {
          ie.userData.busy = false;
          ie.userData.persistent = false;
          ie.intensity = 0;
        }
      }) : null;
    },
    update(ie) {
      for (let F of g) {
        let X = F.userData;
        X.busy && !X.persistent && (X.ttl -= ie, X.ttl <= 0 ? (X.busy = false, F.intensity = 0) : F.intensity = X.peak * (X.ttl / X.dur));
      }
    }
  };
  let y = null;
  try {
    y = Vy(n, u);
    r.environment = y.texture;
    r.environmentIntensity = Jy;
  } catch (ie) {
    console.error("[render] environment capture failed: " + (ie && ie.stack || ie));
  }
  let b = new DepthTexture(4, 4);
  b.type = UnsignedIntType;
  b.minFilter = b.magFilter = NearestFilter;
  let m = new WebGLRenderTarget(4, 4, {
    type: HalfFloatType,
    format: RGBAFormat,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    depthBuffer: true,
    stencilBuffer: false,
    depthTexture: b,
    samples: i.quality.msaa | 0,
    generateMipmaps: false
  });
  let A = null;
  let _ = e.post !== "0";
  if (e.ao === "0" && (i.quality.ao = false), e.vol === "0" && (i.quality.volSteps = 0), e.bloom === "0" && (i.quality.bloom = false), e.mb === "1" && (i.quality.motionBlur = true), _) try {
    A = jy(n, i, {
      noiseTex: c
    });
  } catch (ie) {
    _ = false;
    console.error("[render] post chain failed to initialise, using forward fallback: " + (ie && ie.stack || ie));
  }
  let M = !!(e.shot || e.show);
  let E = false;
  let w = {
    t: 99,
    power: 0,
    value: 0
  };
  i.events && i.events.on && i.events.on("thunder", ie => {
    w.t = 0;
    w.power = Math.min(1, ie && ie.intensity || .6);
    let F = Math.PI * (.55 + Math.random() * .9);
    u.material.uniforms.uFlashDir.value.set(Math.cos(F), .35 + Math.random() * .3, Math.sin(F) * (Math.random() < .5 ? -1 : 1)).normalize();
  });
  let S = {
    scale: 1,
    enabled: !(e.shot || e.show || e.dynres === "0"),
    acc: 0,
    n: 0,
    settle: 3.5,
    upWait: 4,
    upDelay: 4
  };
  function z(ie) {
    if (!S.enabled || !_ || ie > 1500) return;
    if (S.settle -= ie / 1e3, S.upWait -= ie / 1e3, S.settle > 0) {
      S.acc = 0;
      S.n = 0;
      return;
    }
    if (S.acc += ie, S.n++, S.n < 45 && S.acc < 900) return;
    let F = S.acc / S.n;
    S.acc = 0;
    S.n = 0;
    let X = S.scale;
    if (F > 21.5 && X > .6 ? (X = F > 45 ? .6 : Math.max(.6, X - (F > 30 ? .2 : .1)), S.upDelay = Math.min(60, S.upDelay * 2), S.upWait = S.upDelay) : F < 17.4 && X < 1 && S.upWait <= 0 ? (X = Math.min(1, X + .1), S.upWait = 2) : F < 17.4 && X >= 1 && (S.upDelay = 4), X = Math.round(X * 10) / 10, X <= .6 && F > 26) {
      S.floorHits = (S.floorHits || 0) + 1;
      let ne = {
        ultra: "high",
        high: "medium",
        medium: "low"
      }[i.quality.name];
      if (S.floorHits >= 2 && ne && QUALITY_PRESETS[ne]) {
        S.floorHits = 0;
        S.scale = .8;
        S.settle = 2;
        S.upDelay = 4;
        console.log("[render] frame time " + F.toFixed(0) + " ms at minimum scale: dropping quality to " + ne);
        try {
          N.setQuality({
            ...QUALITY_PRESETS[ne]
          });
          i.events.emit("quality:auto", {
            name: ne
          });
        } catch {}
        return;
      }
    } else S.floorHits = 0;
    X !== S.scale && (S.scale = X, S.settle = 1, N.resize());
  }
  let H = [];
  let O = {};
  let q = (ie, F) => {
    O[ie] || (O[ie] = 1, console.error(F));
  };
  let U = {
    calls: 0,
    tris: 0
  };
  let T = 0;
  let D = 0;
  function C() {
    a.updateMatrixWorld(true);
    l.matrixAutoUpdate = false;
    l.matrixWorldAutoUpdate = false;
    l.matrixWorld.copy(a.matrixWorld);
    l.matrixWorldInverse.copy(l.matrixWorld).invert();
  }
  function G() {
    n.toneMapping !== ACESFilmicToneMapping && (n.toneMapping = ACESFilmicToneMapping);
    n.toneMappingExposure = .6 * N.exposure * (1 - Math.min(1, Math.max(0, N.post.fade)));
    n.setRenderTarget(null);
    n.clear();
    n.shadowMap.needsUpdate = true;
    n.render(r, a);
    n.clearDepth();
    n.render(r, l);
  }
  function j(ie) {
    n.toneMapping !== NoToneMapping && (n.toneMapping = NoToneMapping);
    n.toneMappingExposure = 1;
    n.setRenderTarget(m);
    n.clear(true, true, false);
    (i.quality.name === "ultra" || e.shot || (T & 1) === 0 || !h.shadow.map) && (n.shadowMap.needsUpdate = true);
    n.render(r, a);
    E && (A.copyDepth(b), n.setRenderTarget(m));
    s.depthRange(0, .05);
    let F = r.environmentIntensity;
    let X = r.environment;
    let ne = N.interiorEnv && i.level && i.level.interiorBoxes && i.level.interiorBoxes[0];
    let re = !!(ne && ne.min && a.position.x > ne.min.x && a.position.x < ne.max.x && a.position.z > ne.min.z && a.position.z < ne.max.z && a.position.y < ne.max.y);
    re && (r.environment = N.interiorEnv);
    r.environmentIntensity = F * (re ? Ky / Jy : 1) * (N.viewFill || 1.35);
    try {
      n.render(r, l);
    } finally {
      s.depthRange(0, 1);
      r.environmentIntensity = F;
      r.environment = X;
    }
    if (A.run({
      hdr: m,
      camera: a,
      sun: h,
      dt: ie,
      post: N.post,
      exposure: N.exposure,
      time: i.time ? i.time.t : T / 60,
      fast: M,
      thunder: w.value
    }), n.setRenderTarget(null), o.post) throw new Error("a post shader failed to compile");
  }
  let N = {
    renderer: n,
    scene: r,
    camera: a,
    viewCamera: l,
    sun: h,
    sky: u.mesh,
    sunDir: SUN.dir.clone(),
    lightPool: x,
    post: {
      damage: 0,
      lowHealth: 0,
      ads: 0,
      flash: 0,
      fade: 0,
      saturation: mood?.saturation ?? 1,
      focusDist: 0,
      shake: 0,
      wet: 1
    },
    exposure: mood?.exposure ?? 1,
    env: y ? y.texture : null,
    interiorEnv: null,
    resolution: new Vector2(4, 4),
    depthTextureIsLive: false,
    tune: A ? A.TUNE : {},
    get advanced() {
      return _;
    },
    get autoExposure() {
      return A ? A.autoExposure : false;
    },
    set autoExposure(ie) {
      A && (A.autoExposure = !!ie);
    },
    get depthTexture() {
      if (!A) return null;
      E = true;
      try {
        return A.ensureDepthCopy();
      } catch {
        return null;
      }
    },
    addPrePass(ie) {
      H.push(ie);
    },
    renderWorld(ie, F) {
      let X = n.getRenderTarget();
      let ne = n.shadowMap.needsUpdate;
      let re = n.toneMapping;
      let $ = n.toneMappingExposure;
      let ue = ie.layers.mask;
      ie.layers.disable(VIEWMODEL_LAYER);
      n.shadowMap.needsUpdate = false;
      n.toneMapping = NoToneMapping;
      n.toneMappingExposure = 1;
      try {
        n.setRenderTarget(F);
        n.clear();
        n.render(r, ie);
      } finally {
        ie.layers.mask = ue;
        n.setRenderTarget(X);
        n.shadowMap.needsUpdate = ne;
        n.toneMapping = re;
        n.toneMappingExposure = $;
      }
    },
    async onLevelReady() {
      n.shadowMap.needsUpdate = true;
      try {
        K();
      } catch (ie) {
        console.error("[render] interior probe failed: " + (ie && ie.stack || ie));
      }
      try {
        if (_ && n.setRenderTarget(m), await n.compileAsync(r, a), N.interiorEnv) {
          let ie = r.environment;
          r.environment = N.interiorEnv;
          try {
            n.compile(r, l);
          } finally {
            r.environment = ie;
          }
        }
      } catch {}
      n.setRenderTarget(null);
      S.settle = 3.5;
      S.acc = 0;
      S.n = 0;
    },
    setQuality(ie) {
      i.quality = ie;
      let F = p();
      h.shadow.mapSize.x !== F && (h.shadow.mapSize.set(F, F), h.shadow.map && (h.shadow.map.dispose(), h.shadow.map = null));
      let X = ie.msaa | 0;
      m.samples !== X && (m.samples = X, m.dispose());
      A && A.applyQuality();
      N.resize();
    },
    resize() {
      let ie = Math.max(2, t.clientWidth || window.innerWidth);
      let F = Math.max(2, t.clientHeight || window.innerHeight);
      let X = Math.min(window.devicePixelRatio || 1, 2);
      let ne = i.quality.scale || 1;
      if (_) {
        n.setPixelRatio(X);
        n.setSize(ie, F, false);
        let re = ne * S.scale;
        let $ = {
          low: 1e6,
          medium: 15e5,
          high: 23e5,
          ultra: 37e5
        }[i.quality.name] || 23e5;
        let ue = ie * X * F * X * re * re;
        ue > $ && (re *= Math.sqrt($ / ue));
        let me = Math.max(16, Math.round(ie * X * re));
        let ee = Math.max(16, Math.round(F * X * re));
        m.setSize(me, ee);
        (b.image.width !== me || b.image.height !== ee) && (b.image.width = me, b.image.height = ee, b.needsUpdate = true);
        A && A.resize(me, ee);
        N.resolution.set(me, ee);
      } else {
        n.setPixelRatio(X * ne);
        n.setSize(ie, F, false);
        N.resolution.set(Math.round(ie * X * ne), Math.round(F * X * ne));
      }
      a.aspect = l.aspect = ie / F;
      a.updateProjectionMatrix();
      l.updateProjectionMatrix();
    },
    frame(ie) {
      let F = performance.now();
      D && z(F - D);
      D = F;
      T++;
      n.info.reset();
      x.update(ie);
      let X = i.time ? i.time.t : T / 60;
      u.material.uniforms.uTime.value = X;
      w.t += ie;
      w.value = w.t < .9 ? w.power * Math.exp(-w.t * 5) * (.55 + .45 * Math.sin(w.t * 47) * Math.sin(w.t * 13 + 1)) * .35 : 0;
      u.material.uniforms.uFlash.value = Math.max(0, w.value);
      C();
      for (let ne of H) try {
        ne(n, r, a);
      } catch (re) {
        q("pre", "[render] pre-pass threw: " + (re && re.stack || re));
      }
      if (_) try {
        j(ie);
      } catch (ne) {
        _ = false;
        try {
          s.depthRange(0, 1);
          n.setRenderTarget(null);
        } catch {}
        console.error("[render] advanced pipeline disabled, falling back to forward rendering: " + (ne && ne.stack || ne));
        N.resize();
      }
      _ || G();
      U = {
        calls: n.info.render.calls,
        tris: n.info.render.triangles
      };
    },
    stats() {
      let ie = n.info;
      return {
        calls: U.calls,
        tris: U.tris,
        geos: ie.memory.geometries,
        tex: ie.memory.textures,
        programs: ie.programs ? ie.programs.length : 0,
        res: [N.resolution.x, N.resolution.y],
        scale: S.scale,
        advanced: _,
        softShadows: d,
        adapt: A && e.shot ? A.readAdapt() : void 0
      };
    }
  };
  let Q = null;
  function K() {
    let ie = i.level && i.level.interiorBoxes;
    if (!ie || !ie.length) return;
    let F = ie[0];
    let X = (F.min.x + F.max.x) / 2;
    let ne = (F.min.z + F.max.z) / 2;
    let re = F.min.y + Math.min(2.4, (F.max.y - F.min.y) * .4);
    if (!Q) {
      let ee = new WebGLCubeRenderTarget(128, {
        type: HalfFloatType,
        generateMipmaps: false
      });
      Q = {
        cubeRT: ee,
        cam: new CubeCamera(.15, 300, ee),
        pmrem: new PMREMGenerator(n),
        out: null
      };
      Q.cam.layers.set(WORLD_LAYER);
    }
    Q.cam.position.set(X, re, ne);
    Q.cam.updateMatrixWorld(true);
    let $ = n.toneMapping;
    n.toneMapping = NoToneMapping;
    u.material.uniforms.uEnv.value = 1;
    n.shadowMap.needsUpdate = true;
    try {
      Q.cam.update(n, r);
    } finally {
      u.material.uniforms.uEnv.value = 0;
      n.toneMapping = $;
      n.setRenderTarget(null);
    }
    Q.out && Q.out.dispose();
    Q.out = Q.pmrem.fromCubemap(Q.cubeRT.texture);
    N.interiorEnv = Q.out.texture;
    let ue = 0;
    let me = new Set();
    r.traverse(ee => {
      let B = ee.material ? Array.isArray(ee.material) ? ee.material : [ee.material] : null;
      if (B) for (let P of B) !P || me.has(P) || !P.userData || P.userData.interior !== true || !("envMap" in P) || (me.add(P), P.envMap = N.interiorEnv, P.userData.keepEnvIntensity || (P.envMapIntensity = Ky), P.needsUpdate = true, ue++);
    });
    ue && console.log(`[render] interior probe assigned to ${ue} material(s)`);
  }
  N.captureInteriorProbe = K;
  N.resize();
  window.addEventListener("resize", () => N.resize());
  try {
    let ie = new MeshStandardMaterial({
      color: 8421504
    });
    let F = new Mesh(new BoxGeometry(1, 1, 1), ie);
    F.castShadow = F.receiveShadow = true;
    F.position.set(0, .5, -3);
    r.add(F);
    let X = () => {
      C();
      _ ? j(.016) : G();
    };
    try {
      X();
    } catch (ne) {
      _ && (_ = false, console.error("[render] advanced pipeline failed its self test, using forward fallback: " + (ne && ne.message || ne)));
    }
    if (o.shadow && d) {
      Xy();
      d = false;
      o.shadow = false;
      n.shadowMap.type = PCFSoftShadowMap;
      h.shadow.radius = 2;
      ie.dispose();
      F.material = new MeshStandardMaterial({
        color: 8421505
      });
      console.warn("[render] soft shadow chunk rejected by the driver, using stock PCF");
      try {
        X();
      } catch {
        _ = false;
      }
    }
    if (o.sky && console.error("[render] sky shader failed to compile"), r.remove(F), F.geometry.dispose(), ie.dispose(), F.material.dispose(), !_) {
      try {
        s.depthRange(0, 1);
        n.setRenderTarget(null);
      } catch {}
      N.resize();
    }
    T = 0;
  } catch (ie) {
    console.error("[render] self test threw: " + (ie && ie.stack || ie));
  }
  return N;
}
function showcaseRenderer(i) {
  let e = new Group();
  e.name = "render-showcase";
  let t = h => (e.add(h), h);
  let n = new SphereGeometry(.42, 48, 24);
  for (let h = 0; h < 2; h++) for (let f = 0; f < 7; f++) {
    let p = new MeshStandardMaterial({
      color: h ? 12170408 : 8006172,
      roughness: .06 + f * .15,
      metalness: h ? 1 : 0
    });
    let d = new Mesh(n, p);
    d.position.set(-3.6 + f * 1.2, .42 + h * 1.05, h * -1.1);
    d.castShadow = d.receiveShadow = true;
    t(d);
  }
  let s = [["paint_orange", -5.2, 1.4, 1.3, 1.2, 2.2], ["steel_worn", 4.6, 1, .9, 1, 1.6], ["paint_teal", 5.6, .6, 2.4, .9, 3.6], ["concrete", -2.2, .5, .5, 2.6, 3.2]];
  for (let [h, f, p, d, v, g] of s) {
    let x = createMesh(beveledBoxGeometry(p, d, v, .03, "bottom"), i.mats.get(h));
    x.position.set(f, 0, g);
    x.rotation.y = f * .2;
    t(x);
  }
  for (let h = 0; h < 5; h++) {
    let f = createMesh(beveledBoxGeometry(.5, .5, .5, .02, "bottom"), i.mats.get("wood_pallet"));
    f.position.set(.5 + h * .52, 0, 3.4 + h % 2 * .04);
    t(f);
  }
  {
    let h = createMesh(beveledBoxGeometry(.5, .5, .5, .02, "bottom"), i.mats.get("wood_pallet"));
    h.position.set(1.3, .5, 3.42);
    h.rotation.y = .3;
    t(h);
  }
  let o = i.mats.get("concrete_dirty");
  let r = 9;
  let a = 7.5;
  let l = [[-14, -5.2], [-4.7, -1.6], [-1.1, 1.9], [2.4, 5.6], [6.3, 14]];
  for (let [h, f] of l) {
    let p = createMesh(boxGeometry(.4, a, f - h, "bottom"), o);
    p.position.set(r, 0, (h + f) / 2);
    t(p);
  }
  {
    let h = createMesh(boxGeometry(.4, 1.2, 28, "bottom"), o);
    h.position.set(r, a, 0);
    t(h);
  }
  let c = [[-12, 0, -9, 6, 4, .3], [-12, 0, -3, 6, 4, .3], [-15, 0, -6, .3, 4, 6.3], [-12, 4, -6, 6.6, .3, 6.6]];
  for (let [h, f, p, d, v, g] of c) {
    let x = createMesh(boxGeometry(d, v, g, "bottom"), i.mats.get("steel_dark"));
    x.position.set(h, f, p);
    t(x);
  }
  {
    let h = new Mesh(boxGeometry(2.4, .06, .06), i.mats.emissive(16756832, 14));
    h.position.set(-12, 3.6, -6);
    t(h);
  }
  {
    let h = new Mesh(new SphereGeometry(.06, 12, 8), i.mats.emissive(16726560, 30));
    h.position.set(4.6, 1.02, 1.6);
    t(h);
  }
  i.scene.add(e);
  return {
    cam: [-8.5, 1.7, 4.2],
    target: [3, 1.5, .4],
    update: () => {
      let h = i.render.post;
      let f = Math.round(i.camera.position.y * 1e3) % 10;
      h.damage = f === 1 ? .8 : 0;
      h.lowHealth = f === 2 ? .85 : 0;
      h.ads = f === 3 ? 1 : 0;
      h.flash = f === 4 ? .35 : 0;
      h.fade = f === 5 ? .5 : 0;
    }
  };
}
export { createRenderer };
export { showcaseRenderer };
