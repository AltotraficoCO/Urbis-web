// Contenido del recorrido, tomado de los borradores del cliente (design/_respaldo).
// PENDIENTE DE CONFIRMAR antes de producción: áreas por tipología, fecha y alcance de
// entrega, texto legal VIS y las zonas comunes que no estaban en el borrador
// (BBQ, coworking, guardería y parque infantil, que sí aparecen en los renders).
// También por validar: "nadie te va a tapar" y "las mejores amenidades de Torices",
// que vienen de la reunión con el cliente y necesitan respaldo escrito.

export const LUGARES = ['Playas de Marbella', 'Mallplaza', 'Centro Histórico', 'Aeropuerto Rafael Núñez'];

export const ZONAS = [
  { slug: 'piscina', nombre: 'Piscina y rooftop', texto: 'Un espacio para disfrutar y desconectarte.', focoMovil: 0.76 },
  { slug: 'bbq', nombre: 'Terraza y BBQ', texto: 'Respira, contempla y disfruta.', focoMovil: 0.62 },
  { slug: 'social', nombre: 'Salón social', texto: 'Momentos para compartir.', focoMovil: 0.46 },
  { slug: 'gym', nombre: 'Gimnasio', texto: 'Bienestar a tu propio ritmo.', focoMovil: 0.56 },
  { slug: 'coworking', nombre: 'Coworking', texto: 'Un lugar para concentrarte sin salir de casa.', focoMovil: 0.2 },
  { slug: 'lobby', nombre: 'Lobby y recepción', texto: 'Una bienvenida que se siente desde el primer día.', focoMovil: 0.68 },
  { slug: 'juegos', nombre: 'Salón de juegos', texto: 'Espacios para disfrutar tu tiempo libre.', focoMovil: 0.72 },
  { slug: 'guarderia', nombre: 'Guardería', texto: 'Un rincón pensado para los más pequeños.', focoMovil: 0.32 },
  { slug: 'parque', nombre: 'Parque infantil', texto: 'Aire libre a pocos pasos de tu puerta.', focoMovil: 0.42 },
];

export const TIPOLOGIAS = [
  { k: 'A', tipos: [3], porPiso: '1 apartamento por piso', etapa: 'Etapa 1', construida: '51,11 m²', util: '45,59 m²' },
  { k: 'B', tipos: [1, 2, 4, 5, 6, 9, 10], porPiso: '7 apartamentos por piso', etapa: 'Etapas 1 y 2', construida: '51,7 m²', util: '43,9 – 46,9 m²' },
  { k: 'C', tipos: [7, 8], porPiso: '2 apartamentos por piso', etapa: 'Etapa 2', construida: '52,73 m²', util: '48,05 m²' },
];

export const INVERSION = [
  { titulo: 'Finca raíz en Cartagena', texto: 'Construye patrimonio en Cartagena de Indias, en un barrio conectado con las playas, Mallplaza, el Centro Histórico y el aeropuerto.' },
  { titulo: 'Compra sobre planos', texto: 'Inviertes con un precio de referencia desde $275 millones y entrega prevista para noviembre de 2028.' },
  { titulo: 'Atributos que marcan la diferencia', texto: 'Una vista despejada y las mejores amenidades de Torices: lo que busca quien vive aquí y quien invierte aquí.' },
];

export const COMPRA = [
  { n: '01', titulo: 'Separa', texto: 'Pregunta el monto para separar tu apartamento y qué condiciones aplican mientras formalizas la compra.' },
  { n: '02', titulo: 'Cuota inicial', texto: 'Consulta cómo se estructura y cuánto tiempo tienes para completarla según la tipología que elijas.' },
  { n: '03', titulo: 'Financia el saldo', texto: 'Recibe orientación sobre cómo financiar el saldo y qué opciones revisar con las entidades financieras.' },
  { n: '04', titulo: 'Recibe tu apartamento', texto: 'Entrega prevista para noviembre de 2028, en obra gris, con baño y cocina terminados.' },
];

export const FAQS: [string, string][] = [
  ['¿Cuánto cuesta un apartamento en Urbis EU?', 'Los apartamentos tienen un precio de referencia desde $275 millones. El valor final depende de la tipología, la disponibilidad y las condiciones comerciales vigentes.'],
  ['¿Cómo puedo separar mi apartamento?', 'El valor y el proceso de separación se confirman directamente con el equipo comercial. Déjanos tus datos y te contamos los pasos vigentes.'],
  ['¿Cómo se paga la cuota inicial?', 'El valor de la cuota inicial, el plazo y la forma de pago los informa el equipo comercial según la tipología y las condiciones vigentes.'],
  ['¿Qué incluye la entrega en obra gris?', 'Los apartamentos se entregan en obra gris, con baño y cocina terminados. Solicita al equipo comercial el detalle actualizado del alcance.'],
  ['¿Cuándo está prevista la entrega?', 'La entrega está prevista para noviembre de 2028. Consulta las condiciones que quedarán en los documentos del proyecto.'],
  ['¿Puedo acceder a un subsidio?', 'La aplicación de subsidios de vivienda a Urbis EU está en verificación. Solicita la información actualizada antes de contar con este apoyo.'],
  ['¿Está permitida la renta corta?', 'Las reglas del proyecto sobre renta corta todavía están en revisión. Pregunta al equipo comercial por la información vigente.'],
];

export const LEGAL = 'Imágenes y áreas de referencia. Consulta las condiciones y características vigentes con el equipo comercial. El valor de la vivienda corresponderá al menor valor entre el precio pactado y el tope máximo establecido para Vivienda de Interés Social, equivalente a 150 SMMLV vigentes al momento de la escrituración. Las imágenes son representaciones digitales del diseño y pueden variar en su construcción final. Este material no constituye oferta comercial.';
