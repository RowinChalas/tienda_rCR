import React, { useState } from 'react';
import { Modal } from '../../../design-system/molecules/Modal';
import { Button } from '../../../design-system/atoms/Button';
import { Product } from '../../../domain/models/Product';
import { Crop, Wand2, CheckCircle2 } from 'lucide-react';

export interface ImageProcessorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onImageProcessed: (productId: string, imageId: string, options: { crop1x1: boolean; removeBg: boolean }) => Promise<void>;
}

export const ImageProcessorModal: React.FC<ImageProcessorModalProps> = ({
  isOpen,
  onClose,
  product,
  onImageProcessed,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [crop1x1, setCrop1x1] = useState(true);
  const [removeBg, setRemoveBg] = useState(true);
  const [processedPreview, setProcessedPreview] = useState(false);

  if (!product || product.images.length === 0) return null;
  const primaryImg = product.images[0];

  const handleApplyProcessing = async () => {
    setIsProcessing(true);
    // Simular procesamiento con IA / canvas
    await new Promise((r) => setTimeout(r, 600));
    await onImageProcessed(product.id, primaryImg.id, { crop1x1, removeBg });
    setIsProcessing(false);
    setProcessedPreview(true);
    setTimeout(() => {
      onClose();
      setProcessedPreview(false);
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Estudio de Procesamiento de Imagen (RF-04)"
      description={`Curaduría y estandarización para: ${product.name}`}
      maxWidth="2xl"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={isProcessing}
            leftIcon={<Wand2 className="w-4 h-4" />}
            onClick={handleApplyProcessing}
          >
            {processedPreview ? '¡Procesada!' : 'Aplicar Procesamiento'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Imagen Original */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Original (Captura / WhatsApp)
            </span>
            <div className="aspect-square rounded-xl overflow-hidden bg-surface-900 border border-white/10 relative">
              <img
                src={primaryImg.url}
                alt="Original"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded bg-black/60 text-slate-300">
                Crudo
              </span>
            </div>
          </div>

          {/* Vista Previa Procesada */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider block flex items-center justify-between">
              <span>Resultado Estandarizado</span>
              {primaryImg.isBackgroundRemoved && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-normal">
                  <CheckCircle2 className="w-3 h-3" /> Listo
                </span>
              )}
            </span>
            <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-surface-800 to-surface-900 border-2 border-brand-500/40 relative flex items-center justify-center p-3 shadow-inner">
              <img
                src={primaryImg.url}
                alt="Procesada Preview"
                className={`max-h-full max-w-full object-contain transition-all duration-300 ${
                  removeBg ? 'drop-shadow-2xl brightness-105' : 'object-cover w-full h-full'
                }`}
              />
              <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                1:1 Estudio
              </span>
            </div>
          </div>
        </div>

        {/* Opciones de procesamiento */}
        <div className="bg-surface-900/80 rounded-xl p-4 border border-white/10 space-y-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider block">
            Acciones de IA y Optimización
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/60 border border-white/5 cursor-pointer hover:border-brand-500/40 transition-colors">
              <input
                type="checkbox"
                checked={removeBg}
                onChange={(e) => setRemoveBg(e.target.checked)}
                className="w-4 h-4 rounded text-brand-500 focus:ring-brand-400 bg-surface-950 border-white/20"
              />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-brand-400" />
                  Remover Fondo Automático
                </p>
                <p className="text-[11px] text-slate-400">Aísla el mueble con fondo blanco/estudio.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/60 border border-white/5 cursor-pointer hover:border-brand-500/40 transition-colors">
              <input
                type="checkbox"
                checked={crop1x1}
                onChange={(e) => setCrop1x1(e.target.checked)}
                className="w-4 h-4 rounded text-brand-500 focus:ring-brand-400 bg-surface-950 border-white/20"
              />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Crop className="w-3.5 h-3.5 text-brand-400" />
                  Recorte Cuadrado 1:1
                </p>
                <p className="text-[11px] text-slate-400">Formato homogéneo para catálogo y WhatsApp.</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
};
