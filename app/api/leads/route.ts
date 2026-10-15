import { createHash, randomUUID } from 'node:crypto';
import { leadSchema, resumen, type Lead } from '@/lib/lead';
import { MARCA } from '@/lib/marca';

// Supabase (proyecto compartido, tabla decord_leads). La llave anon es pública por diseño: la tabla tiene RLS
// sin políticas y solo se escribe con la función decord_crear_lead (valida y limita a 5 envíos/hora por IP).
// ponytail: con SUPABASE_SERVICE_ROLE_KEY en Vercel se podría revocar el execute a anon y dejar solo esta ruta.
const SB_URL = process.env.SUPABASE_URL ?? 'https://opagblruzwsrxsggkjsa.supabase.co';
const SB_KEY =
  process.env.SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wYWdibHJ1endzcnhzZ2dranNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MzYwMjMsImV4cCI6MjEwMzExMjAyM30.CYY2OTGQlh-JeAiPAN_hvmGwt5X-JJeRhoatTNXonME';
const sb = { apikey: SB_KEY, authorization: `Bearer ${SB_KEY}` };

const MAX_IMG = 2 * 1024 * 1024;

const json = (body: unknown, status = 200) => Response.json(body, { status });

export async function POST(req: Request) {
  if (Number(req.headers.get('content-length') ?? 0) > 4 * 1024 * 1024) return json({ error: 'Solicitud demasiado grande.' }, 413);
  const body = await req.json().catch(() => null);
  if (!body) return json({ error: 'Solicitud inválida.' }, 400);

  // Honeypot: los bots lo llenan; respondemos como si todo saliera bien.
  if (body.sitio) return json({ id: randomUUID() });

  const r = leadSchema.safeParse(body.lead);
  if (!r.success) return json({ error: r.error.issues[0]?.message ?? 'Revisa tus datos.' }, 400);
  const lead = r.data;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'desconocida';
  if (process.env.TURNSTILE_SECRET_KEY) {
    const v = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response: String(body.turnstile ?? ''), remoteip: ip }),
    }).then((x) => x.json()).catch(() => ({ success: false }));
    if (!v.success) return json({ error: 'No pudimos verificar que eres una persona. Intenta de nuevo.' }, 400);
  }

  // Imagen de la maqueta (JPEG del canvas). Si falla la subida, el lead se guarda igual.
  let imagenUrl: string | null = null;
  const img = typeof body.imagen === 'string' && body.imagen.startsWith('data:image/jpeg;base64,') ? Buffer.from(body.imagen.slice(23), 'base64') : null;
  if (img && img.length <= MAX_IMG) {
    const ruta = `${new Date().toISOString().slice(0, 7)}/${randomUUID()}.jpg`;
    const up = await fetch(`${SB_URL}/storage/v1/object/decord-maquetas/${ruta}`, {
      method: 'POST',
      headers: { ...sb, 'content-type': 'image/jpeg', 'x-upsert': 'false' },
      body: img,
    }).catch(() => null);
    if (up?.ok) imagenUrl = `${SB_URL}/storage/v1/object/public/decord-maquetas/${ruta}`;
  }

  const utm = body.utm ?? {};
  const res = await fetch(`${SB_URL}/rest/v1/rpc/decord_crear_lead`, {
    method: 'POST',
    headers: { ...sb, 'content-type': 'application/json' },
    body: JSON.stringify({
      p: {
        tipo_proyecto: lead.servicio, tipo_espacio: lead.espacio, metros: lead.metros, zonas: lead.zonas, estilo: lead.estilo,
        prioridades: lead.prioridades, presupuesto: lead.presupuesto, plazo: lead.plazo, ciudad: lead.ciudad,
        nombre: lead.datos.nombre, empresa: lead.datos.empresa, whatsapp: lead.datos.whatsapp, email: lead.datos.email,
        acepta_datos: lead.datos.acepta, config_json: { ...lead, datos: undefined }, imagen_url: imagenUrl,
        utm_source: utm.source ?? null, utm_medium: utm.medium ?? null, utm_campaign: utm.campaign ?? null,
        ip_hash: createHash('sha256').update(ip).digest('hex'),
      },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    if (t.includes('limite_envios')) return json({ error: 'Ya recibimos varias solicitudes desde tu conexión. Escríbenos por WhatsApp.' }, 429);
    console.error('decord_crear_lead', res.status, t);
    return json({ error: 'No pudimos guardar tu proyecto. Escríbenos por WhatsApp.' }, 502);
  }
  const id: string = await res.json();

  await notificar(lead, id, imagenUrl);
  return json({ id });
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Correos con Resend (si hay RESEND_API_KEY). Un fallo de correo no pierde el lead: ya está en Supabase.
async function notificar(l: Lead, id: string, imagen: string | null) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const from = process.env.RESEND_FROM ?? 'Decord Design <onboarding@resend.dev>';
  const equipo = process.env.LEADS_EMAIL ?? MARCA.email;
  const filas: (readonly [string, string])[] = [
    ...resumen(l),
    ['Nombre', l.datos.nombre],
    ['Empresa', l.datos.empresa || '—'],
    ['WhatsApp', l.datos.whatsapp],
    ['Correo', l.datos.email],
  ];
  const tabla = (f: readonly (readonly [string, string])[]) =>
    `<table style="border-collapse:collapse;font:14px Arial,sans-serif;color:#362b25">${f
      .map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#7a6d63">${esc(k)}</td><td style="padding:6px 0"><b>${esc(v)}</b></td></tr>`)
      .join('')}</table>`;
  const foto = imagen ? `<p><img src="${imagen}" alt="Maqueta del proyecto" width="560" style="max-width:100%;border:1px solid #cfc3b3"></p>` : '';
  const wa = `https://wa.me/${l.datos.whatsapp.replace('+', '')}`;
  const enviar = (to: string, subject: string, html: string, reply_to?: string) =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html, reply_to }),
    }).then((r) => (r.ok ? null : r.text().then((t) => console.error('resend', r.status, t))));

  await Promise.allSettled([
    enviar(
      equipo,
      `Nuevo proyecto: ${l.datos.nombre} · ${l.ciudad} (${l.metros} m²)`,
      `<div style="background:#efe8de;padding:24px"><p style="font:12px monospace;letter-spacing:2px">FICHA Nº ${id.slice(0, 8).toUpperCase()}</p>${foto}${tabla(filas)}<p><a href="${wa}">Escribir por WhatsApp</a></p></div>`,
      l.datos.email,
    ),
    enviar(
      l.datos.email,
      'Ya empezamos a diseñar tu espacio · Decord Design',
      `<div style="background:#efe8de;padding:24px;font:15px Arial,sans-serif;color:#362b25"><h1 style="font:28px Georgia,serif">Hola, ${esc(l.datos.nombre.split(' ')[0])}.</h1><p>Recibimos tu proyecto y ya empezamos a diseñar tu espacio. Te escribimos muy pronto para conocerlo mejor.</p>${foto}${tabla(resumen(l))}<p>¿Quieres adelantar la conversación? Escríbenos por <a href="https://wa.me/${MARCA.whatsapp}">WhatsApp al ${MARCA.telefono}</a>.</p><p>— El equipo de Decord Design</p></div>`,
    ),
  ]);
}
