import React, { useState, useEffect } from 'react';
import { Order, OrderState } from '../../../domain/models/Order';
import { services } from '../../../services/ServiceContainer';
import { Button } from '../../../design-system/atoms/Button';
import { Badge } from '../../../design-system/atoms/Badge';
import { SoftLockCountdown } from '../../../design-system/molecules/SoftLockCountdown';
import { Modal } from '../../../design-system/molecules/Modal';
import { ReceiptOcrModal } from './ReceiptOcrModal';
import {
  Package,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  Scan,
} from 'lucide-react';

export const OrdersManagementView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [ocrTargetOrder, setOcrTargetOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadOrders = async () => {
    const list = await services.orderRepo.getAll();
    setOrders(list);
    if (selectedOrder) {
      const updated = list.find((o) => o.id === selectedOrder.id) || null;
      setSelectedOrder(updated);
    }
  };

  useEffect(() => {
    loadOrders();
    const handleOrdersChange = () => loadOrders();
    window.addEventListener('barversuit_orders_changed', handleOrdersChange);
    return () => window.removeEventListener('barversuit_orders_changed', handleOrdersChange);
  }, []);

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setActionError(null);
    setIsDetailOpen(true);
  };

  const handleTransitionState = async (newState: OrderState, note: string) => {
    if (!selectedOrder) return;
    try {
      setIsProcessingAction(true);
      setActionError(null);
      await services.orderRepo.updateState(selectedOrder.id, newState, 'admin', note);
      await loadOrders();
    } catch (err: any) {
      setActionError(err.message || 'Error al actualizar el estado de la orden.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleToggleBilling = async (mode: 'centralizada' | 'delegada') => {
    if (!selectedOrder) return;
    await services.orderRepo.toggleBillingMode(selectedOrder.id, mode);
    await loadOrders();
  };

  const handleReceiptApproved = async (
    orderId: string,
    validationData: {
      referenceNumber: string;
      amountPaid: number;
      bankName: string;
      isDeposit: boolean;
    }
  ) => {
    if (validationData.isDeposit) {
      await services.orderRepo.recordDepositPayment(orderId, validationData.referenceNumber);
    } else {
      await services.orderRepo.updateState(
        orderId,
        'orden_despacho',
        'admin',
        `Pago completo ($${validationData.amountPaid.toLocaleString()} DOP) validado vía OCR (${validationData.bankName} - Ref: ${validationData.referenceNumber}).`
      );
    }
    await loadOrders();
  };

  const stateBadges: Record<OrderState, { variant: any; label: string }> = {
    consulta: { variant: 'default', label: 'Consulta' },
    intencion_compra: { variant: 'review', label: 'Intención de Compra' },
    validacion_inventario: { variant: 'review', label: 'Validación Stock (Ping)' },
    pendiente_pago: { variant: 'warning', label: 'Pendiente de Pago' },
    orden_despacho: { variant: 'dispatch', label: 'Orden de Despacho' },
    en_ruta: { variant: 'dispatch', label: 'En Ruta de Entrega' },
    entregado_pendiente_conciliacion: { variant: 'gold', label: 'Entregado (Por Conciliar)' },
    conciliado: { variant: 'success', label: 'Liquidado / Conciliado' },
    cancelado_agotado: { variant: 'soldout', label: 'Cancelado / Agotado' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold font-editorial tracking-tight flex items-center gap-2.5" style={{ color: 'var(--admin-text-primary)' }}>
          Gestión de Órdenes & Despacho Just-in-Time
          <Badge variant="gold" size="sm">
            Épica D & E
          </Badge>
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--admin-text-secondary)' }}>
          Supervisión del ciclo de vida, Soft Locks con temporizador, Facturación Centralizada vs Delegada y Depósitos de Seguridad.
        </p>
      </div>

      {/* Orders Table */}
      <div
        className="rounded-2xl border overflow-hidden shadow-card"
        style={{
          backgroundColor: 'var(--admin-card)',
          borderColor: 'var(--admin-border)',
          boxShadow: 'var(--admin-shadow)',
          backdropFilter: 'var(--admin-backdrop)',
          WebkitBackdropFilter: 'var(--admin-backdrop)',
        }}
      >
        <div className="p-4 px-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--admin-border)' }}>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--admin-text-primary)' }}>Órdenes Registradas</h3>
          </div>
          <span className="text-xs font-semibold" style={{ color: 'var(--admin-text-secondary)' }}>{orders.length} pedidos activos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" style={{ color: 'var(--admin-text-primary)' }}>
            <thead className="uppercase font-bold tracking-wider border-b" style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)', color: 'var(--admin-text-secondary)' }}>
              <tr>
                <th className="py-3.5 px-6">Pedido</th>
                <th className="py-3.5 px-6">Cliente</th>
                <th className="py-3.5 px-6">Taller / Proveedor</th>
                <th className="py-3.5 px-6">Estado / Soft Lock</th>
                <th className="py-3.5 px-6">Facturación</th>
                <th className="py-3.5 px-6 text-right">Total & Margen</th>
                <th className="py-3.5 px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y font-medium" style={{ borderColor: 'var(--admin-border-strong)' }}>
              {orders.map((order) => {
                const badgeInfo = stateBadges[order.state] || {
                  variant: 'default',
                  label: order.state,
                };
                return (
                  <tr
                    key={order.id}
                    className="transition-colors cursor-pointer"
                    style={{ backgroundColor: 'transparent' }}
                    onClick={() => handleOpenDetail(order)}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--admin-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td className="py-4 px-6 font-mono font-bold" style={{ color: 'var(--admin-text-primary)' }}>
                      {order.orderNumber}
                    </td>

                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <p className="font-semibold" style={{ color: 'var(--admin-text-primary)' }}>{order.customerName}</p>
                        <p className="text-[10px] font-mono" style={{ color: 'var(--admin-text-secondary)' }}>{order.customerPhone}</p>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <p className="truncate max-w-[180px]" style={{ color: 'var(--admin-text-secondary)' }}>{order.supplierName}</p>
                    </td>

                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <Badge variant={badgeInfo.variant} size="sm">
                          {badgeInfo.label}
                        </Badge>
                        {order.softLockExpiresAt && (
                          <div>
                            <SoftLockCountdown expiresAt={order.softLockExpiresAt} />
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded border"
                        style={{
                          backgroundColor: order.billingMode === 'delegada' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                          color: order.billingMode === 'delegada' ? '#a855f7' : '#3b82f6',
                          borderColor: order.billingMode === 'delegada' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                        }}
                      >
                        {order.billingMode === 'delegada' ? 'Delegada (RNC)' : 'Centralizada'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right font-mono">
                      <p className="font-bold text-sm" style={{ color: 'var(--admin-text-primary)' }}>
                        ${order.totalAmount.toLocaleString()}
                      </p>
                      {order.grossMarginAmount && (
                        <p className="text-[10px] text-emerald-500 font-semibold">
                          Margen: +${order.grossMarginAmount.toLocaleString()}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                      <Button variant="secondary" size="xs" onClick={() => handleOpenDetail(order)} style={{ backgroundColor: 'var(--admin-badge-bg)', color: 'var(--admin-text-primary)', border: '1px solid var(--admin-border)' }}>
                        Detalles
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalle de Orden y Transición de Estados */}
      {selectedOrder && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Expediente de Pedido: ${selectedOrder.orderNumber}`}
          description={`Cliente: ${selectedOrder.customerName} • Taller: ${selectedOrder.supplierName}`}
          maxWidth="2xl"
          footer={
            <Button variant="ghost" size="sm" onClick={() => setIsDetailOpen(false)}>
              Cerrar
            </Button>
          }
        >
          <div className="space-y-5">
            {/* Error banner */}
            {actionError && (
              <div className="p-3.5 rounded-xl border text-xs font-semibold flex items-start gap-2" style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', borderColor: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Artículos del pedido */}
            <div className="rounded-xl p-4 border space-y-3" style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)' }}>
              <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--admin-text-primary)' }}>
                Artículos del Pedido
              </span>
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-10 h-10 rounded-lg object-cover border"
                        style={{ backgroundColor: 'var(--admin-bg)', borderColor: 'var(--admin-border)' }}
                      />
                    )}
                    <div>
                      <p className="font-bold" style={{ color: 'var(--admin-text-primary)' }}>{item.productName}</p>
                      <p className="text-[11px] font-mono" style={{ color: 'var(--admin-text-secondary)' }}>
                        Cantidad: {item.quantity} x ${item.unitPriceFinal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-sm" style={{ color: 'var(--admin-text-primary)' }}>
                    ${item.subtotal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Configuración de Facturación y Depósito */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Modalidad de Facturación */}
              <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--admin-bg)', borderColor: 'var(--admin-border)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--admin-text-secondary)' }}>
                    <Building2 className="w-3.5 h-3.5 text-brand-500" /> Modalidad Facturación
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleToggleBilling('centralizada')}
                    className="flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all"
                    style={{
                      backgroundColor: selectedOrder.billingMode === 'centralizada' ? 'rgba(59, 130, 246, 0.1)' : 'var(--admin-card)',
                      color: selectedOrder.billingMode === 'centralizada' ? '#3b82f6' : 'var(--admin-text-secondary)',
                      borderColor: selectedOrder.billingMode === 'centralizada' ? 'rgba(59, 130, 246, 0.2)' : 'var(--admin-border)',
                    }}
                  >
                    Centralizada
                  </button>
                  <button
                    onClick={() => handleToggleBilling('delegada')}
                    className="flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all"
                    style={{
                      backgroundColor: selectedOrder.billingMode === 'delegada' ? 'rgba(168, 85, 247, 0.1)' : 'var(--admin-card)',
                      color: selectedOrder.billingMode === 'delegada' ? '#a855f7' : 'var(--admin-text-secondary)',
                      borderColor: selectedOrder.billingMode === 'delegada' ? 'rgba(168, 85, 247, 0.2)' : 'var(--admin-border)',
                    }}
                  >
                    Delegada (Taller)
                  </button>
                </div>

                <p className="text-[10px]" style={{ color: 'var(--admin-text-secondary)' }}>
                  {selectedOrder.billingMode === 'delegada'
                    ? 'Se liberan datos fiscales del cliente al taller (RF-25).'
                    : 'El taller solo recibe orden de despacho sin montos (RF-24).'}
                </p>
              </div>

              {/* Depósito de Seguridad (Cobro en Destino) */}
              <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--admin-bg)', borderColor: 'var(--admin-border)' }}>
                <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--admin-text-secondary)' }}>
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-500" /> Depósito en Puerta
                </span>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span style={{ color: 'var(--admin-text-secondary)' }}>Exigido:</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--admin-text-primary)' }}>
                    ${selectedOrder.depositAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--admin-text-secondary)' }}>Estado del Pago:</span>
                  {selectedOrder.depositPaid ? (
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Pagado ({selectedOrder.depositPaymentReference})
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="primary"
                        size="xs"
                        leftIcon={<Scan className="w-3 h-3" />}
                        onClick={() => setOcrTargetOrder(selectedOrder)}
                        style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
                      >
                        Validar con OCR (RF-29)
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botones de Transición de Estado */}
            <div className="rounded-xl p-4 border space-y-3" style={{ backgroundColor: 'var(--admin-bg)', borderColor: 'var(--admin-border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--admin-text-primary)' }}>
                  Acciones de Flujo de Pedido
                </span>
                <Button
                  variant="outline"
                  size="xs"
                  leftIcon={<Scan className="w-3.5 h-3.5 text-brand-500" />}
                  onClick={() => setOcrTargetOrder(selectedOrder)}
                  style={{ backgroundColor: 'var(--admin-badge-bg)', color: 'var(--admin-text-primary)', border: '1px solid var(--admin-border)' }}
                >
                  Escanear Comprobante OCR
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedOrder.state === 'validacion_inventario' && (
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={isProcessingAction}
                    onClick={() =>
                      handleTransitionState('pendiente_pago', 'Taller confirmó existencia de inventario físico.')
                    }
                    style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
                  >
                    Confirmar Stock y Pasar a Pago
                  </Button>
                )}

                {selectedOrder.state === 'pendiente_pago' && (
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={isProcessingAction}
                    onClick={() =>
                      handleTransitionState('orden_despacho', 'Pago / Depósito completado. Orden liberada a taller.')
                    }
                    style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
                  >
                    Generar Orden de Despacho (EARS-S-01)
                  </Button>
                )}

                {selectedOrder.state === 'orden_despacho' && (
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={isProcessingAction}
                    onClick={() =>
                      handleTransitionState('en_ruta', 'Mueble cargado en camión y en ruta hacia el cliente.')
                    }
                    style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
                  >
                    Marcar En Ruta
                  </Button>
                )}

                {selectedOrder.state === 'en_ruta' && (
                  <Button
                    variant="gold"
                    size="sm"
                    isLoading={isProcessingAction}
                    onClick={() =>
                      handleTransitionState(
                        'entregado_pendiente_conciliacion',
                        'Cliente recibió a conformidad. Saldo cobrado en puerta.',
                      )
                    }
                  >
                    Marcar Entregado (Cobro en Destino)
                  </Button>
                )}

                {selectedOrder.state === 'entregado_pendiente_conciliacion' && (
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={isProcessingAction}
                    onClick={() =>
                      handleTransitionState(
                        'conciliado',
                        'Conciliación financiera cerrada entre plataforma y taller.',
                      )
                    }
                    style={{ backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none' }}
                  >
                    Cerrar y Liquidar Conciliación
                  </Button>
                )}
              </div>
            </div>

            {/* Historial de Auditoría de Estados (EARS-U-03) */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--admin-text-secondary)' }}>
                Historial de Trazabilidad (Order State Logs)
              </span>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {selectedOrder.logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg text-xs border flex items-start justify-between gap-3"
                    style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)' }}
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold" style={{ color: 'var(--admin-text-primary)' }}>
                        Estado: <span className="text-brand-500 font-bold">{log.newState}</span> (vía{' '}
                        {log.triggeredBy})
                      </p>
                      {log.note && <p className="text-[11px]" style={{ color: 'var(--admin-text-secondary)' }}>{log.note}</p>}
                    </div>
                    <span className="text-[10px] font-mono flex-shrink-0" style={{ color: 'var(--admin-text-secondary)' }}>
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Validación OCR de Comprobantes (EARS-O-02 / RF-29) */}
      <ReceiptOcrModal
        isOpen={Boolean(ocrTargetOrder)}
        onClose={() => setOcrTargetOrder(null)}
        order={ocrTargetOrder}
        onReceiptApproved={handleReceiptApproved}
      />
    </div>
  );
};
