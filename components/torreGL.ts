// Escena WebGL de la torre. Se importa de forma diferida desde TorreDiaNoche
// para que Three.js no pese en la carga inicial de la landing.
import { calidadAdaptativa, esMovil, resolucionInicial } from './calidadGL';
import {
  LinearFilter,
  LinearSRGBColorSpace,
  Mesh,
  NoColorSpace,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  TextureLoader,
  Vector2,
  WebGLRenderer,
} from 'three';

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uDay, uNight, uMap;
  uniform float uP;
  uniform vec2 uCenter, uVis, uPointer, uMapX;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < OCTAVAS; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }

  void main() {
    // Coordenadas de imagen con origen arriba a la izquierda.
    vec2 screen = vec2(vUv.x, 1.0 - vUv.y) - 0.5;
    vec2 uv = uCenter + screen * uVis;

    vec3 map = texture2D(uMap, vec2(uMapX.x + uv.x * uMapX.y, uv.y)).rgb;
    float depth = map.r;
    uv += uPointer * (depth - 0.35) * 0.012;
    map = texture2D(uMap, vec2(uMapX.x + uv.x * uMapX.y, uv.y)).rgb;
    float sky = map.g, tower = map.b;

    vec3 day = texture2D(uDay, uv).rgb;
    vec3 night = texture2D(uNight, uv).rgb;

    // Luces de la imagen nocturna: zonas cálidas y brillantes fuera del cielo.
    float luma = dot(night, vec3(0.299, 0.587, 0.114));
    float warm = smoothstep(0.03, 0.2, night.r - night.b);
    float lamp = smoothstep(0.34, 0.68, luma) * warm * (1.0 - sky);
    vec3 unlit = night * (1.0 - lamp * 0.86);

    // Atardecer: el día se calienta antes de empezar a oscurecer.
    float golden = smoothstep(0.02, 0.42, uP);
    vec3 warmDay = mix(day, day * vec3(1.07, 0.9, 0.74), golden * 0.85);

    // El cielo cambia primero, con un frente irregular que transforma las nubes.
    float cloud = fbm(uv * vec2(5.0, 7.0));
    float skyEdge = smoothstep(0.1, 0.62, uP) * 1.5 - 0.25;
    float skyT = smoothstep(cloud - 0.16, cloud + 0.16, skyEdge);

    // La ciudad oscurece de lejos hacia cerca, la torre un poco después.
    float groundT = smoothstep(0.22 + depth * 0.2, 0.58 + depth * 0.2, uP);
    float t = mix(groundT, skyT, sky);
    vec3 col = mix(warmDay, unlit, t);

    // Las luces se encienden por celdas; en la torre, ventana por ventana.
    vec2 grid = mix(vec2(150.0, 112.0), vec2(38.0, 44.0), step(0.5, tower));
    float rnd = hash(floor(uv * grid));
    float start = mix(0.46, 0.9, rnd);
    float on = smoothstep(start, start + 0.05, uP);
    col = mix(col, mix(col, night, on), lamp);

    // Al final la imagen queda exactamente igual a la nocturna original.
    col = mix(col, night, smoothstep(0.95, 1.0, uP));
    gl_FragColor = vec4(mix(day, col, smoothstep(0.0, 0.02, uP)), 1.0);
  }
`;

export type EscenaTorre = {
  /** Luz (0 día, 1 noche) y recorrido de la cámara (0–1). */
  setProgress(luz: number, camara: number): void;
  /** Cursor normalizado en −1…1. */
  setPointer(x: number, y: number): void;
  resize(): void;
  render(): void;
  dispose(): void;
};

function clamp(v: number, a: number, b: number) {
  return Math.min(b, Math.max(a, v));
}

export async function crearEscenaTorre(opts: {
  canvas: HTMLCanvasElement;
  day: string;
  night: string;
  map: string;
  /** Recorte horizontal de la textura respecto al mapa: [inicio, ancho]. */
  mapX: [number, number];
  /** Punto de la imagen (0–1) que se mantiene centrado horizontalmente. */
  focusX: number;
  /** Recorrido vertical de la cámara, como fracción del margen de imagen disponible. */
  cam: { low: number; high: number };
  onContextLost(): void;
}): Promise<EscenaTorre> {
  const { canvas } = opts;
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = LinearSRGBColorSpace; // Sin conversiones: se conserva el color exacto del render.
  renderer.setPixelRatio(resolucionInicial());
  const medir = calidadAdaptativa(renderer, canvas);

  const loader = new TextureLoader();
  const load = async (url: string): Promise<Texture> => {
    const t = await loader.loadAsync(url);
    t.flipY = false;
    t.colorSpace = NoColorSpace;
    t.minFilter = LinearFilter;
    t.magFilter = LinearFilter;
    t.generateMipmaps = false;
    t.needsUpdate = true;
    return t;
  };
  const [day, night, map] = await Promise.all([load(opts.day), load(opts.night), load(opts.map)]);
  const img = day.image as HTMLImageElement;
  const imgAspect = img.width / img.height;

  const uniforms = {
    uDay: { value: day },
    uNight: { value: night },
    uMap: { value: map },
    uP: { value: 0 },
    uCenter: { value: new Vector2(0.5, 0.5) },
    uVis: { value: new Vector2(1, 1) },
    uPointer: { value: new Vector2(0, 0) },
    uMapX: { value: new Vector2(opts.mapX[0], opts.mapX[1]) },
  };
  const material = new ShaderMaterial({ defines: { OCTAVAS: esMovil() ? 3 : 4 }, vertexShader: VERT, fragmentShader: FRAG, uniforms, depthTest: false, depthWrite: false });
  const geometry = new PlaneGeometry(2, 2);
  const scene = new Scene();
  scene.add(new Mesh(geometry, material));
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  let aspect = 1;
  let ancho = 0;
  let alto = 0;
  let progress = 0;

  // Encuadre tipo "cover": la cámara sube por la imagen y se abre a medida que anochece.
  const frame = () => {
    const zoom = 1.1 - 0.07 * progress;
    let visX = 1 / zoom;
    let visY = visX * (imgAspect / aspect);
    if (visY > 1 / zoom) { visY = 1 / zoom; visX = visY * (aspect / imgAspect); }
    const low = 0.5 + (1 - visY) * opts.cam.low;
    const high = 0.5 + (1 - visY) * opts.cam.high;
    const cy = low + (high - low) * progress;
    uniforms.uVis.value.set(visX, visY);
    uniforms.uCenter.value.set(
      clamp(opts.focusX, visX / 2 + 0.008, 1 - visX / 2 - 0.008),
      clamp(cy, visY / 2 + 0.008, 1 - visY / 2 - 0.008),
    );
  };

  const onLost = (e: Event) => { e.preventDefault(); opts.onContextLost(); };
  canvas.addEventListener('webglcontextlost', onLost);

  const scena: EscenaTorre = {
    setProgress(luz, camara) {
      progress = camara;
      uniforms.uP.value = luz;
      frame();
    },
    setPointer(x, y) { uniforms.uPointer.value.set(x, y); },
    resize() {
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      if (w === ancho && h === alto) return; // La barra del navegador móvil dispara resize sin cambiar el canvas.
      ancho = w;
      alto = h;
      aspect = w / h;
      renderer.setSize(w, h, false);
      frame();
    },
    render() { medir(performance.now()); renderer.render(scene, camera); },
    dispose() {
      canvas.removeEventListener('webglcontextlost', onLost);
      day.dispose(); night.dispose(); map.dispose();
      material.dispose(); geometry.dispose(); renderer.dispose();
    },
  };

  scena.resize();
  renderer.initTexture(day);
  renderer.initTexture(night);
  renderer.initTexture(map);
  return scena;
}
