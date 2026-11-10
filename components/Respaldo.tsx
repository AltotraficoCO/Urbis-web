'use client';

import Image from 'next/image';
import { RESPALDO } from '@/lib/proyecto';
import Revela from './Revela';
import s from './Recorrido.module.css';

export default function Respaldo() {
  return (
    <section className={s.claro} aria-labelledby="respaldo-titulo">
      <div className={s.wrap}>
        <Revela className={s.encabezado}>
          <p className={s.kicker}>URBIS EU</p>
          <h2 id="respaldo-titulo" className={`${s.h2} ${s.h2Medio}`}>Con el <em>respaldo de</em></h2>
        </Revela>
        <div className={s.respaldo}>
          {RESPALDO.map(g => (
            <div key={g.rol} className={s.respaldoGrupo}>
              <h3>{g.rol}</h3>
              <ul>
                {g.marcas.map(m => (
                  <li key={m.nombre}><Image src={`/assets/web/logos/${m.logo}`} alt={m.nombre} width={m.ancho} height={m.alto} unoptimized={m.logo.endsWith('.svg')} /></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
