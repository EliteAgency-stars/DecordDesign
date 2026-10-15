// Datos de contacto tomados del portafolio PDF (página 258, «Contáctanos»).
export const MARCA = {
  nombre: 'Decord Design',
  razonSocial: 'DECORDESIGN S.A.S.',
  telefono: '305 896 79 04',
  whatsapp: '573058967904',
  email: 'decordesign1sas@gmail.com',
  instagram: 'decordesign_sas',
  web: 'https://www.decordesign.com.co',
  ciudades: ['Bogotá', 'Sibaté', 'Facatativá', 'Mosquera', 'La Vega', 'Medellín', 'Barranquilla'],
};

export const waLink = (texto: string) =>
  `https://wa.me/${MARCA.whatsapp}?text=${encodeURIComponent(texto)}`;
