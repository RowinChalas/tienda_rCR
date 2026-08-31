import { Order, OrderState, TriggeredByActor, OrderStateLog } from '../models/Order';

/**
 * Máquina de Estados de Órdenes (Épica D & E / EARS-E-01 / EARS-S-01)
 * Reglas de transición deterministas y control de Soft Locks.
 */
export class OrderStateMachine {
  // Matriz de transiciones permitidas
  private static readonly ALLOWED_TRANSITIONS: Record<OrderState, OrderState[]> = {
    consulta: ['intencion_compra', 'cancelado_agotado'],
    intencion_compra: ['validacion_inventario', 'pendiente_pago', 'cancelado_agotado'],
    validacion_inventario: ['pendiente_pago', 'cancelado_agotado'],
    pendiente_pago: ['orden_despacho', 'cancelado_agotado'],
    orden_despacho: ['en_ruta', 'cancelado_agotado'],
    en_ruta: ['entregado_pendiente_conciliacion', 'cancelado_agotado'],
    entregado_pendiente_conciliacion: ['conciliado'],
    conciliado: [], // Estado final
    cancelado_agotado: [], // Estado final
  };

  /**
   * Verifica si una transición es válida en el grafo de estados.
   */
  public static canTransition(from: OrderState, to: OrderState): boolean {
    const allowed = this.ALLOWED_TRANSITIONS[from];
    return allowed ? allowed.includes(to) : false;
  }

  /**
   * Ejecuta una transición de estado inmutable, registrando la auditoría.
   */
  public static transition(
    order: Order,
    newState: OrderState,
    triggeredBy: TriggeredByActor,
    note?: string,
    softLockDurationMinutes: number = 20
  ): Order {
    if (!this.canTransition(order.state, newState)) {
      throw new Error(
        `Transición de estado inválida: no se puede pasar de '${order.state}' a '${newState}'.`
      );
    }

    // Regla EARS-S-01: Si es cobro en destino y pasa a orden_despacho, debe tener depósito pagado
    if (
      newState === 'orden_despacho' &&
      order.deliveryMode === 'cobro_destino' &&
      order.depositRequired &&
      !order.depositPaid
    ) {
      throw new Error(
        'EARS-S-01 Violada: No se puede generar la Orden de Despacho en modalidad Cobro en Destino sin el pago previo del depósito de seguridad.'
      );
    }

    const now = new Date();
    const newLog: OrderStateLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      orderId: order.id,
      previousState: order.state,
      newState,
      triggeredBy,
      note,
      createdAt: now.toISOString(),
    };

    // Manejo de Soft Lock al entrar a validacion_inventario o intencion_compra
    let softLockExpiresAt = order.softLockExpiresAt;
    if (newState === 'validacion_inventario' || newState === 'intencion_compra') {
      const expirationDate = new Date(now.getTime() + softLockDurationMinutes * 60 * 1000);
      softLockExpiresAt = expirationDate.toISOString();
    } else if (newState === 'pendiente_pago' || newState === 'orden_despacho' || newState === 'cancelado_agotado') {
      // Liberar o consumar el Soft Lock
      softLockExpiresAt = null;
    }

    return {
      ...order,
      state: newState,
      softLockExpiresAt,
      logs: [newLog, ...order.logs],
      updatedAt: now.toISOString(),
    };
  }

  /**
   * Comprueba si el Soft Lock de la orden sigue activo en el tiempo.
   */
  public static isSoftLockActive(order: Order, currentTime: Date = new Date()): boolean {
    if (!order.softLockExpiresAt) return false;
    const expires = new Date(order.softLockExpiresAt).getTime();
    return expires > currentTime.getTime();
  }

  /**
   * Calcula los segundos restantes del Soft Lock.
   */
  public static getRemainingSoftLockSeconds(order: Order, currentTime: Date = new Date()): number {
    if (!order.softLockExpiresAt) return 0;
    const diff = new Date(order.softLockExpiresAt).getTime() - currentTime.getTime();
    return Math.max(0, Math.floor(diff / 1000));
  }
}
