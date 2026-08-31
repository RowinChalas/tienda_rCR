import { describe, it, expect, beforeEach } from 'vitest';
import { MockProductRepository } from '../../repositories/mock/MockProductRepository';

describe('MockProductRepository — Gestión y Actualización del Catálogo Activo', () => {
  let productRepo: MockProductRepository;

  beforeEach(() => {
    localStorage.clear();
    productRepo = new MockProductRepository();
  });

  it('debe actualizar existencias, stock, precio protegido y clasificación logística', async () => {
    const products = await productRepo.getAll();
    const target = products[0];

    const updated = await productRepo.update(target.id, {
      stockQuantity: 14,
      costBase: 42000,
      suggestedPrice: 56700,
      floorPrice: 49560,
      logisticStatus: 'disponible_ya',
      status: 'publicado',
    });

    expect(updated.stockQuantity).toBe(14);
    expect(updated.costBase).toBe(42000);
    expect(updated.suggestedPrice).toBe(56700);
    expect(updated.floorPrice).toBe(49560);
    expect(updated.logisticStatus).toBe('disponible_ya');

    const fetched = await productRepo.getById(target.id);
    expect(fetched?.stockQuantity).toBe(14);
  });

  it('debe filtrar productos por término de búsqueda en nombre, descripción y categoría', async () => {
    const results = await productRepo.getAll({ search: 'nogal' });
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every(
        (p) =>
          p.name.toLowerCase().includes('nogal') ||
          p.description?.toLowerCase().includes('nogal') ||
          p.material?.toLowerCase().includes('nogal')
      )
    ).toBe(true);
  });

  it('debe permitir eliminar un producto del catálogo', async () => {
    const products = await productRepo.getAll();
    const targetId = products[0].id;

    const success = await productRepo.delete(targetId);
    expect(success).toBe(true);

    const fetched = await productRepo.getById(targetId);
    expect(fetched).toBeNull();
  });
});
