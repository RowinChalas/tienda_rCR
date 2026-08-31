import { ProductCategory } from '../models/Product';
import { PricingEngine } from '../pricing/PricingEngine';

export interface WhatsAppParsedProductDraft {
  name: string;
  category: ProductCategory;
  baseCost: number;
  suggestedPrice: number;
  floorPrice: number;
  dimensions: {
    widthCm: number;
    heightCm: number;
    depthCm: number;
  };
  material?: string;
  color?: string;
  notes: string;
  rawCaption: string;
  confidenceScore: number;
}

/**
 * Parser de Ingesta Automática desde WhatsApp (EARS-E-03 / RF-01 / US-01)
 * Procesa texto y metadatos de fotos enviadas por artesanos y talleres aliados.
 */
export class WhatsAppIngestionParser {
  private static readonly CATEGORY_KEYWORDS: Record<ProductCategory, RegExp[]> = {
    'Comedores': [/comedor/i, /mesa.*comedor/i, /sillas.*comedor/i, /banca/i],
    'Salas y Sofás': [/sof[aá]/i, /seccional/i, /modular/i, /butaca/i, /sala/i, /chaise/i, /love\s*seat/i],
    'Mesas de Centro': [/mesa.*centro/i, /mesita.*centro/i, /mesa.*lateral/i, /mesa.*auxiliar/i, /coffee\s*table/i, /mesita/i],
    'Recámaras y Camas': [/cama/i, /cabecero/i, /cabecera/i, /espaldar/i, /rec[aá]mara/i, /dormitorio/i, /nocturna/i, /mesa.*noche/i],
    'Sillas y Sillones': [/sill[oó]n/i, /silla/i, /poltrona/i, /taburete/i, /banco.*bar/i, /lounge/i],
    'Almacenamiento y Muebles TV': [/mueble.*tv/i, /aparador/i, /estante/i, /repisa/i, /librero/i, /credenza/i, /closet/i, /armario/i],
    'Mobiliario de Exterior': [/exterior/i, /terraza/i, /patio/i, /jard[ií]n/i, /tumbona/i, /rattan/i, /mimbre/i],
  };

  /**
   * Parsea el texto del mensaje / pie de foto de WhatsApp.
   */
  public static parse(caption: string, defaultMarkup: number = 0.35, defaultFloor: number = 0.18): WhatsAppParsedProductDraft {
    const text = caption ? caption.trim() : '';

    // 1. Extraer costo base
    const baseCost = this.extractBaseCost(text);

    // 2. Extraer categoría
    const category = this.extractCategory(text);

    // 3. Extraer dimensiones
    const dimensions = this.extractDimensions(text);

    // 4. Extraer nombre o título limpio
    const name = this.extractName(text, category);

    // 5. Extraer material o acabado si se menciona
    const material = this.extractMaterial(text);

    // 6. Calcular precios con motor de precios de dominio
    const pricing = PricingEngine.calculatePricing(baseCost, defaultMarkup, defaultFloor, true);

    // Confianza del parseo
    let confidence = 0.3;
    if (baseCost > 0) confidence += 0.3;
    if (name.length > 5) confidence += 0.2;
    if (dimensions.widthCm > 0) confidence += 0.2;

    return {
      name,
      category,
      baseCost,
      suggestedPrice: pricing.suggestedPrice,
      floorPrice: pricing.floorPrice,
      dimensions,
      material,
      notes: `Ingesta automática vía WhatsApp: "${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"`,
      rawCaption: text,
      confidenceScore: Math.min(1.0, Number(confidence.toFixed(2))),
    };
  }

  /**
   * Extrae el costo base numérico.
   */
  private static extractBaseCost(text: string): number {
    // 1. Patrón con k (ej: 18k -> 18000, 29k -> 29000, Costo: 25k)
    const kMatch = text.match(/(?:costo|base|taller|precio)?[:\s]*([0-9]+(?:\.[0-9]+)?)\s*k\b/i);
    if (kMatch && kMatch[1]) {
      return Math.round(parseFloat(kMatch[1]) * 1000);
    }

    // 2. Patrón con etiqueta explícita (ej: "Costo: 18,500", "Base $22000", "RD$ 35,000", "precio taller: 14000")
    const costMatch = text.match(/(?:costo|base|taller|precio\s*taller|piso)[:\s]*(?:RD\$|\$|DOP)?\s*([0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{2})?|[0-9]+(?:\.[0-9]{2})?)/i);
    if (costMatch && costMatch[1]) {
      const parsed = parseFloat(costMatch[1].replace(/,/g, ''));
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }

    // 3. Cualquier cifra monetaria precedida por RD$ o $
    const generalMoneyMatch = text.match(/(?:RD\$|\$)\s*([0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{2})?|[0-9]{4,7})/i);
    if (generalMoneyMatch && generalMoneyMatch[1]) {
      const parsed = parseFloat(generalMoneyMatch[1].replace(/,/g, ''));
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }

    return 0;
  }

  /**
   * Clasifica en una de las 5 categorías oficiales.
   */
  private static extractCategory(text: string): ProductCategory {
    for (const [cat, patterns] of Object.entries(this.CATEGORY_KEYWORDS)) {
      if (patterns.some((p) => p.test(text))) {
        return cat as ProductCategory;
      }
    }
    return 'Salas y Sofás'; // Categoría por defecto
  }

  /**
   * Extrae medidas físicas en centímetros (ej: 180x85x90 cm, 2.20 x 0.80 x 0.90 m).
   */
  private static extractDimensions(text: string): { widthCm: number; heightCm: number; depthCm: number } {
    // Patrón: 180x85x90 o 180 x 85 x 90 cm
    const tripleMatch = text.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:x|\*|por)\s*([0-9]+(?:\.[0-9]+)?)\s*(?:x|\*|por)\s*([0-9]+(?:\.[0-9]+)?)\s*(?:cm|cms|cent[ií]metros|m|mts|metros)?/i);
    if (tripleMatch) {
      let w = parseFloat(tripleMatch[1]);
      let h = parseFloat(tripleMatch[2]);
      let d = parseFloat(tripleMatch[3]);

      // Si las medidas están en metros (ej: 2.2 x 0.8 x 0.9)
      if (w < 10 && h < 10 && d < 10) {
        w = Math.round(w * 100);
        h = Math.round(h * 100);
        d = Math.round(d * 100);
      }

      return {
        widthCm: Math.round(w),
        heightCm: Math.round(h),
        depthCm: Math.round(d),
      };
    }

    // Patrón doble: 180x85 cm (asume fondo estándar de 80)
    const doubleMatch = text.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:x|\*|por)\s*([0-9]+(?:\.[0-9]+)?)\s*(?:cm|cms|cent[ií]metros|m|mts|metros)?/i);
    if (doubleMatch) {
      let w = parseFloat(doubleMatch[1]);
      let h = parseFloat(doubleMatch[2]);
      if (w < 10 && h < 10) {
        w = Math.round(w * 100);
        h = Math.round(h * 100);
      }
      return {
        widthCm: Math.round(w),
        heightCm: Math.round(h),
        depthCm: 80,
      };
    }

    return { widthCm: 180, heightCm: 85, depthCm: 90 };
  }

  /**
   * Extrae el nombre del producto limpiando datos técnicos de costo y medidas.
   */
  private static extractName(text: string, category: ProductCategory): string {
    const firstLine = text.split('\n')[0] || '';
    let candidate = firstLine
      .replace(/(?:costo|base|precio|medidas|dimensiones|dim)[:\s].*/i, '')
      .replace(/(?:RD\$|\$)[0-9,.]+/i, '')
      .trim();

    if (candidate.length >= 4) {
      return candidate.charAt(0).toUpperCase() + candidate.slice(1);
    }

    return `${category} Artesanal`;
  }

  /**
   * Extrae mención de madera o materiales nobles.
   */
  private static extractMaterial(text: string): string | undefined {
    const match = text.match(/(?:madera\s+de\s+[a-z]+|roble|caoba|nogal|cedro|pino\s+tratado|terciopelo|cuero|lino|boucl[eé]|m[aá]rmol|travertino)/i);
    if (match) {
      return match[0].charAt(0).toUpperCase() + match[0].slice(1);
    }
    return undefined;
  }
}
