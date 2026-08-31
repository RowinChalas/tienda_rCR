import React, { useState } from 'react';
import { Modal } from '../../../design-system/molecules/Modal';
import { Button } from '../../../design-system/atoms/Button';
import { Product } from '../../../domain/models/Product';
import { PublicationChecklist } from '../../../domain/validation/PublicationChecklist';
import { CheckCircle2, XCircle, Sparkles, AlertCircle } from 'lucide-react';

export interface PublicationChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onPublish: (productId: string) => Promise<void>;
  onOpenImageEditor: (product: Product) => void;
}

export const PublicationChecklistModal: React.FC<PublicationChecklistModalProps> = ({
  isOpen,
  onClose,
  product,
  onPublish,
  onOpenImageEditor,
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!product) return null;

  const evaluation = PublicationChecklist.evaluate(product);

  const handlePublishClick = async () => {
    try {
      setIsPublishing(true);
      setErrorMessage(null);
      await onPublish(product.id);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al publicar.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Checklist de Publicación de Catálogo (RF-05)"
      description={`Validación estricta de completitud para: ${product.name}`}
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!evaluation.isReadyToPublish}
            isLoading={isPublishing}
            leftIcon={<Sparkles className="w-4 h-4" />}
            onClick={handlePublishClick}
          >
            Publicar en Catálogo Activo
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Barra de progreso de completitud */}
        <div className="bg-surface-900 rounded-xl p-4 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Nivel de Completitud</span>
            <span className="font-bold text-brand-400">{evaluation.progressPct}%</span>
          </div>
          <div className="w-full bg-surface-950 h-2 rounded-full overflow-hidden border border-white/5">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                evaluation.isReadyToPublish
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-brand-600 to-amber-500'
              }`}
              style={{ width: `${evaluation.progressPct}%` }}
            />
          </div>
        </div>

        {/* Estado general */}
        {evaluation.isReadyToPublish ? (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-emerald-200">
              <strong className="font-semibold">¡Listo para publicación!</strong> Todos los requerimientos de calidad visual, dimensiones y costos han sido satisfechos.
            </p>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200">
              <strong className="font-semibold">Publicación bloqueada (EARS-N-02):</strong> Se deben resolver los elementos marcados en rojo antes de exponer el producto a clientes o al Agente de IA.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {/* Lista de Items del Checklist */}
        <div className="space-y-2.5">
          {evaluation.items.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                item.isCompleted
                  ? 'bg-surface-900/60 border-emerald-500/20'
                  : 'bg-rose-950/20 border-rose-500/30'
              }`}
            >
              <div className="flex items-start gap-3">
                {item.isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <p className={`text-xs font-semibold ${item.isCompleted ? 'text-slate-200' : 'text-rose-200'}`}>
                    {item.label}
                  </p>
                  <p className="text-[11px] text-slate-400">{item.helperText}</p>
                </div>
              </div>

              {item.id === 'images' && !item.isCompleted && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    onClose();
                    onOpenImageEditor(product);
                  }}
                >
                  Procesar Foto
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
