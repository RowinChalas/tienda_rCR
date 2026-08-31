/**
 * Modelos de Dominio — Secciones Dinámicas Configurables de la Tienda (Estilo Casamia / Guud.com)
 */

export type SectionLayoutType =
  | 'tag_filtered_carousel'   // Carrusel con selector de tags en pastillas (#cocina, #muebles, #telas) — Ref: image.png
  | 'carousel_with_scrollbar'  // Carrusel horizontal continuo con barra de progreso — Ref: image copy.png
  | 'art_gallery_centered'     // Galería artística con tarjetas alargadas y precios iniciales — Ref: image copy 2.png
  | 'grid_4_cols'              // Grid editorial de 4 columnas
  | 'exclusive_banner';        // Banner destacado con productos

export interface StorefrontSection {
  id: string;
  title: string;
  subtitle?: string;
  layoutType: SectionLayoutType;
  order: number;
  isVisible: boolean;         // Permite ocultar/mostrar la sección aunque tenga items
  productIds: string[];
  tagIds?: string[];          // IDs de tags asociados para tag_filtered_carousel
  badgeText?: string;         // ej: "Novedad", "Oferta Especial", "Exclusivo Online", "Viernes Negro"
  customEventTag?: string;    // ej: "Black Friday", "Mes del Amor"
  createdAt: string;
}
