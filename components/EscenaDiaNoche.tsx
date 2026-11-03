'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { EscenaTorre } from './torreGL';
import { ramp, sinMovimiento, soportaEfectos, useCerca } from './useCerca';
import s from './Escenas.module.css';

const MOVIL = '(max-aspect-ratio: 1/1)';

export type Beat = { desde: number; hasta: number; contenido: ReactNode };

type Props = {
  etiqueta: string;
  base: string;
  /** Alto total de la sección, en pantallas. */
  alto: number;
  beats: Beat[];
  /** Cómo aparece la escena: una ventana que se abre, o fundida sobre la anterior. */
  entrada: 'ventana' | 'fundido';
  /** La siguiente escena se monta encima durante la última pantalla. */
  conSalida?: boolean;
  /** true: va de la noche al día. */
  amanecer?: boolean;
  mapaMovil: [number, number];
  foco: { escritorio: number; movil: number };
  cam: { low: number; high: number };
  alt: { dia: string; noche: string };
  fondo?: string;
};

export default function EscenaDiaNoche(p: Props) {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const nightImg = useRef<HTMLDivElement>(null);
  const beats = useRef<(HTMLDivElement | null)[]>([]);
  const cerca = useCerca(root);
  const [gl, setGl] = useState(false);

  const { entrada, conSalida, amanecer, mapaMovil, foco, cam, base } = p;
  const ventanas = p.beats.map(b => [b.desde, b.hasta] as const);
  const clave = JSON.stringify(ventanas);

  useEffect(() => {
    if (!cerca) return;
    const el = root.current;
    const pinEl = pin.current;
    if (!el || !pinEl || sinMovimiento()) return;
    const tramos = JSON.parse(clave) as [number, number][];

    let scene: EscenaTorre | null = null;
    let disposed = false;
    let raf = 0;
    let target = 0;
    let current = -1;
    let enter = 1;
    const ptr = { x: 0, y: 0, cx: 0, cy: 0 };
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const luzDe = (v: number) => (amanecer ? 1 - ramp(0.22, 0.86, v) : v);

    const readScroll = () => {
      const r = el.getBoundingClientRect();
      const vh = pinEl.offsetHeight || window.innerHeight;
      const span = r.height - vh;
      if (entrada === 'fundido') {
        enter = ramp(0, 1, -r.top / vh);
        const useful = span - vh - (conSalida ? vh : 0);
        target = Math.min(1, Math.max(0, (-r.top - vh) / useful));
      } else {
        enter = ramp(0, 1, 1 - r.top / vh);
        const useful = span - (conSalida ? vh : 0);
        target = Math.min(1, Math.max(0, -r.top / useful));
      }
    };

    const paintDom = (v: number) => {
      beats.current.forEach((b, i) => {
        if (!b) return;
        const [a, z] = tramos[i];
        const gate = entrada === 'ventana' ? ramp(0.55, 1, enter) : ramp(0.7, 1, enter);
        const o = ramp(a, a + 0.07, v) * (1 - ramp(z - 0.07, z, v)) * (a < 0 ? gate : 1);
        b.style.opacity = String(o);
        b.style.transform = `translate3d(0,${(1 - (a < 0 ? gate : ramp(a, a + 0.07, v))) * 22}px,0)`;
        b.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
      });
      if (entrada === 'ventana' && media.current) {
        const i = 1 - enter;
        media.current.style.clipPath = i > 0.001 ? `inset(${i * 16}% ${i * 24}% ${i * 16}% ${i * 24}%)` : 'none';
      }
      if (entrada === 'fundido') {
        pinEl.style.opacity = String(enter);
        pinEl.style.pointerEvents = enter > 0.5 ? 'auto' : 'none';
      }
      if (!scene && nightImg.current) nightImg.current.style.opacity = String(amanecer ? luzDe(v) : ramp(0.2, 0.75, v));
    };

    const tick = () => {
      raf = 0;
      const dp = target - current;
      current = current < 0 || Math.abs(dp) < 0.0004 ? target : current + dp * 0.14;
      const dx = ptr.x - ptr.cx;
      const dy = ptr.y - ptr.cy;
      ptr.cx += dx * 0.06;
      ptr.cy += dy * 0.06;
      paintDom(current);
      if (scene) {
        scene.setProgress(luzDe(current), current);
        scene.setPointer(ptr.cx, ptr.cy);
        scene.render();
      }
      if (current !== target || Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) raf = requestAnimationFrame(tick);
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onScroll = () => { readScroll(); wake(); };
    const onPointer = (e: PointerEvent) => {
      ptr.x = (e.clientX / window.innerWidth) * 2 - 1;
      ptr.y = (e.clientY / window.innerHeight) * 2 - 1;
      wake();
    };
    const onResize = () => { readScroll(); scene?.resize(); current = -1; wake(); };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    if (finePointer) window.addEventListener('pointermove', onPointer, { passive: true });
    readScroll();
    wake();

    if (soportaEfectos() && canvas.current) {
      const c = canvas.current;
      const movil = window.matchMedia(MOVIL).matches;
      import('./torreGL')
        .then(({ crearEscenaTorre }) => crearEscenaTorre({
          canvas: c,
          day: `${base}/dia${movil ? '-movil' : ''}.webp`,
          night: `${base}/noche${movil ? '-movil' : ''}.webp`,
          map: `${base}/mapa.webp`,
          mapX: movil ? mapaMovil : [0, 1],
          focusX: movil ? foco.movil : foco.escritorio,
          cam,
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
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      scene?.dispose();
      setGl(false);
    };
  // cam, foco y mapaMovil son constantes de configuración de cada escena.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cerca, clave, entrada, conSalida, amanecer, base]);

  const style = { '--alto': p.alto, background: p.fondo } as CSSProperties;

  return (
    <section ref={root} className={`${s.scene} ${entrada === 'fundido' ? s.sobre : ''}`} style={style} aria-label={p.etiqueta}>
      <div ref={pin} className={s.pin}>
        <div ref={media} className={s.media}>
          {cerca && (
            <>
              <picture className={s.layer}>
                <source media={MOVIL} srcSet={`${base}/dia-movil.webp`} />
                <img src={`${base}/dia.webp`} alt={p.alt.dia} />
              </picture>
              <div ref={nightImg} className={`${s.layer} ${amanecer ? s.nightFirst : s.nightLayer}`}>
                <picture>
                  <source media={MOVIL} srcSet={`${base}/noche-movil.webp`} />
                  <img src={`${base}/noche.webp`} alt={p.alt.noche} />
                </picture>
              </div>
            </>
          )}
          <canvas ref={canvas} aria-hidden="true" className={`${s.canvas} ${gl ? s.canvasOn : ''}`} />
          <div aria-hidden="true" className={s.scrim} />
        </div>
        <p className={s.nota}>Imágenes de carácter ilustrativo.</p>
        <div className={s.copy}>
          {p.beats.map((b, i) => (
            <div key={i} ref={el => { beats.current[i] = el; }} className={s.beat} style={{ opacity: i === 0 ? 1 : 0 }}>{b.contenido}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
