import type { LeadForm } from './lead';

// Tiempo mínimo (ms) entre que se muestra el formulario y se envía. Un humano no llena 3 campos en menos.
export const MIN_FILL_MS = 3000;

// Dominios de correo temporal/desechable más usados por bots.
const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'sharklasers.com', '10minutemail.com', 'tempmail.com',
  'temp-mail.org', 'yopmail.com', 'trashmail.com', 'getnada.com', 'dispostable.com', 'maildrop.cc', 'fakeinbox.com',
  'throwawaymail.com', 'mintemail.com', 'mohmal.com', 'emailondeck.com', 'tempail.com', 'tempr.email', 'discard.email',
]);

const URL_RE = /(https?:\/\/|www\.|\.(com|net|org|ru|xyz|top|info|biz)\b)/i;

// Patrones de spam evidentes: enlaces en el nombre, correos desechables, mismo dígito repetido, etc.
export function spamReason(f: LeadForm): string | null {
  const name = f.name.trim();
  const email = f.email.trim().toLowerCase();
  const phone = f.wa.replace(/[^\d]/g, '');
  if (URL_RE.test(name)) return 'url_in_name';
  if (DISPOSABLE.has(email.split('@')[1] ?? '')) return 'disposable_email';
  if (/(\d)\1{6,}/.test(phone)) return 'repeated_digits';
  if (/^(.)\1+$/i.test(name.replace(/\s/g, ''))) return 'repeated_chars';
  if (/[bcdfghjklmnñpqrstvwxz]{6,}/i.test(name)) return 'gibberish_name';
  return null;
}
