'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { LUGARES } from '@/lib/proyecto';
import { useVentana } from './useCerca';
import s from './Recorrido.module.css';

/** Primer pilar del proyecto: la vista despejada, junto con lo que queda cerca. */
export default function Vista() {
  const seccion = useRef<HTMLElement>(null);
  const foto = useRef<HTMLDivElement>(null);
  useVentana(seccion, foto);
  return (
    <section ref={seccion} className={s.vista} aria-labelledby="vista-titulo">
      <div ref={foto} className={s.vistaFoto}>
        <Image src="/assets/web/vista.webp" alt="Pareja en el balcón de un apartamento de Urbis EU mirando la ciudad" fill sizes="(max-aspect-ratio: 1/1) 240vw, 100vw" />
        <div aria-hidden="true" className={s.vistaScrim} />
      </div>
      <div className={s.vistaCopy}>
        <p className={`${s.kicker} ${s.kickerClaro}`}>LA VISTA · TORICES</p>
        <h2 id="vista-titulo" className={`${s.h2} ${s.h2Claro}`}>Cartagena, <em>desde tu balcón.</em></h2>
        <ul className={s.lugares} aria-label="Lugares cercanos">
          {LUGARES.map(l => <li key={l}>{l}</li>)}
        </ul>
        <p className={s.vistaNota}>Imagen de carácter ilustrativo.</p>
      </div>
    </section>
  );
}
