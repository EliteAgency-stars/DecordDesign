import type { MetadataRoute } from 'next';
import { proyectos } from '@/lib/portafolio';
import { MARCA } from '@/lib/marca';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: MARCA.web, priority: 1 }, ...proyectos.map((p) => ({ url: `${MARCA.web}/proyectos/${p.slug}`, priority: 0.7 }))];
}
