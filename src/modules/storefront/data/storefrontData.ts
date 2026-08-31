// src/modules/storefront/data/storefrontData.ts
// Datos del catálogo público — completamente desacoplados del admin

export type StorefrontLogisticStatus = 'disponible_ya' | 'jit' | 'bajo_pedido';

export interface StorefrontProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: StorefrontCategory;
  price: number;
  priceFormatted: string;
  originalPrice?: number;
  originalPriceFormatted?: string;
  discountPct?: number;
  tags?: string[];
  description: string;
  materials: string;
  dimensions: { width: number; height: number; depth: number };
  /** ≥1 imágenes; la primera es el thumbnail principal */
  images: string[];
  /** Imagen de fondo/ambiente para el 3D viewer */
  ambientImage?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  isFeaturedWeekly?: boolean;
  isArtPiece?: boolean;
  inStock: boolean;
  logisticStatus?: StorefrontLogisticStatus;
  estimatedFulfillmentText?: string;
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
    originalPrice: 215000,
    originalPriceFormatted: fmt(215000),
    discountPct: 14,
    tags: ['muebles', 'sala', 'novedad', 'exclusivo'],
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
    isFeaturedWeekly: true,
    inStock: true,
    logisticStatus: 'jit',
    estimatedFulfillmentText: '⚡ Despacho en 24-48h (JIT)',
  },
  {
    id: 'mesa-travertino-nogal',
    slug: 'mesa-centro-travertino-nogal',
    name: 'Mesa Centro Travertino & Nogal',
    brand: 'BarverSuit',
    category: 'sala',
    price: 68490,
    priceFormatted: fmt(68490),
    originalPrice: 85000,
    originalPriceFormatted: fmt(85000),
    discountPct: 20,
    tags: ['muebles', 'sala', 'novedad'],
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
    isFeaturedWeekly: true,
    inStock: true,
    logisticStatus: 'disponible_ya',
    estimatedFulfillmentText: '✦ Envío Inmediato',
  },
  {
    id: 'silla-luna-camel',
    slug: 'silla-comedor-luna-camel',
    name: 'Silla Luna — Boucle Camel',
    brand: 'BarverSuit',
    category: 'comedor',
    price: 22990,
    priceFormatted: fmt(22990),
    originalPrice: 28000,
    originalPriceFormatted: fmt(28000),
    discountPct: 18,
    tags: ['muebles', 'comedor', 'telas'],
    description:
      'Forma esculpida que abraza el cuerpo. Estructura de nogal oscuro con asiento y respaldo tapizados en bouclé camel. Ideal para comedores formales o como silla de escritorio de lujo.',
    materials: 'Nogal oscuro + Bouclé camel 100% lana reciclada',
    dimensions: { width: 56, height: 78, depth: 58 },
    images: [
      '/images/products/silla-01.jpg',
    ],
    ambientImage: '/images/heroes/hero-comedor.jpg',
    isNew: true,
    isFeaturedWeekly: true,
    inStock: true,
    logisticStatus: 'disponible_ya',
    estimatedFulfillmentText: '✦ Envío Inmediato',
  },
  {
    id: 'cabecera-cuero-cognac',
    slug: 'cabecera-cuero-cognac-metal',
    name: 'Cabecera Cuero Cognac',
    brand: 'BarverSuit',
    category: 'dormitorio',
    price: 54990,
    priceFormatted: fmt(54990),
    originalPrice: 65000,
    originalPriceFormatted: fmt(65000),
    discountPct: 15,
    tags: ['dormitorio', 'telas', 'exclusivo'],
    description:
      'Panel king-size en cuero full-grain cognac con costuras rectas. Marco de acero negro mate de 16mm. Diseño que equilibra industrialismo y calidez artesanal.',
    materials: 'Cuero full-grain cognac + Acero negro mate',
    dimensions: { width: 192, height: 110, depth: 8 },
    images: [
      '/images/products/cabecera-01.jpg',
    ],
    ambientImage: '/images/heroes/hero-dormitorio.jpg',
    isFeaturedWeekly: true,
    inStock: true,
    logisticStatus: 'bajo_pedido',
    estimatedFulfillmentText: '⏱ Fabricación en 15 días',
  },
  {
    id: 'cuadro-horizonte-minimal',
    slug: 'cuadro-galeria-horizonte',
    name: 'Horizonte Etéreo — Impresión Enmarcada',
    brand: 'Galería BarverSuit',
    category: 'sala',
    price: 34900,
    priceFormatted: fmt(34900),
    originalPrice: 42000,
    originalPriceFormatted: fmt(42000),
    discountPct: 17,
    tags: ['iluminacion', 'decoracion', 'arte'],
    description: 'Impresión fine-art sobre papel de algodón 310g con marco en madera de roble natural y cristal antirreflejo.',
    materials: 'Papel algodón 310g + Marco Roble Natural',
    dimensions: { width: 120, height: 80, depth: 4 },
    images: ['/images/lookbook/sala-full.jpg'],
    isArtPiece: true,
    inStock: true,
    logisticStatus: 'disponible_ya',
    estimatedFulfillmentText: '✦ Envío Inmediato',
  },
  {
    id: 'lampara-escultura-bronce',
    slug: 'lampara-mesa-escultura-bronce',
    name: 'Lámpara de Mesa Escultórica',
    brand: 'Studio BarverSuit',
    category: 'oficina',
    price: 18500,
    priceFormatted: fmt(18500),
    tags: ['iluminacion', 'decoracion', 'novedad'],
    description: 'Base de cerámica texturizada a mano con pantalla de lino orgánico y dimmer táctil.',
    materials: 'Cerámica volcánica + Lino crudo',
    dimensions: { width: 35, height: 50, depth: 35 },
    images: ['/images/heroes/hero-sala.jpg'],
    inStock: true,
    logisticStatus: 'jit',
    estimatedFulfillmentText: '⚡ Despacho en 24-48h (JIT)',
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
