// Galería de zonas comunes: una imagen se disuelve en la siguiente como si fuera líquida.
import { calidadAdaptativa, esMovil, resolucionInicial } from './calidadGL';
import { LinearFilter, LinearSRGBColorSpace, Mesh, NoColorSpace, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Texture, TextureLoader, WebGLRenderer } from 'three';

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uA, uB;
  uniform float uMix, uAspect, uImgA, uImgB, uFocusA, uFocusB, uZoomA, uZoomB, uTime, uWater;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < OCTAVAS; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
  vec2 cover(vec2 v, float img, float foco, float zoom) {
    vec2 vis = uAspect > img ? vec2(1.0, img / uAspect) : vec2(uAspect / img, 1.0);
    vis /= zoom;
    vec2 c = vec2(clamp(foco, vis.x * 0.5, 1.0 - vis.x * 0.5), 0.5);
    return c + (v - 0.5) * vis;
  }
  void main() {
    vec2 v = vec2(vUv.x, 1.0 - vUv.y);
    float n = fbm(v * vec2(3.2 * max(uAspect, 1.0), 3.2) + 4.0);
    // Frente irregular que avanza de abajo hacia arriba, como una marea.
    float front = uMix * 1.7 - 0.35;
    float m = smoothstep(front - 0.18, front + 0.18, 1.0 - v.y * 0.6 + (n - 0.5) * 0.9 - 0.2);
    m = 1.0 - m;
    float push = sin(m * 3.14159);
    vec2 d = vec2(n - 0.5, n - 0.5) * 0.16 * push;
    vec2 ua = cover(v + d, uImgA, uFocusA, uZoomA);
    vec2 ub = cover(v - d, uImgB, uFocusB, uZoomB);
    if (uWater > 0.0) {
      // Solo se mueve el agua: tonos azules intensos en la mitad baja de la imagen.
      vec3 base = texture2D(uA, ua).rgb;
      float w = smoothstep(0.1, 0.32, base.b - base.r) * smoothstep(0.5, 0.62, ua.y) * uWater;
      ua += w * 0.0035 * vec2(sin(ua.y * 90.0 + uTime * 1.6) + sin(ua.x * 60.0 - uTime * 1.1), cos(ua.x * 70.0 + uTime * 1.3));
    }
    gl_FragColor = vec4(mix(texture2D(uA, ua).rgb, texture2D(uB, ub).rgb, m), 1.0);
  }
`;

export type EscenaGaleria = { setEstado(actual: number, siguiente: number, mezcla: number, avance: number): void; lista(i: number): boolean; setTiempo(t: number): void; resize(): void; render(): void; dispose(): void };

export async function crearGaleria(opts: { canvas: HTMLCanvasElement; urls: string[]; focos: number[] }): Promise<EscenaGaleria> {
  const { canvas, urls, focos } = opts;
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = LinearSRGBColorSpace;
  renderer.setPixelRatio(resolucionInicial());
  const medir = calidadAdaptativa(renderer, canvas);
  const movil = esMovil();

  const loader = new TextureLoader();
  const cache = new Map<number, Promise<Texture>>();
  const listas = new Map<number, Texture>();
  const cargar = (i: number) => {
    if (i < 0 || i >= urls.length) return;
    if (!cache.has(i)) {
      cache.set(i, loader.loadAsync(urls[i]).then(t => {
        t.flipY = false; t.colorSpace = NoColorSpace; t.minFilter = LinearFilter; t.magFilter = LinearFilter; t.generateMipmaps = false; t.needsUpdate = true;
        renderer.initTexture(t);
        listas.set(i, t);
        render();
        return t;
      }));
    }
  };

  const primera = await loader.loadAsync(urls[0]);
  primera.flipY = false; primera.colorSpace = NoColorSpace; primera.minFilter = LinearFilter; primera.magFilter = LinearFilter; primera.generateMipmaps = false; primera.needsUpdate = true;
  listas.set(0, primera);
  cache.set(0, Promise.resolve(primera));

  const u = {
    uA: { value: primera as Texture }, uB: { value: primera as Texture }, uMix: { value: 0 }, uAspect: { value: 1 }, uImgA: { value: 16 / 9 }, uImgB: { value: 16 / 9 },
    uFocusA: { value: 0.5 }, uFocusB: { value: 0.5 }, uZoomA: { value: 1.08 }, uZoomB: { value: 1.08 }, uTime: { value: 0 }, uWater: { value: 0 },
  };
  const material = new ShaderMaterial({ defines: { OCTAVAS: movil ? 3 : 4 }, vertexShader: VERT, fragmentShader: FRAG, uniforms: u, depthTest: false, depthWrite: false });
  const geometry = new PlaneGeometry(2, 2);
  const scene = new Scene();
  scene.add(new Mesh(geometry, material));
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const aspecto = (t: Texture) => { const im = t.image as HTMLImageElement; return im.width / im.height; };
  const render = () => renderer.render(scene, camera);
  const n = urls.length;
  let ia = 0, ib = 0, mezcla = 0, avance = 0, ancho = 0, alto = 0;

  const aplicar = () => {
    [ia, ib, (ib + 1) % n].forEach(cargar);
    const a = listas.get(ia) ?? primera;
    const b = listas.get(ib) ?? a;
    u.uA.value = a; u.uB.value = b;
    u.uImgA.value = aspecto(a); u.uImgB.value = aspecto(b);
    u.uFocusA.value = focos[ia]; u.uFocusB.value = focos[ib];
    // Acercamiento lento: la imagen entrante termina con el zoom con que arranca su turno.
    u.uZoomA.value = 1.12 - 0.08 * avance; u.uZoomB.value = 1.2 - 0.08 * mezcla;
    u.uMix.value = b === a ? 0 : mezcla;
    u.uWater.value = ia === 0 && !movil ? 1 : 0; // En teléfonos se ahorra el agua animada.
  };

  const onLost = (e: Event) => e.preventDefault();
  canvas.addEventListener('webglcontextlost', onLost);
  const api: EscenaGaleria = {
    setEstado(a, b, m, f) { ia = a; ib = b; mezcla = m; avance = f; aplicar(); },
    lista: i => { cargar(i); return listas.has(i); },
    setTiempo(t) { u.uTime.value = t; },
    resize() {
      const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
      if (w === ancho && h === alto) return;
      ancho = w; alto = h;
      u.uAspect.value = w / h;
      renderer.setSize(w, h, false);
    },
    render() { medir(performance.now()); render(); },
    dispose() {
      canvas.removeEventListener('webglcontextlost', onLost);
      listas.forEach(t => t.dispose());
      material.dispose(); geometry.dispose(); renderer.dispose();
    },
  };
  api.resize();
  aplicar();
  return api;
}
