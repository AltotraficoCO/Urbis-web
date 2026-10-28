import { checkBotId } from 'botid/server';
import { digits, validateLead, type LeadForm } from '@/lib/lead';
import { MIN_FILL_MS, spamReason } from '@/lib/spam';

// Límite por IP (best-effort: vive en memoria de cada instancia).
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 3;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter(t => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_MAX;
}

// Respuesta de éxito falsa: al bot no le damos pistas de que fue descartado.
const silentOk = (reason: string) => {
  console.warn('[Urbis EU] Lead descartado como spam:', reason);
  return Response.json({ ok: true });
};

// Reenvía el lead a LEAD_WEBHOOK_URL (CRM, Zapier, Make, etc.).
export async function POST(req: Request) {
  // 1. Solo peticiones hechas desde esta misma web.
  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  if (!origin || !host || new URL(origin).host !== host) return Response.json({ error: 'forbidden' }, { status: 403 });

  // 2. Vercel BotID: bloquea navegadores automatizados y scripts.
  const verification = await checkBotId();
  if (verification.isBot) return Response.json({ error: 'forbidden' }, { status: 403 });

  let body: Partial<LeadForm> & { page?: string; company?: string; elapsed?: number };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  // 3. Campo trampa oculto y tiempo mínimo de llenado.
  if (body.company) return silentOk('honeypot');
  if (typeof body.elapsed !== 'number' || body.elapsed < MIN_FILL_MS) return silentOk('too_fast');

  const form: LeadForm = {
    name: String(body.name ?? ''),
    wa: String(body.wa ?? ''),
    email: String(body.email ?? ''),
    consent: body.consent === true,
  };
  const errors = validateLead(form);
  if (Object.keys(errors).length) return Response.json({ error: 'invalid', errors }, { status: 422 });

  // 4. Patrones de contenido basura.
  const reason = spamReason(form);
  if (reason) return silentOk(reason);

  // 5. Límite de envíos válidos por IP.
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return Response.json({ error: 'rate_limited' }, { status: 429 });

  const endpoint = process.env.LEAD_WEBHOOK_URL?.trim();
  if (!endpoint) {
    console.warn('[Urbis EU] Formulario sin configurar: define LEAD_WEBHOOK_URL con la URL que recibirá los leads. No se envió ningún dato.');
    return Response.json({ error: 'unconfigured' }, { status: 503 });
  }

  const payload = {
    name: form.name.trim(),
    whatsapp: digits(form.wa),
    email: form.email.trim(),
    interest: 'Apartamentos Urbis EU',
    consent: true,
    source: 'landing-urbis-eu',
    page: typeof body.page === 'string' ? body.page.slice(0, 500) : '',
    submittedAt: new Date().toISOString(),
  };

  try {
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error('HTTP ' + res.status);
  } catch (err) {
    console.error('[Urbis EU] Error al reenviar el lead', err);
    return Response.json({ error: 'upstream' }, { status: 502 });
  }
  return Response.json({ ok: true });
}
