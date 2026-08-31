import { describe, it, expect } from 'vitest';
import { CoordinateCalculator } from '../../domain/cms/CoordinateCalculator';

describe('CoordinateCalculator — Cálculo de Coordenadas Relativas (X%, Y%) para Shoppable Hotspots', () => {
  it('debería_calcular_coordenadas_porcentuales_exactas_en_el_centro', () => {
    // Arrange
    const containerWidth = 1000;
    const containerHeight = 500;
    const clickX = 500;
    const clickY = 250;

    // Act
    const point = CoordinateCalculator.calculate(clickX, clickY, containerWidth, containerHeight);

    // Assert
    expect(point.x).toBe(50);
    expect(point.y).toBe(50);
    expect(CoordinateCalculator.isValid(point)).toBe(true);
  });

  it('debería_limitar_y_redondear_a_dos_decimales_ante_valores_extremos_o_fuera_de_rango', () => {
    // Arrange
    const containerWidth = 800;
    const containerHeight = 600;
    const clickX = 850; // Fuera del ancho
    const clickY = -20;  // Menor que 0

    // Act
    const point = CoordinateCalculator.calculate(clickX, clickY, containerWidth, containerHeight);

    // Assert
    expect(point.x).toBe(100);
    expect(point.y).toBe(0);
    expect(CoordinateCalculator.isValid(point)).toBe(true);
  });

  it('debería_calcular_puntos_reales_con_alta_precision', () => {
    // Arrange: Clic en sofá (x=333, y=412 sobre contenedor 1200x800)
    const containerWidth = 1200;
    const containerHeight = 800;
    const clickX = 333;
    const clickY = 412;

    // Act
    const point = CoordinateCalculator.calculate(clickX, clickY, containerWidth, containerHeight);

    // Assert
    expect(point.x).toBe(27.75);
    expect(point.y).toBe(51.5);
  });
});
