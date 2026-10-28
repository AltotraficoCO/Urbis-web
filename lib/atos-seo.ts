import seo from '@/atos/seo.json';

// SEO que escribe AT OS en atos/seo.json (ver atos/README.md). El código solo
// lo lee: título, descripción y preguntas frecuentes por ruta.

export interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

export interface SeoPagina {
  titulo?: string;
  descripcion?: string;
  faq?: PreguntaFrecuente[];
}

const paginas = (seo as { paginas?: Record<string, SeoPagina> }).paginas ?? {};

export function seoDe(ruta: string): SeoPagina {
  return paginas[ruta] ?? {};
}

/** Schema FAQPage listo para un <script type="application/ld+json">, o null si no hay preguntas. */
export function faqJsonLd(ruta: string): string | null {
  const faq = (seoDe(ruta).faq ?? []).filter((f) => f.pregunta?.trim() && f.respuesta?.trim());
  if (faq.length === 0) return null;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: f.respuesta },
    })),
  };
  // Sin `<` crudo: evita cerrar el <script> desde el contenido (guía JSON-LD de Next)
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}
