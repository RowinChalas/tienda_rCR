import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PlatformSettings } from '../domain/models/PlatformSettings';
import { CmsState, HeroSlideCms, NavMenuItem, SpaceScene, VisualCollection } from '../domain/models/CmsContent';
import { services } from '../services/ServiceContainer';
import { INITIAL_SETTINGS, INITIAL_CMS_STATE } from '../repositories/mock/initialData';

interface PlatformContextValue {
  settings: PlatformSettings;
  updateSettings: (updates: Partial<PlatformSettings>) => Promise<void>;
  cms: CmsState;
  updateCms: (updates: Partial<CmsState>) => Promise<void>;
  saveHeroSlide: (slide: HeroSlideCms) => Promise<void>;
  deleteHeroSlide: (id: string) => Promise<void>;
  saveScene: (scene: SpaceScene) => Promise<void>;
  deleteScene: (id: string) => Promise<void>;
  saveNavMenu: (item: NavMenuItem) => Promise<void>;
  deleteNavMenu: (id: string) => Promise<void>;
  saveCollection: (collection: VisualCollection) => Promise<void>;
  isLoading: boolean;
}

const PlatformContext = createContext<PlatformContextValue | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PlatformSettings>(INITIAL_SETTINGS);
  const [cms, setCms] = useState<CmsState>(INITIAL_CMS_STATE);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [storedSettings, storedCms] = await Promise.all([
        services.settingsRepo.get(),
        services.cmsRepo.getState(),
      ]);
      setSettings(storedSettings);
      setCms(storedCms);
    } catch (err) {
      console.error('Error cargando configuración de la plataforma:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleSettingsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<PlatformSettings>;
      if (customEvent.detail) setSettings(customEvent.detail);
      else loadData();
    };

    const handleCmsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<CmsState>;
      if (customEvent.detail) setCms(customEvent.detail);
      else loadData();
    };

    window.addEventListener('barversuit_settings_updated', handleSettingsUpdated);
    window.addEventListener('barversuit_cms_updated', handleCmsUpdated);

    return () => {
      window.removeEventListener('barversuit_settings_updated', handleSettingsUpdated);
      window.removeEventListener('barversuit_cms_updated', handleCmsUpdated);
    };
  }, []);

  const updateSettings = async (updates: Partial<PlatformSettings>) => {
    const updated = await services.settingsRepo.update(updates);
    setSettings(updated);
  };

  const updateCms = async (updates: Partial<CmsState>) => {
    const updated = await services.cmsRepo.updateState(updates);
    setCms(updated);
  };

  const saveHeroSlide = async (slide: HeroSlideCms) => {
    await services.cmsRepo.saveHeroSlide(slide);
    const fresh = await services.cmsRepo.getState();
    setCms(fresh);
  };

  const deleteHeroSlide = async (id: string) => {
    await services.cmsRepo.deleteHeroSlide(id);
    const fresh = await services.cmsRepo.getState();
    setCms(fresh);
  };

  const saveScene = async (scene: SpaceScene) => {
    await services.cmsRepo.saveScene(scene);
    const fresh = await services.cmsRepo.getState();
    setCms(fresh);
  };

  const deleteScene = async (id: string) => {
    await services.cmsRepo.deleteScene(id);
    const fresh = await services.cmsRepo.getState();
    setCms(fresh);
  };

  const saveNavMenu = async (item: NavMenuItem) => {
    await services.cmsRepo.saveNavMenu(item);
    const fresh = await services.cmsRepo.getState();
    setCms(fresh);
  };

  const deleteNavMenu = async (id: string) => {
    await services.cmsRepo.deleteNavMenu(id);
    const fresh = await services.cmsRepo.getState();
    setCms(fresh);
  };

  const saveCollection = async (collection: VisualCollection) => {
    await services.cmsRepo.saveCollection(collection);
    const fresh = await services.cmsRepo.getState();
    setCms(fresh);
  };

  return (
    <PlatformContext.Provider
      value={{
        settings,
        updateSettings,
        cms,
        updateCms,
        saveHeroSlide,
        deleteHeroSlide,
        saveScene,
        deleteScene,
        saveNavMenu,
        deleteNavMenu,
        saveCollection,
        isLoading,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = (): PlatformContextValue => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform debe ser utilizado dentro de un <PlatformProvider>');
  }
  return context;
};
