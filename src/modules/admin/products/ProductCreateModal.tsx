import React, { useState, useEffect } from 'react';
import { Modal } from '../../../design-system/molecules/Modal';
import { Input } from '../../../design-system/atoms/Input';
import { Button } from '../../../design-system/atoms/Button';
import { ImageUploaderDropzone } from '../../../design-system/molecules/ImageUploaderDropzone';
import { ProductCategory, LogisticStatus, Supplier } from '../../../domain/models/Product';
import { Tag } from '../../../domain/models/Tag';
import { services } from '../../../services/ServiceContainer';
import { Plus, Check, DollarSign, Package, Layers } from 'lucide-react';

interface ProductCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: () => void;
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

export const ProductCreateModal: React.FC<ProductCreateModalProps> = ({
  isOpen,
  onClose,
  onProductCreated,
}) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Salas y Sofás');
  const [supplierId, setSupplierId] = useState('');
  const [costBase, setCostBase] = useState<number>(35000);
  const [suggestedPrice, setSuggestedPrice] = useState<number>(47250);
  const [floorPrice, setFloorPrice] = useState<number>(41300);
  const [widthCm, setWidthCm] = useState(180);
  const [heightCm, setHeightCm] = useState(85);
  const [depthCm, setDepthCm] = useState(90);
  const [weightKg, setWeightKg] = useState(45);
  const [stockQuantity, setStockQuantity] = useState(3);
  const [logisticStatus, setLogisticStatus] = useState<LogisticStatus>('jit');
  const [color, setColor] = useState('Nogal / Lino Natural');
  const [material, setMaterial] = useState('Nogal Macizo Dominicano');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('/images/products/sofa-01.jpg');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadDependencies = async () => {
      const sups = await services.supplierRepo.getAll();
      setSuppliers(sups);
      if (sups.length > 0) setSupplierId(sups[0].id);

      const tgs = await services.tagRepo.getAll();
      setAvailableTags(tgs);
    };
    if (isOpen) {
      loadDependencies();
    }
  }, [isOpen]);

  const handleCostChange = (cost: number) => {
    setCostBase(cost);
    // Auto calculate suggested price (+35%) and floor price (+18%)
    setSuggestedPrice(Math.round(cost * 1.35));
    setFloorPrice(Math.round(cost * 1.18));
  };

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const sup = suppliers.find((s) => s.id === supplierId);

      await services.productRepo.create({
        name: name.trim(),
        category,
        supplierId,
        supplierName: sup?.businessName || 'Taller Artesanal',
        status: 'publicado',
        suggestedPrice,
        floorPrice,
        dimensions: {
          widthCm,
          heightCm,
          depthCm,
          weightKg,
        },
        images: [
          {
            id: `img_${Date.now()}`,
            url: imageUrl || '/images/products/sofa-01.jpg',
            isPrimary: true,
            isBackgroundRemoved: true,
            isCropped1x1: true,
          },
        ],
        color,
        material,
        description:
          description.trim() ||
          `Pieza de autor fabricada en ${material}. Medidas: ${widthCm}x${heightCm}x${depthCm} cm. Acabado en tono ${color}.`,
        supplierCost: {
          productId: '',
          baseCost: costBase,
          updatedAt: new Date().toISOString(),
        },
        stockQuantity,
        logisticStatus,
        estimatedFulfillmentText:
          logisticStatus === 'disponible_ya'
            ? '✦ Envío Inmediato'
            : logisticStatus === 'jit'
            ? '⚡ Despacho en 24-48h (JIT)'
            : '⏱ Fabricación en 15 días',
        tags: selectedTagIds,
      });

      onProductCreated();
      onClose();
    } catch (err) {
      console.error('Error al crear producto:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Nuevo Producto en Catálogo"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Identificación y Categoría */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" /> 1. Datos Principales del Mueble
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre del Producto"
              placeholder="Ej. Sofá Modular Nórdico — Gris Lino"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-text-secondary)' }}>
                Categoría Oficial
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full border rounded-xl py-2 px-3 text-xs font-medium"
                style={{
                  backgroundColor: 'var(--admin-bg)',
                  borderColor: 'var(--admin-border)',
                  color: 'var(--admin-text-primary)',
                }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Proveedor y Pricing Engine */}
        <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" /> 2. Costo Taller & Precios Protegidos
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-text-secondary)' }}>
                Taller / Proveedor
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full border rounded-xl py-2 px-3 text-xs"
                style={{
                  backgroundColor: 'var(--admin-bg)',
                  borderColor: 'var(--admin-border)',
                  color: 'var(--admin-text-primary)',
                }}
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.businessName} (Nivel {s.level})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Costo Base ($)"
              type="number"
              value={costBase}
              onChange={(e) => handleCostChange(Number(e.target.value))}
              required
            />

            <Input
              label="Precio Sugerido (+35%)"
              type="number"
              value={suggestedPrice}
              onChange={(e) => setSuggestedPrice(Number(e.target.value))}
              required
            />

            <Input
              label="Piso Suelo Protegido (+18%)"
              type="number"
              value={floorPrice}
              onChange={(e) => setFloorPrice(Number(e.target.value))}
              required
            />
          </div>
        </div>

        {/* Section 3: Dimensiones y Stock */}
        <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> 3. Dimensiones & Clasificación Logística
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
            <Input
              label="Stock Inicial"
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(Number(e.target.value))}
            />

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
                <option value="jit">⚡ JIT (24h)</option>
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
            label="Descripción del Producto (Opcional)"
            placeholder="Breve reseña artesanal de la pieza..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Section 4: Tags y Categorización */}
        <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-text-secondary)' }}>
            Etiquetas & Hashtags Asociados
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <button
                  type="button"
                  key={tag.id}
                  onClick={() => handleToggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-500 text-white border-brand-400 shadow-sm'
                      : 'border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  #{tag.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 5: Image Dropzone with Size Validation */}
        <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <ImageUploaderDropzone
            label="Fotografía Principal del Mueble"
            helperText="Formato recomendado 3:4 o 1:1, máx 5MB"
            currentImageUrl={imageUrl}
            onImageSelected={(url) => setImageUrl(url)}
            aspectRatioRecommendation="3:4"
            maxSizeBytes={5 * 1024 * 1024}
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            isLoading={isSubmitting}
            style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
          >
            Publicar Producto en Catálogo
          </Button>
        </div>
      </form>
    </Modal>
  );
};
