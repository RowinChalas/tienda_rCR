import { ICrmRepository, ISupplierRepository, IPricingRepository } from '../interfaces/IRepositories';
import { CrmConversation, CrmMessage } from '../../domain/models/CrmConversation';
import { Supplier } from '../../domain/models/Product';
import { PricingRule } from '../../domain/models/PricingRule';
import { INITIAL_CONVERSATIONS, INITIAL_MESSAGES, INITIAL_SUPPLIERS, INITIAL_PRICING_RULES } from './initialData';

const CRM_CONV_KEY = 'barversuit_crm_convs_v1';
const CRM_MSG_KEY = 'barversuit_crm_msgs_v1';
const SUPPLIERS_KEY = 'barversuit_suppliers_v1';
const PRICING_KEY = 'barversuit_pricing_rules_v1';

export class MockCrmRepository implements ICrmRepository {
  private getStoredConvs(): CrmConversation[] {
    const raw = localStorage.getItem(CRM_CONV_KEY);
    if (!raw) {
      localStorage.setItem(CRM_CONV_KEY, JSON.stringify(INITIAL_CONVERSATIONS));
      return INITIAL_CONVERSATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CONVERSATIONS;
    }
  }

  private getStoredMsgs(): Record<string, CrmMessage[]> {
    const raw = localStorage.getItem(CRM_MSG_KEY);
    if (!raw) {
      localStorage.setItem(CRM_MSG_KEY, JSON.stringify(INITIAL_MESSAGES));
      return INITIAL_MESSAGES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_MESSAGES;
    }
  }

  private saveConvs(convs: CrmConversation[]): void {
    localStorage.setItem(CRM_CONV_KEY, JSON.stringify(convs));
    window.dispatchEvent(new CustomEvent('barversuit_crm_changed'));
  }

  private saveMsgs(msgs: Record<string, CrmMessage[]>): void {
    localStorage.setItem(CRM_MSG_KEY, JSON.stringify(msgs));
    window.dispatchEvent(new CustomEvent('barversuit_crm_changed'));
  }

  public async getConversations(filters?: { channel?: string; handoffStatus?: string }): Promise<CrmConversation[]> {
    let list = this.getStoredConvs();
    if (!filters) return list;
    if (filters.channel) {
      list = list.filter((c) => c.channel === filters.channel);
    }
    if (filters.handoffStatus) {
      list = list.filter((c) => c.handoffStatus === filters.handoffStatus);
    }
    return list;
  }

  public async getConversationById(id: string): Promise<CrmConversation | null> {
    const list = this.getStoredConvs();
    return list.find((c) => c.id === id) || null;
  }

  public async getMessages(conversationId: string): Promise<CrmMessage[]> {
    const allMsgs = this.getStoredMsgs();
    return allMsgs[conversationId] || [];
  }

  public async sendMessage(
    conversationId: string,
    message: Omit<CrmMessage, 'id' | 'createdAt'>,
  ): Promise<CrmMessage> {
    const allMsgs = this.getStoredMsgs();
    const convMsgs = allMsgs[conversationId] || [];

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newMsg: CrmMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: timeStr,
    };

    convMsgs.push(newMsg);
    allMsgs[conversationId] = convMsgs;
    this.saveMsgs(allMsgs);

    // Actualizar snippet de la conversación
    const convs = this.getStoredConvs();
    const convIndex = convs.findIndex((c) => c.id === conversationId);
    if (convIndex !== -1) {
      convs[convIndex] = {
        ...convs[convIndex],
        lastMessageSnippet: message.content,
        lastMessageAt: 'Justo ahora',
      };
      this.saveConvs(convs);
    }

    return newMsg;
  }

  public async triggerHandoff(conversationId: string, reason: string): Promise<CrmConversation> {
    const convs = this.getStoredConvs();
    const convIndex = convs.findIndex((c) => c.id === conversationId);
    if (convIndex === -1) throw new Error(`Conversación ${conversationId} no encontrada.`);

    const updated: CrmConversation = {
      ...convs[convIndex],
      isAiActive: false,
      handoffStatus: 'requiere_humano',
      handoffReason: 'precio_suelo',
      assignedAgentName: 'Admin Principal',
    };
    convs[convIndex] = updated;
    this.saveConvs(convs);

    // Inyectar mensaje de sistema en el hilo
    await this.sendMessage(conversationId, {
      conversationId,
      sender: 'sistema',
      senderName: 'Sistema de Handoff',
      content: `⚠️ Alerta de Seguridad: ${reason}. Conversación transferida a operador humano.`,
    });

    return updated;
  }

  public async toggleAi(conversationId: string, isActive: boolean): Promise<CrmConversation> {
    const convs = this.getStoredConvs();
    const convIndex = convs.findIndex((c) => c.id === conversationId);
    if (convIndex === -1) throw new Error(`Conversación ${conversationId} no encontrada.`);

    const updated: CrmConversation = {
      ...convs[convIndex],
      isAiActive: isActive,
      handoffStatus: isActive ? 'automatizado' : 'atendido_humano',
    };
    convs[convIndex] = updated;
    this.saveConvs(convs);
    return updated;
  }
}

export class MockSupplierRepository implements ISupplierRepository {
  private getStored(): Supplier[] {
    const raw = localStorage.getItem(SUPPLIERS_KEY);
    if (!raw) {
      localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(INITIAL_SUPPLIERS));
      return INITIAL_SUPPLIERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SUPPLIERS;
    }
  }

  private save(list: Supplier[]): void {
    localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(list));
  }

  public async getAll(): Promise<Supplier[]> {
    return this.getStored();
  }

  public async getById(id: string): Promise<Supplier | null> {
    return this.getStored().find((s) => s.id === id) || null;
  }

  public async create(supplierData: Omit<Supplier, 'id' | 'createdAt'>): Promise<Supplier> {
    const list = this.getStored();
    const newSup: Supplier = {
      ...supplierData,
      id: `sup_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.push(newSup);
    this.save(list);
    return newSup;
  }

  public async update(id: string, updates: Partial<Supplier>): Promise<Supplier> {
    const list = this.getStored();
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) throw new Error(`Proveedor ${id} no encontrado.`);
    const updated = { ...list[index], ...updates };
    list[index] = updated;
    this.save(list);
    return updated;
  }
}

export class MockPricingRepository implements IPricingRepository {
  private getStored(): PricingRule[] {
    const raw = localStorage.getItem(PRICING_KEY);
    if (!raw) {
      localStorage.setItem(PRICING_KEY, JSON.stringify(INITIAL_PRICING_RULES));
      return INITIAL_PRICING_RULES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PRICING_RULES;
    }
  }

  private save(list: PricingRule[]): void {
    localStorage.setItem(PRICING_KEY, JSON.stringify(list));
  }

  public async getRules(): Promise<PricingRule[]> {
    return this.getStored();
  }

  public async getRuleById(id: string): Promise<PricingRule | null> {
    return this.getStored().find((r) => r.id === id) || null;
  }

  public async saveRule(ruleData: Omit<PricingRule, 'id' | 'createdAt'>): Promise<PricingRule> {
    const list = this.getStored();
    const newRule: PricingRule = {
      ...ruleData,
      id: `rule_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.push(newRule);
    this.save(list);
    return newRule;
  }

  public async deleteRule(id: string): Promise<boolean> {
    const list = this.getStored();
    this.save(list.filter((r) => r.id !== id));
    return true;
  }
}
