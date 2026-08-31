// src/modules/storefront/components/ProductCard.tsx
// Tarjeta editorial minimalista — estilo guud.com/casamia
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowUpRight } from 'lucide-react';
import type { StorefrontProduct } from '../data/storefrontData';

interface ProductCardProps {
  product: StorefrontProduct;
  index: number;
  onSelect: (product: StorefrontProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index, onSelect }) => {
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28, delay: index * 0.06 }}
      className="sf-product-card group cursor-pointer"
      onClick={() => onSelect(product)}
    >
      {/* Image Container — aspect ratio 3:4 portrait like casamia */}
      <div className="relative overflow-hidden bg-[var(--sf-stone)] rounded-sm" style={{ aspectRatio: '3/4' }}>
        <img
          src={product.images[0]}
          alt={product.name}
          className="sf-product-img w-full h-full object-cover"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="sf-label bg-[var(--sf-charcoal)] text-white px-2 py-0.5 rounded-sm text-[10px]">
              Nuevo
            </span>
          )}
          {product.isBestseller && (
            <span className="sf-label bg-[var(--sf-madera)] text-white px-2 py-0.5 rounded-sm text-[10px]">
              Favorito
            </span>
          )}
          {!product.inStock && (
            <span className="sf-label bg-white text-[var(--sf-charcoal)] px-2 py-0.5 rounded-sm text-[10px]">
              Agotado
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsWishlisted(!isWishlisted); }}
          aria-label={isWishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${isWishlisted ? 'fill-[var(--sf-madera)] stroke-[var(--sf-madera)]' : 'stroke-[var(--sf-charcoal)]'}`}
          />
        </button>

        {/* Quick view overlay — appears on hover */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-black/40 to-transparent">
          <span className="flex items-center gap-1 text-white text-xs font-medium">
            Ver detalle <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Card Info — minimal, left-aligned */}
      <div className="pt-3 pb-1">
        <p className="sf-label mb-1" style={{ color: 'var(--sf-charcoal-35)' }}>
          {product.brand}
        </p>
        <h3
          className="text-[var(--sf-charcoal)] text-sm font-medium leading-tight mb-2 group-hover:text-[var(--sf-madera)] transition-colors duration-200"
          style={{ fontFamily: 'var(--font-ui)' }}
        >
          {product.name}
        </h3>
        <p className="text-[var(--sf-charcoal)] text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
          {product.priceFormatted}
        </p>
      </div>
    </motion.article>
  );
};
