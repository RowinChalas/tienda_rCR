// src/modules/storefront/components/LookbookViewer.tsx
// Escena editorial de habitación con hotspot dots interactivos
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import type { StorefrontProduct } from '../data/storefrontData';
import { LOOKBOOK_HOTSPOTS, STOREFRONT_PRODUCTS } from '../data/storefrontData';

interface LookbookViewerProps {
  onProductSelect: (product: StorefrontProduct) => void;
}

export const LookbookViewer: React.FC<LookbookViewerProps> = ({ onProductSelect }) => {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const getProduct = (productId: string) =>
    STOREFRONT_PRODUCTS.find(p => p.id === productId);

  const toggleHotspot = (id: string) =>
    setActiveHotspot(prev => (prev === id ? null : id));

  return (
    <section className="relative w-full overflow-hidden rounded-sm" style={{ background: 'var(--sf-stone)' }}>
      {/* Room scene image */}
      <img
        src="/images/lookbook/sala-full.jpg"
        alt="Escena de sala BarverSuit — haz clic en los puntos para ver los productos"
        className="w-full object-cover"
        style={{ maxHeight: '70vh' }}
      />

      {/* Hotspot dots */}
      {LOOKBOOK_HOTSPOTS.map((hs) => {
        const product = getProduct(hs.productId);
        const isActive = activeHotspot === hs.id;
        if (!product) return null;

        return (
          <div
            key={hs.id}
            className="absolute"
            style={{ left: `${hs.x}%`, top: `${hs.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            {/* Pulse ring */}
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleHotspot(hs.id)}
                className="sf-hotspot relative w-9 h-9 rounded-full flex items-center justify-center z-10"
                style={{
                  background: isActive ? 'var(--sf-charcoal)' : 'rgba(255,255,255,0.92)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
                  backdropFilter: 'blur(8px)',
                }}
                aria-label={`Ver producto: ${product.name}`}
                aria-expanded={isActive}
              >
                {isActive
                  ? <X className="w-4 h-4 text-white" />
                  : <Plus className="w-4 h-4" style={{ color: 'var(--sf-charcoal)' }} />
                }
              </motion.button>

              {/* Product tooltip card */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 8 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    className="absolute z-20 w-56"
                    style={{
                      bottom: '120%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <div
                      className="rounded-sm overflow-hidden"
                      style={{
                        background: 'white',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
                      }}
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-28 object-cover"
                        style={{ background: 'var(--sf-stone)' }}
                      />
                      <div className="p-3">
                        <p className="sf-label mb-0.5" style={{ fontSize: '9px', color: 'var(--sf-charcoal-35)' }}>
                          {product.brand}
                        </p>
                        <h4
                          className="text-xs font-medium mb-1 leading-tight"
                          style={{ color: 'var(--sf-charcoal)', fontFamily: 'var(--font-ui)' }}
                        >
                          {product.name}
                        </h4>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold" style={{ color: 'var(--sf-charcoal)' }}>
                            {product.priceFormatted}
                          </span>
                          <button
                            onClick={() => onProductSelect(product)}
                            className="text-[10px] font-medium px-2 py-1 rounded-sm transition-colors"
                            style={{
                              background: 'var(--sf-charcoal)',
                              color: 'white',
                              fontFamily: 'var(--font-ui)',
                              letterSpacing: '0.03em',
                            }}
                          >
                            Ver →
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Arrow */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
                      style={{ background: 'white', bottom: -4 }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}

      {/* Bottom caption */}
      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/30 to-transparent">
        <p className="text-white text-xs font-medium" style={{ letterSpacing: '0.05em' }}>
          Haz clic en los • puntos para explorar cada pieza
        </p>
      </div>
    </section>
  );
};
