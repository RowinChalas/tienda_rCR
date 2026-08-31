/**
 * Calculador de Coordenadas Relativas Porcentuales para Hotspots Responsivos (RF-CMS-04)
 * Garantiza que los pines (+) se mantengan exactamente en la posición visual relativa del mueble
 * tanto en pantallas móviles (320px) como en monitores ultra-wide (4K).
 */

export interface RelativePoint {
  x: number; // Porcentaje relativo 0.0 - 100.0%
  y: number; // Porcentaje relativo 0.0 - 100.0%
}

export class CoordinateCalculator {
  /**
   * Calcula las coordenadas porcentuales relativas dado el clic y el rectángulo contenedor.
   */
  public static calculate(
    clickX: number,
    clickY: number,
    containerWidth: number,
    containerHeight: number
  ): RelativePoint {
    if (containerWidth <= 0 || containerHeight <= 0) {
      return { x: 50, y: 50 };
    }

    const rawX = (clickX / containerWidth) * 100;
    const rawY = (clickY / containerHeight) * 100;

    // Clamp entre 0.0 y 100.0 con 2 decimales de precisión
    const x = Math.max(0, Math.min(100, Number(rawX.toFixed(2))));
    const y = Math.max(0, Math.min(100, Number(rawY.toFixed(2))));

    return { x, y };
  }

  /**
   * Valida si un punto relativo se encuentra dentro de los límites válidos de la imagen.
   */
  public static isValid(point: RelativePoint): boolean {
    return (
      typeof point.x === 'number' &&
      typeof point.y === 'number' &&
      !isNaN(point.x) &&
      !isNaN(point.y) &&
      point.x >= 0 &&
      point.x <= 100 &&
      point.y >= 0 &&
      point.y <= 100
    );
  }
}
