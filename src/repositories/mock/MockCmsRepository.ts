import { ICmsRepository } from '../interfaces/IRepositories';
import { CmsState, HeroSlideCms, NavMenuItem, SpaceScene, VisualCollection } from '../../domain/models/CmsContent';
import { INITIAL_CMS_STATE } from './initialData';

const STORAGE_KEY = 'barversuit_cms_v1';

export class MockCmsRepository implements ICmsRepository {
  private getStoredState(): CmsState {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CMS_STATE));
      return INITIAL_CMS_STATE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CMS_STATE;
    }
  }

  private save(state: CmsState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('barversuit_cms_updated', { detail: state }));
  }

  public async getState(): Promise<CmsState> {
    return this.getStoredState();
  }

  public async updateState(updates: Partial<CmsState>): Promise<CmsState> {
    const current = this.getStoredState();
    const updated: CmsState = {
      ...current,
      ...updates,
    };
    this.save(updated);
    return updated;
  }

  public async saveHeroSlide(slide: HeroSlideCms): Promise<HeroSlideCms> {
    const current = this.getStoredState();
    const idx = current.heroSlides.findIndex((s) => s.id === slide.id);
    let updatedSlides = [...current.heroSlides];
    if (idx >= 0) {
      updatedSlides[idx] = slide;
    } else {
      updatedSlides.push(slide);
    }
    this.save({ ...current, heroSlides: updatedSlides });
    return slide;
  }

  public async deleteHeroSlide(id: string): Promise<boolean> {
    const current = this.getStoredState();
    const updatedSlides = current.heroSlides.filter((s) => s.id !== id);
    this.save({ ...current, heroSlides: updatedSlides });
    return true;
  }

  public async saveScene(scene: SpaceScene): Promise<SpaceScene> {
    const current = this.getStoredState();
    const idx = current.spaceScenes.findIndex((s) => s.id === scene.id);
    let updatedScenes = [...current.spaceScenes];
    if (idx >= 0) {
      updatedScenes[idx] = scene;
    } else {
      updatedScenes.push(scene);
    }
    this.save({ ...current, spaceScenes: updatedScenes });
    return scene;
  }

  public async deleteScene(id: string): Promise<boolean> {
    const current = this.getStoredState();
    const updatedScenes = current.spaceScenes.filter((s) => s.id !== id);
    this.save({ ...current, spaceScenes: updatedScenes });
    return true;
  }

  public async saveNavMenu(item: NavMenuItem): Promise<NavMenuItem> {
    const current = this.getStoredState();
    const idx = current.navMenus.findIndex((m) => m.id === item.id);
    let updatedMenus = [...current.navMenus];
    if (idx >= 0) {
      updatedMenus[idx] = item;
    } else {
      updatedMenus.push(item);
    }
    this.save({ ...current, navMenus: updatedMenus });
    return item;
  }

  public async deleteNavMenu(id: string): Promise<boolean> {
    const current = this.getStoredState();
    const updatedMenus = current.navMenus.filter((m) => m.id !== id);
    this.save({ ...current, navMenus: updatedMenus });
    return true;
  }

  public async saveCollection(collection: VisualCollection): Promise<VisualCollection> {
    const current = this.getStoredState();
    const idx = current.visualCollections.findIndex((c) => c.id === collection.id);
    let updatedCollections = [...current.visualCollections];
    if (idx >= 0) {
      updatedCollections[idx] = collection;
    } else {
      updatedCollections.push(collection);
    }
    this.save({ ...current, visualCollections: updatedCollections });
    return collection;
  }
}
