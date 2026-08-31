// src/modules/storefront/data/storefrontData.ts
// Datos del catálogo público — completamente desacoplados del admin

export interface StorefrontProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: StorefrontCategory;
  price: number;
  priceFormatted: string;
  description: string;
  materials: string;
  dimensions: { width: number; height: number; depth: number };
  /** ≥1 imágenes; la primera es el thumbnail principal */
  images: string[];
  /** Imagen de fondo/ambiente para el 3D viewer */
  ambientImage?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  inStock: boolean;
}

export type StorefrontCategory =
  | 'sala'
  | 'comedor'
  | 'dormitorio'
  | 'oficina'
  | 'exterior'
  | 'almacenamiento';

export interface CategoryMeta {
  id: StorefrontCategory;
  label: string;
  cover: string;
  description: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'sala',          label: 'Sala',         cover: '/images/categories/sala.jpg',      description: 'Sofás, butacas y mesas de centro' },
  { id: 'comedor',       label: 'Comedor',      cover: '/images/categories/comedor.jpg',   description: 'Mesas y sillas de comedor' },
  { id: 'dormitorio',    label: 'Dormitorio',   cover: '/images/heroes/hero-dormitorio.jpg',  description: 'Camas, cabeceras y mesitas' },
  { id: 'oficina',       label: 'Oficina',      cover: '/images/heroes/hero-sala.jpg',     description: 'Escritorios y sillas de trabajo' },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', maximumFractionDigits: 0 }).format(n);

export const STOREFRONT_PRODUCTS: StorefrontProduct[] = [
  {
    id: 'sofa-arco-gris',
    slug: 'sofa-arco-gris-nogal',
    name: 'Sofá Arco — Gris Piedra',
    brand: 'BarverSuit',
    category: 'sala',
    price: 185990,
    priceFormatted: fmt(185990),
    description:
      'Estructura de nogal macizo dominicano. Tapizado en lino gris piedra de alta resistencia. Diseño atemporal con patas cónicas que elevan visualmente la pieza. Producción bajo demanda, entrega en 3-5 semanas.',
    materials: 'Nogal macizo + Lino gris piedra (grado contract)',
    dimensions: { width: 220, height: 82, depth: 88 },
    images: [
      '/images/products/sofa-01.jpg',
      '/images/products/sofa-02.jpg',
      '/images/products/sofa-03.jpg',
    ],
    ambientImage: '/images/heroes/hero-sala.jpg',
    isBestseller: true,
    inStock: true,
  },
  {
    id: 'mesa-travertino-nogal',
    slug: 'mesa-centro-travertino-nogal',
    name: 'Mesa Centro Travertino & Nogal',
    brand: 'BarverSuit',
    category: 'sala',
    price: 68490,
    priceFormatted: fmt(68490),
    description:
      'Tablero redondo en travertino natural con veteado único. Base de nogal tallado a mano con patas arqueadas inspiradas en la biología de los arcos góticos. Pieza artesanal de colección.',
    materials: 'Travertino romano + Nogal macizo dominicano',
    dimensions: { width: 90, height: 42, depth: 90 },
    images: [
      '/images/products/mesa-01.jpg',
      '/images/products/mesa-02.jpg',
    ],
    ambientImage: '/images/lookbook/sala-full.jpg',
    isNew: true,
    inStock: true,
  },
  {
    id: 'silla-luna-camel',
    slug: 'silla-comedor-luna-camel',
    name: 'Silla Luna — Boucle Camel',
    brand: 'BarverSuit',
    category: 'comedor',
    price: 22990,
    priceFormatted: fmt(22990),
    description:
      'Forma esculpida que abraza el cuerpo. Estructura de nogal oscuro con asiento y respaldo tapizados en bouclé camel. Ideal para comedores formales o como silla de escritorio de lujo.',
    materials: 'Nogal oscuro + Bouclé camel 100% lana reciclada',
    dimensions: { width: 56, height: 78, depth: 58 },
    images: [
      '/images/products/silla-01.jpg',
    ],
    ambientImage: '/images/heroes/hero-comedor.jpg',
    isNew: true,
    inStock: true,
  },
  {
    id: 'cabecera-cuero-cognac',
    slug: 'cabecera-cuero-cognac-metal',
    name: 'Cabecera Cuero Cognac',
    brand: 'BarverSuit',
    category: 'dormitorio',
    price: 54990,
    priceFormatted: fmt(54990),
    description:
      'Panel king-size en cuero full-grain cognac con costuras rectas. Marco de acero negro mate de 16mm. Diseño que equilibra industrialismo y calidez artesanal.',
    materials: 'Cuero full-grain cognac + Acero negro mate',
    dimensions: { width: 192, height: 110, depth: 8 },
    images: [
      '/images/products/cabecera-01.jpg',
    ],
    ambientImage: '/images/heroes/hero-dormitorio.jpg',
    inStock: true,
  },
];

export const LOOKBOOK_HOTSPOTS = [
  {
    id: 'hs-sofa',
    x: 42,  // percentage from left
    y: 52,  // percentage from top
    productId: 'sofa-arco-gris',
    label: 'Sofá Arco',
  },
  {
    id: 'hs-mesa',
    x: 38,
    y: 72,
    productId: 'mesa-travertino-nogal',
    label: 'Mesa Travertino',
  },
];
