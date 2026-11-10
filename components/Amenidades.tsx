'use client';

import type { ReactNode } from 'react';
import { AMENIDADES } from '@/lib/proyecto';
import Revela from './Revela';
import s from './Recorrido.module.css';

type Icono = (typeof AMENIDADES)[number]['icono'];

// Iconos de línea, trazo 1.5 sobre 24 × 24, en el mismo registro que los del brochure.
const ICONOS: Record<Icono, ReactNode> = {
  piscina: <><path d="M7 15V6.5a2 2 0 0 1 4 0M13 15V6.5a2 2 0 0 1 4 0M7 9h6M7 12h6" /><path d="M3 19c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1" /></>,
  ninos: <><circle cx="8" cy="7" r="2.5" /><circle cx="16" cy="7" r="2.5" /><path d="M4 20v-4a4 4 0 0 1 8 0v4M12 20v-4a4 4 0 0 1 8 0v4" /></>,
  terraza: <><path d="M3 20h18M7 20v-9M2 11a5 5 0 0 1 10 0zM15 20v-4h5v4" /><circle cx="18" cy="6" r="2" /></>,
  social: <path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v4H3zM6 17v2M18 17v2" />,
  gimnasio: <path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12" />,
  juegos: <><rect x="4" y="4" width="16" height="16" rx="2" /><circle cx="9" cy="9" r=".9" fill="currentColor" /><circle cx="12" cy="12" r=".9" fill="currentColor" /><circle cx="15" cy="15" r=".9" fill="currentColor" /></>,
  coworking: <path d="M5 16V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v9M2 18.5h20" />,
  infantiles: <><circle cx="12" cy="9" r="5" /><path d="M12 14v6M9 20h6" /></>,
  mascotas: <><circle cx="7" cy="10.5" r="1.6" /><circle cx="10.4" cy="6.6" r="1.6" /><circle cx="13.6" cy="6.6" r="1.6" /><circle cx="17" cy="10.5" r="1.6" /><path d="M12 12c-2.5 0-4.5 2.5-4.5 4.5 0 1.5 1.2 2.5 2.5 2.5.8 0 1.3-.4 2-.4s1.2.4 2 .4c1.3 0 2.5-1 2.5-2.5 0-2-2-4.5-4.5-4.5z" /></>,
  lobby: <><path d="M6 20V10a6 6 0 0 1 12 0v10M4 20h16" /><circle cx="14.5" cy="14.5" r=".7" fill="currentColor" /></>,
};

/** Lista completa de amenidades con iconos, después de la galería de fotos. */
export default function Amenidades() {
  return (
    <section className={s.amenidades} aria-labelledby="amenidades-titulo">
      <div className={`${s.wrap} ${s.amenidadesGrid}`}>
        <Revela className={s.encabezado}>
          <p className={`${s.kicker} ${s.kickerClaro}`}>AMENIDADES</p>
          <h2 id="amenidades-titulo" className={`${s.h2} ${s.h2Claro} ${s.h2Medio}`}>Adentro pasa <em>tanto como afuera.</em></h2>
        </Revela>
        <Revela as="ul" className={s.amenidadesLista} retraso={120}>
          {AMENIDADES.map(a => (
            <li key={a.nombre}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONOS[a.icono]}</svg>
              {a.nombre}
            </li>
          ))}
        </Revela>
      </div>
    </section>
  );
}
