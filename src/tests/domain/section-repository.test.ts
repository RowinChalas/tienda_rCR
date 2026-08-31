import { describe, it, expect, beforeEach } from 'vitest';
import { MockSectionRepository } from '../../repositories/mock/MockSectionRepository';

describe('MockSectionRepository (Storefront Dynamic CMS)', () => {
  let sectionRepo: MockSectionRepository;

  beforeEach(() => {
    localStorage.clear();
    sectionRepo = new MockSectionRepository();
  });

  it('debe listar las secciones iniciales estilo Casamia / Guud.com', async () => {
    const sections = await sectionRepo.getAll();
    expect(sections.length).toBeGreaterThanOrEqual(4);
    expect(sections.some((s) => s.layoutType === 'tag_filtered_carousel')).toBe(true);
    expect(sections.some((s) => s.layoutType === 'art_gallery_centered')).toBe(true);
  });

  it('debe alternar la visibilidad de una sección (ocultar/mostrar)', async () => {
    const sections = await sectionRepo.getAll();
    const target = sections[0];

    const toggled = await sectionRepo.toggleVisibility(target.id, false);
    expect(toggled.isVisible).toBe(false);

    const reToggled = await sectionRepo.toggleVisibility(target.id, true);
    expect(reToggled.isVisible).toBe(true);
  });

  it('debe reordenar las secciones y persistir el orden numérico', async () => {
    const sections = await sectionRepo.getAll();
    const id1 = sections[0].id;
    const id2 = sections[1].id;

    // Invert order
    const reordered = await sectionRepo.reorder([id2, id1, ...sections.slice(2).map((s) => s.id)]);
    expect(reordered[0].id).toBe(id2);
    expect(reordered[0].order).toBe(1);
    expect(reordered[1].id).toBe(id1);
    expect(reordered[1].order).toBe(2);
  });
});
