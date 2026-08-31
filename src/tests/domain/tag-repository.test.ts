import { describe, it, expect, beforeEach } from 'vitest';
import { MockTagRepository } from '../../repositories/mock/MockTagRepository';

describe('MockTagRepository (Domain & Repositories)', () => {
  let tagRepo: MockTagRepository;

  beforeEach(() => {
    localStorage.clear();
    tagRepo = new MockTagRepository();
  });

  it('debe inicializar con los tags por defecto (#cocina, #telas, #muebles)', async () => {
    const tags = await tagRepo.getAll();
    expect(tags.length).toBeGreaterThanOrEqual(4);
    expect(tags.some((t) => t.slug === 'cocina')).toBe(true);
    expect(tags.some((t) => t.slug === 'muebles')).toBe(true);
  });

  it('debe crear y persistir un nuevo tag', async () => {
    const created = await tagRepo.save({
      id: 'tag_black_friday',
      name: 'Viernes Negro',
      slug: 'viernes-negro',
      color: '#ef4444',
      productIds: ['sofa-arco-gris'],
    });

    expect(created.id).toBe('tag_black_friday');
    expect(created.name).toBe('Viernes Negro');

    const fetched = await tagRepo.getById('tag_black_friday');
    expect(fetched).not.toBeNull();
    expect(fetched?.productIds).toContain('sofa-arco-gris');
  });

  it('debe asignar y desasignar productos a un tag de forma reactiva', async () => {
    const tag = await tagRepo.save({
      id: 'tag_test',
      name: 'Test Tag',
      slug: 'test-tag',
      productIds: [],
    });

    const updated = await tagRepo.assignProduct(tag.id, 'prod_123');
    expect(updated.productIds).toContain('prod_123');

    const removed = await tagRepo.removeProduct(tag.id, 'prod_123');
    expect(removed.productIds).not.toContain('prod_123');
  });
});
