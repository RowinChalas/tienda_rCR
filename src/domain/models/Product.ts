/**
 * Modelos de Dominio — Catálogo y Proveedores
 * Conforme al Modelo de Datos del Diseño Técnico (§2.1)
 */

export type ProductStatus = 'borrador' | 'revision' | 'publicado' | 'agotado';

export type ProductCategory = 
  | 'Comedores'
  | 'Salas y Sofás'
  | 'Mesas de Centro'
  | 'Recámaras y Camas'
  | 'Sillas y Sillones'
  | 'Almacenamiento y Muebles TV'
  | 'Mobiliario de Exterior';

export interface Dimensions {
  widthCm: number;
  heightCm: number;
  depthCm: number;
  weightKg?: number;
}

export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  isBackgroundRemoved: boolean;
  isCropped1x1: boolean;
  originalFileName?: string;
}

export interface SupplierCost {
  productId: string;
  baseCost: number;
  updatedAt: string;
}

export type LogisticStatus = 'disponible_ya' | 'jit' | 'bajo_pedido';

export interface Product {
  id: string;
  supplierId: string;
  supplierName?: string;
  name: string;
  category: ProductCategory;
  status: ProductStatus;
  suggestedPrice: number;
  floorPrice: number;
  dimensions: Dimensions;
  images: ProductImage[];
  color?: string;
  material?: string;
  description?: string;
  supplierCost?: SupplierCost; // Solo visible para rol Admin
  relatedProductIds?: string[];
  stockQuantity: number;
  logisticStatus?: LogisticStatus; // 'disponible_ya' (Inmediato) | 'jit' (24-48h) | 'bajo_pedido' (15 días)
  estimatedFulfillmentText?: string;
  isFeaturedWeekly?: boolean; // Pieza destacada de la semana
  tags?: string[]; // Tags asociados ej: ['cocina', 'muebles', 'oferta', 'novedad']
  originalPrice?: number; // Para mostrar precio tachado ej: $64,000 -> $55,000
  discountPct?: number; // ej: 14%
  createdAt: string;
  updatedAt: string;
}

export type SupplierLevel = 1 | 2; // 1 = Principal (Fábrica), 2 = Satélite (Tienda local)

export interface SupplierContact {
  name: string;
  phone: string;
  email?: string;
  role: string;
}

export interface Supplier {
  id: string;
  businessName: string;
  contactWhatsapp: string;
  level: SupplierLevel;
  minVolume: number;
  maxVolume: number;
  geoZone: string;
  ratingScore: number; // 0.0 - 5.0
  activeProductsCount: number;
  stockoutRate: number; // Porcentaje histórico de desabastecimiento
  averageFulfillmentHours: number;
  createdAt: string;
}
