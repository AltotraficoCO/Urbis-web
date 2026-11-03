'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import type { EscenaTorre } from './torreGL';
import s from './TorreDiaNoche.module.css';

const BASE = '/assets/web/torre';
const PLACEHOLDER = 'data:image/webp;base64,UklGRgoBAABXRUJQVlA4IP4AAABwBQCdASogABgAPu1qr1CppiQiqAqpMB2JZgC7AYuvWjCje4ZsOb4PzWJ7zJrAcixNor7YAPeezntLqk62QrDoNn1Siavh18E4DHrk8U9FVLmpLa85a8T4uNIB815ww3660BUVSh5p/PrpaDvL6Y5Q5va4odcPiqf4UbxXO/2IRDVYOG+UmL1PLC0BiaoPR8CMM40larbLmaLt+wi3mBOZusairGnO0KWJao77hsNfI1sDheZszLUS0uRVN0XwsntYqtOmxV7zuOuTU92yGm7FKZ37wZxYIU1gkYsS+t/ndsYoppigIh2NWuDy9jyTIy0kCXY7KQngHIIMQBgAAA==';
const MOVIL = '(max-aspect-ratio: 1/1)';
// Recorte horizontal de las imágenes -movil respecto a la imagen completa.
const MOVIL_X: [number, number] = [0.225, 0.5];
// Tramos de scroll en que aparece y desaparece cada frase: [entra, sale].
const BEATS: [number, number][] = [[-1, 0.3], [0.34, 0.64], [0.72, 2]];

const ramp = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function soportaWebGL() {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}

// Dispositivos modestos reciben el fundido con imágenes, sin descargar Three.js.
function gamaBaja() {
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return (mem !== undefined && mem <= 2) || (navigator.hardwareConcurrency || 8) <= 2;
}

export default function TorreDiaNoche({ onCta, hideCta }: { onCta(e: MouseEvent<HTMLAnchorElement>): void; hideCta: boolean }) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const nightImg = useRef<HTMLDivElement>(null);
  const beats = useRef<(HTMLDivElement | null)[]>([]);
  const [near, setNear] = useState(false);
  const [gl, setGl] = useState(false);

  // Las imágenes solo se piden cuando el usuario se acerca a la sección.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    // Requiere scroll real: quien solo llena el formulario del hero no descarga nada.
    const check = () => {
      if (window.scrollY > 40 && el.getBoundingClientRect().top < window.innerHeight * 1.5) {
        setNear(true);
        window.removeEventListener('scroll', check);
      }
    };
    window.addEventListener('scroll', check, { passive: true });
    const first = requestAnimationFrame(check); // Página restaurada a mitad de scroll.
    return () => {
      cancelAnimationFrame(first);
      window.removeEventListener('scroll', check);
    };
  }, []);

  useEffect(() => {
    if (!near) return;
    const el = root.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return; // La versión estática la resuelve el CSS.

    let scene: EscenaTorre | null = null;
    let disposed = false;
    let raf = 0;
    let visible = false;
    let target = 0;
    let current = -1;
    const ptr = { x: 0, y: 0, cx: 0, cy: 0 };
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const readScroll = () => {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      target = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
    };

    const paintDom = (p: number) => {
      beats.current.forEach((b, i) => {
        if (!b) return;
        const [a, z] = BEATS[i];
        const o = ramp(a, a + 0.07, p) * (1 - ramp(z - 0.07, z, p));
        b.style.opacity = String(o);
        b.style.transform = `translate3d(0,${(1 - ramp(a, a + 0.07, p)) * 22}px,0)`;
        b.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
      });
      if (!scene && nightImg.current) nightImg.current.style.opacity = String(ramp(0.2, 0.75, p));
    };

    const tick = () => {
      raf = 0;
      if (!visible) return;
      const dp = target - current;
      current = current < 0 || Math.abs(dp) < 0.0004 ? target : current + dp * 0.14;
      const dx = ptr.x - ptr.cx;
      const dy = ptr.y - ptr.cy;
      ptr.cx += dx * 0.06;
      ptr.cy += dy * 0.06;
      paintDom(current);
      if (scene) {
        scene.setProgress(current);
        scene.setPointer(ptr.cx, ptr.cy);
        scene.render();
      }
      if (current !== target || Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) raf = requestAnimationFrame(tick);
    };
    const wake = () => { if (!raf && visible) raf = requestAnimationFrame(tick); };

    const onScroll = () => { readScroll(); wake(); };
    const onPointer = (e: PointerEvent) => {
      ptr.x = (e.clientX / window.innerWidth) * 2 - 1;
      ptr.y = (e.clientY / window.innerHeight) * 2 - 1;
      wake();
    };
    const onResize = () => { readScroll(); scene?.resize(); current = -1; wake(); };

    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) { readScroll(); wake(); }
    });
    io.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    if (finePointer) window.addEventListener('pointermove', onPointer, { passive: true });

    if (soportaWebGL() && !gamaBaja() && canvas.current) {
      const c = canvas.current;
      const movil = window.matchMedia(MOVIL).matches;
      import('./torreGL')
        .then(({ crearEscenaTorre }) => crearEscenaTorre({
          canvas: c,
          day: `${BASE}/dia${movil ? '-movil' : ''}.webp`,
          night: `${BASE}/noche${movil ? '-movil' : ''}.webp`,
          map: `${BASE}/mapa.webp`,
          mapX: movil ? MOVIL_X : [0, 1],
          focusX: movil ? 0.5 : 0.56,
          onContextLost: () => { scene?.dispose(); scene = null; setGl(false); },
        }))
        .then(sc => {
          if (disposed) { sc.dispose(); return; }
          scene = sc;
          setGl(true);
          current = -1;
          readScroll();
          wake();
        })
        .catch(err => console.warn('[Urbis EU] Escena WebGL no disponible; se usa el fundido de imágenes.', err));
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      scene?.dispose();
    };
  }, [near]);

  return (
    <section ref={root} className={s.scene} aria-label="Urbis EU del día a la noche">
      <div className={s.pin}>
        <div className={s.media} style={{ backgroundImage: `url(${PLACEHOLDER})` }}>
          {near && (
            <>
              <picture className={`${s.layer} ${s.dayLayer}`}>
                <source media={MOVIL} srcSet={`${BASE}/dia-movil.webp`} />
                <img src={`${BASE}/dia.webp`} alt="Torre Urbis EU de día, con el barrio Torices y el cerro de fondo" />
              </picture>
              <div ref={nightImg} className={`${s.layer} ${s.nightLayer}`}>
                <picture>
                  <source media={MOVIL} srcSet={`${BASE}/noche-movil.webp`} />
                  <img src={`${BASE}/noche.webp`} alt="Torre Urbis EU al anochecer, con sus ventanas encendidas" />
                </picture>
              </div>
            </>
          )}
          <canvas ref={canvas} aria-hidden="true" className={`${s.canvas} ${gl ? s.canvasOn : ''}`} />
          <div aria-hidden="true" className={s.scrim} />
        </div>

        <div className={s.copy}>
          <div ref={el => { beats.current[0] = el; }} className={s.beat} style={{ opacity: 1 }}>
            <p className={s.eyebrow}><span />URBIS EU · TORICES</p>
            <h2 className={s.title}>Cuando baja el sol, Cartagena <em>cambia de color.</em></h2>
          </div>
          <div ref={el => { beats.current[1] = el; }} className={s.beat} style={{ opacity: 0 }}>
            <p className={s.title}>Y las luces se encienden, <em>una a una.</em></p>
          </div>
          <div ref={el => { beats.current[2] = el; }} className={`${s.beat} ${s.beatLast}`} style={{ opacity: 0 }}>
            <p className={s.title}>Una de ellas <em>puede ser la tuya.</em></p>
            {!hideCta && (
              <a href="#formulario" onClick={onCta} data-track="cta_primary_click" className={s.cta}>
                <span>Quiero recibir información</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </a>
            )}
          </div>
        </div>

        <p className={s.note}>Imágenes de carácter ilustrativo. Son representaciones digitales del diseño y pueden variar en su construcción final.</p>
      </div>
    </section>
  );
}
