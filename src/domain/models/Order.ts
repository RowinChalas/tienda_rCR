/**
 * Modelos de Dominio — Órdenes y Trazabilidad de Estados
 * Conforme al Modelo de Datos del Diseño Técnico (§2.1) y EARS
 */

export type OrderState =
  | 'consulta'
  | 'intencion_compra'
  | 'validacion_inventario'
  | 'pendiente_pago'
  | 'orden_despacho'
  | 'en_ruta'
  | 'entregado_pendiente_conciliacion'
  | 'conciliado'
  | 'cancelado_agotado';

export type BillingMode = 'centralizada' | 'delegada';
export type DeliveryMode = 'contacto_directo' | 'cobro_destino';
export type TriggeredByActor = 'sistema' | 'ia' | 'admin' | 'proveedor';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitCostBase?: number; // Oculto a proveedores en facturación centralizada
  unitPriceFinal: number;
  subtotal: number;
}

export interface OrderStateLog {
  id: string;
  orderId: string;
  previousState: OrderState | null;
  newState: OrderState;
  triggeredBy: TriggeredByActor;
  note?: string;
  createdAt: string;
}

export interface CustomerFiscalData {
  rncOrCedula: string;
  businessName: string;
  fiscalAddress: string;
}

export interface Order {
  id: string;
  orderNumber: string; // ej: ORD-2026-0891
  customerId: string;
  customerName: string;
  customerPhone: string;
  supplierId: string;
  supplierName: string;
  state: OrderState;
  billingMode: BillingMode;
  deliveryMode: DeliveryMode;
  depositRequired: boolean;
  depositAmount: number;
  depositPaid: boolean;
  depositPaymentReference?: string;
  totalAmount: number;
  totalCostBase?: number; // Solo Admin
  grossMarginAmount?: number; // Solo Admin
  softLockExpiresAt?: string | null;
  items: OrderItem[];
  logs: OrderStateLog[];
  customerFiscalData?: CustomerFiscalData;
  deliveryAddress: string;
  createdAt: string;
  updatedAt: string;
}
