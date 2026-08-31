import React, { useState, useEffect } from 'react';
import { usePlatform } from '../../../context/PlatformContext';
import { Button } from '../../../design-system/atoms/Button';
import { Input } from '../../../design-system/atoms/Input';
import { Modal } from '../../../design-system/molecules/Modal';
import { ImageUploaderDropzone } from '../../../design-system/molecules/ImageUploaderDropzone';
import { CoordinateCalculator } from '../../../domain/cms/CoordinateCalculator';
import {
  HeroSlideCms,
  SpaceScene,
  VisualCollection,
  SpaceHotspot,
} from '../../../domain/models/CmsContent';
import { StorefrontSection, SectionLayoutType } from '../../../domain/models/StorefrontSection';
import { Tag } from '../../../domain/models/Tag';
import { STOREFRONT_PRODUCTS } from '../../storefront/data/storefrontData';
import { services } from '../../../services/ServiceContainer';
import {
  Globe,
  Sliders,
  Compass,
  Menu,
  Grid,
  Layers,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Crosshair,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Edit2,
  Check,
} from 'lucide-react';

type CmsSubTab = 'settings' | 'hero' | 'spaces' | 'menus' | 'collections' | 'sections';

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

  // 2. Hero modal state
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlideCms | null>(null);

  // 3. Spaces Explorer state & Bidirectional highlighting
  const [selectedSceneId, setSelectedSceneId] = useState<string>(cms.spaceScenes[0]?.id || '');
  const [draftPin, setDraftPin] = useState<{ x: number; y: number } | null>(null);
  const [pinProductId, setPinProductId] = useState<string>(STOREFRONT_PRODUCTS[0]?.id || '');
  const [pinLabel, setPinLabel] = useState<string>('');
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [isSceneModalOpen, setIsSceneModalOpen] = useState(false);
  const [sceneFormTitle, setSceneFormTitle] = useState('');
  const [sceneFormSubtitle, setSceneFormSubtitle] = useState('');
  const [sceneFormImage, setSceneFormImage] = useState('/images/lookbook/sala-full.jpg');

  // 4. Menu modal state
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [newMenuLabel, setNewMenuLabel] = useState('');
  const [newMenuCategory, setNewMenuCategory] = useState('sala');

  // 5. Visual Collection modal state
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<VisualCollection | null>(null);

  // 6. Dynamic Sections state
  const [sections, setSections] = useState<StorefrontSection[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<StorefrontSection | null>(null);

  const activeScene = cms.spaceScenes.find((s) => s.id === selectedSceneId) || cms.spaceScenes[0];

  const loadSectionsAndTags = async () => {
    const secList = await services.sectionRepo.getAll();
    const tagList = await services.tagRepo.getAll();
    setSections(secList);
    setAvailableTags(tagList);
  };

  useEffect(() => {
    loadSectionsAndTags();
    const handleSecUpdate = () => loadSectionsAndTags();
    window.addEventListener('barversuit_sections_updated', handleSecUpdate);
    return () => window.removeEventListener('barversuit_sections_updated', handleSecUpdate);
  }, []);

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
    if (!draftPin || !activeScene) return;

    const newHotspot: SpaceHotspot = {
      id: `hs_${Date.now()}`,
      productId: pinProductId,
      label: pinLabel || 'Mueble BarverSuit',
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
    setSelectedHotspotId(newHotspot.id);
  };

  const handleDeleteHotspot = async (hotspotId: string) => {
    if (!activeScene) return;
    const updatedScene: SpaceScene = {
      ...activeScene,
      hotspots: activeScene.hotspots.filter((h) => h.id !== hotspotId),
    };
    await saveScene(updatedScene);
    if (selectedHotspotId === hotspotId) setSelectedHotspotId(null);
  };

  const handleSaveSceneModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sceneFormTitle.trim()) return;

    const newScene: SpaceScene = {
      id: `scene_${Date.now()}`,
      title: sceneFormTitle.trim(),
      subtitle: sceneFormSubtitle.trim(),
      imageUrl: sceneFormImage || '/images/lookbook/sala-full.jpg',
      order: cms.spaceScenes.length + 1,
      isActive: true,
      hotspots: [],
    };

    await saveScene(newScene);
    setSelectedSceneId(newScene.id);
    setIsSceneModalOpen(false);
    setSceneFormTitle('');
    setSceneFormSubtitle('');
  };

  const handleSaveSlideModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;
    await saveHeroSlide(editingSlide);
    setIsSlideModalOpen(false);
    setEditingSlide(null);
  };

  const handleSaveMenuModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuLabel.trim()) return;
    await saveNavMenu({
      id: `menu_${Date.now()}`,
      label: newMenuLabel.trim(),
      targetCategory: newMenuCategory,
      order: cms.navMenus.length + 1,
      isActive: true,
    });
    setNewMenuLabel('');
    setIsMenuModalOpen(false);
  };

  const handleSaveCollectionModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection) return;
    await saveCollection(editingCollection);
    setIsCollectionModalOpen(false);
    setEditingCollection(null);
  };

  const handleSaveSectionModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection || !editingSection.title.trim()) return;
    await services.sectionRepo.save(editingSection);
    setIsSectionModalOpen(false);
    setEditingSection(null);
    await loadSectionsAndTags();
  };

  const handleToggleSectionVisibility = async (id: string, current: boolean) => {
    await services.sectionRepo.toggleVisibility(id, !current);
    await loadSectionsAndTags();
  };

  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    await services.sectionRepo.reorder(newSections.map((s) => s.id));
    await loadSectionsAndTags();
  };

  const handleDeleteSection = async (id: string) => {
    if (confirm('¿Deseas eliminar esta sección de la tienda?')) {
      await services.sectionRepo.delete(id);
      await loadSectionsAndTags();
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation Bar */}
      <div
        className="flex items-center gap-2 p-1.5 rounded-2xl border overflow-x-auto scrollbar-none"
        style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}
      >
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'settings'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Identidad & Contacto</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sections')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'sections'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Secciones Tienda (Casamia)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('hero')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'hero'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Carrusel Hero</span>
        </button>

        <button
          onClick={() => setActiveSubTab('spaces')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'spaces'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Explorador de Espacios</span>
        </button>

        <button
          onClick={() => setActiveSubTab('menus')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'menus'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu className="w-3.5 h-3.5" />
          <span>Menús de Navegación</span>
        </button>

        <button
          onClick={() => setActiveSubTab('collections')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'collections'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Colecciones Visuales</span>
        </button>
      </div>

      {/* ─── TAB 1: IDENTIDAD & CONTACTO ───────────────────────────── */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div
            className="rounded-2xl border p-6 shadow-card space-y-6"
            style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--admin-border)' }}>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--admin-text-primary)' }}>
                  Parámetros Globales de Marca
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--admin-text-secondary)' }}>
                  Configura el nombre comercial, logo, WhatsApp concierge y redes sociales reflejados globalmente en la tienda.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={<Save className="w-3.5 h-3.5" />}
                style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
              >
                Guardar Configuración
              </Button>
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Configuración de plataforma guardada exitosamente y sincronizada globalmente.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre de la Empresa"
                value={formSettings.companyName}
                onChange={(e) => setFormSettings({ ...formSettings, companyName: e.target.value })}
                required
              />
              <Input
                label="Eslogan / Slogan"
                value={formSettings.slogan}
                onChange={(e) => setFormSettings({ ...formSettings, slogan: e.target.value })}
                required
              />
              <Input
                label="Teléfono WhatsApp Concierge (Formato Internacional)"
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
                  label="Dirección Física del Showroom / Taller"
                  value={formSettings.physicalAddress}
                  onChange={(e) => setFormSettings({ ...formSettings, physicalAddress: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t" style={{ borderColor: 'var(--admin-border)' }}>
              <Input
                label="Instagram URL"
                value={formSettings.socialLinks.instagram || ''}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    socialLinks: { ...formSettings.socialLinks, instagram: e.target.value },
                  })
                }
              />
              <Input
                label="Facebook URL"
                value={formSettings.socialLinks.facebook || ''}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    socialLinks: { ...formSettings.socialLinks, facebook: e.target.value },
                  })
                }
              />
              <Input
                label="Pinterest URL"
                value={formSettings.socialLinks.pinterest || ''}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    socialLinks: { ...formSettings.socialLinks, pinterest: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </form>
      )}

      {/* ─── TAB 2: SECCIONES DINÁMICAS TIENDA (CASAMIA / GUUD.COM) ── */}
      {activeSubTab === 'sections' && (
        <div className="space-y-4">
          <div
            className="rounded-2xl border p-6 shadow-card space-y-4"
            style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--admin-border)' }}>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--admin-text-primary)' }}>
                  Gestor de Secciones Dinámicas del Storefront (Estilo Casamia / Guud.com)
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--admin-text-secondary)' }}>
                  Configura carruseles con hashtags (#cocina, #muebles), galerías artísticas, novedades u ofertas especiales.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => {
                  setEditingSection({
                    id: `sec_${Date.now()}`,
                    title: 'Nueva Sección de Temporada',
                    subtitle: 'Descripción atractiva para el cliente',
                    layoutType: 'tag_filtered_carousel',
                    order: sections.length + 1,
                    isVisible: true,
                    productIds: [STOREFRONT_PRODUCTS[0]?.id || ''],
                    tagIds: availableTags.map((t) => t.id).slice(0, 3),
                    badgeText: 'Evento Especial',
                    createdAt: new Date().toISOString(),
                  });
                  setIsSectionModalOpen(true);
                }}
                style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
              >
                + Nueva Sección Tienda
              </Button>
            </div>

            {/* List of configured sections */}
            <div className="space-y-3">
              {sections.map((section, idx) => (
                <div
                  key={section.id}
                  className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                  style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMoveSection(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-slate-700 text-slate-400 disabled:opacity-30 cursor-pointer"
                        title="Subir orden"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveSection(idx, 'down')}
                        disabled={idx === sections.length - 1}
                        className="p-1 rounded hover:bg-slate-700 text-slate-400 disabled:opacity-30 cursor-pointer"
                        title="Bajar orden"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">#{section.order}</span>
                        <h4 className="text-xs font-bold" style={{ color: 'var(--admin-text-primary)' }}>
                          {section.title}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-medium">
                          {section.layoutType === 'tag_filtered_carousel' && 'Carrusel con Tags (#)'}
                          {section.layoutType === 'carousel_with_scrollbar' && 'Carrusel con Scrollbar'}
                          {section.layoutType === 'art_gallery_centered' && 'Galería Artística'}
                          {section.layoutType === 'grid_4_cols' && 'Grid 4 Columnas'}
                        </span>
                        {section.badgeText && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                            {section.badgeText}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{section.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => handleToggleSectionVisibility(section.id, section.isVisible)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                        section.isVisible
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {section.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {section.isVisible ? 'Visible' : 'Oculto'}
                    </button>

                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setEditingSection(section);
                        setIsSectionModalOpen(true);
                      }}
                    >
                      Editar
                    </Button>

                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Eliminar Sección"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: CARRUSEL HERO ─────────────────────────────────── */}
      {activeSubTab === 'hero' && (
        <div className="space-y-4">
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
                  Configura los titulares, imágenes 16:9 y botones CTA de la cabecera del Storefront.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => {
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
                  });
                  setIsSlideModalOpen(true);
                }}
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
                        onClick={() => {
                          setEditingSlide(slide);
                          setIsSlideModalOpen(true);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-white"
                        title="Editar Slide"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteHeroSlide(slide.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-400"
                        title="Eliminar Slide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: EXPLORADOR DE ESPACIOS (SHOPPABLE LOOKBOOK) ───── */}
      {activeSubTab === 'spaces' && (
        <div className="space-y-6">
          <div
            className="rounded-2xl border p-6 shadow-card space-y-6"
            style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}
          >
            {/* Header & Scene Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--admin-border)' }}>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--admin-text-primary)' }}>
                  Explorador de Espacios con Pines Bidireccionales
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--admin-text-secondary)' }}>
                  Haz clic sobre la foto para fijar un pin relativo (X%, Y%). Selecciona un pin en la lista para iluminarlo en la foto.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedSceneId}
                  onChange={(e) => setSelectedSceneId(e.target.value)}
                  className="border rounded-xl py-1.5 px-3 text-xs font-semibold"
                  style={{
                    backgroundColor: 'var(--admin-bg)',
                    borderColor: 'var(--admin-border)',
                    color: 'var(--admin-text-primary)',
                  }}
                >
                  {cms.spaceScenes.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.title} ({sc.hotspots.length} pines)
                    </option>
                  ))}
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setIsSceneModalOpen(true)}
                >
                  + Nuevo Ambiente
                </Button>
              </div>
            </div>

            {/* Interactive Image Canvas & Hotspots Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Interactive Canvas */}
              <div className="lg:col-span-2 space-y-3">
                <div
                  onClick={handleImageClick}
                  className="relative rounded-xl overflow-hidden border cursor-crosshair group shadow-inner bg-black select-none"
                  style={{ borderColor: 'var(--admin-border)' }}
                >
                  <img
                    src={activeScene?.imageUrl}
                    alt={activeScene?.title}
                    className="w-full h-auto max-h-[500px] object-cover pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity"
                  />

                  {/* Hotspots already saved */}
                  {activeScene?.hotspots.map((hs) => {
                    const isSelected = selectedHotspotId === hs.id;
                    const isHovered = hoveredHotspotId === hs.id;
                    return (
                      <div
                        key={hs.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHotspotId(hs.id);
                        }}
                        onMouseEnter={() => setHoveredHotspotId(hs.id)}
                        onMouseLeave={() => setHoveredHotspotId(null)}
                        className="absolute cursor-pointer transition-all duration-200"
                        style={{
                          left: `${hs.x}%`,
                          top: `${hs.y}%`,
                          transform: 'translate(-50%, -50%)',
                          zIndex: isSelected || isHovered ? 40 : 20,
                        }}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-amber-400 text-black ring-4 ring-amber-400/50 scale-125'
                              : isHovered
                              ? 'bg-white text-black ring-4 ring-white/50 scale-110'
                              : 'bg-white text-slate-800 shadow-md ring-2 ring-black/40'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                        </div>

                        {/* Floating mini badge on hover/select */}
                        {(isHovered || isSelected) && (
                          <div className="absolute left-1/2 -bottom-7 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap shadow-lg pointer-events-none font-bold">
                            {hs.label}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Draft pin placement */}
                  {draftPin && (
                    <div
                      className="absolute z-30"
                      style={{
                        left: `${draftPin.x}%`,
                        top: `${draftPin.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-emerald-400/50 animate-bounce">
                        <Crosshair className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs px-1 text-slate-400">
                  <span>💡 Haz clic en el mueble para ubicar un pin (X%, Y%)</span>
                  {draftPin && (
                    <span className="font-mono text-emerald-400 font-bold">
                      Coordenadas: X={draftPin.x}% Y={draftPin.y}%
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Visual Product Selector & Pin Manager */}
              <div
                className="rounded-xl border p-4 space-y-4"
                style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)' }}
              >
                {draftPin ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="border-b pb-2">
                      <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <Crosshair className="w-3.5 h-3.5" /> Nuevo Pin en Posición Relativa
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Selecciona el artículo visual del catálogo para vincular:
                      </p>
                    </div>

                    <Input
                      label="Etiqueta Personalizada"
                      value={pinLabel}
                      onChange={(e) => setPinLabel(e.target.value)}
                      placeholder="Ej. Sofá Arco — Gris Piedra"
                    />

                    {/* Visual Product Selector with Thumbnails */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Seleccionar Mueble del Catálogo
                      </label>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {STOREFRONT_PRODUCTS.map((prod) => {
                          const isSelected = pinProductId === prod.id;
                          return (
                            <div
                              key={prod.id}
                              onClick={() => {
                                setPinProductId(prod.id);
                                setPinLabel(prod.name);
                              }}
                              className={`p-2 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-all ${
                                isSelected ? 'border-emerald-500 bg-emerald-500/10' : 'hover:border-slate-600'
                              }`}
                              style={{ borderColor: isSelected ? '#10b981' : 'var(--admin-border)' }}
                            >
                              <img
                                src={prod.images[0]}
                                alt={prod.name}
                                className="w-10 h-10 rounded object-cover flex-shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-bold truncate text-slate-200">{prod.name}</p>
                                <p className="text-[10px] text-slate-400">{prod.priceFormatted}</p>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={handleAddHotspotToScene}
                        style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
                      >
                        Fijar Pin al Ambiente
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setDraftPin(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Pines Activos en esta Escena ({activeScene?.hotspots.length || 0})
                    </h4>

                    {activeScene?.hotspots.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">
                        No hay pines fijados. Haz clic sobre la foto para añadir el primero.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                        {activeScene?.hotspots.map((hs) => {
                          const prod = STOREFRONT_PRODUCTS.find((p) => p.id === hs.productId);
                          const isSelected = selectedHotspotId === hs.id;
                          return (
                            <div
                              key={hs.id}
                              onMouseEnter={() => setHoveredHotspotId(hs.id)}
                              onMouseLeave={() => setHoveredHotspotId(null)}
                              onClick={() => setSelectedHotspotId(hs.id)}
                              className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                                isSelected ? 'border-amber-400 bg-amber-400/10' : 'hover:border-slate-600'
                              }`}
                              style={{ borderColor: isSelected ? '#f59e0b' : 'var(--admin-border)' }}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {prod && (
                                  <img
                                    src={prod.images[0]}
                                    alt={prod.name}
                                    className="w-8 h-8 rounded object-cover flex-shrink-0"
                                  />
                                )}
                                <div className="min-w-0">
                                  <p className="text-xs font-bold truncate text-slate-200">{hs.label}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    X: {hs.x}% • Y: {hs.y}%
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteHotspot(hs.id);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-red-400 transition-colors"
                                title="Eliminar Pin"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 5: MENÚS DE NAVEGACIÓN ────────────────────────────── */}
      {activeSubTab === 'menus' && (
        <div className="space-y-4">
          <div
            className="rounded-2xl border p-6 shadow-card space-y-4"
            style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--admin-border)' }}>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--admin-text-primary)' }}>
                  Gestor de Enlaces y Menús de Navegación
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--admin-text-secondary)' }}>
                  Configura los links visibles en la barra superior (Navbar) y el menú desplegable móvil.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setIsMenuModalOpen(true)}
                style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
              >
                + Nuevo Enlace Menú
              </Button>
            </div>

            <div className="space-y-2">
              {cms.navMenus.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border flex items-center justify-between"
                  style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">#{item.order}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-200">{item.label}</p>
                      <p className="text-[10px] text-slate-400">Categoría: {item.targetCategory || item.categoryKey}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        saveNavMenu({
                          ...item,
                          isActive: !item.isActive,
                        })
                      }
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {item.isActive ? 'Activo' : 'Inactivo'}
                    </button>
                    <button
                      onClick={() => deleteNavMenu(item.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 6: COLECCIONES VISUALES ──────────────────────────── */}
      {activeSubTab === 'collections' && (
        <div className="space-y-4">
          <div
            className="rounded-2xl border p-6 shadow-card space-y-4"
            style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--admin-border)' }}>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--admin-text-primary)' }}>
                  Colecciones Visuales ("Cada rincón, una historia")
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--admin-text-secondary)' }}>
                  Tarjetas temáticas en la página principal con imágenes de portada y redirección a categorías.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => {
                  setEditingCollection({
                    id: `col_${Date.now()}`,
                    categoryKey: 'sala',
                    title: 'Nueva Colección',
                    description: 'Descripción breve del ambiente',
                    coverImageUrl: '/images/categories/sala.jpg',
                    order: cms.visualCollections.length + 1,
                    productIds: [],
                    isActive: true,
                  });
                  setIsCollectionModalOpen(true);
                }}
                style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
              >
                + Nueva Colección
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {cms.visualCollections.map((col) => (
                <div
                  key={col.id}
                  className="rounded-xl border overflow-hidden p-3 space-y-2"
                  style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)' }}
                >
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-black relative">
                    <img src={col.coverImageUrl} alt={col.title} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 p-3 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-xs font-bold text-white">{col.title}</p>
                      <p className="text-[10px] text-slate-300 line-clamp-1">{col.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[10px] font-mono text-slate-400">Categoría: {col.categoryKey}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCollection(col);
                        setIsCollectionModalOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: SECCIÓN DINÁMICA TIENDA ──────────────────────── */}
      {isSectionModalOpen && editingSection && (
        <Modal
          isOpen={isSectionModalOpen}
          onClose={() => setIsSectionModalOpen(false)}
          title={editingSection.id ? `Editar Sección: ${editingSection.title}` : 'Nueva Sección del Storefront'}
          size="4xl"
        >
          <form onSubmit={handleSaveSectionModal} className="space-y-6 max-h-[75vh] overflow-y-auto pr-1 admin-scrollbar">
            {/* Form Fields Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Título de la Sección"
                value={editingSection.title}
                onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                placeholder="Ej. Las ofertas especiales de esta semana"
                required
              />

              <Input
                label="Subtítulo Descriptivo"
                value={editingSection.subtitle || ''}
                onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                placeholder="Ej. Piezas artesanales seleccionadas"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-text-secondary)' }}>
                  Tipo de Formato / Layout
                </label>
                <select
                  value={editingSection.layoutType}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, layoutType: e.target.value as SectionLayoutType })
                  }
                  className="w-full border rounded-xl py-2 px-3 text-xs font-medium focus:outline-none"
                  style={{
                    backgroundColor: 'var(--admin-bg)',
                    borderColor: 'var(--admin-border)',
                    color: 'var(--admin-text-primary)',
                  }}
                >
                  <option value="tag_filtered_carousel">Carrusel con Tabs de Hashtags (#cocina, #muebles)</option>
                  <option value="carousel_with_scrollbar">Carrusel continuo con Scrollbar ("Acaba de llegar")</option>
                  <option value="art_gallery_centered">Galería Artística Vertical ("Mi galería de arte")</option>
                  <option value="grid_4_cols">Grid Editorial de 4 Columnas ("Exclusivo Online")</option>
                </select>
              </div>

              <Input
                label="Etiqueta / Badge Superior (Opcional)"
                value={editingSection.badgeText || ''}
                onChange={(e) => setEditingSection({ ...editingSection, badgeText: e.target.value })}
                placeholder="Ej. Oferta Especial, Novedad, Black Friday"
              />
            </div>

            {/* Tags Selector */}
            <div className="space-y-2 pt-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                1. Hashtags Asociados a la Sección
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isChecked = editingSection.tagIds?.includes(tag.id);
                  return (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() => {
                        const current = editingSection.tagIds || [];
                        const updated = isChecked
                          ? current.filter((id) => id !== tag.id)
                          : [...current, tag.id];
                        setEditingSection({ ...editingSection, tagIds: updated });
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                        isChecked ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm' : 'border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                      #{tag.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Granular Product Checkbox List */}
            <div className="space-y-2 pt-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  2. Piezas y Artículos Aplicados ({editingSection.productIds?.length || STOREFRONT_PRODUCTS.length} seleccionados)
                </label>
                <span className="text-[11px] text-slate-500">Marca o desmarca los artículos que deseas mostrar</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 rounded-xl border admin-scrollbar" style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)' }}>
                {STOREFRONT_PRODUCTS.map((prod) => {
                  const isIncluded =
                    !editingSection.productIds ||
                    editingSection.productIds.length === 0 ||
                    editingSection.productIds.includes(prod.id);

                  return (
                    <div
                      key={prod.id}
                      onClick={() => {
                        const current = editingSection.productIds || STOREFRONT_PRODUCTS.map((p) => p.id);
                        const updated = isIncluded
                          ? current.filter((id) => id !== prod.id)
                          : [...current, prod.id];
                        setEditingSection({ ...editingSection, productIds: updated });
                      }}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        isIncluded
                          ? 'border-indigo-500/70 bg-indigo-500/10 text-slate-100'
                          : 'border-slate-800 bg-slate-900/40 text-slate-500 opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isIncluded}
                        onChange={() => {}} // handled by parent div
                        className="rounded accent-indigo-600"
                      />
                      <img src={prod.images[0]} alt={prod.name} className="w-8 h-8 rounded object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-[11px]">{prod.name}</p>
                        <p className="text-[10px] text-slate-400">RD$ {prod.price.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LIVE PREVIEW BOX EN EL MISMO FORM */}
            <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'var(--admin-border)' }}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Previsualización en Vivo de la Sección
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                  Layout: {editingSection.layoutType}
                </span>
              </div>

              {/* Preview Container simulating Storefront canvas */}
              <div className="p-6 rounded-2xl border bg-[#fbf9f6] text-neutral-900 shadow-inner overflow-hidden">
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Header Preview */}
                  <div className="text-center space-y-1">
                    {editingSection.badgeText && (
                      <span className="inline-block text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 bg-neutral-900 text-white rounded-full">
                        {editingSection.badgeText}
                      </span>
                    )}
                    <h3 className="text-xl md:text-2xl font-serif text-neutral-900">
                      {editingSection.title || 'Título de la Sección'}
                    </h3>
                    {editingSection.subtitle && (
                      <p className="text-xs text-neutral-600">{editingSection.subtitle}</p>
                    )}
                  </div>

                  {/* 1. Tag Filtered Carousel Preview */}
                  {editingSection.layoutType === 'tag_filtered_carousel' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
                        {(availableTags.filter((t) => editingSection.tagIds?.includes(t.id)).length > 0
                          ? availableTags.filter((t) => editingSection.tagIds?.includes(t.id))
                          : availableTags.slice(0, 3)
                        ).map((t, idx) => (
                          <span
                            key={t.id}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              idx === 0 ? 'bg-neutral-900 text-white' : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            #{t.name}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {STOREFRONT_PRODUCTS.filter((p) =>
                          !editingSection.productIds || editingSection.productIds.length === 0
                            ? true
                            : editingSection.productIds.includes(p.id)
                        )
                          .slice(0, 3)
                          .map((p) => (
                            <div key={p.id} className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-sm">
                              <img src={p.images[0]} alt={p.name} className="w-full h-24 object-cover rounded-lg mb-2" />
                              <p className="text-xs font-bold text-neutral-900 truncate">{p.name}</p>
                              <p className="text-xs text-neutral-700 font-extrabold">RD$ {p.price.toLocaleString()}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Continuous Scrollbar Carousel Preview */}
                  {editingSection.layoutType === 'carousel_with_scrollbar' && (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {STOREFRONT_PRODUCTS.filter((p) =>
                        !editingSection.productIds || editingSection.productIds.length === 0
                          ? true
                          : editingSection.productIds.includes(p.id)
                      )
                        .slice(0, 4)
                        .map((p) => (
                          <div key={p.id} className="w-40 flex-shrink-0 bg-white p-2.5 rounded-xl border border-stone-200 shadow-sm">
                            <img src={p.images[0]} alt={p.name} className="w-full h-28 object-cover rounded-lg mb-1.5" />
                            <p className="text-xs font-bold truncate">{p.name}</p>
                            <p className="text-xs text-neutral-800 font-bold">RD$ {p.price.toLocaleString()}</p>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* 3. Centered Art Gallery Preview */}
                  {editingSection.layoutType === 'art_gallery_centered' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {STOREFRONT_PRODUCTS.filter((p) =>
                        !editingSection.productIds || editingSection.productIds.length === 0
                          ? true
                          : editingSection.productIds.includes(p.id)
                      )
                        .slice(0, 2)
                        .map((p) => (
                          <div key={p.id} className="bg-gradient-to-b from-stone-200 to-stone-300 p-3 rounded-2xl text-center shadow-md">
                            <img src={p.images[0]} alt={p.name} className="w-full h-36 object-cover rounded-xl shadow-lg mb-2" />
                            <p className="text-xs font-bold text-neutral-900">{p.name}</p>
                            <p className="text-xs font-extrabold text-neutral-900 mt-0.5">RD$ {p.price.toLocaleString()}</p>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* 4. Grid 4 Cols Preview */}
                  {editingSection.layoutType === 'grid_4_cols' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                      {STOREFRONT_PRODUCTS.filter((p) =>
                        !editingSection.productIds || editingSection.productIds.length === 0
                          ? true
                          : editingSection.productIds.includes(p.id)
                      )
                        .slice(0, 4)
                        .map((p) => (
                          <div key={p.id} className="bg-white p-2 rounded-xl border border-stone-200 text-center">
                            <img src={p.images[0]} alt={p.name} className="w-full h-20 object-cover rounded-lg mb-1" />
                            <p className="text-[11px] font-bold truncate">{p.name}</p>
                            <p className="text-[11px] font-extrabold">RD$ {p.price.toLocaleString()}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsSectionModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
              >
                Guardar Sección
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL: HERO SLIDE ────────────────────────────────────── */}
      {isSlideModalOpen && editingSlide && (
        <Modal
          isOpen={isSlideModalOpen}
          onClose={() => setIsSlideModalOpen(false)}
          title="Configurar Banner Hero"
          size="md"
        >
          <form onSubmit={handleSaveSlideModal} className="space-y-4">
            <ImageUploaderDropzone
              label="Imagen de Fondo Hero (16:9, máx 5MB)"
              currentImageUrl={editingSlide.imageUrl}
              onImageSelected={(url) => setEditingSlide({ ...editingSlide, imageUrl: url })}
              aspectRatioRecommendation="16:9"
              maxSizeBytes={5 * 1024 * 1024}
            />

            <Input
              label="Eyebrow (Etiqueta superior)"
              value={editingSlide.eyebrow}
              onChange={(e) => setEditingSlide({ ...editingSlide, eyebrow: e.target.value })}
              required
            />

            <Input
              label="Titular Principal"
              value={editingSlide.headline}
              onChange={(e) => setEditingSlide({ ...editingSlide, headline: e.target.value })}
              required
            />

            <Input
              label="Subtítulo / Bajada"
              value={editingSlide.subline}
              onChange={(e) => setEditingSlide({ ...editingSlide, subline: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Texto Botón CTA"
                value={editingSlide.ctaText}
                onChange={(e) => setEditingSlide({ ...editingSlide, ctaText: e.target.value })}
                required
              />
              <Input
                label="Categoría Redirección"
                value={editingSlide.targetCategory}
                onChange={(e) => setEditingSlide({ ...editingSlide, targetCategory: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsSlideModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
              >
                Guardar Slide
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL: NUEVO AMBIENTE ESPACIOS ──────────────────────── */}
      {isSceneModalOpen && (
        <Modal
          isOpen={isSceneModalOpen}
          onClose={() => setIsSceneModalOpen(false)}
          title="Crear Nuevo Ambiente para el Explorador"
          size="md"
        >
          <form onSubmit={handleSaveSceneModal} className="space-y-4">
            <Input
              label="Nombre del Ambiente"
              placeholder="Ej. Sala de Estar Contemporánea"
              value={sceneFormTitle}
              onChange={(e) => setSceneFormTitle(e.target.value)}
              required
            />

            <Input
              label="Subtítulo"
              placeholder="Ej. Espacio integrado con luz natural y piezas de nogal"
              value={sceneFormSubtitle}
              onChange={(e) => setSceneFormSubtitle(e.target.value)}
            />

            <ImageUploaderDropzone
              label="Fotografía del Ambiente Completo (16:9, máx 5MB)"
              currentImageUrl={sceneFormImage}
              onImageSelected={(url) => setSceneFormImage(url)}
              aspectRatioRecommendation="16:9"
              maxSizeBytes={5 * 1024 * 1024}
            />

            <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsSceneModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
              >
                Crear Ambiente
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL: NUEVO MENÚ DE NAVEGACIÓN ──────────────────────── */}
      {isMenuModalOpen && (
        <Modal
          isOpen={isMenuModalOpen}
          onClose={() => setIsMenuModalOpen(false)}
          title="Crear Enlace de Navegación"
          size="sm"
        >
          <form onSubmit={handleSaveMenuModal} className="space-y-4">
            <Input
              label="Etiqueta del Menú"
              placeholder="Ej. Sala, Comedor, Dormitorio, Novedades"
              value={newMenuLabel}
              onChange={(e) => setNewMenuLabel(e.target.value)}
              required
            />

            <Input
              label="Clave de Categoría de Destino"
              placeholder="Ej. sala, comedor, dormitorio, exterior"
              value={newMenuCategory}
              onChange={(e) => setNewMenuCategory(e.target.value)}
              required
            />

            <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsMenuModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
              >
                Agregar Enlace
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL: COLECCIÓN VISUAL ──────────────────────────────── */}
      {isCollectionModalOpen && editingCollection && (
        <Modal
          isOpen={isCollectionModalOpen}
          onClose={() => setIsCollectionModalOpen(false)}
          title="Editar Colección Visual"
          size="md"
        >
          <form onSubmit={handleSaveCollectionModal} className="space-y-4">
            <Input
              label="Título de la Colección"
              value={editingCollection.title}
              onChange={(e) => setEditingCollection({ ...editingCollection, title: e.target.value })}
              required
            />

            <Input
              label="Descripción"
              value={editingCollection.description}
              onChange={(e) => setEditingCollection({ ...editingCollection, description: e.target.value })}
              required
            />

            <ImageUploaderDropzone
              label="Imagen de Portada de la Colección (máx 5MB)"
              currentImageUrl={editingCollection.coverImageUrl}
              onImageSelected={(url) => setEditingCollection({ ...editingCollection, coverImageUrl: url })}
              maxSizeBytes={5 * 1024 * 1024}
            />

            <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCollectionModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
              >
                Guardar Colección
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
