/**
 * Modelos de Dominio — Reglas de Precios y Márgenes
 */

export type PricingScope = 'global' | 'categoria' | 'proveedor';

export interface PricingRule {
  id: string;
  name: string;
  scope: PricingScope;
  scopeRef?: string; // ej: "Comedores" o id de un proveedor
  markupPct: number; // Porcentaje sobre el costo base (ej: 0.35 para 35%)
  floorPct: number;  // Margen mínimo protegido bajo el cual la IA no puede bajar (ej: 0.18 para 18%)
  allowPsychologicalRounding: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface PricingCalculationResult {
  baseCost: number;
  markupPct: number;
  floorPct: number;
  rawSuggestedPrice: number;
  suggestedPrice: number;
  floorPrice: number;
  minGrossMargin: number;
  targetGrossMargin: number;
  appliedRuleId?: string;
  isPsychologicallyRounded: boolean;
}
