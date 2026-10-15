"""Paso 2: id por página y posición (pPPP-N) y detección de duplicados con phash. Uso: python scripts/ids.py"""
import pymupdf, json, os, imagehash
from PIL import Image
d = pymupdf.open('insumos/portafolio-decord.pdf')
r = {x['xref']: x for x in json.load(open('migracion/raw/xrefs.json')) if 'archivo' in x}
rows, hashes = [], []
for pno in range(8, 257):  # páginas 9..257 (proyectos)
    p = d[pno]; imgs = []
    for xref in {i[0] for i in p.get_images(full=True)} & set(r):
        rect = p.get_image_rects(xref)[0]
        imgs.append((rect.x0, rect.y0, xref, rect))
    for k, (_, _, xref, rect) in enumerate(sorted(imgs)):
        x = r[xref]; f = 'migracion/raw/' + x['archivo']
        h = imagehash.phash(Image.open(f).convert('RGB'))
        dup = next((rid for rid, hh in hashes if h - hh <= 4), None)
        rid = f'p{pno+1:03d}-{k+1}'
        rows.append({'id': rid, 'archivo': x['archivo'], 'pagina': pno+1, 'w': x['w'], 'h': x['h'],
                     'area_pt': round(rect.width*rect.height), 'duplicado_de': dup})
        if not dup: hashes.append((rid, h))
json.dump(rows, open('migracion/raw/ids.json', 'w'), indent=1)
print(len(rows), 'dups', [(x['id'], x['duplicado_de']) for x in rows if x['duplicado_de']])
print('small area', [(x['id'], x['area_pt'], x['w']) for x in rows if x['area_pt'] < 60000])
