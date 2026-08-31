import React, { useState } from 'react';
import { usePlatform } from '../../../context/PlatformContext';
import { Button } from '../../../design-system/atoms/Button';
import { Badge } from '../../../design-system/atoms/Badge';
import { Input } from '../../../design-system/atoms/Input';
import { CoordinateCalculator } from '../../../domain/cms/CoordinateCalculator';
import { HeroSlideCms, NavMenuItem, SpaceScene, VisualCollection, SpaceHotspot } from '../../../domain/models/CmsContent';
import { STOREFRONT_PRODUCTS } from '../../storefront/data/storefrontData';
import {
  Globe,
  Sliders,
  Compass,
  Menu,
  Grid,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Crosshair,
  Sparkles,
} from 'lucide-react';

type CmsSubTab = 'settings' | 'hero' | 'spaces' | 'menus' | 'collections';

export const CmsManagerView: React.FC = () => {
  const {
    settings,
    updateSettings,
    cms,
    saveHeroSlide,
    deleteHeroSlide,
    saveScene,
    saveNavMenu,
    deleteNavMenu,
    saveCollection,
  } = usePlatform();

  const [activeSubTab, setActiveSubTab] = useState<CmsSubTab>('settings');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 1. Settings state
  const [formSettings, setFormSettings] = useState(settings);

  // 2. Hero edit state
  const [editingSlide, setEditingSlide] = useState<HeroSlideCms | null>(null);

  // 3. Spaces Explorer state
  const [selectedSceneId, setSelectedSceneId] = useState<string>(cms.spaceScenes[0]?.id || '');
  const [draftPin, setDraftPin] = useState<{ x: number; y: number } | null>(null);
  const [pinProductId, setPinProductId] = useState<string>(STOREFRONT_PRODUCTS[0]?.id || '');
  const [pinLabel, setPinLabel] = useState<string>('');

  // 4. Menu edit state
  const [newMenuLabel, setNewMenuLabel] = useState('');
  const [newMenuCategory, setNewMenuCategory] = useState('sala');

  // 5. Visual Collection edit state
  const [editingCollection, setEditingCollection] = useState<VisualCollection | null>(null);

  const activeScene = cms.spaceScenes.find((s) => s.id === selectedSceneId) || cms.spaceScenes[0];

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Click on space scene image to capture relative coordinates (X%, Y%)
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const coords = CoordinateCalculator.calculate(clickX, clickY, rect.width, rect.height);
    setDraftPin(coords);

    const defaultProd = STOREFRONT_PRODUCTS.find((p) => p.id === pinProductId) || STOREFRONT_PRODUCTS[0];
    if (!pinLabel) {
      setPinLabel(defaultProd.name);
    }
  };

  const handleAddHotspotToScene = async () => {
    if (!activeScene || !draftPin) return;

    const product = STOREFRONT_PRODUCTS.find((p) => p.id === pinProductId) || STOREFRONT_PRODUCTS[0];
    const newHotspot: SpaceHotspot = {
      id: `hs_${Date.now()}`,
      productId: product.id,
      label: pinLabel || product.name,
      x: draftPin.x,
      y: draftPin.y,
    };

    const updatedScene: SpaceScene = {
      ...activeScene,
      hotspots: [...activeScene.hotspots, newHotspot],
    };

    await saveScene(updatedScene);
    setDraftPin(null);
    setPinLabel('');
  };

  const handleRemoveHotspot = async (hotspotId: string) => {
    if (!activeScene) return;
    const updatedScene: SpaceScene = {
      ...activeScene,
      hotspots: activeScene.hotspots.filter((h) => h.id !== hotspotId),
    };
    await saveScene(updatedScene);
  };

  const handleCreateNavMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuLabel.trim()) return;

    const newItem: NavMenuItem = {
      id: `menu_${Date.now()}`,
      label: newMenuLabel.trim(),
      targetCategory: newMenuCategory,
      order: cms.navMenus.length + 1,
      isActive: true,
    };

    await saveNavMenu(newItem);
    setNewMenuLabel('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-editorial tracking-tight flex items-center gap-2.5" style={{ color: 'var(--admin-text-primary)' }}>
            CMS & Constructor Visual de Tienda
            <Badge variant="gold" size="sm">
              Parametrización & Lookbook
            </Badge>
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--admin-text-secondary)' }}>
            Administración dinámica de identidad corporativa, carruseles hero, menús y shoppable images (Explorador de Espacios).
          </p>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div
        className="flex items-center gap-2 p-1.5 rounded-2xl border overflow-x-auto"
        style={{
          backgroundColor: 'var(--admin-card)',
          borderColor: 'var(--admin-border)',
        }}
      >
        {[
          { id: 'settings', label: 'Identidad & Contacto', icon: <Globe className="w-4 h-4" /> },
          { id: 'hero', label: 'Carrusel Hero', icon: <Sliders className="w-4 h-4" /> },
          { id: 'spaces', label: 'Explorador de Espacios (Pines)', icon: <Compass className="w-4 h-4" /> },
          { id: 'menus', label: 'Menús de Navegación', icon: <Menu className="w-4 h-4" /> },
          { id: 'collections', label: 'Colecciones Visuales', icon: <Grid className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as CmsSubTab)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === tab.id
                ? 'shadow-sm text-white'
                : 'hover:text-[var(--admin-text-primary)]'
            }`}
            style={{
              backgroundColor: activeSubTab === tab.id ? 'var(--admin-accent)' : 'transparent',
              color: activeSubTab === tab.id ? 'white' : 'var(--admin-text-secondary)',
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: IDENTIDAD & CONFIGURACIÓN GLOBAL */}
      {activeSubTab === 'settings' && (
        <form
          onSubmit={handleSaveSettings}
          className="rounded-2xl border p-6 space-y-6 shadow-card"
          style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}
        >
          <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--admin-border)' }}>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--admin-text-primary)' }}>
                Identidad Corporativa & Textos Globales
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--admin-text-secondary)' }}>
                Estos datos se consumen globalmente a través del Context API en la tienda y footer.
              </p>
            </div>

            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" /> Guardado exitosamente
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre Comercial de la Empresa"
              value={formSettings.companyName}
              onChange={(e) => setFormSettings({ ...formSettings, companyName: e.target.value })}
              required
            />

            <Input
              label="Slogan / Frase de Marca"
              value={formSettings.slogan}
              onChange={(e) => setFormSettings({ ...formSettings, slogan: e.target.value })}
              required
            />

            <Input
              label="Teléfono WhatsApp (Atención / Concierge)"
              value={formSettings.contactWhatsapp}
              onChange={(e) => setFormSettings({ ...formSettings, contactWhatsapp: e.target.value })}
              required
            />

            <Input
              label="Correo Electrónico de Contacto"
              type="email"
              value={formSettings.contactEmail}
              onChange={(e) => setFormSettings({ ...formSettings, contactEmail: e.target.value })}
              required
            />

            <div className="md:col-span-2">
              <Input
                label="Dirección Física (Showroom o Taller Principal)"
                value={formSettings.physicalAddress}
                onChange={(e) => setFormSettings({ ...formSettings, physicalAddress: e.target.value })}
                required
              />
            </div>

            <Input
              label="Enlace Instagram"
              value={formSettings.socialLinks.instagram || ''}
              onChange={(e) =>
                setFormSettings({
                  ...formSettings,
                  socialLinks: { ...formSettings.socialLinks, instagram: e.target.value },
                })
              }
            />

            <Input
              label="Enlace Facebook"
              value={formSettings.socialLinks.facebook || ''}
              onChange={(e) =>
                setFormSettings({
                  ...formSettings,
                  socialLinks: { ...formSettings.socialLinks, facebook: e.target.value },
                })
              }
            />
          </div>

          {/* Footer Text */}
          <div className="space-y-1 pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-text-secondary)' }}>
              Texto Descriptivo del Pie de Página (Footer)
            </label>
            <textarea
              rows={2}
              value={formSettings.footerText}
              onChange={(e) => setFormSettings({ ...formSettings, footerText: e.target.value })}
              className="w-full border rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
              style={{ backgroundColor: 'var(--admin-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text-primary)' }}
            />
          </div>

          <div className="flex justify-end pt-3">
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Save className="w-4 h-4" />}
              style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
            >
              Guardar Configuración Global
            </Button>
          </div>
        </form>
      )}

      {/* SUB-TAB 2: CARRUSEL HERO */}
      {activeSubTab === 'hero' && (
        <div className="space-y-6">
          <div
            className="rounded-2xl border p-6 shadow-card space-y-4"
            style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--admin-border)' }}>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--admin-text-primary)' }}>
                  Banners del Carrusel Principal (Hero Slides)
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--admin-text-secondary)' }}>
                  Configura los titulares, imágenes de fondo y botones CTA de la cabecera del Storefront.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() =>
                  setEditingSlide({
                    id: `slide_${Date.now()}`,
                    imageUrl: '/images/heroes/hero-sala.jpg',
                    eyebrow: 'Nueva Colección',
                    headline: 'Título de Impacto\nSegunda Línea',
                    subline: 'Descripción atractiva del mobiliario dominicano.',
                    ctaText: 'Explorar ahora',
                    targetCategory: 'sala',
                    order: cms.heroSlides.length + 1,
                    isActive: true,
                  })
                }
                style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
              >
                + Nuevo Slide Hero
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cms.heroSlides.map((slide) => (
                <div
                  key={slide.id}
                  className="rounded-xl border overflow-hidden relative group space-y-2 p-3"
                  style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)' }}
                >
                  <div className="aspect-[16/9] rounded-lg overflow-hidden relative bg-black">
                    <img src={slide.imageUrl} alt={slide.headline} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 p-3 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
                      <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">{slide.eyebrow}</span>
                      <p className="text-xs font-bold text-white whitespace-pre-line leading-tight">{slide.headline}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[10px] font-mono" style={{ color: 'var(--admin-text-secondary)' }}>
                      Orden: #{slide.order} • Redirección: {slide.targetCategory}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingSlide(slide)}
                        className="text-xs px-2 py-1 rounded hover:bg-brand-500/20 text-brand-400 font-semibold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteHeroSlide(slide.id)}
                        className="text-xs px-2 py-1 rounded hover:bg-red-500/20 text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formulario modal / inline de edición de Slide */}
          {editingSlide && (
            <div
              className="rounded-2xl border p-5 space-y-4 shadow-xl"
              style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-accent)' }}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-400">
                Editando Slide #{editingSlide.order}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Eyebrow (Texto Superior)"
                  value={editingSlide.eyebrow}
                  onChange={(e) => setEditingSlide({ ...editingSlide, eyebrow: e.target.value })}
                />
                <Input
                  label="Texto del Botón CTA"
                  value={editingSlide.ctaText}
                  onChange={(e) => setEditingSlide({ ...editingSlide, ctaText: e.target.value })}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Titular Principal (Usa saltos de línea para impacto)"
                    value={editingSlide.headline}
                    onChange={(e) => setEditingSlide({ ...editingSlide, headline: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Subtítulo Descriptivo"
                    value={editingSlide.subline}
                    onChange={(e) => setEditingSlide({ ...editingSlide, subline: e.target.value })}
                  />
                </div>
                <Input
                  label="URL Imagen de Fondo"
                  value={editingSlide.imageUrl}
                  onChange={(e) => setEditingSlide({ ...editingSlide, imageUrl: e.target.value })}
                />
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--admin-text-secondary)' }}>
                    Categoría de Destino
                  </label>
                  <select
                    value={editingSlide.targetCategory}
                    onChange={(e) => setEditingSlide({ ...editingSlide, targetCategory: e.target.value })}
                    className="w-full border rounded-xl py-2 px-3 text-xs"
                    style={{ backgroundColor: 'var(--admin-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text-primary)' }}
                  >
                    <option value="all">Todo el Catálogo</option>
                    <option value="sala">Sala</option>
                    <option value="comedor">Comedor</option>
                    <option value="dormitorio">Dormitorio</option>
                    <option value="oficina">Oficina</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setEditingSlide(null)}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={async () => {
                    await saveHeroSlide(editingSlide);
                    setEditingSlide(null);
                  }}
                  style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
                >
                  Guardar Slide
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: EXPLORADOR DE ESPACIOS (HOTSPOT PINS EDITOR) */}
      {activeSubTab === 'spaces' && (
        <div className="space-y-6">
          <div
            className="rounded-2xl border p-6 shadow-card space-y-5"
            style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: 'var(--admin-border)' }}>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--admin-text-primary)' }}>
                  <Crosshair className="w-4 h-4 text-brand-500" />
                  Editor de Pines de Espacios (Shoppable Lookbook)
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--admin-text-secondary)' }}>
                  Haz <strong>clic sobre cualquier parte de la imagen</strong> para capturar coordenadas relativas (X%, Y%) y vincular un mueble.
                </p>
              </div>

              {/* Selector de Ambiente */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: 'var(--admin-text-secondary)' }}>Ambiente:</span>
                <select
                  value={selectedSceneId}
                  onChange={(e) => {
                    setSelectedSceneId(e.target.value);
                    setDraftPin(null);
                  }}
                  className="text-xs border rounded-xl py-1.5 px-3"
                  style={{ backgroundColor: 'var(--admin-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text-primary)' }}
                >
                  {cms.spaceScenes.map((scene) => (
                    <option key={scene.id} value={scene.id}>
                      {scene.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lienzo Visual Interactivo */}
            {activeScene && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Visual Image Canvas - 8 cols */}
                <div className="lg:col-span-8 space-y-2">
                  <div
                    onClick={handleImageClick}
                    className="relative w-full rounded-xl overflow-hidden cursor-crosshair border select-none group"
                    style={{ aspectRatio: '16/9', backgroundColor: '#000', borderColor: 'var(--admin-border)' }}
                  >
                    <img
                      src={activeScene.imageUrl}
                      alt={activeScene.title}
                      className="w-full h-full object-cover pointer-events-none"
                    />

                    {/* Existing Hotspots */}
                    {activeScene.hotspots.map((hs) => (
                      <div
                        key={hs.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none"
                        style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                      >
                        <div className="w-8 h-8 rounded-full bg-white/95 text-slate-900 flex items-center justify-center font-bold text-xs shadow-lg border border-brand-500 animate-pulse">
                          +
                        </div>
                        <span className="absolute top-9 px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white whitespace-nowrap shadow">
                          {hs.label} ({hs.x.toFixed(0)}%, {hs.y.toFixed(0)}%)
                        </span>
                      </div>
                    ))}

                    {/* Draft Pin (Pending confirmation) */}
                    {draftPin && (
                      <div
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center pointer-events-none"
                        style={{ left: `${draftPin.x}%`, top: `${draftPin.y}%` }}
                      >
                        <div className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm shadow-xl animate-bounce">
                          📍
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-center" style={{ color: 'var(--admin-text-secondary)' }}>
                    💡 Clic en la foto para colocar o reubicar el pin indicador.
                  </p>
                </div>

                {/* Pin Configuration & List - 4 cols */}
                <div
                  className="lg:col-span-4 rounded-xl border p-4 space-y-4"
                  style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)' }}
                >
                  {draftPin ? (
                    <div className="space-y-3 p-3 rounded-lg border bg-brand-500/10 border-brand-500/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Coordenadas Capturadas
                        </span>
                        <Badge variant="gold" size="sm">
                          X: {draftPin.x}% • Y: {draftPin.y}%
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--admin-text-secondary)' }}>
                          Vincular a Producto de Catálogo
                        </label>
                        <select
                          value={pinProductId}
                          onChange={(e) => {
                            setPinProductId(e.target.value);
                            const prod = STOREFRONT_PRODUCTS.find((p) => p.id === e.target.value);
                            if (prod) setPinLabel(prod.name);
                          }}
                          className="w-full border rounded-xl py-1.5 px-2.5 text-xs"
                          style={{ backgroundColor: 'var(--admin-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text-primary)' }}
                        >
                          {STOREFRONT_PRODUCTS.map((prod) => (
                            <option key={prod.id} value={prod.id}>
                              {prod.name} ({prod.priceFormatted})
                            </option>
                          ))}
                        </select>
                      </div>

                      <Input
                        label="Etiqueta del Pin"
                        value={pinLabel}
                        onChange={(e) => setPinLabel(e.target.value)}
                      />

                      <div className="flex gap-2 pt-1">
                        <Button variant="ghost" size="xs" onClick={() => setDraftPin(null)}>
                          Cancelar
                        </Button>
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={handleAddHotspotToScene}
                          style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
                        >
                          Confirmar y Guardar Pin
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 text-center rounded-lg border border-dashed text-xs" style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-secondary)' }}>
                      Haz clic sobre la imagen de la izquierda para agregar un nuevo pin.
                    </div>
                  )}

                  {/* List of active hotspots in scene */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--admin-text-primary)' }}>
                      Pines Registrados en este Espacio ({activeScene.hotspots.length})
                    </span>

                    {activeScene.hotspots.length === 0 ? (
                      <p className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>Sin pines en este ambiente aún.</p>
                    ) : (
                      activeScene.hotspots.map((hs) => (
                        <div
                          key={hs.id}
                          className="flex items-center justify-between p-2.5 rounded-lg border text-xs"
                          style={{ backgroundColor: 'var(--admin-bg)', borderColor: 'var(--admin-border)' }}
                        >
                          <div>
                            <p className="font-semibold" style={{ color: 'var(--admin-text-primary)' }}>{hs.label}</p>
                            <p className="text-[10px] font-mono" style={{ color: 'var(--admin-text-secondary)' }}>
                              X: {hs.x.toFixed(1)}% | Y: {hs.y.toFixed(1)}%
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveHotspot(hs.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: MENÚS DE NAVEGACIÓN */}
      {activeSubTab === 'menus' && (
        <div className="space-y-6">
          <div
            className="rounded-2xl border p-6 shadow-card space-y-5"
            style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}
          >
            <div className="border-b pb-4" style={{ borderColor: 'var(--admin-border)' }}>
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--admin-text-primary)' }}>
                Gestor de Enlaces del Menú Principal
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--admin-text-secondary)' }}>
                Crea, renombra y ordena los accesos de la barra de navegación del Storefront.
              </p>
            </div>

            {/* Crear nuevo enlace */}
            <form onSubmit={handleCreateNavMenu} className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <Input
                  label="Texto del Menú"
                  placeholder="ej: Ofertas, Terraza, Colección 2026"
                  value={newMenuLabel}
                  onChange={(e) => setNewMenuLabel(e.target.value)}
                  required
                />
              </div>

              <div className="w-full sm:w-48 space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--admin-text-secondary)' }}>
                  Categoría / Filtro
                </label>
                <select
                  value={newMenuCategory}
                  onChange={(e) => setNewMenuCategory(e.target.value)}
                  className="w-full border rounded-xl py-2 px-3 text-xs"
                  style={{ backgroundColor: 'var(--admin-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text-primary)' }}
                >
                  <option value="all">Todo el Catálogo</option>
                  <option value="sala">Sala</option>
                  <option value="comedor">Comedor</option>
                  <option value="dormitorio">Dormitorio</option>
                  <option value="oficina">Oficina</option>
                </select>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                leftIcon={<Plus className="w-4 h-4" />}
                style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
              >
                Agregar Enlace
              </Button>
            </form>

            {/* Lista de enlaces actuales */}
            <div className="space-y-2 pt-2">
              {cms.navMenus.map((menu, i) => (
                <div
                  key={menu.id}
                  className="flex items-center justify-between p-3 rounded-xl border text-xs"
                  style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] font-bold text-brand-500">#{i + 1}</span>
                    <span className="font-bold" style={{ color: 'var(--admin-text-primary)' }}>{menu.label}</span>
                    <Badge variant="default" size="sm">
                      Filtro: {menu.targetCategory}
                    </Badge>
                  </div>

                  <button
                    onClick={() => deleteNavMenu(menu.id)}
                    className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: COLECCIONES VISUALES */}
      {activeSubTab === 'collections' && (
        <div className="space-y-6">
          <div
            className="rounded-2xl border p-6 shadow-card space-y-4"
            style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}
          >
            <div className="border-b pb-4" style={{ borderColor: 'var(--admin-border)' }}>
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--admin-text-primary)' }}>
                Colecciones Visuales (&ldquo;Cada rincón, una historia&rdquo;)
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--admin-text-secondary)' }}>
                Tarjetas de acceso rápido por espacio con fotografía de portada y descripción.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cms.visualCollections.map((col) => (
                <div
                  key={col.id}
                  className="rounded-xl border overflow-hidden space-y-2 p-3"
                  style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)' }}
                >
                  <div className="aspect-[3/4] rounded-lg overflow-hidden relative">
                    <img src={col.coverImageUrl} alt={col.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-3 text-white">
                      <p className="font-bold text-sm">{col.title}</p>
                      <p className="text-[11px] text-white/70">{col.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingCollection(col)}
                    className="w-full py-1.5 rounded-lg border text-xs font-semibold hover:border-brand-500"
                    style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-primary)' }}
                  >
                    Editar Colección
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Modal / Formulario de Edición de Colección */}
          {editingCollection && (
            <div
              className="rounded-2xl border p-5 space-y-4 shadow-xl"
              style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-accent)' }}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-400">
                Editando Colección: {editingCollection.title}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Título de la Colección"
                  value={editingCollection.title}
                  onChange={(e) => setEditingCollection({ ...editingCollection, title: e.target.value })}
                />
                <Input
                  label="URL Imagen de Portada"
                  value={editingCollection.coverImageUrl}
                  onChange={(e) => setEditingCollection({ ...editingCollection, coverImageUrl: e.target.value })}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Descripción Breve"
                    value={editingCollection.description}
                    onChange={(e) => setEditingCollection({ ...editingCollection, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setEditingCollection(null)}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={async () => {
                    await saveCollection(editingCollection);
                    setEditingCollection(null);
                  }}
                  style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
                >
                  Guardar Colección
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
