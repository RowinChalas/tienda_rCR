import React, { useState, useEffect } from 'react';
import { Tag } from '../../../domain/models/Tag';
import { Product } from '../../../domain/models/Product';
import { services } from '../../../services/ServiceContainer';
import { Button } from '../../../design-system/atoms/Button';
import { Input } from '../../../design-system/atoms/Input';
import { Modal } from '../../../design-system/molecules/Modal';
import { Tag as TagIcon, Plus, Trash2, Search, Check } from 'lucide-react';

export const TagsManagerView: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Form states
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState('#3b82f6');
  const [formDescription, setFormDescription] = useState('');

  const loadData = async () => {
    const tgs = await services.tagRepo.getAll();
    const prods = await services.productRepo.getAll();
    setTags(tgs);
    setProducts(prods);
    if (!selectedTag && tgs.length > 0) {
      setSelectedTag(tgs[0]);
    } else if (selectedTag) {
      const refreshed = tgs.find((t) => t.id === selectedTag.id);
      if (refreshed) setSelectedTag(refreshed);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('barversuit_tags_updated', handleUpdate);
    return () => window.removeEventListener('barversuit_tags_updated', handleUpdate);
  }, []);

  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    await services.tagRepo.save({
      id: selectedTag?.id && !isCreateModalOpen ? selectedTag.id : `tag_${Date.now()}`,
      name: formName.trim(),
      slug: formName.trim().toLowerCase().replace(/\s+/g, '-'),
      color: formColor,
      description: formDescription.trim(),
      productIds: selectedTag?.productIds || [],
    });

    setFormName('');
    setFormDescription('');
    setIsCreateModalOpen(false);
    await loadData();
  };

  const handleDeleteTag = async (id: string) => {
    if (confirm('¿Eliminar esta etiqueta?')) {
      await services.tagRepo.delete(id);
      await loadData();
    }
  };

  const handleToggleProductInTag = async (productId: string) => {
    if (!selectedTag) return;
    if (selectedTag.productIds.includes(productId)) {
      await services.tagRepo.removeProduct(selectedTag.id, productId);
    } else {
      await services.tagRepo.assignProduct(selectedTag.id, productId);
    }
    await loadData();
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--admin-border)' }}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--admin-text-primary)' }}>
            <TagIcon className="w-5 h-5 text-brand-400" /> Gestión de Tags & Etiquetas del Catálogo
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--admin-text-secondary)' }}>
            Organiza productos en hashtags dinámicos para carruseles de la tienda (#cocina, #Telas, #muebles, etc.)
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => {
            setFormName('');
            setFormDescription('');
            setFormColor('#3b82f6');
            setIsCreateModalOpen(true);
          }}
          style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
        >
          + Nueva Etiqueta / Tag
        </Button>
      </div>

      {/* Main Split Pane: Tags on Left, Associated Products on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tags List */}
        <div
          className="rounded-2xl border p-5 space-y-3"
          style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Etiquetas Registradas ({tags.length})
          </h3>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {tags.map((tag) => {
              const isSelected = selectedTag?.id === tag.id;
              return (
                <div
                  key={tag.id}
                  onClick={() => setSelectedTag(tag)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-500/10 shadow-sm'
                      : 'hover:border-slate-600'
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--admin-card-alt)',
                    borderColor: isSelected ? 'var(--admin-accent)' : 'var(--admin-border)',
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color || '#3b82f6' }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: 'var(--admin-text-primary)' }}>
                        #{tag.name}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--admin-text-secondary)' }}>
                        {tag.productIds.length} {tag.productIds.length === 1 ? 'producto' : 'productos'} vinculados
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTag(tag.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Eliminar Tag"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Products Assignment for Selected Tag */}
        <div
          className="lg:col-span-2 rounded-2xl border p-5 space-y-4"
          style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}
        >
          {selectedTag ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: 'var(--admin-border)' }}>
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: selectedTag.color || '#3b82f6' }}
                  />
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: 'var(--admin-text-primary)' }}>
                      Productos en #{selectedTag.name}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>
                      Marca los productos que deseas que aparezcan bajo esta categoría temática en la tienda
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-64">
                  <Input
                    placeholder="Buscar producto por nombre..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
                  />
                </div>
              </div>

              {/* Product Grid Assignment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
                {filteredProducts.map((prod) => {
                  const isAssigned = selectedTag.productIds.includes(prod.id);
                  return (
                    <div
                      key={prod.id}
                      onClick={() => handleToggleProductInTag(prod.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isAssigned
                          ? 'border-emerald-500/50 bg-emerald-500/10'
                          : 'hover:border-slate-600'
                      }`}
                      style={{
                        backgroundColor: isAssigned ? 'rgba(16, 185, 129, 0.08)' : 'var(--admin-card-alt)',
                        borderColor: isAssigned ? '#10b981' : 'var(--admin-border)',
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border flex-shrink-0 bg-black/40" style={{ borderColor: 'var(--admin-border)' }}>
                          <img src={prod.images[0]?.url} alt={prod.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate" style={{ color: 'var(--admin-text-primary)' }}>
                            {prod.name}
                          </p>
                          <p className="text-[10px]" style={{ color: 'var(--admin-text-secondary)' }}>
                            {prod.category} • ${prod.suggestedPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                          isAssigned
                            ? 'bg-emerald-500 border-emerald-400 text-white'
                            : 'border-slate-600 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">
              Selecciona una etiqueta para ver y asignar productos.
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Tag Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nueva Etiqueta de Catálogo"
        size="sm"
      >
        <form onSubmit={handleSaveTag} className="space-y-4">
          <Input
            label="Nombre de la Etiqueta (Hashtag)"
            placeholder="Ej. cocina, Telas para el hogar, Novedades"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-text-secondary)' }}>
              Color de Identificación
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formColor}
                onChange={(e) => setFormColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs font-mono text-slate-300">{formColor}</span>
            </div>
          </div>

          <Input
            label="Descripción (Opcional)"
            placeholder="Breve detalle sobre este grupo de muebles"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
            >
              Guardar Etiqueta
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
