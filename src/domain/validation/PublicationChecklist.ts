import { Product } from '../models/Product';

export interface ChecklistItem {
  id: string;
  label: string;
  isCompleted: boolean;
  isRequiredForPublish: boolean;
  helperText: string;
}

export interface PublicationChecklistResult {
  isReadyToPublish: boolean;
  progressPct: number;
  items: ChecklistItem[];
  missingRequiredFields: string[];
}

/**
 * Validador de Publicación de Catálogo (RF-05 / US-05 / EARS-N-02)
 */
export class PublicationChecklist {
  public static evaluate(product: Product): PublicationChecklistResult {
    const hasProcessedImage = product.images.length > 0 && product.images.some(img => img.isBackgroundRemoved || img.isCropped1x1);
    const hasAnyImage = product.images.length > 0;
    const hasValidCategory = Boolean(product.category && product.category.trim().length > 0);
    const hasValidName = Boolean(product.name && product.name.trim().length >= 3);
    const hasBaseCost = Boolean(product.supplierCost && product.supplierCost.baseCost > 0);
    const hasSuggestedPrice = Boolean(product.suggestedPrice && product.suggestedPrice > 0);
    const hasFloorPrice = Boolean(product.floorPrice && product.floorPrice > 0);
    const hasDimensions = Boolean(
      product.dimensions &&
      product.dimensions.widthCm > 0 &&
      product.dimensions.heightCm > 0 &&
      product.dimensions.depthCm > 0
    );

    const items: ChecklistItem[] = [
      {
        id: 'name',
        label: 'Título comercial del mueble (mín. 3 caracteres)',
        isCompleted: hasValidName,
        isRequiredForPublish: true,
        helperText: product.name ? `Título actual: "${product.name}"` : 'Falta ingresar el nombre del producto.',
      },
      {
        id: 'category',
        label: 'Categoría de producto asignada',
        isCompleted: hasValidCategory,
        isRequiredForPublish: true,
        helperText: product.category ? `Categoría: ${product.category}` : 'Seleccione una categoría válida.',
      },
      {
        id: 'images',
        label: 'Fotografía procesada (Fondo removido o recorte 1:1)',
        isCompleted: hasProcessedImage,
        isRequiredForPublish: true,
        helperText: hasProcessedImage
          ? `${product.images.length} imagen(es) procesada(s)`
          : hasAnyImage
          ? 'La imagen subida requiere procesamiento de recorte 1:1 o remoción de fondo.'
          : 'No se ha subido ninguna imagen.',
      },
      {
        id: 'dimensions',
        label: 'Dimensiones físicas completas (Ancho x Alto x Fondo)',
        isCompleted: hasDimensions,
        isRequiredForPublish: true,
        helperText: hasDimensions
          ? `${product.dimensions.widthCm} x ${product.dimensions.heightCm} x ${product.dimensions.depthCm} cm`
          : 'Faltan medidas exactas del mueble.',
      },
      {
        id: 'cost_and_prices',
        label: 'Costo base y Precio sugerido / Suelo calculados',
        isCompleted: hasBaseCost && hasSuggestedPrice && hasFloorPrice,
        isRequiredForPublish: true,
        helperText: (hasBaseCost && hasSuggestedPrice)
          ? `Costo: $${product.supplierCost?.baseCost.toLocaleString()} | Sugerido: $${product.suggestedPrice.toLocaleString()} | Suelo: $${product.floorPrice.toLocaleString()}`
          : 'Se requiere asignar el costo del proveedor para generar precios.',
      },
    ];

    const requiredItems = items.filter(item => item.isRequiredForPublish);
    const completedRequired = requiredItems.filter(item => item.isCompleted);
    const missingRequired = requiredItems.filter(item => !item.isCompleted).map(item => item.label);

    const isReadyToPublish = missingRequired.length === 0;
    const progressPct = Math.round((completedRequired.length / requiredItems.length) * 100);

    return {
      isReadyToPublish,
      progressPct,
      items,
      missingRequiredFields: missingRequired,
    };
  }
}
