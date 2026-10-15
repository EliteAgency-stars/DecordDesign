import 'server-only';
import inventario from '@/migracion/inventario.json';
import type { Imagen } from './imagen';

export type { Imagen };

export type Proyecto = {
  slug: string;
  nombre: string;
  categoria: string;
  ciudad: string;
  estado: 'diseñado' | 'realizado';
  cliente: string | null;
};

// Proyectos que no se muestran en el sitio (decisión editorial, siguen en el inventario).
const OCULTOS = new Set(['motel-tematico-medellin']);

export const CATEGORIAS: Record<string, string> = {
  oficina: 'Oficinas',
  institucional: 'Institucional',
  comercial: 'Comercial',
  gastronomia: 'Gastronomía',
  turistico: 'Turístico',
  residencial: 'Residencial',
};

const imagenes = (inventario.imagenes as Imagen[]).filter((i) => !OCULTOS.has(i.proyecto));

// Los "realizados" primero: son los que tienen obra terminada.
export const proyectos: Proyecto[] = (inventario.proyectos as unknown as Proyecto[])
  .filter((p) => !OCULTOS.has(p.slug))
  .map((p) => (p.slug === 'sin-clasificar-restaurante' ? { ...p, nombre: 'Restaurante' } : p))
  .sort((a, b) => Number(b.estado === 'realizado') - Number(a.estado === 'realizado'));

export const imagenesDe = (slug: string) => imagenes.filter((i) => i.proyecto === slug);

export const imagen = (id: string) => imagenes.find((i) => i.id === id)!;

export const portada = (slug: string) => {
  const im = imagenesDe(slug);
  return im.find((i) => i.calidad === 'hero') ?? im.find((i) => i.tipo === 'obra-terminada') ?? im.find((i) => i.tipo === 'render') ?? im[0];
};

export const pares = imagenes
  .filter((i) => i.rol_par === 'diseño')
  .map((d) => ({ diseno: d, realidad: imagen(d.par!) }));

export const totalImagenes = imagenes.length;
