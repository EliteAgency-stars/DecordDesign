import { z } from 'zod';

z.config(z.locales.es());

// Opciones del configurador (las comparten el formulario, el servidor y los correos).
export const SERVICIOS = {
  remodelacion: 'Remodelación',
  construccion: 'Construcción desde cero',
  interior: 'Diseño interior',
  planimetria: 'Planimetría y licencias',
} as const;
export const ESPACIOS = {
  local: 'Local comercial',
  consultorio: 'Consultorio o clínica estética',
  oficina: 'Oficina',
  restaurante: 'Restaurante o café',
  vivienda: 'Vivienda',
  otro: 'Otro',
} as const;
export const ESTILOS = {
  minimalista: 'Minimalista',
  calido: 'Cálido natural',
  industrial: 'Industrial',
  lujo: 'Lujo contemporáneo',
  asesoria: 'No sé, quiero asesoría',
} as const;
export const PRIORIDADES = {
  iluminacion: 'Iluminación',
  mobiliario: 'Mobiliario a medida',
  fachada: 'Fachada y vitrina',
  cocina: 'Cocina o barra',
  banos: 'Baños',
  almacenamiento: 'Almacenamiento',
  senaletica: 'Señalética de marca',
} as const;
// [COMPLETAR: rangos de inversión reales en COP con Decord] — mientras tanto, sin cifras inventadas.
export const PRESUPUESTOS = ['Ya tengo un presupuesto definido', 'Aún no lo tengo claro', 'Prefiero conversarlo'] as const;
export const PLAZOS = ['Lo antes posible', '1–3 meses', '3–6 meses', 'Estoy explorando'] as const;

const clave = <T extends Record<string, string>>(o: T) => z.enum(Object.keys(o) as [keyof T & string, ...(keyof T & string)[]]);

// Celular colombiano (3XX XXX XXXX) o número internacional con +.
export function normalizarWhatsapp(v: string) {
  const d = v.replace(/[\s\-().]/g, '');
  if (/^3\d{9}$/.test(d)) return `+57${d}`;
  if (/^57 ?3\d{9}$/.test(d)) return `+${d}`;
  if (/^\+\d{8,15}$/.test(d)) return d;
  return null;
}

export const datosSchema = z.object({
  nombre: z.string().trim().min(2, 'Escribe tu nombre').max(120),
  empresa: z.string().trim().max(120).optional().default(''),
  whatsapp: z
    .string()
    .transform((v, ctx) => normalizarWhatsapp(v) ?? (ctx.addIssue({ code: 'custom', message: 'Escribe un celular válido, ej. 300 123 4567' }), z.NEVER)),
  email: z.email('Escribe un correo válido').max(200),
  acepta: z.literal(true, 'Necesitamos tu autorización para contactarte'),
});

export const leadSchema = z.object({
  servicio: clave(SERVICIOS),
  espacio: clave(ESPACIOS),
  metros: z.number().int().min(10).max(1000),
  zonas: z.number().int().min(1).max(8),
  estilo: clave(ESTILOS),
  prioridades: z.array(clave(PRIORIDADES)).max(7),
  presupuesto: z.enum(PRESUPUESTOS),
  plazo: z.enum(PLAZOS),
  ciudad: z.string().trim().min(2).max(120),
  datos: datosSchema,
});

export type Lead = z.infer<typeof leadSchema>;

export function resumen(l: Pick<Lead, 'servicio' | 'espacio' | 'metros' | 'zonas' | 'estilo' | 'prioridades' | 'presupuesto' | 'plazo' | 'ciudad'>) {
  return [
    ['Proyecto', SERVICIOS[l.servicio]],
    ['Espacio', ESPACIOS[l.espacio]],
    ['Área', `${l.metros} m²`],
    ['Zonas', String(l.zonas)],
    ['Estilo', ESTILOS[l.estilo]],
    ['Prioridades', l.prioridades.map((p) => PRIORIDADES[p]).join(', ') || 'Ninguna en particular'],
    ['Inversión', l.presupuesto],
    ['Plazo', l.plazo],
    ['Ciudad', l.ciudad],
  ] as const;
}
