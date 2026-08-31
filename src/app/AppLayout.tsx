import React, { useState } from 'react';
import { CatalogKanbanView } from '../modules/admin/catalog/CatalogKanbanView';
import { PricingSimulatorView } from '../modules/admin/pricing/PricingSimulatorView';
import { CrmOmnichannelView } from '../modules/admin/crm/CrmOmnichannelView';
import { OrdersManagementView } from '../modules/admin/orders/OrdersManagementView';
import { AnalyticsDashboardView } from '../modules/admin/analytics/AnalyticsDashboardView';
import { CmsManagerView } from '../modules/admin/cms/CmsManagerView';
import { TagsManagerView } from '../modules/admin/tags/TagsManagerView';
import { SupplierPortalView } from '../modules/supplier/SupplierPortalView';
import { ProductCreateModal } from '../modules/admin/products/ProductCreateModal';
import { LoginModal } from '../modules/auth/LoginModal';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Calculator,
  MessageSquare,
  Package,
  TrendingUp,
  ShoppingBag,
  Palette,
  Tag as TagIcon,
  Plus,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type AdminTab = 'catalog' | 'pricing' | 'crm' | 'orders' | 'analytics' | 'cms' | 'tags';
export type AdminTheme = 'aurex' | 'helios';

interface AppLayoutProps {
  onGoStorefront?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ onGoStorefront }) => {
  const { user, logout, openLoginModal } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('catalog');
  const [adminTheme, setAdminTheme] = useState<AdminTheme>('aurex');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; isPrimaryPill?: boolean }[] = [
    { id: 'catalog', label: 'Catálogo & Ingesta', icon: <Layers className="w-4 h-4" />, isPrimaryPill: true },
    { id: 'pricing', label: 'Motor Precios', icon: <Calculator className="w-4 h-4" /> },
    { id: 'crm', label: 'CRM Omnicanal', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'orders', label: 'Órdenes', icon: <Package className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analítica', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'cms', label: 'CMS & Tienda', icon: <Palette className="w-4 h-4" /> },
    { id: 'tags', label: 'Tags & Categorías', icon: <TagIcon className="w-4 h-4" /> },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-500 admin-theme-${adminTheme}`}
      style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text-primary)' }}
    >
      {/* ─── Top Floating Capsule Navigation Header (Estilo Finnova @[Requerimientos/1000012478.webp]) ─── */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b px-4 md:px-8 py-3"
        style={{
          backgroundColor: 'var(--admin-bg)',
          borderColor: 'var(--admin-border)',
          opacity: 0.98,
        }}
      >
        <div className="w-full flex items-center justify-between gap-3">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center font-extrabold font-editorial text-lg rounded-2xl shadow-lg"
              style={{
                backgroundColor: 'var(--admin-accent)',
                color: 'white',
              }}
            >
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold font-editorial tracking-tight text-base" style={{ color: 'var(--admin-text-primary)' }}>
                  BarverSuit
                </span>
                <span
                  className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border shadow-sm"
                  style={{
                    backgroundColor: 'var(--admin-badge-bg)',
                    color: 'var(--admin-badge-text)',
                    borderColor: 'var(--admin-border)',
                  }}
                >
                  Retail Hub JIT
                </span>
              </div>
              <p className="text-[10px]" style={{ color: 'var(--admin-text-secondary)' }}>
                {user?.role === 'supplier' ? 'Portal de Proveedores & Talleres' : 'Panel de Control Principal'}
              </p>
            </div>
          </div>

          {/* Finnova Style Floating Dark Capsule Navigation */}
          {user?.role !== 'supplier' && (
            <nav
              className="hidden lg:flex items-center gap-1 p-1.5 rounded-full border shadow-2xl"
              style={{
                backgroundColor: '#0f172a',
                borderColor: 'rgba(255, 255, 255, 0.12)',
              }}
            >
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all select-none rounded-full cursor-pointer ${
                      isActive
                        ? 'text-white font-bold shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="finnovaActivePill"
                        className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 shadow-glow"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      />
                    )}
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Actions & Utilities */}
          <div className="flex items-center gap-2.5">
            {/* Quick Action: + Crear Producto */}
            {user?.role !== 'supplier' && (
              <button
                onClick={() => setIsProductModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white transition-all shadow-md active:scale-95 cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Producto</span>
              </button>
            )}

            {/* Link to Storefront */}
            {onGoStorefront && (
              <button
                onClick={onGoStorefront}
                title="Ver Tienda Pública"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:border-slate-500 cursor-pointer"
                style={{
                  backgroundColor: 'var(--admin-card)',
                  borderColor: 'var(--admin-border)',
                  color: 'var(--admin-text-secondary)',
                }}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Tienda</span>
              </button>
            )}

            {/* Theme Switcher */}
            <div
              className="hidden xl:flex items-center p-1 rounded-full border"
              style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}
            >
              <button
                onClick={() => setAdminTheme('aurex')}
                className={`p-1.5 rounded-full transition-all ${adminTheme === 'aurex' ? 'bg-amber-400/20 text-amber-300' : 'text-slate-400'}`}
                title="Tema Aurex"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setAdminTheme('helios')}
                className={`p-1.5 rounded-full transition-all ${adminTheme === 'helios' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400'}`}
                title="Tema Helios"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* User Profile / Logout */}
            {user ? (
              <div
                className="flex items-center gap-2 p-1.5 rounded-full border"
                style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}
              >
                <div className="w-7 h-7 rounded-full overflow-hidden border border-white/20">
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-bold hidden lg:inline max-w-28 truncate" style={{ color: 'var(--admin-text-primary)' }}>
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="p-1 rounded-full text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openLoginModal('admin')}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-brand-500 text-white hover:bg-brand-600 transition-colors cursor-pointer"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        {user?.role !== 'supplier' && (
          <div className="lg:hidden flex items-center gap-1 pt-2 overflow-x-auto scrollbar-none">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  activeTab === item.id ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                style={{
                  backgroundColor: activeTab === item.id ? 'var(--admin-accent)' : 'var(--admin-card)',
                  border: '1px solid var(--admin-border)',
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ─── Main Content Viewport (100% Fluid Width) ───────────────── */}
      <main className="flex-1 w-full px-4 md:px-8 py-6">
        <AnimatePresence mode="wait">
          {user?.role === 'supplier' ? (
            <motion.div
              key="supplier-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <SupplierPortalView />
            </motion.div>
          ) : (
            <motion.div
              key={`admin-${activeTab}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'catalog' && <CatalogKanbanView />}
              {activeTab === 'pricing' && <PricingSimulatorView />}
              {activeTab === 'crm' && <CrmOmnichannelView />}
              {activeTab === 'orders' && <OrdersManagementView />}
              {activeTab === 'analytics' && <AnalyticsDashboardView />}
              {activeTab === 'cms' && <CmsManagerView />}
              {activeTab === 'tags' && <TagsManagerView />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Manual Product Creation Modal */}
      <ProductCreateModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onProductCreated={() => {
          setActiveTab('catalog');
        }}
      />

      {/* Authentication Login Modal */}
      <LoginModal />

      {/* Footer */}
      <footer
        className="border-t py-4 px-4 md:px-8 text-xs"
        style={{
          borderColor: 'var(--admin-border)',
          backgroundColor: 'var(--admin-card)',
          color: 'var(--admin-text-secondary)',
        }}
      >
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>BarverSuit Hub de Retail &ldquo;Just-in-Time&rdquo; &amp; Admin Omnicanal v2.2 (Finnova Inspired)</p>
          <div className="flex items-center gap-2 text-[11px] font-mono" style={{ color: 'var(--admin-text-secondary)' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>ai-dev-standard Compliant (EARS / SoC / AAA Vitest)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
