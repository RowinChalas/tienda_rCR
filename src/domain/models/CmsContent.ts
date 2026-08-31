/**
 * Modelos de Dominio — CMS del Storefront, Menús, Carruseles y Explorador de Espacios
 */

export interface NavMenuItem {
  id: string;
  label: string;
  targetCategory: string; // 'all' | 'sala' | 'comedor' | 'dormitorio' | 'oficina' | etc.
  customUrl?: string;
  order: number;
  isActive: boolean;
}

export interface HeroSlideCms {
  id: string;
  imageUrl: string;
  eyebrow: string;
  headline: string;
  subline: string;
  ctaText: string;
  targetCategory: string;
  order: number;
  isActive: boolean;
}

export interface SpaceHotspot {
  id: string;
  productId: string;
  label: string;
  x: number; // Coordenada X en porcentaje relativo (0.0% - 100.0%)
  y: number; // Coordenada Y en porcentaje relativo (0.0% - 100.0%)
}

export interface SpaceScene {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  hotspots: SpaceHotspot[];
  order: number;
  isActive: boolean;
}

export interface VisualCollection {
  id: string;
  categoryKey: string;
  title: string;
  description: string;
  coverImageUrl: string;
  order: number;
  productIds: string[];
  isActive: boolean;
}

export interface CmsState {
  navMenus: NavMenuItem[];
  heroSlides: HeroSlideCms[];
  spaceScenes: SpaceScene[];
  visualCollections: VisualCollection[];
  weeklyFeaturedLimit: number;
}
