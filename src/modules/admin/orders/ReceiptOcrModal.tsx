import React, { useState } from 'react';
import { Modal } from '../../../design-system/molecules/Modal';
import { Button } from '../../../design-system/atoms/Button';
import { Badge } from '../../../design-system/atoms/Badge';
import { Input } from '../../../design-system/atoms/Input';
import { Order } from '../../../domain/models/Order';
import { ReceiptOcrEngine, ReceiptOcrResult, ReceiptValidationStatus, DominicanBank } from '../../../domain/ocr/ReceiptOcrEngine';
import {
  Scan,
  CheckCircle2,
  AlertTriangle,
  Building,
  Hash,
  DollarSign,
  Calendar,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export interface ReceiptOcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onReceiptApproved: (
    orderId: string,
    validationData: {
      referenceNumber: string;
      amountPaid: number;
      bankName: string;
      isDeposit: boolean;
    }
  ) => Promise<void>;
}

export const ReceiptOcrModal: React.FC<ReceiptOcrModalProps> = ({
  isOpen,
  onClose,
  order,
  onReceiptApproved,
}) => {
  const [selectedBank, setSelectedBank] = useState<DominicanBank>('banco_popular');
  const [isScanning, setIsScanning] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [ocrResult, setOcrResult] = useState<ReceiptOcrResult | null>(null);
  const [validation, setValidation] = useState<ReceiptValidationStatus | null>(null);

  // Campos editables
  const [refNumber, setRefNumber] = useState('');
  const [extractedAmount, setExtractedAmount] = useState<number>(0);
  const [bankDisplayName, setBankDisplayName] = useState('');

  if (!order) return null;

  const targetAmount = order.depositRequired && !order.depositPaid
    ? order.depositAmount
    : order.totalAmount;
  const isDepositOnly = order.depositRequired && !order.depositPaid;

  const handleSimulateScan = async (bank: DominicanBank) => {
    setSelectedBank(bank);
    setIsScanning(true);
    setOcrResult(null);
    setValidation(null);

    // Simulación de escaneo visual con temporizador realista
    await new Promise((r) => setTimeout(r, 700));

    const sampleText = ReceiptOcrEngine.getSampleVoucherText(
      bank,
      targetAmount,
      `BPD-${Math.floor(10000000 + Math.random() * 90000000)}`
    );

    const parsed = ReceiptOcrEngine.parseReceiptText(sampleText);
    const val = ReceiptOcrEngine.validateReceiptAgainstExpected(parsed, targetAmount, isDepositOnly);

    setOcrResult(parsed);
    setValidation(val);
    setRefNumber(parsed.referenceNumber);
    setExtractedAmount(parsed.amount);
    setBankDisplayName(parsed.bankDisplayName);
    setIsScanning(false);
  };

  const handleApprove = async () => {
    if (!refNumber || extractedAmount <= 0) return;
    setIsApproving(true);
    await onReceiptApproved(order.id, {
      referenceNumber: refNumber,
      amountPaid: extractedAmount,
      bankName: bankDisplayName || 'Banco Popular Dominicano',
      isDeposit: isDepositOnly,
    });
    setIsApproving(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Validación OCR de Comprobante Bancario"
      description={`Extracción inteligente de comprobante para orden #${order.orderNumber}`}
      maxWidth="2xl"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={isApproving}
            disabled={!ocrResult || !refNumber || extractedAmount <= 0}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            onClick={handleApprove}
            style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
          >
            {isDepositOnly ? 'Aprobar Depósito & Despacho' : 'Aprobar Pago Total'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Banner de orden y monto esperado */}
        <div
          className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)' }}
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--admin-text-secondary)' }}>
              Cliente: {order.customerName}
            </span>
            <p className="text-xs font-semibold" style={{ color: 'var(--admin-text-primary)' }}>
              {order.items[0]?.productName}
            </p>
          </div>
          <div className="text-right sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--admin-text-secondary)' }}>
              {isDepositOnly ? 'Depósito de Seguridad Requerido' : 'Monto Total de Orden'}
            </span>
            <p className="text-base font-extrabold font-mono text-emerald-500">
              ${targetAmount.toLocaleString()} DOP
            </p>
          </div>
        </div>

        {/* Selector de comprobante simulado (Presets bancos dominicanos) */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--admin-text-secondary)' }}>
            1. Seleccionar o Cargar Comprobante Bancario
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'banco_popular', label: 'Banco Popular', color: 'text-blue-400' },
              { id: 'banco_bhd', label: 'Banco BHD', color: 'text-emerald-400' },
              { id: 'banreservas', label: 'Banreservas', color: 'text-red-400' },
            ].map((bank) => (
              <button
                key={bank.id}
                type="button"
                onClick={() => handleSimulateScan(bank.id as DominicanBank)}
                disabled={isScanning}
                className={`p-3 rounded-xl border text-left transition-all text-xs font-semibold flex flex-col gap-1 ${
                  selectedBank === bank.id && ocrResult
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'hover:border-brand-500/50'
                }`}
                style={{
                  backgroundColor: selectedBank === bank.id && ocrResult ? undefined : 'var(--admin-card-alt)',
                  borderColor: selectedBank === bank.id && ocrResult ? 'var(--admin-accent)' : 'var(--admin-border)',
                  color: 'var(--admin-text-primary)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className={bank.color}>{bank.label}</span>
                  <Scan className="w-3.5 h-3.5 opacity-60" />
                </div>
                <span className="text-[10px] font-normal" style={{ color: 'var(--admin-text-secondary)' }}>
                  Escanear Voucher
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Visor OCR / Escáner */}
        <div
          className="rounded-2xl border p-4 relative overflow-hidden"
          style={{ backgroundColor: 'var(--admin-card)', borderColor: 'var(--admin-border)' }}
        >
          {isScanning ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
              <p className="text-xs font-bold animate-pulse" style={{ color: 'var(--admin-text-primary)' }}>
                Analizando comprobante bancario con OCR (EARS-O-02)...
              </p>
              <p className="text-[11px]" style={{ color: 'var(--admin-text-secondary)' }}>
                Extrayendo número de autorización, monto y cuenta destino
              </p>
            </div>
          ) : ocrResult ? (
            <div className="space-y-4">
              {/* Encabezado del resultado OCR */}
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--admin-border)' }}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold" style={{ color: 'var(--admin-text-primary)' }}>
                    Extracción OCR Exitosa
                  </span>
                  <Badge variant="gold" size="sm">
                    Confianza: {(ocrResult.confidenceScore * 100).toFixed(0)}%
                  </Badge>
                </div>

                {validation && (
                  <Badge
                    variant={
                      validation.status === 'aprobado_exacto'
                        ? 'published'
                        : validation.status === 'aprobado_excedente'
                        ? 'gold'
                        : 'soldout'
                    }
                    size="sm"
                  >
                    {validation.status === 'aprobado_exacto'
                      ? '✓ Monto Exacto'
                      : validation.status === 'aprobado_excedente'
                      ? '✓ Excedente Válido'
                      : '⚠ Monto Insuficiente'}
                  </Badge>
                )}
              </div>

              {/* Formulario con campos extraídos para validación y ajuste manual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Banco Emisor Detectado"
                  value={bankDisplayName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBankDisplayName(e.target.value)}
                  leftIcon={<Building className="w-3.5 h-3.5" />}
                />

                <Input
                  label="No. de Referencia / Transacción"
                  value={refNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRefNumber(e.target.value)}
                  leftIcon={<Hash className="w-3.5 h-3.5" />}
                />

                <Input
                  label="Monto Extraído ($ DOP)"
                  type="number"
                  value={extractedAmount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const val = Number(e.target.value) || 0;
                    setExtractedAmount(val);
                    if (ocrResult) {
                      setValidation(
                        ReceiptOcrEngine.validateReceiptAgainstExpected(
                          { ...ocrResult, amount: val },
                          targetAmount,
                          isDepositOnly
                        )
                      );
                    }
                  }}
                  leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                />

                <Input
                  label="Fecha de Transferencia"
                  value={ocrResult.transferDate || 'Hoy'}
                  disabled
                  leftIcon={<Calendar className="w-3.5 h-3.5" />}
                />
              </div>

              {/* Mensaje de validación */}
              {validation && (
                <div
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    validation.isValid
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {validation.isValid ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{validation.message}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center space-y-2">
              <Scan className="w-8 h-8 text-brand-400 mx-auto opacity-50" />
              <p className="text-xs font-semibold" style={{ color: 'var(--admin-text-primary)' }}>
                Seleccione un comprobante arriba para iniciar la extracción automática con OCR
              </p>
              <p className="text-[11px]" style={{ color: 'var(--admin-text-secondary)' }}>
                Se extraerá la referencia bancaria y se validará contra el depósito requerido de ${targetAmount.toLocaleString()} DOP
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
