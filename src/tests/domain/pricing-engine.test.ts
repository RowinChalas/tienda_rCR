import { describe, it, expect } from 'vitest';
import { PricingEngine } from '../../domain/pricing/PricingEngine';

describe('PricingEngine — Reglas de Precios y EARS Contracts', () => {
  it('debería_calcular_correctamente_precio_sugerido_y_precio_suelo', () => {
    // Arrange
    const costoBase = 15000;
    const markupPct = 0.35; // 35% margen
    const floorPct = 0.18;  // 18% piso no negociable

    // Act
    const result = PricingEngine.calculatePricing(costoBase, markupPct, floorPct, false);

    // Assert
    expect(result.baseCost).toBe(15000);
    expect(result.rawSuggestedPrice).toBe(20250); // 15000 * 1.35
    expect(result.floorPrice).toBe(17700);        // 15000 * 1.18
    expect(result.targetGrossMargin).toBe(5250);
    expect(result.minGrossMargin).toBe(2700);
  });

  it('debería_aplicar_redondeo_psicológico_respetando_el_precio_suelo', () => {
    // Arrange
    const costoBase = 15000;
    const markupPct = 0.35; // Sugerido bruto $20,250
    const floorPct = 0.18;  // Suelo $17,700

    // Act
    const result = PricingEngine.calculatePricing(costoBase, markupPct, floorPct, true);

    // Assert
    expect(result.suggestedPrice).toBe(19990); // Redondeado psicológicamente a terminación .990
    expect(result.suggestedPrice).toBeGreaterThanOrEqual(result.floorPrice);
    expect(result.isPsychologicallyRounded).toBe(true);
  });

  it('debería_aprobar_descuento_solicitado_si_está_por_encima_del_precio_suelo', () => {
    // Arrange
    const precioSugerido = 20000;
    const precioSuelo = 17700;
    const ofertaCliente = 18500; // Por encima de 17700

    // Act
    const evaluacion = PricingEngine.validateDiscountOffer(ofertaCliente, precioSugerido, precioSuelo);

    // Assert
    expect(evaluacion.isAllowed).toBe(true);
    expect(evaluacion.requiresHandoff).toBe(false);
    expect(evaluacion.discountPct).toBe(7.5);
  });

  it('debería_rechazar_descuento_y_exigir_handoff_si_la_oferta_es_menor_al_precio_suelo_EARS_N_01', () => {
    // Arrange
    const precioSugerido = 20000;
    const precioSuelo = 17700;
    const ofertaInvalida = 16500; // Por debajo del suelo de $17,700

    // Act
    const evaluacion = PricingEngine.validateDiscountOffer(ofertaInvalida, precioSugerido, precioSuelo);

    // Assert
    expect(evaluacion.isAllowed).toBe(false);
    expect(evaluacion.requiresHandoff).toBe(true);
    expect(evaluacion.reason).toContain('Precio Suelo protegido');
  });
});
