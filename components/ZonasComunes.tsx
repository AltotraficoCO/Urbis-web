'use client';

import { useEffect, useRef, useState } from 'react';
import { ZONAS } from '@/lib/proyecto';
import type { EscenaGaleria } from './galeriaGL';
import { ramp, sinMovimiento, soportaEfectos, useCerca } from './useCerca';
import s from './Escenas.module.css';

const BASE = '/assets/web/zonas';

/** Sobre la escena anterior entra como un sol que se abre; sale encogiéndose hacia la página clara. */
export default function ZonasComunes() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const titulo = useRef<HTMLDivElement>(null);
  const barra = useRef<HTMLSpanElement>(null);
  const caps = useRef<(HTMLDivElement | null)[]>([]);
  const imgs = useRef<(HTMLImageElement | null)[]>([]);
  const cerca = useCerca(root);
  const [modo, setModo] = useState<'gl' | 'img' | null>(null);

  useEffect(() => {
    if (!cerca) return;
    const el = root.current;
    const pinEl = pin.current;
    if (!el || !pinEl) return;
    if (sinMovimiento()) { requestAnimationFrame(() => setModo('img')); return; }

    let scene: EscenaGaleria | null = null;
    let disposed = false;
    let raf = 0;
    let target = 0;
    let current = -1;
    let enter = 0;
    let leave = 0;
    let visible = true;
    const n = ZONAS.length;

    const read = () => {
      const r = el.getBoundingClientRect();
      const vh = pinEl.offsetHeight || window.innerHeight;
      const span = r.height - vh;
      enter = ramp(0, 1, -r.top / vh);
      leave = ramp(0, 1, (-r.top - (span - vh)) / vh);
      target = Math.min(1, Math.max(0, (-r.top - vh) / (span - 2 * vh))) * (n - 1);
      visible = r.bottom > 0 && r.top < vh;
    };

    const paint = (v: number) => {
      const m = media.current;
      if (m) {
        const movil = window.matchMedia('(max-aspect-ratio: 1/1)').matches;
        if (enter < 0.999) m.style.clipPath = `circle(${enter * 120}% at 62% ${movil ? 24 : 28}%)`;
        else if (leave > 0.001) m.style.clipPath = `inset(${leave * 22}% ${leave * 18}% ${leave * 22}% ${leave * 18}% round ${leave * 6}px)`;
        else m.style.clipPath = 'none';
      }
      pinEl.style.pointerEvents = enter > 0.5 ? 'auto' : 'none';
      caps.current.forEach((c, i) => {
        if (!c) return;
        const d = v - i;
        const o = ramp(-0.4, -0.12, d) * (1 - ramp(0.42, 0.72, d)) * (1 - leave);
        c.style.opacity = String(i === 0 ? ramp(0.75, 1, enter) * (1 - ramp(0.42, 0.72, d)) * (1 - leave) : o);
        c.style.transform = `translate3d(0,${(1 - ramp(-0.4, -0.12, d)) * 26 - ramp(0.42, 0.72, d) * 14}px,0)`;
      });
      if (titulo.current) titulo.current.style.opacity = String(ramp(0.75, 1, enter) * (1 - ramp(0.25, 0.6, v)));
      if (barra.current) barra.current.style.transform = `scaleX(${(v + 1) / n})`;
      imgs.current.forEach((im, i) => {
        if (!im || scene) return;
        const d = v - i;
        im.style.opacity = String(i === 0 ? 1 : ramp(-0.45, 0, d));
      });
    };

    const tick = (t: number) => {
      raf = 0;
      const dp = target - current;
      current = current < 0 || Math.abs(dp) < 0.0005 ? target : current + dp * 0.12;
      paint(current);
      if (scene) {
        scene.setPosicion(current);
        scene.setTiempo(t / 1000);
        scene.render();
      }
      // El agua de la piscina se mueve mientras esa imagen está en pantalla.
      const agua = !!scene && current < 0.9 && visible && enter > 0;
      if (current !== target || agua) raf = requestAnimationFrame(tick);
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onScroll = () => { read(); wake(); };
    const onResize = () => { read(); scene?.resize(); current = -1; wake(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    read();
    wake();

    const movil = window.matchMedia('(max-aspect-ratio: 1/1)').matches;
    if (soportaEfectos() && canvas.current) {
      const c = canvas.current;
      import('./galeriaGL')
        .then(({ crearGaleria }) => crearGaleria({
          canvas: c,
          urls: ZONAS.map(z => `${BASE}/${z.slug}${movil ? '-movil' : ''}.webp`),
          focos: ZONAS.map(z => (movil ? z.focoMovil : 0.5)),
        }))
        .then(sc => {
          if (disposed) { sc.dispose(); return; }
          scene = sc;
          setModo('gl');
          current = -1;
          read();
          wake();
        })
        .catch(() => setModo('img'));
    } else {
      requestAnimationFrame(() => setModo('img'));
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      scene?.dispose();
      setModo(null);
    };
  }, [cerca]);

  return (
    <section ref={root} className={`${s.scene} ${s.sobre} ${s.zonas}`} style={{ '--alto': 7.2 } as React.CSSProperties} aria-label="Zonas comunes de Urbis EU">
      <div ref={pin} className={s.pin}>
        <div ref={media} className={s.mediaZonas}>
          {modo === 'img' && ZONAS.map((z, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={z.slug} ref={el => { imgs.current[i] = el; }} className={s.zonaImg} src={`${BASE}/${z.slug}.webp`} alt={z.nombre} loading="lazy" style={{ '--foco': `${z.focoMovil * 100}%`, opacity: i === 0 ? 1 : 0 } as React.CSSProperties} />
          ))}
          <canvas ref={canvas} aria-hidden="true" className={`${s.canvas} ${modo === 'gl' ? s.canvasOn : ''}`} />
          <div aria-hidden="true" className={s.scrimZonas} />
          <div ref={titulo} className={s.zonasTitulo}>
            <p className={s.eyebrow}><span />ZONAS COMUNES</p>
            <h2 className={s.title}>Tu hogar continúa <em>más allá de tu puerta.</em></h2>
          </div>
          <ol className={s.caps}>
            {ZONAS.map((z, i) => (
              <li key={z.slug}>
                <div ref={el => { caps.current[i] = el; }} className={s.cap} style={{ opacity: i === 0 ? 1 : 0 }}>
                  <span className={s.capN}>{String(i + 1).padStart(2, '0')}<small> / {String(ZONAS.length).padStart(2, '0')}</small></span>
                  <h3 className={s.capName}>{z.nombre}</h3>
                  <p className={s.capText}>{z.texto}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className={s.nota}>Imágenes de carácter ilustrativo.</p>
          <div aria-hidden="true" className={s.track}><span ref={barra} /></div>
        </div>
      </div>
    </section>
  );
}
