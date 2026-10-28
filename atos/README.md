# SEO gestionado por AT OS

`seo.json` lo escribe **AT OS** (Ignacio, el agente de SEO de Altotráfico) cuando
se aprueba un cambio: título, descripción y preguntas frecuentes (schema
FAQPage) de cada ruta. Cada cambio llega como PR a `main` y Vercel lo publica.

- No edites a mano lo que quieras conservar: el próximo cambio aprobado lo pisa.
- El código solo lo **lee** (`lib/atos-seo.ts`); el diseño y los textos visibles
  no se tocan desde AT OS.
- Si una ruta no está en el archivo, se usan los valores por defecto del layout.
