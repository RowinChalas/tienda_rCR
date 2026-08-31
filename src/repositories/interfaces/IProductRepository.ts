import { Product, ProductStatus } from '../../domain/models/Product';

export interface ProductFilters {
  category?: string;
  supplierId?: string;
  status?: ProductStatus;
  search?: string;
}

export interface IProductRepository {
  getAll(filters?: ProductFilters): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  createDraft(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  update(id: string, updates: Partial<Product>): Promise<Product>;
  publish(id: string): Promise<Product>;
  markStatus(id: string, status: ProductStatus): Promise<Product>;
  delete(id: string): Promise<boolean>;
  processImage(productId: string, imageId: string, options: { crop1x1?: boolean; removeBg?: boolean }): Promise<Product>;
}
