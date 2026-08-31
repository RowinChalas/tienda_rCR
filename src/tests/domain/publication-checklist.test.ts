import { describe, it, expect } from 'vitest';
import { PublicationChecklist } from '../../domain/validation/PublicationChecklist';
import { Product } from '../../domain/models/Product';

describe('PublicationChecklist — Reglas de Publicación de Catálogo (RF-05 / EARS-N-02)', () => {
  const createDraftProduct = (overrides: Partial<Product> = {}): Product => ({
    id: 'prod_test_01',
    supplierId: 'sup_01',
    name: 'Mesa de Comedor Roble 6 Puestos',
    category: 'Comedores',
    status: 'borrador',
    suggestedPrice: 32000,
    floorPrice: 28000,
    dimensions: {
      widthCm: 180,
      heightCm: 76,
      depthCm: 90,
    },
    images: [
      {
        id: 'img_01',
        url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200',
        isPrimary: true,
        isBackgroundRemoved: true,
        isCropped1x1: true,
      },
    ],
    supplierCost: {
      productId: 'prod_test_01',
      baseCost: 23000,
      updatedAt: new Date().toISOString(),
    },
    stockQuantity: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  it('debería_aprobar_publicación_cuando_todos_los_campos_requeridos_están_completos', () => {
    // Arrange
    const product = createDraftProduct();

    // Act
    const result = PublicationChecklist.evaluate(product);

    // Assert
    expect(result.isReadyToPublish).toBe(true);
    expect(result.progressPct).toBe(100);
    expect(result.missingRequiredFields.length).toBe(0);
  });

  it('debería_bloquear_publicación_si_falta_la_imagen_procesada_EARS_N_02', () => {
    // Arrange (imagen sin recortar ni remover fondo)
    const product = createDraftProduct({
      images: [
        {
          id: 'img_raw',
          url: 'https://example.com/raw.jpg',
          isPrimary: true,
          isBackgroundRemoved: false,
          isCropped1x1: false,
        },
      ],
    });

    // Act
    const result = PublicationChecklist.evaluate(product);

    // Assert
    expect(result.isReadyToPublish).toBe(false);
    expect(result.missingRequiredFields).toContain('Fotografía procesada (Fondo removido o recorte 1:1)');
  });

  it('debería_bloquear_publicación_si_no_se_ha_ingresado_el_costo_base', () => {
    // Arrange
    const product = createDraftProduct({
      supplierCost: undefined,
      suggestedPrice: 0,
      floorPrice: 0,
    });

    // Act
    const result = PublicationChecklist.evaluate(product);

    // Assert
    expect(result.isReadyToPublish).toBe(false);
    expect(result.progressPct).toBeLessThan(100);
    expect(result.missingRequiredFields).toContain('Costo base y Precio sugerido / Suelo calculados');
  });
});
