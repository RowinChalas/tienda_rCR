import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, ArrowRight } from 'lucide-react';
import { STOREFRONT_PRODUCTS, StorefrontProduct } from '../data/storefrontData';
import { Tag } from '../../../domain/models/Tag';
import { services } from '../../../services/ServiceContainer';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: StorefrontProduct) => void;
  onSearchSubmit: (query: string) => void;
}

const POPULAR_SEARCH_TERMS = [
  'Sofá Arco',
  'Mesa Nogal',
  'Comedor',
  'Sillón Bouclé',
  'Envío Inmediato',
  'Roble Natural',
  'Arte',
];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onSearchSubmit,
}) => {
  const [query, setQuery] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const loadTags = async () => {
      const list = await services.tagRepo.getAll();
      setTags(list);
    };
    loadTags();
  }, []);

  const results = query.trim()
    ? STOREFRONT_PRODUCTS.filter((p) => {
        const q = query.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.materials.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
        );
      })
    : [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      onSearchSubmit(query.trim());
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-start">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Search Content Sheet */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative w-full bg-[#fbf9f6] border-b border-stone-200 shadow-2xl z-10 pt-6 pb-8 px-6 md:px-12"
          >
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header & Search Bar */}
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Busca por pieza, material (ej. Nogal, Bouclé) o estilo..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-white border border-stone-300 rounded-2xl pl-12 pr-12 py-3.5 text-sm md:text-base text-stone-900 placeholder:text-stone-400 shadow-sm focus:outline-none focus:border-stone-800 transition-all font-sans"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-xs text-stone-700 transition-colors"
                      title="Limpiar búsqueda"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="p-2.5 rounded-full hover:bg-stone-200/70 text-stone-600 hover:text-stone-900 transition-colors flex items-center justify-center cursor-pointer"
                  aria-label="Cerrar buscador"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Popular Tags & Searches (Casamia style) */}
              {!query.trim() && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                    <span>Búsquedas populares</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCH_TERMS.map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setQuery(term);
                          onSearchSubmit(term);
                          onClose();
                        }}
                        className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200/80 transition-colors cursor-pointer"
                      >
                        {term}
                      </button>
                    ))}
                  </div>

                  {/* Dynamic Tags */}
                  {tags.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 mb-2">
                        Categorías y Hashtags destacados
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => {
                              onSearchSubmit(t.name);
                              onClose();
                            }}
                            className="px-3 py-1 rounded-full text-xs font-medium text-stone-700 bg-white border border-stone-300/80 hover:border-stone-800 transition-colors cursor-pointer"
                          >
                            #{t.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Live Search Results */}
              {query.trim() && (
                <div className="space-y-3 pt-2 max-h-[50vh] overflow-y-auto pr-1 admin-scrollbar">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>
                      {results.length} {results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'} para &ldquo;{query}&rdquo;
                    </span>
                    <button
                      onClick={() => {
                        onSearchSubmit(query);
                        onClose();
                      }}
                      className="text-stone-900 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Ver en catálogo <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {results.length === 0 ? (
                    <div className="py-8 text-center bg-white rounded-2xl border border-stone-200 p-6">
                      <p className="text-sm font-medium text-stone-700">No encontramos piezas que coincidan con &ldquo;{query}&rdquo;</p>
                      <p className="text-xs text-stone-400 mt-1">Prueba buscando por categoría como &ldquo;Sofá&rdquo;, &ldquo;Comedor&rdquo; o material como &ldquo;Nogal&rdquo;</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {results.slice(0, 6).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            onSelectProduct(item);
                            onClose();
                          }}
                          className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-stone-200 hover:border-stone-400 hover:shadow-md transition-all cursor-pointer group"
                        >
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-stone-900 truncate">{item.name}</p>
                            <p className="text-[11px] text-stone-500 truncate">{item.category}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-extrabold text-stone-900">RD$ {item.price.toLocaleString()}</span>
                              {item.discountPct && (
                                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                  {item.discountPct}% OFF
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
