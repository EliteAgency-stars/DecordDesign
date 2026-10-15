// Optimiza las imágenes del inventario a AVIF + WebP y agrega blur y rutas al inventario.
// Uso: node scripts/optimizar.mjs   (después de python scripts/inventario.py)
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const INV = 'migracion/inventario.json';
const OUT = 'public/portafolio';
// El PDF trae las imágenes a 800 px máximo: no se escalan hacia arriba.
const ANCHOS = [640, 1280, 2048];
const LIMITE_KB = 250;

mkdirSync(OUT, { recursive: true });
mkdirSync('public/marca', { recursive: true });
const inv = JSON.parse(readFileSync(INV, 'utf8'));
const pesados = [];

for (const img of inv.imagenes.filter((i) => !i.blur)) {
  const base = sharp(img.origen).flatten({ background: '#ffffff' }); // sin metadatos: sharp no copia EXIF por defecto
  img.anchos = ANCHOS.filter((w) => w < img.ancho).concat(img.ancho);
  for (const w of img.anchos) {
    const r = base.clone().resize({ width: w, withoutEnlargement: true });
    const avif = await r.clone().avif({ quality: 55, effort: 5 }).toBuffer();
    const webp = await r.clone().webp({ quality: 74 }).toBuffer();
    writeFileSync(`${OUT}/${img.id}-${w}.avif`, avif);
    writeFileSync(`${OUT}/${img.id}-${w}.webp`, webp);
    if (webp.length / 1024 > LIMITE_KB) pesados.push(`${img.id}-${w}.webp ${Math.round(webp.length / 1024)} KB`);
  }
  const blur = await base.clone().resize(16).webp({ quality: 40 }).toBuffer();
  img.blur = `data:image/webp;base64,${blur.toString('base64')}`;
}

for (const [src, nombre] of [['migracion/raw/logo-269.png', 'logo-oscuro'], ['migracion/raw/logo-281.png', 'logo-claro']]) {
  await sharp(src).trim().png({ compressionLevel: 9 }).toFile(`public/marca/${nombre}.png`);
}

writeFileSync(INV, JSON.stringify(inv, null, 1));
console.log(inv.imagenes.length, 'imágenes optimizadas; sobre el límite:', pesados.length ? pesados : 'ninguna');
