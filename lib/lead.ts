export type LeadForm = { name: string; wa: string; email: string; consent: boolean };
export type LeadErrors = Partial<Record<keyof LeadForm, string>>;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^[\p{L}][\p{L}' .-]*$/u;

export const digits = (v: string) => v.replace(/[^\d]/g, '');

export function validateLead(f: LeadForm): LeadErrors {
  const e: LeadErrors = {};
  const name = f.name.trim();
  if (name.length < 2) e.name = 'Escribe tu nombre.';
  else if (name.length > 80 || !NAME_RE.test(name)) e.name = 'Escribe tu nombre usando solo letras.';
  const d = digits(f.wa);
  if (!d) e.wa = 'Escribe tu número de teléfono o WhatsApp.';
  else if (!((d.length === 10 && d[0] === '3') || (d.length === 12 && d.startsWith('573')) || (d.length === 10 && d[0] === '6'))) e.wa = 'Revisa el número: debe tener 10 dígitos.';
  if (!f.email.trim()) e.email = 'Escribe tu correo electrónico.';
  else if (f.email.trim().length > 120 || !EMAIL_RE.test(f.email.trim())) e.email = 'Revisa el formato del correo electrónico.';
  if (!f.consent) e.consent = 'Necesitamos tu autorización para poder contactarte.';
  return e;
}
