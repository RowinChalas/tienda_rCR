import { Product } from '../models/Product';
import { StorefrontProduct } from '../../modules/storefront/data/storefrontData';

export interface RecommendationResult {
  reason: string;
  type: 'alternative_in_stock' | 'complementary_cross_sell';
  products: Product[] | StorefrontProduct[];
}

/**
 * Motor de Recomendación de Alternativas y Venta Cruzada (EARS-N-04 / RF-15 / US-12)
 * Sugiere alternativas inmediatas ante stockouts y productos complementarios para elevar el ticket promedio.
 */
export class CrossSellRecommender {
  private static readonly COMPLEMENTARY_MAP: Record<string, string[]> = {
    'Comedores': ['Sillas y Sillones', 'Mesas de Centro'],
    'Salas y Sofás': ['Mesas de Centro', 'Sillas y Sillones'],
    'Mesas de Centro': ['Salas y Sofás', 'Sillas y Sillones'],
    'Recámaras y Camas': ['Mesas de Centro', 'Sillas y Sillones'],
    'Sillas y Sillones': ['Comedores', 'Salas y Sofás'],
    'sala': ['sala', 'comedor'],
    'comedor': ['comedor', 'sala'],
    'dormitorio': ['dormitorio', 'sala'],
    'oficina': ['oficina', 'sala'],
  };

  /**
   * Sugiere productos alternativos similares en stock cuando un artículo está agotado (EARS-N-04).
   */
  public static getAlternativesForSoldOut<T extends { id: string; category: string; status?: string; inStock?: boolean }>(
    soldOutProduct: T,
    catalog: T[],
    limit: number = 3
  ): T[] {
    return catalog
      .filter((p) => {
        if (p.id === soldOutProduct.id) return false;
        const isAvailable = p.status ? p.status === 'publicado' : p.inStock !== false;
        const isSameCategory = p.category.toLowerCase() === soldOutProduct.category.toLowerCase();
        return isAvailable && isSameCategory;
      })
      .slice(0, limit);
  }

  /**
   * Sugiere productos complementarios para venta cruzada (ej: Comedor -> Sillas).
   */
  public static getComplementaryCrossSell<T extends { id: string; category: string; status?: string; inStock?: boolean }>(
    currentProduct: T,
    catalog: T[],
    limit: number = 3
  ): T[] {
    const targetCategories = this.COMPLEMENTARY_MAP[currentProduct.category] || [];

    const matches = catalog.filter((p) => {
      if (p.id === currentProduct.id) return false;
      const isAvailable = p.status ? p.status === 'publicado' : p.inStock !== false;
      if (!isAvailable) return false;

      return targetCategories.some(
        (cat) => cat.toLowerCase() === p.category.toLowerCase()
      );
    });

    // Si no hay suficientes complementarios directos, rellenar con productos destacados
    if (matches.length < limit) {
      const fallback = catalog.filter(
        (p) => p.id !== currentProduct.id && !matches.some((m) => m.id === p.id)
      );
      return [...matches, ...fallback].slice(0, limit);
    }

    return matches.slice(0, limit);
  }
}
