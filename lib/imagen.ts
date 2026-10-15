// Tipos y rutas de imagen sin importar el inventario (se usa también en componentes cliente).
export type Imagen = {
  id: string;
  ancho: number;
  alto: number;
  proyecto: string;
  categoria: string;
  tipo: 'render' | 'plano' | 'obra-terminada';
  espacio: string;
  calidad: 'hero' | 'galeria';
  alt: string;
  par: string | null;
  rol_par: 'diseño' | 'realidad' | null;
  anchos: number[];
  blur: string;
};

export const srcset = (i: Imagen, ext: 'avif' | 'webp') =>
  i.anchos.map((w) => `/portafolio/${i.id}-${w}.${ext} ${w}w`).join(', ');

export const src = (i: Imagen) => `/portafolio/${i.id}-${i.anchos.at(-1)}.webp`;
