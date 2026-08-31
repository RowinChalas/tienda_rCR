import React, { useState, useEffect } from 'react';
import { Product, Supplier } from '../../domain/models/Product';
import { Order } from '../../domain/models/Order';
import { services } from '../../services/ServiceContainer';
import { Button } from '../../design-system/atoms/Button';
import { Badge } from '../../design-system/atoms/Badge';
import { Input } from '../../design-system/atoms/Input';
import {
  UploadCloud,
  CheckCircle2,
  XCircle,
  Package,
  Clock,
  DollarSign,
  Building,
} from 'lucide-react';

export const SupplierPortalView: React.FC = () => {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Formulario de carga rápida de borrador (US-02)
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Salas y Sofás');
  const [formBaseCost, setFormBaseCost] = useState<number>(18000);
  const [formWidth, setFormWidth] = useState<number>(180);
  const [formHeight, setFormHeight] = useState<number>(85);
  const [formDepth, setFormDepth] = useState<number>(90);
  const [formDescription, setFormDescription] = useState('');
  // Multi-foto: mínimo 3 ángulos para activar animación 3D
  const [formPhotoUrls, setFormPhotoUrls] = useState<string[]>([
    '', '', ''
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const loadData = async () => {
    const sups = await services.supplierRepo.getAll();
    const currentSup = sups[1] || sups[0]; // Taller Mueblería Satélite Bella Vista
    setSupplier(currentSup);

    const prods = await services.productRepo.getAll({ supplierId: currentSup.id });
    setProducts(prods);

    const ords = await services.orderRepo.getAll({ supplierId: currentSup.id });
    setOrders(ords);
  };

  useEffect(() => {
    loadData();
    const handleChange = () => loadData();
    window.addEventListener('barversuit_products_changed', handleChange);
    window.addEventListener('barversuit_orders_changed', handleChange);
    return () => {
      window.removeEventListener('barversuit_products_changed', handleChange);
      window.removeEventListener('barversuit_orders_changed', handleChange);
    };
  }, []);

  const handleUploadProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier || !formName) return;

    setIsSubmitting(true);
    const validPhotos = formPhotoUrls.filter(u => u.trim() !== '');
    await services.productRepo.createDraft({
      supplierId: supplier.id,
      supplierName: supplier.businessName,
      name: formName,
      category: formCategory as any,
      status: 'borrador',
      suggestedPrice: Math.round(formBaseCost * 1.35),
      floorPrice: Math.round(formBaseCost * 1.18),
      dimensions: {
        widthCm: formWidth,
        heightCm: formHeight,
        depthCm: formDepth,
      },
      images: validPhotos.map((url, i) => ({
        id: `img_sup_${Date.now()}_${i}`,
        url,
        isPrimary: i === 0,
        isBackgroundRemoved: false,
        isCropped1x1: false,
      })),
      supplierCost: {
        productId: '',
        baseCost: formBaseCost,
        updatedAt: new Date().toISOString(),
      },
      stockQuantity: 2,
    });

    setIsSubmitting(false);
    setUploadSuccess(true);
    setFormName('');
    setFormDescription('');
    setFormPhotoUrls(['', '', '']);
    setTimeout(() => setUploadSuccess(false), 3500);
    await loadData();
  };

  const handleToggleSoldOut = async (product: Product) => {
    const newStatus = product.status === 'agotado' ? 'publicado' : 'agotado';
    await services.productRepo.markStatus(product.id, newStatus);
    await loadData();
  };

  const handleConfirmStock = async (orderId: string, isAvailable: boolean) => {
    if (isAvailable) {
      await services.orderRepo.updateState(
        orderId,
        'pendiente_pago',
        'proveedor',
        'Taller confirmó existencia física inmediata vía WhatsApp.',
      );
    } else {
      await services.orderRepo.updateState(
        orderId,
        'cancelado_agotado',
        'proveedor',
        'Taller reportó artículo agotado en tienda física.',
      );
    }
    await loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header del Proveedor */}
      <div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl p-5 border"
        style={{
          backgroundColor: 'var(--admin-card)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          boxShadow: 'var(--admin-shadow)',
          backdropFilter: 'var(--admin-backdrop)',
          WebkitBackdropFilter: 'var(--admin-backdrop)',
        }}
      >
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl text-brand-500 border" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--admin-text-primary)' }}>
                {supplier?.businessName || 'Portal de Proveedores'}
              </h2>
              <Badge variant="gold" size="sm">
                Nivel {supplier?.level} (Satélite)
              </Badge>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--admin-text-secondary)' }}>
              Teléfono Registrado: <strong className="font-mono" style={{ color: 'var(--admin-text-primary)' }}>{supplier?.contactWhatsapp}</strong> • Zona: {supplier?.geoZone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="p-2.5 rounded-xl border text-center" style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)' }}>
            <p className="text-[10px] uppercase" style={{ color: 'var(--admin-text-secondary)' }}>Productos Activos</p>
            <p className="font-bold text-base" style={{ color: 'var(--admin-text-primary)' }}>{products.length}</p>
          </div>
          <div className="p-2.5 rounded-xl border text-center" style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)' }}>
            <p className="text-[10px] uppercase" style={{ color: 'var(--admin-text-secondary)' }}>Órdenes Asignadas</p>
            <p className="font-bold text-brand-500 text-base">{orders.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulario de Carga Rápida (US-02) - 5 cols */}
        <div
          className="lg:col-span-5 rounded-2xl p-5 border space-y-4 shadow-card"
          style={{
            backgroundColor: 'var(--admin-card)',
            borderColor: 'var(--admin-border)',
          }}
        >
          <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--admin-border)' }}>
            <UploadCloud className="w-5 h-5 text-brand-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--admin-text-primary)' }}>
              Cargar Mueble a Catálogo (US-02)
            </h3>
          </div>

          <form onSubmit={handleUploadProduct} className="space-y-4">
            <Input
              label="Nombre o Descripción del Mueble"
              placeholder="ej: Mesa de Noche Roble 2 Cajones"
              value={formName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormName(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-text-secondary)' }}>
                  Categoría
                </label>
                <select
                  value={formCategory}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormCategory(e.target.value)}
                  className="w-full border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  style={{ backgroundColor: 'var(--admin-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text-primary)' }}
                >
                  <option value="Comedores">Comedores</option>
                  <option value="Salas y Sofás">Salas y Sofás</option>
                  <option value="Mesas de Centro">Mesas de Centro</option>
                  <option value="Recámaras y Camas">Recámaras y Camas</option>
                  <option value="Sillas y Sillones">Sillas y Sillones</option>
                </select>
              </div>

              <Input
                label="Costo Base Taller ($)"
                type="number"
                value={formBaseCost}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormBaseCost(Number(e.target.value) || 0)}
                leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-text-secondary)' }}>
                Dimensiones (cm)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Ancho"
                  type="number"
                  value={formWidth}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormWidth(Number(e.target.value) || 0)}
                />
                <Input
                  placeholder="Alto"
                  type="number"
                  value={formHeight}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormHeight(Number(e.target.value) || 0)}
                />
                <Input
                  placeholder="Fondo"
                  type="number"
                  value={formDepth}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormDepth(Number(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-text-secondary)' }}>
                Descripción breve
              </label>
              <textarea
                value={formDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormDescription(e.target.value)}
                placeholder="Materiales, acabado, características especiales..."
                rows={2}
                className="w-full border rounded-xl py-2 px-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                style={{ backgroundColor: 'var(--admin-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text-primary)' }}
              />
            </div>

            {/* Multi-foto — panel de ángulos para 3D viewer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-text-secondary)' }}>
                  Fotos del Producto
                </label>
                {/* Indicador de activación de 3D viewer */}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors border ${
                    formPhotoUrls.filter(u => u.trim()).length >= 3
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                      : 'border-transparent'
                  }`}
                  style={formPhotoUrls.filter(u => u.trim()).length >= 3 ? {} : { backgroundColor: 'var(--admin-card-alt)', color: 'var(--admin-text-secondary)', borderColor: 'var(--admin-border)' }}
                >
                  {formPhotoUrls.filter(u => u.trim()).length >= 3 ? '✦ 3D Viewer Activado' : `${formPhotoUrls.filter(u => u.trim()).length}/3 — Mín. 3 para 3D`}
                </span>
              </div>

              {formPhotoUrls.map((url, i) => (
                <div key={i} className="flex items-center gap-2">
                  {/* Thumbnail preview */}
                  <div
                    className="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden border"
                    style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)' }}
                  >
                    {url ? (
                      <img src={url} alt={`Ángulo ${i + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-mono" style={{ color: 'var(--admin-text-secondary)' }}>{i + 1}</div>
                    )}
                  </div>
                  <input
                    type="url"
                    placeholder={i === 0 ? 'URL Foto Principal (ángulo frontal)' : i === 1 ? 'URL Foto Lateral' : i === 2 ? 'URL Foto de Ambiente' : `URL Foto Ángulo ${i + 1}`}
                    value={url}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const next = [...formPhotoUrls];
                      next[i] = e.target.value;
                      setFormPhotoUrls(next);
                    }}
                    className="flex-1 border rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                    style={{ backgroundColor: 'var(--admin-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text-primary)' }}
                  />
                  {i >= 3 && (
                    <button
                      type="button"
                      onClick={() => setFormPhotoUrls(prev => prev.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-300 text-xs transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              {formPhotoUrls.length < 6 && (
                <button
                  type="button"
                  onClick={() => setFormPhotoUrls(prev => [...prev, ''])}
                  className="text-xs text-brand-500 hover:text-brand-400 transition-colors flex items-center gap-1 mt-1"
                >
                  + Añadir ángulo adicional
                </button>
              )}
            </div>

            {uploadSuccess && (
              <div className="p-3 rounded-xl border text-xs font-semibold flex items-center gap-2" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                <CheckCircle2 className="w-4 h-4" /> ¡Producto enviado a bandeja de curaduría del Admin!
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isSubmitting}
              leftIcon={<UploadCloud className="w-4 h-4" />}
              style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
            >
              Enviar Mueble para Aprobación
            </Button>
          </form>
        </div>

        {/* Gestión de Inventario & Órdenes Asignadas (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Órdenes Pendientes de Confirmar Stock (Ping Interactivo WhatsApp) */}
          <div
            className="rounded-2xl p-5 border space-y-4 shadow-card"
            style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--admin-border)' }}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--admin-text-primary)' }}>
                  Pings de Validación de Inventario (US-14 / RF-21)
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {orders.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: 'var(--admin-text-secondary)' }}>No tienes órdenes activas asignadas.</p>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-xl border space-y-3"
                    style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)' }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs" style={{ color: 'var(--admin-text-primary)' }}>{ord.orderNumber}</span>
                          <Badge variant="review" size="sm">
                            {ord.state}
                          </Badge>
                        </div>
                        <p className="text-xs font-semibold mt-1" style={{ color: 'var(--admin-text-primary)' }}>
                          {ord.items[0]?.productName}
                        </p>
                        <p className="text-[11px]" style={{ color: 'var(--admin-text-secondary)' }}>
                          Dirección de Despacho: {ord.deliveryAddress}
                        </p>
                      </div>

                      {/* En facturación centralizada, el taller ve orden sin margen */}
                      <span className="text-[10px] px-2 py-1 rounded border" style={{ backgroundColor: 'var(--admin-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text-secondary)' }}>
                        {ord.billingMode === 'centralizada' ? 'Despacho Sin Montos' : 'Factura con RNC'}
                      </span>
                    </div>

                    {/* Botones Interactivos Simulados de WhatsApp */}
                    {ord.state === 'validacion_inventario' && (
                      <div className="p-3 rounded-lg border space-y-2" style={{ backgroundColor: 'var(--admin-bg)', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
                        <p className="text-[11px] text-purple-500 font-semibold">
                          📲 Notificación interactiva recibida: ¿Dispones de stock físico inmediato?
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="xs"
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            onClick={() => handleConfirmStock(ord.id, true)}
                            style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
                          >
                            Confirmar Stock Disponible
                          </Button>
                          <Button
                            variant="danger"
                            size="xs"
                            leftIcon={<XCircle className="w-3.5 h-3.5" />}
                            onClick={() => handleConfirmStock(ord.id, false)}
                          >
                            Marcar Agotado
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mis Productos y Toggle de Agotado (US-06 / RF-06) */}
          <div
            className="rounded-2xl p-5 border space-y-4 shadow-card"
            style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--admin-border)' }}>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--admin-text-primary)' }}>
                  Mis Muebles en Catálogo & Disponibilidad (US-06)
                </h3>
              </div>
            </div>

            <div className="space-y-2.5">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-3 rounded-xl border gap-3"
                  style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)' }}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.images[0]?.url}
                      alt={prod.name}
                      className="w-12 h-12 rounded-lg object-cover border"
                      style={{ backgroundColor: 'var(--admin-bg)', borderColor: 'var(--admin-border)' }}
                    />
                    <div>
                      <p className="text-xs font-bold" style={{ color: 'var(--admin-text-primary)' }}>{prod.name}</p>
                      <p className="text-[11px]" style={{ color: 'var(--admin-text-secondary)' }}>
                        Costo Taller: <strong style={{ color: 'var(--admin-text-primary)' }}>${prod.supplierCost?.baseCost.toLocaleString()}</strong> • Stock: {prod.stockQuantity}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={prod.status === 'agotado' ? 'soldout' : 'published'} size="sm">
                      {prod.status === 'agotado' ? 'Agotado' : 'Disponible'}
                    </Badge>
                    <Button
                      variant={prod.status === 'agotado' ? 'primary' : 'outline'}
                      size="xs"
                      onClick={() => handleToggleSoldOut(prod)}
                      style={prod.status === 'agotado' ? { backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' } : { backgroundColor: 'var(--admin-badge-bg)', color: 'var(--admin-text-primary)', border: '1px solid var(--admin-border)' }}
                    >
                      {prod.status === 'agotado' ? 'Reactivar' : 'Marcar Agotado'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
