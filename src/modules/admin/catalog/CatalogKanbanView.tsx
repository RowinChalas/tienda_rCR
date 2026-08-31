import React, { useState, useEffect } from 'react';
import { Product } from '../../../domain/models/Product';
import { services } from '../../../services/ServiceContainer';
import { Button } from '../../../design-system/atoms/Button';
import { Badge } from '../../../design-system/atoms/Badge';
import { ImageProcessorModal } from './ImageProcessorModal';
import { PublicationChecklistModal } from './PublicationChecklistModal';
import { WhatsAppIngestSimulatorModal } from './WhatsAppIngestSimulatorModal';
import { PublicationChecklist } from '../../../domain/validation/PublicationChecklist';
import { ProductCreateModal } from '../products/ProductCreateModal';
import {
  Wand2,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  Plus,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const CatalogKanbanView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeImageProduct, setActiveImageProduct] = useState<Product | null>(null);
  const [activeChecklistProduct, setActiveChecklistProduct] = useState<Product | null>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isManualCreateOpen, setIsManualCreateOpen] = useState(false);

  const loadProducts = async () => {
    const list = await services.productRepo.getAll({
      search: searchTerm || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
    });
    setProducts(list);
  };

  useEffect(() => {
    loadProducts();
    const handleProductsChange = () => loadProducts();
    window.addEventListener('barversuit_products_changed', handleProductsChange);
    return () => window.removeEventListener('barversuit_products_changed', handleProductsChange);
  }, [searchTerm, selectedCategory]);

  const handleImageProcessed = async (
    productId: string,
    imageId: string,
    options: { crop1x1: boolean; removeBg: boolean },
  ) => {
    await services.productRepo.processImage(productId, imageId, options);
    const p = await services.productRepo.getById(productId);
    if (p && p.status === 'borrador') {
      await services.productRepo.markStatus(productId, 'revision');
    }
  };

  const handlePublish = async (productId: string) => {
    await services.productRepo.publish(productId);
    await loadProducts();
  };

  // Categorizar productos en columnas
  const rawDrafts = products.filter(
    (p) =>
      p.status === 'borrador' &&
      (!p.images.length || !p.images.some((img) => img.isBackgroundRemoved || img.isCropped1x1)),
  );

  const inEditingDrafts = products.filter(
    (p) =>
      (p.status === 'borrador' &&
        p.images.some((img) => img.isBackgroundRemoved || img.isCropped1x1)) ||
      (p.status === 'revision' && !PublicationChecklist.evaluate(p).isReadyToPublish),
  );

  const readyToPublish = products.filter(
    (p) =>
      (p.status === 'revision' || p.status === 'borrador') &&
      PublicationChecklist.evaluate(p).isReadyToPublish,
  );

  const publishedProducts = products.filter((p) => p.status === 'publicado');

  const columns = [
    {
      id: 'crudo',
      title: 'Ingesta Cruda',
      subtitle: 'Desde WhatsApp o Portal Proveedor',
      items: rawDrafts,
      icon: <Clock className="w-4 h-4 text-slate-400" />,
      colorClass: 'border-slate-500/30',
    },
    {
      id: 'edicion',
      title: 'En Edición & Curaduría',
      subtitle: 'Procesamiento de imagen & medidas',
      items: inEditingDrafts,
      icon: <Wand2 className="w-4 h-4 text-amber-400" />,
      colorClass: 'border-amber-500/30',
    },
    {
      id: 'listo',
      title: 'Listos para Publicar',
      subtitle: 'Checklist 100% verificado (RF-05)',
      items: readyToPublish,
      icon: <Sparkles className="w-4 h-4 text-brand-400" />,
      colorClass: 'border-brand-500/40',
    },
    {
      id: 'publicado',
      title: 'Catálogo Activo',
      subtitle: 'Disponible para Clientes & Agente IA',
      items: publishedProducts,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      colorClass: 'border-emerald-500/30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-editorial tracking-tight flex items-center gap-2.5" style={{ color: 'var(--admin-text-primary)' }}>
            Tablero de Ingesta & Curaduría de Catálogo
            <Badge variant="gold" size="sm">
              Épica A & B
            </Badge>
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--admin-text-secondary)' }}>
            Recepción Just-in-Time desde talleres, estandarización fotográfica con IA y checklist de publicación.
          </p>
        </div>

        {/* Filtros rápidos */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--admin-text-secondary)' }} />
            <input
              type="text"
              placeholder="Buscar mueble o taller..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none"
              style={{
                backgroundColor: 'var(--admin-card)',
                border: '1px solid var(--admin-border)',
                color: 'var(--admin-text-primary)',
                boxShadow: 'var(--admin-shadow)',
              }}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs rounded-xl px-3 py-2.5 focus:outline-none"
            style={{
              backgroundColor: 'var(--admin-card)',
              border: '1px solid var(--admin-border)',
              color: 'var(--admin-text-primary)',
              boxShadow: 'var(--admin-shadow)',
            }}
          >
            <option value="all">Todas las Categorías</option>
            <option value="Comedores">Comedores</option>
            <option value="Salas y Sofás">Salas y Sofás</option>
            <option value="Mesas de Centro">Mesas de Centro</option>
            <option value="Recámaras y Camas">Recámaras y Camas</option>
            <option value="Sillas y Sillones">Sillas y Sillones</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsManualCreateOpen(true)}
          >
            + Crear Producto Manual
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
            onClick={() => setIsWhatsAppModalOpen(true)}
            style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
          >
            Simular Ingesta WhatsApp (RF-01)
          </Button>
        </div>
      </div>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
        {columns.map((col) => (
          <div
            key={col.id}
            className={`rounded-2xl p-4 border flex flex-col min-h-[550px] ${col.colorClass}`}
            style={{
              backgroundColor: 'var(--admin-card)',
              boxShadow: 'var(--admin-shadow)',
              backdropFilter: 'var(--admin-backdrop)',
              WebkitBackdropFilter: 'var(--admin-backdrop)',
            }}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b mb-4" style={{ borderColor: 'var(--admin-border)' }}>
              <div className="flex items-center gap-2">
                {col.icon}
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--admin-text-primary)' }}>{col.title}</h3>
                  <p className="text-[10px]" style={{ color: 'var(--admin-text-secondary)' }}>{col.subtitle}</p>
                </div>
              </div>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--admin-badge-bg)', color: 'var(--admin-text-primary)' }}
              >
                {col.items.length}
              </span>
            </div>

            {/* Column Items */}
            <div className="space-y-3.5 flex-1">
              {col.items.length === 0 ? (
                <div
                  className="h-32 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed"
                  style={{ borderColor: 'var(--admin-border-strong)' }}
                >
                  <p className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>Sin artículos en esta etapa</p>
                </div>
              ) : (
                col.items.map((prod) => {
                  const evalResult = PublicationChecklist.evaluate(prod);
                  return (
                    <motion.div
                      key={prod.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl transition-all space-y-3 relative group"
                      style={{
                        backgroundColor: 'var(--admin-bg)',
                        border: '1px solid var(--admin-border)',
                      }}
                    >
                      {/* Thumbnail & Supplier Tag */}
                      <div className="flex gap-3">
                        <div
                          className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative border"
                          style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-card)' }}
                        >
                          {prod.images.length > 0 ? (
                            <img
                              src={prod.images[0].url}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px]" style={{ color: 'var(--admin-text-secondary)' }}>
                              Sin Foto
                            </div>
                          )}
                          {prod.images[0]?.isBackgroundRemoved && (
                            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-md border border-white/50" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-[10px] font-semibold text-brand-500 uppercase tracking-wider truncate">
                            {prod.category}
                          </p>
                          <h4 className="text-xs font-bold line-clamp-2 leading-tight" style={{ color: 'var(--admin-text-primary)' }}>
                            {prod.name}
                          </h4>
                          <p className="text-[11px] truncate" style={{ color: 'var(--admin-text-secondary)' }}>
                            Taller: {prod.supplierName || 'Proveedor'}
                          </p>
                        </div>
                      </div>

                      {/* Pricing Info */}
                      <div
                        className="p-2.5 rounded-lg space-y-1 text-[11px] border"
                        style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)' }}
                      >
                        <div className="flex items-center justify-between">
                          <span style={{ color: 'var(--admin-text-secondary)' }}>Costo Taller:</span>
                          <span className="font-mono font-semibold" style={{ color: 'var(--admin-text-primary)' }}>
                            ${prod.supplierCost?.baseCost.toLocaleString() || '0'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span style={{ color: 'var(--admin-text-primary)' }}>Precio Sugerido:</span>
                          <span className="font-mono text-brand-500 font-bold">
                            ${prod.suggestedPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] pt-1 mt-1 border-t" style={{ borderColor: 'var(--admin-border-strong)' }}>
                          <span style={{ color: 'var(--admin-text-secondary)' }}>Piso Suelo Protegido:</span>
                          <span className="font-mono text-red-500 font-medium">
                            ${prod.floorPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Clasificación Logística & Destacado */}
                      <div className="flex items-center justify-between gap-1.5 pt-1 text-[10px]">
                        <select
                          value={prod.logisticStatus || 'jit'}
                          onChange={async (e) => {
                            const newStatus = e.target.value as 'disponible_ya' | 'jit' | 'bajo_pedido';
                            await services.productRepo.update(prod.id, {
                              logisticStatus: newStatus,
                              estimatedFulfillmentText:
                                newStatus === 'disponible_ya'
                                  ? '✦ Envío Inmediato'
                                  : newStatus === 'jit'
                                  ? '⚡ Despacho en 24-48h (JIT)'
                                  : '⏱ Fabricación en 15 días',
                            });
                            await loadProducts();
                          }}
                          className="px-1.5 py-1 rounded text-[10px] font-semibold border"
                          style={{
                            backgroundColor: 'var(--admin-bg)',
                            borderColor: 'var(--admin-border)',
                            color:
                              prod.logisticStatus === 'disponible_ya'
                                ? '#10b981'
                                : prod.logisticStatus === 'bajo_pedido'
                                ? '#a855f7'
                                : '#f59e0b',
                          }}
                        >
                          <option value="disponible_ya">✦ Disponible ya (Inmediato)</option>
                          <option value="jit">⚡ Just in Time (24-48h)</option>
                          <option value="bajo_pedido">⏱ Requiere Tiempo (15 días)</option>
                        </select>

                        <button
                          onClick={async () => {
                            await services.productRepo.update(prod.id, {
                              isFeaturedWeekly: !prod.isFeaturedWeekly,
                            });
                            await loadProducts();
                          }}
                          title={prod.isFeaturedWeekly ? 'Quitar de Pieza de la Semana' : 'Marcar como Pieza de la Semana'}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                            prod.isFeaturedWeekly
                              ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                              : 'text-slate-400 border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          ★ {prod.isFeaturedWeekly ? 'Destacado' : 'Destacar'}
                        </button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-1 gap-2">
                        {col.id === 'crudo' && (
                          <Button
                            variant="secondary"
                            size="xs"
                            fullWidth
                            leftIcon={<Wand2 className="w-3.5 h-3.5" />}
                            onClick={() => setActiveImageProduct(prod)}
                            style={{ backgroundColor: 'var(--admin-badge-bg)', color: 'var(--admin-text-primary)', border: '1px solid var(--admin-border)' }}
                          >
                            Procesar Foto
                          </Button>
                        )}

                        {(col.id === 'edicion' || col.id === 'listo') && (
                          <Button
                            variant={evalResult.isReadyToPublish ? 'primary' : 'outline'}
                            size="xs"
                            fullWidth
                            leftIcon={
                              evalResult.isReadyToPublish ? (
                                <Sparkles className="w-3.5 h-3.5 text-white" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                              )
                            }
                            onClick={() => setActiveChecklistProduct(prod)}
                            style={evalResult.isReadyToPublish ? { background: 'var(--admin-accent)', color: 'white', border: 'none' } : { backgroundColor: 'var(--admin-badge-bg)', color: 'var(--admin-text-primary)', border: '1px solid var(--admin-border)' }}
                          >
                            {evalResult.isReadyToPublish
                              ? 'Publicar (100%)'
                              : `Checklist (${evalResult.progressPct}%)`}
                          </Button>
                        )}

                        {col.id === 'publicado' && (
                          <div className="w-full flex items-center justify-between text-xs font-semibold px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <span className="flex items-center gap-1.5 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> En Catálogo
                            </span>
                            <span className="text-[10px]" style={{ color: 'var(--admin-text-secondary)' }}>Stock: {prod.stockQuantity}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modales */}
      <ImageProcessorModal
        isOpen={Boolean(activeImageProduct)}
        onClose={() => setActiveImageProduct(null)}
        product={activeImageProduct}
        onImageProcessed={handleImageProcessed}
      />

      <PublicationChecklistModal
        isOpen={Boolean(activeChecklistProduct)}
        onClose={() => setActiveChecklistProduct(null)}
        product={activeChecklistProduct}
        onPublish={handlePublish}
        onOpenImageEditor={(p) => setActiveImageProduct(p)}
      />

      <WhatsAppIngestSimulatorModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        onProductCreated={loadProducts}
      />

      <ProductCreateModal
        isOpen={isManualCreateOpen}
        onClose={() => setIsManualCreateOpen(false)}
        onProductCreated={loadProducts}
      />
    </div>
  );
};
