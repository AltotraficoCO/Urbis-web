'use client';

import { useEffect, useRef, useState, type CSSProperties, type TouchEvent } from 'react';
import { ZONAS } from '@/lib/proyecto';
import type { EscenaGaleria } from './galeriaGL';
import { ramp, sinMovimiento, soportaEfectos, useCerca } from './useCerca';
import s from './Escenas.module.css';

const BASE = '/assets/web/zonas';
const N = ZONAS.length;
const ESPERA = 4200;
const TRANSICION = 1300;
// Parte final de la sección (en pantallas) en que la galería se encoge hacia la página clara.
const SALIDA = 0.8;

const dos = (n: number) => String(n).padStart(2, '0');

/** Galería de una pantalla: las fotos pasan solas; entra como un sol que se abre. */
export default function ZonasComunes() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pie = useRef<HTMLDivElement>(null);
  const barras = useRef<(HTMLElement | null)[]>([]);
  const irA = useRef<(i: number) => void>(() => {});
  const pausa = useRef(false);
  const toque = useRef<number | null>(null);
  const cerca = useCerca(root);
  const [modo, setModo] = useState<'gl' | 'img' | null>(null);
  const [actual, setActual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [yaCambio, setYaCambio] = useState(false);

  useEffect(() => {
    if (!cerca) return;
    const el = root.current;
    const pinEl = pin.current;
    if (!el || !pinEl) return;
    if (sinMovimiento()) { requestAnimationFrame(() => setModo('img')); return; }

    let scene: EscenaGaleria | null = null;
    let disposed = false;
    let raf = 0;
    let enter = 0;
    let leave = 0;
    let visible = false;
    let i = 0;
    let paso: { a: number; b: number; inicio: number } | null = null;
    let turno = performance.now();
    let previo = turno;

    const read = () => {
      const r = el.getBoundingClientRect();
      const vh = pinEl.offsetHeight || window.innerHeight;
      const span = r.height - vh;
      enter = ramp(0, 1, -r.top / vh);
      leave = ramp(0, 1, (-r.top - (span - SALIDA * vh)) / (SALIDA * vh));
      visible = r.bottom > 0 && r.top < vh;
    };

    const paint = () => {
      const m = media.current;
      if (m) {
        if (enter < 0.999) m.style.clipPath = `circle(${enter * 120}% at 62% 28%)`;
        else if (leave > 0.001) m.style.clipPath = `inset(${leave * 22}% ${leave * 18}% ${leave * 22}% ${leave * 18}% round ${leave * 6}px)`;
        else m.style.clipPath = 'none';
      }
      pinEl.style.pointerEvents = enter > 0.5 ? 'auto' : 'none';
      if (pie.current) pie.current.style.opacity = String(ramp(0.8, 1, enter) * (1 - ramp(0, 0.3, leave)));
    };

    const empezar = (b: number, ahora: number) => {
      if (b === i || paso) return;
      if (!scene) { i = b; turno = ahora; setActual(b); setYaCambio(true); return; }
      paso = { a: i, b, inicio: ahora };
    };
    irA.current = b => { empezar(((b % N) + N) % N, performance.now()); wake(); };

    const tick = (ahora: number) => {
      raf = 0;
      paint();
      const dt = ahora - previo;
      previo = ahora;
      // No corre el turno si está en pausa o la galería aún no ocupa la pantalla.
      if (pausa.current || enter < 0.9 || leave > 0.5) turno += dt;
      const avance = Math.min(1, (ahora - turno) / (ESPERA + TRANSICION));
      if (!paso && ahora - turno >= ESPERA) {
        const b = (i + 1) % N;
        if (!scene || scene.lista(b)) empezar(b, ahora);
      }
      if (paso && scene && !scene.lista(paso.b)) paso.inicio = ahora;
      let mezcla = 0;
      if (paso) {
        const t = Math.min(1, (ahora - paso.inicio) / TRANSICION);
        mezcla = t * t * (3 - 2 * t);
        if (t >= 1) {
          i = paso.b;
          paso = null;
          mezcla = 0;
          turno = ahora;
          setActual(i);
          setYaCambio(true);
        }
      }
      const b = barras.current[i];
      if (b) b.style.transform = `scaleX(${paso ? 1 : avance})`;
      if (scene) {
        scene.setEstado(paso ? paso.a : i, paso ? paso.b : i, mezcla, avance);
        scene.setTiempo(ahora / 1000);
        scene.render();
      }
      if (visible) raf = requestAnimationFrame(tick);
    };
    const wake = () => { if (!raf && visible) { previo = performance.now(); raf = requestAnimationFrame(tick); } };
    const onScroll = () => { read(); wake(); };
    const onResize = () => { read(); scene?.resize(); wake(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    read();
    wake();

    if (soportaEfectos() && canvas.current) {
      const c = canvas.current;
      const movil = window.matchMedia('(max-aspect-ratio: 1/1)').matches;
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
      irA.current = () => {};
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      scene?.dispose();
      setModo(null);
      setActual(0);
      setYaCambio(false);
    };
  }, [cerca]);

  const onTouchStart = (e: TouchEvent) => { toque.current = e.touches[0].clientX; };
  const onTouchEnd = (e: TouchEvent) => {
    if (toque.current === null) return;
    const d = e.changedTouches[0].clientX - toque.current;
    toque.current = null;
    if (Math.abs(d) > 48) irA.current(actual + (d < 0 ? 1 : -1));
  };
  const alternarPausa = () => { pausa.current = !pausa.current; setPausado(pausa.current); };
  const zona = ZONAS[actual];

  return (
    <section ref={root} className={`${s.scene} ${s.sobre} ${s.zonas}`} style={{ '--alto': 3.6 } as CSSProperties} aria-label="Zonas comunes de Urbis EU">
      <div ref={pin} className={s.pin}>
        <div ref={media} className={s.mediaZonas} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {modo === 'img' && ZONAS.map((z, i) => (
            <figure key={z.slug} className={`${s.zonaFig} ${i === actual ? s.zonaOn : ''}`} style={{ '--foco': `${z.focoMovil * 100}%` } as CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${BASE}/${z.slug}.webp`} alt={z.nombre} loading="lazy" />
              <figcaption>{z.nombre}. {z.texto}</figcaption>
            </figure>
          ))}
          <canvas ref={canvas} aria-hidden="true" className={`${s.canvas} ${modo === 'gl' ? s.canvasOn : ''}`} />
          <div aria-hidden="true" className={s.scrimZonas} />
          <div className={`${s.zonasTitulo} ${yaCambio ? s.tituloFuera : ''}`}>
            <p className={s.eyebrow}><span />ZONAS COMUNES</p>
            <h2 className={s.title}>Tu hogar continúa <em>más allá de tu puerta.</em></h2>
          </div>
          <div ref={pie} className={s.pieZonas}>
            <div className={s.filaZonas}>
              <div key={zona.slug} className={s.cap}>
                <span className={s.capN}>{dos(actual + 1)}<small> / {dos(N)}</small></span>
                <h3 className={s.capName}>{zona.nombre}</h3>
                <p className={s.capText}>{zona.texto}</p>
              </div>
              <div className={s.ctrls}>
                <button type="button" className={`${s.ctrl} ${s.pausa}`} onClick={alternarPausa} aria-label={pausado ? 'Reanudar la galería' : 'Pausar la galería'}>
                  {pausado
                    ? <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" /></svg>
                    : <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 3h3v10H4zM9 3h3v10H9z" /></svg>}
                </button>
                <button type="button" className={s.ctrl} onClick={() => irA.current(actual - 1)} aria-label="Zona anterior">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M14 8H3M7 4L3 8l4 4" /></svg>
                </button>
                <button type="button" className={s.ctrl} onClick={() => irA.current(actual + 1)} aria-label="Zona siguiente">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
                </button>
              </div>
            </div>
            <div className={s.segs}>
              {ZONAS.map((z, i) => (
                <button key={z.slug} type="button" className={`${s.seg} ${i < actual ? s.segVisto : ''}`} onClick={() => irA.current(i)} aria-label={`Ver ${z.nombre}`} aria-current={i === actual}>
                  <i><b ref={el => { barras.current[i] = el; if (el && i !== actual) el.style.transform = ''; }} /></i>
                </button>
              ))}
            </div>
          </div>
          <p className={s.nota}>Imágenes de carácter ilustrativo.</p>
        </div>
      </div>
    </section>
  );
}
