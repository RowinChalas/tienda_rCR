// src/modules/storefront/components/LookbookViewer.tsx
// Módulo "Explorador de Espacios" (Shoppable Images) multi-ambiente con coordenadas relativas (X%, Y%)
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, ShoppingBag } from 'lucide-react';
import type { StorefrontProduct } from '../data/storefrontData';
import { STOREFRONT_PRODUCTS } from '../data/storefrontData';
import { usePlatform } from '../../../context/PlatformContext';
import { useCart } from '../../../context/CartContext';

interface LookbookViewerProps {
  onProductSelect: (product: StorefrontProduct) => void;
}

export const LookbookViewer: React.FC<LookbookViewerProps> = ({ onProductSelect }) => {
  const { cms } = usePlatform();
  const { addItem } = useCart();
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

        {/* Hotspot dots con Puntos Blancos Circulares Minimalistas (Ref: image copy 3.png) */}
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
              <div className="relative flex items-center justify-center">
                {/* Minimal White Circular Dot with Soft Glow */}
                <motion.button
                  whileHover={{ scale: 1.25 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => toggleHotspot(hs.id)}
                  className="relative w-4 h-4 rounded-full bg-white shadow-xl cursor-pointer flex items-center justify-center transition-all duration-200"
                  style={{
                    boxShadow: isActive
                      ? '0 0 0 6px rgba(255, 255, 255, 0.4), 0 4px 15px rgba(0, 0, 0, 0.35)'
                      : '0 0 0 3px rgba(255, 255, 255, 0.35), 0 2px 10px rgba(0, 0, 0, 0.25)',
                  }}
                  aria-label={`Ver producto: ${product.name}`}
                  aria-expanded={isActive}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-800 opacity-60" />
                </motion.button>

                {/* Subtle outer breathing ring */}
                {!isActive && (
                  <span className="absolute inset-0 -m-1.5 rounded-full bg-white/30 animate-ping pointer-events-none" />
                )}

                {/* Product Tooltip Card */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: 8 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      className="absolute z-40 w-64"
                      style={{
                        bottom: hs.y > 60 ? '135%' : 'auto',
                        top: hs.y > 60 ? 'auto' : '135%',
                        left: hs.x > 70 ? 'auto' : hs.x < 30 ? '0%' : '50%',
                        right: hs.x > 70 ? '0%' : 'auto',
                        transform: hs.x >= 30 && hs.x <= 70 ? 'translateX(-50%)' : 'none',
                      }}
                    >
                      <div
                        className="rounded-sm overflow-hidden border"
                        style={{
                          background: 'white',
                          borderColor: 'var(--sf-stone)',
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

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 gap-2">
                            <span className="text-xs font-bold" style={{ color: 'var(--sf-charcoal)' }}>
                              {product.priceFormatted}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addItem(product, 1);
                                }}
                                title="Añadir a la bolsa"
                                className="p-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onProductSelect(product)}
                                className="text-[10px] font-medium px-2 py-1 rounded-sm transition-colors cursor-pointer text-white"
                                style={{
                                  background: 'var(--sf-charcoal)',
                                  fontFamily: 'var(--font-ui)',
                                  letterSpacing: '0.03em',
                                }}
                              >
                                Ver →
                              </button>
                            </div>
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
