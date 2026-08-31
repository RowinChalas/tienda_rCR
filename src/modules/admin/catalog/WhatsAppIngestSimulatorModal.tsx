import React, { useState, useEffect } from 'react';
import { Modal } from '../../../design-system/molecules/Modal';
import { Button } from '../../../design-system/atoms/Button';
import { Badge } from '../../../design-system/atoms/Badge';
import { Input } from '../../../design-system/atoms/Input';
import { Supplier } from '../../../domain/models/Product';
import { services } from '../../../services/ServiceContainer';
import { WhatsAppIngestionParser, WhatsAppParsedProductDraft } from '../../../domain/ingestion/WhatsAppIngestionParser';
import {
  MessageSquare,
  Sparkles,
  Camera,
} from 'lucide-react';

export interface WhatsAppIngestSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: () => void;
}

const PRESET_MESSAGES = [
  {
    title: 'Mesa de Centro Nogal & Travertino',
    caption: 'Mesa de Centro Nogal y Mármol Travertino\nCosto taller: RD$ 11,000\nDimensiones: 110x45x65 cm\nMadera de nogal dominicano y piedra travertino pulida',
    photoUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Sofá Modular Cloud Velvet Marfil',
    caption: 'Sofá Modular Cloud 3 Cuerpos en Terciopelo\nCosto: 28k\nMedidas: 240x85x110 cm\nEstructura de eucalipto seco y espuma 35kg',
    photoUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Comedor Imperial Roble 8 Sillas',
    caption: 'Juego de Comedor Roble Ahumado con 8 Sillas\nCosto base: 36,000\nMedidas: 220x78x105 cm\nRoble macizo dominicano con acabado al aceite natural',
    photoUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
  },
];

export const WhatsAppIngestSimulatorModal: React.FC<WhatsAppIngestSimulatorModalProps> = ({
  isOpen,
  onClose,
  onProductCreated,
}) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [captionText, setCaptionText] = useState(PRESET_MESSAGES[0].caption);
  const [photoUrl, setPhotoUrl] = useState(PRESET_MESSAGES[0].photoUrl);
  const [parsedDraft, setParsedDraft] = useState<WhatsAppParsedProductDraft>(
    WhatsAppIngestionParser.parse(PRESET_MESSAGES[0].caption)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    services.supplierRepo.getAll().then((sups) => {
      setSuppliers(sups);
      if (sups.length > 0) setSelectedSupplierId(sups[0].id);
    });
  }, []);

  const handleTextChange = (text: string) => {
    setCaptionText(text);
    const parsed = WhatsAppIngestionParser.parse(text);
    setParsedDraft(parsed);
  };

  const handleSelectPreset = (index: number) => {
    const preset = PRESET_MESSAGES[index];
    setCaptionText(preset.caption);
    setPhotoUrl(preset.photoUrl);
    const parsed = WhatsAppIngestionParser.parse(preset.caption);
    setParsedDraft(parsed);
  };

  const handleIngest = async () => {
    if (!selectedSupplierId || parsedDraft.baseCost <= 0) return;
    setIsSubmitting(true);

    const sup = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];

    await services.productRepo.createDraft({
      supplierId: sup.id,
      supplierName: sup.businessName,
      name: parsedDraft.name,
      category: parsedDraft.category,
      status: 'borrador',
      suggestedPrice: parsedDraft.suggestedPrice,
      floorPrice: parsedDraft.floorPrice,
      dimensions: {
        widthCm: parsedDraft.dimensions.widthCm,
        heightCm: parsedDraft.dimensions.heightCm,
        depthCm: parsedDraft.dimensions.depthCm,
      },
      images: [
        {
          id: `img_wa_${Date.now()}`,
          url: photoUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
          isPrimary: true,
          isBackgroundRemoved: false, // Entra cruda para curaduría
          isCropped1x1: false,
          originalFileName: `whatsapp_inbound_${Date.now()}.jpg`,
        },
      ],
      supplierCost: {
        productId: '',
        baseCost: parsedDraft.baseCost,
        updatedAt: new Date().toISOString(),
      },
      stockQuantity: 2,
    });

    setIsSubmitting(false);
    setSuccessMessage(true);
    setTimeout(() => {
      setSuccessMessage(false);
      onProductCreated();
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Simulador de Ingesta Automática WhatsApp (EARS-E-03 / RF-01)"
      description="Prueba la recepción de capturas de talleres aliados y parseo instantáneo de pre-productos"
      maxWidth="2xl"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={parsedDraft.baseCost <= 0}
            leftIcon={<Sparkles className="w-4 h-4" />}
            onClick={handleIngest}
            style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
          >
            {successMessage ? '¡Ingestado con Éxito!' : 'Ingestar en Columna Crudo'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Presets rápidos */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--admin-text-secondary)' }}>
            Plantillas de Mensaje WhatsApp de Proveedor
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_MESSAGES.map((preset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectPreset(i)}
                className="p-2.5 rounded-xl border text-left text-xs font-semibold hover:border-brand-500/50 transition-colors"
                style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)', color: 'var(--admin-text-primary)' }}
              >
                <span className="line-clamp-1">{preset.title}</span>
                <span className="text-[10px] font-normal block mt-0.5 text-emerald-400">
                  Cargar mensaje
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Taller Remitente */}
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--admin-text-secondary)' }}>
            Taller / Proveedor Remitente
          </label>
          <select
            value={selectedSupplierId}
            onChange={(e) => setSelectedSupplierId(e.target.value)}
            className="w-full border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            style={{ backgroundColor: 'var(--admin-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text-primary)' }}
          >
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.businessName} ({sup.contactWhatsapp}) — {sup.geoZone}
              </option>
            ))}
          </select>
        </div>

        {/* Contenido del Mensaje de WhatsApp */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--admin-text-secondary)' }}>
              <MessageSquare className="w-3.5 h-3.5 text-brand-500" />
              Texto / Caption Enviado por WhatsApp
            </label>
            <textarea
              value={captionText}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={4}
              className="w-full border rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none font-mono"
              style={{ backgroundColor: 'var(--admin-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text-primary)' }}
              placeholder="Escriba o pegue el mensaje de WhatsApp..."
            />

            <Input
              label="URL Foto del Mueble (Crudo)"
              value={photoUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhotoUrl(e.target.value)}
              leftIcon={<Camera className="w-3.5 h-3.5" />}
            />
          </div>

          {/* Vista previa parseada en tiempo real */}
          <div
            className="rounded-xl border p-3.5 space-y-3 shadow-inner"
            style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)' }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--admin-border)' }}>
              <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--admin-text-primary)' }}>
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                Extracción Automática (EARS-E-04)
              </span>
              <Badge variant="gold" size="sm">
                Confianza: {(parsedDraft.confidenceScore * 100).toFixed(0)}%
              </Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--admin-text-secondary)' }}>Nombre Comercial:</span>
                <p className="font-bold" style={{ color: 'var(--admin-text-primary)' }}>{parsedDraft.name}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--admin-text-secondary)' }}>Categoría:</span>
                <Badge variant="default" size="sm">{parsedDraft.category}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t" style={{ borderColor: 'var(--admin-border)' }}>
                <div>
                  <span className="text-[9px] uppercase font-bold" style={{ color: 'var(--admin-text-secondary)' }}>Costo Base</span>
                  <p className="font-mono font-bold" style={{ color: 'var(--admin-text-primary)' }}>${parsedDraft.baseCost.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold" style={{ color: 'var(--admin-text-secondary)' }}>Sugerido (+35%)</span>
                  <p className="font-mono font-bold text-brand-500">${parsedDraft.suggestedPrice.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold" style={{ color: 'var(--admin-text-secondary)' }}>Piso (+18%)</span>
                  <p className="font-mono font-bold text-amber-500">${parsedDraft.floorPrice.toLocaleString()}</p>
                </div>
              </div>

              <div className="pt-1">
                <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--admin-text-secondary)' }}>Dimensiones:</span>
                <p className="font-mono text-[11px]" style={{ color: 'var(--admin-text-primary)' }}>
                  {parsedDraft.dimensions.widthCm} x {parsedDraft.dimensions.heightCm} x {parsedDraft.dimensions.depthCm} cm
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
