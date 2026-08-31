import { describe, it, expect } from 'vitest';
import { OrderStateMachine } from '../../domain/orders/OrderStateMachine';
import { Order } from '../../domain/models/Order';

describe('OrderStateMachine — Ciclo de Vida y Reglas EARS', () => {
  const createMockOrder = (overrides: Partial<Order> = {}): Order => ({
    id: 'ord_123',
    orderNumber: 'ORD-2026-001',
    customerId: 'cust_01',
    customerName: 'Elena Rostova',
    customerPhone: '+18095551234',
    supplierId: 'sup_01',
    supplierName: 'Muebles Finos del Este',
    state: 'consulta',
    billingMode: 'centralizada',
    deliveryMode: 'contacto_directo',
    depositRequired: false,
    depositAmount: 0,
    depositPaid: false,
    totalAmount: 25000,
    softLockExpiresAt: null,
    items: [],
    logs: [],
    deliveryAddress: 'Av. Winston Churchill #45, Santo Domingo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  it('debería_activar_soft_lock_al_transicionar_a_validacion_inventario_EARS_E_01', () => {
    // Arrange
    const order = createMockOrder({ state: 'intencion_compra' });

    // Act
    const updated = OrderStateMachine.transition(order, 'validacion_inventario', 'ia', 'Cliente solicitó apartar mueble');

    // Assert
    expect(updated.state).toBe('validacion_inventario');
    expect(updated.softLockExpiresAt).toBeDefined();
    expect(OrderStateMachine.isSoftLockActive(updated)).toBe(true);
    expect(OrderStateMachine.getRemainingSoftLockSeconds(updated)).toBeGreaterThan(0);
    expect(updated.logs.length).toBe(1);
    expect(updated.logs[0].newState).toBe('validacion_inventario');
  });

  it('debería_bloquear_orden_de_despacho_en_cobro_destino_si_no_se_ha_pagado_el_depósito_EARS_S_01', () => {
    // Arrange
    const order = createMockOrder({
      state: 'pendiente_pago',
      deliveryMode: 'cobro_destino',
      depositRequired: true,
      depositPaid: false, // Depósito aún no pagado
    });

    // Act & Assert
    expect(() => {
      OrderStateMachine.transition(order, 'orden_despacho', 'admin', 'Intento de despacho sin depósito');
    }).toThrowError(/EARS-S-01 Violada/);
  });

  it('debería_permitir_orden_de_despacho_en_cobro_destino_cuando_el_depósito_está_pagado', () => {
    // Arrange
    const order = createMockOrder({
      state: 'pendiente_pago',
      deliveryMode: 'cobro_destino',
      depositRequired: true,
      depositPaid: true, // Depósito pagado
    });

    // Act
    const updated = OrderStateMachine.transition(order, 'orden_despacho', 'admin', 'Depósito verificado');

    // Assert
    expect(updated.state).toBe('orden_despacho');
    expect(updated.softLockExpiresAt).toBeNull(); // El soft lock se consume
  });

  it('debería_rechazar_transición_inválida_en_el_grafo_de_estados', () => {
    // Arrange
    const order = createMockOrder({ state: 'consulta' });

    // Act & Assert (de 'consulta' directo a 'orden_despacho' no está permitido)
    expect(() => {
      OrderStateMachine.transition(order, 'orden_despacho', 'admin');
    }).toThrowError(/Transición de estado inválida/);
  });
});
