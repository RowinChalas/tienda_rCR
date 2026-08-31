import { ITagRepository } from '../interfaces/IRepositories';
import { Tag } from '../../domain/models/Tag';
import { INITIAL_TAGS } from './initialData';

const STORAGE_KEY = 'barversuit_tags_v1';

export class MockTagRepository implements ITagRepository {
  private getStored(): Tag[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TAGS));
      return INITIAL_TAGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_TAGS;
    }
  }

  private saveAll(tags: Tag[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
    window.dispatchEvent(new CustomEvent('barversuit_tags_updated', { detail: tags }));
  }

  public async getAll(): Promise<Tag[]> {
    return this.getStored();
  }

  public async getById(id: string): Promise<Tag | null> {
    const tag = this.getStored().find((t) => t.id === id);
    return tag || null;
  }

  public async save(tagData: Omit<Tag, 'createdAt'> & { createdAt?: string }): Promise<Tag> {
    const list = this.getStored();
    const existingIdx = list.findIndex((t) => t.id === tagData.id);
    const tag: Tag = {
      id: tagData.id || `tag_${Date.now()}`,
      name: tagData.name,
      slug: tagData.slug || tagData.name.toLowerCase().replace(/\s+/g, '-'),
      color: tagData.color || '#3b82f6',
      description: tagData.description,
      productIds: tagData.productIds || [],
      createdAt: tagData.createdAt || new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      list[existingIdx] = tag;
    } else {
      list.push(tag);
    }
    this.saveAll(list);
    return tag;
  }

  public async delete(id: string): Promise<boolean> {
    const list = this.getStored().filter((t) => t.id !== id);
    this.saveAll(list);
    return true;
  }

  public async assignProduct(tagId: string, productId: string): Promise<Tag> {
    const list = this.getStored();
    const tag = list.find((t) => t.id === tagId);
    if (!tag) throw new Error(`Tag ${tagId} no encontrado`);

    if (!tag.productIds.includes(productId)) {
      tag.productIds.push(productId);
      this.saveAll(list);
    }
    return tag;
  }

  public async removeProduct(tagId: string, productId: string): Promise<Tag> {
    const list = this.getStored();
    const tag = list.find((t) => t.id === tagId);
    if (!tag) throw new Error(`Tag ${tagId} no encontrado`);

    tag.productIds = tag.productIds.filter((p) => p !== productId);
    this.saveAll(list);
    return tag;
  }
}
