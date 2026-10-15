// Módulo puro: respuestas del configurador -> descripción de la maqueta.
// Lo dibujan la escena 3D y el plano 2D de respaldo. Sin imports, para poder probarlo con `node`.

export type Servicio = 'remodelacion' | 'construccion' | 'interior' | 'planimetria';
export type Espacio = 'local' | 'consultorio' | 'oficina' | 'restaurante' | 'vivienda' | 'otro';
export type Estilo = 'minimalista' | 'calido' | 'industrial' | 'lujo' | 'asesoria';
export type Prioridad = 'iluminacion' | 'mobiliario' | 'fachada' | 'cocina' | 'banos' | 'almacenamiento' | 'senaletica';

export type Config = {
  servicio?: Servicio;
  espacio?: Espacio;
  metros: number;
  zonas?: number;
  estilo?: Estilo;
  prioridades: Prioridad[];
};

export type Caja = {
  id: string;
  tipo: 'muro' | 'mueble' | 'luminaria' | 'vidrio' | 'aviso' | 'estaca';
  x: number; y: number; z: number; // centro, en unidades de escena
  w: number; h: number; d: number;
  color: string;
};

export type Paleta = { fondo: string; piso: string; muro: string; acento: string; madera: string };

export type Escena = {
  vista: 'vacia' | 'plano' | 'maqueta';
  ancho: number; fondo: number; // metros reales (para las cotas)
  W: number; D: number; // unidades de escena (W siempre 10)
  altura: number;
  lote: boolean;
  paleta: Paleta;
  luz: number; // 0..1
  cajas: Caja[];
  zonas: { nombre: string; x: number; z: number }[];
};

export const PALETAS: Record<Estilo | 'maqueta' | 'desgastado', Paleta> = {
  maqueta: { fondo: '#efe8de', piso: '#f4f1ec', muro: '#fbfaf7', acento: '#d9d3ca', madera: '#e6e0d6' },
  desgastado: { fondo: '#e4e1dc', piso: '#9c9890', muro: '#b9b5ad', acento: '#8d887f', madera: '#a39d92' },
  minimalista: { fondo: '#efe8de', piso: '#e9e6e1', muro: '#ffffff', acento: '#2b2b2b', madera: '#d8cfc2' },
  calido: { fondo: '#efe8de', piso: '#b98c62', muro: '#efe4d3', acento: '#6f7f5a', madera: '#9a6a43' },
  industrial: { fondo: '#e6e2dc', piso: '#8e8e8a', muro: '#a0533d', acento: '#1f1f1f', madera: '#7b5a3c' },
  lujo: { fondo: '#efe8de', piso: '#e8e2d8', muro: '#2f2925', acento: '#b8925a', madera: '#4a3a2f' },
  asesoria: { fondo: '#efe8de', piso: '#d9cbb8', muro: '#f3eee6', acento: '#362b25', madera: '#b58e6a' },
};

export const NOMBRES_ZONAS: Record<Espacio, string[]> = {
  local: ['Exhibición', 'Caja', 'Bodega', 'Probador', 'Vitrina', 'Baño', 'Oficina', 'Taller'],
  consultorio: ['Recepción', 'Sala de espera', 'Consultorio', 'Cabina', 'Baño', 'Esterilización', 'Oficina', 'Depósito'],
  oficina: ['Recepción', 'Área abierta', 'Sala de juntas', 'Gerencia', 'Cocineta', 'Baño', 'Archivo', 'Lounge'],
  restaurante: ['Salón', 'Barra', 'Cocina', 'Baño', 'Terraza', 'Bodega', 'Caja', 'Zona VIP'],
  vivienda: ['Sala', 'Comedor', 'Cocina', 'Habitación', 'Baño', 'Estudio', 'Ropas', 'Habitación 2'],
  otro: ['Zona 1', 'Zona 2', 'Zona 3', 'Zona 4', 'Zona 5', 'Zona 6', 'Zona 7', 'Zona 8'],
};

export const ZONAS_POR_DEFECTO: Record<Espacio, number> = { local: 3, consultorio: 4, oficina: 4, restaurante: 4, vivienda: 5, otro: 2 };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const r2 = (v: number) => Math.round(v * 100) / 100;

// Mueble principal según el nombre de la zona: [ancho rel., fondo rel., alto en m, al fondo de la celda]
function mueblePara(nombre: string): [number, number, number, boolean] {
  if (/Barra|Caja|Recepción/.test(nombre)) return [0.6, 0.18, 1.05, false];
  if (/Consultorio|Cabina|Habitación/.test(nombre)) return [0.35, 0.5, 0.6, false];
  if (/Sala de espera|Lounge|^Sala$/.test(nombre)) return [0.55, 0.2, 0.8, true];
  if (/Exhibición|Vitrina|Bodega|Archivo|Depósito|Taller|Ropas/.test(nombre)) return [0.75, 0.16, 1.9, true];
  if (/Cocina|Cocineta|Esterilización/.test(nombre)) return [0.8, 0.2, 0.9, true];
  if (/Baño|Probador/.test(nombre)) return [0.25, 0.3, 0.8, true];
  return [0.5, 0.3, 0.75, false]; // mesa
}

export function buildScene(c: Config): Escena {
  const metros = clamp(Math.round(c.metros || 60), 10, 1000);
  const ancho = Math.sqrt(metros * 1.5);
  const fondo = metros / ancho;
  const s = 10 / ancho; // unidades por metro
  const W = 10;
  const D = r2(fondo * s);
  const paleta = c.estilo ? PALETAS[c.estilo] : c.servicio === 'remodelacion' ? PALETAS.desgastado : PALETAS.maqueta;
  const base = { ancho: r2(ancho), fondo: r2(fondo), W, D, paleta, zonas: [] as Escena['zonas'] };

  if (!c.servicio) return { ...base, vista: 'vacia', altura: 0, lote: false, luz: 0.4, cajas: [] };

  const plano = c.servicio === 'planimetria';
  const lote = c.servicio === 'construccion' && !c.espacio;
  const altura = plano ? 0.06 : r2(clamp(2.8 * s, 1, 2.2));
  const hm = altura / 2.8; // unidades por metro en vertical
  const t = 0.14; // espesor de muro
  const cajas: Caja[] = [];
  const muro = (id: string, x: number, z: number, w: number, d: number, h = altura) =>
    cajas.push({ id, tipo: 'muro', x: r2(x), y: r2(h / 2), z: r2(z), w: r2(w), h: r2(h), d: r2(d), color: paleta.muro });

  if (lote) {
    // Lote vacío: solo estacas en las esquinas.
    for (const [i, [x, z]] of [[-1, -1], [1, -1], [1, 1], [-1, 1]].entries())
      cajas.push({ id: `estaca-${i}`, tipo: 'estaca', x: (x * W) / 2, y: 0.2, z: (z * D) / 2, w: 0.08, h: 0.4, d: 0.08, color: paleta.acento });
  } else {
    // Perímetro, con acceso en la fachada (z = +D/2).
    const puerta = Math.min(2.2, W * 0.3);
    muro('muro-fondo', 0, -D / 2, W, t);
    muro('muro-izq', -W / 2, 0, t, D);
    muro('muro-der', W / 2, 0, t, D);
    const lado = (W - puerta) / 2;
    muro('muro-frente-a', -W / 2 + lado / 2, D / 2, lado, t);
    muro('muro-frente-b', W / 2 - lado / 2, D / 2, lado, t);
  }

  // Zonas en retícula: filas x columnas proporcionales al espacio.
  if (c.espacio && !lote) {
    const n = clamp(c.zonas ?? ZONAS_POR_DEFECTO[c.espacio], 1, 8);
    const cols = clamp(Math.round(Math.sqrt((n * W) / D)), 1, n);
    const filas = Math.ceil(n / cols);
    const cd = D / filas;
    const nombres = NOMBRES_ZONAS[c.espacio];
    const hDiv = plano ? altura : altura * 0.9;
    const hueco = Math.min(0.9, cd * 0.35);
    let k = 0;
    for (let f = 0; f < filas; f++) {
      const enFila = Math.min(cols, n - f * cols);
      const cw = W / enFila;
      const z0 = -D / 2 + f * cd;
      if (f > 0) {
        // Divisoria entre filas, con un vano por celda.
        for (let i = 0; i < enFila; i++) {
          const x0 = -W / 2 + i * cw;
          const tramo = (cw - Math.min(0.9, cw * 0.35)) / 2;
          muro(`div-f${f}-${i}-a`, x0 + tramo / 2, z0, tramo, t * 0.7, hDiv);
          muro(`div-f${f}-${i}-b`, x0 + cw - tramo / 2, z0, tramo, t * 0.7, hDiv);
        }
      }
      for (let i = 0; i < enFila; i++, k++) {
        const x0 = -W / 2 + i * cw;
        const cx = x0 + cw / 2;
        const cz = z0 + cd / 2;
        if (i > 0) {
          const tramo = (cd - hueco) / 2;
          muro(`div-c${f}-${i}-a`, x0, z0 + tramo / 2, t * 0.7, tramo, hDiv);
          muro(`div-c${f}-${i}-b`, x0, z0 + cd - tramo / 2, t * 0.7, tramo, hDiv);
        }
        const nombre = nombres[k];
        base.zonas.push({ nombre, x: r2(cx), z: r2(cz) });
        if (plano) continue;
        const [rw, rd, hMetros, alFondo] = mueblePara(nombre);
        const mw = cw * rw;
        const md = cd * rd;
        const mz = alFondo ? z0 + md / 2 + t : cz;
        const mh = hMetros * hm;
        cajas.push({ id: `mueble-${k}`, tipo: 'mueble', x: r2(cx), y: r2(mh / 2), z: r2(mz), w: r2(mw), h: r2(mh), d: r2(md), color: k % 2 ? paleta.madera : paleta.acento });
        if (c.prioridades.includes('mobiliario')) {
          const ah = 0.45 * hm;
          cajas.push({ id: `mueble-extra-${k}`, tipo: 'mueble', x: r2(cx + cw * 0.28), y: r2(ah / 2), z: r2(cz + cd * 0.22), w: r2(cw * 0.18), h: r2(ah), d: r2(cd * 0.14), color: paleta.madera });
        }
        if (c.prioridades.includes('iluminacion')) {
          cajas.push({ id: `luz-${k}`, tipo: 'luminaria', x: r2(cx), y: r2(altura - 0.04), z: r2(cz), w: r2(Math.min(cw, cd) * 0.14), h: 0.03, d: r2(Math.min(cw, cd) * 0.14), color: '#fff3d6' });
        }
      }
    }
  }

  if (!plano && !lote) {
    const p = c.prioridades;
    if (p.includes('fachada'))
      cajas.push({ id: 'vitrina', tipo: 'vidrio', x: 0, y: r2(altura * 0.45), z: r2(D / 2), w: r2(Math.min(2.2, W * 0.3)), h: r2(altura * 0.9), d: 0.04, color: '#bcd6dd' });
    if (p.includes('senaletica'))
      cajas.push({ id: 'aviso', tipo: 'aviso', x: 0, y: r2(altura + 0.25), z: r2(D / 2 + 0.05), w: r2(W * 0.35), h: 0.4, d: 0.08, color: paleta.acento });
    if (p.includes('cocina'))
      cajas.push({ id: 'cocina', tipo: 'mueble', x: r2(W / 2 - W * 0.2 - t), y: r2(0.45 * hm), z: r2(-D / 2 + 0.35), w: r2(W * 0.4), h: r2(0.9 * hm), d: 0.5, color: paleta.acento });
    if (p.includes('almacenamiento'))
      cajas.push({ id: 'almacen', tipo: 'mueble', x: r2(-W / 2 + 0.25 + t), y: r2(1.1 * hm), z: 0, w: 0.4, h: r2(2.2 * hm), d: r2(D * 0.5), color: paleta.madera });
    if (p.includes('banos'))
      cajas.push({ id: 'bano', tipo: 'mueble', x: r2(-W / 2 + 0.6), y: r2(0.4 * hm), z: r2(-D / 2 + 0.5), w: 0.5, h: r2(0.8 * hm), d: 0.6, color: '#ffffff' });
  }

  const luz = clamp(0.45 + (c.estilo ? 0.2 : 0) + (c.prioridades.includes('iluminacion') ? 0.3 : 0), 0, 1);
  return { ...base, vista: plano ? 'plano' : 'maqueta', altura, lote, luz, cajas };
}
