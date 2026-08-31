import { ISettingsRepository } from '../interfaces/IRepositories';
import { PlatformSettings } from '../../domain/models/PlatformSettings';
import { INITIAL_SETTINGS } from './initialData';

const STORAGE_KEY = 'barversuit_settings_v1';

export class MockSettingsRepository implements ISettingsRepository {
  private getStoredSettings(): PlatformSettings {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  private save(settings: PlatformSettings): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('barversuit_settings_updated', { detail: settings }));
  }

  public async get(): Promise<PlatformSettings> {
    return this.getStoredSettings();
  }

  public async update(updates: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const current = this.getStoredSettings();
    const updated: PlatformSettings = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save(updated);
    return updated;
  }
}
