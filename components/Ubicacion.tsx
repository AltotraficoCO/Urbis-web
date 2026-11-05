'use client';

import Image from 'next/image';
import { INDICACIONES } from '@/lib/proyecto';
import Revela from './Revela';
import s from './Recorrido.module.css';

/** Coordenadas sobre la imagen de 1080 × 790. */
const CALLE_BOGOTA = '665,785 560,685 500,640 430,575 395,545 345,510';
const CARRERA_16 = '742,585 815,540 875,505';
const IGLESIA = { x: 645, y: 472 };

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
          <Image src="/assets/web/ubicacion.webp" alt="Vista aérea de Torices con Urbis EU, la Iglesia de Torices, la calle Bogotá o calle 46, la carrera 16 y el mar al fondo" fill sizes="(max-width: 959px) 100vw, 60vw" />
          <svg viewBox="0 0 1080 790" aria-hidden="true" className={s.mapaTrazos}>
            <polyline points={CALLE_BOGOTA} />
            <polyline points={CARRERA_16} />
            <circle cx={IGLESIA.x} cy={IGLESIA.y} r="11" />
            <line x1={IGLESIA.x} y1={IGLESIA.y} x2="790" y2="430" />
          </svg>
          <span className={s.mapaEtiqueta} style={{ left: '63%', top: '13%' }}>Urbis EU</span>
          <span className={s.mapaEtiqueta} style={{ left: '73%', top: '50%' }}>Iglesia de Torices</span>
          <span className={s.mapaEtiqueta} style={{ left: '46.3%', top: '81%' }}>Calle Bogotá · Cll 46</span>
          <span className={s.mapaEtiqueta} style={{ left: '87.5%', top: '62%' }}>Carrera 16</span>
        </Revela>
      </div>
      <p className={`${s.wrap} ${s.mapaNota}`}>Imagen de referencia, sin escala.</p>
    </section>
  );
}
