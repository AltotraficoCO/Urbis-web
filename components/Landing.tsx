'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type MouseEvent } from 'react';
import { validateLead, type LeadErrors, type LeadForm } from '@/lib/lead';
import Apartamentos from './Apartamentos';
import CompraYCierre from './CompraYCierre';
import EscenaDiaNoche, { type Beat } from './EscenaDiaNoche';
import ZonasComunes from './ZonasComunes';
import { LUGARES } from '@/lib/proyecto';
import e from './Escenas.module.css';
import s from './Landing.module.css';

type Status = 'idle' | 'loading' | 'success' | 'error' | 'unconfigured' | 'limited';

const HDR_OFFSET = 64;
const PRIVACY_URL = process.env.NEXT_PUBLIC_PRIVACY_URL || '';
const MOBILE_STICKY_CTA = true;
const FIELDS = ['name', 'wa', 'city', 'email', 'consent'] as const;
const MSGS: Partial<Record<Status, string>> = {
  error: 'No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.',
  limited: 'Ya recibimos varias solicitudes desde tu conexión. Inténtalo de nuevo en unos minutos.',
  unconfigured: 'El formulario todavía no está conectado al sistema de registro, así que tu solicitud no se envió. Inténtalo más tarde.',
};

declare global {
  interface Window { dataLayer?: Record<string, unknown>[] }
}

function track(event: string, params: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const delay = (ms: number) => ({ animationDelay: ms + 'ms' });

const FLECHA = <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>;

const BEATS_MAR: Beat[] = [
  { desde: -1, hasta: 0.34, contenido: <><p className={e.eyebrow}><span />UBICACIÓN · TORICES</p><h2 className={e.title}>Y al amanecer, <em>Cartagena vuelve a empezar.</em></h2></> },
  { desde: 0.42, hasta: 2, contenido: <><p className={e.title}>Cerca de lo <em>que importa.</em></p><ul className={e.lugares}>{LUGARES.map(l => <li key={l}>{l}</li>)}</ul></> },
];

export default function Landing() {
  const [form, setForm] = useState<LeadForm>({ name: '', wa: '', city: '', email: '', consent: false });
  const [errors, setErrors] = useState<LeadErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [narrow, setNarrow] = useState(false);
  const [formInView, setFormInView] = useState(true);
  const [stickyHidden, setStickyHidden] = useState(false);

  const heroImg = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const shownAt = useRef(0);

  useEffect(() => {
    shownAt.current = Date.now();
    const mq = window.matchMedia('(max-width: 959px)');
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const h = heroImg.current;
        if (h) h.style.transform = (mq.matches || reduced()) ? '' : `translate3d(0,${Math.min(window.scrollY, window.innerHeight) * 0.1}px,0)`;
      });
    };
    const onMq = () => { setNarrow(mq.matches); onScroll(); };
    onMq();
    mq.addEventListener('change', onMq);
    window.addEventListener('scroll', onScroll, { passive: true });

    let io: IntersectionObserver | undefined;
    if ('IntersectionObserver' in window && formRef.current) {
      io = new IntersectionObserver(([en]) => setFormInView(en.isIntersecting), { threshold: 0.05 });
      io.observe(formRef.current);
    }
    return () => {
      mq.removeEventListener('change', onMq);
      window.removeEventListener('scroll', onScroll);
      io?.disconnect();
    };
  }, []);

  const goForm = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const a = e.currentTarget;
    if (a.dataset.track) track(a.dataset.track, { label: a.textContent?.trim() });
    const f = formRef.current;
    if (!f) return;
    const top = f.getBoundingClientRect().top + window.scrollY - HDR_OFFSET - 16;
    // Desde lejos se salta directo: un scroll animado atravesaría todas las escenas.
    const lejos = Math.abs(window.scrollY - top) > window.innerHeight * 2;
    window.scrollTo({ top: Math.max(0, top), behavior: reduced() || lejos ? 'instant' : 'smooth' });
    setTimeout(() => nameRef.current?.focus({ preventScroll: true }), reduced() ? 50 : 700);
  };

  const onField = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setErrors(er => ({ ...er, [name]: '' }));
    setStatus(st => (st === 'loading' ? st : 'idle'));
  };

  const submit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const e = validateLead(form);
    if (Object.keys(e).length) {
      setErrors(e);
      const first = FIELDS.find(k => e[k]);
      ev.currentTarget.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    setStatus('loading');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, page: location.href, company: honeypot.current?.value ?? '', elapsed: Date.now() - shownAt.current }),
      });
      if (res.status === 503) { setStatus('unconfigured'); return; }
      if (res.status === 429) { setStatus('limited'); return; }
      if (!res.ok) throw new Error('HTTP ' + res.status);
      setStatus('success');
      track('form_submit_success', { interest: 'apartamentos' });
      setTimeout(() => successRef.current?.focus(), 60);
    } catch (err) {
      console.error('[Urbis EU] Error al enviar el formulario', err);
      setStatus('error');
    }
  };

  const firstName = form.name.trim().split(/\s+/)[0] || '';
  const loading = status === 'loading';
  const submitMsg = MSGS[status];
  const showSticky = MOBILE_STICKY_CTA && narrow && !stickyHidden && !formInView && status !== 'success';

  return (
    <>
      <a href="#formulario" onClick={goForm} className={s.skip}>Ir al formulario de contacto</a>

      <main>
        <section id="inicio" className={s.hero}>
          <div className={`${s.heroBg} ${s.fade}`}>
            <div ref={heroImg} className={s.heroImg}>
              <Image src="/assets/web/urbis-hero-t1.jpg" alt="" fill priority sizes="(max-width: 959px) 300vw, 100vw" />
            </div>
            <div aria-hidden="true" className={s.heroOverlay} />
            <div aria-hidden="true" className={s.heroFade} />
          </div>

          <div className={s.heroGrid}>
            <div className={s.copy}>
              <Image className={`${s.logo} ${s.up}`} style={delay(60)} src="/assets/urbis-logo-horizontal-blanco.png" alt="Urbis EU" width={694} height={153} priority />
              <p className={`${s.eyebrow} ${s.up}`} style={delay(120)}><span />URBIS EU · TORICES, CARTAGENA</p>
              <h1 className={`${s.title} ${s.up}`} style={delay(180)}>Tu próximo hogar en Cartagena <em>comienza aquí.</em></h1>
              <p className={`${s.sub} ${s.up}`} style={delay(240)}>
                Encuentra opciones desde&nbsp;<strong>$275 millones COP</strong> <br />y da el primer paso hacia tu próximo proyecto.
              </p>
              <p className={`${s.place} ${s.up}`} style={delay(300)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><path d="M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0" /></svg>
                Torices, Cartagena de Indias
              </p>
            </div>

            <div id="formulario" ref={formRef} className={`${s.card} ${s.up}`} style={delay(200)}>
              {status === 'success' ? (
                <div role="status" tabIndex={-1} ref={successRef} className={s.success}>
                  <span className={s.successIcon}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#14403E" strokeWidth="1.5" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg></span>
                  <h2 className={s.successTitle}>Recibimos tu solicitud, {firstName}.</h2>
                  <p className={s.muted}>El equipo comercial de Urbis EU se comunicará contigo con la información de Urbis EU.</p>
                </div>
              ) : (
                <>
                  <div className={s.head}>
                    <p className={s.kicker}>Recibe información</p>
                    <h2 className={s.cardTitle}>Conoce Urbis EU</h2>
                    <p className={s.lead}>Déjanos tus datos y recibe información para dar el siguiente paso.</p>
                  </div>
                  <form noValidate onSubmit={submit} aria-label="Solicitud de información de Urbis EU" className={s.form}>
                    <div aria-hidden="true" className={s.trap}>
                      <label htmlFor="lf-company">Empresa</label>
                      <input id="lf-company" name="company" ref={honeypot} tabIndex={-1} autoComplete="off" defaultValue="" />
                    </div>
                    <div className={s.field}>
                      <label htmlFor="lf-name" className={s.label}>Nombre</label>
                      <input id="lf-name" name="name" ref={nameRef} autoComplete="name" placeholder="Tu nombre y apellido" value={form.name} onChange={onField} aria-invalid={!!errors.name} aria-describedby="lf-name-e" className={s.input} />
                      <span id="lf-name-e" aria-live="polite" className={s.error}>{errors.name}</span>
                    </div>
                    <div className={s.field}>
                      <label htmlFor="lf-wa" className={s.label}>Teléfono / WhatsApp</label>
                      <div className={s.phone}>
                        <span className={s.dial} aria-label="Indicativo de Colombia">+57</span>
                        <input id="lf-wa" name="wa" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="300 000 0000" value={form.wa} onChange={onField} aria-invalid={!!errors.wa} aria-describedby="lf-wa-e" className={s.input} />
                      </div>
                      <span id="lf-wa-e" aria-live="polite" className={s.error}>{errors.wa}</span>
                    </div>
                    <div className={s.field}>
                      <label htmlFor="lf-city" className={s.label}>Ciudad</label>
                      <input id="lf-city" name="city" autoComplete="address-level2" placeholder="¿En qué ciudad vives?" value={form.city} onChange={onField} aria-invalid={!!errors.city} aria-describedby="lf-city-e" className={s.input} />
                      <span id="lf-city-e" aria-live="polite" className={s.error}>{errors.city}</span>
                    </div>
                    <div className={s.field}>
                      <label htmlFor="lf-email" className={s.label}>Correo electrónico</label>
                      <input id="lf-email" name="email" type="email" autoComplete="email" placeholder="tucorreo@ejemplo.com" value={form.email} onChange={onField} aria-invalid={!!errors.email} aria-describedby="lf-email-e" className={s.input} />
                      <span id="lf-email-e" aria-live="polite" className={s.error}>{errors.email}</span>
                    </div>
                    <div className={s.field}>
                      <label className={s.consent}>
                        <input type="checkbox" name="consent" checked={form.consent} onChange={onField} aria-invalid={!!errors.consent} aria-describedby="lf-consent-e" />
                        <span>
                          Autorizo el tratamiento de mis datos personales para que el equipo comercial de Urbis EU me contacte, conforme a la Ley 1581 de 2012 y a la{' '}
                          {PRIVACY_URL
                            ? <a href={PRIVACY_URL} target="_blank" rel="noopener">política de tratamiento de datos</a>
                            : 'política de tratamiento de datos del proyecto'}.
                        </span>
                      </label>
                      <span id="lf-consent-e" aria-live="polite" className={s.error}>{errors.consent}</span>
                    </div>
                    {submitMsg && <div role="alert" className={s.alert}>{submitMsg}</div>}
                    <button type="submit" disabled={loading} aria-busy={loading} className={s.submit}>
                      <span>{loading ? 'Enviando…' : 'Quiero recibir información'}</span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>

        <EscenaDiaNoche
          etiqueta="Urbis EU del día a la noche"
          base="/assets/web/torre"
          alto={4.6}
          entrada="ventana"
          conSalida
          fondo="#0B2524"
          mapaMovil={[0.225, 0.5]}
          foco={{ escritorio: 0.56, movil: 0.5 }}
          cam={{ low: 0.22, high: -0.34 }}
          alt={{ dia: 'Torre Urbis EU de día, con el barrio Torices y el cerro de fondo', noche: 'Torre Urbis EU al anochecer, con sus ventanas encendidas' }}
          beats={[
            { desde: -1, hasta: 0.3, contenido: <><p className={e.eyebrow}><span />URBIS EU · TORICES</p><h2 className={e.title}>Cuando baja el sol, Cartagena <em>cambia de color.</em></h2></> },
            { desde: 0.34, hasta: 0.64, contenido: <p className={e.title}>Y las luces se encienden, <em>una a una.</em></p> },
            { desde: 0.72, hasta: 2, contenido: <><p className={e.title}>Una de ellas <em>puede ser la tuya.</em></p>{!showSticky && <a href="#formulario" onClick={goForm} data-track="cta_primary_click" className={e.cta}><span>Quiero recibir información</span>{FLECHA}</a>}</> },
          ]}
        />
        <EscenaDiaNoche
          etiqueta="Urbis EU y el mar de Cartagena al amanecer"
          base="/assets/web/mar"
          alto={5.2}
          entrada="fundido"
          conSalida
          amanecer
          mapaMovil={[0, 1]}
          foco={{ escritorio: 0.5, movil: 0.51 }}
          cam={{ low: 0.2, high: -0.5 }}
          alt={{ dia: 'Urbis EU de día, con edificios y el mar de fondo', noche: 'Urbis EU de noche, con edificios iluminados y el mar de fondo' }}
          beats={BEATS_MAR}
        />
        <ZonasComunes />
        <Apartamentos onCta={goForm} />
        <CompraYCierre onCta={goForm} />
      </main>

      {!narrow && !formInView && status !== 'success' && (
        <a href="#formulario" onClick={goForm} data-track="cta_primary_click" className={s.pill}>Solicitar información</a>
      )}

      {showSticky && (
        <div className={s.sticky}>
          <a href="#formulario" onClick={goForm} data-track="cta_primary_click" className={s.stickyCta}>Solicitar información</a>
          <button type="button" onClick={() => setStickyHidden(true)} aria-label="Ocultar botón de solicitud" className={s.stickyClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F4EDE1" strokeWidth="1.5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
      )}
    </>
  );
}
