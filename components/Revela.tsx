'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';
import s from './Recorrido.module.css';

/** Muestra su contenido con una animación la primera vez que entra en pantalla. */
export default function Revela({ as: Tag = 'div', children, className = '', retraso = 0 }: { as?: ElementType; children: ReactNode; className?: string; retraso?: number }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) { el.classList.add(s.visto); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={`${s.revela} ${className}`} style={{ transitionDelay: `${retraso}ms` }}>{children}</Tag>;
}
