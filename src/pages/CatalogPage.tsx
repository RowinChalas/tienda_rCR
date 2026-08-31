// src/pages/CatalogPage.tsx
// Catálogo público con filtros por categoría y grilla de productos
import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '../modules/storefront/components/ProductCard';
import { CATEGORIES, STOREFRONT_PRODUCTS, type StorefrontCategory, type StorefrontProduct } from '../modules/storefront/data/storefrontData';

import { Tag } from '../domain/models/Tag';
import { services } from '../services/ServiceContainer';

interface CatalogPageProps {
  onProductSelect: (product: StorefrontProduct) => void;
  initialCategory?: StorefrontCategory | 'all';
  initialSearchQuery?: string;
  initialTag?: string;
}

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'new';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'featured',   label: 'Destacados' },
  { value: 'new',        label: 'Novedades' },
  { value: 'price-asc',  label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
];

export const CatalogPage: React.FC<CatalogPageProps> = ({
  onProductSelect,
  initialCategory = 'all',
  initialSearchQuery = '',
  initialTag = 'all',
}) => {
  const [activeCategory, setActiveCategory] = useState<StorefrontCategory | 'all'>(initialCategory);
  const [activeTag, setActiveTag] = useState<string>(initialTag);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [sort, setSort] = useState<SortKey>('featured');
  const [tags, setTags] = useState<Tag[]>([]);

  // Sincronizar cuando cambia el prop initialCategory desde el Navbar u otros enlaces
  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  useEffect(() => {
    const loadTags = async () => {
      const tgs = await services.tagRepo.getAll();
      setTags(tgs);
    };
    loadTags();
  }, []);

  const filtered = useMemo(() => {
    let list = STOREFRONT_PRODUCTS;

    // 1. Filtrar por categoría
    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }

    // 2. Filtrar por tag si está seleccionado
    if (activeTag !== 'all') {
      const selectedTagObj = tags.find((t) => t.id === activeTag || t.slug === activeTag);
      if (selectedTagObj) {
        list = list.filter(
          (p) =>
            selectedTagObj.productIds.includes(p.id) ||
            (p.tags && p.tags.includes(selectedTagObj.name.toLowerCase()))
        );
      }
    }

    // 3. Filtrar por búsqueda de texto
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.materials.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // 4. Ordenar
    if (sort === 'price-asc')  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'new')        list = [...list].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

    return list;
  }, [activeCategory, activeTag, searchQuery, sort, tags]);

  return (
    <div className="sf-root min-h-screen" style={{ background: 'var(--sf-bg)' }}>
      {/* Page header */}
      <div
        className="px-6 md:px-12 pt-14 pb-10"
        style={{ borderBottom: '1px solid var(--sf-stone)' }}
      >
        <div className="max-w-7xl mx-auto">
          <p className="sf-label mb-3">Colección</p>
          <h1
            style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 300,
              letterSpacing: '-0.02em',
              color: 'var(--sf-charcoal)',
              lineHeight: 1.05,
            }}
          >
            Catálogo BarverSuit
          </h1>
          <p
            className="mt-3 max-w-lg"
            style={{ color: 'var(--sf-charcoal-60)', fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', lineHeight: 1.65 }}
          >
            Mobiliario artesanal dominicano. Producción bajo demanda, entrega directa del taller a tu hogar.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div
        className="sticky top-0 z-20 px-6 md:px-12 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        style={{ background: 'rgba(247,245,242,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--sf-stone)' }}
      >
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Category pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 flex-1">
            <button
              onClick={() => setActiveCategory('all')}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
              style={{
                fontFamily: 'var(--font-ui)',
                background: activeCategory === 'all' ? 'var(--sf-charcoal)' : 'transparent',
                color: activeCategory === 'all' ? 'white' : 'var(--sf-charcoal-60)',
                border: `1px solid ${activeCategory === 'all' ? 'var(--sf-charcoal)' : 'var(--sf-stone-strong)'}`,
              }}
            >
              Todo
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  fontFamily: 'var(--font-ui)',
                  background: activeCategory === cat.id ? 'var(--sf-charcoal)' : 'transparent',
                  color: activeCategory === cat.id ? 'white' : 'var(--sf-charcoal-60)',
                  border: `1px solid ${activeCategory === cat.id ? 'var(--sf-charcoal)' : 'var(--sf-stone-strong)'}`,
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: 'var(--sf-charcoal-35)' }} />
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              className="text-xs font-medium bg-transparent border-none outline-none cursor-pointer"
              style={{ color: 'var(--sf-charcoal-60)', fontFamily: 'var(--font-ui)' }}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub-bar: Hashtags & Active Search Filter */}
        {(tags.length > 0 || searchQuery.trim()) && (
          <div className="max-w-7xl mx-auto w-full pt-2.5 flex items-center justify-between gap-3 border-t border-black/5 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--sf-charcoal-60)' }}>
                Hashtags:
              </span>
              <button
                onClick={() => setActiveTag('all')}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  activeTag === 'all'
                    ? 'bg-neutral-800 text-white font-bold'
                    : 'bg-stone-200/60 text-stone-700 hover:bg-stone-300/80'
                }`}
              >
                #todos
              </button>
              {tags.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTag(t.id === activeTag ? 'all' : t.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    activeTag === t.id
                      ? 'bg-brand-600 text-white font-bold shadow-sm'
                      : 'bg-stone-200/60 text-stone-700 hover:bg-stone-300/80'
                  }`}
                >
                  #{t.name}
                </button>
              ))}
            </div>

            {searchQuery.trim() && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-800 flex-shrink-0">
                <span>Búsqueda: &ldquo;<strong>{searchQuery}</strong>&rdquo;</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="w-4 h-4 rounded-full bg-amber-500/20 hover:bg-amber-500/30 flex items-center justify-center text-[10px] font-bold"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Products grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="sf-label mb-2">Sin resultados</p>
            <p style={{ color: 'var(--sf-charcoal-60)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem' }}>
              No hay productos en esta categoría aún.
            </p>
            <button onClick={() => setActiveCategory('all')} className="sf-btn-secondary mt-6 mx-auto">
              Ver todo el catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {filtered.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                onSelect={onProductSelect}
              />
            ))}
          </div>
        )}

        {/* Product count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center text-xs"
          style={{ color: 'var(--sf-charcoal-35)', fontFamily: 'var(--font-ui)', letterSpacing: '0.06em' }}
        >
          {filtered.length} {filtered.length === 1 ? 'pieza' : 'piezas'} en colección
        </motion.p>
      </div>
    </div>
  );
};
