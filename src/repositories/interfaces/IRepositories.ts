import { Supplier } from '../../domain/models/Product';
import { Order, OrderState, TriggeredByActor } from '../../domain/models/Order';
import { CrmConversation, CrmMessage } from '../../domain/models/CrmConversation';
import { PricingRule } from '../../domain/models/PricingRule';
import { PlatformSettings } from '../../domain/models/PlatformSettings';
import { CmsState, HeroSlideCms, NavMenuItem, SpaceScene, VisualCollection } from '../../domain/models/CmsContent';

export interface ISupplierRepository {
  getAll(): Promise<Supplier[]>;
  getById(id: string): Promise<Supplier | null>;
  create(supplier: Omit<Supplier, 'id' | 'createdAt'>): Promise<Supplier>;
  update(id: string, updates: Partial<Supplier>): Promise<Supplier>;
}

export interface IOrderRepository {
  getAll(filters?: { supplierId?: string; state?: OrderState; customerId?: string }): Promise<Order[]>;
  getById(id: string): Promise<Order | null>;
  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'logs'>): Promise<Order>;
  updateState(id: string, newState: OrderState, actor: TriggeredByActor, note?: string): Promise<Order>;
  recordDepositPayment(id: string, reference: string): Promise<Order>;
  toggleBillingMode(id: string, mode: 'centralizada' | 'delegada'): Promise<Order>;
}

export interface ICrmRepository {
  getConversations(filters?: { channel?: string; handoffStatus?: string }): Promise<CrmConversation[]>;
  getConversationById(id: string): Promise<CrmConversation | null>;
  getMessages(conversationId: string): Promise<CrmMessage[]>;
  sendMessage(conversationId: string, message: Omit<CrmMessage, 'id' | 'createdAt'>): Promise<CrmMessage>;
  triggerHandoff(conversationId: string, reason: string): Promise<CrmConversation>;
  toggleAi(conversationId: string, isActive: boolean): Promise<CrmConversation>;
}

export interface IPricingRepository {
  getRules(): Promise<PricingRule[]>;
  getRuleById(id: string): Promise<PricingRule | null>;
  saveRule(rule: Omit<PricingRule, 'id' | 'createdAt'>): Promise<PricingRule>;
  deleteRule(id: string): Promise<boolean>;
}

export interface ISettingsRepository {
  get(): Promise<PlatformSettings>;
  update(settings: Partial<PlatformSettings>): Promise<PlatformSettings>;
}

export interface ICmsRepository {
  getState(): Promise<CmsState>;
  updateState(updates: Partial<CmsState>): Promise<CmsState>;
  saveHeroSlide(slide: HeroSlideCms): Promise<HeroSlideCms>;
  deleteHeroSlide(id: string): Promise<boolean>;
  saveScene(scene: SpaceScene): Promise<SpaceScene>;
  deleteScene(id: string): Promise<boolean>;
  saveNavMenu(item: NavMenuItem): Promise<NavMenuItem>;
  deleteNavMenu(id: string): Promise<boolean>;
  saveCollection(collection: VisualCollection): Promise<VisualCollection>;
}
