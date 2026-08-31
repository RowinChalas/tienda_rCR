import { IOrderRepository } from '../interfaces/IRepositories';
import { Order, OrderState, TriggeredByActor } from '../../domain/models/Order';
import { INITIAL_ORDERS } from './initialData';
import { OrderStateMachine } from '../../domain/orders/OrderStateMachine';

const STORAGE_KEY = 'barversuit_orders_v1';

export class MockOrderRepository implements IOrderRepository {
  private getStoredOrders(): Order[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ORDERS;
    }
  }

  private save(orders: Order[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('barversuit_orders_changed'));
  }

  public async getAll(filters?: { supplierId?: string; state?: OrderState; customerId?: string }): Promise<Order[]> {
    let list = this.getStoredOrders();
    if (!filters) return list;

    if (filters.supplierId) {
      list = list.filter((o) => o.supplierId === filters.supplierId);
    }
    if (filters.state) {
      list = list.filter((o) => o.state === filters.state);
    }
    if (filters.customerId) {
      list = list.filter((o) => o.customerId === filters.customerId);
    }
    return list;
  }

  public async getById(id: string): Promise<Order | null> {
    const list = this.getStoredOrders();
    return list.find((o) => o.id === id) || null;
  }

  public async create(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'logs'>): Promise<Order> {
    const list = this.getStoredOrders();
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...orderData,
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      logs: [
        {
          id: `log_init_${Date.now()}`,
          orderId: '',
          previousState: null,
          newState: orderData.state,
          triggeredBy: 'sistema',
          note: 'Orden inicializada en el sistema.',
          createdAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    newOrder.logs[0].orderId = newOrder.id;

    list.unshift(newOrder);
    this.save(list);
    return newOrder;
  }

  public async updateState(
    id: string,
    newState: OrderState,
    actor: TriggeredByActor,
    note?: string,
  ): Promise<Order> {
    const list = this.getStoredOrders();
    const index = list.findIndex((o) => o.id === id);
    if (index === -1) throw new Error(`Orden con ID ${id} no encontrada.`);

    const currentOrder = list[index];
    const transitioned = OrderStateMachine.transition(currentOrder, newState, actor, note);
    list[index] = transitioned;
    this.save(list);
    return transitioned;
  }

  public async recordDepositPayment(id: string, reference: string): Promise<Order> {
    const list = this.getStoredOrders();
    const index = list.findIndex((o) => o.id === id);
    if (index === -1) throw new Error(`Orden con ID ${id} no encontrada.`);

    const order = list[index];
    const updated: Order = {
      ...order,
      depositPaid: true,
      depositPaymentReference: reference,
      logs: [
        {
          id: `log_dep_${Date.now()}`,
          orderId: order.id,
          previousState: order.state,
          newState: order.state,
          triggeredBy: 'sistema',
          note: `Depósito de seguridad de $${order.depositAmount.toLocaleString()} verificado. Ref: ${reference}`,
          createdAt: new Date().toISOString(),
        },
        ...order.logs,
      ],
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    this.save(list);
    return updated;
  }

  public async toggleBillingMode(id: string, mode: 'centralizada' | 'delegada'): Promise<Order> {
    const list = this.getStoredOrders();
    const index = list.findIndex((o) => o.id === id);
    if (index === -1) throw new Error(`Orden con ID ${id} no encontrada.`);

    const updated: Order = {
      ...list[index],
      billingMode: mode,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    this.save(list);
    return updated;
  }
}
