/**
 * Modelos de Dominio — Tags y Etiquetas del Catálogo
 */

export interface Tag {
  id: string;
  name: string;      // ej: "cocina", "Telas para el hogar", "muebles", "Exclusivo Online", "Viernes Negro"
  slug: string;
  color?: string;    // Color de acento o badge
  description?: string;
  productIds: string[];
  createdAt: string;
}
