"""Genera migracion/inventario.json y migracion/limpias/{id}.png desde el PDF.
Uso: python scripts/inventario.py  (requiere pymupdf y haber corrido la extracción; ver CLAUDE.md)"""
import json, os, pymupdf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

# (slug, nombre público, páginas, categoría, ciudad, estado). Clientes: migracion/clientes.json (privado, fuera de git)
PROYECTOS = [
    ('casa-sibate', 'Casa en Sibaté', (9, 19), 'residencial', 'Sibaté', 'diseñado'),
    ('apartamento-chapinero', 'Apartamento en Chapinero', (20, 30), 'residencial', 'Bogotá', 'diseñado'),
    ('habitacion-juvenil-bogota', 'Habitación juvenil', (31, 35), 'residencial', 'Bogotá', 'diseñado'),
    ('habitacion-estudio-bogota', 'Habitación con estudio', (36, 38), 'residencial', 'Bogotá', 'diseñado'),
    ('motel-tematico-medellin', 'Motel temático', (40, 57), 'hospitalidad', 'Medellín', 'diseñado'),
    ('local-belleza-bogota', 'Local de belleza', (58, 62), 'comercial', 'Bogotá', 'diseñado'),
    ('bar-terraza-facatativa', 'Bar con terraza', (63, 70), 'gastronomia', 'Facatativá', 'diseñado'),
    ('tienda-mosquera', 'Tienda y oficinas', (71, 82), 'comercial', 'Mosquera', 'diseñado'),
    ('postres-zona-t', 'Tienda de postres', (83, 93), 'gastronomia', 'Bogotá', 'diseñado'),
    ('sin-clasificar-restaurante', 'Restaurante (sin clasificar)', (94, 101), 'gastronomia', 'Bogotá', 'diseñado'),
    ('turistico-la-vega', 'Proyecto turístico', (103, 121), 'turistico', 'La Vega', 'diseñado'),
    ('sede-educativa-aviacion', 'Sede educativa de aviación', (123, 170), 'institucional', 'Bogotá', 'realizado'),
    ('oficinas-recreativas-bogota', 'Oficinas con zona recreativa', (172, 200), 'oficina', 'Bogotá', 'realizado'),
    ('oficinas-creativas-bogota', 'Oficinas creativas', (201, 208), 'oficina', 'Bogotá', 'diseñado'),
    ('oficinas-barranquilla', 'Oficinas corporativas', (209, 221), 'oficina', 'Barranquilla', 'diseñado'),
    ('habitacion-principal-bogota', 'Habitación principal', (224, 225), 'residencial', 'Bogotá', 'realizado'),
    ('apartamento-tematico-bogota', 'Apartamento temático', (226, 228), 'residencial', 'Bogotá', 'realizado'),
    ('apartamento-bogota', 'Apartamento en Bogotá', (229, 232), 'residencial', 'Bogotá', 'realizado'),
]
# Las fotos reales de las páginas 234-247 y 249-257 son del mismo proyecto que sus renders.
EXTRA = {(234, 247): 'sede-educativa-aviacion', (249, 257): 'oficinas-recreativas-bogota'}

PLANOS = {9, 20, 31, 43, 49, 54, 58, 63, 71, 83, 94, 123, 139, 157, 161, 165, 168, 180, 188, 201, 209}

ESPACIO = {}  # página -> descripción del espacio (revisada en hojas de contacto)
for rango, txt in [
    ((9,), 'planta arquitectónica amoblada'), ((10,), 'habitación principal con muro texturizado'),
    ((11, 12), 'vestier con closets y vitrinas iluminadas'), ((13,), 'baño con lavamanos flotante y tina'),
    ((14,), 'habitación con papel de colgadura texturizado'), ((15, 17), 'habitación gamer con iluminación neón'),
    ((18,), 'sala de televisión'), ((19,), 'comedor y circulación'), ((20,), 'planta del apartamento amoblada'),
    ((21, 22), 'cocina abierta con isla y comedor'), ((23,), 'sala con mueble de televisión'),
    ((24,), 'cocina en tonos grises'), ((25,), 'zona de ropas'), ((26,), 'baño'),
    ((27,), 'habitación principal'), ((28,), 'habitación infantil temática de aviones'), ((29,), 'habitación'),
    ((30,), 'baño con ducha en vidrio'), ((31,), 'planta de la habitación'),
    ((32, 35), 'habitación juvenil en tonos rosa con cabecero en arco'), ((36, 38), 'habitación con zona de estudio'),
    ((40, 42), 'suite temática en rojo con detalles dorados'), ((43,), 'planta de suite'),
    ((44, 48), 'suite con iluminación neón rosa'), ((49,), 'planta de suite'),
    ((50, 53), 'suite temática con jacuzzi'), ((54,), 'planta de suite'), ((55, 57), 'suite con iluminación rosa'),
    ((58,), 'planta del local'), ((59, 62), 'local de belleza con vitrinas y exhibidores iluminados'),
    ((63,), 'planta del bar'), ((64, 65), 'terraza con pérgola y luces colgantes'),
    ((66,), 'barra del bar con muro en ladrillo'), ((67, 68), 'baño con jardín vertical'),
    ((69, 70), 'terraza con mesas'), ((71,), 'planta del local'), ((72, 75), 'tienda con exhibidores y punto de pago'),
    ((76,), 'estanterías y cocineta'), ((77,), 'baño'), ((78, 79), 'zonas de exhibición de la tienda'),
    ((80, 82), 'oficina administrativa'), ((83,), 'planta del local'), ((84, 85), 'fachada y terraza con sombrillas'),
    ((86, 89), 'salón y barra de postres en tonos rosa'), ((90, 91), 'barra de toppings'),
    ((92,), 'baño en tonos rosa'), ((93,), 'zona de servicio'), ((94,), 'planta del restaurante por zonas'),
    ((95, 101), 'salón de restaurante con sillas naranja'), ((103, 105), 'portería y acceso vehicular'),
    ((106,), 'vista aérea del proyecto'), ((107, 108), 'muro de señalética iluminado'),
    ((109, 110), 'acceso y recepción'), ((111, 112), 'recepción con mobiliario orgánico'),
    ((113, 115), 'senderos y paisajismo nocturno'), ((116, 121), 'decks de madera y zona social'),
    ((123,), 'planta de oficinas'), ((124, 126), 'recepción'), ((127, 131), 'oficinas administrativas'),
    ((132, 133), 'hall con gráfica de aviación'), ((134, 135), 'aula de clase'), ((136, 138), 'oficinas y cafetería'),
    ((139,), 'planta de oficina gerencial'), ((140, 145), 'oficina gerencial temática de aviación'),
    ((146, 147), 'oficina con muro verde y gráfica de avión'), ((148,), 'recepción'), ((149,), 'escaleras'),
    ((150, 152), 'zona de bienestar con mesas de ping-pong'), ((153,), 'cafetería'), ((154,), 'pasillo y baño'),
    ((155, 156), 'sala de juntas'), ((157,), 'planta de oficinas'), ((158, 160), 'oficinas'),
    ((161,), 'planta de oficina'), ((162, 164), 'oficinas operativas'), ((165,), 'planta de oficina'),
    ((166, 167), 'oficinas'), ((168,), 'planta de oficina'), ((169, 170), 'oficina con archivo'),
    ((172,), 'recepción'), ((173,), 'puesto de trabajo'), ((174,), 'zona de lockers'), ((175,), 'oficina'),
    ((176,), 'pasillo'), ((177, 179), 'área de trabajo abierta'), ((180,), 'planta de oficinas'),
    ((181,), 'área de trabajo'), ((182,), 'oficina con jardín interior'), ((183,), 'área de trabajo'),
    ((184, 186), 'oficinas privadas'), ((187,), 'área de trabajo'), ((188,), 'planta de oficinas'),
    ((189, 190), 'oficina gerencial'), ((191, 192), 'lounge «El Retrovisor»'), ((193,), 'pasillo'),
    ((194, 195), 'lockers y cabinas telefónicas'), ((196,), 'cafetería y hall'), ((197, 198), 'baños'),
    ((199, 200), 'zona recreativa con cancha sintética'), ((201,), 'planta de oficinas'),
    ((202,), 'recepción con logo'), ((203,), 'zona de trabajo y cocineta'), ((204, 205), 'oficina abierta'),
    ((206, 208), 'oficinas y sala de reuniones'), ((209,), 'planta de oficinas'), ((210, 211), 'sala de juntas'),
    ((212,), 'oficina con mural'), ((213, 214), 'sala de juntas'), ((215,), 'área de trabajo'),
    ((216, 218), 'oficinas privadas'), ((219, 220), 'recepción y lounge'), ((221,), 'área de trabajo'),
    ((224, 225), 'habitación principal'), ((226,), 'sala temática'), ((227,), 'cocina y habitación temáticas'),
    ((228,), 'sala comedor temática'), ((229,), 'cocina y comedor'), ((230, 232), 'habitación principal'),
    ((234,), 'aula con siluetas de avión'), ((235,), 'hall con gráfica de aviación'),
    ((236, 237), 'oficinas y cafetería'), ((238,), 'aula de clase'), ((239, 242), 'oficina gerencial temática de aviación'),
    ((243, 246), 'oficinas con murales'), ((247,), 'lockers'), ((249,), 'baño y lockers'),
    ((250, 251), 'área de trabajo'), ((252,), 'oficina y jardín de piedra'), ((253,), 'área de trabajo'),
    ((254,), 'lockers'), ((255,), 'cabinas telefónicas y lounge «El Retrovisor»'), ((256,), 'área de trabajo'),
    ((257,), 'terraza con cancha sintética y comedor'),
]:
    for p in range(rango[0], rango[-1] + 1):
        ESPACIO[p] = txt

# Pares diseño (render) -> realidad (foto de obra terminada), verificados visualmente.
PARES = [
    ('p140-1', 'p239-2'), ('p134-1', 'p234-2'), ('p133-2', 'p235-2'), ('p146-2', 'p243-1'), ('p141-1', 'p242-1'),
    ('p174-2', 'p249-2'), ('p192-1', 'p255-2'), ('p195-2', 'p255-1'), ('p194-2', 'p254-1'),
    ('p182-1', 'p252-1'), ('p182-2', 'p252-2'),
]
HERO = {'p239-2', 'p255-2', 'p257-1', 'p064-1', 'p085-1', 'p119-1', 'p088-1', 'p021-1',
        'p234-2', 'p226-2', 'p191-1', 'p140-1'}
TIPO_TXT = {'plano': 'Plano', 'render': 'Render', 'obra-terminada': 'Fotografía de obra terminada'}


def proyecto(pag):
    for (a, b), slug in EXTRA.items():
        if a <= pag <= b:
            return next(p for p in PROYECTOS if p[0] == slug)
    return next((p for p in PROYECTOS if p[2][0] <= pag <= p[2][1]), None)


ids = json.load(open('migracion/raw/ids.json'))
d = pymupdf.open('insumos/portafolio-decord.pdf')
smask = {x['xref']: x['smask'] for x in json.load(open('migracion/raw/xrefs.json'))}
os.makedirs('migracion/limpias', exist_ok=True)
diseno = dict(PARES)
pareja = diseno | {b: a for a, b in PARES}
inv = []
for x in ids:
    pr = proyecto(x['pagina'])
    if not pr:
        continue
    tipo = 'plano' if x['pagina'] in PLANOS else ('obra-terminada' if x['pagina'] >= 222 else 'render')
    xref = int(x['archivo'][1:].split('.')[0])
    pix = pymupdf.Pixmap(d, xref)
    if smask.get(xref):  # aplica la transparencia original; sharp la aplana sobre blanco
        pix = pymupdf.Pixmap(pix, pymupdf.Pixmap(d, smask[xref]))
    if pix.n - pix.alpha != 3:
        pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
    out = f'migracion/limpias/{x["id"]}.png'
    pix.save(out)
    # Algunas plantas vienen rotadas y recortadas por Canva: se renderiza el área visible de la página.
    page = d[x['pagina'] - 1]
    rect, m = page.get_image_rects(xref, transform=True)[0]
    if abs(m.b) > 1e-3:
        clip = rect & (page.rect - (0, 0, 0, 30))  # sin el pie de página con el cliente
        pix = page.get_pixmap(clip=clip, matrix=pymupdf.Matrix(800 / clip.width, 800 / clip.width))
        pix.save(out)
        x['w'], x['h'] = pix.width, pix.height
    espacio = ESPACIO.get(x['pagina'], 'espacio')
    nombre = 'restaurante' if pr[0] == 'sin-clasificar-restaurante' else pr[1].lower()
    inv.append({
        'id': x['id'], 'origen': out, 'pagina': x['pagina'], 'ancho': x['w'], 'alto': x['h'],
        'proyecto': pr[0], 'categoria': pr[3], 'tipo': tipo, 'espacio': espacio,
        'calidad': 'hero' if x['id'] in HERO else 'galeria',
        'alt': f'{TIPO_TXT[tipo]}: {espacio}. {nombre.capitalize()} en {pr[4]}, Decord Design',
        'par': pareja.get(x['id']),
        'rol_par': ('diseño' if x['id'] in diseno else 'realidad') if x['id'] in pareja else None,
    })
proyectos = [dict(zip(['slug', 'nombre', 'paginas', 'categoria', 'ciudad', 'estado'], p)) for p in PROYECTOS]
# Nombre del cliente solo si está autorizado: {"slug": {"cliente": "...", "publicar": true}} en migracion/clientes.json
clientes = json.load(open('migracion/clientes.json', encoding='utf-8')) if os.path.exists('migracion/clientes.json') else {}
for p in proyectos:
    c = clientes.get(p['slug'], {})
    p['cliente'] = c.get('cliente') if c.get('publicar') else None
# Conserva lo ya optimizado; optimizar.mjs solo procesa imágenes sin "blur" (nuevas o rotadas).
if os.path.exists('migracion/inventario.json'):
    previo = {i['id']: i for i in json.load(open('migracion/inventario.json', encoding='utf-8'))['imagenes']}
    for i in inv:
        p = previo.get(i['id'], {})
        if 'blur' in p and (p.get('ancho'), p.get('alto')) == (i['ancho'], i['alto']):
            i['anchos'], i['blur'] = p['anchos'], p['blur']
json.dump({'proyectos': proyectos, 'imagenes': inv},
          open('migracion/inventario.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(inv), 'imágenes')
