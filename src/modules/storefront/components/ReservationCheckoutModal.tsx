import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle2, ShieldCheck, Clock, MessageCircle, Scan } from 'lucide-react';
import { StorefrontProduct } from '../data/storefrontData';
import { services } from '../../../services/ServiceContainer';
import { ReceiptOcrEngine, DominicanBank } from '../../../domain/ocr/ReceiptOcrEngine';

export interface ReservationCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: StorefrontProduct | null;
}

export const ReservationCheckoutModal: React.FC<ReservationCheckoutModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+1 (809) ');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<'cobro_destino' | 'contacto_directo'>('cobro_destino');
  const [depositAmount, setDepositAmount] = useState<number>(5000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(1200); // 20 minutos

  // OCR comprobante
  const [voucherBank, setVoucherBank] = useState<DominicanBank>('banco_popular');
  const [voucherRef, setVoucherRef] = useState('');
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);

  useEffect(() => {
    if (product) {
      // Depósito calculado sugerido: 10% del producto o mínimo $3,000
      const calc = Math.max(3000, Math.round(product.price * 0.1));
      setDepositAmount(calc);
    }
  }, [product]);

  useEffect(() => {
    if (!createdOrderNumber) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [createdOrderNumber]);

  if (!isOpen || !product) return null;

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSimulateOcr = async (bank: DominicanBank) => {
    setVoucherBank(bank);
    setIsOcrProcessing(true);
    await new Promise((r) => setTimeout(r, 600));

    const sampleText = ReceiptOcrEngine.getSampleVoucherText(
      bank,
      deliveryMode === 'cobro_destino' ? depositAmount : product.price,
      `BPD-${Math.floor(10000000 + Math.random() * 90000000)}`
    );

    const parsed = ReceiptOcrEngine.parseReceiptText(sampleText);
    setVoucherRef(parsed.referenceNumber);
    setIsOcrProcessing(false);
    setOcrSuccess(true);
  };

  const handleSubmitReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !deliveryAddress) return;

    setIsSubmitting(true);

    const isCobroDestino = deliveryMode === 'cobro_destino';
    const orderNum = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = await services.orderRepo.create({
      orderNumber: orderNum,
      customerId: `cust_${Date.now()}`,
      customerName,
      customerPhone,
      supplierId: 'sup_central_01',
      supplierName: 'Fábrica Maderas Nobles del Cibao',
      state: 'validacion_inventario',
      billingMode: 'centralizada',
      deliveryMode: isCobroDestino ? 'cobro_destino' : 'contacto_directo',
      depositRequired: isCobroDestino,
      depositAmount: isCobroDestino ? depositAmount : 0,
      depositPaid: Boolean(voucherRef),
      totalAmount: product.price,
      totalCostBase: Math.round(product.price * 0.7),
      grossMarginAmount: Math.round(product.price * 0.3),
      softLockExpiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
      items: [
        {
          id: `item_${Date.now()}`,
          orderId: '',
          productId: product.id,
          productName: product.name,
          productImage: product.images[0],
          quantity: 1,
          unitCostBase: Math.round(product.price * 0.7),
          unitPriceFinal: product.price,
          subtotal: product.price,
        },
      ],
      deliveryAddress,
    });

    setIsSubmitting(false);
    setCreatedOrderNumber(newOrder.orderNumber);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl z-10 p-6 md:p-8"
        style={{
          background: 'var(--sf-bg)',
          border: '1px solid var(--sf-stone)',
          color: 'var(--sf-charcoal)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-black/5 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" style={{ color: 'var(--sf-charcoal-60)' }} />
        </button>

        {createdOrderNumber ? (
          /* Estado de éxito con Soft Lock */
          <div className="text-center py-6 space-y-6">
            <div
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
              style={{ background: 'var(--sf-madera-pale)', color: 'var(--sf-madera)' }}
            >
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="sf-label">Reserva Confirmada</span>
              <h2
                style={{
                  fontFamily: 'var(--font-editorial)',
                  fontSize: '2rem',
                  fontWeight: 400,
                  lineHeight: 1.1,
                }}
              >
                Orden #{createdOrderNumber}
              </h2>
              <p
                className="text-sm max-w-md mx-auto"
                style={{ color: 'var(--sf-charcoal-60)', fontFamily: 'var(--font-ui)' }}
              >
                Hemos reservado <strong>{product.name}</strong> exclusivamente para ti.
              </p>
            </div>

            {/* Temporizador Soft Lock Activo */}
            <div
              className="p-4 rounded-xl border flex items-center justify-between gap-4 max-w-md mx-auto"
              style={{
                background: 'rgba(139, 111, 71, 0.08)',
                borderColor: 'var(--sf-madera-light)',
              }}
            >
              <div className="flex items-center gap-3 text-left">
                <Clock className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--sf-madera)' }} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--sf-madera)' }}>
                    Soft Lock de Reserva Activo (EARS-E-01)
                  </p>
                  <p className="text-xs" style={{ color: 'var(--sf-charcoal-60)' }}>
                    El taller está confirmando tu pieza.
                  </p>
                </div>
              </div>
              <span
                className="font-mono text-xl font-bold px-3 py-1 rounded"
                style={{ background: 'var(--sf-charcoal)', color: 'white' }}
              >
                {formatTimer(remainingSeconds)}
              </span>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`https://wa.me/18094000000?text=${encodeURIComponent(
                  `Hola, acabo de realizar la reserva de mi orden ${createdOrderNumber} (${product.name}). Mi nombre es ${customerName}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="sf-btn-primary justify-center"
              >
                <MessageCircle className="w-4 h-4" />
                Seguimiento en WhatsApp
              </a>
              <button onClick={onClose} className="sf-btn-secondary justify-center">
                Cerrar y seguir navegando
              </button>
            </div>
          </div>
        ) : (
          /* Formulario de Checkout */
          <form onSubmit={handleSubmitReservation} className="space-y-6">
            <div>
              <span className="sf-label mb-1">Reserva Just-in-Time</span>
              <h2
                style={{
                  fontFamily: 'var(--font-editorial)',
                  fontSize: '1.75rem',
                  fontWeight: 400,
                  lineHeight: 1.15,
                }}
              >
                Apartar pieza de taller
              </h2>
              <p
                className="text-xs mt-1"
                style={{ color: 'var(--sf-charcoal-60)', fontFamily: 'var(--font-ui)' }}
              >
                Completa tus datos para activar la protección de inventario por 20 minutos.
              </p>
            </div>

            {/* Resumen del producto */}
            <div
              className="flex items-center gap-4 p-3.5 rounded-lg border"
              style={{ background: 'var(--sf-bg-alt)', borderColor: 'var(--sf-stone)' }}
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-14 h-14 rounded object-cover border"
                style={{ borderColor: 'var(--sf-stone)' }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{product.name}</p>
                <p className="text-xs font-mono font-bold" style={{ color: 'var(--sf-madera)' }}>
                  {product.priceFormatted}
                </p>
              </div>
            </div>

            {/* Datos del Cliente */}
            <div className="space-y-3">
              <div>
                <label className="sf-label mb-1 block">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Arq. María Fernández"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded border outline-none focus:ring-1 focus:ring-[var(--sf-madera)]"
                  style={{
                    background: 'var(--sf-bg)',
                    borderColor: 'var(--sf-stone-strong)',
                    color: 'var(--sf-charcoal)',
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="sf-label mb-1 block">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono rounded border outline-none focus:ring-1 focus:ring-[var(--sf-madera)]"
                    style={{
                      background: 'var(--sf-bg)',
                      borderColor: 'var(--sf-stone-strong)',
                      color: 'var(--sf-charcoal)',
                    }}
                  />
                </div>

                <div>
                  <label className="sf-label mb-1 block">Dirección de Entrega</label>
                  <input
                    type="text"
                    required
                    placeholder="Sector, calle y no. de apt"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded border outline-none focus:ring-1 focus:ring-[var(--sf-madera)]"
                    style={{
                      background: 'var(--sf-bg)',
                      borderColor: 'var(--sf-stone-strong)',
                      color: 'var(--sf-charcoal)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Modalidad de Pago y Despacho */}
            <div className="space-y-2">
              <label className="sf-label block">Modalidad de Despacho (EARS-S-01)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                    deliveryMode === 'cobro_destino'
                      ? 'border-[var(--sf-charcoal)] bg-black/5'
                      : 'border-[var(--sf-stone-strong)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="deliveryMode"
                      checked={deliveryMode === 'cobro_destino'}
                      onChange={() => setDeliveryMode('cobro_destino')}
                      className="accent-[var(--sf-charcoal)]"
                    />
                    <span className="text-xs font-bold">Cobro en Destino</span>
                  </div>
                  <p className="text-[11px] mt-1.5" style={{ color: 'var(--sf-charcoal-60)' }}>
                    Depósito de seguridad de ${depositAmount.toLocaleString()} DOP. Saldo restante contra entrega.
                  </p>
                </label>

                <label
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                    deliveryMode === 'contacto_directo'
                      ? 'border-[var(--sf-charcoal)] bg-black/5'
                      : 'border-[var(--sf-stone-strong)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="deliveryMode"
                      checked={deliveryMode === 'contacto_directo'}
                      onChange={() => setDeliveryMode('contacto_directo')}
                      className="accent-[var(--sf-charcoal)]"
                    />
                    <span className="text-xs font-bold">Pago Total Inmediato</span>
                  </div>
                  <p className="text-[11px] mt-1.5" style={{ color: 'var(--sf-charcoal-60)' }}>
                    Transferencia bancaria por el valor total ({product.priceFormatted}).
                  </p>
                </label>
              </div>
            </div>

            {/* Adjuntar Comprobante Bancario con OCR */}
            <div
              className="p-4 rounded-lg border space-y-3"
              style={{ background: 'var(--sf-bg-alt)', borderColor: 'var(--sf-stone)' }}
            >
              <div className="flex items-center justify-between">
                <span className="sf-label flex items-center gap-1.5">
                  <Scan className="w-3.5 h-3.5" style={{ color: 'var(--sf-madera)' }} />
                  Comprobante Bancario (Opcional — OCR Rápido)
                </span>
                {ocrSuccess && (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Validado
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'banco_popular', label: 'BPD' },
                  { id: 'banco_bhd', label: 'BHD' },
                  { id: 'banreservas', label: 'Banreservas' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSimulateOcr(b.id as DominicanBank)}
                    disabled={isOcrProcessing}
                    className="px-2.5 py-1 text-xs rounded border hover:bg-white transition-colors"
                    style={{
                      borderColor: voucherBank === b.id && ocrSuccess ? 'var(--sf-charcoal)' : 'var(--sf-stone-strong)',
                    }}
                  >
                    Simular voucher {b.label}
                  </button>
                ))}
              </div>

              {voucherRef && (
                <div className="text-xs font-mono p-2 rounded bg-white border border-[var(--sf-stone)]">
                  Referencia extraída: <strong>{voucherRef}</strong>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="sf-btn-primary w-full justify-center py-3.5"
            >
              <ShieldCheck className="w-4 h-4" />
              {isSubmitting
                ? 'Procesando reserva...'
                : `Confirmar Reserva & Proteger Pieza (20 min)`}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
