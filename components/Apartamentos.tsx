'use client';

import Image from 'next/image';
import { useRef, useState, type MouseEvent } from 'react';
import { TIPOLOGIAS } from '@/lib/proyecto';
import Revela from './Revela';
import { useVentana } from './useCerca';
import s from './Recorrido.module.css';

const VISTAS = [
  { id: 'visto', label: 'Así se puede ver', nota: 'Imagen de referencia. Los muebles y acabados no están incluidos.' },
  { id: 'entrega', label: 'Así se entrega', nota: 'Obra gris, con baño y cocina terminados.' },
] as const;

export default function Apartamentos({ onCta }: { onCta(tipo: number, e: MouseEvent<HTMLAnchorElement>): void }) {
  const [tipo, setTipo] = useState(1);
  const [apto, setApto] = useState<'a' | 'b' | 'c'>('b');
  const [abiertos, setAbiertos] = useState<string[]>(['b']);
  const [vista, setVista] = useState<'visto' | 'entrega'>('visto');
  const tp = TIPOLOGIAS.find(t => t.tipos.includes(tipo))!;
  // Las fotos de abajo siguen la tipología del apartamento elegido.
  const abrir = (a: 'a' | 'b' | 'c') => { setApto(a); setAbiertos(l => (l.includes(a) ? l : [...l, a])); };
  const elegirTipo = (n: number) => {
    setTipo(n);
    const k = TIPOLOGIAS.find(t => t.tipos.includes(n))?.k.toLowerCase();
    if (k === 'a' || k === 'b' || k === 'c') abrir(k);
  };
  const seccion = useRef<HTMLElement>(null);
  const fotos = useRef<HTMLDivElement>(null);
  useVentana(seccion, fotos);

  return (
    <>
      <section className={s.claro} aria-labelledby="apt-titulo">
        <div className={s.wrap}>
          <div className={s.explorador}>
            <div className={s.columna}>
          <Revela className={s.encabezado}>
            <p className={s.kicker}>ENCUENTRA TU ESPACIO</p>
            <h2 id="apt-titulo" className={`${s.h2} ${s.h2Medio}`}>Diez distribuciones. <em>Una es la tuya.</em></h2>
          </Revela>
            <Revela className={s.panel}>
              <p className={s.mini}>Elige un apartamento de la planta</p>
              <div className={s.numeros} role="group" aria-label="Tipo de apartamento">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <button key={n} type="button" aria-pressed={n === tipo} onClick={() => elegirTipo(n)} className={s.numero}>{n}</button>
                ))}
              </div>
              <dl key={tp.k} className={s.ficha}>
                <div><dt>Tipología</dt><dd className={s.fichaGrande}>{tp.k}</dd></div>
                <div><dt>Área construida</dt><dd>{tp.construida}</dd></div>
                <div><dt>Área útil</dt><dd>{tp.util}</dd></div>
                <div><dt>En cada piso</dt><dd>{tp.porPiso}</dd></div>
                <div><dt>Etapa</dt><dd>{tp.etapa}</dd></div>
              </dl>
              <a href="#formulario" onClick={e => onCta(tipo, e)} data-track="cta_primary_click" className={s.boton}>
                <span>Pedir valor de este apartamento</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </a>
            </Revela>
            </div>
            <Revela className={s.plano} retraso={120}>
              <div key={tipo} className={s.planoImg}>
                <Image src={`/assets/web/planos/${tipo}.webp`} alt={`Plano del apartamento tipo ${tipo}, tipología ${tp.k}, con su ubicación en la planta del piso`} fill sizes="(max-width: 959px) 170vw, 62vw" />
              </div>
            </Revela>
          </div>
        </div>
      </section>

      <section ref={seccion} className={s.entrega} aria-labelledby="ent-titulo">
        <div ref={fotos} className={s.entregaFotos}>
          {/* Solo se piden las fotos de las tipologías que la persona ya abrió. */}
          {(['a', 'b', 'c'] as const).filter(a => abiertos.includes(a)).flatMap(a => VISTAS.map(v => {
            const on = a === apto && v.id === vista;
            return (
              <div key={a + v.id} className={`${s.entregaFoto} ${on ? s.fotoOn : ''}`} aria-hidden={!on}>
                <Image src={`/assets/web/aptos/${a}-${v.id}.webp`} alt={on ? `Apartamento tipología ${a.toUpperCase()}: ${v.label.toLowerCase()}` : ''} fill sizes="(max-aspect-ratio: 1/1) 240vw, 100vw" />
              </div>
            );
          }))}
          <div aria-hidden="true" className={s.entregaScrim} />
        </div>
        <div className={s.entregaCopy}>
          <Revela className={s.encabezado}>
            <p className={`${s.kicker} ${s.kickerClaro}`}>ASÍ SE ENTREGA</p>
            <h2 id="ent-titulo" className={`${s.h2} ${s.h2Claro}`}>Imagínalo terminado. <em>Conoce cómo se entrega.</em></h2>
          </Revela>
          <div className={s.controles}>
            <div className={s.segmento} role="group" aria-label="Estado del apartamento">
              {VISTAS.map(v => <button key={v.id} type="button" aria-pressed={v.id === vista} onClick={() => setVista(v.id)}>{v.label}</button>)}
            </div>
            <div className={s.segmento} role="group" aria-label="Tipología">
              {(['a', 'b', 'c'] as const).map(a => <button key={a} type="button" aria-pressed={a === apto} aria-label={`Tipología ${a.toUpperCase()}`} onClick={() => abrir(a)}>{a.toUpperCase()}</button>)}
            </div>
          </div>
          <p role="status" className={s.entregaNota}>{VISTAS.find(v => v.id === vista)!.nota}</p>
        </div>
      </section>
    </>
  );
}
