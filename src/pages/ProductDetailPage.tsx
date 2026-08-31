// src/pages/ProductDetailPage.tsx
// Vista de detalle de producto con 3D viewer, galería, info, reserva y venta cruzada
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle, Package, Truck, ShieldCheck, ChevronDown, Sparkles } from 'lucide-react';
import { Product3DViewer } from '../modules/storefront/components/Product3DViewer';
import { ReservationCheckoutModal } from '../modules/storefront/components/ReservationCheckoutModal';
import { CrossSellRecommender } from '../domain/catalog/CrossSellRecommender';
import { STOREFRONT_PRODUCTS, type StorefrontProduct } from '../modules/storefront/data/storefrontData';

interface ProductDetailPageProps {
  product: StorefrontProduct;
  onBack: () => void;
  onSelectProduct?: (product: StorefrontProduct) => void;
}

const FEATURES = [
  { icon: Package,      label: 'Producción bajo demanda', desc: 'Fabricado al recibir tu pedido' },
  { icon: Truck,        label: 'Entrega 3–5 semanas',     desc: 'Desde el taller directo a tu hogar' },
  { icon: ShieldCheck,  label: 'Garantía de taller 2 años', desc: 'Defectos de fabricación cubiertos' },
];

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onBack, onSelectProduct }) => {
  const [openAccordion, setOpenAccordion] = useState<string | null>('descripcion');
  const [isReservationOpen, setIsReservationOpen] = useState(false);

  const crossSells = useMemo(() => {
    return CrossSellRecommender.getComplementaryCrossSell(product, STOREFRONT_PRODUCTS, 3);
  }, [product]);

  const whatsappMsg = encodeURIComponent(
    `Hola, me interesa el producto *${product.name}* (${product.priceFormatted}). ¿Podría recibir más información?`
  );

  const accordionSections = [
    {
      id: 'descripcion',
      title: 'Descripción',
      content: product.description,
    },
    {
      id: 'materiales',
      title: 'Materiales',
      content: product.materials,
    },
    {
      id: 'dimensiones',
      title: 'Dimensiones',
      content: `Ancho: ${product.dimensions.width} cm — Alto: ${product.dimensions.height} cm — Profundidad: ${product.dimensions.depth} cm`,
    },
  ];

  return (
    <div className="sf-root min-h-screen" style={{ background: 'var(--sf-bg)' }}>
      {/* Breadcrumb + back */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm transition-colors hover:text-[var(--sf-madera)]"
          style={{ color: 'var(--sf-charcoal-60)', fontFamily: 'var(--font-ui)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al catálogo
        </button>
      </div>

      {/* Main content grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

        {/* LEFT — 3D Viewer */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 26 }}
        >
          <Product3DViewer images={product.images} productName={product.name} />

          {/* Ambient scene thumbnail */}
          {product.ambientImage && (
            <div className="mt-4">
              <p className="sf-label mb-2">Ver en ambiente</p>
              <div className="overflow-hidden rounded-sm" style={{ aspectRatio: '16/9' }}>
                <img
                  src={product.ambientImage}
                  alt={`${product.name} en ambiente`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* RIGHT — Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 26, delay: 0.08 }}
          className="flex flex-col"
        >
          {/* Brand + badges */}
          <div className="flex items-center gap-2.5 mb-3 flex-wrap">
            <p className="sf-label">{product.brand}</p>
            {product.logisticStatus === 'disponible_ya' && (
              <span className="sf-label bg-emerald-700 text-white px-2 py-0.5 rounded-sm text-[10px] font-bold">
                ✦ Envío Inmediato
              </span>
            )}
            {product.logisticStatus === 'jit' && (
              <span className="sf-label bg-amber-800 text-white px-2 py-0.5 rounded-sm text-[10px] font-bold">
                ⚡ Despacho en 24-48h (JIT)
              </span>
            )}
            {product.logisticStatus === 'bajo_pedido' && (
              <span className="sf-label bg-purple-950 text-white px-2 py-0.5 rounded-sm text-[10px] font-bold">
                ⏱ Fabricación en 15 días
              </span>
            )}
            {product.isNew && (
              <span
                className="sf-label px-2 py-0.5 rounded-sm"
                style={{ background: 'var(--sf-charcoal)', color: 'white', fontSize: '10px' }}
              >
                Nuevo
              </span>
            )}
            {product.isBestseller && (
              <span
                className="sf-label px-2 py-0.5 rounded-sm"
                style={{ background: 'var(--sf-madera)', color: 'white', fontSize: '10px' }}
              >
                Favorito
              </span>
            )}
          </div>

          {/* Product name — large editorial serif */}
          <h1
            className="mb-2"
            style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'var(--sf-charcoal)',
            }}
          >
            {product.name}
          </h1>

          {/* Category */}
          <p className="sf-label mb-4" style={{ textTransform: 'capitalize' }}>
            {product.category}
          </p>

          {/* Logistical promise card */}
          <div className="p-3 mb-6 rounded border bg-slate-50/70 border-slate-200/80 text-xs flex items-center gap-2.5">
            <span className="text-base">📦</span>
            <div>
              <p className="font-semibold text-slate-800">
                {product.logisticStatus === 'disponible_ya' && 'Disponibilidad Inmediata en Almacén'}
                {product.logisticStatus === 'jit' && 'Producción Just-in-Time (Orquestación Directa de Taller)'}
                {product.logisticStatus === 'bajo_pedido' && 'Pieza Artesanal Fabricada a Medida'}
                {!product.logisticStatus && 'Despacho Rápido Just-in-Time'}
              </p>
              <p className="text-[11px] text-slate-500">
                {product.estimatedFulfillmentText || 'Garantía de calidad BarverSuit y entrega coordinada.'}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="mb-8 pb-8" style={{ borderBottom: '1px solid var(--sf-stone)' }}>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '1.75rem',
                fontWeight: 400,
                color: 'var(--sf-charcoal)',
                letterSpacing: '-0.01em',
              }}
            >
              {product.priceFormatted}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--sf-charcoal-35)', fontFamily: 'var(--font-ui)' }}>
              Precio en pesos dominicanos • Depósito flexible de seguridad disponible
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <a
              href={`https://wa.me/18094000000?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="sf-btn-primary flex-1 justify-center"
            >
              <MessageCircle className="w-4 h-4" />
              Consultar por WhatsApp
            </a>
            <button
              onClick={() => setIsReservationOpen(true)}
              className="sf-btn-secondary flex-1 justify-center"
            >
              Reservar pieza
            </button>
          </div>

          {/* Feature bullets */}
          <div className="flex flex-col gap-4 mb-8">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--sf-madera-pale)' }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: 'var(--sf-madera)' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--sf-charcoal)', fontFamily: 'var(--font-ui)' }}>{label}</p>
                  <p className="text-xs" style={{ color: 'var(--sf-charcoal-60)', fontFamily: 'var(--font-ui)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Accordion — specs */}
          <div className="flex flex-col" style={{ borderTop: '1px solid var(--sf-stone)' }}>
            {accordionSections.map((section) => {
              const isOpen = openAccordion === section.id;
              return (
                <div key={section.id} style={{ borderBottom: '1px solid var(--sf-stone)' }}>
                  <button
                    onClick={() => setOpenAccordion(isOpen ? null : section.id)}
                    className="w-full flex items-center justify-between py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--sf-charcoal)', fontFamily: 'var(--font-ui)' }}
                    >
                      {section.title}
                    </span>
                    <ChevronDown
                      className="w-4 h-4 transition-transform duration-300"
                      style={{
                        color: 'var(--sf-charcoal-60)',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  </button>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p
                        className="text-sm pb-4 leading-relaxed"
                        style={{ color: 'var(--sf-charcoal-60)', fontFamily: 'var(--font-ui)' }}
                      >
                        {section.content}
                      </p>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Cross-Sell & Complementary Pieces Section (US-12 / EARS-N-04) */}
      {crossSells.length > 0 && (
        <section className="border-t py-16 px-6 md:px-12" style={{ borderColor: 'var(--sf-stone)', background: 'var(--sf-bg-alt)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" style={{ color: 'var(--sf-madera)' }} />
              <p className="sf-label">Completa tu espacio</p>
            </div>
            <h2
              className="mb-8"
              style={{
                fontFamily: 'var(--font-editorial)',
                fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                fontWeight: 400,
                color: 'var(--sf-charcoal)',
              }}
            >
              Piezas complementarias recomendadas
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {crossSells.map((cs) => (
                <div
                  key={cs.id}
                  onClick={() => onSelectProduct && onSelectProduct(cs)}
                  className="rounded-lg border p-4 cursor-pointer hover:shadow-md transition-all group"
                  style={{ background: 'var(--sf-bg)', borderColor: 'var(--sf-stone)' }}
                >
                  <div className="aspect-square rounded overflow-hidden mb-3 bg-stone-100">
                    <img
                      src={cs.images[0]}
                      alt={cs.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--sf-madera)' }}>
                    {cs.category}
                  </p>
                  <h3 className="text-sm font-semibold truncate mt-0.5" style={{ color: 'var(--sf-charcoal)' }}>
                    {cs.name}
                  </h3>
                  <p className="text-xs font-mono font-bold mt-1" style={{ color: 'var(--sf-charcoal)' }}>
                    {cs.priceFormatted}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Modal de Reserva con Soft Lock (EARS-E-01 / UC-01) */}
      <ReservationCheckoutModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        product={product}
      />
    </div>
  );
};
