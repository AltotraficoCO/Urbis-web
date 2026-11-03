import { useEffect, useState, type RefObject } from 'react';

/**
 * Activa una escena solo cuando el usuario ya hizo scroll y está cerca, y la libera
 * al alejarse. Quien solo llena el formulario del hero no descarga nada.
 */
export function useCerca(ref: RefObject<HTMLElement | null>) {
  const [cerca, setCerca] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const dentro = window.scrollY > 40 && r.top < vh * 1.25 && r.bottom > -vh * 1.5;
      // Mientras alguien escribe en el formulario no se descarga nada nuevo.
      const escribiendo = document.activeElement?.matches('input') ?? false;
      setCerca(prev => (dentro ? (escribiendo ? prev : true) : false));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(check); };
    window.addEventListener('scroll', onScroll, { passive: true });
    frame = requestAnimationFrame(check);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [ref]);
  return cerca;
}

export const ramp = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function soportaEfectos() {
  try {
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const red = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const baja = (mem !== undefined && mem <= 2) || (navigator.hardwareConcurrency || 8) <= 2
      || !!red?.saveData || /(^|-)(2g|3g)$/.test(red?.effectiveType ?? '');
    return !baja && !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}

export const sinMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** La foto crece desde una ventana hasta ocupar toda su sección al entrar en pantalla. */
export function useVentana(seccion: RefObject<HTMLElement | null>, foto: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (sinMovimiento()) return;
    const el = seccion.current;
    const f = foto.current;
    if (!el || !f) return;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const vh = window.innerHeight;
      const r = el.getBoundingClientRect();
      if (r.top > vh || r.bottom < 0) return;
      const i = 1 - ramp(0.05, 0.9, 1 - r.top / vh);
      f.style.clipPath = i > 0.001 ? `inset(${i * 12}% ${i * 14}% ${i * 4}% ${i * 14}%)` : 'none';
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(paint); };
    window.addEventListener('scroll', on, { passive: true });
    on();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); };
  }, [seccion, foto]);
}
