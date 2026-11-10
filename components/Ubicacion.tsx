'use client';

import Image from 'next/image';
import { INDICACIONES } from '@/lib/proyecto';
import Revela from './Revela';
import s from './Recorrido.module.css';

export default function Ubicacion() {
  return (
    <section className={`${s.claro} ${s.ubicacion}`} aria-labelledby="ubicacion-titulo">
      <div className={`${s.wrap} ${s.ubicacionGrid}`}>
        <Revela className={s.encabezado}>
          <p className={s.kicker}>LA UBICACIÓN · TORICES</p>
          <h2 id="ubicacion-titulo" className={`${s.h2} ${s.h2Medio}`}>A 8 minutos del centro. <em>A 8 minutos del mar.</em></h2>
          <ul className={s.indicaciones} aria-label="Cómo llegar">
            {INDICACIONES.map(i => <li key={i}>{i}</li>)}
          </ul>
        </Revela>
        <Revela className={s.mapa} retraso={120}>
          <Image src="/assets/web/ubicacion.webp" alt="Vista aérea de Torices con Urbis EU, la Parroquia San José de Torices, la calle 43 o calle Bogotá, la carrera 16 y el mar al fondo" fill sizes="(max-width: 959px) 100vw, 60vw" />
          <span className={s.mapaEtiqueta} style={{ left: '63%', top: '13%' }}>Urbis EU</span>
          <span className={s.mapaEtiqueta} style={{ left: '71.7%', top: '54.6%' }}>Parroquia San José de Torices</span>
          <span className={s.mapaEtiqueta} style={{ left: '45.4%', top: '81.1%' }}>Calle Bogotá · Cll 43</span>
          <span className={s.mapaEtiqueta} style={{ left: '37%', top: '61.8%' }}>Cra. 16</span>
        </Revela>
      </div>
      <p className={`${s.wrap} ${s.mapaNota}`}>Imagen de referencia, sin escala.</p>
    </section>
  );
}
