# Decord Design — sitio web

Landing de conversión para DECORD DESIGN SAS (@decordesign_sas), una empresa de diseño, remodelación, construcción y planimetría en Colombia. El objetivo es convertir visitas en solicitudes de proyecto calificadas. Se despliega en Vercel automáticamente con cada push a `main` (repo público: EliteAgency-stars/DecordDesign).

## Estado

| Fase | Estado |
|---|---|
| 1. Auditoría y migración del PDF | ✅ hecha y aprobada (2026-10-14) |
| 2. Identidad visual (tokens, tipografía, logo SVG) | parcial: tokens en `app/globals.css`, Instrument Serif + Inter; falta el logo en SVG |
| 3. Next.js + landing (láminas 00–07) | ✅ v1 publicada en https://decordesign.vercel.app (el contacto abre WhatsApp, todavía sin backend) |
| 4. Hero 3D por scroll | pendiente |
| 5. Configurador 3D + backend (Supabase, Resend, Turnstile) | ✅ (2026-10-15). Los correos y Turnstile se activan con variables de entorno en Vercel (ver `.env.example`) |
| 6. SEO, analítica, rendimiento, Playwright, despliegue | pendiente |

Decisiones por defecto, mientras el cliente no responda: el motel está oculto (`OCULTOS` en `lib/portafolio.ts`); las páginas 94–101 se muestran como «Restaurante» sin cliente; no se publica ningún cliente; la fundadora aparece con texto y sin foto; se omiten la sección de cifras y los testimonios hasta tener datos reales.

`lib/portafolio.ts` es `server-only` (importa el inventario completo). Los componentes cliente importan tipos y rutas desde `lib/imagen.ts`.

## Datos reales del PDF (usar tal cual)

- Teléfono / WhatsApp: **305 896 79 04** (+57 305 896 7904)
- Correo: **decordesign1sas@gmail.com**
- Web: **www.decordesign.com.co**
- Instagram: **@decordesign_sas**
- Fundadora: Valentina Pedraza (Archicad, SketchUp, Enscape, Illustrator)
- Servicios según el PDF: Planimetría, Visualización arquitectónica (render), Asesoría de diseño, Licencias de construcción, Remodelaciones, Obra civil. Quiénes somos: constructora y comercializadora; decoración de interiores, carpintería, obra civil, asesoría en arquitectura e ingeniería y asesoría jurídica.
- Ciudades con proyectos: Bogotá, Sibaté, Facatativá, Mosquera, La Vega, Medellín, Barranquilla.

**No inventar:** años de experiencia, cantidad de proyectos, testimonios, rangos de inversión, la política de datos ni los clientes. Usar `[COMPLETAR: ...]`.

**Privacidad:** los nombres de clientes del PDF viven solo en `migracion/clientes.json` (fuera de git). En el sitio se muestra un cliente solo si su entrada tiene `"publicar": true`.

## Configurador y solicitudes

- `lib/buildScene.ts`: módulo **puro** (sin imports) que convierte las respuestas en la maqueta (muros, zonas, muebles, luces, paleta). Lo dibujan `Escena3D` (R3F, `frameloop="demand"`, cada pieza se interpola) y `Plano2D` (SVG de respaldo sin WebGL; para forzarlo se abre `?plano2d`). Prueba: `npm test`.
- Estado: Zustand con persistencia en localStorage (`lib/configurador.ts`). Opciones y validación Zod compartidas entre cliente y servidor (`lib/lead.ts`).
- `POST /api/leads`: honeypot (`sitio`), Turnstile si existe `TURNSTILE_SECRET_KEY`, Zod, sube el JPEG del canvas a Storage y guarda el lead con la RPC; luego envía los correos con Resend si existe `RESEND_API_KEY`.
- Supabase: proyecto compartido **proyectumia** (`opagblruzwsrxsggkjsa`), con prefijo `decord_`. La tabla `decord_leads` tiene RLS sin políticas (nadie la lee con la llave pública). La única entrada es `decord_crear_lead(jsonb)` (SECURITY DEFINER, solo `anon`, 5 envíos por hora por hash de IP). Las maquetas van al bucket público `decord-maquetas` (solo JPEG de hasta 2 MB, nombres UUID). Los leads se ven en el panel de Supabase.
- Rangos de inversión: sin cifras hasta que Decord las entregue (`PRESUPUESTOS` en `lib/lead.ts`).
- Política de datos: `/privacidad` es una versión provisional y necesita revisión legal.

## Migración del portafolio

- PDF: `insumos/portafolio-decord.pdf` (fuera de git; Canva, 258 págs., 1440×810 pt).
- Las imágenes vienen de Canva a **800 px máximo**: no hay versiones de 1280/2048 sin inventar píxeles. Se generan 640 + ancho nativo. Para un hero nítido se necesitan los originales.
- Para regenerar: `pip install pymupdf imagehash pillow`, luego `python scripts/extraer.py .`, `python scripts/ids.py` y `npm run inventario`.
  - `scripts/inventario.py`: clasifica por rango de páginas (el pie de página de cada página trae el tipo, la ciudad y el cliente), aplica la transparencia, renderiza desde la página las plantas que Canva rota o recorta, y escribe `migracion/inventario.json`.
  - `scripts/optimizar.mjs`: sharp genera AVIF + WebP y el blur, sin EXIF. **Es incremental**: solo procesa imágenes sin `blur`.
- Salida: `public/portafolio/{id}-{ancho}.{avif|webp}` y `public/marca/logo-{oscuro|claro}.png`.
- **Agregar imágenes nuevas:** añade el proyecto a `PROYECTOS` (o una entrada nueva) y corre `npm run inventario`. El sitio lee todo de `inventario.json`; no se escriben imágenes a mano.

## Dirección de arte

Lujo silencioso, arquitectura editorial: fondo crema, espresso para el texto, mucho aire, líneas finas de plano (cotas, ejes, retícula, «LÁMINA 01 / 07»).

Paleta tomada del PDF; los tokens definitivos se fijan en la fase 2:

| Token | Hex | Origen |
|---|---|---|
| crema | #EFE8DE | fondo de la portada |
| espresso | #362B25 | fondo de «Contenido» |
| arena | #CFC3B3 | panel de «Quiénes somos» |
| taupe | #BDB2A0 | «Proyectos realizados» |
| tinta | #111111 | logo |

Tipografía: el PDF usa una serif didona en itálica («Proyectos *DISEÑADOS*»). La propuesta es Instrument Serif para los títulos e Inter para el texto.

## Stack previsto

Next.js (App Router) + TypeScript estricto, Tailwind, R3F + drei, GSAP + ScrollTrigger, Lenis, Motion, Zustand, React Hook Form + Zod, Supabase, Resend, Turnstile, Vercel Analytics y Playwright.

## Estructura (prevista)

```
app/                 page.tsx (láminas 00–07), proyectos/[slug], api/leads
components/          laminas/, hero3d/, configurador/, ui/
lib/                 portafolio.ts (lee inventario), buildScene.ts (puro, testeable)
migracion/           inventario.json (fuente de verdad), hojas/ (contact sheets, fuera de git)
public/portafolio/   imágenes optimizadas
scripts/             inventario.py, optimizar.mjs
```
