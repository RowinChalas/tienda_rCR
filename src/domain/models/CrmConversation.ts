/**
 * Modelos de Dominio — CRM Omnicanal y Clientes
 */

export type ChannelOrigin = 'whatsapp' | 'instagram' | 'messenger';
export type MessageSender = 'cliente' | 'ia' | 'agente_humano' | 'sistema';
export type HandoffReason = 'precio_suelo' | 'duda_compleja' | 'solicitud_humano' | 'reclamo_garantia';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  channelOrigin: ChannelOrigin;
  ltv: number;
  totalOrdersCount: number;
  tags: string[];
  createdAt: string;
}

export interface CrmMessage {
  id: string;
  conversationId: string;
  sender: MessageSender;
  senderName: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'document';
  extractedData?: {
    intent?: string;
    productInquiryId?: string;
    quotedPrice?: number;
    ocrReference?: string;
  };
  createdAt: string;
}

export interface CrmConversation {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAvatar?: string;
  channel: ChannelOrigin;
  lastMessageSnippet: string;
  lastMessageAt: string;
  unreadCount: number;
  isAiActive: boolean;
  handoffStatus: 'automatizado' | 'requiere_humano' | 'atendido_humano';
  handoffReason?: HandoffReason;
  assignedAgentName?: string;
  activeOrderId?: string;
  tags: string[];
}
