// src/modules/storefront/components/LookbookViewer.tsx
// Módulo "Explorador de Espacios" (Shoppable Images) multi-ambiente con coordenadas relativas (X%, Y%)
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { StorefrontProduct } from '../data/storefrontData';
import { STOREFRONT_PRODUCTS } from '../data/storefrontData';
import { usePlatform } from '../../../context/PlatformContext';

interface LookbookViewerProps {
  onProductSelect: (product: StorefrontProduct) => void;
}

export const LookbookViewer: React.FC<LookbookViewerProps> = ({ onProductSelect }) => {
  const { cms } = usePlatform();
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const scenes = cms.spaceScenes.filter((s) => s.isActive);
  const currentScene = scenes[activeSceneIndex] || scenes[0];

  const getProduct = (productId: string): StorefrontProduct | undefined =>
    STOREFRONT_PRODUCTS.find((p) => p.id === productId);

  const toggleHotspot = (id: string) =>
    setActiveHotspot((prev) => (prev === id ? null : id));

  const handleNextScene = () => {
    setActiveHotspot(null);
    setActiveSceneIndex((prev) => (prev + 1) % scenes.length);
  };

  const handlePrevScene = () => {
    setActiveHotspot(null);
    setActiveSceneIndex((prev) => (prev - 1 + scenes.length) % scenes.length);
  };

  if (!currentScene) return null;

  return (
    <section className="relative w-full overflow-hidden rounded-sm select-none" style={{ background: 'var(--sf-stone)' }}>
      {/* Room scene image */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: '400px', maxHeight: '72vh' }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentScene.id}
            src={currentScene.imageUrl}
            alt={currentScene.title}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full h-full object-cover"
            style={{ maxHeight: '72vh', minHeight: '400px' }}
          />
        </AnimatePresence>

        {/* Hotspot dots con Coordenadas Relativas (X%, Y%) */}
        {currentScene.hotspots.map((hs) => {
          const product = getProduct(hs.productId);
          const isActive = activeHotspot === hs.id;
          if (!product) return null;

          return (
            <div
              key={hs.id}
              className="absolute"
              style={{
                left: `${hs.x}%`,
                top: `${hs.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isActive ? 30 : 20,
              }}
            >
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleHotspot(hs.id)}
                  className="sf-hotspot relative w-9 h-9 rounded-full flex items-center justify-center z-10 cursor-pointer"
                  style={{
                    background: isActive ? 'var(--sf-charcoal)' : 'rgba(255,255,255,0.95)',
                    boxShadow: '0 2px 14px rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(8px)',
                  }}
                  aria-label={`Ver producto: ${product.name}`}
                  aria-expanded={isActive}
                >
                  {isActive ? (
                    <X className="w-4 h-4 text-white" />
                  ) : (
                    <Plus className="w-4 h-4" style={{ color: 'var(--sf-charcoal)' }} />
                  )}
                </motion.button>

                {/* Pulse Ring when inactive */}
                {!isActive && (
                  <span className="absolute inset-0 rounded-full bg-white/40 animate-ping pointer-events-none" />
                )}

                {/* Product Tooltip Card (Responsivo con clamp visual) */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: 8 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      className="absolute z-40 w-64"
                      style={{
                        bottom: hs.y > 60 ? '125%' : 'auto',
                        top: hs.y > 60 ? 'auto' : '125%',
                        left: hs.x > 70 ? 'auto' : hs.x < 30 ? '0%' : '50%',
                        right: hs.x > 70 ? '0%' : 'auto',
                        transform: hs.x >= 30 && hs.x <= 70 ? 'translateX(-50%)' : 'none',
                      }}
                    >
                      <div
                        className="rounded-sm overflow-hidden"
                        style={{
                          background: 'white',
                          boxShadow: '0 12px 36px rgba(0,0,0,0.22)',
                        }}
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-32 object-cover"
                          style={{ background: 'var(--sf-stone)' }}
                        />
                        <div className="p-3.5 space-y-2">
                          <div className="flex items-center justify-between gap-1">
                            <p className="sf-label text-[9px]" style={{ color: 'var(--sf-charcoal-35)' }}>
                              {product.brand}
                            </p>
                            {product.logisticStatus === 'disponible_ya' && (
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                Envío Inmediato
                              </span>
                            )}
                            {product.logisticStatus === 'jit' && (
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                JIT 24-48h
                              </span>
                            )}
                            {product.logisticStatus === 'bajo_pedido' && (
                              <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                                Bajo Pedido
                              </span>
                            )}
                          </div>

                          <h4
                            className="text-xs font-semibold leading-tight line-clamp-2"
                            style={{ color: 'var(--sf-charcoal)', fontFamily: 'var(--font-ui)' }}
                          >
                            {product.name}
                          </h4>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <span className="text-xs font-bold" style={{ color: 'var(--sf-charcoal)' }}>
                              {product.priceFormatted}
                            </span>
                            <button
                              onClick={() => onProductSelect(product)}
                              className="text-[10px] font-medium px-2.5 py-1 rounded-sm transition-colors cursor-pointer"
                              style={{
                                background: 'var(--sf-charcoal)',
                                color: 'white',
                                fontFamily: 'var(--font-ui)',
                                letterSpacing: '0.03em',
                              }}
                            >
                              Ver pieza →
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}

        {/* Carousel Navigation Arrows if multiple scenes */}
        {scenes.length > 1 && (
          <>
            <button
              onClick={handlePrevScene}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg backdrop-blur-md transition-all z-20"
              aria-label="Ambiente anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextScene}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg backdrop-blur-md transition-all z-20"
              aria-label="Ambiente siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Bottom Scene Title & Instructions */}
      <div className="absolute bottom-0 inset-x-0 p-4 md:p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col sm:flex-row sm:items-end justify-between gap-2 text-white pointer-events-none">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Explorador de Espacios
          </span>
          <h3 className="text-base sm:text-lg font-bold font-editorial">{currentScene.title}</h3>
          <p className="text-xs text-white/80 max-w-lg">{currentScene.subtitle}</p>
        </div>

        <div className="text-right">
          <p className="text-[11px] font-medium text-white/90">
            Toca los puntos (+) para interactuar con cada mueble
          </p>
          {scenes.length > 1 && (
            <p className="text-[10px] text-white/60 font-mono">
              Ambiente {activeSceneIndex + 1} de {scenes.length}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
