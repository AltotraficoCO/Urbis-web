import type { WebGLRenderer } from 'three';

export const esMovil = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;

/** Resolución inicial: en teléfonos se limita para que el shader no sature el GPU. */
export const resolucionInicial = () => Math.min(window.devicePixelRatio || 1, esMovil() ? 1.5 : 2);

/** Si los cuadros tardan demasiado, baja la resolución del canvas hasta recuperar fluidez. */
export function calidadAdaptativa(renderer: WebGLRenderer, canvas: HTMLCanvasElement) {
  let previo = 0;
  let suma = 0;
  let cuenta = 0;
  return (ahora: number) => {
    const dt = ahora - previo;
    previo = ahora;
    if (dt <= 0 || dt > 200) return; // Sin cuadros consecutivos no hay medida válida.
    suma += dt;
    cuenta += 1;
    if (cuenta < 24) return;
    const media = suma / cuenta;
    suma = 0;
    cuenta = 0;
    const r = renderer.getPixelRatio();
    if (media > 30 && r > 1) {
      renderer.setPixelRatio(Math.max(1, r - 0.25));
      renderer.setSize(canvas.clientWidth || 1, canvas.clientHeight || 1, false);
    }
  };
}
