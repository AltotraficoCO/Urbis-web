'use client';

import Image from 'next/image';
import { useRef, type MouseEvent } from 'react';
import { COMPRA, FAQS, LEGAL, TOPE_VIS } from '@/lib/proyecto';
import Revela from './Revela';
import { useVentana } from './useCerca';
import s from './Recorrido.module.css';

export default function CompraYCierre({ onCta }: { onCta(e: MouseEvent<HTMLAnchorElement>): void }) {
  const cierre = useRef<HTMLElement>(null);
  const foto = useRef<HTMLDivElement>(null);

  useVentana(cierre, foto);

  return (
    <>
      <section className={s.claro} aria-labelledby="compra-titulo">
        <div className={s.wrap}>
          <div className={s.compraHead}>
            <Revela className={s.encabezado}>
              <p className={s.kicker}>CONDICIONES DE COMPRA</p>
              <h2 id="compra-titulo" className={s.h2}>Comprar empieza con información clara.</h2>
            </Revela>
            <Revela className={s.precio} retraso={120}>
              <span>Vivienda de interés social · Hasta</span>
              <strong>{TOPE_VIS}</strong>
              <p>Sujeto al tipo de apartamento, la disponibilidad y las condiciones comerciales vigentes.</p>
            </Revela>
          </div>
          <ol className={s.pasos}>
            {COMPRA.map((p, i) => (
              <Revela as="li" key={p.n} className={s.paso} retraso={i * 90}>
                <span className={s.pasoN}>{p.n}</span>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </Revela>
            ))}
          </ol>
          <div className={s.faqGrid}>
            <Revela className={s.encabezado}>
              <p className={s.kicker}>RESOLVEMOS TUS DUDAS</p>
              <h2 className={s.h2}>Antes de <em>decidir.</em></h2>
            </Revela>
            <Revela className={s.faqs} retraso={100}>
              {FAQS.map(([q, a]) => (
                <details key={q} className={s.faq}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </Revela>
          </div>
        </div>
      </section>

      <section ref={cierre} className={s.cierre} aria-labelledby="cierre-titulo">
        <div ref={foto} className={s.cierreFoto}>
          <div className={s.cierreImg}><Image src="/assets/web/cierre.webp" alt="Fachada de Urbis EU al anochecer, vista desde la calle" fill sizes="(max-aspect-ratio: 1/1) 240vw, 100vw" /></div>
          <div aria-hidden="true" className={s.cierreScrim} />
        </div>
        <div className={s.cierreCopy}>
          <p className={`${s.kicker} ${s.kickerClaro}`}>URBIS EU · CARTAGENA</p>
          <h2 id="cierre-titulo" className={`${s.h2} ${s.h2Claro} ${s.h2Grande}`}>Hablemos de <em>tu próximo hogar.</em></h2>
          <a href="#formulario" onClick={onCta} data-track="cta_primary_click" className={s.botonClaro}>
            <span>Quiero recibir información</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
          </a>
        </div>
      </section>

      <footer className={s.pie}>
        <div className={s.pieMarca}>
          <span>Corredor inmobiliario</span>
          <Image src="/assets/web/logos/araujo-segovia.svg" alt="Araujo y Segovia" width={208} height={45} unoptimized />
        </div>
        <p>{LEGAL}</p>
      </footer>
    </>
  );
}
