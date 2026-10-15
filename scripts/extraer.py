"""Paso 1: texto completo, miniaturas de página e imágenes embebidas (>=600 px). Uso: python scripts/extraer.py ."""
import pymupdf, sys, os, json, hashlib
root = sys.argv[1]
d = pymupdf.open(os.path.join(root, 'insumos/portafolio-decord.pdf'))
out = []
with open(os.path.join(root, 'migracion/texto-completo.txt'), 'w', encoding='utf-8') as f:
    for i, p in enumerate(d):
        f.write(f'\n===== PÁGINA {i+1} =====\n{p.get_text()}')
seen = {}
for i, p in enumerate(d):
    # miniatura de página para hojas de contacto + render 2x de respaldo
    p.get_pixmap(dpi=40).save(os.path.join(root, f'migracion/paginas/p{i+1:03d}.jpg'))
    for img in p.get_images(full=True):
        xref = img[0]
        if xref in seen:
            seen[xref]['paginas'].append(i+1); continue
        info = d.extract_image(xref)
        w, h = info['width'], info['height']
        rec = {'xref': xref, 'paginas': [i+1], 'w': w, 'h': h, 'ext': info['ext'], 'smask': img[1]}
        seen[xref] = rec
        if max(w, h) < 600:
            rec['descartada'] = 'pequeña'; continue
        name = f'x{xref}.{info["ext"]}'
        open(os.path.join(root, 'migracion/raw', name), 'wb').write(info['image'])
        rec['archivo'] = name
json.dump(list(seen.values()), open(os.path.join(root, 'migracion/raw/xrefs.json'), 'w'), indent=1)
print(len(seen), sum('archivo' in r for r in seen.values()))
