// src/pages/LandingPage.tsx
// Landing page editorial completa: Hero → Categorías → Bestsellers → Lookbook → Brand Story
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Hammer, Star } from 'lucide-react';
import { HeroSlider } from '../modules/storefront/components/HeroSlider';
import { LookbookViewer } from '../modules/storefront/components/LookbookViewer';
import { ProductCard } from '../modules/storefront/components/ProductCard';
import { CATEGORIES, STOREFRONT_PRODUCTS, type StorefrontProduct } from '../modules/storefront/data/storefrontData';

interface LandingPageProps {
  onNavigateCatalog:  (category?: string) => void;
  onProductSelect:    (product: StorefrontProduct) => void;
}

const HERO_SLIDES = [
  {
    image:    '/images/heroes/hero-sala.jpg',
    eyebrow:  'Colección 2026',
    headline: 'La sala\nque imaginaste',
    subline:  'Sofás, mesas y butacas de autor. Producción dominicana bajo demanda.',
    cta:      'Explorar colección',
  },
  {
    image:    '/images/heroes/hero-comedor.jpg',
    eyebrow:  'Comedor & Cocina',
    headline: 'Cada comida,\nuna escena',
    subline:  'Mesas de mármol travertino y sillas esculpidas para momentos que importan.',
    cta:      'Ver comedores',
  },
  {
    image:    '/images/heroes/hero-dormitorio.jpg',
    eyebrow:  'Dormitorio',
    headline: 'Tu descanso\ncomienza aquí',
    subline:  'Camas, cabeceras y mesitas de noche. Materiales nobles, confort sin compromiso.',
    cta:      'Ver dormitorios',
  },
];

const VALUES = [
  { icon: Hammer, title: 'Hecho a mano',   desc: 'Cada pieza fabricada en talleres dominicanos por artesanos calificados.' },
  { icon: Leaf,   title: 'Madera local',   desc: 'Nogal y cedro de bosques certificados de República Dominicana.' },
  { icon: Star,   title: 'Just-in-Time',   desc: 'Fabricamos al recibir tu pedido. Sin inventario, sin desperdicio.' },
];

const featuredProducts = STOREFRONT_PRODUCTS.filter(p => p.isBestseller || p.isNew).slice(0, 4);

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateCatalog, onProductSelect }) => {
  const heroSlides = HERO_SLIDES.map((s, i) => ({
    ...s,
    onCta: () => onNavigateCatalog(['all', 'comedor', 'dormitorio'][i]),
  }));

  return (
    <div className="sf-root" style={{ background: 'var(--sf-bg)' }}>

      {/* ── 1. HERO SLIDER ─────────────────────────────── */}
      <HeroSlider slides={heroSlides} />

      {/* ── 2. CATEGORY GRID ──────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="sf-label mb-2">Navegar por espacio</p>
            <h2
              style={{
                fontFamily: 'var(--font-editorial)',
                fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                fontWeight: 400,
                letterSpacing: '-0.02em',
                color: 'var(--sf-charcoal)',
                lineHeight: 1.1,
              }}
            >
              Cada rincón,<br />una historia
            </h2>
          </div>
          <button
            onClick={() => onNavigateCatalog('all')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium hover:text-[var(--sf-madera)] transition-colors"
            style={{ color: 'var(--sf-charcoal-60)', fontFamily: 'var(--font-ui)', letterSpacing: '0.04em' }}
          >
            Ver todo <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 260, damping: 24, delay: i * 0.07 }}
              onClick={() => onNavigateCatalog(cat.id)}
              className="sf-cat-card group relative text-left rounded-sm overflow-hidden"
              style={{ aspectRatio: '3/4' }}
            >
              <img
                src={cat.cover}
                alt={cat.label}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <p
                  className="text-white font-medium text-sm mb-0.5"
                  style={{ fontFamily: 'var(--font-ui)' }}
                >
                  {cat.label}
                </p>
                <p
                  className="text-white/70 text-xs"
                  style={{ fontFamily: 'var(--font-ui)' }}
                >
                  {cat.description}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── 3. FEATURED PRODUCTS ──────────────────────── */}
      <section
        className="py-20"
        style={{ background: 'var(--sf-bg-alt)' }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="sf-label mb-2">Selección editorial</p>
              <h2
                style={{
                  fontFamily: 'var(--font-editorial)',
                  fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                  color: 'var(--sf-charcoal)',
                  lineHeight: 1.1,
                }}
              >
                Piezas de la semana
              </h2>
            </div>
            <button
              onClick={() => onNavigateCatalog('all')}
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium hover:text-[var(--sf-madera)] transition-colors"
              style={{ color: 'var(--sf-charcoal-60)', fontFamily: 'var(--font-ui)', letterSpacing: '0.04em' }}
            >
              Ver catálogo completo <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
            {featuredProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                onSelect={onProductSelect}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. LOOKBOOK / ROOM SCENE ───────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-10">
            <p className="sf-label mb-2">La escena completa</p>
            <h2
              style={{
                fontFamily: 'var(--font-editorial)',
                fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                fontWeight: 400,
                letterSpacing: '-0.02em',
                color: 'var(--sf-charcoal)',
                lineHeight: 1.1,
              }}
            >
              Explora el espacio
            </h2>
          </div>
          <LookbookViewer onProductSelect={onProductSelect} />
        </div>
      </section>

      {/* ── 5. BRAND VALUES ───────────────────────────── */}
      <section
        className="py-20"
        style={{ background: 'var(--sf-charcoal)' }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Text side */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200, damping: 26 }}
            >
              <p
                className="mb-4"
                style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--sf-madera-light)' }}
              >
                Nuestra filosofía
              </p>
              <h2
                className="mb-6"
                style={{
                  fontFamily: 'var(--font-editorial)',
                  fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                  fontWeight: 300,
                  letterSpacing: '-0.02em',
                  color: 'white',
                  lineHeight: 1.05,
                }}
              >
                Del taller<br />a tu hogar
              </h2>
              <p
                className="mb-8 leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--font-ui)', fontSize: '0.9375rem' }}
              >
                BarverSuit es un modelo just-in-time: no hay almacén, no hay inventario muerto.
                Cada pieza se fabrica al recibir tu pedido, con los mejores materiales dominicanos
                seleccionados por nuestro equipo de diseño.
              </p>
              <button
                onClick={() => onNavigateCatalog('all')}
                className="flex items-center gap-2 text-sm font-medium border-b border-white/30 pb-0.5 hover:border-white transition-colors"
                style={{ color: 'white', fontFamily: 'var(--font-ui)', letterSpacing: '0.03em', background: 'none' }}
              >
                Conocer la colección <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Values grid */}
            <div className="flex flex-col gap-6">
              {VALUES.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24, delay: i * 0.1 }}
                  className="flex items-start gap-4"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem' }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(139,111,71,0.25)', border: '1px solid rgba(196,168,130,0.3)' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: 'var(--sf-madera-light)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: 'white', fontFamily: 'var(--font-ui)' }}>
                      {title}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-ui)' }}>
                      {desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FINAL CTA STRIP ────────────────────────── */}
      <section className="py-16 text-center" style={{ background: 'var(--sf-madera-pale)' }}>
        <p className="sf-label mb-4">¿Listo para empezar?</p>
        <h2
          className="mb-6"
          style={{
            fontFamily: 'var(--font-editorial)',
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 400,
            letterSpacing: '-0.02em',
            color: 'var(--sf-charcoal)',
          }}
        >
          Diseña tu espacio ideal
        </h2>
        <button
          onClick={() => onNavigateCatalog('all')}
          className="sf-btn-primary mx-auto"
        >
          Explorar el catálogo <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
