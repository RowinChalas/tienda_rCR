import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StorefrontSection } from '../../../domain/models/StorefrontSection';
import { Tag } from '../../../domain/models/Tag';
import { StorefrontProduct, STOREFRONT_PRODUCTS } from '../data/storefrontData';
import { ProductCard } from './ProductCard';
import { services } from '../../../services/ServiceContainer';

interface DynamicSectionsRendererProps {
  onSelectProduct: (product: StorefrontProduct) => void;
}

export const DynamicSectionsRenderer: React.FC<DynamicSectionsRendererProps> = ({ onSelectProduct }) => {
  const [sections, setSections] = useState<StorefrontSection[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagBySection, setActiveTagBySection] = useState<Record<string, string>>({});

  const loadData = async () => {
    const secList = await services.sectionRepo.getAll();
    const tagList = await services.tagRepo.getAll();
    setSections(secList.filter((s) => s.isVisible));
    setTags(tagList);

    // Set initial active tag for tag-filtered sections
    const initialTags: Record<string, string> = {};
    secList.forEach((s) => {
      if (s.layoutType === 'tag_filtered_carousel' && s.tagIds && s.tagIds.length > 0) {
        initialTags[s.id] = s.tagIds[0];
      }
    });
    setActiveTagBySection(initialTags);
  };

  useEffect(() => {
    loadData();

    const handleSectionsUpdate = () => loadData();
    const handleTagsUpdate = () => loadData();
    window.addEventListener('barversuit_sections_updated', handleSectionsUpdate);
    window.addEventListener('barversuit_tags_updated', handleTagsUpdate);

    return () => {
      window.removeEventListener('barversuit_sections_updated', handleSectionsUpdate);
      window.removeEventListener('barversuit_tags_updated', handleTagsUpdate);
    };
  }, []);

  const getProductsForSection = (section: StorefrontSection): StorefrontProduct[] => {
    if (section.layoutType === 'tag_filtered_carousel') {
      const activeTagId = activeTagBySection[section.id];
      const tag = tags.find((t) => t.id === activeTagId);
      if (tag && tag.productIds.length > 0) {
        const filtered = STOREFRONT_PRODUCTS.filter(
          (p) => tag.productIds.includes(p.id) || (p.tags && p.tags.includes(tag.name.toLowerCase()))
        );
        if (filtered.length > 0) return filtered;
      }
    }

    // Default products by ID or fallback to all
    if (section.productIds && section.productIds.length > 0) {
      const matched = STOREFRONT_PRODUCTS.filter((p) => section.productIds.includes(p.id));
      if (matched.length > 0) return matched;
    }
    return STOREFRONT_PRODUCTS;
  };

  if (sections.length === 0) return null;

  return (
    <div className="space-y-24">
      {sections.map((section) => {
        const products = getProductsForSection(section);
        const sectionTags = tags.filter((t) => section.tagIds?.includes(t.id));

        return (
          <section key={section.id} className="w-full">
            {/* 1. TAG FILTERED CAROUSEL (Ref: image.png) */}
            {section.layoutType === 'tag_filtered_carousel' && (
              <div className="space-y-8">
                <div className="text-center max-w-3xl mx-auto space-y-2 px-6">
                  {section.badgeText && (
                    <span className="sf-label text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      {section.badgeText}
                    </span>
                  )}
                  <h2
                    className="text-2xl md:text-3xl font-light text-[var(--sf-charcoal)]"
                    style={{ fontFamily: 'var(--font-editorial)', letterSpacing: '-0.02em' }}
                  >
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <p className="text-xs text-[var(--sf-charcoal-60)]" style={{ fontFamily: 'var(--font-ui)' }}>
                      {section.subtitle}
                    </p>
                  )}
                </div>

                {/* Hashtag Pills Tabs (#cocina, #Telas para el hogar, #muebles, #Iluminación) */}
                {sectionTags.length > 0 && (
                  <div className="flex items-center justify-center gap-2 flex-wrap px-6">
                    {sectionTags.map((tag) => {
                      const isActive = activeTagBySection[section.id] === tag.id;
                      return (
                        <button
                          key={tag.id}
                          onClick={() =>
                            setActiveTagBySection((prev) => ({
                              ...prev,
                              [section.id]: tag.id,
                            }))
                          }
                          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                            isActive
                              ? 'bg-[var(--sf-charcoal)] text-white shadow-sm'
                              : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-400'
                          }`}
                          style={{ fontFamily: 'var(--font-ui)' }}
                        >
                          # {tag.name}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Horizontal Scroll Product Carousel with Bottom Progress Bar */}
                <div className="relative group">
                  <div className="overflow-x-auto pb-6 scrollbar-none px-6 md:px-12 flex gap-5">
                    {products.map((prod, pIdx) => (
                      <div key={prod.id} className="w-64 flex-shrink-0">
                        <ProductCard product={prod} index={pIdx} onSelect={onSelectProduct} />
                      </div>
                    ))}
                  </div>
                  {/* Visual Bottom Scroll Indicator Line */}
                  <div className="max-w-xs mx-auto h-0.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-[var(--sf-charcoal)] rounded-full" />
                  </div>
                </div>
              </div>
            )}

            {/* 2. CAROUSEL WITH SCROLLBAR ("Acaba de llegar" - Ref: image copy.png) */}
            {section.layoutType === 'carousel_with_scrollbar' && (
              <div className="space-y-6">
                <div className="text-center max-w-2xl mx-auto space-y-1.5 px-6">
                  <h2
                    className="text-2xl md:text-3xl font-light text-[var(--sf-charcoal)]"
                    style={{ fontFamily: 'var(--font-editorial)' }}
                  >
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <p className="text-xs text-[var(--sf-charcoal-60)]">{section.subtitle}</p>
                  )}
                </div>

                <div className="overflow-x-auto pb-6 px-6 md:px-12 flex gap-5 scrollbar-none">
                  {products.map((prod, pIdx) => (
                    <div key={prod.id} className="w-64 flex-shrink-0">
                      <ProductCard product={prod} index={pIdx} onSelect={onSelectProduct} />
                    </div>
                  ))}
                </div>

                <div className="max-w-xs mx-auto h-0.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="w-1/4 h-full bg-[var(--sf-charcoal)] rounded-full" />
                </div>
              </div>
            )}

            {/* 3. ART GALLERY CENTERED ("Mi pequeña galería de arte en casa" - Ref: image copy 2.png) */}
            {section.layoutType === 'art_gallery_centered' && (
              <div className="space-y-8 bg-gradient-to-b from-stone-100/60 to-transparent py-12 rounded-sm">
                <div className="text-center max-w-2xl mx-auto space-y-2 px-6">
                  <span className="sf-label text-stone-600 bg-stone-200/80 px-2.5 py-0.5 rounded-full text-[10px]">
                    Curaduría Artística
                  </span>
                  <h2
                    className="text-2xl md:text-3xl font-light text-[var(--sf-charcoal)]"
                    style={{ fontFamily: 'var(--font-editorial)' }}
                  >
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <p className="text-xs text-[var(--sf-charcoal-60)]">{section.subtitle}</p>
                  )}
                </div>

                {/* Art Cards Carousel with Silver Gradient Background (Ref: image copy 2.png) */}
                <div className="overflow-x-auto pb-6 px-6 md:px-12 flex gap-6 items-center scrollbar-none">
                  {products.map((prod, pIdx) => {
                    const isCenterFeatured = pIdx === 1 || pIdx === 0;
                    return (
                      <motion.div
                        key={prod.id}
                        whileHover={{ y: -6 }}
                        onClick={() => onSelectProduct(prod)}
                        className={`flex-shrink-0 rounded-sm overflow-hidden cursor-pointer shadow-md transition-all relative flex flex-col justify-between p-6 ${
                          isCenterFeatured ? 'w-80 h-[460px] bg-gradient-to-b from-slate-200 via-stone-300 to-stone-500' : 'w-72 h-[420px] bg-gradient-to-b from-slate-100 via-stone-200 to-stone-400'
                        }`}
                      >
                        <div className="w-full flex-1 flex items-center justify-center p-4">
                          <div className="w-full h-full max-h-60 bg-white p-2 rounded-sm shadow-xl flex items-center justify-center overflow-hidden">
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        <div className="text-white space-y-1 pt-4">
                          <p className="text-[11px] font-medium opacity-80 uppercase tracking-wider">{prod.brand}</p>
                          <h4 className="text-sm font-bold truncate">{prod.name}</h4>
                          <p className="text-base font-bold">{prod.priceFormatted}~</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Dot Pagination indicator */}
                <div className="flex justify-center items-center gap-1.5 pt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span className="w-2 h-2 rounded-full bg-[var(--sf-charcoal)]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                </div>
              </div>
            )}

            {/* 4. GRID 4 COLUMNS ("Exclusivo Online") */}
            {section.layoutType === 'grid_4_cols' && (
              <div className="space-y-8 px-6 md:px-12">
                <div className="flex items-end justify-between border-b pb-4" style={{ borderColor: 'var(--sf-stone)' }}>
                  <div>
                    <span className="sf-label text-brand-600 font-bold uppercase tracking-wider text-[10px]">
                      {section.badgeText || 'Exclusivo'}
                    </span>
                    <h2
                      className="text-2xl md:text-3xl font-light text-[var(--sf-charcoal)] mt-1"
                      style={{ fontFamily: 'var(--font-editorial)' }}
                    >
                      {section.title}
                    </h2>
                    {section.subtitle && (
                      <p className="text-xs text-[var(--sf-charcoal-60)] mt-0.5">{section.subtitle}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {products.slice(0, 4).map((prod, pIdx) => (
                    <ProductCard key={prod.id} product={prod} index={pIdx} onSelect={onSelectProduct} />
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};
