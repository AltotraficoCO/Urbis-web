import { digits, validateLead, type LeadForm } from '@/lib/lead';

// Reenvía el lead a LEAD_WEBHOOK_URL (CRM, Zapier, Make, etc.).
export async function POST(req: Request) {
  let body: Partial<LeadForm> & { page?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  const form: LeadForm = {
    name: String(body.name ?? ''),
    wa: String(body.wa ?? ''),
    email: String(body.email ?? ''),
    consent: body.consent === true,
  };
  const errors = validateLead(form);
  if (Object.keys(errors).length) return Response.json({ error: 'invalid', errors }, { status: 422 });

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
    page: typeof body.page === 'string' ? body.page : '',
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
