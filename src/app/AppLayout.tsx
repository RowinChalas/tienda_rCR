import React, { useState } from 'react';
import { CatalogKanbanView } from '../modules/admin/catalog/CatalogKanbanView';
import { PricingSimulatorView } from '../modules/admin/pricing/PricingSimulatorView';
import { CrmOmnichannelView } from '../modules/admin/crm/CrmOmnichannelView';
import { OrdersManagementView } from '../modules/admin/orders/OrdersManagementView';
import { AnalyticsDashboardView } from '../modules/admin/analytics/AnalyticsDashboardView';
import { SupplierPortalView } from '../modules/supplier/SupplierPortalView';
import {
  Layers,
  Calculator,
  MessageSquare,
  Package,
  TrendingUp,
  Building,
  Shield,
  ShoppingBag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export type UserRole = 'admin' | 'supplier';
export type AdminTab = 'catalog' | 'pricing' | 'crm' | 'orders' | 'analytics';
export type AdminTheme = 'aurex' | 'helios';

interface AppLayoutProps {
  onGoStorefront?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ onGoStorefront }) => {
  const [role, setRole] = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState<AdminTab>('catalog');
  const [adminTheme, setAdminTheme] = useState<AdminTheme>('aurex');

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'catalog', label: 'Catálogo & Ingesta', icon: <Layers className="w-4 h-4" /> },
    { id: 'pricing', label: 'Motor de Precios', icon: <Calculator className="w-4 h-4" /> },
    { id: 'crm', label: 'CRM Omnicanal', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'orders', label: 'Órdenes & Despacho', icon: <Package className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analítica & KPIs', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-500 admin-theme-${adminTheme}`}
      style={{ backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text-primary)' }}
    >
      {/* Top Header Navigation */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-xl"
        style={{ backgroundColor: 'var(--admin-bg)', borderColor: 'var(--admin-border)', opacity: 0.95 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 flex items-center justify-center font-extrabold font-editorial text-lg"
              style={{
                backgroundColor: 'var(--admin-accent)',
                color: 'white',
                borderRadius: 'var(--admin-radius-xs)',
                boxShadow: 'var(--admin-shadow)',
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
                  className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded border"
                  style={{ backgroundColor: 'var(--admin-badge-bg)', color: 'var(--admin-badge-text)', borderColor: 'var(--admin-border)' }}
                >
                  Retail Hub JIT
                </span>
              </div>
              <p className="text-[10px]" style={{ color: 'var(--admin-text-secondary)' }}>Omnicanal & Orquestación IA</p>
            </div>
          </div>

          {/* Admin Tab Navigation */}
          {role === 'admin' && (
            <nav
              className="hidden md:flex items-center gap-1 p-1 border"
              style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)', borderRadius: 'var(--admin-radius-sm)' }}
            >
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="relative px-3 py-1.5 text-xs font-semibold flex items-center gap-2 transition-colors select-none"
                    style={{
                      color: isActive ? 'white' : 'var(--admin-text-secondary)',
                      borderRadius: 'var(--admin-radius-xs)',
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabBadge"
                        className="absolute inset-0 -z-10"
                        style={{
                          background: 'var(--admin-accent)',
                          borderRadius: 'var(--admin-radius-xs)',
                          boxShadow: 'var(--admin-shadow)',
                        }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Theme Switcher, Role Switcher + Store Link */}
          <div className="flex items-center gap-3">
            {/* Theme Switcher */}
            <div
              className="hidden lg:flex items-center p-1 border"
              style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)', borderRadius: '9999px' }}
            >
              <button
                onClick={() => setAdminTheme('aurex')}
                className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold rounded-full transition-all"
                style={{
                  background: adminTheme === 'aurex' ? 'var(--admin-text-primary)' : 'transparent',
                  color: adminTheme === 'aurex' ? 'var(--admin-bg)' : 'var(--admin-text-secondary)',
                }}
              >
                <Sun className="w-3 h-3" /> Aurex
              </button>
              <button
                onClick={() => setAdminTheme('helios')}
                className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold rounded-full transition-all"
                style={{
                  background: adminTheme === 'helios' ? 'var(--admin-accent)' : 'transparent',
                  color: adminTheme === 'helios' ? 'white' : 'var(--admin-text-secondary)',
                }}
              >
                <Moon className="w-3 h-3" /> Helios
              </button>
            </div>

            {/* Back to storefront */}
            {onGoStorefront && (
              <button
                onClick={onGoStorefront}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                style={{
                  color: 'var(--admin-text-secondary)',
                  borderColor: 'var(--admin-border)',
                }}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Tienda</span>
              </button>
            )}

            <div
              className="flex items-center p-1 border"
              style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)', borderRadius: 'var(--admin-radius-sm)' }}
            >
              <button
                onClick={() => setRole('admin')}
                className="px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-all"
                style={{
                  backgroundColor: role === 'admin' ? 'var(--admin-card-alt)' : 'transparent',
                  color: role === 'admin' ? 'var(--admin-text-primary)' : 'var(--admin-text-secondary)',
                  borderRadius: 'var(--admin-radius-xs)',
                  border: role === 'admin' ? '1px solid var(--admin-border)' : '1px solid transparent',
                }}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>

              <button
                onClick={() => setRole('supplier')}
                className="px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-all"
                style={{
                  backgroundColor: role === 'supplier' ? 'var(--admin-accent)' : 'transparent',
                  color: role === 'supplier' ? 'white' : 'var(--admin-text-secondary)',
                  borderRadius: 'var(--admin-radius-xs)',
                }}
              >
                <Building className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Proveedor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs for Admin */}
        {role === 'admin' && (
          <div
            className="md:hidden flex items-center gap-1 p-2 overflow-x-auto border-t"
            style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap"
                style={{
                  background: activeTab === item.id ? 'var(--admin-accent)' : 'var(--admin-card)',
                  color: activeTab === item.id ? 'white' : 'var(--admin-text-secondary)',
                  border: `1px solid var(--admin-border)`,
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {role === 'supplier' ? (
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
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer info & standards badge */}
      <footer className="border-t py-4 text-center text-xs" style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-card)', color: 'var(--admin-text-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>BarverSuit Hub de Retail &ldquo;Just-in-Time&rdquo; &amp; Admin Omnicanal v2.0 (Themed)</p>
          <div className="flex items-center gap-2 text-[11px] font-mono" style={{ color: 'var(--admin-text-secondary)' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>ai-dev-standard Compliant (EARS / SoC / AAA Vitest)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
