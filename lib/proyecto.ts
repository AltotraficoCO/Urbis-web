// Datos oficiales de Urbis EU (contexto del cliente, nov 2026). Las áreas salen de la
// licencia de construcción RES L-13001-1-26 VIS. Lo que no esté aquí no se publica.
// PENDIENTE: notas legales adicionales de Araujo y Segovia; que el arquitecto confirme
// la numeración de las posiciones.

export const LUGARES = ['Playas de Marbella', 'Mallplaza', 'Centro Histórico', 'Aeropuerto Rafael Núñez'];

// Indicaciones como las da el brochure del proyecto.
/** Ficha «Urbis EU» en Google Maps (10.4304, -75.5345), enlace dado por Victor. */
export const MAPS_URL = 'https://maps.app.goo.gl/iicUcW2Pgb8Jcqrr8';
export const INDICACIONES = ['Entre la calle 43 (calle Bogotá) y la carrera 16', 'Al lado de la Parroquia San José de Torices'];

// Amenidades según el contexto oficial, sin áreas ni pisos por pedido del cliente. El render del parque infantil exterior se
// retiró: no figura en la lista. El parque de mascotas no tiene render.
export const ZONAS = [
  { slug: 'piscina', nombre: 'Piscinas (Etapa 2)', texto: 'Piscina de adultos y piscina de niños.', focoMovil: 0.76 },
  { slug: 'bbq', nombre: 'Terraza & BBQ', texto: 'Al aire libre, con vista a la ciudad.', focoMovil: 0.62 },
  { slug: 'social', nombre: 'Salón social', texto: 'Un espacio para tus reuniones.', focoMovil: 0.46 },
  { slug: 'gym', nombre: 'Gimnasio', texto: 'Para entrenar a tu ritmo.', focoMovil: 0.56 },
  { slug: 'juegos', nombre: 'Salón de juegos', texto: 'Para tu tiempo libre.', focoMovil: 0.72 },
  { slug: 'coworking', nombre: 'Coworking', texto: 'Para trabajar sin salir del edificio.', focoMovil: 0.2 },
  { slug: 'guarderia', nombre: 'Guardería (Etapa 2)', texto: 'Un espacio para los más pequeños.', focoMovil: 0.32 },
  { slug: 'lobby', nombre: 'Lobby', texto: 'Aquí también está el parque de mascotas.', focoMovil: 0.68 },
];

// Lista completa de amenidades. Piscina, guardería y cafetería son de la Etapa 2 (dato del cliente).
export const AMENIDADES = [
  { icono: 'piscina', nombre: 'Piscina de adultos', etapa2: true },
  { icono: 'ninos', nombre: 'Piscina de niños', etapa2: true },
  { icono: 'terraza', nombre: 'Terraza & BBQ' },
  { icono: 'social', nombre: 'Salón social' },
  { icono: 'gimnasio', nombre: 'Gimnasio' },
  { icono: 'juegos', nombre: 'Salón de juegos' },
  { icono: 'coworking', nombre: 'Coworking' },
  { icono: 'infantiles', nombre: 'Guardería', etapa2: true },
  { icono: 'mascotas', nombre: 'Parque de mascotas' },
  { icono: 'lobby', nombre: 'Lobby' },
  { icono: 'cafeteria', nombre: 'Cafetería', etapa2: true },
] as const;

// Tipos con las letras de la licencia. Solo se publican área construida y área privada.
export const TIPOLOGIAS = [
  { k: 'A', posiciones: [1, 2, 4, 5, 6, 9, 10], porPiso: '7 apartamentos por piso', construida: '51,74 m²', privada: '46,93 m²' },
  { k: 'B', posiciones: [7, 8], porPiso: '2 apartamentos por piso', construida: '52,73 m²', privada: '48,05 m²' },
  { k: 'C', posiciones: [3], porPiso: '1 apartamento por piso', construida: '51,11 m²', privada: '45,59 m²' },
];

// Pisos 2 a 30: en cada piso, 6 apartamentos son de Etapa 1 y 4 de Etapa 2.
export const ETAPA_2 = [6, 7, 8, 9];
export const etapaDe = (posicion: number) => (ETAPA_2.includes(posicion) ? { nombre: 'Etapa 2' } : { nombre: 'Etapa 1' });
export const tipoDe = (posicion: number) => TIPOLOGIAS.find(t => t.posiciones.includes(posicion))!;

// Caja de cada apartamento sobre la planta del piso, en % [izquierda, arriba, ancho, alto].
export const PLANTA: Record<number, [number, number, number, number]> = {
  1: [64.2, 5.3, 20.6, 15.5], 2: [42.8, 5.3, 20.3, 15.5], 3: [21.3, 1.2, 20.5, 19.5],
  4: [14.7, 17.5, 19.3, 20.1], 5: [14.7, 38.5, 19.3, 20.8], 6: [14.7, 60.1, 19.3, 19.7],
  7: [14.7, 80.9, 20.9, 18.4], 8: [39.4, 80.9, 20.9, 18.4], 9: [40.7, 60.3, 18.2, 19.5],
  10: [40.6, 31.9, 18.3, 20.1],
};

// Por pedido del cliente no se publica ningún precio: solo el tope VIS.
export const TOPE_VIS = '150 SMLV';

export const INVERSION = [
  { titulo: 'Finca raíz en Cartagena', texto: 'Construye patrimonio en Cartagena de Indias, en un barrio conectado con las playas, Mallplaza, el Centro Histórico y el aeropuerto.' },
  { titulo: 'Compra sobre planos', texto: 'Vivienda de interés social de hasta 150 SMLV, en dos etapas.' },
  { titulo: 'Balcón y amenidades', texto: 'Todos los apartamentos tienen balcón. El edificio suma piscinas, gimnasio, salón social y coworking.' },
];

export const CIUDAD = [
  { titulo: 'El malecón', texto: 'Caminar frente al Caribe al final del día es parte de la rutina de quien vive en Cartagena.' },
  { titulo: 'El Centro Histórico', texto: 'La ciudad amurallada, Patrimonio de la Humanidad, es la razón por la que tantos viajeros eligen Cartagena.' },
  { titulo: 'Una ciudad conectada', texto: 'Playas, comercio y aeropuerto internacional en la misma ciudad, a un recorrido corto de Torices.' },
];

// Roles y logos del respaldo. `muestra` es el ancho en pantalla de cada logo, calculado para
// que todos ocupen un área parecida aunque sus proporciones sean distintas.
export const RESPALDO = [
  { rol: 'Gerencia', marcas: [
    { nombre: 'Promotora Entorno 2000', logo: 'entorno-2000-v2.webp', ancho: 1345, alto: 300, muestra: 260 },
  ] },
  { rol: 'Construcción', marcas: [
    { nombre: 'Soinda', logo: 'soinda.webp', ancho: 527, alto: 200, muestra: 175 },
  ] },
  { rol: 'Diseño', marcas: [
    { nombre: 'Casalsa', logo: 'casalsa.webp', ancho: 260, alto: 260, muestra: 92 },
    { nombre: 'Iván Turriago Thorrens, arquitecto', logo: 'turriago.webp', ancho: 605, alto: 220, muestra: 203 },
  ] },
  { rol: 'Corredores', marcas: [
    { nombre: 'Araujo y Segovia', logo: 'araujo-segovia.svg', ancho: 208, alto: 45, muestra: 263 },
  ] },
];

export const COMPRA = [
  { n: '01', titulo: 'Separa', texto: 'Pregunta el monto para separar tu apartamento y qué condiciones aplican mientras formalizas la compra.' },
  { n: '02', titulo: 'Cuota inicial', texto: 'Hay planes con cuota inicial del 30%, del 35% y del 40%. Pregunta a tu asesor por las cuotas y los plazos.' },
  { n: '03', titulo: 'Saldo a la entrega', texto: 'El saldo se paga a la entrega. Tu asesor te orienta sobre cómo financiarlo.' },
  { n: '04', titulo: 'Recibe tu apartamento', texto: 'Se entrega en obra blanca, con baño y cocina terminados.' },
];

export const FAQS: [string, string][] = [
  ['¿Cuánto cuesta un apartamento en Urbis EU?', 'Urbis EU es vivienda de interés social (VIS): cada apartamento vale hasta 150 SMLV. El valor final depende del tipo de apartamento, la disponibilidad y las condiciones comerciales vigentes.'],
  ['¿Cómo puedo separar mi apartamento?', 'El valor y el proceso de separación se confirman directamente con el equipo comercial. Déjanos tus datos y te contamos los pasos siguientes.'],
  ['¿Cómo se paga la cuota inicial?', 'Hay planes con cuota inicial del 30%, del 35% y del 40%. Tu asesor te informa las cuotas y los plazos de cada plan.'],
  ['¿Qué incluye la entrega en obra blanca?', 'Los apartamentos se entregan en obra blanca, con baño y cocina terminados. Solicita al equipo comercial el detalle actualizado del alcance.'],
];

export const LEGAL = 'El valor de la vivienda corresponderá al menor valor entre el precio pactado y el tope máximo establecido para Vivienda de Interés Social, equivalente a 150 SMMLV vigentes al momento de la escrituración. Las imágenes son representaciones digitales del diseño y pueden variar en su construcción final. Las áreas y los datos aquí publicados pueden variar sin previo aviso. Infórmate en la sala de ventas y con tu asesor comercial antes de tu decisión de compra. Este material no constituye oferta comercial.';
