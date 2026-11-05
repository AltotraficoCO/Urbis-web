'use client';

import type { MouseEvent } from 'react';
import { CIUDAD, INVERSION } from '@/lib/proyecto';
import Revela from './Revela';
import s from './Recorrido.module.css';

export default function Inversion({ onCta }: { onCta(e: MouseEvent<HTMLAnchorElement>): void }) {
  return (
    <section className={s.inversion} aria-labelledby="inv-titulo">
      <div className={s.wrap}>
        <Revela className={s.encabezado}>
          <p className={`${s.kicker} ${s.kickerClaro}`}>PARA INVERTIR</p>
          <h2 id="inv-titulo" className={`${s.h2} ${s.h2Claro}`}>Tu próximo hogar también puede ser <em>tu próxima inversión.</em></h2>
        </Revela>
        <ul className={s.invLista}>
          {INVERSION.map((it, i) => (
            <Revela as="li" key={it.titulo} className={s.invItem} retraso={i * 90}>
              <h3>{it.titulo}</h3>
              <p>{it.texto}</p>
            </Revela>
          ))}
        </ul>
        <Revela className={s.invCiudad}>
          <h3 className={s.invSub}>Por qué Cartagena</h3>
          <ul className={s.invLista}>
            {CIUDAD.map(it => (
              <li key={it.titulo} className={s.invItem}>
                <h3>{it.titulo}</h3>
                <p>{it.texto}</p>
              </li>
            ))}
          </ul>
        </Revela>
        <div className={s.invPie}>
          <a href="#formulario" onClick={onCta} data-track="cta_primary_click" className={s.botonClaro}>
            <span>Hablar con el equipo comercial</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
          </a>
          <p>Esta información no constituye una promesa de rentabilidad ni de valorización.</p>
        </div>
      </div>
    </section>
  );
}
