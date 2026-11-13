'use client';

import { useEffect, useState } from 'react';
import s from './PistaScroll.module.css';

/**
 * «Sigue bajando»: pestaña fija en el borde derecho que acompaña toda la bajada.
 * El borde es la única franja libre en todas las secciones (escenas fijas, galería,
 * formulario), así que no tapa texto ni controles. Se va al llegar al final.
 * Al tocarla baja casi una pantalla.
 */
export default function PistaScroll() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = 0;
    const leer = () => {
      raf = 0;
      const resta = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      setVisible(resta > window.innerHeight * 0.6);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(leer); };
    leer();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const bajar = () => {
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollBy({ top: window.innerHeight * 0.85, behavior: quieto ? 'instant' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={bajar}
      data-track="scroll_hint_click"
      aria-label="Seguir bajando por la página"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`${s.pista} ${visible ? s.on : ''}`}
    >
      <span className={s.texto}>Sigue bajando</span>
      <i className={s.linea} aria-hidden="true" />
      <svg className={s.flecha} width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 4.5 6 8.5l4-4" /></svg>
    </button>
  );
}
