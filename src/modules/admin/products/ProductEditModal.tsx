import React, { useState, useEffect } from 'react';
import { Modal } from '../../../design-system/molecules/Modal';
import { Input } from '../../../design-system/atoms/Input';
import { Button } from '../../../design-system/atoms/Button';
import { ImageUploaderDropzone } from '../../../design-system/molecules/ImageUploaderDropzone';
import { Product, ProductCategory, LogisticStatus, ProductStatus, Supplier } from '../../../domain/models/Product';
import { Tag } from '../../../domain/models/Tag';
import { services } from '../../../services/ServiceContainer';
import { Check, DollarSign, Layers, Package, Trash2 } from 'lucide-react';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onProductUpdated: () => void;
  onProductDeleted?: () => void;
}

const CATEGORIES: ProductCategory[] = [
  'Salas y Sofás',
  'Comedores',
  'Mesas de Centro',
  'Recámaras y Camas',
  'Sillas y Sillones',
  'Almacenamiento y Muebles TV',
  'Mobiliario de Exterior',
];

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  onClose,
  product,
  onProductUpdated,
  onProductDeleted,
}) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Salas y Sofás');
  const [supplierId, setSupplierId] = useState('');
  const [status, setStatus] = useState<ProductStatus>('publicado');
  const [costBase, setCostBase] = useState<number>(0);
  const [suggestedPrice, setSuggestedPrice] = useState<number>(0);
  const [floorPrice, setFloorPrice] = useState<number>(0);
  const [widthCm, setWidthCm] = useState(0);
  const [heightCm, setHeightCm] = useState(0);
  const [depthCm, setDepthCm] = useState(0);
  const [weightKg, setWeightKg] = useState(0);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [logisticStatus, setLogisticStatus] = useState<LogisticStatus>('jit');
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadDependencies = async () => {
      const sups = await services.supplierRepo.getAll();
      const tgs = await services.tagRepo.getAll();
      setSuppliers(sups);
      setAvailableTags(tgs);
    };
    loadDependencies();
  }, []);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setCategory(product.category);
      setSupplierId(product.supplierId || '');
      setStatus(product.status);
      setCostBase(product.costBase || 0);
      setSuggestedPrice(product.suggestedPrice || 0);
      setFloorPrice(product.floorPrice || 0);
      setWidthCm(product.dimensions?.widthCm || 0);
      setHeightCm(product.dimensions?.heightCm || 0);
      setDepthCm(product.dimensions?.depthCm || 0);
      setWeightKg(product.dimensions?.weightKg || 0);
      setStockQuantity(product.stockQuantity ?? 1);
      setLogisticStatus(product.logisticStatus || 'jit');
      setColor(product.color || '');
      setMaterial(product.material || '');
      setDescription(product.description || '');
      setImageUrl(product.images?.[0]?.url || '');
      setSelectedTagIds(product.tags || []);
    }
  }, [product, isOpen]);

  // Recalcular precios dinámicamente si se modifica el costo base
  const handleCostBaseChange = (newCost: number) => {
    setCostBase(newCost);
    setSuggestedPrice(Math.round(newCost * 1.35));
    setFloorPrice(Math.round(newCost * 1.18));
  };

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !name.trim()) return;

    setIsSubmitting(true);
    try {
      await services.productRepo.update(product.id, {
        name: name.trim(),
        category,
        supplierId,
        supplierName: suppliers.find((s) => s.id === supplierId)?.businessName || product.supplierName,
        status,
        costBase,
        suggestedPrice,
        floorPrice,
        priceProtected: suggestedPrice,
        dimensions: {
          widthCm,
          heightCm,
          depthCm,
          weightKg,
        },
        stockQuantity,
        logisticStatus,
        color,
        material,
        description,
        tags: selectedTagIds,
        images: imageUrl
          ? [
              {
                id: product.images?.[0]?.id || `img_${Date.now()}`,
                url: imageUrl,
                isPrimary: true,
                isBackgroundRemoved: product.images?.[0]?.isBackgroundRemoved || false,
                isCropped1x1: product.images?.[0]?.isCropped1x1 || false,
              },
            ]
          : product.images,
      });

      // Actualizar tags si cambió la selección
      for (const tag of availableTags) {
        if (selectedTagIds.includes(tag.id) && !tag.productIds.includes(product.id)) {
          await services.tagRepo.assignProduct(tag.id, product.id);
        } else if (!selectedTagIds.includes(tag.id) && tag.productIds.includes(product.id)) {
          await services.tagRepo.removeProduct(tag.id, product.id);
        }
      }

      onProductUpdated();
      onClose();
    } catch (error) {
      console.error('Error al actualizar producto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    if (!window.confirm(`¿Estás seguro de eliminar "${product.name}" del catálogo?`)) return;

    setIsDeleting(true);
    try {
      await services.productRepo.delete(product.id);
      if (onProductDeleted) onProductDeleted();
      onProductUpdated();
      onClose();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar Producto: ${product.name}`}
      description="Gestión de inventario activo, existencias, precios protegidos y clasificación logística."
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[72vh] overflow-y-auto pr-1 admin-scrollbar">
        {/* Section 1: Información Básica & Estado */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--admin-text-secondary)' }}>
              <Package className="w-3.5 h-3.5 text-indigo-400" /> 1. Datos Generales & Estado del Catálogo
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Estado de Publicación:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none"
                style={{
                  backgroundColor: 'var(--admin-bg)',
                  borderColor: 'var(--admin-border)',
                  color:
                    status === 'publicado'
                      ? '#10b981'
                      : status === 'revision'
                      ? '#f59e0b'
                      : '#94a3b8',
                }}
              >
                <option value="publicado">✦ Publicado (Visible en tienda)</option>
                <option value="revision">⚡ En Revisión / Edición</option>
                <option value="borrador">📝 Borrador Crudo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Nombre del Producto"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-text-secondary)' }}>
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full border rounded-xl py-2.5 px-3 text-xs font-bold focus:outline-none"
                style={{
                  backgroundColor: 'var(--admin-bg)',
                  borderColor: 'var(--admin-border)',
                  color: 'var(--admin-text-primary)',
                }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-text-secondary)' }}>
                Taller / Proveedor Asignado
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full border rounded-xl py-2.5 px-3 text-xs focus:outline-none"
                style={{
                  backgroundColor: 'var(--admin-bg)',
                  borderColor: 'var(--admin-border)',
                  color: 'var(--admin-text-primary)',
                }}
              >
                <option value="">Selecciona un taller artesanal...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.businessName} ({s.geoZone})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Image Dropzone / URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-text-secondary)' }}>
                Fotografía Principal de la Pieza
              </label>
              <ImageUploaderDropzone
                currentImageUrl={imageUrl}
                onImageSelected={(url) => setImageUrl(url)}
                maxSizeBytes={5 * 1024 * 1024}
                aspectRatioRecommendation="1:1"
                helperText="Formato cuadrado 1:1 recomendado (Máx 5MB)"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Motor de Precios & Márgenes */}
        <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--admin-text-secondary)' }}>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> 2. Motor de Precios & Márgenes Dinámicos
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}>
            <div>
              <Input
                label="Costo Base del Taller (RD$)"
                type="number"
                required
                value={costBase}
                onChange={(e) => handleCostBaseChange(Number(e.target.value))}
              />
              <span className="text-[10px] text-slate-400">Pactado con el proveedor</span>
            </div>

            <div>
              <Input
                label="Precio Sugerido (+35%) (RD$)"
                type="number"
                value={suggestedPrice}
                onChange={(e) => setSuggestedPrice(Number(e.target.value))}
              />
              <span className="text-[10px] text-emerald-400 font-semibold">Margen objetivo: 35.0%</span>
            </div>

            <div>
              <Input
                label="Precio Suelo Protegido (+18%) (RD$)"
                type="number"
                value={floorPrice}
                onChange={(e) => setFloorPrice(Number(e.target.value))}
              />
              <span className="text-[10px] text-amber-400 font-semibold">Límite mínimo comercial</span>
            </div>
          </div>
        </div>

        {/* Section 3: Inventario, Stock & Logística */}
        <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--admin-text-secondary)' }}>
            <Layers className="w-3.5 h-3.5 text-blue-400" /> 3. Existencia, Stock & Clasificación Logística
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <Input
              label="Ancho (cm)"
              type="number"
              value={widthCm}
              onChange={(e) => setWidthCm(Number(e.target.value))}
            />
            <Input
              label="Alto (cm)"
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
            />
            <Input
              label="Prof. (cm)"
              type="number"
              value={depthCm}
              onChange={(e) => setDepthCm(Number(e.target.value))}
            />
            <Input
              label="Peso (kg)"
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-text-secondary)' }}>
                Existencia / Stock
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setStockQuantity((q) => Math.max(0, q - 1))}
                  className="w-7 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  -
                </button>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  className="w-full text-center border rounded-lg py-1.5 text-xs font-bold bg-transparent"
                  style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-primary)' }}
                />
                <button
                  type="button"
                  onClick={() => setStockQuantity((q) => q + 1)}
                  className="w-7 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-text-secondary)' }}>
                Logística
              </label>
              <select
                value={logisticStatus}
                onChange={(e) => setLogisticStatus(e.target.value as LogisticStatus)}
                className="w-full border rounded-xl py-2 px-2 text-xs font-bold"
                style={{
                  backgroundColor: 'var(--admin-bg)',
                  borderColor: 'var(--admin-border)',
                  color:
                    logisticStatus === 'disponible_ya'
                      ? '#10b981'
                      : logisticStatus === 'bajo_pedido'
                      ? '#a855f7'
                      : '#f59e0b',
                }}
              >
                <option value="disponible_ya">✦ Inmediato</option>
                <option value="jit">⚡ JIT (24-48h)</option>
                <option value="bajo_pedido">⏱ 15 días</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Materiales Principales"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
            />
            <Input
              label="Color / Acabado"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          <Input
            label="Descripción del Producto"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Section 4: Tags y Hashtags */}
        <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-text-secondary)' }}>
            Etiquetas & Hashtags Asociados
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleToggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-slate-800/40 text-slate-300 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>#{tag.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500"
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar Pieza'}
          </Button>

          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              leftIcon={<Check className="w-4 h-4" />}
              style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
            >
              {isSubmitting ? 'Guardando Cambios...' : 'Guardar y Actualizar'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
