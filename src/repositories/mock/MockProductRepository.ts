import { IProductRepository, ProductFilters } from '../interfaces/IProductRepository';
import { Product, ProductStatus } from '../../domain/models/Product';
import { INITIAL_PRODUCTS } from './initialData';
import { PublicationChecklist } from '../../domain/validation/PublicationChecklist';

const STORAGE_KEY = 'barversuit_products_v1';

export class MockProductRepository implements IProductRepository {
  private getStoredProducts(): Product[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PRODUCTS;
    }
  }

  private save(products: Product[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('barversuit_products_changed'));
  }

  public async getAll(filters?: ProductFilters): Promise<Product[]> {
    let list = this.getStoredProducts();
    if (!filters) return list;

    if (filters.category) {
      list = list.filter((p) => p.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters.supplierId) {
      list = list.filter((p) => p.supplierId === filters.supplierId);
    }
    if (filters.status) {
      list = list.filter((p) => p.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.supplierName?.toLowerCase().includes(q),
      );
    }
    return list;
  }

  public async getById(id: string): Promise<Product | null> {
    const list = this.getStoredProducts();
    return list.find((p) => p.id === id) || null;
  }

  public async create(
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Product> {
    const list = this.getStoredProducts();
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(newProduct);
    this.save(list);
    return newProduct;
  }

  public async createDraft(
    draftData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Product> {
    const list = this.getStoredProducts();
    const newProduct: Product = {
      ...draftData,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(newProduct);
    this.save(list);
    return newProduct;
  }

  public async update(id: string, updates: Partial<Product>): Promise<Product> {
    const list = this.getStoredProducts();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Producto con ID ${id} no encontrado.`);

    const updated = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    this.save(list);
    return updated;
  }

  public async publish(id: string): Promise<Product> {
    const list = this.getStoredProducts();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Producto ${id} no encontrado.`);

    const evaluation = PublicationChecklist.evaluate(list[index]);
    if (!evaluation.isReadyToPublish) {
      throw new Error(
        `EARS-N-02: No se puede publicar el producto. Campos faltantes: ${evaluation.missingRequiredFields.join(', ')}`,
      );
    }

    const updated: Product = {
      ...list[index],
      status: 'publicado',
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    this.save(list);
    return updated;
  }

  public async markStatus(id: string, status: ProductStatus): Promise<Product> {
    return this.update(id, { status });
  }

  public async delete(id: string): Promise<boolean> {
    const list = this.getStoredProducts();
    const filtered = list.filter((p) => p.id !== id);
    this.save(filtered);
    return true;
  }

  public async processImage(
    productId: string,
    imageId: string,
    options: { crop1x1?: boolean; removeBg?: boolean },
  ): Promise<Product> {
    const list = this.getStoredProducts();
    const product = list.find((p) => p.id === productId);
    if (!product) throw new Error(`Producto ${productId} no encontrado.`);

    const updatedImages = product.images.map((img) => {
      if (img.id === imageId) {
        return {
          ...img,
          isCropped1x1: options.crop1x1 !== undefined ? options.crop1x1 : img.isCropped1x1,
          isBackgroundRemoved: options.removeBg !== undefined ? options.removeBg : img.isBackgroundRemoved,
        };
      }
      return img;
    });

    return this.update(productId, { images: updatedImages });
  }
}
