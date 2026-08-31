// src/modules/storefront/components/ProductCard.tsx
// Tarjeta editorial minimalista — estilo guud.com/casamia
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowUpRight, ShoppingBag } from 'lucide-react';
import type { StorefrontProduct } from '../data/storefrontData';
import { useCart } from '../../../context/CartContext';

interface ProductCardProps {
  product: StorefrontProduct;
  index: number;
  onSelect: (product: StorefrontProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index, onSelect }) => {
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const { addItem } = useCart();

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
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
          {product.discountPct && (
            <span className="sf-label bg-red-600 text-white px-2 py-0.5 rounded-sm text-[10px] font-bold tracking-wider shadow-sm">
              {product.discountPct}% OFF
            </span>
          )}
          {product.logisticStatus === 'disponible_ya' && (
            <span className="sf-label bg-emerald-700 text-white px-2 py-0.5 rounded-sm text-[9px] font-bold tracking-wider shadow-sm">
              ✦ Envío Inmediato
            </span>
          )}
          {product.logisticStatus === 'jit' && (
            <span className="sf-label bg-amber-800 text-white px-2 py-0.5 rounded-sm text-[9px] font-bold tracking-wider shadow-sm">
              ⚡ JIT (24-48h)
            </span>
          )}
          {product.logisticStatus === 'bajo_pedido' && (
            <span className="sf-label bg-purple-950 text-white px-2 py-0.5 rounded-sm text-[9px] font-bold tracking-wider shadow-sm">
              ⏱ Fabricación a Medida
            </span>
          )}
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
        </div>

        {/* Wishlist and Quick Cart buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            aria-label={isWishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            className="w-8 h-8 flex items-center justify-center bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isWishlisted ? 'fill-[var(--sf-madera)] stroke-[var(--sf-madera)]' : 'stroke-[var(--sf-charcoal)]'
              }`}
            />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addItem(product, 1);
            }}
            title="Añadir a la bolsa"
            className="w-8 h-8 flex items-center justify-center bg-white text-[var(--sf-charcoal)] hover:bg-[var(--sf-charcoal)] hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick view overlay — appears on hover */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-black/50 to-transparent flex items-center justify-between">
          <span className="flex items-center gap-1 text-white text-xs font-medium">
            Ver detalle <ArrowUpRight className="w-3 h-3" />
          </span>
          <span className="text-[10px] text-white/90 font-medium">
            + Añadir
          </span>
        </div>
      </div>

      {/* Card Info — minimal, left-aligned */}
      <div className="pt-3 pb-1">
        <p className="sf-label mb-1" style={{ color: 'var(--sf-charcoal-35)' }}>
          {product.brand}
        </p>
        <h3
          className="text-[var(--sf-charcoal)] text-sm font-medium leading-tight mb-1.5 group-hover:text-[var(--sf-madera)] transition-colors duration-200 truncate"
          style={{ fontFamily: 'var(--font-ui)' }}
        >
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2">
          {product.discountPct && product.originalPriceFormatted && (
            <span className="text-red-600 font-bold text-xs">
              {product.discountPct}%
            </span>
          )}
          <span className="text-[var(--sf-charcoal)] text-sm font-semibold" style={{ fontFamily: 'var(--font-ui)' }}>
            {product.priceFormatted}
          </span>
          {product.originalPriceFormatted && (
            <span className="text-slate-400 text-xs line-through">
              {product.originalPriceFormatted}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
};
