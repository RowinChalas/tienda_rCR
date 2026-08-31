// src/pages/StorefrontLayout.tsx
// Layout público de la tienda: navbar editorial blanca + footer + routing interno
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, User, Menu, X, ChevronRight, Settings } from 'lucide-react';
import { LandingPage } from './LandingPage';
import { CatalogPage } from './CatalogPage';
import { ProductDetailPage } from './ProductDetailPage';
import type { StorefrontProduct } from '../modules/storefront/data/storefrontData';

import { usePlatform } from '../context/PlatformContext';
import { useCart } from '../context/CartContext';
import { CartDrawer } from '../modules/storefront/components/CartDrawer';
import { ReservationCheckoutModal } from '../modules/storefront/components/ReservationCheckoutModal';
import { STOREFRONT_PRODUCTS } from '../modules/storefront/data/storefrontData';

type StorefrontView = 'landing' | 'catalog' | 'product';

interface StorefrontLayoutProps {
  onGoAdmin: () => void;
}

export const StorefrontLayout: React.FC<StorefrontLayoutProps> = ({ onGoAdmin }) => {
  const { settings, cms } = usePlatform();
  const { itemCount, openCart, toastMessage, items } = useCart();
  const [view, setView] = useState<StorefrontView>('landing');
  const [selectedProduct, setSelectedProduct] = useState<StorefrontProduct | null>(null);
  const [catalogCategory, setCatalogCategory] = useState<string>('all');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartCheckoutOpen, setIsCartCheckoutOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateCatalog = (category?: string) => {
    setCatalogCategory(category || 'all');
    setView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectProduct = (product: StorefrontProduct) => {
    setSelectedProduct(product);
    setView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setView('catalog');
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dinámico desde el CMS o fallback
  const activeNavMenus = cms.navMenus.filter((m) => m.isActive).sort((a, b) => a.order - b.order);

  const isHero = view === 'landing' && !isScrolled;

  return (
    <div className="sf-root min-h-screen" style={{ background: 'var(--sf-bg)' }}>
      {/* ─── Navbar ─────────────────────────────────────── */}
      <header
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{
          background: isHero ? 'transparent' : 'rgba(247,245,242,0.92)',
          backdropFilter: isHero ? 'none' : 'blur(20px)',
          WebkitBackdropFilter: isHero ? 'none' : 'blur(20px)',
          borderBottom: isHero ? 'none' : '1px solid var(--sf-stone)',
        }}
      >
        <nav className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center gap-6">
          {/* Logo / Company Name */}
          <button
            onClick={() => { setView('landing'); window.scrollTo({ top: 0 }); }}
            className="flex-shrink-0 mr-4"
            aria-label={`${settings.companyName} — Ir al inicio`}
          >
            <span
              style={{
                fontFamily: 'var(--font-editorial)',
                fontSize: '1.25rem',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: isHero ? 'white' : 'var(--sf-charcoal)',
              }}
            >
              {settings.companyName}
            </span>
          </button>

          {/* Desktop nav links dinámicos desde el CMS */}
          <div className="hidden md:flex items-center gap-6 flex-1">
            {activeNavMenus.map((link) => (
              <button
                key={link.id}
                onClick={() => navigateCatalog(link.targetCategory)}
                className="text-xs font-medium transition-colors hover:opacity-70"
                style={{
                  color: isHero ? 'rgba(255,255,255,0.85)' : 'var(--sf-charcoal-60)',
                  fontFamily: 'var(--font-ui)',
                  letterSpacing: '0.02em',
                  background: 'none',
                  border: 'none',
                }}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3 ml-auto">
            <button
              aria-label="Buscar"
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
            >
              <Search className="w-4 h-4" style={{ color: isHero ? 'white' : 'var(--sf-charcoal)' }} />
            </button>

            <button
              onClick={openCart}
              aria-label={`Carrito (${itemCount} items)`}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors relative cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" style={{ color: isHero ? 'white' : 'var(--sf-charcoal)' }} />
              {itemCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center animate-scale-in"
                  style={{ background: 'var(--sf-charcoal)', color: 'white' }}
                >
                  {itemCount}
                </span>
              )}
            </button>

            <button
              aria-label="Mi cuenta"
              className="hidden md:flex w-8 h-8 items-center justify-center rounded-full hover:bg-black/5 transition-colors"
            >
              <User className="w-4 h-4" style={{ color: isHero ? 'white' : 'var(--sf-charcoal)' }} />
            </button>

            {/* Admin shortcut */}
            <button
              onClick={onGoAdmin}
              title="Panel de administración"
              className="hidden md:flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded border transition-colors"
              style={{
                color: isHero ? 'rgba(255,255,255,0.6)' : 'var(--sf-charcoal-35)',
                border: `1px solid ${isHero ? 'rgba(255,255,255,0.25)' : 'var(--sf-stone-strong)'}`,
                fontFamily: 'var(--font-ui)',
                letterSpacing: '0.05em',
                background: 'none',
              }}
            >
              <Settings className="w-3 h-3" />
              Admin
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(o => !o)}
              className="md:hidden w-8 h-8 flex items-center justify-center"
              aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {isMobileMenuOpen
                ? <X className="w-5 h-5" style={{ color: isHero ? 'white' : 'var(--sf-charcoal)' }} />
                : <Menu className="w-5 h-5" style={{ color: isHero ? 'white' : 'var(--sf-charcoal)' }} />
              }
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden md:hidden"
              style={{ background: 'var(--sf-surface)', borderBottom: '1px solid var(--sf-stone)' }}
            >
              <div className="px-6 py-4 flex flex-col gap-1">
                {activeNavMenus.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => { navigateCatalog(link.targetCategory); setIsMobileMenuOpen(false); }}
                    className="flex items-center justify-between py-3 text-sm font-medium"
                    style={{
                      color: 'var(--sf-charcoal)',
                      fontFamily: 'var(--font-ui)',
                      background: 'none',
                      border: 'none',
                      borderBottom: '1px solid var(--sf-stone)',
                    }}
                  >
                    {link.label}
                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--sf-charcoal-35)' }} />
                  </button>
                ))}
                <button
                  onClick={() => { onGoAdmin(); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-2 py-3 text-sm"
                  style={{ color: 'var(--sf-charcoal-35)', fontFamily: 'var(--font-ui)', background: 'none', border: 'none' }}
                >
                  <Settings className="w-4 h-4" /> Panel Admin
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── Main Content ────────────────────────────────── */}
      <main ref={mainRef}>
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LandingPage
                onNavigateCatalog={navigateCatalog}
                onProductSelect={selectProduct}
              />
            </motion.div>
          )}

          {view === 'catalog' && (
            <motion.div
              key="catalog"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="pt-16"
            >
              <CatalogPage
                onProductSelect={selectProduct}
                initialCategory={catalogCategory as 'all'}
              />
            </motion.div>
          )}

          {view === 'product' && selectedProduct && (
            <motion.div
              key={`product-${selectedProduct.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="pt-16"
            >
              <ProductDetailPage
                product={selectedProduct}
                onBack={goBack}
                onSelectProduct={selectProduct}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ─── Footer Dinámico ─────────────────────────────────────── */}
      <footer
        className="py-14 mt-0"
        style={{ background: 'var(--sf-bg-alt)', borderTop: '1px solid var(--sf-stone)' }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p
              className="mb-3"
              style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--sf-charcoal)' }}
            >
              {settings.companyName}
            </p>
            <p
              className="text-xs leading-relaxed mb-3"
              style={{ color: 'var(--sf-charcoal-60)', fontFamily: 'var(--font-ui)', maxWidth: 220 }}
            >
              {settings.footerText}
            </p>
            <p className="text-[11px]" style={{ color: 'var(--sf-charcoal-35)' }}>
              📍 {settings.physicalAddress}
            </p>
          </div>

          {[
            { heading: 'Colección', links: ['Sala', 'Comedor', 'Dormitorio', 'Oficina'] },
            { heading: 'Empresa',   links: ['Nuestra historia', 'Talleres', 'Sostenibilidad', 'Contacto'] },
            { heading: 'Atención',  links: [`WhatsApp: ${settings.contactWhatsapp}`, `Email: ${settings.contactEmail}`, 'FAQ', 'Envíos JIT'] },
          ].map(col => (
            <div key={col.heading}>
              <p className="sf-label mb-4">{col.heading}</p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map(link => (
                  <li key={link}>
                    <span
                      className="text-xs hover:text-[var(--sf-charcoal)] transition-colors text-left select-none cursor-pointer"
                      style={{ color: 'var(--sf-charcoal-60)', fontFamily: 'var(--font-ui)' }}
                    >
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="max-w-7xl mx-auto px-6 md:px-12 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: '1px solid var(--sf-stone)' }}
        >
          <p className="text-xs" style={{ color: 'var(--sf-charcoal-35)', fontFamily: 'var(--font-ui)' }}>
            {settings.copyrightText}
          </p>
          <p className="text-xs" style={{ color: 'var(--sf-charcoal-35)', fontFamily: 'var(--font-ui)' }}>
            {settings.slogan}
          </p>
        </div>
      </footer>

      {/* Cart Drawer Slide-over */}
      <CartDrawer onCheckout={() => setIsCartCheckoutOpen(true)} />

      {/* Checkout Soft Lock Modal for Cart */}
      {isCartCheckoutOpen && (
        <ReservationCheckoutModal
          product={
            items.length > 0
              ? STOREFRONT_PRODUCTS.find((p) => p.id === items[0].productId) || STOREFRONT_PRODUCTS[0]
              : STOREFRONT_PRODUCTS[0]
          }
          isOpen={isCartCheckoutOpen}
          onClose={() => setIsCartCheckoutOpen(false)}
        />
      )}

      {/* Dynamic Toast Feedback when adding to Cart */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded bg-[var(--sf-charcoal)] text-white shadow-2xl text-xs font-semibold flex items-center gap-2.5 border border-white/20"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
