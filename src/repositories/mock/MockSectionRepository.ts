import { ISectionRepository } from '../interfaces/IRepositories';
import { StorefrontSection } from '../../domain/models/StorefrontSection';
import { INITIAL_SECTIONS } from './initialData';

const STORAGE_KEY = 'barversuit_sections_v1';

export class MockSectionRepository implements ISectionRepository {
  private getStored(): StorefrontSection[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SECTIONS));
      return INITIAL_SECTIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SECTIONS;
    }
  }

  private saveAll(sections: StorefrontSection[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
    window.dispatchEvent(new CustomEvent('barversuit_sections_updated', { detail: sections }));
  }

  public async getAll(): Promise<StorefrontSection[]> {
    return this.getStored().sort((a, b) => a.order - b.order);
  }

  public async getById(id: string): Promise<StorefrontSection | null> {
    const section = this.getStored().find((s) => s.id === id);
    return section || null;
  }

  public async save(sectionData: Omit<StorefrontSection, 'createdAt'> & { createdAt?: string }): Promise<StorefrontSection> {
    const list = this.getStored();
    const existingIdx = list.findIndex((s) => s.id === sectionData.id);
    const section: StorefrontSection = {
      id: sectionData.id || `sec_${Date.now()}`,
      title: sectionData.title,
      subtitle: sectionData.subtitle,
      layoutType: sectionData.layoutType,
      order: sectionData.order ?? list.length + 1,
      isVisible: sectionData.isVisible ?? true,
      productIds: sectionData.productIds || [],
      tagIds: sectionData.tagIds || [],
      badgeText: sectionData.badgeText,
      customEventTag: sectionData.customEventTag,
      createdAt: sectionData.createdAt || new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      list[existingIdx] = section;
    } else {
      list.push(section);
    }
    this.saveAll(list);
    return section;
  }

  public async delete(id: string): Promise<boolean> {
    const list = this.getStored().filter((s) => s.id !== id);
    this.saveAll(list);
    return true;
  }

  public async reorder(sectionIds: string[]): Promise<StorefrontSection[]> {
    const list = this.getStored();
    const reordered = list.map((sec) => {
      const newIndex = sectionIds.indexOf(sec.id);
      return newIndex >= 0 ? { ...sec, order: newIndex + 1 } : sec;
    });
    this.saveAll(reordered);
    return reordered.sort((a, b) => a.order - b.order);
  }

  public async toggleVisibility(id: string, isVisible: boolean): Promise<StorefrontSection> {
    const list = this.getStored();
    const sec = list.find((s) => s.id === id);
    if (!sec) throw new Error(`Sección ${id} no encontrada`);

    sec.isVisible = isVisible;
    this.saveAll(list);
    return sec;
  }
}
