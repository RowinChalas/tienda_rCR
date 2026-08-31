import { PricingCalculationResult } from '../models/PricingRule';

/**
 * Motor de Precios — Reglas de Negocio Puras (Épica B / EARS-E-04 / EARS-N-01)
 * Sin dependencias de infraestructura ni efectos secundarios.
 */
export class PricingEngine {
  /**
   * Aplica redondeo comercial psicológico (ej: $20,250 -> $19,990 o $20,490)
   * asegurando nunca quedar por debajo del suelo mínimo.
   */
  public static applyPsychologicalRounding(price: number, floorPrice: number): number {
    if (price <= 0) return 0;

    // Si el precio es menor a $1,000, redondear al múltiplo de 50 o 90
    if (price < 1000) {
      const rounded = Math.floor(price / 10) * 10 + 9;
      return Math.max(rounded, floorPrice);
    }

    // Para muebles y retail (típicamente $5,000 - $100,000+)
    const thousands = Math.floor(price / 1000) * 1000;
    const remainder = price - thousands;

    let candidate = price;
    if (remainder < 400) {
      // Redondear a terminación .990 del millar anterior o .490
      candidate = thousands - 10;
    } else if (remainder < 750) {
      candidate = thousands + 490;
    } else {
      candidate = thousands + 990;
    }

    // Invariante de seguridad: nunca menor al precio suelo
    return candidate >= floorPrice ? candidate : Math.ceil(floorPrice);
  }

  /**
   * Calcula el precio sugerido y precio suelo dado el costo base y los porcentajes.
   */
  public static calculatePricing(
    baseCost: number,
    markupPct: number,
    floorPct: number,
    allowRounding: boolean = true,
    ruleId?: string
  ): PricingCalculationResult {
    if (baseCost <= 0) {
      return {
        baseCost: 0,
        markupPct,
        floorPct,
        rawSuggestedPrice: 0,
        suggestedPrice: 0,
        floorPrice: 0,
        minGrossMargin: 0,
        targetGrossMargin: 0,
        appliedRuleId: ruleId,
        isPsychologicallyRounded: false,
      };
    }

    // Precio Suelo estricto: Costo base + margen piso mínimo no negociable
    const floorPrice = Math.round(baseCost * (1 + floorPct));
    
    // Precio Sugerido bruto: Costo base + margen meta
    const rawSuggestedPrice = Math.round(baseCost * (1 + markupPct));

    let suggestedPrice = rawSuggestedPrice;
    let isPsychologicallyRounded = false;

    if (allowRounding) {
      const rounded = this.applyPsychologicalRounding(rawSuggestedPrice, floorPrice);
      if (rounded !== rawSuggestedPrice) {
        suggestedPrice = rounded;
        isPsychologicallyRounded = true;
      }
    }

    const minGrossMargin = floorPrice - baseCost;
    const targetGrossMargin = suggestedPrice - baseCost;

    return {
      baseCost,
      markupPct,
      floorPct,
      rawSuggestedPrice,
      suggestedPrice,
      floorPrice,
      minGrossMargin,
      targetGrossMargin,
      appliedRuleId: ruleId,
      isPsychologicallyRounded,
    };
  }

  /**
   * Valida una oferta o contrapropuesta de descuento enviada por el cliente.
   * EARS-N-01: Si es menor al floorPrice, DEBE disparar handoff.
   */
  public static validateDiscountOffer(
    offeredPrice: number,
    suggestedPrice: number,
    floorPrice: number
  ): {
    isAllowed: boolean;
    requiresHandoff: boolean;
    discountPct: number;
    reason: string;
  } {
    if (offeredPrice <= 0 || suggestedPrice <= 0) {
      return {
        isAllowed: false,
        requiresHandoff: true,
        discountPct: 0,
        reason: 'Precio de oferta inválido.',
      };
    }

    const discountPct = Number((((suggestedPrice - offeredPrice) / suggestedPrice) * 100).toFixed(1));

    if (offeredPrice < floorPrice) {
      return {
        isAllowed: false,
        requiresHandoff: true,
        discountPct,
        reason: `La oferta de $${offeredPrice.toLocaleString()} está por debajo del Precio Suelo protegido ($${floorPrice.toLocaleString()}). Requiere autorización humana.`,
      };
    }

    return {
      isAllowed: true,
      requiresHandoff: false,
      discountPct,
      reason: `Oferta aprobada automáticamente. Descuento del ${discountPct}% dentro de los límites de margen.`,
    };
  }
}
