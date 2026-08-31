import { describe, it, expect } from 'vitest';
import { CrossSellRecommender } from '../../domain/catalog/CrossSellRecommender';
import { Product } from '../../domain/models/Product';

describe('CrossSellRecommender — Alternativas por Agotado y Venta Cruzada (EARS-N-04 / RF-15 / US-12)', () => {
  const mockCatalog: Product[] = [
    {
      id: 'prod_1',
      supplierId: 'sup_1',
      supplierName: 'Taller 1',
      name: 'Comedor Roble 6 Puestos',
      category: 'Comedores',
      status: 'publicado',
      suggestedPrice: 45000,
      floorPrice: 38000,
      dimensions: { widthCm: 200, heightCm: 78, depthCm: 100 },
      images: [],
      supplierCost: { productId: 'prod_1', baseCost: 30000, updatedAt: '' },
      stockQuantity: 2,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'prod_2',
      supplierId: 'sup_1',
      supplierName: 'Taller 1',
      name: 'Comedor Nogal 8 Puestos',
      category: 'Comedores',
      status: 'publicado',
      suggestedPrice: 52000,
      floorPrice: 44000,
      dimensions: { widthCm: 220, heightCm: 78, depthCm: 105 },
      images: [],
      supplierCost: { productId: 'prod_2', baseCost: 35000, updatedAt: '' },
      stockQuantity: 4,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'prod_3_soldout',
      supplierId: 'sup_2',
      supplierName: 'Taller 2',
      name: 'Comedor Caoba 4 Puestos',
      category: 'Comedores',
      status: 'agotado',
      suggestedPrice: 32000,
      floorPrice: 28000,
      dimensions: { widthCm: 150, heightCm: 78, depthCm: 90 },
      images: [],
      supplierCost: { productId: 'prod_3_soldout', baseCost: 22000, updatedAt: '' },
      stockQuantity: 0,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'prod_4_chairs',
      supplierId: 'sup_2',
      supplierName: 'Taller 2',
      name: 'Set 2 Sillas Comedor Boucle',
      category: 'Sillas y Sillones',
      status: 'publicado',
      suggestedPrice: 18000,
      floorPrice: 15000,
      dimensions: { widthCm: 55, heightCm: 80, depthCm: 55 },
      images: [],
      supplierCost: { productId: 'prod_4_chairs', baseCost: 12000, updatedAt: '' },
      stockQuantity: 6,
      createdAt: '',
      updatedAt: '',
    },
  ];

  it('debería_sugerir_alternativas_disponibles_cuando_un_producto_está_agotado_EARS_N_04', () => {
    // Arrange
    const soldOutProduct = mockCatalog[2]; // prod_3_soldout

    // Act
    const alternatives = CrossSellRecommender.getAlternativesForSoldOut(soldOutProduct, mockCatalog);

    // Assert
    expect(alternatives.length).toBe(2);
    expect(alternatives.every((p) => p.status === 'publicado')).toBe(true);
    expect(alternatives.every((p) => p.category === 'Comedores')).toBe(true);
    expect(alternatives.some((p) => p.id === 'prod_3_soldout')).toBe(false);
  });

  it('debería_sugerir_productos_complementarios_para_venta_cruzada', () => {
    // Arrange
    const currentProduct = mockCatalog[0]; // Comedor Roble

    // Act
    const crossSell = CrossSellRecommender.getComplementaryCrossSell(currentProduct, mockCatalog);

    // Assert
    expect(crossSell.length).toBeGreaterThan(0);
    expect(crossSell.some((p) => p.category === 'Sillas y Sillones')).toBe(true);
  });
});
