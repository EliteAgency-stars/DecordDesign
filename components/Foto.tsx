import { srcset, src, type Imagen } from '@/lib/imagen';

type Props = {
  img: Imagen;
  sizes: string;
  className?: string;
  prioridad?: boolean;
};

// Imágenes ya optimizadas en build (AVIF/WebP); el blur hace de placeholder mientras carga.
export function Foto({ img, sizes, className = '', prioridad }: Props) {
  return (
    <picture>
      <source type="image/avif" srcSet={srcset(img, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcset(img, 'webp')} sizes={sizes} />
      <img
        src={src(img)}
        alt={img.alt}
        width={img.ancho}
        height={img.alto}
        loading={prioridad ? 'eager' : 'lazy'}
        fetchPriority={prioridad ? 'high' : undefined}
        decoding="async"
        className={className}
        style={{ backgroundImage: `url(${img.blur})`, backgroundSize: 'cover' }}
      />
    </picture>
  );
}
