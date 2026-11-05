'use client';

import { RESPALDO } from '@/lib/proyecto';
import Revela from './Revela';
import s from './Recorrido.module.css';

export default function Respaldo() {
  return (
    <section className={s.claro} aria-labelledby="respaldo-titulo">
      <div className={s.wrap}>
        <Revela className={s.encabezado}>
          <p className={s.kicker}>QUIÉN ESTÁ DETRÁS</p>
          <h2 id="respaldo-titulo" className={`${s.h2} ${s.h2Medio}`}>El equipo <em>detrás de Urbis EU.</em></h2>
        </Revela>
        <ul className={s.respaldo}>
          {RESPALDO.map(r => (
            <li key={r.nombre}><strong>{r.nombre}</strong><span>{r.rol}</span></li>
          ))}
        </ul>
      </div>
    </section>
  );
}
